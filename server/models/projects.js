let mongoose = require('mongoose');

let projects = mongoose.model('Projects',{
    name: {
        type: String,
        required: true,
        minlength: 1
    },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        default: null
    }],
    _admin: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    users:[{
        type: mongoose.Schema.TypesObjectId,
        default: null
    }]

});

module.exports = {projects}