import { getBaseFixtures, getClient, makeTracker, uniq } from './helpers';

async function createCategory(api: any, kind: string) {
  const res = await api.post('/installmentcategory', {
    instCatName: uniq(`Possession Rules InstCat ${kind} `),
    kind,
    isRefundable: false,
    isMandatory: true,
    sequenceOrder: Math.floor(Math.random() * 100000) + 250000,
    isActive: true,
  });
  if (res.status !== 201) {
    throw new Error(`Failed to create installment category: ${res.status} ${JSON.stringify(res.data)}`);
  }
  return res.data.data._id as string;
}

async function bookFile(api: any, fx: any, tracker: any, contractPrice: number) {
  const sizeRes = await api.post('/plotsizes', {
    plotSizeName: uniq('Possession Rules Size '),
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
    plotNo: uniq('PR-').slice(0, 20),
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
  const plotId = plotRes.data.data._id as string;

  const catId = await createCategory(api, 'installment');

  const planRes = await api.post('/installment-plans', {
    projId: fx.projectId,
    planName: uniq('Possession Rules Plan '),
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
    plotId,
    paymentMode: 'Cash',
    bookingDate: new Date().toISOString(),
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

async function getCsrId(api: any) {
  const usersRes = await api.get('/v1/users/users', { params: { limit: 1 } });
  const csrId = usersRes.data?.data?.users?.[0]?.id;
  expect(csrId).toBeTruthy();
  return csrId as string;
}

describe('Possession business rules', () => {
  const tracker = makeTracker();

  afterAll(async () => {
    await tracker.cleanupAll();
  });

  test('blocks creation when the file has outstanding dues', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const { fileId } = await bookFile(api, fx, tracker, 100000);
    const csrId = await getCsrId(api);

    const res = await api.post('/possession', {
      fileId,
      possessionInitDate: new Date().toISOString(),
      possessionHandoverCSR: csrId,
    });

    expect(res.status).toBe(400);
    expect(res.data.error).toMatch(/outstanding/i);
  });

  test('blocks creation when the plot is not possession-ready', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const { fileId, plotId: _plotId } = await bookFile(api, fx, tracker, 100000);
    await payOffFileInFull(api, fileId, 100000);
    const csrId = await getCsrId(api);

    const res = await api.post('/possession', {
      fileId,
      possessionInitDate: new Date().toISOString(),
      possessionHandoverCSR: csrId,
    });

    expect(res.status).toBe(400);
    expect(res.data.error).toMatch(/possession-ready/i);
  });

  test('blocks creation when the file status is Cancelled', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const { fileId } = await bookFile(api, fx, tracker, 100000);
    const csrId = await getCsrId(api);

    const cancelRes = await api.put(`/file/${fileId}`, { status: 'Cancelled' });
    expect(cancelRes.status).toBe(200);

    const res = await api.post('/possession', {
      fileId,
      possessionInitDate: new Date().toISOString(),
      possessionHandoverCSR: csrId,
    });

    expect(res.status).toBe(400);
    expect(res.data.error).toMatch(/blocked/i);
  });

  test('blocks creation when the file has a pending transfer', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const { fileId } = await bookFile(api, fx, tracker, 100000);
    await payOffFileInFull(api, fileId, 100000);
    const csrId = await getCsrId(api);

    const transferTypeRes = await api.post('/transfertype', {
      typeName: uniq('Possession Blocker Type '),
      description: 'Smoke test transfer type',
      transferFee: 1000,
      isActive: true,
    });
    expect(transferTypeRes.status).toBe(201);
    tracker.track('transfertype', transferTypeRes.data.data._id);

    const transferRes = await api.post('/transfer', {
      fileId,
      transferTypeId: transferTypeRes.data.data._id,
      sellerMemId: fx.memberId,
      buyerMemId: fx.memberId2,
      transferInitDate: new Date().toISOString(),
    });
    expect(transferRes.status).toBe(201);
    tracker.track('transfer', transferRes.data.data._id ?? transferRes.data.data.id);

    const res = await api.post('/possession', {
      fileId,
      possessionInitDate: new Date().toISOString(),
      possessionHandoverCSR: csrId,
    });

    expect(res.status).toBe(400);
    expect(res.data.error).toMatch(/pending transfer/i);
  });

  test('derives the plot from the file and ignores a client-supplied plotId', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const { fileId, plotId } = await bookFile(api, fx, tracker, 100000);
    await payOffFileInFull(api, fileId, 100000);
    await markPlotPossessionReady(api, fileId, plotId);
    const csrId = await getCsrId(api);

    // A second, unrelated file+plot - its plotId must be ignored.
    const { plotId: otherPlotId } = await bookFile(api, fx, tracker, 50000);

    const res = await api.post('/possession', {
      fileId,
      plotId: otherPlotId,
      possessionInitDate: new Date().toISOString(),
      possessionHandoverCSR: csrId,
    });

    expect(res.status).toBe(201);
    tracker.track('possession', res.data.data._id ?? res.data.data.id);

    const returnedPlotId = res.data.data.plotId?._id ?? res.data.data.plotId;
    expect(String(returnedPlotId)).toBe(plotId);
    expect(String(returnedPlotId)).not.toBe(otherPlotId);
  });

  test('happy path: creates a possession once fully paid and the plot is possession-ready', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const { fileId, plotId } = await bookFile(api, fx, tracker, 100000);
    await payOffFileInFull(api, fileId, 100000);
    await markPlotPossessionReady(api, fileId, plotId);
    const csrId = await getCsrId(api);

    const res = await api.post('/possession', {
      fileId,
      possessionInitDate: new Date().toISOString(),
      possessionHandoverCSR: csrId,
      possessionRemarks: 'Smoke test happy path',
    });

    expect(res.status).toBe(201);
    expect(res.data.data.possessionCode).toBeTruthy();
    expect(res.data.data.possessionStatus).toBe('requested');
    tracker.track('possession', res.data.data._id ?? res.data.data.id);
  });

  test('blocks a second active possession request on the same plot', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const { fileId, plotId } = await bookFile(api, fx, tracker, 100000);
    await payOffFileInFull(api, fileId, 100000);
    await markPlotPossessionReady(api, fileId, plotId);
    const csrId = await getCsrId(api);

    const firstRes = await api.post('/possession', {
      fileId,
      possessionInitDate: new Date().toISOString(),
      possessionHandoverCSR: csrId,
    });
    expect(firstRes.status).toBe(201);
    tracker.track('possession', firstRes.data.data._id ?? firstRes.data.data.id);

    const secondRes = await api.post('/possession', {
      fileId,
      possessionInitDate: new Date().toISOString(),
      possessionHandoverCSR: csrId,
    });

    expect(secondRes.status).toBe(409);
    expect(secondRes.data.error).toMatch(/active possession request/i);
  });
});
