import mongoose from 'mongoose';
import Society from '../Society/models/models-society';
import Project from '../Project/models/models-project';
import PlotBlock from '../Plots/models/models-plotblock';
import PlotSize from '../Plots/models/models-plotsize';

const SOCIETY_CODE = 'DHA-ISB-P5';
const STATE_NAME = 'Punjab Pakistan';
const CITY_NAME = 'Bahawalpur';
const PROJ_CODE = 'DHA5BWP';

// 1 Marla = 225 sqft, matching the convention already used elsewhere in this codebase
// (seed-users.ts: 5 Marla = 1125 sqft, 10 Marla = 2250 sqft, 1 Kanal = 4500 sqft).
const PLOT_SIZE_DEFS = [
  { name: '5 Marla - DHA Bwp', marla: 5, sizeLength: 45, sizeWidth: 25 },
  { name: '7.5 Marla - DHA Bwp', marla: 7.5, sizeLength: 50, sizeWidth: 33.75 },
  { name: '10 Marla - DHA Bwp', marla: 10, sizeLength: 75, sizeWidth: 30 },
  { name: '1 Kanal - DHA Bwp', marla: 20, sizeLength: 90, sizeWidth: 50 },
];

const RATE_PER_SQFT = 2200; // PKR, Bahawalpur tier-2 city rate

const BLOCK_DEFS = [
  { name: 'Block A', desc: 'Residential block A', blockTotalArea: 150, blockAreaUnit: 'kanal' },
  { name: 'Block B', desc: 'Residential block B', blockTotalArea: 150, blockAreaUnit: 'kanal' },
];

async function seedCity(createdBy: mongoose.Types.ObjectId) {
  const State = mongoose.model('State');
  const City = mongoose.model('City');

  let state = await State.findOne({ stateName: STATE_NAME, isDeleted: false });
  if (!state) {
    state = await State.create({
      stateName: STATE_NAME,
      stateDescription: 'Province of Pakistan',
      createdBy,
      isDeleted: false,
    });
  }

  let city = await City.findOne({ cityName: CITY_NAME, isDeleted: false });
  if (!city) {
    city = await City.create({
      cityName: CITY_NAME,
      cityDescription: 'City in Punjab, Pakistan',
      stateId: state._id,
      createdBy,
      isDeleted: false,
    });
  }

  return city._id as mongoose.Types.ObjectId;
}

async function seedProject(
  societyId: mongoose.Types.ObjectId,
  cityId: mongoose.Types.ObjectId,
  createdBy: mongoose.Types.ObjectId,
): Promise<mongoose.Types.ObjectId> {
  const existing = await Project.findOne({ projCode: PROJ_CODE, isDeleted: false });
  if (existing) {
    return existing._id as mongoose.Types.ObjectId;
  }

  const project = await Project.create({
    projName: 'DHA Phase 5 Bwp',
    projCode: PROJ_CODE,
    projLocation: 'DHA Phase 5, Bahawalpur, Punjab',
    projPrefix: 'DHA5BWP',
    projDescription: 'Residential sector in DHA Phase 5, Bahawalpur',
    totalArea: 300,
    areaUnit: 'kanal',
    launchDate: new Date('2025-01-01'),
    projStatus: 'planning',
    projType: 'residential',
    isActive: true,
    address: 'DHA Phase 5, Bahawalpur',
    cityId,
    country: 'Pakistan',
    societyId,
    createdBy,
    isDeleted: false,
  });

  return project._id as mongoose.Types.ObjectId;
}

async function seedBlocks(
  projectId: mongoose.Types.ObjectId,
  societyId: mongoose.Types.ObjectId,
  createdBy: mongoose.Types.ObjectId,
): Promise<number> {
  let created = 0;
  for (const def of BLOCK_DEFS) {
    const existing = await PlotBlock.findOne({
      plotBlockName: def.name,
      projectId,
      isDeleted: false,
    });
    if (existing) continue;

    await PlotBlock.create({
      projectId,
      societyId,
      plotBlockName: def.name,
      plotBlockDesc: def.desc,
      blockTotalArea: def.blockTotalArea,
      blockAreaUnit: def.blockAreaUnit,
      createdBy,
      isDeleted: false,
    });
    created++;
  }
  return created;
}

async function seedPlotSizes(
  projectId: mongoose.Types.ObjectId,
  createdBy: mongoose.Types.ObjectId,
): Promise<number> {
  let created = 0;
  for (const def of PLOT_SIZE_DEFS) {
    const existing = await PlotSize.findOne({
      plotSizeName: def.name,
      projectId,
      isDeleted: false,
    });
    if (existing) continue;

    const totalArea = def.marla * 225;
    const standardBasePrice = parseFloat((totalArea * RATE_PER_SQFT).toFixed(2));

    await PlotSize.create({
      plotSizeName: def.name,
      projectId,
      sizeLength: def.sizeLength,
      sizeWidth: def.sizeWidth,
      totalArea,
      areaUnit: 'sqft',
      ratePerUnit: RATE_PER_SQFT,
      standardBasePrice,
      createdBy,
      isDeleted: false,
    });
    created++;
  }
  return created;
}

export async function seedDhaPhase5Bwp(createdBy: mongoose.Types.ObjectId): Promise<void> {
  const society = await Society.findOne({ societyCode: SOCIETY_CODE, isDeleted: false });
  if (!society) {
    console.warn(`[seed-dha-phase5-bwp] Society ${SOCIETY_CODE} not found, skipping`);
    return;
  }

  const cityId = await seedCity(createdBy);
  const projectId = await seedProject(society._id as mongoose.Types.ObjectId, cityId, createdBy);
  const blocksCreated = await seedBlocks(projectId, society._id as mongoose.Types.ObjectId, createdBy);
  const sizesCreated = await seedPlotSizes(projectId, createdBy);

  console.log(
    `[seed-dha-phase5-bwp] Project ready (${PROJ_CODE}), blocks created: ${blocksCreated}, plot sizes created: ${sizesCreated}`,
  );
}
