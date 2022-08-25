/* eslint-disable no-unused-vars */
require('dotenv').config();
const {pool} = require('../server/models/mysqlcon');
const {getTotalOrders} = require('./load_test_data');
const totalOrders = getTotalOrders();
const {Generator, beta_trans} = require('./random_number_generator');
const user_id_generator = new Generator(5, beta_trans);

async function createFakeOrder(orders) {
    return await pool.query('INSERT INTO order_table (user_id, number, time, status, details, total) VALUES ?',
        [orders.map((x, i) => ([
            1 + user_id_generator.generate(),
            i,
            Date.now(),
            0,
            JSON.stringify(x),
            x.total,
        ]))]
    );
}

async function createFakeData() {
    let i = 0;
    while (i < totalOrders.length) {
        let j = 0;
        let orders = [];
        while (j < Math.min(10000, totalOrders.length)){
            orders.push(totalOrders[i+j]);
            j += 1;
        }
        i += j;
        await createFakeOrder(orders);
    }
}

async function truncateFakeData() {
    console.log('truncate fake data');
    const truncateTable = async (table) => {
        const conn = await pool.getConnection();
        await conn.query('START TRANSACTION');
        await conn.query('SET FOREIGN_KEY_CHECKS = ?', 0);
        await conn.query(`TRUNCATE TABLE ${table}`);
        await conn.query('SET FOREIGN_KEY_CHECKS = ?', 1);
        await conn.query('COMMIT');
        await conn.release();
        return;
    };

    return await truncateTable('order_table');
}

async function closeConnection() {
    return await pool.end();
}

async function main() {
    await truncateFakeData();
    await createFakeData();
    await closeConnection();
}

// execute when called directly.
if (require.main === module) {
    console.log('main');
    main();
}

module.exports = {
    createFakeData,
    truncateFakeData,
    closeConnection,
};