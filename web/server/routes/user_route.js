const router = require('express').Router();

const {
    wrapAsync,
    authentication
} = require('../../util/util');

const {
    signUp,
    signIn,
    getUserProfile,
} = require('../controllers/user_controller');

router.route('/user/signup')
    .post(wrapAsync(signUp));

router.route('/user/signin')
    .post(wrapAsync(signIn));

router.route('/user/profile')
    .get(authentication(), wrapAsync(getUserProfile));

module.exports = router;