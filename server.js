const express = require('express');
const cors = require('cors');
const Tesseract = require('tesseract.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Tesseract OCR Backend is running',
        version: '1.0.0'
    });
});

// OCR endpoint
app.post('/ocr', async (req, res) => {
    try {
        console.log('OCR request received');

        const { image } = req.body;

        if (!image) {
            return res.status(400).json({
                error: 'No image provided',
                message: 'Please send base64 encoded image in "image" field'
            });
        }

        console.log('Processing image with Tesseract...');
        console.log('Image data length:', image.length);

        // Convert base64 to buffer
        const imageBuffer = Buffer.from(image, 'base64');

        // Create Tesseract worker
        const worker = await Tesseract.createWorker('tur+eng', 1, {
            logger: (m) => {
                console.log('Tesseract:', m.status, m.progress);
            }
        });

        // Recognize text
        const { data: { text, confidence } } = await worker.recognize(imageBuffer);

        // Terminate worker
        await worker.terminate();

        console.log('OCR completed successfully');
        console.log('Text length:', text.length);
        console.log('Confidence:', confidence);

        res.json({
            success: true,
            text: text.trim(),
            confidence: confidence,
            length: text.trim().length
        });

    } catch (error) {
        console.error('OCR Error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Failed to process image'
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`OCR Backend running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/`);
    console.log(`OCR endpoint: http://localhost:${PORT}/ocr`);
});
