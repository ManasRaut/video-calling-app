const UserModel = require('../models/User');

const bcrypt = require('bcryptjs');
const { v4: uuid4 } = require('uuid');

const register = async (req, res) => {
	const {email, username, password} = req.body;
	
	const existingUser = await UserModel.findOne({email});
	if (existingUser) {
		console.log('User exists');
		return res.redirect('/signup');
	}

	const hashedPassword = await bcrypt.hash(password, 10);
	const userID = uuid4();
	newUser = new UserModel({
		userID,
		email,
		username,
		password: hashedPassword,
		contacts : []
	});
	await newUser.save();
	res.redirect('/login');
}

const login = async (req, res) => {
	const {email, password} = req.body;

	const user = await UserModel.findOne({email});
	if (!user) {
		console.log('User does not exists');
		return res.redirect('/login');
	}

	const isPasswordCorrect = await bcrypt.compare(password, user.password);
	if (!isPasswordCorrect)	{
		console.log('Incorrect password');
		return res.redirect('/login');	
	}

	req.session.isAuth = true;
	req.session.username = user.username;
	return res.redirect('/home');
}

const logout = async (req, res) => {
	req.session.destroy((err) => {
		if (err) console.log(err);
		res.redirect('/');
	});
}

module.exports = {register, login, logout};