import { getBaseFixtures, getClient, makeTracker, uniq } from './helpers';

async function createCategory(api: any, kind: string) {
  const res = await api.post('/installmentcategory', {
    instCatName: uniq(`Defaulter Smoke InstCat ${kind} `),
    kind,
    isRefundable: false,
    isMandatory: true,
    sequenceOrder: Math.floor(Math.random() * 100000) + 60000,
    isActive: true,
  });
  if (res.status !== 201) {
    throw new Error(`Failed to create installment category: ${res.status} ${JSON.stringify(res.data)}`);
  }
  return res.data.data._id as string;
}

async function bookSimpleFile(api: any, fx: any, tracker: any, contractPrice: number) {
  const sizeRes = await api.post('/plotsizes', {
    plotSizeName: uniq('Defaulter Size '),
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
    plotNo: uniq('DF-').slice(0, 20),
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
    planName: uniq('Defaulter Plan '),
    totalMonths: 1,
    totalAmount: contractPrice,
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

  // Booking date far enough in the past that the generated installment's due
  // date is also in the past (occurrence 1 == bookingDate itself for a
  // monthly plan), well beyond the default 30-day defaulter threshold.
  const bookingDate = new Date();
  bookingDate.setDate(bookingDate.getDate() - 45);

  const fileRes = await api.post('/file', {
    planId: planRes.data.data._id,
    memId: fx.memberId,
    societyId: fx.societyId,
    plotId: plotRes.data.data._id,
    paymentMode: 'Cash',
    bookingDate: bookingDate.toISOString(),
  });
  expect(fileRes.status).toBe(201);
  tracker.track('file', fileRes.data.data._id);

  return fileRes.data.data._id as string;
}

describe('Defaulter admission threshold', () => {
  const tracker = makeTracker();

  afterAll(async () => {
    await tracker.cleanupAll();
  });

  test('a file with an installment 45 days overdue is admitted as a defaulter', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const fileId = await bookSimpleFile(api, fx, tracker, 200000);

    const res = await api.get(`/defaulter/${fileId}`);
    expect(res.status).toBe(200);
    expect(res.data.data).not.toBeNull();
    expect(res.data.data.daysOverdue).toBeGreaterThanOrEqual(30);
    expect(res.data.data.totalOverdue).toBeGreaterThan(0);
  });

  test('a file with no overdue installments is not a defaulter', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const sizeRes = await api.post('/plotsizes', {
      plotSizeName: uniq('Fresh Size '),
      projectId: fx.projectId,
      sizeLength: 25,
      sizeWidth: 45,
      totalArea: 5,
      areaUnit: 'marla',
      ratePerUnit: 500,
    });
    tracker.track('plotsizes', sizeRes.data.data._id);

    const plotRes = await api.post('/plots', {
      projectId: fx.projectId,
      societyId: fx.societyId,
      plotNo: uniq('FR-').slice(0, 20),
      plotBlockId: fx.blockId,
      plotSizeId: sizeRes.data.data._id,
      plotType: 'residential',
      plotCategoryId: fx.plotCategoryStandardId,
      salesStatusId: fx.salesStatusAvailableId,
      plotLength: 30,
      plotWidth: 40,
      plotBasePrice: 100000,
    });
    tracker.track('plots', plotRes.data.data._id);

    const catId = await createCategory(api, 'installment');
    const planRes = await api.post('/installment-plans', {
      projId: fx.projectId,
      planName: uniq('Fresh Plan '),
      totalMonths: 1,
      totalAmount: 100000,
      isActive: true,
    });
    tracker.track('installment-plans', planRes.data.data._id);

    await api.post('/installment-plan-details', {
      planId: planRes.data.data._id,
      instCatId: catId,
      occurrence: 1,
      percentageAmount: 100,
    });

    // Booked today - due date not overdue at all.
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

    const res = await api.get(`/defaulter/${fileRes.data.data._id}`);
    // Not admitted to the defaulter list -> service throws "not currently a
    // defaulter", surfaced as an error response, not a 200 with null data.
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
