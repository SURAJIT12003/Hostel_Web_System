const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const Complaint = require('../models/Complaint');
const Room = require('../models/Room');

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => res.render('./student/dashboard.ejs'));

// Complaints
router.get('/complaints', ensureAuthenticated, (req, res) => {
    Complaint.find({ studentId: req.user.id })
        .then(complaints => res.render('./student/complaints.ejs', { complaints }))
        .catch(err => console.log(err));
});

router.post('/complaints', ensureAuthenticated, (req, res) => {
    const { complaintType, description } = req.body;
    const newComplaint = new Complaint({
        studentId: req.user.id,
        complaintType,
        description
    });
    newComplaint.save()
        .then(() => res.redirect('/student/complaints'))
        .catch(err => console.log(err));
});

// Room Booking
router.get('/rooms', ensureAuthenticated, async (req, res) => {
    try {
        // Check if the student has already booked a room
        const bookedRooms = await Room.find({ studentId: req.user.id });

        if (bookedRooms.length !== 0) {
            // Render the page showing the booked room(s)
          
            
            res.render('./student/rooms.ejs', { room: bookedRooms ,user: req.user });
        } else {
            // If no room is booked, show all available rooms
            const availableRooms = await Room.find();
            res.render('./student/rooms.ejs', { room: availableRooms });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});


router.post('/rooms', ensureAuthenticated, (req, res) => {
    const { roomNumber } = req.body;
    
    // Check if the room is already booked
    Room.findOne({ roomNumber: roomNumber })
        .then(room => {
            if (room.studentId) {
                req.flash('error_msg', 'This room is already booked.');
                return res.redirect('/student/rooms');
            }

            // Update the room with the current user's ID
            Room.findOneAndUpdate(
                { roomNumber: roomNumber },
                { $set: { studentId: req.user.id, isBook: true } }, // Assuming `isBook` marks a booked room
                { new: true, upsert: false },
                {isBook:true}
            )
            .then(() => {
                req.flash('success_msg', 'Room successfully booked.');
                res.redirect('/student/rooms');
            })
            .catch(err => {
                console.log(err);
                req.flash('error_msg', 'Error booking the room.');
                res.redirect('/student/rooms');
            });
        })
        .catch(err => {
            console.log(err);
            req.flash('error_msg', 'Error finding the room.');
            res.redirect('/student/rooms');
        });
});

// Unbook a room
router.post('/rooms/unbook', ensureAuthenticated, (req, res) => {
    const { roomNumber } = req.body;
    
    // Check if the room belongs to the current user
    Room.findOne({ roomNumber: roomNumber })
        .then(room => {
            if (!room || room.studentId.toString() !== req.user.id) {
                req.flash('error_msg', 'You cannot unbook this room.');
                return res.redirect('/student/rooms');
            }

            // Unbook the room by clearing the studentId and marking it as available
            Room.findOneAndUpdate(
                { roomNumber: roomNumber },
                { $unset: { studentId: "" }, $set: { isBook: false } }, // Unassign the room and mark it as not booked
                { new: true },
                {isBook:false}
            )
            .then(() => {
                req.flash('success_msg', 'Room successfully unbooked.');
                res.redirect('/student/rooms');
            })
            .catch(err => {
                console.log(err);
                req.flash('error_msg', 'Error unbooking the room.');
                res.redirect('/student/rooms');
            });
        })
        .catch(err => {
            console.log(err);
            req.flash('error_msg', 'Error finding the room.');
            res.redirect('/student/rooms');
        });
});

module.exports = router;
