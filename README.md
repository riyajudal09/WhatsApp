# WhatsApp Clone — password login build

This is the same WhatsApp-style MERN chat project with the desktop/laptop frontend sizing fixes kept in place.

## Authentication

The old verification-code/SMS flow is removed from the active app. Users can now:

- sign in with **mobile number + password**,
- sign in with **email + password**,
- create a new account with either mobile number or email,
- complete their name/profile photo after registration.

Passwords are stored as salted **scrypt hashes** in MongoDB. Plain-text passwords are not stored.

### Old users already in MongoDB

Users created by an earlier verification-code build do not have a password hash. For security, this build does not let a person take over an old account just by knowing its phone number or email. For local/test data, delete that old test user from MongoDB and create the account again from **Create account** with a password.

## Local setup

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend defaults to `http://localhost:5000`.

Create `backend/.env` from `.env.example` and set at least:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=use-a-long-random-secret
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
```

Cloudinary is optional. If it is not configured, uploaded media is served from the backend uploads folder.

### Frontend

```bash
cd frontend
npm install
npm start
```

`frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000
```

## Password API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/check-auth`
- `GET /api/auth/logout`

For mobile auth, send `phoneNumber`, `phoneSuffix`, and `password`. For email auth, send `email` and `password`.

## Important deployment setting

When frontend and backend are deployed separately, set `FRONTEND_URL` on the backend to the exact deployed frontend URL, and set `REACT_APP_API_URL` in the frontend to the exact backend URL.
