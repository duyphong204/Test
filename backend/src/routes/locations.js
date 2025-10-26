const express = require('express');
const router = express.Router();
const Location = require('../models/Location');
const User = require('../models/User');
const axios = require('axios');
const auth = require('../middleware/auth');
const { haversineDistance } = require('../../utils/haversine');
const vision = require('@google-cloud/vision');
const cloudinary = require('cloudinary').v2;

const visionClient = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_CLOUD_VISION_KEY
});

router.get('/', async (req, res) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const location = new Location(req.body);
  try {
    const newLocation = await location.save();
    res.status(201).json(newLocation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/plan', async (req, res) => {
  const { category, time, lat, lng, weather } = req.query;
  try {
    let locations = await Location.find({ category });
    if (weather === 'rain') {
      locations = locations.filter(loc => loc.category === 'indoor');
    }
    const sortedLocations = locations
      .map(loc => ({
        ...loc._doc,
        distance: haversineDistance(parseFloat(lat), parseFloat(lng), loc.lat, loc.lng)
      }))
      .sort((a, b) => a.distance - b.distance);
    const maxLocations = Math.floor(time / 2);
    const plan = sortedLocations.slice(0, maxLocations);
    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/weather/:lat/:lng', async (req, res) => {
  const { lat, lng } = req.params;
  console.log("Calling OpenWeather API with:", lat, lng, process.env.OPENWEATHER_API_KEY);
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
    );
    const weather = response.data.weather[0].main.toLowerCase();
    res.json({ weather });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/review/:id', auth, async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    location.reviews.push({ ...req.body, user: req.user.id });
    await location.save();
    res.json(location);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/favorite', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.favorites.push(req.body.locationId);
    await user.save();
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// router.post('/recognize', async (req, res) => {
//   try {
//     const { imageUrl } = req.body;
//     const [result] = await visionClient.labelDetection(imageUrl);
//     const labels = result.labelAnnotations.map(label => label.description.toLowerCase());
//     const dish = labels.find(label => ['pho', 'banh mi', 'com tam'].includes(label)) || 'unknown';
//     const locations = await Location.find({ dish: dish });
//     res.json({ dish, locations });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

router.post("/recognize", async (req, res) => {
  try {
    const { imageUrl } = req.body;

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/google/vit-base-patch16-224",
      { inputs: imageUrl },
      {
        headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` }
      }
    );

    // Lấy label từ kết quả trả về
    const labels = response.data.map(l => l.label.toLowerCase());
    const dish = labels.find(label => ['pho', 'banh mi', 'com tam'].includes(label)) || 'unknown';

    // Lấy location từ DB
    const locations = await Location.find({ dish });

    res.json({ dish, locations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});
// Tham gia livestream
router.post('/join-stream', async (req, res) => {
  const { roomId } = req.body;
  try {
    const location = await Location.findOne({ streamRoom: roomId });
    if (!location) {
      return res.status(404).json({ message: 'Phòng livestream không tồn tại' });
    }
    res.json({ message: `Đã tham gia phòng ${roomId}` });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});
router.post('/upload', async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.body.image, { folder: 'culinary_hub' });
    res.json({ url: result.secure_url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;