import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import mongoose from '../../backend/node_modules/mongoose/index.js';
import dotenv from '../../backend/node_modules/dotenv/lib/main.js';
import app from '../../backend/src/app.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../backend/.env') });

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/weathergpt';

let server = null;
let serverUrl = '';

export async function startTestServer() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }

  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      serverUrl = `http://localhost:${port}`;
      resolve({ server, serverUrl });
    });
  });
}

export async function stopTestServer() {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
    server = null;
  }
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

export async function setupTestServer() {
  const { serverUrl: baseUrl } = await startTestServer();
  return {
    baseUrl,
    cleanup: async () => {
      await stopTestServer();
    }
  };
}

export { serverUrl };
