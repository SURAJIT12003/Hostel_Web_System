const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: true,
        unique: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique: true,
        sparse: true
    }
    ,
    isBook:{
        type:Boolean,
        required :true
    }
});

const Room = mongoose.model('Room', RoomSchema);
module.exports = Room;
