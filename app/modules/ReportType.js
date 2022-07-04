const mongoose = require('mongoose');

const ReportTypeSchema = mongoose.Schema({
    type: {
        type: String,
        enum: ['C', 'A']
    },
    name: String,
    key: {
        type: String,
        unique: true
    },
})



module.exports = mongoose.model('Report', ReportTypeSchema)
