import dotenv from 'dotenv';
dotenv.config({
  path: './.env.local',
  override: true,
  quiet: true,
});

const PORT = process.env.PORT || 3000;
const API_ROUTE = '/api/v1';
const DB_NAME = 'e-commerce-project';
const MONGODB_URI = process.env.MONGODB_UR ?? 'mongodb://localhost:27017';
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'default_access_token_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'default_refresh_token_secret';
const NODE_ENV = process.env.NODE_ENV || 'development';
export {
  PORT,
  API_ROUTE,
  MONGODB_URI,
  DB_NAME,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  NODE_ENV,
};
