const redis = require('redis');
const {REDIS_URL, REDIS_PORT} = require("../config/config");
const redisClient = redis.createClient({url: `${REDIS_URL}://redis:${REDIS_PORT}`});

DEFAULT_EXPERATION = 3600;
const redisConnect = async () => {
    await redisClient
        .connect()
        .then(() => console.log('Connected to Redis'))
        .catch((e) => {
            console.log(e);
        });
}

redisConnect().then();

exports.getOrSetCache = async (key, data, res, message) => {
    const redisData = JSON.parse(await redisClient.get(key));

    if (!data) {
        return res.status(404).json({
            status: 'fail',
            message: message
        });
    }

    //TODO fix the logic because data is not the same as redisData
    console.log(data)
    console.log(redisData)
    if (!redisData || redisData !== data) {
        console.log('Cache Miss!')
        await redisClient.set(key, JSON.stringify(data));
        return data;
    }

    console.log('Cache Hit!')
    return redisData;
}
