const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CallSchema = new Schema({
	roomID : String,
	hostID: String,
	invitees: [String],
	participants: [{
		userID: String,
		userName: String,
		connected: Boolean,
	}],
	initiated: Boolean,
});

module.exports = mongoose.model('Calls', CallSchema);