import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [roomName, setRoomName] = useState('');
  const [roomPass, setRoomPass] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (roomPass === '1234') {
      localStorage.setItem('username', username || 'ضيف');
      navigate(`/room/${roomName}`);
    } else {
      alert('كلمة المرور خاطئة!');
    }
  };

  return (
    <div className="bg-gray-950 text-white flex items-center justify-center h-screen p-4">
      <div className="bg-gray-800 p-8 sm:p-12 rounded-3xl shadow-2xl max-w-sm w-full text-center border-t-4 border-blue-500">
        <h2 className="text-3xl font-bold mb-8 text-gray-100">تسجيل الدخول</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="اسم المستخدم"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="اسم الغرفة"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="كلمة المرور"
            value={roomPass}
            onChange={(e) => setRoomPass(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleLogin}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition-all duration-300 text-white font-semibold text-lg btn-press"
          >
            دخول
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
