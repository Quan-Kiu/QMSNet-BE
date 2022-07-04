const createRes = require('../../utils/response_utils');
const Report = require('../modules/report')
const APIFeatures = require('../../utils/pagination')

const ReportController = {
    getAll: async (req, res, next) => {
        try {

            // const reports = APIFeatures(await Report.findWithDeleted(req.body.filter))

            return res.json(createRes.success('Thành công', reports))

        } catch (error) {
            return next(error);
        }
    },
    new: async (req, res, next) => {
        try {
            const data = req.body;

            const report = new Report(data);

            await report.save();

            return res.json(createRes.success('Thành công', report))

        } catch (error) {
            return next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            const data = req.body;
            const id = req.params.id;

            const report = await Report.findAndUpdateWithDeleted({
                _id: id
            }, data, {
                new: true
            });


            return res.json(createRes.success('Chỉnh sửa loại báo cáo thành công', report))

        } catch (error) {
            return next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            const id = req.params.id;

            const report = await Report.delete({
                _id: id
            });

            return res.json(createRes.success('Xóa loại báo cáo thành công', report))

        } catch (error) {
            return next(error);
        }
    },

}

module.exports = ReportController;