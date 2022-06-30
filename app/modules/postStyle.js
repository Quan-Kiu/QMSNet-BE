const mongoose = require('mongoose');

const postStyleSchema = new mongoose.Schema(
    {
        background: {
            type: String,
        },
        color: {
            type: String,
        }
    }
);

module.exports = mongoose.model('PostStyle', postStyleSchema);
