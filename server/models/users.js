
/* Users model */
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
    name: {
		type: String,
		required: true,
        minLength: 1,
        trim: true
    },
    email: {
			type: String,
			required: true,
			minlength: 1,
			trim: true, // trim whitespace
			unique: true,
			validate: {
				validator: validator.isEmail,
				message: 'Not valid email'
			}
		},
		password: {
			type: String,
			required: true,
			minlength: 5
		},
		isAdmin:{
			type:Boolean,
			required:true,
			default: false
		},
		tokens:[{
			access: {
				type: String,
				required: true	
			},
			token: {
				type: String,
				required: true
			}
		}]
})

UserSchema.methods.generateAuthToken = function () {
	debugger;
	let user = this;
	if(user.tokens.length > 0){
		debugger;
		return user.tokens[0].token;
	}
	let access = 'auth';
	let token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();
  
	user.tokens = user.tokens.concat([{access,token}]);
  
	return user.save().then(() => {
		debugger;
	  return token;
	});
  };



UserSchema.methods.deleteToken = function (token) {
	const user = this;
	return user.update({
		$pull: {
			tokens: {
				token: token
			}
		}
	});

  };

UserSchema.statics.findByToken = function (token) {
	var User = this;
	var decoded;
  
	try {
	  decoded = jwt.verify(token, 'abc123');
	} catch (e) {
	  return Promise.reject();
	}
  
	return User.findOne({
	  '_id': decoded._id,
	  'tokens.token': token,
	  'tokens.access': 'auth'
	});
  };



// The user finding function 
UserSchema.statics.findByEmailPassword = function(email, password) {
	const User = this

	return User.findOne({email: email}).then((user) => {
		if (!user) {
			return Promise.reject()
		}

		return new Promise((resolve, reject) => {
			bcrypt.compare(password, user.password, (error, result) => {
				debugger;
				if (result) {
					resolve(user);
				} else {
					reject(error);
				}
			})
		})
	})
}

// This function runs before saving user to database
UserSchema.pre('save', function(next) {
	const user = this

	if (user.isModified('password')) {
		bcrypt.genSalt(10, (error, salt) => {
			bcrypt.hash(user.password, salt, (error, hash) => {
				user.password = hash
				next()
			})
		})
	} else {
		next();
	}

}) 


const User = mongoose.model('User', UserSchema)

module.exports = { User }