const { register, login, logout } = require('./auth');
const { getContacts, addNewContact } = require('./home');

module.exports = {
	register, login, logout,
	getContacts, addNewContact,
};