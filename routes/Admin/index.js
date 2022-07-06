const userRoute = require("./user")
const reportTypeRoute = require("./reportType")
const reportRoute = require("./report")
const postRoute = require("./post")

const adminRouters = [
    userRoute,
    reportTypeRoute,
    reportRoute,
    postRoute
]

module.exports = adminRouters;