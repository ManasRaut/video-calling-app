console.log(roomID);
console.log(userID);
console.log(hostID);
console.log(userName);
console.log(hostName);

const socket = io('/');

window.onload = () => {
	socket.on('permission-granted', (data) => {
		document.querySelector('#join-room-form').submit();
	});
	socket.on('permission-rejected', (data) => {
		console.log('rejected');
		document.querySelector('.waiting-title').innerHTML = `${hostName} rejected your permission`;
		document.querySelector('.big-highlighted-btns').style.display = 'none';
		document.querySelector('#go-back-form').style.display = 'block';
	});
	socket.emit('ask-permission-to-join', {
		roomID,
		userID,
		userName,
		hostID,
	});
};