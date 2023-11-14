const {MONGO_USER, MONGO_PASSWORD, MONGO_IP, MONGO_PORT, MONGO_DATABASE} = require("./config/config");
const express = require('express');
const mongoose = require('mongoose');

//TODO change to typescript and use typeORM and use yarn

let mongoURL;
function mongoConnect() {
    if (!MONGO_USER && !MONGO_PASSWORD) {
        return mongoURL = `mongodb://${MONGO_IP}:${MONGO_PORT}/${MONGO_DATABASE}`;
    }
    return mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/${MONGO_DATABASE}`
}

mongoConnect();

const postRouter = require('./routes/postRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

const connectWithRetry = () => {
    mongoose
        .connect(mongoURL)
        .then(() => console.log('Successfully connected to DB'))
        .catch((e) => {
            console.log(e);
            setTimeout(connectWithRetry, 5000)
        });
}

connectWithRetry();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('<h2>Docker is easy</h2>')
});

app.use('/api/v1/posts', postRouter);
app.use('/api/v1/users', userRouter);
const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`listening on port ${port}`));
