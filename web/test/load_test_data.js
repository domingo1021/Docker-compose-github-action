const {Generator, beta_trans, beta_left_trans, beta_right_trans} = require('./random_number_generator');
const _ = require('lodash');
const ORDER_QUANTITY = 5000;

const product_count_generator = new Generator(5, beta_left_trans);
const product_id_generator = new Generator(10, beta_trans);
const product_price_generator1 = new Generator(300, beta_right_trans);
const product_price_generator2 = new Generator(1200, beta_left_trans);
const product_color_generator = new Generator(5, beta_trans);
const product_size_generators = [
    new Generator(3, beta_left_trans),
    new Generator(3, beta_trans),
    new Generator(3, beta_right_trans),
    new Generator(3, beta_trans),
];
const product_quantity_generator = new Generator(10, beta_left_trans);

const colors = [
    {code: '#EEEEEE', name: 'White'},
    {code: '#111111', name: 'Black'},
    {code: '#EE0000', name: 'Red'},
    {code: '#00EE00', name: 'Green'},
    {code: '#0000EE', name: 'Blue'},
    {code: '#EEEE00', name: 'Yellow'},
    {code: '#00EEEE', name: 'Aqua'},
    {code: '#EE00EE', name: 'Fuchsia'},
    {code: '#800080', name: 'Purple'},
    {code: '#C0C0C0', name: 'Silver'},
].sort(() => Math.random() - Math.random()).slice(0, 5);
const sizes = ['S', 'M', 'L'];

const getTotalOrders = () => {
    let totalOrders = [];
    for (let i=0; i < ORDER_QUANTITY; i++) {
        let used_keys = new Set();
        let products = [];
        let product_count = 1 + product_count_generator.generate();
        for (let j = 0; j < product_count; j ++) {
            let id = 1 + product_id_generator.generate();
            let color = colors[product_color_generator.generate()];
            let size = sizes[product_size_generators[id % 4].generate()];
            let key = id + '|' + color.code + '|' + size;
            if (used_keys.has(key)) {
                continue;
            } else {
                used_keys.add(key);
                products.push({
                    id,
                    price: 500 + product_price_generator1.generate() + product_price_generator2.generate(),
                    color,
                    size,
                    qty: 1 + product_quantity_generator.generate()
                });
            }
        }

        let order = {
            total: _.sumBy(products, p => p.price * p.qty),
            list: products,
        };
        totalOrders.push(order);
    }
    return totalOrders;
};

module.exports = {
    getTotalOrders
};
