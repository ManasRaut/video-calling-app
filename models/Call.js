const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CallSchema = new Schema({
	roomID : String,
	hostID: String,
	invitees: [String],
	participants: [String],
	initiated: Boolean,
});

module.exports = mongoose.model('Calls', CallSchema);