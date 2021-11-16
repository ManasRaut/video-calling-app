const UserModel = require('../models/User');
const CallModel = require('../models/Call');

const addNewParticipantInRoom = async ({ roomID, userID, userName }) => {
	const call = await CallModel.findOne({ roomID });
	if (call) {
		const newParticipant = {
			userID: userID,
			userName: userName,
			connected: true
		};
		call.participants.push(newParticipant);
		await call.save();
	}
}

const getParticipantsList = async ({ roomID }) => {
	const call = await CallModel.findOne({ roomID });
	if (call) {
		return {
			hostID: call.hostID,
			participants: call.participants,
		};
	} else {
		return [];
	}
}

const removeParticipantInRoom = async ({ roomID, userID, userName }) => {
	const call = await CallModel.findOne({ roomID });
	if (call) {
		call.participants = call.participants.filter((p) => p.userID != userID);
		await call.save();
	}
}

module.exports = {
	addNewParticipantInRoom,
	removeParticipantInRoom,
	getParticipantsList,
}