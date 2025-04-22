const express = require('express');
const router = express.Router();
const loginController = require('../controllers/login-controller');
const isAuthenticated = require('../middleware/auth-middleware');



router.get('/',loginController.getLoginPage);
router.post('/',loginController.postLogin);

router.get('/register',loginController.getRegister);
router.post('/register',loginController.postRegister);

router.post('/logout',loginController.logout);


module.exports = router;