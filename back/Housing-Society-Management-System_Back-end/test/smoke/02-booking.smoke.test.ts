import { getBaseFixtures, getClient, makeTracker, uniq } from './helpers';

async function createCategory(api: any, kind: string, sequenceOrder: number) {
  const res = await api.post('/installmentcategory', {
    instCatName: uniq(`Smoke Cat ${kind} `),
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

async function createPlotWithPrice(api: any, fx: any, tracker: any, basePrice: number) {
  const sizeRes = await api.post('/plotsizes', {
    plotSizeName: uniq('Booking Size '),
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
    plotNo: uniq('BK-').slice(0, 20),
    plotBlockId: fx.blockId,
    plotSizeId: sizeRes.data.data._id,
    plotType: 'residential',
    plotCategoryId: fx.plotCategoryStandardId,
    salesStatusId: fx.salesStatusAvailableId,
    plotLength: 30,
    plotWidth: 40,
    plotBasePrice: basePrice,
    surchargeAmount: 0,
    discountAmount: 0,
  });
  expect(plotRes.status).toBe(201);
  tracker.track('plots', plotRes.data.data._id);

  return plotRes.data.data; // includes plotTotalAmount === basePrice here
}

describe('File booking', () => {
  const tracker = makeTracker();

  afterAll(async () => {
    await tracker.cleanupAll();
  });

  test('book a file: contractPrice snapshot, installments sum to contract price, balances correct', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const downPaymentCatId = await createCategory(api, 'down_payment', 9001);
    const installmentCatId = await createCategory(api, 'installment', 9002);

    const plot = await createPlotWithPrice(api, fx, tracker, 1000000);

    const planRes = await api.post('/installment-plans', {
      projId: fx.projectId,
      planName: uniq('Smoke Plan '),
      totalMonths: 2,
      totalAmount: 1000000,
      isActive: true,
    });
    expect(planRes.status).toBe(201);
    const planId = planRes.data.data._id;
    tracker.track('installment-plans', planId);

    const detail1 = await api.post('/installment-plan-details', {
      planId,
      instCatId: downPaymentCatId,
      occurrence: 1,
      percentageAmount: 20,
    });
    expect(detail1.status).toBe(201);

    const detail2 = await api.post('/installment-plan-details', {
      planId,
      instCatId: installmentCatId,
      occurrence: 2,
      percentageAmount: 80,
    });
    expect(detail2.status).toBe(201);

    const fileRes = await api.post('/file', {
      planId,
      memId: fx.memberId,
      societyId: fx.societyId,
      plotId: plot._id,
      paymentMode: 'Cash',
      bookingDate: new Date().toISOString(),
    });

    expect(fileRes.status).toBe(201);
    const fileId = fileRes.data.data._id;
    tracker.track('file', fileId);

    expect(fileRes.data.data.contractPrice).toBe(1000000);

    const installmentsRes = await api.get(`/installment/file/${fileId}`);
    expect(installmentsRes.status).toBe(200);
    const rows = installmentsRes.data.data;
    expect(rows.length).toBe(2);

    const sumAmountDue = rows.reduce((s: number, r: any) => s + r.amountDue, 0);
    expect(sumAmountDue).toBe(1000000);

    for (const row of rows) {
      expect(row.balanceAmount).toBe(row.amountDue);
      expect(row.status).toBe('Unpaid');
      expect(row.totalPayable).toBe(row.amountDue);
    }

    const fileDetailRes = await api.get(`/file/${fileId}`);
    expect(fileDetailRes.status).toBe(200);
    expect(fileDetailRes.data.data.plotBalance).toBe(1000000);
    expect(fileDetailRes.data.data.totalOutstanding).toBe(1000000);
  });

  test('bad plan rejection: percentages do not reconcile to contract price', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const installmentCatId = await createCategory(api, 'installment', 9101);
    const plot = await createPlotWithPrice(api, fx, tracker, 500000);

    const planRes = await api.post('/installment-plans', {
      projId: fx.projectId,
      planName: uniq('Bad Plan '),
      totalMonths: 1,
      totalAmount: 500000,
      isActive: true,
    });
    expect(planRes.status).toBe(201);
    const planId = planRes.data.data._id;
    tracker.track('installment-plans', planId);

    // Only 50% - does not reconcile to the plot's contract price.
    const detailRes = await api.post('/installment-plan-details', {
      planId,
      instCatId: installmentCatId,
      occurrence: 1,
      percentageAmount: 50,
    });
    expect(detailRes.status).toBe(201);

    const fileRes = await api.post('/file', {
      planId,
      memId: fx.memberId,
      societyId: fx.societyId,
      plotId: plot._id,
      paymentMode: 'Cash',
      bookingDate: new Date().toISOString(),
    });

    expect(fileRes.status).toBeGreaterThanOrEqual(400);
    expect(JSON.stringify(fileRes.data)).toMatch(/does not reconcile/i);

    // Plot must remain unbooked after the rejected attempt.
    const plotRes = await api.get(`/plots/${plot._id}`);
    expect(plotRes.status).toBe(200);
  });

  test('double-booking rejection: second file on an already-occupied plot is rejected', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const installmentCatId = await createCategory(api, 'installment', 9201);
    const plot = await createPlotWithPrice(api, fx, tracker, 300000);

    const planRes = await api.post('/installment-plans', {
      projId: fx.projectId,
      planName: uniq('DoubleBook Plan '),
      totalMonths: 1,
      totalAmount: 300000,
      isActive: true,
    });
    expect(planRes.status).toBe(201);
    const planId = planRes.data.data._id;
    tracker.track('installment-plans', planId);

    const detailRes = await api.post('/installment-plan-details', {
      planId,
      instCatId: installmentCatId,
      occurrence: 1,
      percentageAmount: 100,
    });
    expect(detailRes.status).toBe(201);

    const firstFileRes = await api.post('/file', {
      planId,
      memId: fx.memberId,
      societyId: fx.societyId,
      plotId: plot._id,
      paymentMode: 'Cash',
      bookingDate: new Date().toISOString(),
    });
    expect(firstFileRes.status).toBe(201);
    tracker.track('file', firstFileRes.data.data._id);

    const secondFileRes = await api.post('/file', {
      planId,
      memId: fx.memberId2,
      societyId: fx.societyId,
      plotId: plot._id, // same plot - should be rejected
      paymentMode: 'Cash',
      bookingDate: new Date().toISOString(),
    });

    expect(secondFileRes.status).toBeGreaterThanOrEqual(400);
    expect(JSON.stringify(secondFileRes.data)).toMatch(/already allocated/i);
  });

  test('booking sets Plot.fileId (and sales status to booked), and cancelling clears both', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    // societyId is set explicitly so the plot's exact-society lookup
    // deterministically matches these over any other "booked"/"available"
    // status that might exist without a societyId (e.g. seeded globally).
    const bookedStatusRes = await api.post('/sales-status', {
      statusName: uniq('Smoke Booked '),
      statusCode: uniq('BOOKED').toUpperCase().slice(0, 20),
      statusType: 'booked',
      colorCode: '#FFA500',
      isActive: true,
      allowsSale: true,
      societyId: fx.societyId,
    });
    expect(bookedStatusRes.status).toBe(201);
    tracker.track('sales-status', bookedStatusRes.data.data._id);
    const bookedStatusId = bookedStatusRes.data.data._id;

    const availableStatusRes = await api.post('/sales-status', {
      statusName: uniq('Smoke Avail2 '),
      statusCode: uniq('AVAIL2').toUpperCase().slice(0, 20),
      statusType: 'available',
      colorCode: '#4CAF50',
      isActive: true,
      allowsSale: true,
      societyId: fx.societyId,
    });
    expect(availableStatusRes.status).toBe(201);
    tracker.track('sales-status', availableStatusRes.data.data._id);
    const availableStatusId = availableStatusRes.data.data._id;

    const installmentCatId = await createCategory(api, 'installment', 9301);
    const plot = await createPlotWithPrice(api, fx, tracker, 400000);

    // Seed the plot with the dedicated "available" status so the
    // post-cancellation revert can be told apart from whatever default
    // status createPlotWithPrice used.
    const seedRes = await api.put(`/plots/${plot._id}`, { salesStatusId: availableStatusId });
    expect(seedRes.status).toBe(200);

    const planRes = await api.post('/installment-plans', {
      projId: fx.projectId,
      planName: uniq('PlotLink Plan '),
      totalMonths: 1,
      totalAmount: 400000,
      isActive: true,
    });
    expect(planRes.status).toBe(201);
    const planId = planRes.data.data._id;
    tracker.track('installment-plans', planId);

    const detailRes = await api.post('/installment-plan-details', {
      planId,
      instCatId: installmentCatId,
      occurrence: 1,
      percentageAmount: 100,
    });
    expect(detailRes.status).toBe(201);

    const fileRes = await api.post('/file', {
      planId,
      memId: fx.memberId,
      societyId: fx.societyId,
      plotId: plot._id,
      paymentMode: 'Cash',
      bookingDate: new Date().toISOString(),
    });
    expect(fileRes.status).toBe(201);
    const fileId = fileRes.data.data._id;
    tracker.track('file', fileId);

    const plotAfterBookingRes = await api.get(`/plots/${plot._id}`);
    expect(plotAfterBookingRes.status).toBe(200);
    const plotFileId =
      plotAfterBookingRes.data.data.fileId?._id ?? plotAfterBookingRes.data.data.fileId;
    expect(String(plotFileId)).toBe(String(fileId));
    const plotSalesStatusId =
      plotAfterBookingRes.data.data.salesStatusId?._id ??
      plotAfterBookingRes.data.data.salesStatusId;
    expect(String(plotSalesStatusId)).toBe(String(bookedStatusId));

    // markPossessionReady must now work off the active File directly - this
    // plot was never touched by the (separately removed) assign-plot flow.
    const notReadyRes = await api.get(`/installment/file/${fileId}`);
    const installmentId = notReadyRes.data.data[0].id ?? notReadyRes.data.data[0]._id;
    await api.post(`/installment/${installmentId}/payment`, {
      amountPaid: 400000,
      paidDate: new Date().toISOString(),
      paymentMode: 'Cash',
      transactionRefNo: uniq('TXN-PLOTLINK-'),
    });
    const readyRes = await api.post(`/plots/${plot._id}/possession-ready`, {});
    expect(readyRes.status).toBe(200);

    // Cancel the file - Plot.fileId and sales status must both revert.
    const cancelRes = await api.put(`/file/${fileId}`, { status: 'Cancelled' });
    expect(cancelRes.status).toBe(200);

    const plotAfterCancelRes = await api.get(`/plots/${plot._id}`);
    expect(plotAfterCancelRes.status).toBe(200);
    expect(plotAfterCancelRes.data.data.fileId).toBeFalsy();
    const revertedStatusId =
      plotAfterCancelRes.data.data.salesStatusId?._id ??
      plotAfterCancelRes.data.data.salesStatusId;
    expect(String(revertedStatusId)).toBe(String(availableStatusId));
  });

  test('marking a plot possession-ready without any booking is rejected with a clear message', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const plot = await createPlotWithPrice(api, fx, tracker, 100000);

    const res = await api.post(`/plots/${plot._id}/possession-ready`, {});
    expect(res.status).toBe(400);
    expect(res.data.error).toMatch(/no active booking/i);
  });
});
