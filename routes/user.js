const express = require('express')
const { ensureAuth } = require('../middleware/auth')
const router = express.Router()
const Room = require('../models/Room')
const User = require('../models/User')

// @desc    Show add page
// @route   GET /stories/add
router.get('/details/:id', ensureAuth, async (req, res) => {
	let user =  await User.findById(req.params.id).lean()
  res.render('user/profile',{
  	user
  })
})

module.exports = router