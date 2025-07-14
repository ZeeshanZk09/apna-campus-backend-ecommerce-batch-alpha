import dotenv from 'dotenv';
dotenv.config({
  path: './.env.local',
  override: true,
  quiet: true,
});

const PORT = process.env.PORT || 3000;
const API_ROUTE = '/api/v1';
const DB_NAME = 'e-commerce-project';
const MONGODB_URI = process.env.MONGODB_URI;
export { PORT, API_ROUTE, MONGODB_URI, DB_NAME };
