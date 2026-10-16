import { getBaseFixtures, getClient, makeTracker, uniq } from './helpers';

async function createCategory(api: any, kind: string) {
  const res = await api.post('/installmentcategory', {
    instCatName: uniq(`BugFix InstCat ${kind} `),
    kind,
    isRefundable: false,
    isMandatory: true,
    sequenceOrder: Math.floor(Math.random() * 100000) + 70000,
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
  opts: { contractPrice: number; occurrence: number }
) {
  const sizeRes = await api.post('/plotsizes', {
    plotSizeName: uniq('BugFix Size '),
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
    plotNo: uniq('BF-').slice(0, 20),
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
    planName: uniq('BugFix Plan '),
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

  return { fileId: fileRes.data.data._id as string, catId };
}

describe('Installment bug fixes: update guards, paidDate, member display, dashboard totals', () => {
  const tracker = makeTracker();

  afterAll(async () => {
    await tracker.cleanupAll();
  });

  describe('Bug 1: update endpoint rejects payment fields instead of silently ignoring them', () => {
    test('amountPaid in update body -> 400', async () => {
      const api = await getClient();
      const fx = await getBaseFixtures();
      const { fileId, catId } = await bookFileWithSingleRowPlan(api, fx, tracker, {
        contractPrice: 50000,
        occurrence: 1,
      });
      const listRes = await api.get(`/installment/file/${fileId}`);
      const installmentId = listRes.data.data[0].id ?? listRes.data.data[0]._id;

      const res = await api.put(`/installment/${installmentId}`, { amountPaid: 1000 });
      expect(res.status).toBe(400);
      expect(JSON.stringify(res.data)).toMatch(/amountPaid/i);
      expect(JSON.stringify(res.data)).toMatch(/record payment/i);

      void catId;
    });

    test('paidDate in update body -> 400', async () => {
      const api = await getClient();
      const fx = await getBaseFixtures();
      const { fileId } = await bookFileWithSingleRowPlan(api, fx, tracker, {
        contractPrice: 50000,
        occurrence: 1,
      });
      const listRes = await api.get(`/installment/file/${fileId}`);
      const installmentId = listRes.data.data[0].id ?? listRes.data.data[0]._id;

      const res = await api.put(`/installment/${installmentId}`, {
        paidDate: new Date().toISOString(),
      });
      expect(res.status).toBe(400);
      expect(JSON.stringify(res.data)).toMatch(/paidDate/i);
    });

    test('status=Paid in update body -> 400 (payment-derived status not settable directly)', async () => {
      const api = await getClient();
      const fx = await getBaseFixtures();
      const { fileId } = await bookFileWithSingleRowPlan(api, fx, tracker, {
        contractPrice: 50000,
        occurrence: 1,
      });
      const listRes = await api.get(`/installment/file/${fileId}`);
      const installmentId = listRes.data.data[0].id ?? listRes.data.data[0]._id;

      const res = await api.put(`/installment/${installmentId}`, { status: 'Paid' });
      expect(res.status).toBe(400);
      expect(JSON.stringify(res.data)).toMatch(/status/i);
    });

    test('status=Cancelled in update body -> allowed (administrative state)', async () => {
      const api = await getClient();
      const fx = await getBaseFixtures();
      const { fileId } = await bookFileWithSingleRowPlan(api, fx, tracker, {
        contractPrice: 50000,
        occurrence: 1,
      });
      const listRes = await api.get(`/installment/file/${fileId}`);
      const installmentId = listRes.data.data[0].id ?? listRes.data.data[0]._id;

      const res = await api.put(`/installment/${installmentId}`, { status: 'Cancelled' });
      expect(res.status).toBe(200);
      expect(res.data.data.status).toBe('Cancelled');
    });
  });

  describe('Bug 3: paidDate must stay empty until a payment is recorded', () => {
    test('creating an installment with an explicit paidDate does not persist it', async () => {
      const api = await getClient();
      const fx = await getBaseFixtures();
      const { fileId, catId } = await bookFileWithSingleRowPlan(api, fx, tracker, {
        contractPrice: 50000,
        occurrence: 50, // keep clear of installmentNo used elsewhere
      });

      const res = await api.post('/installment', {
        fileId,
        installmentCategoryId: catId,
        installmentNo: 77,
        installmentTitle: 'Attack: client-sent paidDate at creation',
        installmentType: 'Monthly',
        dueDate: new Date().toISOString(),
        amountDue: 10000,
        paidDate: new Date().toISOString(), // must be ignored
      });

      expect(res.status).toBe(201);
      expect(res.data.data.status).toBe('Unpaid');
      expect(res.data.data.paidDate).toBeFalsy();
    });

    test('normal creation (no paidDate sent) also stays unset', async () => {
      const api = await getClient();
      const fx = await getBaseFixtures();
      const { fileId, catId } = await bookFileWithSingleRowPlan(api, fx, tracker, {
        contractPrice: 50000,
        occurrence: 51,
      });

      const res = await api.post('/installment', {
        fileId,
        installmentCategoryId: catId,
        installmentNo: 78,
        installmentTitle: 'Normal creation',
        installmentType: 'Monthly',
        dueDate: new Date().toISOString(),
        amountDue: 10000,
      });

      expect(res.status).toBe(201);
      expect(res.data.data.status).toBe('Unpaid');
      expect(res.data.data.paidDate).toBeFalsy();
    });
  });

  describe('Bug 2: member name is readable from the API response edit page relies on', () => {
    test('GET single installment includes populated member.memName (not memId)', async () => {
      const api = await getClient();
      const fx = await getBaseFixtures();
      const { fileId } = await bookFileWithSingleRowPlan(api, fx, tracker, {
        contractPrice: 50000,
        occurrence: 1,
      });
      const listRes = await api.get(`/installment/file/${fileId}`);
      const installmentId = listRes.data.data[0].id ?? listRes.data.data[0]._id;

      const res = await api.get(`/installment/${installmentId}`);
      expect(res.status).toBe(200);
      expect(res.data.data.member).toBeTruthy();
      expect(typeof res.data.data.member).toBe('object');
      expect(res.data.data.member.memName).toBeTruthy();
      // Confirms the field the old edit page read (memId) is not how member
      // data is actually shaped on this response - the bug was reading a
      // field that doesn't exist on this object.
      expect(res.data.data.memId).toBeUndefined();
    });
  });

  describe('Bug 4: dashboard "Total Outstanding" must match the ledger, not a stale balanceAmount', () => {
    test('totalOutstanding reflects live totalPayable - amountPaid, including after a partial payment', async () => {
      const api = await getClient();
      const fx = await getBaseFixtures();

      const before = await api.get('/installment/dashboard-summary');
      expect(before.status).toBe(200);
      const outstandingBefore = before.data.data.totalOutstanding;

      const { fileId } = await bookFileWithSingleRowPlan(api, fx, tracker, {
        contractPrice: 90000,
        occurrence: 1,
      });

      const afterCreate = await api.get('/installment/dashboard-summary');
      expect(afterCreate.data.data.totalOutstanding).toBe(outstandingBefore + 90000);

      const listRes = await api.get(`/installment/file/${fileId}`);
      const installmentId = listRes.data.data[0].id ?? listRes.data.data[0]._id;

      const payRes = await api.post(`/installment/${installmentId}/payment`, {
        amountPaid: 30000,
        paidDate: new Date().toISOString(),
        paymentMode: 'Cash',
      });
      expect(payRes.status).toBe(200);

      const afterPartialPay = await api.get('/installment/dashboard-summary');
      // 90000 - 30000 paid = 60000 remaining on this row, on top of whatever
      // was outstanding before this test started.
      expect(afterPartialPay.data.data.totalOutstanding).toBe(outstandingBefore + 60000);

      const fullPayRes = await api.post(`/installment/${installmentId}/payment`, {
        amountPaid: 60000,
        paidDate: new Date().toISOString(),
        paymentMode: 'Cash',
      });
      expect(fullPayRes.status).toBe(200);

      const afterFullPay = await api.get('/installment/dashboard-summary');
      expect(afterFullPay.data.data.totalOutstanding).toBe(outstandingBefore);
    });
  });
});
