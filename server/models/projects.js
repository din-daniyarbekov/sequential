let mongoose = require('mongoose');

// let projects = mongoose.model('Projects',{
//     name: {
//         type: String,
//         required: true,
//         minlength: 1
//     },
//     tasks: [{
//         id: {
//             type: Number
//         },
//         text: {
//             type: String,
//             maxlength: 300,
//             minlength: 5
//         },
//         blocker: {
//             type: Boolean,
//             default: false
//         },
//         done: {
//             type: Boolean,
//             default: false
//         },
//         dueDate: {
//             type: Date,
//             required: true
//         },
//         priority: {
//             type: Number,
//             default: 0
//         },
//         assignee:{
//             type: mongoose.Schema.Types.ObjectId,
//             required: true
//         },
//     }],
//     admin: {
//         type: mongoose.Schema.Types.ObjectId,
//         required: true
//     },
//     users:[{
//         type: mongoose.Schema.TypesObjectId,
//         default: null
//     }]

// });

const ProjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 1,
        trim:true
    },
    tasks: {
        type:[{
            id: {
                type: Number,
                required: true
            },
            text: {
                type: String,
                maxlength: 300,
                minlength: 5,
                trim: true
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
                type: Date,
                required: true,
            },
            priority: {
                type: Number,
                default: 0
            },
            assignee:{
                type: mongoose.Schema.ObjectId,
                required: true
            },
            assigneeEmail:{
                type: String,
                required: true
            }
        }],
        default:[]
    },
    admin: {
        type: mongoose.Schema.ObjectId ,
        required: true
    },
    projectUsers:{
        type:[{
            name:{
                type: String,
                required: true
            },
            email:{
                type: String,
                required: true,
			    minlength: 1,
			    trim: true,
                unique: true,
                sparse: true
            }
        }],
        default:[]
    }
}, {
    usePushEach:true
})
const Projects = mongoose.model('Project', ProjectSchema)

module.exports = {Projects}