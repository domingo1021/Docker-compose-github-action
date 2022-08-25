const _ = require('lodash');
const {expect, requester} = require('./set_up');
const {users} = require('./fake_data');
const {pool} = require('../server/models/mysqlcon');
const sinon = require('sinon');
let stub;

const user1 = users[0];
const user = {
    provider: user1.provider,
    email: user1.email,
    password: user1.password
};
let accessToken;
let userId;

const VALID_PRIME = 'valid prime';
const INVALID_PRIME = 'invalid prime';
const orderData = {
    prime: VALID_PRIME,
    order: {
        shipping: 'delivery',
        payment: 'credit_card',
        recipient: {
            name: 'test',
            phone: '0912345678',
            email: 'test@gmail.com',
            address: 'testaddress',
            time: 'anytime'
        },
        list:  [{
            id: 1,
            qty: 1,
            name: '前開衩扭結洋裝',
            size: 'S',
            color: {code: 'FFFFFF', name: '白色'},
            price: 1000,
            stock: 2,
            main_image: 'https://test/1/main.jpg'
        }],
        subtotal: 1000,
        freight: 60,
        total: 1060
    }
};

const fakeTappayResponse = {
    status: 0,
    msg: 'Success',
    amount: 8056,
    acquirer: 'TW_CTBC',
    currency: 'TWD',
    rec_trade_id: 'D20200210eKvZyv',
    bank_transaction_id: 'TP20200210eKvZyv',
    order_number: '',
    auth_code: '132481',
    card_info: {
        issuer: '',
        funding: 0,
        type: 1,
        level: '',
        country: 'UNITED KINGDOM',
        last_four: '4242',
        bin_code: '424242',
        issuer_zh_tw: '',
        bank_id: '',
        country_code: 'GB'
    },
    transaction_time_millis: 1581325720207,
    bank_transaction_time: {
        start_time_millis: '1581325720251',
        end_time_millis: '1581325720251'
    },
    bank_result_code: '',
    bank_result_msg: '',
    card_identifier: 'dee921560b074be7a860a6b44a80c21b',
    merchant_id: 'AppWorksSchool_CTBC'
};

describe('order', () => {

    before(async () => {
        const res = await requester
            .post('/api/1.0/user/signin')
            .send(user);
        const data = res.body.data;
        userId = data.user.id;
        accessToken = data.access_token;

        const orderModel = require('../server/models/order_model');
        const fakePayOrderByPrime = (tappayKey, tappayId, prime, order) => {
            return new Promise((resolve, reject) => {
                if (prime === VALID_PRIME) {
                    resolve(fakeTappayResponse);
                } else if (prime === INVALID_PRIME) {
                    resolve({status: 500});
                }
            });
        };
        stub = sinon.stub(orderModel, 'payOrderByPrime').callsFake(fakePayOrderByPrime);
    });

    it('checkout order with invalid data', async () => {
        const res = await requester
            .post('/api/1.0/order/checkout')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({});

        expect(res.statusCode).to.equal(400);
        expect(res.body.error).to.equal('Create Order Error: Wrong Data Format');
    });

    it('checkout order with invalid prime', async () => {
        const invalidOrderData = _.cloneDeep(orderData);
        invalidOrderData.prime = INVALID_PRIME;
        const res = await requester
            .post('/api/1.0/order/checkout')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(invalidOrderData);

        expect(res.statusCode).to.equal(400);
        expect(res.body.error).to.equal('Invalid prime');
    });

    it('checkout order with valid data and user', async () => {
        const res = await requester
            .post('/api/1.0/order/checkout')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(orderData);

        const orderNumber = res.body.data.number;
        const insertedOrders = await pool.query('SELECT * FROM order_table WHERE number = ?', [orderNumber]);
        const insertedOrder = insertedOrders[0][0];

        expect(insertedOrder.number).to.equal(orderNumber);
        expect(insertedOrder.status).to.equal(0);
        expect(insertedOrder.user_id).to.equal(userId);
        expect(insertedOrder.details).to.deep.equal(orderData.order);
        expect(insertedOrder.time).to.be.closeTo(Date.now(), 1000);

        const insertedPayments = await pool.query('SELECT * FROM payment WHERE order_id = ?', [insertedOrder.id]);
        const insertedPayment = insertedPayments[0][0];

        expect(insertedPayment.details).to.deep.equal(fakeTappayResponse);
    });

    it('checkout order without login', async () => {
        const res = await requester
            .post('/api/1.0/order/checkout')
            .send(orderData);

        expect(res.statusCode).to.equal(401);
    });

    after(() => {
        stub.restore();
    });
});