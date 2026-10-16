import axios from 'axios';
import fs from 'fs';
import os from 'os';
import path from 'path';

const API_URL = process.env.SMOKE_API_URL || 'http://localhost:5002/api';
const TOKEN_FILE = path.join(os.tmpdir(), 'hsms-smoke-token.json');

// Jest isolates modules per test FILE, so a module-scoped token cache in
// helpers.ts only avoids repeat logins within one file, not across the
// whole suite - six files means six /auth/login calls, which trips the
// auth rate limiter. Logging in exactly once here, before any test file
// runs, and sharing the token via a tmp file fixes that.
export default async function globalSetup() {
  const res = await axios.post(
    `${API_URL}/auth/login`,
    { email: 'admin@societysphere.com', password: 'Admin@1234' },
    { validateStatus: () => true }
  );

  if (res.status !== 200 || !res.data?.data?.tokens?.accessToken) {
    throw new Error(`Smoke suite global login failed: ${res.status} ${JSON.stringify(res.data)}`);
  }

  fs.writeFileSync(TOKEN_FILE, JSON.stringify({ accessToken: res.data.data.tokens.accessToken }));
}

export { TOKEN_FILE };
