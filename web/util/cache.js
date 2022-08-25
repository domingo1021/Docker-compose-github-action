require('dotenv').config();
const redis = require('redis');
const { CACHE_HOST, CACHE_PORT, CACHE_USER, CACHE_PASSWORD } = process.env;

const redisClient = redis.createClient({
    socket: {
        host: CACHE_HOST,
        port: CACHE_PORT
    },
    username: CACHE_USER,
    password: CACHE_PASSWORD
});

redisClient.ready = false;

redisClient.on('ready', () => {
    redisClient.ready = true;
    console.log('Redis is ready');
});

redisClient.on('error', () => {
    redisClient.ready = false;
    if (process.env.NODE_ENV == 'production') {
        console.log('Error in Redis');
    }
});

redisClient.on('end', () => {
    redisClient.ready = false;
    console.log('Redis is disconnected');
});

module.exports = redisClient;
