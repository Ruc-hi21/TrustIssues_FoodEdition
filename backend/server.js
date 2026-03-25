require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const vision = require('@google-cloud/vision');
const { Translate } = require('@google-cloud/translate').v2;
const Bull = require('bull');

const connectDB = require('./config/db');

// Route modules
const userProfileRoutes = require('./routes/userProfileRoutes');
const ingredientRoutes = require('./routes/ingredientRoutes');
const comparisonRoutes = require('./routes/comparisonRoutes');

// ─── App setup ────────────────────────────────────────────────
const app = express();
const port = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Set up Multer for form-data, using memory storage
const upload = multer({ storage: multer.memoryStorage() });

// ─── Google Cloud clients ─────────────────────────────────────
const visionClient = new vision.ImageAnnotatorClient();
const translateClient = new Translate();

// ─── Bull / Redis queue for async OCR ─────────────────────────
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const ocrQueue = new Bull('ocr-queue', redisUrl);

ocrQueue.process(async (job) => {
    try {
        const { imageBufferBase64 } = job.data;
        const buffer = Buffer.from(imageBufferBase64, 'base64');
        const [result] = await visionClient.textDetection(buffer);
        const detections = result.textAnnotations;
        return { detections };
    } catch (error) {
        console.error('Error processing OCR job:', error);
        throw error;
    }
});

// ─── Health check ─────────────────────────────────────────────
app.get('/', (req, res) => {
    res.send('TrustIssues Backend is running!');
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Mounted route modules ───────────────────────────────────
app.use('/api/profiles', userProfileRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/compare', comparisonRoutes);

// ─── Vision OCR endpoints (queue-based) ──────────────────────
app.post('/api/vision/analyze', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded.' });
        }
        const imageBufferBase64 = req.file.buffer.toString('base64');
        const job = await ocrQueue.add({ imageBufferBase64 });
        res.status(202).json({
            message: 'OCR job successfully enqueued',
            jobId: job.id,
        });
    } catch (error) {
        console.error('Error enqueuing image onto OCR queue:', error);
        res.status(500).json({ error: 'Failed to enqueue image for analysis' });
    }
});

app.get('/api/vision/analyze/:jobId', async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await ocrQueue.getJob(jobId);
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        const state = await job.getState();
        const result = job.returnvalue;
        const failedReason = job.failedReason;
        res.json({
            id: job.id,
            state,
            result: result || null,
            error: failedReason || null,
        });
    } catch (error) {
        console.error('Error fetching job status:', error);
        res.status(500).json({ error: 'Failed to fetch job status' });
    }
});

// ─── Translation endpoint ────────────────────────────────────
app.post('/api/translate', async (req, res) => {
    try {
        const { text, targetLanguage } = req.body;
        if (!text || !targetLanguage) {
            return res.status(400).json({ error: 'Missing text or targetLanguage in request body' });
        }
        let [translations] = await translateClient.translate(text, targetLanguage);
        translations = Array.isArray(translations) ? translations : [translations];
        res.json({ translations });
    } catch (error) {
        console.error('Error translating text:', error);
        res.status(500).json({ error: 'Failed to translate text' });
    }
});

// ─── Start server ─────────────────────────────────────────────
const startServer = async () => {
    await connectDB(); // connect to MongoDB first
    app.listen(port, () => {
        console.log(`Backend server listening on port ${port}`);
    });
};

startServer();