const express = require('express')
const { ensureAuth } = require('../middleware/auth')
const router = express.Router()
const Room = require('../models/Room')


// @desc    Show add page
// @route   GET /stories/add
router.get('/add', ensureAuth, (req, res) => {
  res.render('room/add')
})


// @desc    Process add form
// @route   POST /rooms
router.post('/', ensureAuth, async (req, res) => {
  try {
    req.body.owner = req.user.id
    var users = [];
    users.push(req.user.googleId)
    req.body.users = [];
    Object.assign(req.body.users, users);
    req.body.ownerID = global.user.googleId

    await Room.create(req.body);
    res.redirect('/dashboard')
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// @desc    Show all public rooms
// @route   GET /room/
router.get('/', ensureAuth, async (req, res) => {
  const rooms = await Room.find({ status: 'public' })
      .populate('owner')
      .sort({ createdAt: 'desc' })
      .lean()

    console.log(rooms)

    res.render('room/public', {
      rooms,
    })
})


module.exports = router