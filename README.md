# E-commerce (MEAN)

## Prerequisites
- Node.js 18+ (Node 22 OK)
- npm 9+
- MongoDB running locally

## Install
```bash
# root (Angular)
npm install

# backend
cd backend
npm install
```

## Run (two terminals)
```bash
# Terminal 1 (backend)
cd backend
npm run dev

# Terminal 2 (frontend)
cd ..
npm start
```
- Backend: http://localhost:3000/api
- Frontend: http://localhost:4200

If port 3000 is busy, stop the running process and restart.

## Environment
Create `backend/.env` from `backend/env.example`:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ecommerce
FRONTEND_URL=http://localhost:4200
JWT_SECRET=change_me
```

## Build (Angular)
```bash
npm run build
```
Outputs to `dist/` (ignored by Git).

## Deploy to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
# create repo on GitHub then:
git remote add origin <your_repo_url>
git branch -M main
git push -u origin main
```
