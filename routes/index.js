const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')
const Room = require('../models/Room')


// @desc    Login/Landing page
// @route   GET /
router.get('/', ensureGuest, (req, res) => {
  res.render('login', {
    layout: 'login',
  })
})


// @desc    Dashboard
// @route   GET /dashboard
router.get('/dashboard', ensureAuth, async (req, res) => {
   try {
    console.log(global.user.googleId)
    const rooms = await Room.find({ ownerID: global.user.googleId})
      .populate('user')
      .lean()

    res.render('dashboard', {
      name: req.user.firstName,
      rooms
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

module.exports = router
