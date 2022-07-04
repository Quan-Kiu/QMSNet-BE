const mongoose = require('mongoose');
const ReportType = require('./ReportType');


const ReportSchema = mongoose.Schema({
    type: ReportType.ReportTypeSchema,
    description: String,
    user: { type: mongoose.Types.ObjectId, ref: 'User' },
    post: { type: mongoose.Types.ObjectId, ref: 'Post' },
    comment: { type: mongoose.Types.ObjectId, ref: 'Comment' },
    sender: { type: mongoose.Types.ObjectId, ref: 'User' },
    status: {
        type: String,
        enum: [
            'P',
            'I',
            'R'
        ],
        default: 'P'
    },
    solvedBy: { type: mongoose.Types.ObjectId, ref: 'User' },

})


module.exports = mongoose.model('Report', ReportSchema)