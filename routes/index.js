const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
     // For password hashing
const nodemailer = require('nodemailer');
const crypto = require('crypto');        // For generating secure tokens
const { ensureAuthenticated } = require('../middleware/auth');  // Optional for protected routes




// Home Route
router.get('/', (req, res) => res.render('index.ejs'));



// Register Route
router.get('/register', (req, res) => res.render('auth/register'));

// Register Handle
router.post('/register', (req, res) => {
    const { name, email, password, role } = req.body;
    let errors = [];

    if (!name || !email || !password) {
        errors.push({ msg: 'Please enter all fields' });
    }

    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });
    }

    if (errors.length > 0) {
        console.log(errors);
        
        res.render('auth/register', {
            errors,
            name,
            email,
            password,
            role
        });
    } else {
      

        User.findOne({ email: email }).then(user => {
            if (user) {
                req.flash('error_msg', 'Email already exists');
                res.redirect('/register');
            } else {
                const newUser = new User({
                    name,
                    email,
                    password,
                    role
                });
        
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser
                            .save()
                            .then(user => {
                                req.flash('success_msg', 'You are now registered and can log in');
                                res.redirect('/login');
                            })
                            .catch(err => console.log(err));
                    });
                });
            }
        });
          
    }
});

//login route
router.get('/login', (req, res) => res.render('auth/login'));

// Login Handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        failureRedirect: '/',
        failureFlash: true
    })(req, res, next);
}, (req, res) => {
    // Redirect based on role
    if (req.user.role === 'admin') {
        res.redirect('/admin/dashboard');
    } else {
        res.redirect('/student/dashboard');
    }
});

// Logout Handle
router.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});


// Forgot password -------
// GET: Render forgot password form
router.get('/forgot', (req, res) => {
        res.render('auth/forgot');
});

  // POST: Handle forgot password submission
router.post('/forgot', (req, res) => {
    const { email, password, confirmPassword } = req.body;
  
    // Check if passwords match
    if (password !== confirmPassword) {
      req.flash('error_msg', 'Passwords do not match.');
      return res.redirect('/forgot');
    }
  
    // Find user by email
    User.findOne({ email }).then(user => {
      if (!user) {
        req.flash('error_msg', 'No account with that email found.');
        return res.redirect('/forgot');
      }
  
      // Hash the new password
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
          if (err) throw err;
  
          // Set new password and save
          user.password = hash;
          user.save()
            .then(() => {
              req.flash('success_msg', 'Password has been updated. You can now log in.');
              res.redirect('/login');
            })
            .catch(err => console.log(err));
        });
      });
    });
  });



module.exports = router;
