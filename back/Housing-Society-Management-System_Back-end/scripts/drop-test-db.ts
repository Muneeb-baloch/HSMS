import mongoose from 'mongoose';

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not set');
  }
  if (!/\/hsms_test(\?|$)/.test(uri)) {
    throw new Error(`Refusing to drop a database that is not hsms_test: ${uri}`);
  }

  await mongoose.connect(uri);
  await mongoose.connection.dropDatabase();
  console.log(`Dropped database: ${mongoose.connection.name}`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
