import { getBaseFixtures, getClient, makeTracker, uniq } from './helpers';

async function createCategory(api: any, kind: string) {
  const res = await api.post('/installmentcategory', {
    instCatName: uniq(`Grouped InstCat ${kind} `),
    kind,
    isRefundable: false,
    isMandatory: true,
    sequenceOrder: Math.floor(Math.random() * 100000) + 90000,
    isActive: true,
  });
  if (res.status !== 201) {
    throw new Error(`Failed to create installment category: ${res.status} ${JSON.stringify(res.data)}`);
  }
  return res.data.data._id as string;
}

async function bookFileWithTwoRowPlan(api: any, fx: any, tracker: any, contractPrice: number, plotNo: string) {
  const sizeRes = await api.post('/plotsizes', {
    plotSizeName: uniq('Grouped Size '),
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
    plotNo,
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

  const downCatId = await createCategory(api, 'down_payment');
  const instCatId = await createCategory(api, 'installment');

  const planRes = await api.post('/installment-plans', {
    projId: fx.projectId,
    planName: uniq('Grouped Plan '),
    totalMonths: 2,
    totalAmount: contractPrice,
    isActive: true,
  });
  expect(planRes.status).toBe(201);
  tracker.track('installment-plans', planRes.data.data._id);

  await api.post('/installment-plan-details', {
    planId: planRes.data.data._id,
    instCatId: downCatId,
    occurrence: 1,
    percentageAmount: 50,
  });
  await api.post('/installment-plan-details', {
    planId: planRes.data.data._id,
    instCatId: instCatId,
    occurrence: 2,
    percentageAmount: 50,
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

describe('Grouped installments: grouping, row-level filters, backend search', () => {
  const tracker = makeTracker();

  afterAll(async () => {
    await tracker.cleanupAll();
  });

  test('groups installments by file with correct aggregates, sorted rows, and group pagination', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const plotNo = uniq('GRP-').slice(0, 20);
    const fileId = await bookFileWithTwoRowPlan(api, fx, tracker, 100000, plotNo);

    const res = await api.get('/installment/grouped', { params: { limit: 100 } });
    expect(res.status).toBe(200);
    expect(res.data.data.pagination).toBeTruthy();

    const group = res.data.data.groups.find((g: any) => g.fileId === fileId);
    expect(group).toBeTruthy();
    expect(group.installmentCount).toBe(2);
    expect(group.totalDue).toBe(100000);
    expect(group.totalPaid).toBe(0);
    expect(group.balance).toBe(100000);
    expect(group.plotNo).toBe(plotNo);
    expect(group.statusCounts.Unpaid).toBe(2);

    // rows sorted by installmentNo
    expect(group.installments[0].installmentNo).toBeLessThan(group.installments[1].installmentNo);
  });

  test('row-level filters hide non-matching rows and hide groups with zero matches', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const plotNo = uniq('FLT-').slice(0, 20);
    const fileId = await bookFileWithTwoRowPlan(api, fx, tracker, 80000, plotNo);

    const listRes = await api.get(`/installment/file/${fileId}`);
    const firstRow = listRes.data.data[0];

    // Pay the first row in full so it becomes status=Paid.
    await api.post(`/installment/${firstRow.id ?? firstRow._id}/payment`, {
      amountPaid: firstRow.totalPayable,
      paidDate: new Date().toISOString(),
      paymentMode: 'Cash',
    });

    // Filtering to status=Unpaid should show the group with only the
    // still-unpaid row (not the one just paid).
    const unpaidRes = await api.get('/installment/grouped', {
      params: { status: 'Unpaid', limit: 100 },
    });
    const unpaidGroup = unpaidRes.data.data.groups.find((g: any) => g.fileId === fileId);
    expect(unpaidGroup).toBeTruthy();
    expect(unpaidGroup.installments.length).toBe(1);
    expect(unpaidGroup.installments[0].status).toBe('Unpaid');

    // Filtering to status=Cancelled should hide the group entirely - no row
    // in it is Cancelled.
    const cancelledRes = await api.get('/installment/grouped', {
      params: { status: 'Cancelled', limit: 100 },
    });
    const cancelledGroup = cancelledRes.data.data.groups.find((g: any) => g.fileId === fileId);
    expect(cancelledGroup).toBeUndefined();
  });

  test('search matches file/member/plot and returns the whole group, not just the matching row', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const plotNo = uniq('SRCHPLOT').slice(0, 20);
    const fileId = await bookFileWithTwoRowPlan(api, fx, tracker, 60000, plotNo);

    // Search by plot number, which lives on Plot, not on either installment row.
    const res = await api.get('/installment/grouped', {
      params: { search: plotNo, limit: 100 },
    });
    expect(res.status).toBe(200);
    const group = res.data.data.groups.find((g: any) => g.fileId === fileId);
    expect(group).toBeTruthy();
    // Whole group returned, both rows, even though neither row's own fields
    // contain the plot number.
    expect(group.installments.length).toBe(2);

    // Search by member name (partial, case-insensitive).
    const byMember = await api.get('/installment/grouped', {
      params: { search: fx.memberId ? 'ayesha' : '', limit: 100 },
    });
    expect(byMember.status).toBe(200);
    expect(
      byMember.data.data.groups.some((g: any) => g.fileId === fileId)
    ).toBe(true);

    // A term that matches nothing returns no groups at all.
    const noMatch = await api.get('/installment/grouped', {
      params: { search: 'zzz_definitely_not_a_real_match_zzz', limit: 100 },
    });
    expect(noMatch.data.data.groups.length).toBe(0);
  });
});
