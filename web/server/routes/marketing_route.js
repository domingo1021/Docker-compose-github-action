const router = require('express').Router();
const {wrapAsync} = require('../../util/util');

const {
    getCampaigns,
    getHots
} = require('../controllers/marketing_controller');

router.route('/marketing/campaigns')
    .get(wrapAsync(getCampaigns));

router.route('/marketing/hots')
    .get(wrapAsync(getHots));

module.exports = router;