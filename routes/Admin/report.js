const express = require('express');
const ReportController = require('../../app/controllers/Admin/ReportController');
const router = express.Router();
const auth = require('../../middlewares/auth');
const admin = require("../../middlewares/admin");

router.post('/reports/create', auth, ReportController.new);
router.post('/reports/getAll', admin, ReportController.getAll);
router.patch('/reports/:id', admin, ReportController.update);

module.exports = router;