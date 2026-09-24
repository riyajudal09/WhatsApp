# Render deployment guide

This project contains two apps and should be deployed as two Render services:

- `frontend/` = React static site
- `backend/` = Node/Express web service

A `render.yaml` file is included in the project root so Render Blueprint can create both services with the correct root directories, build commands, frontend rewrite, health check, and cross-service URLs.

## Before deploying

1. Push the whole project folder to one GitHub repository.
2. Do **not** commit `backend/.env` or `frontend/.env`. They are already ignored by the root `.gitignore`.
3. Have your MongoDB Atlas connection string ready.
4. For persistent profile/chat images on Render, have Cloudinary credentials ready. Render's normal filesystem is ephemeral, so local `backend/uploads` files can disappear after restarts/redeploys.

## Recommended: deploy with Render Blueprint

1. Open Render Dashboard.
2. Click **New +** -> **Blueprint**.
3. Connect the GitHub repository containing this project.
4. Render automatically reads `/render.yaml`.
5. When Render asks for secret environment values, enter:
   - `MONGO_URI` = your MongoDB Atlas URI
   - `CLOUDINARY_NAME` = Cloudinary cloud name
   - `CLOUDINARY_API_KEY` = Cloudinary API key
   - `CLOUDINARY_API_SECRET` = Cloudinary API secret
6. `JWT_SECRET` is generated automatically by Render.
7. Click **Deploy Blueprint**.
8. Wait until both `whatsapp-clone-backend` and `whatsapp-clone-frontend` show Live.
9. Open the frontend URL.

The Blueprint automatically wires:

- `FRONTEND_URL` on the backend to the Render frontend URL.
- `BACKEND_URL` on the backend to its own Render URL.
- `REACT_APP_API_URL` on the frontend to the Render backend URL.
- SPA rewrite `/* -> /index.html`.
- Backend health check `/api/health`.

## Manual deployment (if you do not use Blueprint)

### Backend

Create **New + -> Web Service** and connect the repository.

- Root Directory: `backend`
- Runtime: Node
- Build Command: `npm ci`
- Start Command: `npm start`
- Health Check Path: `/api/health`

Set environment variables:

- `NODE_ENV=production`
- `MONGO_URI=<your MongoDB Atlas URI>`
- `JWT_SECRET=<a long random secret>`
- `FRONTEND_URL=https://YOUR-FRONTEND.onrender.com`
- `BACKEND_URL=https://YOUR-BACKEND.onrender.com`
- `CLOUDINARY_NAME=<your value>`
- `CLOUDINARY_API_KEY=<your value>`
- `CLOUDINARY_API_SECRET=<your value>`

After it is live, verify:

`https://YOUR-BACKEND.onrender.com/api/health`

It should return JSON with `status: success`.

### Frontend

Create **New + -> Static Site** from the same repository.

- Root Directory: `frontend`
- Build Command: `npm ci && npm run build`
- Publish Directory: `build`

Set environment variable:

- `REACT_APP_API_URL=https://YOUR-BACKEND.onrender.com`

Add Rewrite:

- Source: `/*`
- Destination: `/index.html`
- Action: `Rewrite`

Then deploy. If you created the frontend after the backend, copy the final frontend URL back into backend `FRONTEND_URL` and choose **Save, rebuild, and deploy**.

## MongoDB Atlas

Make sure Atlas Network Access allows Render to connect. A common simple testing setting is `0.0.0.0/0`; for production use, apply the narrowest access policy appropriate for your deployment. Also make sure the database user/password in `MONGO_URI` are correct and URL-encoded if they contain special characters.

## Updating after deployment

After editing code:

```bash
git add .
git commit -m "update app"
git push origin main
```

With Auto-Deploy enabled, Render rebuilds the services from the new commit automatically.
