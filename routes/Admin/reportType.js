const express = require('express');
const ReportTypeController = require('../../app/controllers/Admin/ReportTypeController');
const routes = express.Router()
const admin = require("../../middlewares/admin");


routes.post('/reportTypes/getAll', admin, ReportTypeController.getAll)
routes.post('/reportTypes', admin, ReportTypeController.new)
routes.patch('/reportTypes/:id', admin, ReportTypeController.update)
routes.delete('/reportTypes/:id', admin, ReportTypeController.delete)

module.exports = routes;