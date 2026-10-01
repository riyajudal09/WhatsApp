const express =
  require('express');

const auth =
  require('../middleware/authMiddleware');

const c =
  require('../controllers/pushController');


const router =
  express.Router();


router.get(
  '/public-key',
  auth,
  c.getPublicKey
);


router.post(
  '/subscribe',
  auth,
  c.subscribe
);


router.delete(
  '/unsubscribe',
  auth,
  c.unsubscribe
);


module.exports =
  router;