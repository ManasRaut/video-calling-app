const { register, login, logout } = require('./auth');
const { getContacts, addNewContact, startNewCall, removeContacts, initiateRoom } = require('./home');

module.exports = {
	register, login, logout,
	getContacts, addNewContact, startNewCall, removeContacts, initiateRoom
};