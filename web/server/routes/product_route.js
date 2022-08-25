const router = require('express').Router();
const {wrapAsync} = require('../../util/util');

const {
    getProducts,
} = require('../controllers/product_controller');

router.route('/products/:category')
    .get(wrapAsync(getProducts));

module.exports = router;
