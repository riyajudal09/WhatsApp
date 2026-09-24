// const express = require('express');
// const auth = require('../middleware/authMiddleware');
// const upload = require('../config/multerMiddleware');
// const c = require('../controllers/authController');
// const router = express.Router();

// router.post('/register', c.register);
// router.post('/login', c.login);
// router.post('/forgot-password', c.forgotPassword);
// router.put('/update-profile', auth, upload.single('profilepicture'), c.updateProfile);
// router.get('/check-auth', c.checkAuth);
// router.get('/user', auth, c.getAllUser);
// router.get('/logout', auth, c.logout);

// module.exports = router;


const express = require('express');

const auth = require('../middleware/authMiddleware');
const upload = require('../config/multerMiddleware');
const c = require('../controllers/authController');

const router = express.Router();


// REGISTER
router.post(
  '/register',
  c.register
);


// LOGIN
router.post(
  '/login',
  c.login
);


// FORGOT PASSWORD
router.post(
  '/forgot-password',
  c.forgotPassword
);


// UPDATE PROFILE
router.put(
  '/update-profile',
  auth,
  upload.single('profilepicture'),
  c.updateProfile
);


// CHECK AUTH
router.get(
  '/check-auth',
  c.checkAuth
);


// GET ALL USERS
router.get(
  '/user',
  auth,
  c.getAllUser
);


// REMOVE / HIDE USER FROM CHAT LIST
router.delete(
  '/user/:userId',
  auth,
  c.hideUser
);


// LOGOUT
router.get(
  '/logout',
  auth,
  c.logout
);

module.exports = router;