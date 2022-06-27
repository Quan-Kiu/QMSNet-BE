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
            public_id: {type:String,
                default: 'qmedia/fhphniflhpcrkm84qnlc'
             },
            url: {type:String,
            default: 'http://res.cloudinary.com/quankiu/image/upload/v1654968194/qmedia/fhphniflhpcrkm84qnlc.png'},
            
        },
        gender: {
            type: 'Number',
            default: 1,
        },
        dob: {
            type: 'String'
        },
        works: [{
            name: String,
            position: String,
            working: Boolean
        }],
        schools: [{
            name: String,
            learning: Boolean
        }],
        maritalStatus:{
            type: 'Number',
            enum: [1,2],
            default: 1,
        },
        address: {
            province: String,
            district: String,
        },
        countryside:{ 
            province: String,
            district: String,
        },
        mobile: {
            type: 'String',
            default: '',
        },
        story: {
            type: 'String',
            default: '',
            maxLength: 200,
        },
        friends: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'User',
            },

        ],

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
        userSettings: Object,
        saved: [{ type: mongoose.Types.ObjectId, ref: 'Post' }],
        isAdmin: {
            type: Boolean,
            default: false
        },


    },
    {
        timestamps: true,
    }
);


module.exports = mongoose.model('User', userSchema);
