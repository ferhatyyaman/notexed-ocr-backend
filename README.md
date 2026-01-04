# Tesseract OCR Backend

Free OCR backend for NoteXed mobile app.

## Features

- ✅ Tesseract OCR (Turkish + English)
- ✅ Express.js REST API
- ✅ Free hosting on Railway
- ✅ CORS enabled
- ✅ No rate limits

## API Endpoint

### POST /ocr

**Request:**
```json
{
  "image": "base64_encoded_image_data"
}
```

**Response:**
```json
{
  "success": true,
  "text": "extracted text",
  "confidence": 0.95,
  "length": 123
}
```

## Local Development

```bash
npm install
npm start
```

Server runs on http://localhost:3000

## Deploy to Railway

1. Push to GitHub
2. Go to railway.app
3. New Project → Deploy from GitHub
4. Select this repo
5. Done! Railway auto-deploys

## Environment

- Node.js >= 18
- Tesseract.js 5.x
- Express 4.x
