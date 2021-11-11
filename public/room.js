let isMessageBoxVisible = false;
let isParticipantsBoxVisible = false;

// DOM references
const messageBox = document.querySelector("#messageBox");
const messageBoxList = document.querySelector('#messageList');
const participantsBox = document.querySelector("#participantsBox");
const participantsBoxList = document.querySelector("#participantsList");
const videoGrid = document.querySelector(".video-grid");
const myVideo = document.createElement("video");
const messageInputBox = document.querySelector('.message-box');
const audioMuteBtn = document.querySelector("#audio-mute-btn");
const videoMuteBtn = document.querySelector("#video-mute-btn");

// toggle participantsBox visiblity on click of participant button
function toggleParticipants(main = true) {
    if (isParticipantsBoxVisible) {
        participantsBox.style.display = "none";
        isParticipantsBoxVisible = false;
    } else {
        isParticipantsBoxVisible = true;
        participantsBox.style.display = "flex";
        isMessageBoxVisible = false;
        messageBox.style.display = "none";
    }
}

// toggle messageBox visiblity on click of message button
function toggleMessages(main = true) {
    if (isMessageBoxVisible) {
        messageBox.style.display = "none";
        isMessageBoxVisible = false;
    } else {
        isMessageBoxVisible = true;
        messageBox.style.display = "flex";
        isParticipantsBoxVisible = false;
        participantsBox.style.display = "none";
    }
}