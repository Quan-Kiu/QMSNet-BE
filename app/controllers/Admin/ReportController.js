const createRes = require('../../../utils/response_utils');
const { getFilter } = require('../../../utils/request_utils');
const Report = require('../../modules/report')
const APIFeatures = require('../../../utils/pagination')

const ReportController = {
    getAll: async (req, res, next) => {
        try {
            const filter = getFilter(req);

            const features = new APIFeatures(await Report.find(filter).populate(

                'user', '-password',

            ).populate('post').populate('comment'), req.body).paginating();

            return res.json(createRes.success('Thành công!', {
                rows: features.query,
                total: features.total,
                pagination: {
                    page: req?.body?.page,
                    limit: req?.body?.limit,
                    count: features.count
                }
            }))

        } catch (error) {
            return next(error);
        }
    },
    new: async (req, res, next) => {
        try {
            const data = req.body;
            console.log(data)

            const report = new Report(data);

            await report.save();

            return res.json(createRes.success('Báo cáo thành công', report))

        } catch (error) {
            return next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            const data = req.body;
            const id = req.params.id;

            const report = await Report.findOneAndUpdate({
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