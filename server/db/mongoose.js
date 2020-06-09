let mongoose = require('mongoose');


mongoose.Promise = global.Promise;
if(process.env.MONGODB_URI){
    mongoose.connect(process.env.MONGODB_URI);
}else{
    mongoose.connect('mongodb://localhost:2717/SequenceApp');
}

module.exports = {
    mongoose: mongoose
};




