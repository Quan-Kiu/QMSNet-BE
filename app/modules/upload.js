const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema(
    {
        contentType: String,
        image: Buffer
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Upload', uploadSchema);
