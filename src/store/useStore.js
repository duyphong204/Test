import { create } from 'zustand';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const useStore = create((set) => ({
  user: null,
  token: null,
  locations: [],
  weather: '',
  stream: null,
  setUser: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null, stream: null }),
  fetchLocations: async (category, time, lat, lng, weather) => {
    try {
      const res = await axios.get(`/api/locations/plan?category=${category}&time=${time}&lat=${lat}&lng=${lng}&weather=${weather}`);
      set({ locations: res.data });
    } catch (err) {
      console.error(err);
    }
  },
  fetchWeather: async (lat, lng) => {
    try {
      const res = await axios.get(`/api/locations/weather/${lat}/${lng}`);
       console.log("Weather:", response.data.weather);
      set({ weather: res.data.weather });
    } catch (err) {
      console.error(err);
    }
  },
  addReview: async (locationId, review, token) => {
    try {
      const res = await axios.post(`/api/locations/review/${locationId}`, review, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set((state) => ({
        locations: state.locations.map(loc => loc._id === locationId ? res.data : loc)
      }));
    } catch (err) {
      console.error(err);
    }
  },
  addFavorite: async (locationId, token) => {
    try {
      await axios.post('/api/locations/favorite', { locationId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error(err);
    }
  },
  recognizeImage: async (imageUrl) => {
    try {
      const { data } = await axios.post('/api/locations/recognize', { imageUrl });
      set({ locations: data.locations });
      return data.dish;
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  setStream: (stream) => set({ stream }),
  joinStream: (room, token) => {
    socket.emit('join-stream', room);
    axios.post('/api/locations/join-stream', { roomId: room }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  handleSignal: (data) => {
    socket.emit('signal', data);
  },
  onSignal: (callback) => {
    socket.on('signal', callback);
  },
  onUserJoined: (callback) => {
    socket.on('user-joined', callback);
  }
}));

export { useStore, socket }; // Export socket