let mongoose = require('mongoose');


mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/SequenceApp');



module.exports = {
    mongoose: mongoose
};




