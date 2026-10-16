import { getBaseFixtures, getClient, makeTracker, uniq } from './helpers';

async function createCategory(api: any, kind: string, sequenceOrder: number) {
  const res = await api.post('/installmentcategory', {
    instCatName: uniq(`Smoke InstCat ${kind} `),
    kind,
    isRefundable: false,
    isMandatory: true,
    sequenceOrder,
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
  opts: { contractPrice: number; occurrence: number; kind: string }
) {
  const sizeRes = await api.post('/plotsizes', {
    plotSizeName: uniq('Inst Size '),
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
    plotNo: uniq('IN-').slice(0, 20),
    plotBlockId: fx.blockId,
    plotSizeId: sizeRes.data.data._id,
    plotType: 'residential',
    plotCategoryId: fx.plotCategoryStandardId,
    salesStatusId: fx.salesStatusAvailableId,
    plotLength: 30,
    plotWidth: 40,
    plotBasePrice: opts.contractPrice,
    surchargeAmount: 0,
    discountAmount: 0,
  });
  expect(plotRes.status).toBe(201);
  tracker.track('plots', plotRes.data.data._id);

  const catId = await createCategory(api, opts.kind, Math.floor(Math.random() * 100000) + 20000);

  const planRes = await api.post('/installment-plans', {
    projId: fx.projectId,
    planName: uniq('Inst Plan '),
    totalMonths: opts.occurrence,
    totalAmount: opts.contractPrice,
    isActive: true,
  });
  expect(planRes.status).toBe(201);
  tracker.track('installment-plans', planRes.data.data._id);

  const detailRes = await api.post('/installment-plan-details', {
    planId: planRes.data.data._id,
    instCatId: catId,
    occurrence: opts.occurrence,
    percentageAmount: 100,
  });
  expect(detailRes.status).toBe(201);

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

  return { fileId: fileRes.data.data._id as string, catId, plotId: plotRes.data.data._id as string };
}

describe('Installments: bulk creation, transactional rollback, payments', () => {
  const tracker = makeTracker();

  afterAll(async () => {
    await tracker.cleanupAll();
  });

  test('bulk-created installments have correct totalPayable/balanceAmount/status', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const { fileId } = await bookFileWithSingleRowPlan(api, fx, tracker, {
      contractPrice: 100,
      occurrence: 50, // keep it far from installmentNo 1/2/3 used by the bulk call
      kind: 'installment',
    });

    const bulkCatId = await createCategory(api, 'installment', Math.floor(Math.random() * 100000) + 30000);

    const res = await api.post('/installment/bulk', {
      fileId,
      installmentCategoryId: bulkCatId,
      installmentType: 'Monthly',
      totalInstallments: 3,
      amountPerInstallment: 50000,
      startDate: new Date().toISOString(),
      frequency: 'monthly',
      installmentTitle: 'Smoke Bulk Installment',
    });

    expect(res.status).toBe(201);
    expect(res.data.data.length).toBe(3);

    for (const row of res.data.data) {
      expect(row.totalPayable).toBe(50000);
      expect(row.balanceAmount).toBe(50000);
      expect(row.status).toBe('Unpaid');
    }
  });

  test('bulk create rolls back entirely when one row collides with an existing installmentNo', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    // Book under a plan whose single installment lands at occurrence 5, so
    // installmentNo 1/2/3 (which the bulk call below will try) start clean.
    const { fileId, catId } = await bookFileWithSingleRowPlan(api, fx, tracker, {
      contractPrice: 500000,
      occurrence: 5,
      kind: 'installment',
    });

    // Manually occupy installmentNo=2 via the single-create endpoint, so the
    // bulk batch's 2nd row (i=2) will collide on the unique {fileId, installmentNo} index.
    const manualRes = await api.post('/installment', {
      fileId,
      installmentCategoryId: catId,
      installmentNo: 2,
      installmentTitle: 'Manually seeded row occupying slot 2',
      installmentType: 'Monthly',
      dueDate: new Date().toISOString(),
      amountDue: 1000,
    });
    expect(manualRes.status).toBe(201);

    const beforeRes = await api.get(`/installment/file/${fileId}`);
    const beforeNos = beforeRes.data.data.map((r: any) => r.installmentNo).sort();
    expect(beforeNos).toEqual([2, 5]);

    // Bulk attempt: tries installmentNo 1 (succeeds in-transaction), then 2
    // (collides with the manually seeded row) -> whole transaction must abort.
    const bulkRes = await api.post('/installment/bulk', {
      fileId,
      installmentCategoryId: catId,
      installmentType: 'Monthly',
      totalInstallments: 3,
      amountPerInstallment: 100,
      startDate: new Date().toISOString(),
      frequency: 'monthly',
      installmentTitle: 'Rollback Test Row',
    });

    expect(bulkRes.status).toBeGreaterThanOrEqual(400);

    const afterRes = await api.get(`/installment/file/${fileId}`);
    const afterNos = afterRes.data.data.map((r: any) => r.installmentNo).sort();

    // Proof of rollback: still exactly {2, 5} - the row that the loop
    // successfully created at installmentNo=1 before hitting the i=2
    // collision must have been rolled back, and i=3 must never have run.
    expect(afterNos).toEqual([2, 5]);
    expect(afterRes.data.data.length).toBe(2);
  });

  test('partial then full installment payment updates balance/status correctly', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const { fileId } = await bookFileWithSingleRowPlan(api, fx, tracker, {
      contractPrice: 200000,
      occurrence: 1,
      kind: 'down_payment',
    });

    const listRes = await api.get(`/installment/file/${fileId}`);
    const installment = listRes.data.data[0];
    expect(installment.amountDue).toBe(200000);

    const partialRes = await api.post(`/installment/${installment.id ?? installment._id}/payment`, {
      amountPaid: 80000,
      paidDate: new Date().toISOString(),
      paymentMode: 'Cash',
    });
    expect(partialRes.status).toBe(200);
    expect(partialRes.data.data.status).toBe('Partially Paid');
    expect(partialRes.data.data.balanceAmount).toBe(120000);

    const fullRes = await api.post(`/installment/${installment.id ?? installment._id}/payment`, {
      amountPaid: 120000,
      paidDate: new Date().toISOString(),
      paymentMode: 'Cash',
    });
    expect(fullRes.status).toBe(200);
    expect(fullRes.data.data.status).toBe('Paid');
    expect(fullRes.data.data.balanceAmount).toBe(0);
  });

  test('possession fee payment does not change plot balance, only total outstanding', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const { fileId } = await bookFileWithSingleRowPlan(api, fx, tracker, {
      contractPrice: 300000,
      occurrence: 1,
      kind: 'down_payment',
    });

    const beforeFileRes = await api.get(`/file/${fileId}`);
    const plotBalanceBefore = beforeFileRes.data.data.plotBalance;
    const totalOutstandingBefore = beforeFileRes.data.data.totalOutstanding;
    expect(plotBalanceBefore).toBe(300000);
    expect(totalOutstandingBefore).toBe(300000);

    const possessionCatId = await createCategory(
      api,
      'possession_fee',
      Math.floor(Math.random() * 100000) + 40000
    );

    const feeRes = await api.post('/installment', {
      fileId,
      installmentCategoryId: possessionCatId,
      installmentNo: 99,
      installmentTitle: 'Possession Fee',
      installmentType: 'Possession Fee',
      dueDate: new Date().toISOString(),
      amountDue: 25000,
    });
    expect(feeRes.status).toBe(201);

    const payRes = await api.post(`/installment/${feeRes.data.data.id ?? feeRes.data.data._id}/payment`, {
      amountPaid: 25000,
      paidDate: new Date().toISOString(),
      paymentMode: 'Cash',
    });
    expect(payRes.status).toBe(200);

    const afterFileRes = await api.get(`/file/${fileId}`);
    expect(afterFileRes.data.data.plotBalance).toBe(300000); // unchanged
    expect(afterFileRes.data.data.totalOutstanding).toBe(300000); // fee was due+paid in the same step -> net 0 change
  });
});
