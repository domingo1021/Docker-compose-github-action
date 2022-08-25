const router = require('express').Router();
const {upload} = require('../../util/util');

const cpUpload = upload.fields([
    { name: 'main_image', maxCount: 1 },
    { name: 'other_images', maxCount: 3 }
]);

const {
    createProduct,
} = require('../controllers/product_controller');

const {
    createCampaign,
    createHot
} = require('../controllers/marketing_controller');

const {
    wrapAsync,
    authentication
} = require('../../util/util');

const {
    USER_ROLE
} = require('../models/user_model');

router.route('/admin/product')
    .post(/*authentication(USER_ROLE.ADMIN), */cpUpload, wrapAsync(createProduct));

router.route('/admin/campaign')
    .post(authentication(USER_ROLE.ADMIN), cpUpload, wrapAsync(createCampaign));

router.route('/admin/hot')
    .post(authentication(USER_ROLE.ADMIN), wrapAsync(createHot));

module.exports = router;