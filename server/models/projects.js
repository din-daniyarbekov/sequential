let mongoose = require('mongoose');

let projects = mongoose.model('Projects',{
    name: {
        type: String
    },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        default: null
    }],
    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }

});

module.exports = {projects}