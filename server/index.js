import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const PORT = 3000;

const app = express();
app.use(cors());

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  followRegionRedirects: true,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const ts = () => new Date().toISOString();

// Demo-mode logging: the real AWS error is intentionally swallowed and
// replaced with a generic, unhelpful failure log.
function logCatFetchFailure() {
  console.error(`[${ts()}] ERROR Unexpected error while handling GET /api/cat`);
  console.error(
    'Error: upstream request failed (code: UNKNOWN)\n' +
      '    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)',
  );
}

app.get('/api/cat', async (_req, res) => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: process.env.AWS_CAT_IMAGE_KEY,
    });

    const response = await s3.send(command);
    const bytes = await response.Body.transformToByteArray();
    const base64 = Buffer.from(bytes).toString('base64');
    const contentType = response.ContentType || 'image/webp';

    res.json({ image: `data:${contentType};base64,${base64}` });
  } catch {
    logCatFetchFailure();

    res.status(502).json({
      error: 'BadGateway',
      message: 'Upstream request failed',
    });
  }
});

app.listen(PORT, () => {
  console.log(`🐱 Get a Cat API listening on http://localhost:${PORT}`);
});
