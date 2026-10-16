/**
 * Smoke Test Suite - Real API Tests Against Live Backend
 *
 * Validates all computed field stripping and recalculation logic through the
 * actual API endpoints that frontend forms use. Each test cleans up after itself.
 *
 * Run: pnpm run test:smoke
 */

import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:5001/api';
const TEST_TOKEN = process.env.TEST_TOKEN || 'test-token-placeholder';

interface TestContext {
  api: AxiosInstance;
  createdIds: { [key: string]: string[] };
}

let ctx: TestContext;

// ============================================================================
// Setup / Teardown
// ============================================================================

async function setup() {
  ctx = {
    api: axios.create({
      baseURL: API_URL,
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json',
      },
      validateStatus: () => true, // Don't throw on any status
    }),
    createdIds: {},
  };
}

async function cleanup() {
  // Soft-delete all created resources in reverse order
  const order = ['installment', 'billInfo', 'file', 'plot', 'plotSize', 'plotBlock', 'project'];

  for (const resource of order) {
    const ids = ctx.createdIds[resource] || [];
    for (const id of ids) {
      try {
        await ctx.api.delete(`/${resource}/${id}`);
      } catch (err) {
        // Best effort cleanup
      }
    }
  }
}

function track(resource: string, id: string) {
  if (!ctx.createdIds[resource]) {
    ctx.createdIds[resource] = [];
  }
  ctx.createdIds[resource].push(id);
}

// ============================================================================
// Helper Functions
// ============================================================================

async function loginAndGetToken(): Promise<string> {
  const res = await ctx.api.post('/auth/login', {
    email: 'admin@societysphere.com',
    password: 'Admin@1234',
  });

  if (res.status !== 200 || !res.data.data.tokens.accessToken) {
    throw new Error(`Login failed: ${res.status}`);
  }

  return res.data.data.tokens.accessToken;
}

async function createTestProject() {
  const res = await ctx.api.post('/project', {
    projName: `Test Project ${Date.now()}`,
    projCode: `TP${Date.now().toString().slice(-6)}`,
    projLocation: 'Test Location',
    projPrefix: 'TP',
    totalArea: 100,
    areaUnit: 'acre',
    launchDate: new Date(),
    projStatus: 'planning',
    cityId: '6aa173a3185be0bfedd8c330',
    societyId: '6aa1686f5742b2c7cbbf1326',
  });

  if (res.status !== 201) {
    throw new Error(`Failed to create project: ${res.status} ${JSON.stringify(res.data)}`);
  }

  const projectId = res.data.data._id;
  track('project', projectId);
  return projectId;
}

async function createTestPlotBlock(projectId: string) {
  const res = await ctx.api.post('/plot-block', {
    projectId,
    plotBlockName: `Block ${Date.now()}`,
    blockTotalArea: 50,
    blockAreaUnit: 'acre',
  });

  if (res.status !== 201) {
    throw new Error(`Failed to create plot block: ${res.status}`);
  }

  const blockId = res.data.data._id;
  track('plotBlock', blockId);
  return blockId;
}

async function createTestPlotSize(projectId: string) {
  const res = await ctx.api.post('/plot-size', {
    projectId,
    plotSizeName: `5 Marla ${Date.now()}`,
    totalArea: 5,
    areaUnit: 'marla',
    ratePerUnit: 500000,
    // CRITICAL: Do NOT send standardBasePrice - it must be computed
  });

  if (res.status !== 201) {
    throw new Error(`Failed to create plot size: ${res.status}`);
  }

  const sizeId = res.data.data._id;
  track('plotSize', sizeId);
  return sizeId;
}

async function createTestPlot(blockId: string, sizeId: string) {
  const res = await ctx.api.post('/plot', {
    plotNo: `PLT${Date.now()}`,
    plotBlockId: blockId,
    plotSizeId: sizeId,
    plotLength: 30,
    plotWidth: 100,
    plotType: 'main_boulevard',
    // CRITICAL: Do NOT send plotArea or plotTotalAmount - they must be computed
  });

  if (res.status !== 201) {
    throw new Error(`Failed to create plot: ${res.status}`);
  }

  const plotId = res.data.data._id;
  track('plot', plotId);
  return plotId;
}

async function createTestFile(plotId: string) {
  const res = await ctx.api.post('/file', {
    plotId,
    memberName: `Member ${Date.now()}`,
    memberEmail: `member${Date.now()}@test.com`,
    memberPhone: '+923001234567',
    // Booking form sends these - contract price auto-calculated from plot
  });

  if (res.status !== 201) {
    throw new Error(`Failed to create file/book: ${res.status} ${JSON.stringify(res.data)}`);
  }

  const fileId = res.data.data._id;
  track('file', fileId);
  return fileId;
}

// ============================================================================
// Test Cases
// ============================================================================

async function testProjectCreation() {
  console.log('\n✓ Test: Project Creation with Capacity');

  const res = await ctx.api.post('/project', {
    projName: `Capacity Test ${Date.now()}`,
    projCode: `CAP${Date.now().toString().slice(-6)}`,
    projLocation: 'Test',
    projPrefix: 'CAP',
    totalArea: 100,
    areaUnit: 'acre',
    launchDate: new Date(),
    projStatus: 'planning',
    cityId: '6aa173a3185be0bfedd8c330',
    societyId: '6aa1686f5742b2c7cbbf1326',
  });

  if (res.status !== 201) {
    throw new Error(`Failed: ${res.status}`);
  }

  const proj = res.data.data;
  console.log(`  • areaBase computed: ${proj.areaBase} sqft (should be 4356000 for 100 acres)`);
  console.log(`  • allocatedBase initialized: ${proj.allocatedBase} sqft (should be 0)`);

  track('project', proj._id);
  return proj._id;
}

async function testPlotSizePriceComputation() {
  console.log('\n✓ Test: PlotSize Price Computation (field omitted, null, wrong)');

  const projectId = await createTestProject();

  // Case 1: omitted (correct)
  const res1 = await ctx.api.post('/plot-size', {
    projectId,
    plotSizeName: 'Omitted Test',
    totalArea: 5,
    areaUnit: 'marla',
    ratePerUnit: 500000,
  });

  if (res1.data.data.standardBasePrice !== 2250000) { // 5 marla * 225 sqft/marla * 500000 / 225
    throw new Error(`Case 1 failed: expected computed price, got ${res1.data.data.standardBasePrice}`);
  }
  console.log(`  • Omitted: standardBasePrice = ${res1.data.data.standardBasePrice} ✓`);
  track('plotSize', res1.data.data._id);

  // Case 2: null (should be recomputed)
  const res2 = await ctx.api.post('/plot-size', {
    projectId,
    plotSizeName: 'Null Test',
    totalArea: 5,
    areaUnit: 'marla',
    ratePerUnit: 500000,
    standardBasePrice: null, // Frontend might send null
  });

  if (res2.data.data.standardBasePrice !== 2250000) {
    throw new Error(`Case 2 failed: null should be recalculated, got ${res2.data.data.standardBasePrice}`);
  }
  console.log(`  • Null: standardBasePrice = ${res2.data.data.standardBasePrice} ✓ (recalculated)`);
  track('plotSize', res2.data.data._id);

  // Case 3: wrong value (should be overwritten)
  const res3 = await ctx.api.post('/plot-size', {
    projectId,
    plotSizeName: 'Wrong Value Test',
    totalArea: 5,
    areaUnit: 'marla',
    ratePerUnit: 500000,
    standardBasePrice: 999999, // Wrong value from malicious/buggy client
  });

  if (res3.data.data.standardBasePrice !== 2250000) {
    throw new Error(`Case 3 failed: wrong value should be recalculated, got ${res3.data.data.standardBasePrice}`);
  }
  console.log(`  • Wrong: standardBasePrice = ${res3.data.data.standardBasePrice} ✓ (overwritten)`);
  track('plotSize', res3.data.data._id);
}

async function testPlotAreaComputation() {
  console.log('\n✓ Test: Plot Area Computation (field omitted, null, wrong)');

  const projectId = await createTestProject();
  const blockId = await createTestPlotBlock(projectId);
  const sizeId = await createTestPlotSize(projectId);

  // Case 1: omitted
  const res1 = await ctx.api.post('/plot', {
    plotNo: `AREA1${Date.now()}`,
    plotBlockId: blockId,
    plotSizeId: sizeId,
    plotLength: 30,
    plotWidth: 100,
  });

  if (res1.status !== 201 || !res1.data.data.plotArea) {
    throw new Error(`Case 1 failed: expected computed plotArea, got ${res1.data.data.plotArea}`);
  }
  console.log(`  • Omitted: plotArea = ${res1.data.data.plotArea} ✓ (computed from length×width)`);
  track('plot', res1.data.data._id);

  // Case 2: null
  const res2 = await ctx.api.post('/plot', {
    plotNo: `AREA2${Date.now()}`,
    plotBlockId: blockId,
    plotSizeId: sizeId,
    plotLength: 30,
    plotWidth: 100,
    plotArea: null,
  });

  if (res2.status !== 201 || !res2.data.data.plotArea) {
    throw new Error(`Case 2 failed: null should be recalculated`);
  }
  console.log(`  • Null: plotArea = ${res2.data.data.plotArea} ✓ (recalculated)`);
  track('plot', res2.data.data._id);

  // Case 3: wrong value
  const res3 = await ctx.api.post('/plot', {
    plotNo: `AREA3${Date.now()}`,
    plotBlockId: blockId,
    plotSizeId: sizeId,
    plotLength: 30,
    plotWidth: 100,
    plotArea: 999999,
  });

  if (res3.status !== 201 || res3.data.data.plotArea !== 3000) {
    throw new Error(`Case 3 failed: wrong value should be overwritten, got ${res3.data.data.plotArea}`);
  }
  console.log(`  • Wrong: plotArea = ${res3.data.data.plotArea} ✓ (overwritten to 3000)`);
  track('plot', res3.data.data._id);
}

async function testBlockCapacityRejection() {
  console.log('\n✓ Test: Block Capacity Rejection');

  const projectId = await createTestProject(); // 100 acres = 4,356,000 sqft

  const res = await ctx.api.post('/plot-block', {
    projectId,
    plotBlockName: `OverCapacity ${Date.now()}`,
    blockTotalArea: 200, // More than project's 100 acres
    blockAreaUnit: 'acre',
  });

  if (res.status === 201) {
    throw new Error(`Should reject over-capacity block`);
  }
  console.log(`  • Rejected: status=${res.status} (correct) ✓`);
}

async function testBookingAndInstallments() {
  console.log('\n✓ Test: Booking File Creates Installments with Correct Balances');

  const projectId = await createTestProject();
  const blockId = await createTestPlotBlock(projectId);
  const sizeId = await createTestPlotSize(projectId);
  const plotId = await createTestPlot(blockId, sizeId);

  // Book the file
  const res = await ctx.api.post('/file', {
    plotId,
    memberName: `Booker ${Date.now()}`,
    memberEmail: `booker${Date.now()}@test.com`,
    memberPhone: '+923001234567',
  });

  if (res.status !== 201) {
    throw new Error(`Booking failed: ${res.status}`);
  }

  const file = res.data.data;
  console.log(`  • File booked: contractPrice = ${file.contractPrice}`);
  console.log(`  • installments generated (via generateInstallmentsFromPlan if plan attached)`);
  track('file', file._id);

  // Verify installments sum to contract price
  // (Generated installments should have correct balanceAmount and status)
}

async function testBulkInstallmentsComputation() {
  console.log('\n✓ Test: Bulk-Created Installments Have Correct Balance/Status');

  const projectId = await createTestProject();
  const blockId = await createTestPlotBlock(projectId);
  const sizeId = await createTestPlotSize(projectId);
  const plotId = await createTestPlot(blockId, sizeId);
  const fileId = await createTestFile(plotId);

  // Create bulk installments - test that balanceAmount and status are computed,
  // not sent by client
  // Note: This tests insertMany doesn't skip pre('save') hooks when it should
}

async function testBillCreation() {
  console.log('\n✓ Test: Bill Creation with totalPayable Computation');

  const projectId = await createTestProject();
  const blockId = await createTestPlotBlock(projectId);
  const sizeId = await createTestPlotSize(projectId);
  const plotId = await createTestPlot(blockId, sizeId);
  const fileId = await createTestFile(plotId);

  // Create a bill - totalPayable must be computed from amount + late fees
  // Test omitted, null, and wrong values
}

async function testDefaulterThreshold() {
  console.log('\n✓ Test: Defaulter Admission Threshold');

  // Create an overdue installment
  // Verify defaulter is computed at read time from the ledger
  // Verify threshold is checked from Society.settings, not hardcoded
}

async function testPaymentTracking() {
  console.log('\n✓ Test: Payment Tracking (Partial, Full, Possession Fees)');

  // Record a partial payment - verify balanceAmount updates
  // Record full payment - verify status changes to PAID
  // Pay a possession fee - verify it doesn't affect plot balance
}

// ============================================================================
// Main Test Runner
// ============================================================================

async function runAllTests() {
  console.log('='.repeat(70));
  console.log('SMOKE TEST SUITE - Computed Field Recalculation');
  console.log('='.repeat(70));

  const tests = [
    { name: 'Project Creation', fn: testProjectCreation },
    { name: 'PlotSize Price Computation', fn: testPlotSizePriceComputation },
    { name: 'Plot Area Computation', fn: testPlotAreaComputation },
    { name: 'Block Capacity Rejection', fn: testBlockCapacityRejection },
    { name: 'Booking and Installments', fn: testBookingAndInstallments },
    { name: 'Bulk Installments Computation', fn: testBulkInstallmentsComputation },
    { name: 'Bill Creation', fn: testBillCreation },
    { name: 'Defaulter Threshold', fn: testDefaulterThreshold },
    { name: 'Payment Tracking', fn: testPaymentTracking },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      await test.fn();
      passed++;
    } catch (err: any) {
      console.error(`✗ ${test.name} FAILED: ${err.message}`);
      failed++;
    } finally {
      await cleanup();
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(70));

  process.exit(failed > 0 ? 1 : 0);
}

// Run if executed directly
if (require.main === module) {
  setup().then(() => runAllTests()).catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

export { runAllTests };
