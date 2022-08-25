require('dotenv').config();
const {NODE_ENV} = process.env;
const bcrypt = require('bcrypt');
const {
    users,
    roles,
    products,
    product_images,
    colors,
    variants,
    hots,
    hot_products,
    campaigns,
} = require('./fake_data');
const {pool} = require('../server/models/mysqlcon');
const salt = parseInt(process.env.BCRYPT_SALT);

async function _createFakeUser(conn) {
    const encryped_users = users.map(user => {
        const encryped_user = {
            provider: user.provider,
            role_id: user.role_id,
            email: user.email,
            password: user.password ? bcrypt.hashSync(user.password, salt) : null,
            name: user.name,
            picture: user.picture,
            access_token: user.access_token,
            access_expired: user.access_expired,
            login_at: user.login_at
        };
        return encryped_user;
    });
    return await conn.query('INSERT INTO user (provider, role_id, email, password, name, picture, access_token, access_expired, login_at) VALUES ?', [encryped_users.map(x => Object.values(x))]);
}

async function _createFakeRole(conn) {
    return await conn.query('INSERT INTO role (id, name) VALUES ?', [roles.map(x => Object.values(x))]);
}

async function _createFakeProduct(conn) {
    return await conn.query('INSERT INTO product (id, category, title, description, price, texture, wash, place, note, story, main_image) VALUES ?', [products.map(x => Object.values(x))]);
}

async function _createFakeProductImages(conn) {
    return await conn.query('INSERT INTO product_images (product_id, image) VALUES ?', [product_images.map(x => Object.values(x))]);
}

async function _createFakeColor(conn) {
    return await conn.query('INSERT INTO color (id, name, code) VALUES ?', [colors.map(x => Object.values(x))]);
}

async function _createFakeVariant(conn) {
    return await conn.query('INSERT INTO variant (product_id, color_id, size, stock) VALUES ?', [variants.map(x => Object.values(x))]);
}

async function _createFakeHot(conn) {
    await conn.query('INSERT INTO hot (title) VALUES ?', [hots.map(x => Object.values(x))]);
    await conn.query('INSERT INTO hot_product (hot_id, product_id) VALUES ?', [hot_products.map(x => Object.values(x))]);
}

async function _createFakeCampaign(conn) {
    return await conn.query('INSERT INTO campaign (product_id, picture, story) VALUES ?', [campaigns.map(x => Object.values(x))]);

}

async function createFakeData() {
    if (NODE_ENV !== 'test') {
        console.log('Not in test env');
        return;
    }
    const conn = await pool.getConnection();
    await conn.query('START TRANSACTION');
    await conn.query('SET FOREIGN_KEY_CHECKS = ?', 0);
    await _createFakeProduct(conn);
    await _createFakeProductImages(conn);
    await _createFakeRole(conn);
    await _createFakeUser(conn);
    await _createFakeColor(conn);
    await _createFakeVariant(conn);
    await _createFakeHot(conn);
    await _createFakeCampaign(conn);
    await conn.query('SET FOREIGN_KEY_CHECKS = ?', 1);
    await conn.query('COMMIT');
    await conn.release();
}

async function truncateFakeData() {
    if (NODE_ENV !== 'test') {
        console.log('Not in test env');
        return;
    }

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

    const tables = ['user', 'role', 'product', 'product_images', 'color', 'variant', 'hot', 'hot_product', 'campaign', 'order_table', 'payment'];
    for(let table of tables) {
        await truncateTable(table);
    }

    return;
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
    main();
}

module.exports = {
    createFakeData,
    truncateFakeData,
    closeConnection,
};