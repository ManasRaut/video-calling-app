console.log(roomID);
console.log(userID);
console.log(hostID);
console.log(myUserName);

// global variables
let isMessageBoxVisible = false;
let isParticipantsBoxVisible = false;
let isHostControlBoxVisible = false;
let myStream = null;
const myData = { roomID, userID, userName: myUserName };
let messages = [];
let participants = [];
const callList = [];
const permissions = [];
let isAudioEnabled = true;
let isVideoEnabled = true;
let videosVisible = 0;
let videoStreams = [];

// DOM references
const messageBox = document.querySelector("#messageBox");
const messageBoxList = document.querySelector('#messageList');
const participantsBox = document.querySelector("#participantsBox");
const participantsBoxList = document.querySelector("#participantsList");
const hostControlBox = document.querySelector("#host-control-box");
const hostControlBoxList = document.querySelector(".waiting-box-list");
const videoGrid = document.querySelector(".video-grid");
const messageInputBox = document.querySelector('.message-box');
const audioMuteBtn = document.querySelector("#audio-mute-btn");
const videoMuteBtn = document.querySelector("#video-mute-btn");

// constants
const GET_CONTACTS_URL = "http://localhost:5000/api/getContacts";
const AUDIO_ON = '<i class="fas fa-microphone"></i>';
const AUDIO_OFF = '<i class="fas fa-microphone-slash"></i>';
const VIDEO_ON = '<i class="fas fa-video"></i>';
const VIDEO_OFF = '<i class="fas fa-video-slash"></i>';

// my video elemet
const myVideo = document.createElement("video");

// connected to root of our server from socket
const socket = io("/")

// peerjs object
let peer = new Peer(myData.userID, {
    host: "/",  
    path: "/peerjs",
    port: process.env.PORT || 5000,
});

// get media streams and setup sockets after window is loaded
window.addEventListener('load', start);

async function start() {
    const hostControlBtn = document.querySelector("#host-controls-btn");
    if (hostID === userID) {
        hostControlBtn.style.display = "block";
    } else {
        const hostControlBtn = document.querySelector("#host-controls-btn");
        hostControlBtn.remove();
        hostControlBox.remove();
    }

    myStream = await navigator.mediaDevices.getUserMedia({
        video: "true",
        audio: "true",
    });

    addNewVideo(myStream, myVideo, userID, true);

    // answering to others call
    peer.on('call', (call) => {
        const newVideo = document.createElement('video');
        call.on('stream', (callersMediaStream) => {
            if (!callList.includes(call.peer)) {
                console.log('receive others call', call.peer);
                addNewVideo(callersMediaStream, newVideo, call.peer);
                callList.push(call.peer);
            }
        });
        console.log('answering others calls', call.peer)
        call.answer(myStream);
    });

    peer.on('open', (id) => {
        console.log('Started peer');
    });

    socket.on('new-user-connected', (data) => {
        const {userID, userName} = data;
        console.log(`${userName} connected`);
        callToNewConnectedUser(data);
    });

    socket.on('new-user-disconnected', (data) => {
        const {userID, userName} = data;
        console.log(`${userName} disconnected`); 
        callList.splice(callList.indexOf(data.userID), 1);
        removeVideo(data);
    });

    socket.on('participants-list', (prticipants) => {
        participants = prticipants;
        refreshParticipants();
    });

    socket.on('message', (messageData) => {
        addMessageInList(messageData);
    });

    socket.on('video-stream-changed', (streamData) => {
        const videoElement = document.getElementById(`${streamData.userID}`);
        if (videoElement) {
            console.log(streamData);
        }
    });

    // permission events
    if (hostID === userID) {
        socket.on('asking-permission', (data) => {
            console.log('permisioin', data)
            addInWaiting(data);
            permissions.push(data);
        });
    }

    // join the socket room
    socket.emit('new-user-joining-room', myData);
}

// update waiting list in DOM
function addInWaiting(data) {
    const newItem = document.createElement('div');
    newItem.setAttribute('class', 'waiting-member');
    newItem.setAttribute('id', data.userID);
    const innerHtml = `${data.userName}
    <div>
        <button class="waiting-accept-btn" onclick="acceptWaitingPerson('${data.userID}')">Accept</button>
        <button class="waiting-decline-btn"  onclick="declineWaitingPerson('${data.userID}')">
            <i class="fa fa-ban"></i>
        </button>
    </div>
    `;
    newItem.innerHTML = innerHtml;
    hostControlBoxList.append(newItem);
}


// accept permission for waiting person
function acceptWaitingPerson(userID) {
    const data = permissions.find((p) => p.userID === userID);
    console.log(data)
    socket.emit('accept-person', data);
    const item = document.getElementById(`${userID}`);
    item.remove();
}

function declineWaitingPerson(userID) {
    const data = permissions.find((p) => p.userID === userID);
    console.log(data)
    socket.emit('decline-person', data);
    const item = document.getElementById(`${userID}`);
    item.remove();
}

// call to newly connect user
function callToNewConnectedUser({userID}) {
    const options = {
        metadata: {
            'userID': myData.userID,
        }
    }
    const call = peer.call(userID, myStream, options);
    call.on('stream', (callersMediaStream) => {
        if (!callList.includes(call.peer)) {
            const newVideo = document.createElement('video');
            addNewVideo(callersMediaStream, newVideo, call.peer);
            callList.push(call.peer);
        }
    });
}

// toggle mute self audio
function toggleMuteSelfAudio() {
    const audioTracks = myStream.getAudioTracks();
    if (audioTracks != []) {
        audioTracks[0].enabled = !isAudioEnabled;
        isAudioEnabled = !isAudioEnabled;
        const elementClass = isAudioEnabled ? "rounded-btn btn-active" : "rounded-btn btn-non-active";
        const elementIcon = isAudioEnabled ? AUDIO_ON : AUDIO_OFF;
        audioMuteBtn.setAttribute("class", elementClass);
        audioMuteBtn.innerHTML = elementIcon;
    }
}

// toggle mute self video
function toggleMuteSelfVideo() {
    const videoTracks = myStream.getVideoTracks();
    if (videoTracks != []) {
        videoTracks[0].enabled = !isVideoEnabled;
        isVideoEnabled = !isVideoEnabled;
        const elementClass = isVideoEnabled ? "rounded-btn btn-active" : "rounded-btn btn-non-active";
        const elementIcon = isVideoEnabled ? VIDEO_ON : VIDEO_OFF;
        videoMuteBtn.setAttribute("class", elementClass);
        videoMuteBtn.innerHTML = elementIcon;
        socket.emit('video-stream-changed', {isVideoEnabled, userID: myData.userID});
    }
}

// share link
function shareLink() {
    prompt("Share this link to others to join the meeting", `${window.location.origin}/${roomID}`);
}

// sending message and adding it to self
function sendMessage() {
    const messageText = messageInputBox.value;
    if (messageText && messageText != "") {
        const messageData = {
            message: messageText,
            userName: myData.userName,
        }
        socket.emit('message', messageData);
        addMessageInList(messageData, true);
        messageInputBox.value = "";
    }
}

// adding message in our message box list
function addMessageInList(messageData, self = false) {
    const newMessage = document.createElement('div');
    newMessage.setAttribute("class", "message");
    if (self) {
        newMessage.innerText = `You : ${messageData.message}`;
    } else {
        newMessage.innerText = `${messageData.userName} : ${messageData.message}`;
    }
    messageBoxList.append(newMessage);
}

// refresh participants list in UI
function refreshParticipants() {
    participantsBoxList.innerHTML = "";
    for (let p of participants.participants) {
        const newParticipant = document.createElement('div');
        newParticipant.setAttribute("id", p.userID);
        if (p.userID === participants.hostID) {
            newParticipant.setAttribute("class", "participant host-participant");
            newParticipant.innerHTML = `${p.userName} <span>Host</span>`;
            participantsBoxList.append(newParticipant);
        } else {
            newParticipant.setAttribute("class", "participant");
            newParticipant.innerHTML = p.userName;
            participantsBoxList.append(newParticipant);
        }
    }
}

// add new video to video grid
function addNewVideo(stream, videoElement, userID, muted = false) {
    if (videosVisible < 8) {
        videoElement.setAttribute("id", userID);
        videoElement.setAttribute("autoplay", true);
        videoElement.muted = muted;
        videoElement.srcObject = stream;
        videoGrid.append(videoElement);
        videosVisible++;
    }
    videoStreams.push({
        stream: stream,
        userID: userID
    });
}

// remove video from video grid
function removeVideo({userID}) {
    const videoElement = document.getElementById(`${userID}`);
    if (videoElement) {
        videoElement.remove();
        videosVisible--;
        videoStreams = videoStreams.filter((s) => s.userID != userID);
    }
}

// toggle participantsBox visiblity on click of participant button
function toggleParticipants(main = true) {
    if (isParticipantsBoxVisible) {
        participantsBox.style.display = "none";
        isParticipantsBoxVisible = false;
    } else {
        participantsBox.style.display = "flex";
        isParticipantsBoxVisible = true;
        messageBox.style.display = "none";
        isMessageBoxVisible = false;
        hostControlBox.style.display = "none";
        isHostControlBoxVisible = false;
    }
}

// toggle messageBox visiblity on click of message button
function toggleMessages(main = true) {
    if (isMessageBoxVisible) {
        messageBox.style.display = "none";
        isMessageBoxVisible = false;
    } else {
        messageBox.style.display = "flex";
        isMessageBoxVisible = true;
        participantsBox.style.display = "none";
        isParticipantsBoxVisible = false;
        hostControlBox.style.display = "none";
        isHostControlBoxVisible = false;
    }
}

// toggle visiblity of meetings host control box
function toggleMeetingControls() {
    if (isHostControlBoxVisible) {
        hostControlBox.style.display = "none";
        isHostControlBoxVisible = false;
    } else {
        hostControlBox.style.display = "flex";
        isHostControlBoxVisible = true;
        participantsBox.style.display = "none";
        isParticipantsBoxVisible = false;
        messageBox.style.display = "none";
        isMessageBoxVisible = false;
    }
}