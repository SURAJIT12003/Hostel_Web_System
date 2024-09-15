const express = require('express');
const router = express.Router();
const { ensureAdmin } = require('../middleware/auth');
const Complaint = require('../models/Complaint');
const Room = require('../models/Room');

router.get('/dashboard', ensureAdmin, (req, res) => {
    res.render("./admin/dashboard")
});

// View Complaints
router.get('/complaints', ensureAdmin, (req, res) => {
    Complaint.find()
        .populate('studentId', 'name')
        .then(complaints => res.render('admin/complaints', { complaints }))
        .catch(err => console.log(err));
});

// View Rooms
router.get('/rooms', ensureAdmin, (req, res) => {
    Room.find()
        .populate('studentId', 'name')
        .then(rooms => res.render('admin/rooms', { rooms }))
        .catch(err => console.log(err));
});


// Protect this route for admin only
// const { ensureAuthenticated } = require('../config/auth');

// Admin route to solve a complaint
router.post('/solve-complaint/:id', ensureAdmin, (req, res) => {
    
    
    Complaint.findByIdAndUpdate(req.params.id, { status: 'solved' }, { new: true })
        .then(() => {
            req.flash('success_msg', 'Complaint has been marked as solved');
            res.redirect('/admin/complaints'); // Redirect to the admin complaints page
        })
        .catch(err => {
            console.log(err);
            req.flash('error_msg', 'An error occurred while updating the complaint');
            res.redirect('/admin/complaints');
        });
})


module.exports = router;
