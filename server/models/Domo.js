const mongoose = require('mongoose');
const _ = require('underscore');

// escape and trim the name before storing
const setName = (name) => _.escape(name).trim();

// name, age, owner account and created date
const DomoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    set: setName,
  },
  age: {
    type: Number,
    min: 0,
    required: true,
  },
  // limited to the dropdown choices
  mood: {
    type: String,
    enum: ['Happy', 'Sad', 'Angry', 'Sleepy', 'Excited'],
    required: true,
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

// only the fields the client needs
DomoSchema.statics.toAPI = (doc) => ({
  name: doc.name,
  age: doc.age,
  mood: doc.mood,
});

const DomoModel = mongoose.model('Domo', DomoSchema);
module.exports = DomoModel;
