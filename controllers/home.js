const UserModel = require('../models/User');

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

module.exports = { getContacts, addNewContact };