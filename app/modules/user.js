const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        fullname: {
            type: 'String',
            required: true,
            maxLength: 30,
            minLength: 6,
        },

        username: {
            type: 'String',
            trim: true,
            required: true,
            unique: true,
            minLength: 6,
            maxLength: 30,
        },

        email: {
            type: 'String',
            trim: true,
            required: true,
            unique: true,
        },

        password: {
            type: 'String',
            required: true,
            minLength: 6,
        },

        avatar: {
            type: 'String',
            default:
                'https://res.cloudinary.com/quankiu/image/upload/v1640319328/qkmedia/default-avatar_hsejek.png',
        },

        role: {
            type: 'String',
            default: 'member',
        },

        gender: {
            type: 'String',
            default: 'Nam',
        },

        mobile: {
            type: 'String',
            default: '',
        },

        address: {
            type: 'String',
            default: '',
        },

        story: {
            type: 'String',
            default: '',
            maxLength: 200,
        },

        followers: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'User',
            },
        ],

        following: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'User',
            },
        ],
        saved: [{ type: mongoose.Types.ObjectId, ref: 'Post' }],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('User', userSchema);
