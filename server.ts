import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { fetchSeoulSchools, fetchSchoolDetail, School } from './server/schoolinfo';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory cache for schools list
let cachedSchoolsData: {
  timestamp: number;
  data: {
    schools: School[];
    totalDistricts: number;
    successCount: number;
    failedDistricts: string[];
    totalCount: number;
    locatedCount: number;
    unlocatedCount: number;
  };
} | null = null;

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes cache

/**
 * GET /api/schools
 * Returns Seoul high schools across 25 districts
 */
app.get('/api/schools', async (req, res) => {
  const apiKey = process.env.SCHOOLINFO_API_KEY?.trim();

  // Rule 6.3: If SCHOOLINFO_API_KEY is missing, return 503
  if (!apiKey) {
    return res.status(503).json({ error: 'SCHOOLINFO_API_KEY_MISSING' });
  }

  const forceRefresh = req.query.refresh === 'true';
  const now = Date.now();

  if (!forceRefresh && cachedSchoolsData && now - cachedSchoolsData.timestamp < CACHE_TTL_MS) {
    return res.json(cachedSchoolsData.data);
  }

  try {
    const result = await fetchSeoulSchools(apiKey);
    cachedSchoolsData = {
      timestamp: now,
      data: result,
    };
    return res.json(result);
  } catch (error: any) {
    console.error('Failed to fetch school list from SchoolInfo API:', error?.message || error);
    return res.status(502).json({
      error: 'SCHOOLINFO_FETCH_FAILED',
      message: '학교알리미 API 연결 중 오류가 발생했습니다.',
    });
  }
});

/**
 * GET /api/schools/:code
 * Returns detailed disclosure data for a specific school
 */
app.get('/api/schools/:code', async (req, res) => {
  const apiKey = process.env.SCHOOLINFO_API_KEY?.trim();
  const schoolCode = req.params.code;

  if (!apiKey) {
    return res.status(503).json({ error: 'SCHOOLINFO_API_KEY_MISSING' });
  }

  if (!schoolCode) {
    return res.status(400).json({ error: 'INVALID_SCHOOL_CODE' });
  }

  try {
    const detail = await fetchSchoolDetail(schoolCode, apiKey);
    return res.json({ success: true, detail });
  } catch (error: any) {
    console.error(`Failed to fetch detail for school ${schoolCode}:`, error?.message || error);
    return res.status(502).json({
      error: 'DETAIL_FETCH_FAILED',
      message: '학교 상세정보를 불러오지 못했습니다.',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Server startup error:', err);
  process.exit(1);
});
