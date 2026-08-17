# Python Backend Deployment Guide

Uzbek bo'lsa: Python Backend Joylashtirish Qo'llanmasi

---

## 📋 Qisqa Mazmun (Summary)

Ushbu backend Django/Flask ishlatmay, oddiy Python kodi bajariladi. Vercel frontendig ulangan.

**Kerakli o'rinlar:**
1. Backend: Render, Railway, Fly.io yoki shaxsiy VM
2. Frontend: Vercel (allaqachon tayyorlangan)
3. Ulanish: `PYTHON_EXECUTION_URL` env variable

---

## 🚀 Qadim 1: Local Testing

### 1.1 Backend-ni Lokal Test Qilish

```bash
cd python-backend

# Python 3.8+ kerak
python3 -m venv venv

# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Dependency o'rnatish
pip install -r requirements.txt

# Start server
python app.py
```

Server `http://localhost:5000` da ishlaydi.

### 1.2 Test Qilish

```bash
# Terminal 2 da:
curl -X POST http://localhost:5000/api/run \
  -H "Content-Type: application/json" \
  -d '{"code":"print(\"Hello, World!\")"}'

# Expected Response:
# {
#   "success": true,
#   "output": "Hello, World!\n",
#   "error": "",
#   "exitCode": 0,
#   "duration": 0.123
# }
```

Health check:
```bash
curl http://localhost:5000/health
```

---

## 🌐 Qadim 2: Render.com-ga Deploy Qilish (Tavsiya)

### 2.1 Render Account Yaratish

1. https://render.com ga boring
2. Ro'yxatdan o'tish (GitHub bilan)
3. Dashboard-ga boring

### 2.2 Web Service Yaratish

1. **New +** → **Web Service**
2. **Connect a repository** → `python` repo tanlang
3. Settings:
   - **Name**: `python-backend` (yoki boshqa nom)
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r python-backend/requirements.txt`
   - **Start Command**: `cd python-backend && gunicorn app:app`
   - **Root Directory**: `.` (boshlang'ich)

### 2.3 Environment Variables

Render dashboard-da **Environment** bo'limiga o'ting:
```
FLASK_ENV = production
```

### 2.4 Deploy

1. **Deploy** tugmasini bosing
2. 2-3 minutni kutish
3. URL ko'paytirish: `https://your-service-name.onrender.com`

---

## ✅ Vercel-da PYTHON_EXECUTION_URL Sozlash

### 3.1 Vercel Project Settings

1. https://vercel.com da login
2. Sizning **python** projectni tanlang
3. **Settings** → **Environment Variables**
4. **Add New** bosing:

| Key | Value |
|-----|-------|
| `PYTHON_EXECUTION_URL` | `https://your-backend-name.onrender.com` |

(Render URL ni o'rnida qo'yish!)

5. **Save** bosing
6. Vercel avtomatik redeploy qiladi

### 3.2 Tekshirish

1. Frontend-ni browser-da oching: `https://your-vercel-app.vercel.app`
2. Python kodini yozing:
```python
print("Hello from backend!")
```
3. **Run** bosing
4. Terminal-da "Hello from backend!" ko'rinishi kerak

---

## 🐳 Alternative: Docker bilan (Advanced)

Agar Docker ishlatmoqchi bo'lsangiz:

```dockerfile
# python-backend/Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY app.py .
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:5000"]
```

Deploy:
- Fly.io: `flyctl launch` → `flyctl deploy`
- Railway: Repo push, auto deploy
- AWS: ECS yoki EC2

---

## 🔍 Debugging

### Frontend "Running..." turibdi

✗ Backend URL noto'g'ri
✗ Backend ishlamaydi

**Fix:**
```bash
# Backend health check
curl https://your-backend-name.onrender.com/health

# Log ko'rish
Render → Service → Logs
```

### Error: "PYTHON_EXECUTION_URL not set"

Vercel env variables refresh qilish kerak:
1. Settings → Environment Variables qayta check
2. Vercel redeploy: `vercel --prod`

### Timeout Error

- Backend 30 sekunddan ko'p vaqt ishlamaydi
- `python-backend/app.py`-da `TIMEOUT_SECONDS` o'zgartiring

---

## 📊 Full Architecture

```
User Browser (Vercel Frontend)
        ↓
    [Run] Button
        ↓
   Vercel API Route
        ↓
 PYTHON_EXECUTION_URL
        ↓
 Backend (Render/Railway)
        ↓
   Execute Python
        ↓
  stdout/stderr
        ↓
   JSON Response
        ↓
  Terminal UI Update
```

---

## ⚡ Quick Start Checklist

- [ ] Local-da `python app.py` ishlamoqda
- [ ] `curl` test muvaffaqiyatli
- [ ] Render-ga deploy qildingiz
- [ ] Render URL ko'paytirdingiz
- [ ] Vercel `PYTHON_EXECUTION_URL` set qildingiz
- [ ] Vercel redeploy bo'ldi
- [ ] Frontend + Backend test qildingiz

---

## 📝 .env Files

### Local (.env.local)
```
VITE_PYTHON_EXECUTION_URL=http://localhost:5000
```

### Production (.env.production)
```
VITE_PYTHON_EXECUTION_URL=https://your-backend-name.onrender.com
```

Vercel Secrets:
```
PYTHON_EXECUTION_URL=https://your-backend-name.onrender.com
```

---

**✅ Shuning bilan frontend + backend to'liq ishlaydi!**

