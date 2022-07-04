const mongoose = require('mongoose');

const ReportTypeSchema = mongoose.Schema({
    type: {
        type: String,
        enum: ['C', 'A']
    },
    name: String,
})


module.exports = mongoose.model('ReportType', ReportTypeSchema)
