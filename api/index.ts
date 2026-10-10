import app from '../server.js';
import { connectDB } from '../server/db/connection.js';

export default async function (req: any, res: any) {
  await connectDB();
  return app(req, res);
}
