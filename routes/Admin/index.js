const userRoute = require("./user")
const reportTypeRoute = require("./reportType")
const reportRoute = require("./report")
const postRoute = require("./post")
const commentRoute = require("./comment")
const postStyleRoute = require("./postStyle")

const adminRouters = [
    userRoute,
    reportTypeRoute,
    reportRoute,
    postRoute,
    commentRoute,
    postStyleRoute
]

module.exports = adminRouters;