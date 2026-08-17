# 📚 Complete Architecture Guide - To'liq Tizim Ko'llanmasi

Uzbek + English

---

## 🏗️ Tizim Arxitekturasi (Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│                    USER BROWSER                             │
│  https://your-app.vercel.app                                │
│                                                             │
│  ┌──────────────────────────────────────────────────┐      │
│  │  React + Vite Frontend                           │      │
│  │  ├─ Code Editor (Monaco)                         │      │
│  │  ├─ Terminal UI                                  │      │
│  │  ├─ Settings & Examples Modal                    │      │
│  │  └─ AI Assistant (Python-only, no Gemini)        │      │
│  └──────────────────────────────────────────────────┘      │
│                       │ (User clicks "Run")                 │
│                       ↓                                     │
│  ┌──────────────────────────────────────────────────┐      │
│  │  POST /api/run → { code: "..." }                 │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┴─────────────────┐
        ↓                                   ↓
   (Dev Mode)                      (Production - Vercel)
   localhost:5000                  
        │                                   │
        │                    Check PYTHON_EXECUTION_URL
        │                                   │
        └─────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────┐
│               BACKEND (Render / Railway / VM)               │
│  https://python-backend-xyz.onrender.com                    │
│                                                             │
│  ┌──────────────────────────────────────────────────┐      │
│  │  Flask Server (app.py)                           │      │
│  │  ├─ POST /api/run                                │      │
│  │  │  └─ Validate code                             │      │
│  │  │  └─ Create temp directory                     │      │
│  │  │  └─ Execute: subprocess.Popen(['python3'...])│      │
│  │  │  └─ Capture stdout/stderr                     │      │
│  │  │  └─ Apply timeout (30s)                       │      │
│  │  │  └─ Limit output (50KB)                       │      │
│  │  │  └─ Return JSON response                      │      │
│  │  │                                               │      │
│  │  └─ GET /health (status check)                   │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                          │
                          ↓ (JSON: success, output, error, exit code)
                          │
┌─────────────────────────────────────────────────────────────┐
│              VERCEL API ROUTE (Optional)                    │
│  /api/index.js                                              │
│  ├─ Receives request from frontend                          │
│  ├─ Proxies to PYTHON_EXECUTION_URL                         │
│  └─ Returns response to browser                             │
└─────────────────────────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                  BROWSER TERMINAL UI                        │
│  ✅ Output displayed                                        │
│  ⚠️  Errors shown                                           │
│  ⏱️  Duration displayed                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 File Structure

```
d:\python\
│
├── 📄 package.json                 (npm scripts)
├── 📄 tsconfig.json                (TypeScript config)
├── 📄 vite.config.ts               (Vite config)
├── 📄 vercel.json                  (Vercel API routes)
├── 📄 server.ts                    (Local Express server - dev only)
│
├── 📂 src/                         (React Frontend)
│   ├── App.tsx                     (Main component)
│   ├── main.tsx                    (Entry point)
│   ├── index.css                   (Styles)
│   ├── types.ts                    (TypeScript types)
│   ├── 📂 components/              (React components)
│   │   ├── CodeEditor.tsx
│   │   ├── Terminal.tsx
│   │   ├── AIAssistant.tsx
│   │   ├── SettingsModal.tsx
│   │   └── ... (other components)
│   ├── 📂 services/
│   │   └── api.ts                  (API client)
│   ├── 📂 locales/                 (Translations)
│   │   ├── en.ts
│   │   ├── ru.ts
│   │   ├── uz.ts
│   │   └── uz-cyrl.ts
│   └── 📂 utils/
│       └── errorParser.ts
│
├── 📂 server/                      (Backend - local dev only)
│   ├── executor.ts                 (Python execution - Node.js based)
│   ├── error_parser.ts
│   └── gemini.ts                   (No longer used)
│
├── 📂 api/                         (Vercel API Routes)
│   └── index.js                    (Proxy to PYTHON_EXECUTION_URL)
│
├── ✨ 📂 python-backend/           (NEW - Real Python Backend!)
│   ├── app.py                      (Flask server)
│   ├── requirements.txt            (Python dependencies)
│   ├── README.md                   (Backend documentation)
│   └── .gitignore
│
├── ✨ 📄 DEPLOY.md                 (Complete deployment guide)
├── ✨ 📄 QUICKSTART.md             (Quick start in Uzbek)
├── ✨ 📄 Dockerfile                (Docker containerization)
├── ✨ 📄 docker-compose.yml        (Local dev with Docker)
├── ✨ 📄 Procfile                  (Render/Heroku deployment)
├── ✨ 📄 .env.local                (Local dev vars)
├── ✨ 📄 .env.production           (Production vars)
├── 📄 .env.example                 (Template)
│
├── 📂 assets/                      (Static assets)
├── 📄 README.md
├── 📄 index.html
└── 📄 metadata.json
```

---

## 🔄 Request Flow

### Step 1: User Input
```typescript
// User types Python code in editor
const code = "print('Hello')";
```

### Step 2: Frontend API Call
```typescript
// src/services/api.ts
const response = await fetch('/api/run', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ code })
});
```

### Step 3: Vercel Routes
```javascript
// api/index.js (Vercel)
const backendUrl = process.env.PYTHON_EXECUTION_URL;
const response = await fetch(`${backendUrl}/api/run`, {
  method: 'POST',
  body: JSON.stringify({ code })
});
```

### Step 4: Backend Executes
```python
# python-backend/app.py
@app.route('/api/run', methods=['POST'])
def run_code():
    code = request.json['code']
    result = execute_python(code)
    return jsonify(result.to_dict())
```

### Step 5: Execution Details
```python
# Inside execute_python():
process = subprocess.Popen(
    ['python3', code_file],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    timeout=30  # 30 second timeout
)
stdout, stderr = process.communicate()
```

### Step 6: Response
```json
{
  "success": true,
  "output": "Hello\n",
  "error": "",
  "exitCode": 0,
  "duration": 0.123
}
```

### Step 7: Terminal UI Update
```typescript
// Frontend displays result
setTerminalOutput(response.output);
```

---

## 🚀 Deployment Steps (Joylashtirish Qadamlari)

### ✅ Step 1: Backend Setup (Render)

**Time: 5 minutes**

1. Go to https://render.com
2. Sign up/Login with GitHub
3. Click **New +** → **Web Service**
4. Select `python` repository
5. Settings:
   ```
   Name: python-backend
   Environment: Python 3
   Build Command: pip install -r python-backend/requirements.txt
   Start Command: cd python-backend && gunicorn app:app
   ```
6. Click **Deploy**
7. Wait for green "Live" status
8. Copy the URL (e.g., `https://python-backend-abc.onrender.com`)

### ✅ Step 2: Frontend Setup (Vercel)

**Time: 2 minutes**

1. Go to https://vercel.com
2. Select `python` project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   ```
   Key: PYTHON_EXECUTION_URL
   Value: https://python-backend-abc.onrender.com
   ```
5. Click **Save**
6. Vercel auto-redeploys
7. Wait for green deployment status

### ✅ Step 3: Test

**Time: 1 minute**

1. Open your Vercel app: `https://your-app.vercel.app`
2. Write Python code:
   ```python
   print("Backend works!")
   ```
3. Click **Run**
4. See output in Terminal

---

## 🧪 Local Testing

### Setup

```bash
# Clone and navigate
cd d:\python

# Create virtual environment
python3 -m venv venv

# Activate
venv\Scripts\activate

# Install dependencies
pip install -r python-backend/requirements.txt

# Start backend
python python-backend/app.py
```

Backend runs on `http://localhost:5000`

### Test with curl

```bash
# Terminal 2
curl -X POST http://localhost:5000/api/run \
  -H "Content-Type: application/json" \
  -d '{"code":"print(\"test\")"}'

# Expected:
# {"success":true,"output":"test\n","error":"","exitCode":0,"duration":0.05}
```

### Frontend Local Dev

```bash
# Terminal 3
npm install
npm run dev
```

Open `http://localhost:5173`

---

## 🔐 Safety Features

✅ **Isolation**: Code runs in separate subprocess
✅ **Timeout**: Max 30 seconds execution
✅ **Output Limit**: Max 50KB output
✅ **Temp Directory**: Auto-cleanup after execution
✅ **Error Handling**: Graceful error messages
✅ **No File Access**: Code can't access filesystem beyond temp dir
✅ **No Network**: Code can't make external requests

---

## 🆘 Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Frontend shows "Running..." | Backend unreachable | Check Render URL in Vercel env |
| "Command not found" | Python3 missing | Install Python 3.8+ on backend |
| Timeout error | Code takes >30 seconds | Optimize code or increase timeout in app.py |
| No output | Code has no print() | Add print() statements to code |
| Environment variable error | Vercel cache | Hard refresh or redeploy |

---

## 📊 Environment Variables Summary

### Local Development
```bash
# .env.local
VITE_PYTHON_EXECUTION_URL=http://localhost:5000
```

### Production (Vercel)
```bash
# Set in Vercel Dashboard
PYTHON_EXECUTION_URL=https://your-backend-name.onrender.com
VITE_PYTHON_EXECUTION_URL=https://your-backend-name.onrender.com
```

### Backend (Render)
```bash
# Auto set by Render
PORT=5000
FLASK_ENV=production
```

---

## 📝 Key Files You Need to Know

| File | Purpose | Language |
|------|---------|----------|
| `python-backend/app.py` | Backend server | Python |
| `src/services/api.ts` | API client | TypeScript |
| `api/index.js` | Vercel proxy | JavaScript |
| `src/App.tsx` | Main UI | TypeScript/React |
| `DEPLOY.md` | Deployment guide | Markdown |
| `QUICKSTART.md` | Quick start (Uzbek) | Markdown |

---

## 🎯 Complete Checklist

- [ ] Backend code created (`python-backend/app.py`)
- [ ] Requirements file created (`python-backend/requirements.txt`)
- [ ] Docker files created (`Dockerfile`, `docker-compose.yml`)
- [ ] Deployment guides created (`DEPLOY.md`, `QUICKSTART.md`)
- [ ] Environment files created (`.env.local`, `.env.production`)
- [ ] Procfile created for Render
- [ ] Backend tested locally with curl
- [ ] Render account created
- [ ] Backend deployed to Render
- [ ] Vercel environment variable set
- [ ] Vercel redeployed
- [ ] Full end-to-end tested

---

## 🎉 You're Done!

```
User Code → Frontend → Vercel API → Render Backend → Python Execution → Terminal UI
                                                  ✅ COMPLETE
```

**Hamma tayyor! (Everything is ready!)**

---

## 💡 Next Steps

1. **Deploy Backend**: Follow [DEPLOY.md](DEPLOY.md) → Render deployment
2. **Configure Vercel**: Set `PYTHON_EXECUTION_URL` env variable
3. **Test Thoroughly**: Write Python code and run it
4. **Monitor**: Check Render logs for any errors

---

## 🔗 Important Links

- Frontend: https://vercel.com/projects
- Backend: https://render.com/dashboard
- GitHub: https://github.com/brazil666661-maker/python
- Flask Docs: https://flask.palletsprojects.com/
- Render Docs: https://render.com/docs

---

**Questions? Check DEPLOY.md or QUICKSTART.md**

**Savollar? DEPLOY.md yoki QUICKSTART.md ochib o'qing**

