const authRoute = require('./auth');
const userRoute = require('./user');
const postRoute = require('./post');
const commentRoute = require('./comment');
const notifyRoute = require('./notify');
const adminRoutes = require('./Admin');
const messageRoute = require('./message');
const reportTypeRoute = require('./reportType');

function routes(app) {
    app.use('/api', authRoute);
    app.use('/api', userRoute);
    app.use('/api', postRoute);
    app.use('/api', commentRoute);
    app.use('/api', notifyRoute);
    app.use('/api', messageRoute);
    app.use('/api/admin', adminRoutes);
    app.use('/api', reportTypeRoute);
}

module.exports = routes;
