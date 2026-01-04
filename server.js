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

// TTS endpoint
app.post('/tts', async (req, res) => {
    try {
        console.log('TTS request received');

        const { text, voice = 'tr-TR-Wavenet-A', speed = 1.0 } = req.body;

        if (!text) {
            return res.status(400).json({
                error: 'No text provided',
                message: 'Please send text in "text" field'
            });
        }

        console.log('Generating speech with Google Cloud TTS...');
        console.log('Text length:', text.length);
        console.log('Voice:', voice);
        console.log('Speed:', speed);

        // Google Cloud TTS API
        const TTS_API_KEY = 'AIzaSyBYz5oFvCcz-6LxG9JkYy0mqt8KWvK_FG8';
        const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${TTS_API_KEY}`;

        const requestBody = {
            input: { text: text },
            voice: {
                languageCode: 'tr-TR',
                name: voice
            },
            audioConfig: {
                audioEncoding: 'MP3',
                speakingRate: speed,
                pitch: 0
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Google TTS Error:', errorData);
            throw new Error('TTS API failed');
        }

        const data = await response.json();
        const audioContent = data.audioContent;

        console.log('TTS completed successfully');
        console.log('Audio size:', audioContent.length);

        res.json({
            success: true,
            audio: audioContent,
            voice: voice,
            length: audioContent.length
        });

    } catch (error) {
        console.error('TTS Error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Failed to generate speech'
        });
    }
});


// Start server
app.listen(PORT, () => {
    console.log(`OCR Backend running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/`);
    console.log(`OCR endpoint: http://localhost:${PORT}/ocr`);
});
