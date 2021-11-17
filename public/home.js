// DOM refernces
const newContactsInput = document.querySelector("#new-contact-input");
const newCallContactsList = document.querySelector(".newCall-contacts-list");
const normalContactsList = document.querySelector(".contacts-list");
const callerScreenModal = document.querySelector("#caller-screen-cont");
const callLinkInput = document.querySelector("#call-link-input");

// Constants
const NEW_CONTACT_URL = "/api/addNewContact";
const GET_CONTACTS_URL = "/api/getContacts";
const REMOVE_CONTACTS_URL = "/api/deleteContact";
const NEW_CALL_URL = "/newCall";

// global variables
let contacts = [];
const selectedContacts = [];
const selectedContactsUserName = [];
let callInfo = {};

// socket
const socket = io("/");

// onload
window.onload = () => {
	socket.on('new-call-incoming', (data) => {
		callInfo = data;
		showCallerScreen(data);
	});

	socket.emit('home-socket-connected', {userID: userID});
	getContacts();
}

function showCallerScreen({invitees, hostUserName}) {
	callerScreenModal.style.display = 'block';
	document.querySelector(".caller-screen-members").innerHTML = 'Members: ' + invitees.map((i) => i + ", ")
	document.querySelector('.caller-screen-title').innerHTML = `${hostUserName} is calling you`;
}

// accept incoming call from other
function acceptCall() {
	window.location.href = `/${callInfo.roomID}`;
}

// join call using url
function joinCall() {
	const form = document.querySelector('#join-meet-form');
	const v = callLinkInput.value;
	if ( v && v != "") {
		let id = "";
		if (v.startsWith(window.location.origin)) {
			id = v.slice(window.location.origin.length+1);
		} else {
			id = v;
		}
		form.action = `/${id}`;
		form.submit();
	}
}

// to make a call with selected people redirect to /newCall
async function call() {
	const rawResponse = await fetch(NEW_CALL_URL, {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			invitees: selectedContacts,
			hostUserName: username,
		}),
	});
	const res = await rawResponse.json();
	socket.emit('ring-call', {
		roomID: res.roomID,
		inviteesUserName: selectedContactsUserName,
		userName: username,
		invitees: selectedContacts,
	});
	if (res.success) {
		window.location.href = `/${res.roomID}`;
	}
	closeModal("start-new-call-modal");
}

// to close Modal
function closeModal(id) {
	const modal = document.getElementById(`${id}`);
	modal.style.display = "none";
}

// show modal
function showModal(id) {
	const modal = document.getElementById(`${id}`);
	modal.style.display = "flex";
}

// select contact for new call
function selectContactForNewCall(id, usrname) {
	const contactItem = document.querySelector(`#newCall-${id}`);
	if (contactItem) {
		const userID = id;
		if (!selectedContacts.find((el) => el === userID)) {
			const tickIcon = document.createElement('i');
			tickIcon.setAttribute("class", "fas fa-check-circle");
			contactItem.append(tickIcon);
			selectedContacts.push(userID);
			selectedContactsUserName.push(usrname);
		} else {
			selectedContacts.splice(selectedContacts.indexOf(userID), 1);
			contactItem.removeChild(contactItem.lastElementChild);
			selectedContactsUserName.splice(selectedContactsUserName.indexOf(usrname), 1);
		}
	}
}

// add contacts in new call contacts list and normal contacts list
function updateContactsList() {
	normalContactsList.innerHTML = "";
	newCallContactsList.innerHTML = "";
	for (let contact of contacts) {
		const normalContact = document.createElement("div");
		normalContact.setAttribute("class", "contacts-list-item");
		normalContact.setAttribute("id", contact.userID);
		normalContact.innerHTML = `${contact.username}<div class="contacts-option-btn"
		- onclick="removeContact('${contact.userID}')"><i class="fas fa-trash-alt"></i></div>`;
		
		const newCallContact = document.createElement("div");
		newCallContact.setAttribute("class", "newCall-contacts-item");
		newCallContact.setAttribute("id", `newCall-${contact.userID}`);
		newCallContact.setAttribute("style", "margin: 4px;");
		newCallContact.setAttribute('onclick', 
			`selectContactForNewCall("${contact.userID}", "${contact.username}")`);
		const innerhtml = `${contact.username}`;
		newCallContact.innerHTML = innerhtml;

		normalContactsList.append(normalContact);
		newCallContactsList.append(newCallContact);
	}
	
	const newBtn = document.createElement("div");
	newBtn.setAttribute("class", "new-contact-btn");
	newBtn.setAttribute("onclick", "showModal('new-contact-modal')");
	newBtn.innerHTML = "New";
	normalContactsList.append(newBtn)
}

async function getContacts() {
	const rawResponse = await fetch(GET_CONTACTS_URL);
	const response = await rawResponse.json();
	contacts = response.contacts;
	updateContactsList();
}

async function addContact() {
	const username = newContactsInput.value;

	if (username && username != "") {
		const rawResponse = await fetch(NEW_CONTACT_URL, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				"username": username,
			}),
		});

		getContacts();
		newContactsInput.value = "";
		closeModal("new-contact-modal");
	}
}
async function removeContact(usrID) {
	const rawResponse = await fetch(REMOVE_CONTACTS_URL, {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			"userID": usrID,
		}),
	});
	console.log(await rawResponse.json())
	getContacts();
}