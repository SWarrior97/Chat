const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const passport = require('passport');
const session = require('express-session');
const mongoose = require('mongoose')
const MongoStore = require('connect-mongo')(session)
const connectDB = require('./config/db');
const http = require('http');
const socketio = require('socket.io')
const Room = require('./models/Room')
const User = require('./models/User')
const formatMessage = require('./utils/messages');
const botName = 'Chat Bot';
const { ensureAuth } = require('./middleware/auth')
const methodOverride = require('method-override')
var ip = require("ip")

// Load config
dotenv.config({ path: './config/config.env' })

// Passport config
require('./config/passport')(passport)

connectDB()

const app = express()
const server = http.createServer(app);
const io = socketio(server);


//body parser
app.use(express.urlencoded({ extended:false }))
app.use(express.json())

// Method override
app.use(
	methodOverride(function (req, res) {
	  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
		// look in urlencoded POST bodies and delete it
		let method = req.body._method
		delete req.body._method
		return method
	  }
	})
  )

//logging
if(process.env.NODE_ENV === 'development'){
	app.use(morgan('dev'));
}

const {
  formatDate,
  stripTags,
  truncate,
  editIcon,
  select,
} = require('./helpers/hbs')


//handlebars
app.engine(
  '.hbs',
  exphbs({
    helpers: {
      formatDate,
      stripTags,
      truncate,
      editIcon,
      select,
    },
    defaultLayout: 'main',
    extname: '.hbs',
  })
)
app.set('view engine','.hbs');

// Sessions
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
)

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Set global var
app.use(function (req, res, next) {
  res.locals.user = req.user || null
  global.user = req.user
  next()
})


// Static folder
app.use(express.static(path.join(__dirname, 'public')))

// Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/room', require('./routes/room'))
app.use('/user', require('./routes/user'))

app.get('/rooms/join/:id',ensureAuth, async  (req, res) =>{
   let room =  await Room.findById(req.params.id).populate('user').lean()
   var users = [];
   
   room.users.forEach(async (user) =>{
    var userGoogleId = ''+user 
    
    const userDB = await User.findOne({googleId: userGoogleId});
    users.push(userDB._doc)
   })

   res.render('room/index',{
    room:room,
    users:users
   })
});

app.get('/rooms/joinRoom/:id',ensureAuth, async  (req, res) =>{
   let room =  await Room.findById(req.params.id).populate('user').lean()
   var users = [];

   room.users.forEach(async (user) =>{
    var userGoogleId = ''+user 
    
    const userDB = await User.findOne({googleId: userGoogleId});
      users.push(userDB._doc)
    })

   io.on('connection', socket => {
      socket.emit('teste', 'teste');
    })

   users.push(global.user._doc)

   res.render('room/index',{
    room:room,
    users:users
   })
})

app.get('/rooms/leave/:id',ensureAuth, async  (req, res) =>{
   let room =  await Room.findById(req.params.id).populate('user').lean()
   console.log(room)
   io.to(room._id).emit(
        'message',
        formatMessage(botName, `${global.user._doc.displayName} has left the chat`)
      );

  res.redirect('/');
})


io.on('connection', socket => {
  socket.emit('teste', 'teste');

   socket.on('chatMessage', msg => {
    io.to(msg.roomId).emit('message', formatMessage(global.user._doc.displayName, msg));
  });

   /*socket.on('joinRoom',msg => {

   })*/
   socket.on('joinRoom',msg => {
    socket.join(msg);

    io.to(msg)
      .emit(
        'message',
        formatMessage(botName, `${global.user.displayName} has joined the chat`)
      );
   })

})

const PORT = process.env.PORT || 3000

server.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
)
