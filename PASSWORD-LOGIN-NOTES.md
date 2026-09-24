# Password login update

The OTP flow has been removed from the active application.

## New authentication
- Sign in with **mobile number + password**, or
- Sign in with **email + password**.
- New users choose **Create account**, then complete their profile.
- Passwords are stored as salted `scrypt` hashes; plain-text passwords are never stored.

## Important for old OTP-created users
Users already stored in MongoDB from the old OTP build do not have a password hash. For security, the app does **not** let someone claim an old account just by knowing its phone number/email.

For a local/test database, delete the old test user in MongoDB and use **Create account** once with the same phone/email and a new password.

## Fixed: false "wrong password" errors
Passwords typed on mobile keyboards or filled by a password manager sometimes carry an invisible trailing space, which made a correct password get rejected as wrong. Both the register and login forms now trim the password before it is hashed/checked, on the frontend and the backend, so this can no longer happen.

## New: Forgot password
- On the sign-in tab, "Forgot password?" opens a reset form.
- The user re-enters the mobile number or email on the account, plus a new password (min 6 characters), and submits.
- `POST /api/auth/forgot-password` looks the account up the same way login does; if found it saves a new hashed password (old one is overwritten) and the user is asked to sign in again with it. If no account matches, it returns a clear "No account found" error instead of a generic failure.

### Security note
This project has no email/SMS provider configured, so there is no code/link verification step — anyone who knows an account's phone number or email can currently reset its password. That's fine for a local demo, but before using this in anything real you should add a verification step (e.g. an emailed reset link/OTP) in front of `forgotPassword` in `backend/controllers/authController.js`. It's also worth noting `backend/.env` in this ZIP contains a live MongoDB Atlas connection string with a real username/password — rotate that credential if this project is shared or committed anywhere.
