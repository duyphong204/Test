const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  lat: Number,
  lng: Number,
  category: String, // 'savory', 'sweet', 'vegan', 'indoor'
  dish: String,
  image: String, // Cloudinary URL
  qrCode: String, // URL dẫn đến mô hình 3D
  streamRoom: String, // Phòng livestream cho quán
  reviews: [{ user: String, comment: String, rating: Number }],
  weather: String
});

module.exports = mongoose.model('Location', locationSchema);