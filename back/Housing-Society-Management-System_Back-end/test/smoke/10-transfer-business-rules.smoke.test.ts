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

  test('happy path: completed transfer moves ownership, clears the nominee, and preserves history', async () => {
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

    // Nominee named on the transfer itself - the rule is that File.nomineeId
    // is explicitly cleared on completion, never copied from here.
    const nomineeRes = await api.post('/nominee', {
      memId: fx.memberId2,
      nomineeName: 'Smoke Test Nominee',
      nomineeCNIC: '98765-1234567-2',
      relationWithMember: 'Son',
      nomineeContact: '03001234567',
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
    // The transfer named a nominee, but it must NOT carry over - cleared
    // unconditionally so the buyer has to add their own.
    expect(fileRes.data.data.nomineeId).toBeFalsy();

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
});
