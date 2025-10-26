import React, { useState } from 'react';
import axios from 'axios';
import { useStore } from '../store/useStore';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', { username, password });
      setUser(res.data.user, res.data.token);
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi đăng nhập');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/register', { username, password });
      setUser(res.data.user, res.data.token);
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi đăng ký');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Sài Gòn Culinary Hub</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Tên người dùng"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">Đăng nhập</button>
        <button type="button" onClick={handleRegister} className="w-full p-2 bg-green-500 text-white rounded mt-2">Đăng ký</button>
      </form>
    </div>
  );
};

export default Login;