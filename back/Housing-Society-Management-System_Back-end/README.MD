# Install required dependencies
pnpm add ioredis diskusage
pnpm add -D @types/ioredis @types/diskusage

# Start the server
pnpm dev

# Test health endpoints
curl http://localhost:3000/ping
curl http://localhost:3000/health
curl http://localhost:3000/health/ready
curl http://localhost:3000/health/live
curl http://localhost:3000/health/metrics
curl http://localhost:3000/health/version
curl http://localhost:3000/health/database

# Database maintenance

## Sync MongoDB indexes
pnpm run sync-indexes

Since `autoIndex` is disabled in development, run this command after adding or modifying schema indexes to build them in the database. This ensures indexes defined in model schemas are actually created.

## Available scripts
- `pnpm dev` - Start development server with TypeScript compilation
- `pnpm dev:watch` - Start with file watching (tsx watch)
- `pnpm build` - Compile TypeScript to JavaScript
- `pnpm sync-indexes` - Sync all MongoDB indexes defined in schemas
- `pnpm lint` - Run ESLint checks
- `pnpm lint:fix` - Fix ESLint issues
- `pnpm format` - Format code with Prettier
- `pnpm type-check` - Check TypeScript types without emitting
- `pnpm test` - Run Jest tests
