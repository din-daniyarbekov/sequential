let mongoose = require('mongoose');

let tasks = mongoose.model('Tasks',{
    id: {
        type: Number
    },
    description: {
        type: String,
        maxlength: 300,
        minlength: 5
    },
    blocker: {
        type: Boolean,
        default: false
    },
    done: {
        type: Boolean,
        default: false
    },
    dueDate: {
        type: String,
        default: "2099-12-31"
    },
    priority: {
        type: Number,
        default: 0
    },
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

module.exports = {tasks};
