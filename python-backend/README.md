# Python Backend - Code Execution Service

Secure sandboxed Python code execution backend for the Vercel frontend.

## Quick Start

### Local Development

```bash
# Create virtual environment
python3 -m venv venv

# Activate
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run server
python app.py
```

Server runs on `http://localhost:5000`

### Test Execution

```bash
curl -X POST http://localhost:5000/api/run \
  -H "Content-Type: application/json" \
  -d '{"code":"print(\"Hello!\")"}'
```

## Production Deployment

See [../DEPLOY.md](../DEPLOY.md) for complete deployment instructions.

### Quick Deploy to Render

1. Go to https://render.com
2. Create new Web Service
3. Connect your GitHub repo (`python`)
4. Build Command: `pip install -r python-backend/requirements.txt`
5. Start Command: `cd python-backend && gunicorn app:app`
6. Deploy and get URL
7. Set `PYTHON_EXECUTION_URL` in Vercel dashboard

## API Endpoints

### POST `/api/run`

Execute Python code.

**Request:**
```json
{
  "code": "print('Hello, World!')"
}
```

**Response:**
```json
{
  "success": true,
  "output": "Hello, World!\n",
  "error": "",
  "exitCode": 0,
  "duration": 0.123
}
```

### GET `/health`

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-08-17T10:30:00.000000",
  "service": "Python Code Execution Backend"
}
```

## Configuration

- **TIMEOUT_SECONDS**: 30 (max execution time)
- **OUTPUT_LIMIT**: 50000 bytes (max output size)
- **MAX_CODE_LENGTH**: 100000 characters

Modify in `app.py` as needed.

## Safety Features

- ✅ Code executed in isolated subprocess
- ✅ Temporary directory (auto-cleanup)
- ✅ Timeout protection
- ✅ Output size limits
- ✅ Error isolation
- ✅ No direct file system access

## Environment Variables

```
PORT=5000              # Server port (default)
FLASK_ENV=production   # Flask mode
```

## Files

- `app.py` - Main Flask application
- `requirements.txt` - Python dependencies
- `Dockerfile` - Optional Docker configuration

---

**Full deployment guide**: See [../DEPLOY.md](../DEPLOY.md)
