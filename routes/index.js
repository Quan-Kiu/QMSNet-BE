const authRoute = require('./auth');
const userRoute = require('./user');
const postRoute = require('./post');
const commentRoute = require('./comment');
const notifyRoute = require('./notify');
const messageRoute = require('./message');
const uploadRoute = require('./upload');

function routes(app) {
    app.use('/api', authRoute);
    app.use('/api', userRoute);
    app.use('/api', postRoute);
    app.use('/api', commentRoute);
    app.use('/api', notifyRoute);
    app.use('/api', messageRoute);
    app.use('/api', uploadRoute);
}

module.exports = routes;
