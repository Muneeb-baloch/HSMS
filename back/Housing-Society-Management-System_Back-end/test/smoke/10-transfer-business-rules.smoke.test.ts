import { getBaseFixtures, getClient, makeTracker, uniq } from './helpers';

async function createCategory(api: any, kind: string) {
  const res = await api.post('/installmentcategory', {
    instCatName: uniq(`Xfer Rules InstCat ${kind} `),
    kind,
    isRefundable: false,
    isMandatory: true,
    sequenceOrder: Math.floor(Math.random() * 100000) + 150000,
    isActive: true,
  });
  if (res.status !== 201) {
    throw new Error(`Failed to create installment category: ${res.status} ${JSON.stringify(res.data)}`);
  }
  return res.data.data._id as string;
}

async function createTransferType(api: any, tracker: any, transferFee: number) {
  const res = await api.post('/transfertype', {
    typeName: uniq('Smoke Sale Type '),
    description: 'Smoke test transfer type',
    transferFee,
    isActive: true,
  });
  if (res.status !== 201) {
    throw new Error(`Failed to create transfer type: ${res.status} ${JSON.stringify(res.data)}`);
  }
  tracker.track('transfertype', res.data.data._id);
  return res.data.data as { _id: string; transferFee: number };
}

// Books a file whose single installment row is due `bookingOffsetDays` days
// before today (negative -> in the future/today, positive -> overdue), on a
// plot owned by `memId`. Mirrors the pattern used by 05-defaulter and
// 09-payment-receipts.
async function bookFile(
  api: any,
  fx: any,
  tracker: any,
  opts: { memId: string; contractPrice: number; bookingOffsetDays?: number }
) {
  const sizeRes = await api.post('/plotsizes', {
    plotSizeName: uniq('Xfer Rules Size '),
    projectId: fx.projectId,
    sizeLength: 25,
    sizeWidth: 45,
    totalArea: 5,
    areaUnit: 'marla',
    ratePerUnit: 500,
  });
  expect(sizeRes.status).toBe(201);
  tracker.track('plotsizes', sizeRes.data.data._id);

  const plotRes = await api.post('/plots', {
    projectId: fx.projectId,
    societyId: fx.societyId,
    plotNo: uniq('TR-').slice(0, 20),
    plotBlockId: fx.blockId,
    plotSizeId: sizeRes.data.data._id,
    plotType: 'residential',
    plotCategoryId: fx.plotCategoryStandardId,
    salesStatusId: fx.salesStatusAvailableId,
    plotLength: 30,
    plotWidth: 40,
    plotBasePrice: opts.contractPrice,
  });
  expect(plotRes.status).toBe(201);
  tracker.track('plots', plotRes.data.data._id);
  const plotId = plotRes.data.data._id as string;

  const catId = await createCategory(api, 'installment');

  const planRes = await api.post('/installment-plans', {
    projId: fx.projectId,
    planName: uniq('Xfer Rules Plan '),
    totalMonths: 1,
    totalAmount: opts.contractPrice,
    isActive: true,
  });
  expect(planRes.status).toBe(201);
  tracker.track('installment-plans', planRes.data.data._id);

  await api.post('/installment-plan-details', {
    planId: planRes.data.data._id,
    instCatId: catId,
    occurrence: 1,
    percentageAmount: 100,
  });

  const bookingDate = new Date();
  if (opts.bookingOffsetDays) {
    bookingDate.setDate(bookingDate.getDate() - opts.bookingOffsetDays);
  }

  const fileRes = await api.post('/file', {
    planId: planRes.data.data._id,
    memId: opts.memId,
    societyId: fx.societyId,
    plotId,
    paymentMode: 'Cash',
    bookingDate: bookingDate.toISOString(),
  });
  expect(fileRes.status).toBe(201);
  tracker.track('file', fileRes.data.data._id);

  return { fileId: fileRes.data.data._id as string, plotId };
}

function uniqCnic(): string {
  const digits = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-13).padStart(13, '0');
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

// A small, explicit share percentage - fx.memberId/memberId2 are shared
// fixtures reused across every test in this file, and nominee shares aren't
// cleaned up between tests (only in afterAll), so each nominee must leave
// room for the next one on the same member instead of claiming the full 100%.
async function createNominee(api: any, tracker: any, memId: string) {
  const res = await api.post('/nominee', {
    memId,
    nomineeName: uniq('Xfer Rules Nominee '),
    nomineeCNIC: uniqCnic(),
    relationWithMember: 'Son',
    nomineeContact: '03001234567',
    nomineeSharePercentage: 1,
  });
  expect(res.status).toBe(201);
  const nomineeId = res.data.data._id ?? res.data.data.id;
  tracker.track('nominee', nomineeId);
  return nomineeId as string;
}

async function approveAndExecuteTransfer(api: any, transferId: string, transferFee: number) {
  await api.put(`/transfer/${transferId}`, { status: 'Approved' });
  await api.post(`/transfer/${transferId}/pay-fee`, {
    amount: transferFee,
    paymentDate: new Date().toISOString(),
    paymentMethod: 'Cash',
  });
  return api.post(`/transfer/${transferId}/execute`, {
    executionDate: new Date().toISOString(),
    witness1Name: 'Witness One',
    witness1CNIC: '12345-1234567-1',
    officerName: 'Officer One',
    officerDesignation: 'Transfer Officer',
  });
}

async function payOffFileInFull(api: any, fileId: string, contractPrice: number) {
  const listRes = await api.get(`/installment/file/${fileId}`);
  const installment = listRes.data.data[0];
  const installmentId = installment.id ?? installment._id;

  const payRes = await api.post(`/installment/${installmentId}/payment`, {
    amountPaid: contractPrice,
    paidDate: new Date().toISOString(),
    paymentMode: 'Cash',
    transactionRefNo: uniq('TXN-FULL-'),
  });
  expect(payRes.status).toBe(200);
}

async function markPlotPossessionReady(api: any, fileId: string, plotId: string) {
  const assignRes = await api.post(`/file/${fileId}/assign-plot`, { plotId });
  expect(assignRes.status).toBe(200);

  const readyRes = await api.post(`/plots/${plotId}/possession-ready`, {});
  expect(readyRes.status).toBe(200);
}

describe('Transfer business rules', () => {
  const tracker = makeTracker();

  afterAll(async () => {
    await tracker.cleanupAll();
  });

  test('blocks creating a transfer when the file has overdue dues (NDC check)', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const { fileId } = await bookFile(api, fx, tracker, {
      memId: fx.memberId,
      contractPrice: 200000,
      bookingOffsetDays: 45,
    });
    const transferType = await createTransferType(api, tracker, 5000);

    const res = await api.post('/transfer', {
      fileId,
      transferTypeId: transferType._id,
      sellerMemId: fx.memberId,
      buyerMemId: fx.memberId2,
      transferInitDate: new Date().toISOString(),
    });

    expect(res.status).toBe(400);
    expect(res.data.error).toMatch(/overdue/i);
  });

  test('blocks creating a transfer when the buyer is the same member as the seller', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const { fileId } = await bookFile(api, fx, tracker, {
      memId: fx.memberId,
      contractPrice: 150000,
    });
    const transferType = await createTransferType(api, tracker, 3000);

    const res = await api.post('/transfer', {
      fileId,
      transferTypeId: transferType._id,
      sellerMemId: fx.memberId,
      buyerMemId: fx.memberId,
      transferInitDate: new Date().toISOString(),
    });

    expect(res.status).toBe(400);
    expect(res.data.error).toMatch(/different member/i);
  });

  test('blocks creating a transfer when the file status is Suspended', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const { fileId } = await bookFile(api, fx, tracker, {
      memId: fx.memberId,
      contractPrice: 150000,
    });
    const transferType = await createTransferType(api, tracker, 3000);

    const suspendRes = await api.put(`/file/${fileId}`, { status: 'Suspended' });
    expect(suspendRes.status).toBe(200);

    const res = await api.post('/transfer', {
      fileId,
      transferTypeId: transferType._id,
      sellerMemId: fx.memberId,
      buyerMemId: fx.memberId2,
      transferInitDate: new Date().toISOString(),
    });

    expect(res.status).toBe(400);
    expect(res.data.error).toMatch(/blocked/i);
  });

  test('blocks execution when the transfer fee has not been paid', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const { fileId } = await bookFile(api, fx, tracker, {
      memId: fx.memberId,
      contractPrice: 150000,
    });
    const transferType = await createTransferType(api, tracker, 3000);

    const createRes = await api.post('/transfer', {
      fileId,
      transferTypeId: transferType._id,
      sellerMemId: fx.memberId,
      buyerMemId: fx.memberId2,
      transferInitDate: new Date().toISOString(),
      transfIsAtt: true,
    });
    expect(createRes.status).toBe(201);
    const transferId = createRes.data.data._id ?? createRes.data.data.id;
    tracker.track('transfer', transferId);

    const approveRes = await api.put(`/transfer/${transferId}`, { status: 'Approved' });
    expect(approveRes.status).toBe(200);

    const execRes = await api.post(`/transfer/${transferId}/execute`, {
      executionDate: new Date().toISOString(),
      witness1Name: 'Witness One',
      witness1CNIC: '12345-1234567-1',
      officerName: 'Officer One',
      officerDesignation: 'Transfer Officer',
    });

    expect(execRes.status).toBeGreaterThanOrEqual(400);
    expect(execRes.data.error).toMatch(/fee/i);
  });

  test('recording the transfer fee creates a real Payment receipt for the chosen payer', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const { fileId } = await bookFile(api, fx, tracker, {
      memId: fx.memberId,
      contractPrice: 150000,
    });
    const transferType = await createTransferType(api, tracker, 7500);

    const createRes = await api.post('/transfer', {
      fileId,
      transferTypeId: transferType._id,
      sellerMemId: fx.memberId,
      buyerMemId: fx.memberId2,
      transferInitDate: new Date().toISOString(),
    });
    expect(createRes.status).toBe(201);
    const transferId = createRes.data.data._id ?? createRes.data.data.id;
    tracker.track('transfer', transferId);

    // Fee amount comes from the transfer type, never hardcoded in the test.
    const feeAmount = createRes.data.data.transferFeeAmount ?? transferType.transferFee;
    expect(feeAmount).toBe(transferType.transferFee);

    const payRes = await api.post(`/transfer/${transferId}/pay-fee`, {
      amount: feeAmount,
      paymentDate: new Date().toISOString(),
      paymentMethod: 'Cash',
      payer: 'seller',
    });
    expect(payRes.status).toBe(200);
    expect(payRes.data.data.transferFeePaid).toBe(true);

    const receiptsRes = await api.get(`/payment/by-target/transfer/${transferId}`);
    expect(receiptsRes.status).toBe(200);
    expect(receiptsRes.data.data).toHaveLength(1);
    const receipt = receiptsRes.data.data[0];
    expect(receipt.amount).toBe(feeAmount);
    expect(String(receipt.paidByMemId?._id ?? receipt.paidByMemId)).toBe(fx.memberId);
    expect(receipt.targetType).toBe('transfer');
  });

  test('re-checks file status at execution time, after it was clear at creation', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const { fileId } = await bookFile(api, fx, tracker, {
      memId: fx.memberId,
      contractPrice: 150000,
    });
    const transferType = await createTransferType(api, tracker, 4000);

    const createRes = await api.post('/transfer', {
      fileId,
      transferTypeId: transferType._id,
      sellerMemId: fx.memberId,
      buyerMemId: fx.memberId2,
      transferInitDate: new Date().toISOString(),
      transfIsAtt: true,
    });
    expect(createRes.status).toBe(201);
    const transferId = createRes.data.data._id ?? createRes.data.data.id;
    tracker.track('transfer', transferId);

    await api.put(`/transfer/${transferId}`, { status: 'Approved' });
    await api.post(`/transfer/${transferId}/pay-fee`, {
      amount: transferType.transferFee,
      paymentDate: new Date().toISOString(),
      paymentMethod: 'Cash',
    });

    // File becomes ineligible AFTER the transfer was created and approved.
    const suspendRes = await api.put(`/file/${fileId}`, { status: 'Suspended' });
    expect(suspendRes.status).toBe(200);

    const execRes = await api.post(`/transfer/${transferId}/execute`, {
      executionDate: new Date().toISOString(),
      witness1Name: 'Witness One',
      witness1CNIC: '12345-1234567-1',
      officerName: 'Officer One',
      officerDesignation: 'Transfer Officer',
    });

    expect(execRes.status).toBe(400);
    expect(execRes.data.error).toMatch(/blocked/i);
  });

  test('a direct status update to Completed is rejected - must go through execute', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const { fileId } = await bookFile(api, fx, tracker, {
      memId: fx.memberId,
      contractPrice: 150000,
    });
    const transferType = await createTransferType(api, tracker, 2000);

    const createRes = await api.post('/transfer', {
      fileId,
      transferTypeId: transferType._id,
      sellerMemId: fx.memberId,
      buyerMemId: fx.memberId2,
      transferInitDate: new Date().toISOString(),
    });
    expect(createRes.status).toBe(201);
    const transferId = createRes.data.data._id ?? createRes.data.data.id;
    tracker.track('transfer', transferId);

    const res = await api.put(`/transfer/${transferId}`, { status: 'Completed' });
    expect(res.status).toBe(400);
    expect(res.data.error).toMatch(/execute-transfer/i);
  });

  test('blocks creating a transfer when the file has a possession in progress', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const { fileId, plotId } = await bookFile(api, fx, tracker, {
      memId: fx.memberId,
      contractPrice: 120000,
    });
    await payOffFileInFull(api, fileId, 120000);
    await markPlotPossessionReady(api, fileId, plotId);

    const usersRes = await api.get('/v1/users/users', { params: { limit: 1 } });
    const csrId = usersRes.data?.data?.users?.[0]?.id;
    expect(csrId).toBeTruthy();

    const possessionRes = await api.post('/possession', {
      fileId,
      possessionInitDate: new Date().toISOString(),
      possessionHandoverCSR: csrId,
    });
    expect(possessionRes.status).toBe(201);
    tracker.track('possession', possessionRes.data.data._id ?? possessionRes.data.data.id);

    const transferType = await createTransferType(api, tracker, 2500);
    const res = await api.post('/transfer', {
      fileId,
      transferTypeId: transferType._id,
      sellerMemId: fx.memberId,
      buyerMemId: fx.memberId2,
      transferInitDate: new Date().toISOString(),
    });

    expect(res.status).toBe(400);
    expect(res.data.error).toMatch(/possession in progress/i);
  });

  test('happy path: completed transfer moves ownership, carries over the buyer nominee, and preserves history', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const contractPrice = 150000;
    const { fileId } = await bookFile(api, fx, tracker, {
      memId: fx.memberId,
      contractPrice,
    });

    // Give the seller a paid-installment receipt before the transfer, so we
    // can confirm it still shows paidByMemId = seller afterwards.
    const listRes = await api.get(`/installment/file/${fileId}`);
    const installment = listRes.data.data[0];
    const installmentId = installment.id ?? installment._id;
    await api.post(`/installment/${installmentId}/payment`, {
      amountPaid: 10000,
      paidDate: new Date().toISOString(),
      paymentMode: 'Cash',
      transactionRefNo: uniq('TXN-PRE-'),
    });

    // Nominee named on the transfer itself, belonging to the buyer - the rule
    // is that this nominee carries over onto File.nomineeId on completion.
    const nomineeRes = await api.post('/nominee', {
      memId: fx.memberId2,
      nomineeName: 'Smoke Test Nominee',
      nomineeCNIC: '98765-1234567-2',
      relationWithMember: 'Son',
      nomineeContact: '03001234567',
      // Small share, not 100% - fx.memberId2 is a shared fixture reused by
      // later tests in this file, which also need to add their own nominee.
      nomineeSharePercentage: 1,
    });
    expect(nomineeRes.status).toBe(201);
    tracker.track('nominee', nomineeRes.data.data._id ?? nomineeRes.data.data.id);

    const transferType = await createTransferType(api, tracker, 3000);
    const createRes = await api.post('/transfer', {
      fileId,
      transferTypeId: transferType._id,
      sellerMemId: fx.memberId,
      buyerMemId: fx.memberId2,
      transferInitDate: new Date().toISOString(),
      transfIsAtt: true,
      nomineeId: nomineeRes.data.data._id ?? nomineeRes.data.data.id,
    });
    expect(createRes.status).toBe(201);
    const transferId = createRes.data.data._id ?? createRes.data.data.id;
    tracker.track('transfer', transferId);
    const nomineeId = nomineeRes.data.data._id ?? nomineeRes.data.data.id;

    await api.put(`/transfer/${transferId}`, { status: 'Approved' });
    await api.post(`/transfer/${transferId}/pay-fee`, {
      amount: transferType.transferFee,
      paymentDate: new Date().toISOString(),
      paymentMethod: 'Cash',
    });

    const execRes = await api.post(`/transfer/${transferId}/execute`, {
      executionDate: new Date().toISOString(),
      witness1Name: 'Witness One',
      witness1CNIC: '12345-1234567-1',
      officerName: 'Officer One',
      officerDesignation: 'Transfer Officer',
    });
    expect(execRes.status).toBe(200);
    expect(execRes.data.data.status).toBe('Completed');

    const fileRes = await api.get(`/file/${fileId}`);
    expect(fileRes.status).toBe(200);
    const memId = fileRes.data.data.memId?._id ?? fileRes.data.data.memId;
    expect(String(memId)).toBe(fx.memberId2);
    // File status stays as-is (Pending here) under the new owner - a
    // completed transfer never changes file.status.
    // The transfer named a nominee belonging to the buyer, so it carries
    // over onto the file.
    const fileNomineeId = fileRes.data.data.nomineeId?._id ?? fileRes.data.data.nomineeId;
    expect(String(fileNomineeId)).toBe(String(nomineeId));

    const receiptsRes = await api.get(`/payment/by-target/installment/${installmentId}`);
    expect(receiptsRes.status).toBe(200);
    const preTransferReceipt = receiptsRes.data.data[0];
    expect(String(preTransferReceipt.paidByMemId?._id ?? preTransferReceipt.paidByMemId)).toBe(
      fx.memberId
    );
  });

  // Regression test: paymentDate/executionDate arrive over JSON as plain
  // strings (every request body does - there's no such thing as a JSON
  // Date). recordFeePayment and executeTransfer used to call
  // `.toLocaleDateString()` directly on these string values while building
  // their remark text, which threw "X.toLocaleDateString is not a function"
  // (a 500, not a validation error) the first time this path was actually
  // exercised end-to-end. Pins both endpoints to accept string dates.
  test('accepts ISO date strings for fee payment and execution without erroring', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const { fileId } = await bookFile(api, fx, tracker, {
      memId: fx.memberId,
      contractPrice: 100000,
    });
    const transferType = await createTransferType(api, tracker, 1500);

    const createRes = await api.post('/transfer', {
      fileId,
      transferTypeId: transferType._id,
      sellerMemId: fx.memberId,
      buyerMemId: fx.memberId2,
      transferInitDate: new Date().toISOString(),
      transfIsAtt: true,
    });
    expect(createRes.status).toBe(201);
    const transferId = createRes.data.data._id ?? createRes.data.data.id;
    tracker.track('transfer', transferId);

    await api.put(`/transfer/${transferId}`, { status: 'Approved' });

    // paymentDate sent as a JSON string, exactly as any real HTTP client sends it.
    const payRes = await api.post(`/transfer/${transferId}/pay-fee`, {
      amount: transferType.transferFee,
      paymentDate: new Date().toISOString(),
      paymentMethod: 'Cash',
    });
    expect(payRes.status).toBe(200);

    // executionDate sent as a JSON string too.
    const execRes = await api.post(`/transfer/${transferId}/execute`, {
      executionDate: new Date().toISOString(),
      witness1Name: 'Witness One',
      witness1CNIC: '12345-1234567-1',
      officerName: 'Officer One',
      officerDesignation: 'Transfer Officer',
    });
    expect(execRes.status).toBe(200);
    expect(execRes.data.data.status).toBe('Completed');
  });

  test('nominee named on the transfer carries over to the file on execution', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const { fileId } = await bookFile(api, fx, tracker, {
      memId: fx.memberId,
      contractPrice: 100000,
    });
    const transferType = await createTransferType(api, tracker, 1000);
    const buyerNomineeId = await createNominee(api, tracker, fx.memberId2);

    const createRes = await api.post('/transfer', {
      fileId,
      transferTypeId: transferType._id,
      sellerMemId: fx.memberId,
      buyerMemId: fx.memberId2,
      transferInitDate: new Date().toISOString(),
      transfIsAtt: true,
      nomineeId: buyerNomineeId,
    });
    expect(createRes.status).toBe(201);
    const transferId = createRes.data.data._id ?? createRes.data.data.id;
    tracker.track('transfer', transferId);

    const execRes = await approveAndExecuteTransfer(api, transferId, transferType.transferFee);
    expect(execRes.status).toBe(200);

    const fileRes = await api.get(`/file/${fileId}`);
    const fileNomineeId = fileRes.data.data.nomineeId?._id ?? fileRes.data.data.nomineeId;
    expect(String(fileNomineeId)).toBe(String(buyerNomineeId));
  });

  test('nominee is cleared from the file when the transfer names none', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const { fileId } = await bookFile(api, fx, tracker, {
      memId: fx.memberId,
      contractPrice: 100000,
    });

    // Give the file a nominee before the transfer, so clearing it is a real
    // observable change rather than it just staying unset.
    const sellerNomineeId = await createNominee(api, tracker, fx.memberId);
    const seedRes = await api.put(`/file/${fileId}`, { nomineeId: sellerNomineeId });
    expect(seedRes.status).toBe(200);

    const transferType = await createTransferType(api, tracker, 1000);
    const createRes = await api.post('/transfer', {
      fileId,
      transferTypeId: transferType._id,
      sellerMemId: fx.memberId,
      buyerMemId: fx.memberId2,
      transferInitDate: new Date().toISOString(),
      transfIsAtt: true,
      // No nomineeId named on this transfer.
    });
    expect(createRes.status).toBe(201);
    const transferId = createRes.data.data._id ?? createRes.data.data.id;
    tracker.track('transfer', transferId);

    const execRes = await approveAndExecuteTransfer(api, transferId, transferType.transferFee);
    expect(execRes.status).toBe(200);

    const fileRes = await api.get(`/file/${fileId}`);
    expect(fileRes.data.data.nomineeId).toBeFalsy();
  });

  test("the seller's nominee never carries over, even when the buyer names their own", async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const { fileId } = await bookFile(api, fx, tracker, {
      memId: fx.memberId,
      contractPrice: 100000,
    });

    const sellerNomineeId = await createNominee(api, tracker, fx.memberId);
    const seedRes = await api.put(`/file/${fileId}`, { nomineeId: sellerNomineeId });
    expect(seedRes.status).toBe(200);

    const buyerNomineeId = await createNominee(api, tracker, fx.memberId2);
    const transferType = await createTransferType(api, tracker, 1000);
    const createRes = await api.post('/transfer', {
      fileId,
      transferTypeId: transferType._id,
      sellerMemId: fx.memberId,
      buyerMemId: fx.memberId2,
      transferInitDate: new Date().toISOString(),
      transfIsAtt: true,
      nomineeId: buyerNomineeId,
    });
    expect(createRes.status).toBe(201);
    const transferId = createRes.data.data._id ?? createRes.data.data.id;
    tracker.track('transfer', transferId);

    const execRes = await approveAndExecuteTransfer(api, transferId, transferType.transferFee);
    expect(execRes.status).toBe(200);

    const fileRes = await api.get(`/file/${fileId}`);
    const fileNomineeId = fileRes.data.data.nomineeId?._id ?? fileRes.data.data.nomineeId;
    expect(String(fileNomineeId)).toBe(String(buyerNomineeId));
    expect(String(fileNomineeId)).not.toBe(String(sellerNomineeId));
  });

  test('transfer fee always comes from the transfer type, ignoring a different client-sent amount', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const { fileId } = await bookFile(api, fx, tracker, {
      memId: fx.memberId,
      contractPrice: 100000,
    });
    const transferType = await createTransferType(api, tracker, 6000);

    const createRes = await api.post('/transfer', {
      fileId,
      transferTypeId: transferType._id,
      sellerMemId: fx.memberId,
      buyerMemId: fx.memberId2,
      transferInitDate: new Date().toISOString(),
      // Attempt to override the fee - must be ignored server-side.
      transferFeeAmount: 1,
    });
    expect(createRes.status).toBe(201);
    const transferId = createRes.data.data._id ?? createRes.data.data.id;
    tracker.track('transfer', transferId);

    expect(createRes.data.data.transferFeeAmount).toBe(transferType.transferFee);

    const fetchRes = await api.get(`/transfer/${transferId}`);
    expect(fetchRes.data.data.transferFeeAmount).toBe(transferType.transferFee);
  });

  test("change-nominee rejects a nominee that does not belong to the file's current member", async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const { fileId } = await bookFile(api, fx, tracker, {
      memId: fx.memberId,
      contractPrice: 100000,
    });

    const otherMemberNomineeId = await createNominee(api, tracker, fx.memberId2);
    const rejectRes = await api.post(`/file/${fileId}/change-nominee`, {
      nomineeId: otherMemberNomineeId,
    });
    expect(rejectRes.status).toBe(400);
    expect(rejectRes.data.error).toMatch(/does not belong/i);

    // A nominee that DOES belong to the file's current member is accepted.
    const ownNomineeId = await createNominee(api, tracker, fx.memberId);
    const acceptRes = await api.post(`/file/${fileId}/change-nominee`, {
      nomineeId: ownNomineeId,
    });
    expect(acceptRes.status).toBe(200);
    const fileNomineeId = acceptRes.data.data.nomineeId?._id ?? acceptRes.data.data.nomineeId;
    expect(String(fileNomineeId)).toBe(String(ownNomineeId));

    // Clearing it (omitting nomineeId) unsets it.
    const clearRes = await api.post(`/file/${fileId}/change-nominee`, {});
    expect(clearRes.status).toBe(200);
    expect(clearRes.data.data.nomineeId).toBeFalsy();
  });
});

describe('Transfer application picker filter (GET /application)', () => {
  const tracker = makeTracker();

  afterAll(async () => {
    await tracker.cleanupAll();
  });

  test('only returns an approved, transfer-type application for the file member+plot that is not already linked to a live transfer', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const { fileId, plotId } = await bookFile(api, fx, tracker, {
      memId: fx.memberId,
      contractPrice: 100000,
    });

    const transferAppTypeRes = await api.post('/applicationtype', {
      applicationName: uniq('Smoke Transfer Application '),
      applicationFee: 500,
    });
    expect(transferAppTypeRes.status).toBe(201);
    const transferAppTypeId = transferAppTypeRes.data.data._id;
    tracker.track('applicationtype', transferAppTypeId);

    const otherAppTypeRes = await api.post('/applicationtype', {
      applicationName: uniq('Smoke Duplicate File Application '),
      applicationFee: 200,
    });
    expect(otherAppTypeRes.status).toBe(201);
    const otherAppTypeId = otherAppTypeRes.data.data._id;
    tracker.track('applicationtype', otherAppTypeId);

    const approvedStatusRes = await api.post('/status', { statusName: 'Approved' });
    expect(approvedStatusRes.status).toBe(201);
    const approvedStatusId = approvedStatusRes.data.data._id;
    tracker.track('status', approvedStatusId);

    const pendingStatusRes = await api.post('/status', { statusName: 'Pending' });
    expect(pendingStatusRes.status).toBe(201);
    const pendingStatusId = pendingStatusRes.data.data._id;
    tracker.track('status', pendingStatusId);

    async function createApp(overrides: {
      applicationTypeID: string;
      memId: string;
      statusId: string;
    }) {
      const res = await api.post('/application', {
        applicationTypeID: overrides.applicationTypeID,
        memId: overrides.memId,
        plotId,
        applicationDate: new Date().toISOString(),
        statusId: overrides.statusId,
      });
      expect(res.status).toBe(201);
      const id = res.data.data._id ?? res.data.data.id;
      tracker.track('application', id);
      return id as string;
    }

    // Matches every rule - should be returned.
    const eligibleAppId = await createApp({
      applicationTypeID: transferAppTypeId,
      memId: fx.memberId,
      statusId: approvedStatusId,
    });

    // Wrong application type (not a transfer-category application).
    await createApp({
      applicationTypeID: otherAppTypeId,
      memId: fx.memberId,
      statusId: approvedStatusId,
    });

    // Wrong status (not approved).
    await createApp({
      applicationTypeID: transferAppTypeId,
      memId: fx.memberId,
      statusId: pendingStatusId,
    });

    // Wrong member (belongs to memberId2, not the file's member).
    await createApp({
      applicationTypeID: transferAppTypeId,
      memId: fx.memberId2,
      statusId: approvedStatusId,
    });

    // Otherwise eligible, but already linked to a live (non-cancelled/
    // rejected) transfer - must be excluded.
    const linkedAppId = await createApp({
      applicationTypeID: transferAppTypeId,
      memId: fx.memberId,
      statusId: approvedStatusId,
    });
    const transferType = await createTransferType(api, tracker, 1000);
    const linkingTransferRes = await api.post('/transfer', {
      fileId,
      transferTypeId: transferType._id,
      sellerMemId: fx.memberId,
      buyerMemId: fx.memberId2,
      transferInitDate: new Date().toISOString(),
      applicationId: linkedAppId,
    });
    expect(linkingTransferRes.status).toBe(201);
    tracker.track(
      'transfer',
      linkingTransferRes.data.data._id ?? linkingTransferRes.data.data.id
    );

    const res = await api.get('/application', {
      params: {
        memId: fx.memberId,
        plotId,
        applicationTypeCategory: 'transfer',
        statusName: 'Approved',
        excludeLinkedToTransfer: true,
      },
    });
    expect(res.status).toBe(200);
    const returnedIds = (res.data.data.applications as any[]).map(
      (a: any) => a._id ?? a.id
    );
    expect(returnedIds).toContain(eligibleAppId);
    expect(returnedIds).not.toContain(linkedAppId);
    expect(returnedIds).toHaveLength(1);

    // The label combines applicationNo, type name, member name, and plot no.
    const eligibleApp = (res.data.data.applications as any[]).find(
      (a: any) => (a._id ?? a.id) === eligibleAppId
    );
    expect(eligibleApp.applicationLabel).toContain(eligibleApp.applicationNo);
    expect(eligibleApp.applicationLabel).toContain('·');
  });
});
