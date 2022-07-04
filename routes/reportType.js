const express = require('express');
const ReportTypeController = require('../app/controllers/ReportTypeController');
const routes = express.Router()


routes.post('/reportType/getAll', ReportTypeController.getAll)
routes.post('/reportType', ReportTypeController.new)
routes.patch('/reportType/:id', ReportTypeController.update)
routes.delete('/reportType/:id', ReportTypeController.delete)

module.exports = routes;