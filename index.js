//controllers
const controllers = require('./controllers/index.js');

// middleware
const middleware = require('./middleware/index.js');

// utils
const { addNewParticipantInRoom ,getParticipantsList, 
	removeParticipantInRoom} = require('./utils/room.js');

const mongoose = require('mongoose');
const session = require('express-session');
const MongoSessionStorage = require('connect-mongodb-session')(session);
const express = require('express');
const app = express();

// http server
const server = require('http').createServer(app);

require('dotenv').config();

// socket io
const io = require("socket.io")(server);
const connectedSockets = [];

// setup peer server
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
	debug: true,
});
app.use('/peerjs', peerServer);

// CONSTANTS
const DEFAULT_PORT = 5000;
const DB_URL = process.env.MONGODB_URI || 'mongodb://localhost:27017/videoCallApp';

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
app.get('/', middleware.isNotAuth, (req, res) => {
	res.render('landingPage.ejs');
});

app.get('/login', middleware.isNotAuth, (req, res) => {
	res.render('login.ejs', {postStatus: false});
});

app.get('/signup', middleware.isNotAuth, (req, res) => {
	res.render('signup.ejs');
});

app.get('/home', middleware.isAuth, (req, res) => {
	const username = req.session.username;
	res.render('home.ejs', {username: username, userID: req.session.userID});
});
// -------------------------------------------------------

// ------------------- api routes ------------------------
app.post('/register', controllers.register);

app.post('/login', controllers.login);

app.post('/logout', controllers.logout);

app.get('/api/userExists', controllers.checkUserExists);

app.get('/api/emailExists', controllers.checkEmailExists);

app.get('/api/getContacts', middleware.isApiCallValid, controllers.getContacts);

app.post('/api/addNewContact', middleware.isApiCallValid, controllers.addNewContact);

app.post('/api/deleteContact', middleware.isApiCallValid, controllers.removeContacts);

app.post('/newCall', middleware.isApiCallValid, controllers.startNewCall);

app.get("/:roomID", middleware.isApiCallValid, controllers.renderRoom);
// -------------------------------------------------------


// --------------------- Sockets ---------------------------
io.on('connection', (socket) => {
	connectedSockets.push(socket.id);

	// home screen socket events
	socket.on('home-socket-connected', async (data) => {
		const {userID} = data;
		socket.join(userID);

		socket.on('ring-call', (callData) => {
			for(let invitee of callData.invitees) {
				socket.to(invitee).emit('new-call-incoming', {
					roomID: callData.roomID,
					hostUserName: callData.userName,
					invitees: callData.inviteesUserName,
				});
			}
		});
	});

	// waiting room sockets
	socket.on('ask-permission-to-join', (permissionData) => {
		socket.join(permissionData.userID);
		socket.broadcast.to(permissionData.roomID).emit('asking-permission', permissionData);
	});

	// room.js socket events
	socket.on('new-user-joining-room', async (data) => {
		const {roomID, userID} = data;
		socket.join(roomID);

		// add participant in participants list
		await addNewParticipantInRoom(data);
		let participants = await getParticipantsList(data);

		// braodcast to all users that new user connected if any
		socket.broadcast.to(roomID).emit('new-user-connected', data);
		// refresh participants list
		socket.broadcast.to(roomID).emit('participants-list', participants);
		socket.emit('participants-list', participants);

		// broadcasting messages
		socket.on('message', (messageData) => {
			socket.broadcast.to(roomID).emit('message', messageData);
		});

		socket.on('video-stream-changed', (streamData) => {
			socket.broadcast.to(roomID).emit('video-stream-changed', streamData);
		});

		socket.on('accept-person', async (data) => {
			await controllers.addAsInvitee(data);
			socket.to(data.userID).emit('permission-granted');
		});

		socket.on('decline-person', (data) => {
			socket.to(data.userID).emit('permission-rejected');
		});

		socket.on('disconnect', async () => {
			await removeParticipantInRoom(data);
			let participants = await getParticipantsList(data);
			socket.broadcast.to(roomID).emit('new-user-disconnected', data);
			socket.broadcast.to(roomID).emit('participants-list', participants);
		})
	});

	socket.on('disconnect', async () => {
		const index = connectedSockets.indexOf(socket.id);
		connectedSockets.splice(index, 1);
	});
});
// ---------------------------------------------------------

server.listen(process.env.PORT || DEFAULT_PORT, () => {
	console.log(`Server running at http://localhost:${DEFAULT_PORT}`)
});