const UserModel = require('../models/User');
const CallModel = require('../models/Call');

const initiateRoom = async (roomID) => {
    const room = await CallModel.findOne({roomID});
    if (room) {
        room.initiated = true;
        await room.save();
    }
}

const addAsInvitee = async ({roomID, userID}) => {
    const call = await CallModel.findOne({roomID});
    if (call) {
        call.invitees.push(userID);
        await call.save();
    }
}

const renderRoom = async (req, res) => {
	await initiateRoom(req.params.roomID);
    const call = await CallModel.findOne({roomID: req.params.roomID});
    if (call) {
        const userID = req.session.userID;
        const host = await UserModel.findOne({userID: call.hostID});
        if (userID === call.hostID || call.invitees.includes(userID)) {
            res.render("room.ejs", {
                roomID: req.params.roomID,
                userID: req.session.userID,
                userName: req.session.username,
                hostID: call ? call.hostID : null,
            });
        } else {
            res.render('waitingRoom.ejs', {
                roomID: req.params.roomID,
                userID: userID,
                userName: req.session.username,
                hostName: host.username,
                hostID: call.hostID,
            });
        }
    } else {
        res.status(404);
        res.render('error');
    }
}

module.exports = {
    renderRoom, addAsInvitee,
}