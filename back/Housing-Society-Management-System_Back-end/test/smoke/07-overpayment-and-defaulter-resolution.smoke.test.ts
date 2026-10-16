import { getBaseFixtures, getClient, makeTracker, uniq } from './helpers';

async function createCategory(api: any, kind: string) {
  const res = await api.post('/installmentcategory', {
    instCatName: uniq(`Overpay/Resolve InstCat ${kind} `),
    kind,
    isRefundable: false,
    isMandatory: true,
    sequenceOrder: Math.floor(Math.random() * 100000) + 80000,
    isActive: true,
  });
  if (res.status !== 201) {
    throw new Error(`Failed to create installment category: ${res.status} ${JSON.stringify(res.data)}`);
  }
  return res.data.data._id as string;
}

async function bookFileWithSingleRowPlan(
  api: any,
  fx: any,
  tracker: any,
  opts: { contractPrice: number; bookingDate: Date }
) {
  const sizeRes = await api.post('/plotsizes', {
    plotSizeName: uniq('Overpay Size '),
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
    plotNo: uniq('OP-').slice(0, 20),
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

  const catId = await createCategory(api, 'installment');

  const planRes = await api.post('/installment-plans', {
    projId: fx.projectId,
    planName: uniq('Overpay Plan '),
    totalMonths: 1,
    totalAmount: opts.contractPrice,
    isActive: true,
  });
  expect(planRes.status).toBe(201);
  tracker.track('installment-plans', planRes.data.data._id);

  const detailRes = await api.post('/installment-plan-details', {
    planId: planRes.data.data._id,
    instCatId: catId,
    occurrence: 1,
    percentageAmount: 100,
  });
  expect(detailRes.status).toBe(201);

  const fileRes = await api.post('/file', {
    planId: planRes.data.data._id,
    memId: fx.memberId,
    societyId: fx.societyId,
    plotId: plotRes.data.data._id,
    paymentMode: 'Cash',
    bookingDate: opts.bookingDate.toISOString(),
  });
  expect(fileRes.status).toBe(201);
  tracker.track('file', fileRes.data.data._id);

  return fileRes.data.data._id as string;
}

describe('Overpayment rejection and defaulter resolution on payment', () => {
  const tracker = makeTracker();

  afterAll(async () => {
    await tracker.cleanupAll();
  });

  test('recordPayment rejects an amount greater than the remaining balance, with a clear 400', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const fileId = await bookFileWithSingleRowPlan(api, fx, tracker, {
      contractPrice: 40000,
      bookingDate: new Date(),
    });

    const listRes = await api.get(`/installment/file/${fileId}`);
    const installmentId = listRes.data.data[0].id ?? listRes.data.data[0]._id;

    // Partially pay first, then try to overpay the remainder.
    const partial = await api.post(`/installment/${installmentId}/payment`, {
      amountPaid: 10000,
      paidDate: new Date().toISOString(),
      paymentMode: 'Cash',
    });
    expect(partial.status).toBe(200);

    const overpay = await api.post(`/installment/${installmentId}/payment`, {
      amountPaid: 999999, // way more than the 30000 remaining
      paidDate: new Date().toISOString(),
      paymentMode: 'Cash',
    });

    expect(overpay.status).toBe(400);
    expect(JSON.stringify(overpay.data)).toMatch(/exceeds total payable/i);
    expect(JSON.stringify(overpay.data)).toMatch(/maximum payment allowed/i);

    // Confirm the rejected overpayment did not mutate the row.
    const after = await api.get(`/installment/${installmentId}`);
    expect(after.data.data.amountPaid).toBe(10000);
    expect(after.data.data.status).toBe('Partially Paid');
  });

  test('a file disappears from the defaulter list once its overdue installment is paid in full', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const bookingDate = new Date();
    bookingDate.setDate(bookingDate.getDate() - 45); // well past the 30-day default threshold

    const fileId = await bookFileWithSingleRowPlan(api, fx, tracker, {
      contractPrice: 60000,
      bookingDate,
    });

    const admitted = await api.get(`/defaulter/${fileId}`);
    expect(admitted.status).toBe(200);
    expect(admitted.data.data).toBeTruthy();
    expect(admitted.data.data.totalOverdue).toBeGreaterThan(0);

    const listRes = await api.get(`/installment/file/${fileId}`);
    const installmentId = listRes.data.data[0].id ?? listRes.data.data[0]._id;

    const payRes = await api.post(`/installment/${installmentId}/payment`, {
      amountPaid: 60000,
      paidDate: new Date().toISOString(),
      paymentMode: 'Cash',
    });
    expect(payRes.status).toBe(200);
    expect(payRes.data.data.status).toBe('Paid');

    const resolved = await api.get(`/defaulter/${fileId}`);
    // No longer qualifies - totalOverdue is 0, so it drops off the
    // ledger-derived list entirely (service throws "not currently a
    // defaulter", surfaced as an error response).
    expect(resolved.status).toBeGreaterThanOrEqual(400);
  });
});
