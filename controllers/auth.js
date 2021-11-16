const UserModel = require('../models/User');

const bcrypt = require('bcryptjs');
const { v4: uuid4 } = require('uuid');

const register = async (req, res) => {
	const {email, username, password} = req.body;
	
	const existingUser = await UserModel.findOne({email});
	if (existingUser) {
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
	req.session.userID = user.userID;
	return res.redirect('/home');
}

const logout = async (req, res) => {
	req.session.destroy((err) => {
		if (err) console.log(err);
		res.redirect('/');
	});
}

const checkUserExists = async (req, res) => {
	try {
		const username = req.query.usrnme;
		const user = await UserModel.findOne({username});
		if (user) {
			return res.json({success: true});
		} else {
			return res.json({success: false});
		}
	} catch(err) {
		console.log('Errot in checkUserExists', err);
	}
}

const checkEmailExists = async (req, res) => {
	try {
		const email = req.query.email;
		const user = await UserModel.findOne({email});
		if (user) {
			return res.json({success: true});
		} else {
			return res.json({success: false});
		}
	} catch(err) {
		console.log('Errot in checkEmailExists', err);
	}
}

module.exports = {register, login, logout, checkUserExists, checkEmailExists};