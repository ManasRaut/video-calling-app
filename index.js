//controllers
const controllers = require('./controllers/index.js');

// middleware
const middleware = require('./middleware/index.js');

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
app.use(express.json());
app.use(session({
	secret: 'A Secret Key',
	saveUninitialized: false,
	resave: false,
	store: sessionStorage,
}));

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

app.get('/home', middleware.isAuth, (req, res) => {
	const username = req.session.username;
	res.render('home.ejs', {username: username});
});
// -------------------------------------------------------

// ------------------- api routes ------------------------
app.post('/register', controllers.register);

app.post('/login', controllers.login);

app.post('/logout', controllers.logout);

app.get('/api/getContacts', middleware.isApiCallValid, controllers.getContacts);

app.post('/api/addNewContact', middleware.isApiCallValid, controllers.addNewContact);
// -------------------------------------------------------

server.listen(DEFAULT_PORT, () => {
	console.log(`Server running at http://localhost:${DEFAULT_PORT}`)
});