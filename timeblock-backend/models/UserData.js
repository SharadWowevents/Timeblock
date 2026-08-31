const mongoose = require('mongoose');

const userDataSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Using Mixed type for schedule to easily store the nested day/time objects
  schedule: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  todos: {
    type: Array,
    default: []
  },
  categories: {
    type: Array,
    default: []
  },
  bookmarkTabs: {
    type: Array,
    default: []
  }
}, { minimize: false }); // minimize: false ensures empty objects (like schedule) are saved

module.exports = mongoose.model('UserData', userDataSchema);