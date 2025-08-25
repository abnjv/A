import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CreateRoomModal from './CreateRoomModal';
import EditRoomModal from './EditRoomModal';
import { useAuth } from '../context/AuthContext';

function RoomsPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isDashboardOpen, setDashboardOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get('/api/rooms');
        setRooms(res.data);
      } catch (err) {
        console.error('Error fetching rooms', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const handleCardClick = (room) => {
    // Navigate to the room
    navigate(`/room/${room.name}`);
  };

  const handleCreateRoom = async (newRoomData) => {
    try {
      const res = await axios.post('/api/rooms', newRoomData);
      setRooms([...rooms, res.data]); // Add the new room to the state
    } catch (err) {
      console.error('Error creating room', err);
      // Optionally, show an error to the user
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <header className="bg-gray-800 p-4 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold">AirChat</h1>
        <div className="relative">
          <img
            src={`https://avatar.iran.liara.run/public/boy?username=${localStorage.getItem('username') || 'ضيف'}`}
            alt="User Avatar"
            className="w-10 h-10 rounded-full cursor-pointer"
            onClick={() => setDashboardOpen(!isDashboardOpen)}
          />
          {isDashboardOpen && (
            <div id="dashboard-popup" className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg z-20">
              <div className="p-2">
                <a href="/profile" className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 rounded-md">
                  الملف الشخصي
                </a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 rounded-md">
                  الإعدادات
                </a>
                <a href="/" className="block px-4 py-2 text-sm text-red-400 hover:bg-gray-600 rounded-md">
                  تسجيل الخروج
                </a>
              </div>
            </div>
          )}
            <div className="p-2">
              <a href="/profile" className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 rounded-md">
                الملف الشخصي
              </a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 rounded-md">
                الإعدادات
              </a>
              <a href="/" className="block px-4 py-2 text-sm text-red-400 hover:bg-gray-600 rounded-md">
                تسجيل الخروج
              </a>
            </div>
          </div>
        </div>
      </header>
      <main className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">الغرف المتاحة</h2>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
          >
            إنشاء غرفة جديدة <i className="fas fa-plus ml-2"></i>
          </button>
        </div>
        {loading ? (
          <p>Loading rooms...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <div
                key={room._id}
                className="group relative rounded-lg overflow-hidden shadow-lg h-64 bg-cover bg-center transform hover:scale-105 hover:shadow-2xl transition-all duration-300"
                style={{ backgroundImage: `url(${room.backgroundUrl})` }}
              >
                <div
                  className="absolute inset-0 bg-black bg-opacity-60 p-6 flex flex-col justify-end cursor-pointer"
                  onClick={() => handleCardClick(room)}
                >
                  <h3 className="text-2xl font-bold text-white shadow-md">{room.name}</h3>
                  <p className="text-gray-200 mt-1">{room.topic}</p>
                  <div className="flex justify-between items-center mt-6">
                    <span className="text-gray-100 flex items-center">
                      <i className="fas fa-user mr-2"></i>
                      by {room.owner.username}
                    </span>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300">
                      انضم الآن
                    </button>
                  </div>
                </div>
                {user && user._id === room.owner._id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRoom(room);
                      setEditModalOpen(true);
                    }}
                    className="absolute top-2 right-2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <i className="fas fa-cog"></i>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateRoom}
      />
      <EditRoomModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        room={selectedRoom}
        onRoomUpdated={(updatedRoom) => {
          setRooms(rooms.map((r) => (r._id === updatedRoom._id ? updatedRoom : r)));
        }}
      />
    </div>
  );
}

export default RoomsPage;
