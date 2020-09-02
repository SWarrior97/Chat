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

router.put('/:id', ensureAuth, async (req, res) => {
  try {
    let room =  await Room.findById(req.params.id).lean()

    req.body.owner = req.user.id
    var users = [];
    users.push(req.user.googleId)
    req.body.users = [];
    Object.assign(req.body.users, users);
    req.body.ownerID = global.user.googleId

    room = await Room.findOneAndUpdate({ _id: req.params.id }, req.body, {
			new: true,
			runValidators: true,
		})

    res.redirect('/dashboard')
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

router.delete('/:id', async (req, res) => {
	try {
	  let room = await Room.findById(req.params.id).lean()
  
	  if (!room) {
		return res.render('error/404')
	  }
  
		await Room.remove({ _id: req.params.id })
		  
		res.redirect('/')
	} catch (err) {
	  console.error(err)
	  return res.render('error/500')
	}
  })

// @desc    Show all public rooms
// @route   GET /room/
router.get('/', ensureAuth, async (req, res) => {
  const rooms = await Room.find({ status: 'public' })
      .populate('owner')
      .sort({ createdAt: 'desc' })
      .lean()


    res.render('room/public', {
      rooms,
    })
})

router.get('/edit/:id', ensureAuth, async (req, res) => {
  let room =  await Room.findById(req.params.id).lean()


    res.render('room/edit', {
      room,
    })
})


module.exports = router