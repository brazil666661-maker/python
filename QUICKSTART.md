# 🚀 Tez Boshlash - Quick Start Guide

Uzbek tilida to'liq qo'llanma

---

## ✅ Sizda Endi Bor:

### Frontend (Vercel-da):
- React + Vite app
- Code editor
- Terminal UI
- Settings modal

### Backend (Render-da):
- Flask server
- Python code executor
- Safety features (timeout, output limit)
- Health check

---

## 🎯 3 Ta Qadim:

### Qadim 1️⃣: Local Testing

```bash
cd d:\python

# Backend chalishtirish
cd python-backend
python3 -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Backend `http://localhost:5000` da ishlaydi.

```bash
# Boshqa terminal-da test qilish:
curl -X POST http://localhost:5000/api/run -H "Content-Type: application/json" -d "{\"code\":\"print('Test')\"}"
```

### Qadim 2️⃣: Render-ga Deploy

1. https://render.com da login (GitHub bilan)
2. **New Web Service**
3. Repository: `python` tanlang
4. Settings:
   - **Build Command**: `pip install -r python-backend/requirements.txt`
   - **Start Command**: `cd python-backend && gunicorn app:app`
5. **Deploy** bosing
6. URL ko'paytiring (masalan: `https://python-backend-xyz.onrender.com`)

### Qadim 3️⃣: Vercel Environment Variable

1. https://vercel.com login
2. Python project tanlang
3. **Settings → Environment Variables**
4. Add:
   - **Key**: `PYTHON_EXECUTION_URL`
   - **Value**: `https://python-backend-xyz.onrender.com` (Render URL)
5. **Save** → Vercel auto redeploy
6. Test: Frontend-da Python kod yozing va **Run** bosing

---

## 📁 File Structure

```
d:\python\
├── frontend/
│   ├── src/
│   │   ├── components/      (React components)
│   │   ├── services/        (API client)
│   │   └── App.tsx          (Main app)
│   ├── package.json
│   └── vite.config.ts
│
├── python-backend/          ✨ NEW!
│   ├── app.py               (Flask server)
│   ├── requirements.txt      (Dependencies)
│   └── README.md            (Backend qo'llanma)
│
├── DEPLOY.md                ✨ NEW! (To'liq qo'llanma)
├── .env.local               ✨ NEW! (Local vars)
├── .env.production          ✨ NEW! (Production vars)
├── Dockerfile               ✨ NEW! (Docker)
├── docker-compose.yml       ✨ NEW! (Local run)
└── Procfile                 ✨ NEW! (Render deploy)
```

---

## 🔍 Timing

| Step | Time |
|------|------|
| Backend local setup | 2 min |
| Backend Render deploy | 3 min |
| Vercel env setup | 1 min |
| **Total** | **6 minutes** |

---

## 🆘 Muammolar va Yechimlar

| Muammo | Yechim |
|--------|--------|
| Frontend "Running..." turibdi | Backend URL noto'g'ri yoki ishlamaydi. Health check: `curl https://your-backend.onrender.com/health` |
| "PYTHON_EXECUTION_URL not set" | Vercel Settings → Environment Variables check qiling |
| Timeout error | Render backend ishlamaydi, logs check qiling |
| Local test ishlamaydi | `python -m venv venv` va `pip install -r requirements.txt` qayta run qiling |

---

## 📞 Commands Recap

```bash
# Local backend
python app.py

# Local test
curl -X POST http://localhost:5000/api/run \
  -H "Content-Type: application/json" \
  -d '{"code":"print(1+1)"}'

# Check backend health
curl http://localhost:5000/health

# Docker run (opsional)
docker-compose up
```

---

## ✨ Natija

```
User naypyta Python kodini yozadi
        ↓
"Run" tugmasini bosadi
        ↓
Frontend: /api/run
        ↓
Vercel: Proxy → PYTHON_EXECUTION_URL
        ↓
Backend (Render): Flask execute
        ↓
stdout/stderr → Terminal UI
```

**✅ Ishlaydi!**

---

## 📖 Detailed Guide

Ko'proq ma'lumot: [DEPLOY.md](DEPLOY.md)

---

**Savol bo'lsa, bu file ochib o'qing va step-by-step bajaring!**

Qisqasi:
1. Render-ga backend deploy ➜ URL ko'paytir
2. Vercel env → `PYTHON_EXECUTION_URL` = Render URL
3. Test!

**Shuning bilan fertig! 🎉**
