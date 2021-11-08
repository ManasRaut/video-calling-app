// DOM refernces
const newContactsInput = document.querySelector("#newContactInput");
const contactsCont = document.querySelector("#contacts-cont");

// Constants
const NEW_CONTACT_URL = "http://localhost:5000/api/addNewContact";
const GET_CONTACTS_URL = "http://localhost:5000/api/getContacts";

// onload
window.onload = () => {
	getContacts();
}

// global variables
let contacts = [];

async function getContacts() {
	const rawResponse = await fetch(GET_CONTACTS_URL);
	const response = await rawResponse.json();
	contacts = response.contacts;

	contactsCont.innerHTML = "";
	for(let contact of contacts) {
		const newContact = document.createElement('div');
		newContact.setAttribute('class', "list-item");
		newContact.setAttribute('id', contact);
		newContact.innerHTML = contact;
		contactsCont.append(contact.username)
	}
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
	}
}