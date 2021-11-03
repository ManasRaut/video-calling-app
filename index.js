const UserModel = require('./models/User');

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoSessionStorage = require('connect-mongodb-session')(session);
const express = require('express');
const app = express();

// http server
const server = require('http').createServer(app);

// CONSTANTS
const DEFAULT_PORT = 5000;
const DB_URL = 'mongodb://localhost:27017/videoCallApp';

// connect to Database
mongoose.connect(DB_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
}).then(() => {
	console.log('Connected to Database');
});

// mongodb session storage
const sessionStorage = new MongoSessionStorage({
	uri: DB_URL,
	collection: 'sessions',
});

// express
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(session({
	secret: 'A Secret Key',
	saveUninitialized: false,
	resave: false,
	store: sessionStorage,
}));

// --------------------Middleware-------------------------
const isAuth = (req, res, next) => {
	if (req.session.isAuth) {
		next();
	} else {
		res.redirect('/');
	}
}
// -------------------------------------------------------

// -------------------render routes----------------------
app.get('/', (req, res) => {
	res.render('landingPage.ejs');
});

app.get('/login', (req, res) => {
	res.render('login.ejs');
});

app.get('/signup', (req, res) => {
	res.render('signup.ejs');
});

app.get('/home', isAuth, (req, res) => {
	const username = req.session.username;
	res.render('home.ejs', {username: username});
});
// -------------------------------------------------------

// ------------------- api routes ------------------------
app.post('/register', async (req, res) => {
	const {email, username, password} = req.body;
	
	const existingUser = await UserModel.findOne({email});
	if (existingUser) {
		console.log('User exists');
		return res.redirect('/signup');
	}

	const hashedPassword = await bcrypt.hash(password, 10);
	newUser = new UserModel({
		email,
		username,
		password: hashedPassword
	});
	await newUser.save();
	res.redirect('/login');
});

app.post('/login', async (req, res) => {
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
});

app.post('/logout', async (req, res) => {
	req.session.destroy((err) => {
		if (err) console.log(err);
		res.redirect('/');
	});
});
// -------------------------------------------------------

server.listen(DEFAULT_PORT, () => {
	console.log(`Server running at http://localhost:${DEFAULT_PORT}`)
});