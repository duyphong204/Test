import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import {useStore} from '../store/useStore';
import { Entity, Scene } from 'aframe-react';

const Map = () => {
  const { locations, addReview, addFavorite, user, token } = useStore();
  const center = [10.7769, 106.7009];

  const handleReviewSubmit = (e, locationId) => {
    e.preventDefault();
    addReview(locationId, {
      user: user.username,
      comment: e.target.comment.value,
      rating: e.target.rating.value
    }, token);
    e.target.reset();
  };

  return (
    <div>
      <MapContainer center={center} zoom={12} className="h-[500px] w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {locations.map((loc) => (
          <Marker key={loc._id} position={[loc.lat, loc.lng]}>
            <Popup>
              <h3>{loc.name}</h3>
              <p>{loc.description}</p>
              <p>Món: {loc.dish}</p>
              <p>Khoảng cách: {loc.distance.toFixed(2)} km</p>
              <img src={loc.image} alt={loc.dish} className="w-full h-20 object-cover" />
              <h4>Đánh giá:</h4>
              {loc.reviews.map((rev, idx) => (
                <p key={idx}>{rev.user}: {rev.comment} ({rev.rating}/5)</p>
              ))}
              {user && (
                <>
                  <form onSubmit={(e) => handleReviewSubmit(e, loc._id)}>
                    <input type="text" name="comment" placeholder="Bình luận" className="p-1 border" required />
                    <input type="number" name="rating" placeholder="Điểm (1-5)" min="1" max="5" className="p-1 border" required />
                    <button type="submit" className="p-1 bg-blue-500 text-white">Gửi</button>
                  </form>
                  <button
                    onClick={() => addFavorite(loc._id, token)}
                    className="p-1 bg-yellow-500 text-white mt-2"
                  >
                    Thêm vào yêu thích
                  </button>
                </>
              )}
              <Scene embedded style={{ height: '200px', marginTop: '10px' }}>
                <Entity geometry={{ primitive: 'cylinder' }} material={{ color: 'green' }} position="0 0 -5" />
              </Scene>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;