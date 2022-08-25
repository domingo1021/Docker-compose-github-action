require('dotenv');
const {expect, requester} = require('./set_up');
const {AUTHENTICATION_CODE} = process.env;
const {PORT} = process.env;
const {pool} = require('../server/models/mysqlcon');
const sinon = require('sinon');

const {users} = require('./fake_data');
const user1 = {
    provider: users[0].provider,
    email: users[0].email,
    password: users[0].password
};
let accessToken1;

const user2 = {
    provider: users[2].provider,
    email: users[2].email,
    password: users[2].password
};
let accessToken2;

let stub1;
let stub2;

describe('marketing', () => {

    before(async () => {
        const cache = require('../util/cache');

        // let cache do nothing
        stub1 = sinon.stub(cache, 'get').callsFake(() => {});
        stub2 = sinon.stub(cache, 'set').callsFake(() => {});
        stub2 = sinon.stub(cache, 'del').callsFake(() => {});

        const res1 = await requester
            .post('/api/1.0/user/signin')
            .send(user1);
        const data1 = res1.body.data;
        accessToken1 = data1.access_token;

        const res2 = await requester
            .post('/api/1.0/user/signin')
            .send(user2);
        const data2 = res2.body.data;
        accessToken2 = data2.access_token;
    });

    it('get campaign data', async () => {
        const res = await requester
            .get('/api/1.0/marketing/campaigns');

        const data = res.body.data;
        const expected =  [
            {
                'id': 1,
                'product_id': 1,
                'picture': `http://127.0.0.1:${PORT}/assets/1/keyvisual.jpg`,
                'story': '測試1'
            },
            {
                'id': 2,
                'product_id': 2,
                'picture': `http://127.0.0.1:${PORT}/assets/2/keyvisual.jpg`,
                'story': '測試2'
            },
            {
                'id': 3,
                'product_id': 3,
                'picture': `http://127.0.0.1:${PORT}/assets/3/keyvisual.jpg`,
                'story': '測試3'
            }
        ];
        expect(data).to.deep.equal(data, expected);
    });

    it('get hot data', async () => {
        const res = await requester
            .get('/api/1.0/marketing/hots');

        const data = res.body.data;
        expect(data.length).equal(2);

        const hot1 = data[0];
        expect(hot1.title).equal('hot1');
        expect(hot1.products.length).equal(3);

        const product1 = hot1.products[0];
        const expected = {
            id: 1,
            category: 'men',
            title: 'product1',
            description: 'Product 1',
            price: 100,
            texture: 'pt1',
            wash: 'pw1',
            place: 'pp1',
            note: 'pn1',
            story: 'ps1',
            colors: [ { code: 'FFFFFF', name: '白色' }, { code: 'DDFFBB', name: '亮綠' } ],
            sizes: [ 'S', 'M' ],
            variants: [
                { color_code: 'FFFFFF', size: 'S', stock: 2 },
                { color_code: 'FFFFFF', size: 'M', stock: 5 },
                { color_code: 'DDFFBB', size: 'S', stock: 2 }
            ],
            main_image: `http://127.0.0.1:${PORT}/assets/1/main.jpg`,
            images: [
                `http://127.0.0.1:${PORT}/assets/1/0.jpg`,
                `http://127.0.0.1:${PORT}/assets/1/1.jpg`,
                `http://127.0.0.1:${PORT}/assets/1/0.jpg`,
                `http://127.0.0.1:${PORT}/assets/1/1.jpg`
            ]
        };
        expect(product1).to.deep.equal(expected);
    });

    it('create hot data', async () => {
        await requester
            .post('/api/1.0/admin/hot')
            .set('Authorization', `Bearer ${accessToken1}`)
            .send({
                title: 'new hots',
                product_ids: '1,2,3',
                authentication_code: AUTHENTICATION_CODE
            });

        const hots = await pool.query('SELECT * FROM hot ORDER BY id DESC LIMIT 1');
        const products = await pool.query('SELECT * FROM hot_product WHERE hot_id = ?', hots[0][0].id);
        expect(products[0].map(x => x.product_id)).to.deep.equal([1,2,3]);
    });

    it('create hot data without login', async () => {
        const res = await requester
            .post('/api/1.0/admin/hot')
            .send({
                title: 'new hots',
                product_ids: '1,2,3',
            });
        expect(res.statusCode).to.equal(401);
    });

    it('create hot data without admin role', async () => {
        const res = await requester
            .post('/api/1.0/admin/hot')
            .set('Authorization', `Bearer ${accessToken2}`)
            .send({
                title: 'new hots',
                product_ids: '1,2,3',
            });

        expect(res.statusCode).to.equal(403);
    });

    after(() => {
        stub1.restore();
        stub2.restore();
    });
});