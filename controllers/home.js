const UserModel = require('../models/User');
const CallModel = require('../models/Call');
const { v4: uuid4 } = require('uuid');

const startNewCall = async (req, res) => {
	const { hostUserName, invitees } = req.body;
	const host = await UserModel.findOne({username: hostUserName});
	const hostID = host.userID;

	const roomID = uuid4();
	const newRoom = new CallModel({
		roomID : roomID,
		hostID: hostID,
		invitees: invitees,
		participants: [],
		initiated: false,
	});
	await newRoom.save();

	res.json({
		success: true,
		roomID: roomID,
		hostID: hostID,
		msg: 'room started',
	});
}

const getContacts = async (req, res) => {
	const username = req.session.username;

	const user = await UserModel.findOne({username});
	if (user) {
		const contacts = user.contacts;
		res.status(200).json({
			success: true,
			contacts: user.contacts ?? [],
			msg: 'Successfully fetched contacts!'
		});
	} else {
		res.status(404).json({
			success: false,
			msg: 'User not found'
		});
	}
}

const addNewContact = async (req, res) => {
	const username = req.session.username;
	const contactUsername = req.body.username;

	let user = await UserModel.findOne({username});

	if (user) {
		const newContact = await UserModel.findOne({username: contactUsername});
		if (newContact) {
			user.contacts.push({
				userID: newContact.userID,
				username: contactUsername
			});
			user = await user.save();
			res.status(200).json({
				success: true,
				contacts: user.contacts ?? [],
				msg: 'Successfully added contact!'
			});
		} else {
			res.status(404).json({
				success: false,
				msg: 'No Such Contact'
			});
		}
	} else {
		res.status(404).json({
			success: false,
			msg: 'User not found'
		});
	}
}

const removeContacts = async (req, res) => {
	const contactUserID = req.body.userID;
	const userID = req.session.userID;
	const user = await UserModel.findOne({userID});
	if (user) {
		user.contacts = user.contacts.filter((c) => c.userID != contactUserID);
		await user.save();
		return res.json({success: true, contacts: user.contacts});
	}
	return res.json({success: false, msg: 'no such user exists'});
}

module.exports = { getContacts, addNewContact, startNewCall, removeContacts };