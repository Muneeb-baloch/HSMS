import axios, { AxiosInstance } from 'axios';
import fs from 'fs';
import os from 'os';
import path from 'path';

export const API_URL = process.env.SMOKE_API_URL || 'http://localhost:5002/api';

const TOKEN_FILE = path.join(os.tmpdir(), 'hsms-smoke-token.json');

let cachedClient: AxiosInstance | null = null;

export async function getClient(): Promise<AxiosInstance> {
  if (cachedClient) return cachedClient;

  // Jest isolates modules per test file, so this module-scoped cache only
  // dedupes calls within one file. The actual login happens exactly once
  // for the whole suite, in globalSetup.ts - read its token here instead of
  // calling /auth/login again (six files x their own login trips the auth
  // rate limiter).
  const { accessToken } = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf-8'));

  cachedClient = axios.create({
    baseURL: API_URL,
    headers: { Authorization: `Bearer ${accessToken}` },
    validateStatus: () => true,
  });

  return cachedClient;
}

export function uniq(prefix: string): string {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

// ---------------------------------------------------------------------------
// Fixture lookups seeded by SEED_ON_BOOT (seed-users.ts) - read-only, shared
// across all smoke tests. Never mutated/deleted by tests.
// ---------------------------------------------------------------------------

export interface BaseFixtures {
  societyId: string;
  cityId: string;
  projectId: string; // DHA5A
  blockId: string; // Block A
  plotCategoryStandardId: string;
  salesStatusAvailableId: string;
  memberId: string; // Ayesha Malik
  memberId2: string; // Zainab Hussain
}

let cachedFixtures: BaseFixtures | null = null;

export async function getBaseFixtures(): Promise<BaseFixtures> {
  if (cachedFixtures) return cachedFixtures;
  const api = await getClient();

  const projectsRes = await api.get('/projects', { params: { search: 'DHA5A', limit: 10 } });
  const projects = projectsRes.data?.data?.projects || [];
  const project = projects.find((p: any) => p.projCode === 'DHA5A') || projects[0];
  if (!project) throw new Error('Seeded project DHA5A not found - did SEED_ON_BOOT run?');

  const blocksRes = await api.get('/plotblocks', { params: { projectId: project._id, limit: 10 } });
  const block = (blocksRes.data?.data?.plotBlocks || [])[0];
  if (!block) throw new Error('Seeded plot block not found');

  // PlotCategory/SalesStatus are created fresh here rather than relying on
  // the legacy SEED_ON_BOOT seeder (seed-users.ts), which currently fails to
  // seed PlotSize/PlotCategory/SalesStatus (PlotSize model now requires
  // sizeLength/sizeWidth/projectId that the old seed script doesn't send) -
  // this smoke suite seeds exactly what it needs itself instead of depending
  // on that brittle path.
  const categoryRes = await api.post('/plotcategories', {
    categoryName: uniq('Smoke Standard '),
    categoryDesc: 'Smoke test category',
    isActive: true,
  });
  if (categoryRes.status !== 201) {
    throw new Error(`Failed to create fixture plot category: ${categoryRes.status} ${JSON.stringify(categoryRes.data)}`);
  }
  const standardCategory = categoryRes.data.data;

  const statusRes = await api.post('/sales-status', {
    statusName: uniq('Smoke Available '),
    statusCode: uniq('AVAIL').toUpperCase().slice(0, 20),
    statusType: 'available',
    colorCode: '#4CAF50',
    isActive: true,
    isDefault: false,
    sequence: 1,
    allowsSale: true,
    requiresApproval: false,
  });
  if (statusRes.status !== 201) {
    throw new Error(`Failed to create fixture sales status: ${statusRes.status} ${JSON.stringify(statusRes.data)}`);
  }
  const availableStatus = statusRes.data.data;

  const membersRes = await api.get('/members', { params: { search: 'Ayesha', limit: 10 } });
  const member = (membersRes.data?.data?.members || [])[0];
  if (!member) throw new Error('Seeded member "Ayesha Malik" not found');

  const members2Res = await api.get('/members', { params: { search: 'Zainab', limit: 10 } });
  const member2 = (members2Res.data?.data?.members || [])[0];
  if (!member2) throw new Error('Seeded member "Zainab Hussain" not found');

  cachedFixtures = {
    societyId: project.societyId,
    cityId: project.cityId?._id || project.cityId,
    projectId: project._id,
    blockId: block._id,
    plotCategoryStandardId: standardCategory._id,
    salesStatusAvailableId: availableStatus._id,
    memberId: member._id,
    memberId2: member2._id,
  };

  return cachedFixtures;
}

// ---------------------------------------------------------------------------
// Cleanup tracking - each test registers what it created, and calls
// cleanupAll() in a finally block so failures don't leak fixtures either.
// ---------------------------------------------------------------------------

export interface CreatedRef {
  resource: string; // API path segment, e.g. 'plots', 'file', 'installment'
  id: string;
}

export function makeTracker() {
  const created: CreatedRef[] = [];
  return {
    track(resource: string, id: string) {
      created.push({ resource, id });
    },
    async cleanupAll() {
      const api = await getClient();
      // Reverse order: children before parents.
      for (const ref of created.reverse()) {
        try {
          await api.delete(`/${ref.resource}/${ref.id}`);
        } catch {
          // best-effort
        }
      }
    },
  };
}
