const createRes = require('../../utils/response_utils');
const ReportType = require('../modules/ReportType')


const ReportTypeController = {
    getAll: async (req, res, next) => {
        try {

            const reports = await ReportType.find(req.body)

            return res.json(createRes.success('Thành công', reports))

        } catch (error) {
            return next(error);
        }
    },
    new: async (req, res, next) => {
        try {
            const { datas } = req.body;
            console.log(datas)


            datas.forEach(async function (record) {

                const report = new ReportType(record);

                await report.save();

            });


            return res.json(createRes.success('Thành công'))

        } catch (error) {
            return next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            const data = req.body;
            const id = req.params.id;

            const report = await ReportType.findAndUpdateWithDeleted({
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

            const report = await ReportType.delete({
                _id: id
            });

            return res.json(createRes.success('Xóa loại báo cáo thành công', report))

        } catch (error) {
            return next(error);
        }
    },

}

module.exports = ReportTypeController;