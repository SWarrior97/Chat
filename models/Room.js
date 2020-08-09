const mongoose = require('mongoose')
const User = require('../models/User')

const RoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    default: 'public',
    enum: ['public', 'private'],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  ownerID:{
    type:String,
    require:true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  users:{
    type:Array,
    default:[]
  },
  description:{
    type:String,
    default:''
  }
})

module.exports = mongoose.model('Room', RoomSchema)
