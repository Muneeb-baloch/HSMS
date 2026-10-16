import { getBaseFixtures, getClient, makeTracker, uniq } from './helpers';

async function createCategory(api: any, kind: string) {
  const res = await api.post('/installmentcategory', {
    instCatName: uniq(`Receipt InstCat ${kind} `),
    kind,
    isRefundable: false,
    isMandatory: true,
    sequenceOrder: Math.floor(Math.random() * 100000) + 100000,
    isActive: true,
  });
  if (res.status !== 201) {
    throw new Error(`Failed to create installment category: ${res.status} ${JSON.stringify(res.data)}`);
  }
  return res.data.data._id as string;
}

async function bookFileWithSingleRowPlan(api: any, fx: any, tracker: any, contractPrice: number) {
  const sizeRes = await api.post('/plotsizes', {
    plotSizeName: uniq('Receipt Size '),
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
    plotNo: uniq('RCP-').slice(0, 20),
    plotBlockId: fx.blockId,
    plotSizeId: sizeRes.data.data._id,
    plotType: 'residential',
    plotCategoryId: fx.plotCategoryStandardId,
    salesStatusId: fx.salesStatusAvailableId,
    plotLength: 30,
    plotWidth: 40,
    plotBasePrice: contractPrice,
  });
  expect(plotRes.status).toBe(201);
  tracker.track('plots', plotRes.data.data._id);

  const catId = await createCategory(api, 'installment');

  const planRes = await api.post('/installment-plans', {
    projId: fx.projectId,
    planName: uniq('Receipt Plan '),
    totalMonths: 1,
    totalAmount: contractPrice,
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

  const fileRes = await api.post('/file', {
    planId: planRes.data.data._id,
    memId: fx.memberId,
    societyId: fx.societyId,
    plotId: plotRes.data.data._id,
    paymentMode: 'Cash',
    bookingDate: new Date().toISOString(),
  });
  expect(fileRes.status).toBe(201);
  tracker.track('file', fileRes.data.data._id);

  return fileRes.data.data._id as string;
}

async function createBillType(api: any, tracker: any) {
  const res = await api.post('/billtype', {
    billTypeName: uniq('Receipt Bill Type '),
    billTypeCategory: 'Utility',
    isRecurring: true,
    frequency: 'MONTHLY',
  });
  expect(res.status).toBe(201);
  tracker.track('billtype', res.data.data._id);
  return res.data.data._id as string;
}

function receiptSeq(receiptNo: string): number {
  const match = receiptNo.match(/^RCP-(\d{4})-(\d{5})$/);
  if (!match) throw new Error(`Unexpected receipt number format: ${receiptNo}`);
  return parseInt(match[2], 10);
}

describe('Payment/Receipt system', () => {
  const tracker = makeTracker();

  afterAll(async () => {
    await tracker.cleanupAll();
  });

  test('recording an installment payment creates exactly one receipt with correct fields', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const fileId = await bookFileWithSingleRowPlan(api, fx, tracker, 50000);
    const listRes = await api.get(`/installment/file/${fileId}`);
    const installment = listRes.data.data[0];
    const installmentId = installment.id ?? installment._id;

    const payRes = await api.post(`/installment/${installmentId}/payment`, {
      amountPaid: 20000,
      paidDate: new Date().toISOString(),
      paymentMode: 'Cash',
      transactionRefNo: 'TXN-INST-1',
    });
    expect(payRes.status).toBe(200);

    const receiptsRes = await api.get(`/payment/by-target/installment/${installmentId}`);
    expect(receiptsRes.status).toBe(200);
    expect(receiptsRes.data.data.length).toBe(1);

    const receipt = receiptsRes.data.data[0];
    expect(receipt.receiptNo).toMatch(/^RCP-\d{4}-\d{5}$/);
    expect(receipt.amount).toBe(20000);
    expect(receipt.targetType).toBe('installment');
    expect(String(receipt.fileId?._id ?? receipt.fileId)).toBe(fileId);
    expect(receipt.paymentMode).toBe('Cash');
    expect(receipt.transactionRefNo).toBe('TXN-INST-1');
    expect(receipt.reversed).toBe(false);
    expect(receipt.migrated).toBe(false);

    // A second partial payment on the same installment creates a second,
    // separate receipt - not an update to the first one.
    const payRes2 = await api.post(`/installment/${installmentId}/payment`, {
      amountPaid: 30000,
      paidDate: new Date().toISOString(),
      paymentMode: 'Bank Transfer',
    });
    expect(payRes2.status).toBe(200);

    const receiptsRes2 = await api.get(`/payment/by-target/installment/${installmentId}`);
    expect(receiptsRes2.data.data.length).toBe(2);
  });

  test('recording a bill payment creates a receipt with the bill as its target', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const fileId = await bookFileWithSingleRowPlan(api, fx, tracker, 40000);
    const billTypeId = await createBillType(api, tracker);

    const billRes = await api.post('/billinfo', {
      fileId,
      memId: fx.memberId,
      societyId: fx.societyId,
      billTypeId,
      billMonth: 'June 2027',
      billAmount: 8000,
      dueDate: new Date().toISOString(),
    });
    expect(billRes.status).toBe(201);
    const billId = billRes.data.data._id ?? billRes.data.data.id;
    tracker.track('billinfo', billId);

    const payRes = await api.post(`/billinfo/${billId}/record-payment`, {
      paymentAmount: 8000,
      paymentDate: new Date().toISOString(),
      paymentMethod: 'Cash',
    });
    expect(payRes.status).toBe(200);

    const receiptsRes = await api.get(`/payment/by-target/bill/${billId}`);
    expect(receiptsRes.status).toBe(200);
    expect(receiptsRes.data.data.length).toBe(1);
    expect(receiptsRes.data.data[0].amount).toBe(8000);
    expect(receiptsRes.data.data[0].targetType).toBe('bill');
  });

  test('receipt numbers are unique and sequential across consecutive payments', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const fileId = await bookFileWithSingleRowPlan(api, fx, tracker, 30000);
    const listRes = await api.get(`/installment/file/${fileId}`);
    const installment = listRes.data.data[0];
    const installmentId = installment.id ?? installment._id;

    const pay1 = await api.post(`/installment/${installmentId}/payment`, {
      amountPaid: 10000,
      paidDate: new Date().toISOString(),
      paymentMode: 'Cash',
    });
    expect(pay1.status).toBe(200);

    const pay2 = await api.post(`/installment/${installmentId}/payment`, {
      amountPaid: 10000,
      paidDate: new Date().toISOString(),
      paymentMode: 'Cash',
    });
    expect(pay2.status).toBe(200);

    const pay3 = await api.post(`/installment/${installmentId}/payment`, {
      amountPaid: 10000,
      paidDate: new Date().toISOString(),
      paymentMode: 'Cash',
    });
    expect(pay3.status).toBe(200);

    const receiptsRes = await api.get(`/payment/by-target/installment/${installmentId}`);
    expect(receiptsRes.data.data.length).toBe(3);

    // Oldest first for sequence comparison (API returns newest first).
    const receiptNos: string[] = receiptsRes.data.data
      .map((r: any) => r.receiptNo)
      .sort();
    const uniqueNos = new Set(receiptNos);
    expect(uniqueNos.size).toBe(3);

    const seqs = receiptNos.map(receiptSeq).sort((a, b) => a - b);
    expect(seqs[1]).toBe(seqs[0] + 1);
    expect(seqs[2]).toBe(seqs[1] + 1);
  });

  test('a rejected overpayment creates no receipt', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const fileId = await bookFileWithSingleRowPlan(api, fx, tracker, 20000);
    const listRes = await api.get(`/installment/file/${fileId}`);
    const installment = listRes.data.data[0];
    const installmentId = installment.id ?? installment._id;

    const before = await api.get(`/payment/by-target/installment/${installmentId}`);
    expect(before.data.data.length).toBe(0);

    const overpay = await api.post(`/installment/${installmentId}/payment`, {
      amountPaid: 999999,
      paidDate: new Date().toISOString(),
      paymentMode: 'Cash',
    });
    expect(overpay.status).toBe(400);

    const after = await api.get(`/payment/by-target/installment/${installmentId}`);
    expect(after.data.data.length).toBe(0);
  });

  test('the receipt PDF endpoint returns a valid PDF', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const fileId = await bookFileWithSingleRowPlan(api, fx, tracker, 15000);
    const listRes = await api.get(`/installment/file/${fileId}`);
    const installment = listRes.data.data[0];
    const installmentId = installment.id ?? installment._id;

    const payRes = await api.post(`/installment/${installmentId}/payment`, {
      amountPaid: 15000,
      paidDate: new Date().toISOString(),
      paymentMode: 'Cash',
    });
    expect(payRes.status).toBe(200);

    const receiptsRes = await api.get(`/payment/by-target/installment/${installmentId}`);
    const receiptId = receiptsRes.data.data[0]._id ?? receiptsRes.data.data[0].id;

    const pdfRes = await api.get(`/payment/${receiptId}/pdf`, { responseType: 'arraybuffer' });
    expect(pdfRes.status).toBe(200);
    expect(pdfRes.headers['content-type']).toMatch(/application\/pdf/);

    const buffer = Buffer.from(pdfRes.data);
    expect(buffer.length).toBeGreaterThan(100);
    expect(buffer.subarray(0, 4).toString('ascii')).toBe('%PDF');
  });

  test('receipt detail includes the installment title as the paid-against description', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const fileId = await bookFileWithSingleRowPlan(api, fx, tracker, 12000);
    const listRes = await api.get(`/installment/file/${fileId}`);
    const installment = listRes.data.data[0];
    const installmentId = installment.id ?? installment._id;

    const payRes = await api.post(`/installment/${installmentId}/payment`, {
      amountPaid: 12000,
      paidDate: new Date().toISOString(),
      paymentMode: 'Cash',
    });
    expect(payRes.status).toBe(200);

    const receiptsRes = await api.get(`/payment/by-target/installment/${installmentId}`);
    const receiptId = receiptsRes.data.data[0]._id ?? receiptsRes.data.data[0].id;

    const detailRes = await api.get(`/payment/${receiptId}`);
    expect(detailRes.status).toBe(200);
    expect(detailRes.data.data.targetDescription).toBe(installment.installmentTitle);
    expect(detailRes.data.data.member?.memName).toBeTruthy();
    expect(detailRes.data.data.file?.fileRegNo).toBeTruthy();
  });

  test('File "Payments" listing returns all receipts for that file, newest first', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const fileId = await bookFileWithSingleRowPlan(api, fx, tracker, 25000);
    const listRes = await api.get(`/installment/file/${fileId}`);
    const installment = listRes.data.data[0];
    const installmentId = installment.id ?? installment._id;

    await api.post(`/installment/${installmentId}/payment`, {
      amountPaid: 10000,
      paidDate: new Date('2027-01-01').toISOString(),
      paymentMode: 'Cash',
    });
    await api.post(`/installment/${installmentId}/payment`, {
      amountPaid: 15000,
      paidDate: new Date('2027-02-01').toISOString(),
      paymentMode: 'Cash',
    });

    const filePaymentsRes = await api.get(`/payment/file/${fileId}`);
    expect(filePaymentsRes.status).toBe(200);
    expect(filePaymentsRes.data.data.length).toBe(2);
    // Newest paymentDate first.
    expect(new Date(filePaymentsRes.data.data[0].paymentDate).getTime()).toBeGreaterThan(
      new Date(filePaymentsRes.data.data[1].paymentDate).getTime()
    );
  });
});
