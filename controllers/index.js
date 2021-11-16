const { register, login, logout, checkUserExists, checkEmailExists } = require('./auth');
const { getContacts, addNewContact, startNewCall, removeContacts } = require('./home');
const { renderRoom, addAsInvitee } = require('./room');

module.exports = {
	register, login, logout, checkUserExists, checkEmailExists,
	getContacts, addNewContact, startNewCall, removeContacts, 
	renderRoom, addAsInvitee,
};