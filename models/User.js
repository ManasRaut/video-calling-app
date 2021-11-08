const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
	userID: String,
	email: {
		type: String,
		required: true,
		unique: true
	},
	username: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required : true,
	},
	contacts: [
		{
			userID: String,
			username: String,
		}
	]
});

module.exports = mongoose.model("Users", userSchema);