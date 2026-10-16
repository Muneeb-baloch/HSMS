import { getClient, makeTracker, uniq } from './helpers';

describe('User-friendly error responses', () => {
  const tracker = makeTracker();

  afterAll(async () => {
    await tracker.cleanupAll();
  });

  test('a duplicate transfer type name returns 409 with a clear message, not a raw 500', async () => {
    const api = await getClient();

    const typeName = uniq('Smoke Duplicate Type ');

    const firstRes = await api.post('/transfertype', {
      typeName,
      description: 'Smoke test transfer type',
      transferFee: 5000,
    });
    expect(firstRes.status).toBe(201);
    tracker.track('transfertype', firstRes.data.data._id);

    const secondRes = await api.post('/transfertype', {
      typeName,
      description: 'Duplicate attempt',
      transferFee: 6000,
    });

    expect(secondRes.status).toBe(409);
    expect(secondRes.data.success).toBe(false);
    expect(secondRes.data.error).toMatch(/already exists/i);
  });

  test('an unexpected server-side error still returns a clean JSON error, not a raw crash', async () => {
    const api = await getClient();

    // GET /application/:id has no isMongoId() validation in front of it, so
    // a malformed ObjectId reaches Application.findById() uncaught and
    // throws a genuine Mongoose CastError - exactly the "unknown error"
    // case the error middleware's bottom fallback exists for. This pins
    // that fallback to a clean { success: false, error: 'Internal server
    // error' } body instead of an unhandled crash or a leaked stack dump.
    const res = await api.get('/application/not-a-valid-object-id');

    expect(res.status).toBe(500);
    expect(res.data.success).toBe(false);
    expect(typeof res.data.error).toBe('string');
    expect(res.data.error.length).toBeGreaterThan(0);
    expect(res.data.error).not.toMatch(/cast to objectid failed/i);
  });
});
