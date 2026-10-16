import { getBaseFixtures, getClient, makeTracker, uniq } from './helpers';

describe('Project → PlotBlock → PlotSize → Plot hierarchy', () => {
  const tracker = makeTracker();

  afterAll(async () => {
    await tracker.cleanupAll();
  });

  test('auth login works', async () => {
    const api = await getClient();
    const res = await api.get('/projects', { params: { limit: 1 } });
    expect(res.status).toBe(200);
  });

  test('create project: areaBase computed, allocatedBase starts at 0', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const res = await api.post('/projects', {
      projName: uniq('Smoke Project '),
      projCode: uniq('SMK').toUpperCase().slice(0, 15),
      projLocation: 'Smoke Test Location',
      projPrefix: 'SMK',
      totalArea: 100,
      areaUnit: 'acre',
      launchDate: new Date('2024-01-01').toISOString(),
      cityId: fx.cityId,
      societyId: fx.societyId,
    });

    expect(res.status).toBe(201);
    tracker.track('projects', res.data.data._id);

    // 100 acres * 43560 sqft/acre = 4,356,000
    expect(Number(res.data.data.areaBase?.$numberDecimal ?? res.data.data.areaBase)).toBeCloseTo(
      4356000,
      0
    );
    expect(Number(res.data.data.allocatedBase?.$numberDecimal ?? res.data.data.allocatedBase)).toBe(0);
  });

  test('create plot block: rejected when exceeding project capacity', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const projRes = await api.post('/projects', {
      projName: uniq('Smoke Capacity Project '),
      projCode: uniq('CAP').toUpperCase().slice(0, 15),
      projLocation: 'Smoke Test',
      projPrefix: 'CAP',
      totalArea: 10,
      areaUnit: 'acre',
      launchDate: new Date('2024-01-01').toISOString(),
      cityId: fx.cityId,
      societyId: fx.societyId,
    });
    expect(projRes.status).toBe(201);
    const projectId = projRes.data.data._id;
    tracker.track('projects', projectId);

    const res = await api.post('/plotblocks', {
      projectId,
      plotBlockName: uniq('OverCap Block '),
      blockTotalArea: 100, // exceeds the project's 10 acres
      blockAreaUnit: 'acre',
    });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  test('create plot block: succeeds within capacity', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const res = await api.post('/plotblocks', {
      projectId: fx.projectId,
      plotBlockName: uniq('Smoke Block '),
      blockTotalArea: 2,
      blockAreaUnit: 'kanal',
    });

    expect(res.status).toBe(201);
    tracker.track('plotblocks', res.data.data._id);
  });

  describe('PlotSize standardBasePrice recalculation', () => {
    const cases: Array<['omitted' | 'null' | 'wrong', any]> = [
      ['omitted', undefined],
      ['null', null],
      ['wrong', 999999999],
    ];

    for (const [label, value] of cases) {
      test(`standardBasePrice ${label} -> recalculated to totalArea(sqft) * ratePerUnit/sqft`, async () => {
        const api = await getClient();
        const fx = await getBaseFixtures();

        const body: any = {
          plotSizeName: uniq(`Smoke Size ${label} `),
          projectId: fx.projectId,
          sizeLength: 25,
          sizeWidth: 45,
          totalArea: 5,
          areaUnit: 'marla',
          ratePerUnit: 1000, // rate per totalArea unit (no sqft conversion applied here)
        };
        if (value !== undefined) body.standardBasePrice = value;

        const res = await api.post('/plotsizes', body);
        expect(res.status).toBe(201);
        tracker.track('plotsizes', res.data.data._id);

        // standardBasePrice = totalArea * ratePerUnit = 5 * 1000
        expect(res.data.data.standardBasePrice).toBe(5000);
      });
    }
  });

  describe('Plot plotArea / plotTotalAmount recalculation', () => {
    const cases: Array<['omitted' | 'null' | 'wrong', any]> = [
      ['omitted', undefined],
      ['null', null],
      ['wrong', 999999999],
    ];

    for (const [label, value] of cases) {
      test(`plotArea/plotTotalAmount ${label} -> recalculated from length*width and basePrice+surcharge-discount`, async () => {
        const api = await getClient();
        const fx = await getBaseFixtures();

        const sizeRes = await api.post('/plotsizes', {
          plotSizeName: uniq(`Smoke Plot Size ${label} `),
          projectId: fx.projectId,
          sizeLength: 25,
          sizeWidth: 45,
          totalArea: 5,
          areaUnit: 'marla',
          ratePerUnit: 500,
        });
        expect(sizeRes.status).toBe(201);
        tracker.track('plotsizes', sizeRes.data.data._id);

        const body: any = {
          projectId: fx.projectId,
          societyId: fx.societyId,
          plotNo: uniq(`SMK-${label}-`).slice(0, 20),
          plotBlockId: fx.blockId,
          plotSizeId: sizeRes.data.data._id,
          plotType: 'residential',
          plotCategoryId: fx.plotCategoryStandardId,
          salesStatusId: fx.salesStatusAvailableId,
          plotLength: 30,
          plotWidth: 40,
          plotBasePrice: 500000,
          surchargeAmount: 0,
          discountAmount: 0,
        };
        if (value !== undefined) {
          body.plotArea = value;
          body.plotTotalAmount = value;
        }

        const res = await api.post('/plots', body);
        expect(res.status).toBe(201);
        tracker.track('plots', res.data.data._id);

        expect(res.data.data.plotArea).toBe(1200); // 30 * 40
        expect(res.data.data.plotTotalAmount).toBe(500000); // base + 0 - 0
      });
    }
  });

  test('create plot: rejected when exceeding plot block remaining capacity', async () => {
    const api = await getClient();
    const fx = await getBaseFixtures();

    const tinyBlockRes = await api.post('/plotblocks', {
      projectId: fx.projectId,
      plotBlockName: uniq('Tiny Block '),
      blockTotalArea: 1,
      blockAreaUnit: 'marla', // 225 sqft total
    });
    expect(tinyBlockRes.status).toBe(201);
    const tinyBlockId = tinyBlockRes.data.data._id;
    tracker.track('plotblocks', tinyBlockId);

    const sizeRes = await api.post('/plotsizes', {
      plotSizeName: uniq('Tiny Block Size '),
      projectId: fx.projectId,
      sizeLength: 50,
      sizeWidth: 90,
      totalArea: 10,
      areaUnit: 'marla',
      ratePerUnit: 100,
    });
    expect(sizeRes.status).toBe(201);
    tracker.track('plotsizes', sizeRes.data.data._id);

    const res = await api.post('/plots', {
      projectId: fx.projectId,
      societyId: fx.societyId,
      plotNo: uniq('BIG-'),
      plotBlockId: tinyBlockId,
      plotSizeId: sizeRes.data.data._id,
      plotType: 'residential',
      plotCategoryId: fx.plotCategoryStandardId,
      salesStatusId: fx.salesStatusAvailableId,
      plotLength: 100, // 100x100 = 10,000 sqft, way over the 225 sqft block
      plotWidth: 100,
      plotBasePrice: 500000,
    });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
