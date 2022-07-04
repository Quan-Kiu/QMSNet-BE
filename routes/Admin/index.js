const userRoute = require("./user")
const reportTypeRoute = require("./reportType")
const reportRoute = require("./report")

const adminRouters = [
    userRoute,
    reportTypeRoute,
    reportRoute
]

module.exports = adminRouters;