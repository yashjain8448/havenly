const mongoose = require("mongoose");

const homeSchema = mongoose.Schema({
  houseName: {
    type: String,
    required: true,
  },

  houseName: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  location: {
    type: String,
    required: true,
  },

  rating: {
    type: Number,
    required: true,
  },

  homeImage: String,
  homeBrochurePath: String,
  description: String,
});

module.exports = mongoose.model("Home", homeSchema);
