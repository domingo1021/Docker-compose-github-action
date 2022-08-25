require('dotenv');
const {expect, requester} = require('./set_up');
const {PORT} = process.env;

describe('products', async () => {
    it('select all products without setting page', async () => {
        const res = await requester
            .get('/api/1.0/products/all');

        const next_paging = res.body.next_paging;
        const data = res.body.data;

        expect(next_paging).to.equal(1);
        expect(data.length).to.equal(6);

        const product2expected = {
            id: 2,
            category: 'women',
            title: 'product2',
            description: 'Product 2',
            price: 200,
            texture: 'pt2',
            wash: 'pw2',
            place: 'pp2',
            note: 'pn2',
            story: 'ps2',
            colors: [ { code: 'FFFFFF', name: '白色' }, { code: 'DDFFBB', name: '亮綠' } ],
            sizes: [ 'S', 'L' ],
            variants: [
                { color_code: 'FFFFFF', size: 'S', stock: 2 },
                { color_code: 'DDFFBB', size: 'L', stock: 2 }
            ],
            main_image: `http://127.0.0.1:${PORT}/assets/2/main.jpg`,
            images: [
                `http://127.0.0.1:${PORT}/assets/2/0.jpg`,
                `http://127.0.0.1:${PORT}/assets/2/1.jpg`,
                `http://127.0.0.1:${PORT}/assets/2/0.jpg`,
                `http://127.0.0.1:${PORT}/assets/2/1.jpg`
            ]
        };

        expect(data[1]).to.deep.equalInAnyOrder(product2expected);
    });

    it('select all products at page 2', async () => {
        const res = await requester
            .get('/api/1.0/products/all?paging=2');

        const next_paging = res.body.next_paging;
        const data = res.body.data;

        expect(next_paging).to.equal(undefined);
        expect(data.length).to.equal(2);
        expect(data[0].id).to.equal(13);
        expect(data[0].title).to.equal('test searchkey product13');
    });

    it('select products with wrong parameter', async () => {
        // men
        const res = await requester
            .get('/api/1.0/products/wrong_parameter');

        expect(res.status).to.equal(400);
        expect(JSON.parse(res.text)).to.deep.equal({ error: 'Wrong Request' });
    });

    it('select products with category', async () => {
        // men
        const res1 = await requester
            .get('/api/1.0/products/men');

        const data1 = res1.body.data;
        expect(data1.length).to.equal(6);
        expect(data1[0].category).to.equal('men');

        // men page 1
        const res2 = await requester
            .get('/api/1.0/products/men?paging=1');

        const data2 = res2.body.data;
        expect(data2.length).to.equal(3);
        expect(data2[0].category).to.equal('men');

        // women
        const res3 = await requester
            .get('/api/1.0/products/women');

        const data3 = res3.body.data;
        expect(data3.length).to.equal(2);
        expect(data3[0].category).to.equal('women');

        // accessories
        const res4 = await requester
            .get('/api/1.0/products/accessories');

        const data4 = res4.body.data;
        expect(data4.length).to.equal(3);
        expect(data4[0].category).to.equal('accessories');
    });

    it('select products with search key', async () => {
        const res = await requester
            .get('/api/1.0/products/search?keyword=searchkey');

        const data = res.body.data;

        expect(data.length).to.equal(5);
        expect(data[0].id).to.equal(10);
        expect(data[0].title).to.equal('test searchkey product10');
    });

    it('select products with search key which have no data', async () => {
        const res = await requester
            .get('/api/1.0/products/search?keyword=nodatakey');

        const data = res.body.data;

        expect(data.length).to.equal(0)
    });

    it('select product detail', async () => {
        const res = await requester
            .get('/api/1.0/products/details?id=1');

        const data = res.body.data;

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
        expect(data).to.deep.equalInAnyOrder(expected);
    });

    it('select product detail with id which can not find data', async () => {
        const res = await requester
            .get('/api/1.0/products/details?id=0');

        expect(res.status).to.equal(200);

        const body = res.body;
        expect(body).to.deep.equal({data: null});
    });

    it('select product detail with id which is not integer', async () => {
        const res = await requester
        .get('/api/1.0/products/details?id=aaa');

        expect(res.status).to.equal(400);

        const error = res.body.error;
        expect(error).to.equal('Wrong Request');
    });
});
