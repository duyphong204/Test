import React, { useEffect, useState } from 'react';
import { useStore } from './store/useStore';
import Login from './components/Login';
import Map from './components/Map';
import Livestream from './components/Livestream';
import axios from 'axios';

const App = () => {
  const { user, logout, fetchLocations, fetchWeather, weather, locations, recognizeImage } = useStore();
  const [category, setCategory] = useState('savory');
  const [time, setTime] = useState(4);
  const [imageUrl, setImageUrl] = useState('');

  const userLocation = [10.7769, 106.7009];

  useEffect(() => {
    fetchWeather(userLocation[0], userLocation[1]);
    fetchLocations(category, time, userLocation[0], userLocation[1], weather);
  }, [category, time, weather]);

  const handleImageRecognize = async (e) => {
    e.preventDefault();
    try {
      const dish = await recognizeImage(imageUrl);
      alert(`Món ăn nhận diện: ${dish}`);
    } catch (err) {
      console.error(err);
      alert('Lỗi khi nhận diện món ăn');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Sài Gòn Culinary Hub</h1>
      {user ? (
        <div>
          <button onClick={logout} className="p-2 bg-red-500 text-white rounded mb-4">Đăng xuất</button>
          <div className="flex gap-4 mb-4">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="p-2 border rounded">
              <option value="savory">Món mặn</option>
              <option value="sweet">Món ngọt</option>
              <option value="vegan">Món chay</option>
              <option value="indoor">Trong nhà</option>
            </select>
            <input
              type="number"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              min="1"
              max="24"
              className="p-2 border rounded"
              placeholder="Thời gian (giờ)"
            />
            <form onSubmit={handleImageRecognize} className="flex gap-2">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Nhập URL ảnh món ăn"
                className="p-2 border rounded"
              />
              <button type="submit" className="p-2 bg-blue-500 text-white rounded">Nhận diện</button>
            </form>
          </div>
          <p className="mb-4">Thời tiết hiện tại: {weather || 'Đang tải...'}</p>
          <Map />
          <Livestream room="cooking-stream" />
          <h2 className="text-xl font-bold mt-4">Lộ trình ẩm thực gợi ý</h2>
          <ul className="list-disc pl-5">
            {locations.map((loc) => (
              <li key={loc._id}>{loc.name} - {loc.dish} - {loc.distance.toFixed(2)} km</li>
            ))}
          </ul>
        </div>
      ) : (
        <Login />
      )}
    </div>
  );
};

export default App;