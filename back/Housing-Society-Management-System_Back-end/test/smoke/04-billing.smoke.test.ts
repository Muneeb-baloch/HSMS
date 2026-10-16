import { getBaseFixtures, getClient, makeTracker, uniq } from './helpers';

async function createCategory(api: any, kind: string) {
  const res = await api.post('/installmentcategory', {
    instCatName: uniq(`Bill Smoke InstCat ${kind} `),
    kind,
    isRefundable: false,
    isMandatory: true,
    sequenceOrder: Math.floor(Math.random() * 100000) + 50000,
    isActive: true,
  });
  if (res.status !== 201) {
    throw new Error(`Failed to create installment category: ${res.status} ${JSON.stringify(res.data)}`);
  }
  return res.data.data._id as string;
}

async function bookSimpleFile(api: any, fx: any, tracker: any, contractPrice: number) {
  const sizeRes = await api.post('/plotsizes', {
    plotSizeName: uniq('Bill Size '),
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
    plotNo: uniq('BL-').slice(0, 20),
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
    planName: uniq('Bill Plan '),
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
    billTypeName: uniq('Smoke Bill Type '),
    billTypeCategory: 'Utility',
    isRecurring: true,
    frequency: 'MONTHLY',
  });
  expect(res.status).toBe(201);
  tracker.track('billtype', res.data.data._id);
  return res.data.data._id as string;
}

describe('BillInfo: create, payments, duplicate rejection', () => {
  const tracker = makeTracker();

  afterAll(async () => {
    await tracker.cleanupAll();
  });

  describe('totalPayable recalculation', () => {
    const cases: Array<['omitted' | 'null' | 'wrong', any]> = [
      ['omitted', undefined],
      ['null', null],
      ['wrong', 1],
    ];

    for (const [label, value] of cases) {
      test(`totalPayable ${label} -> recalculated as billAmount+fineAmount+arrears`, async () => {
        const api = await getClient();
        const fx = await getBaseFixtures();

        const fileId = await bookSimpleFile(api, fx, tracker, 100000 + Math.floor(Math.random() * 1000));
        const billTypeId = await createBillType(api, tracker);

        const body: any = {
          fileId,
          memId: fx.memberId,
          societyId: fx.societyId,
          billTypeId,
          billMonth: 'January 2027',
          billAmount: 5000,
          fineAmount: 500,
          arrears: 1000,
          dueDate: new Date().toISOString(),
        };
        if (value !== undefined) body.totalPayable = value;

        const res = await api.post('/billinfo', body);
        expect(res.status).toBe(201);
        tracker.track('billinfo', res.data.data._id ?? res.data.data.id);

        expect(res.data.data.totalPayable).toBe(6500);
      });
    }
  });

  test('duplicate bill rejection: same fileId+billTypeId+billMonth twice', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const fileId = await bookSimpleFile(api, fx, tracker, 150000);
    const billTypeId = await createBillType(api, tracker);

    const body = {
      fileId,
      memId: fx.memberId,
      societyId: fx.societyId,
      billTypeId,
      billMonth: 'February 2027',
      billAmount: 3000,
      dueDate: new Date().toISOString(),
    };

    const first = await api.post('/billinfo', body);
    expect(first.status).toBe(201);
    tracker.track('billinfo', first.data.data._id ?? first.data.data.id);

    const second = await api.post('/billinfo', body);
    expect(second.status).toBeGreaterThanOrEqual(400);
  });

  test('partial then full bill payment updates status/remaining correctly', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const fileId = await bookSimpleFile(api, fx, tracker, 180000);
    const billTypeId = await createBillType(api, tracker);

    const createRes = await api.post('/billinfo', {
      fileId,
      memId: fx.memberId,
      societyId: fx.societyId,
      billTypeId,
      billMonth: 'March 2027',
      billAmount: 10000,
      dueDate: new Date().toISOString(),
    });
    expect(createRes.status).toBe(201);
    const billId = createRes.data.data._id ?? createRes.data.data.id;
    tracker.track('billinfo', billId);

    const partialRes = await api.post(`/billinfo/${billId}/record-payment`, {
      paymentAmount: 4000,
      paymentDate: new Date().toISOString(),
      paymentMethod: 'Cash',
    });
    expect(partialRes.status).toBe(200);
    expect(partialRes.data.data.status).toBe('Partially Paid');

    const fullRes = await api.post(`/billinfo/${billId}/record-payment`, {
      paymentAmount: 6000,
      paymentDate: new Date().toISOString(),
      paymentMethod: 'Cash',
    });
    expect(fullRes.status).toBe(200);
    expect(fullRes.data.data.status).toBe('Paid');
    expect(fullRes.data.data.amountPaid).toBe(10000);
  });
});
