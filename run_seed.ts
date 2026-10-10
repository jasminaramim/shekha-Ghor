import { connectDB } from './server/db/connection.js';
import { seedDatabase } from './server/db/seed.js';

async function run() {
  const connected = await connectDB();
  if (connected) {
    await seedDatabase();
    console.log('Seeding completed manually.');
    process.exit(0);
  } else {
    console.error('Failed to connect to DB.');
    process.exit(1);
  }
}
run();
