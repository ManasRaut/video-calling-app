// DOM refernces
const newContactsInput = document.querySelector("#new-contact-input");
const newCallContactsList = document.querySelector(".newCall-contacts-list");
const normalContactsList = document.querySelector(".contacts-list");
const callerScreenModal = document.querySelector("#caller-screen-cont");

// Constants
const NEW_CONTACT_URL = "http://localhost:5000/api/addNewContact";
const GET_CONTACTS_URL = "http://localhost:5000/api/getContacts";
const NEW_CALL_URL = "http://localhost:5000/newCall";

// global variables
let contacts = [];
const selectedContacts = [];
let callInfo = {};

// onload
window.onload = () => {
	getContacts();
}

// socket
const socket = io('/');

socket.on('calling', (data) => {
	// const { invitees, roomID, hostID } = data;
	// callInfo = {
	// 	hostID: hostID,
	// 	roomID: roomID,
	// 	invitees: invitees,
	// };
	// if (!(callerScreenModal.style.display === 'none')) {
	// 	callerScreenModal.style.display = 'block';
	// 	document.querySelector(".caller-screen-members").innerHTML = 'Members: ' + 
	// 	invitees.map((i) => i + ", ")
	// 	document.querySelector('.caller-screen-title').innerHTML = `${hostID} is calling you`;
	// } else {
	// }
});

// decline call from other
function declineCall() {

}

// add Notification
function refreshNotification() {
	
}

// remove notification
function removeNotification() {

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
	if (res.success) {
		window.location.href = `http://localhost:5000/${res.roomID}`;
	}
	closeModal("start-new-call-modal");
}

// cancelling calling and closing newCall Cont
function cancelCall() {
	
}

// to close Modal
function closeModal(id) {
	const modal = document.querySelector(`#${id}`);
	modal.style.display = "none";
}

// show modal
function showModal(id) {
	const modal = document.querySelector(`#${id}`);
	modal.style.display = "flex";
}

// select contact for new call
function selectContactForNewCall(id) {
	const contactItem = document.querySelector(`#newCall-${id}`);
	if (contactItem) {
		const userID = id;
		if (!selectedContacts.find((el) => el === userID)) {
			const tickIcon = document.createElement('i');
			tickIcon.setAttribute("class", "fas fa-check-circle");
			contactItem.append(tickIcon);
			selectedContacts.push(userID);
		} else {
			selectedContacts.splice(selectedContacts.indexOf(userID), 1);
			contactItem.removeChild(contactItem.lastElementChild);
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
		- onclick="removeContact('${contact.userID}')">o</div>`;
		
		const newCallContact = document.createElement("div");
		newCallContact.setAttribute("class", "newCall-contacts-item");
		newCallContact.setAttribute("id", `newCall-${contact.userID}`);
		newCallContact.setAttribute("style", "margin: 4px;");
		newCallContact.setAttribute('onclick', `selectContactForNewCall("${contact.userID}")`);
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
		closeModal("new-contact-modal");
	}
}
async function removeContact() {

}