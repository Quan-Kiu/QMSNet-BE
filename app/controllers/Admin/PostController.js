const createRes = require('../../../utils/response_utils');
const { getFilter } = require('../../../utils/request_utils');
const Post = require('../../modules/post')
const APIFeatures = require('../../../utils/pagination')

const PostController = {
    getAll: async (req, res, next) => {
        try {
            const filter = getFilter(req);

            const features = new APIFeatures(await Post.find(filter).populate(
                'user', '-password',
            ).sort('-createdAt'), req.body).paginating();

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
    delete: async (req, res, next) => {
        try {
            const id = req.params.id;

            const Post = await Post.delete({
                _id: id
            });

            return res.json(createRes.success('Xóa loại báo cáo thành công', Post))

        } catch (error) {
            return next(error);
        }
    },

}

module.exports = PostController;