import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateRoomModal from './CreateRoomModal'; // Import the modal component

const initialRoomsData = [
    {
        name: 'غرفة دردشة عامة',
        topic: 'موضوع: نقاشات عامة',
        users: 15,
        isRoom: true,
        img: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80'
      },
      {
        name: 'الرسائل الخاصة',
        topic: 'افتح رسائلك ومحادثاتك الخاصة',
        users: 'الوصول',
        isRoom: false,
        img: 'https://images.unsplash.com/photo-1584441433936-b95b3b1a9d74?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
      },
      {
        name: 'جلسة ألعاب',
        topic: 'موضوع: League of Legends',
        users: 23,
        isRoom: true,
        img: 'https://images.unsplash.com/photo-1507525428034-b723a996f3d1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
      },
      {
        name: 'استراحة قصيرة',
        topic: 'موضوع: موسيقى هادئة',
        users: 5,
        isRoom: true,
        img: 'https://images.unsplash.com/photo-1554034483-263cf23a261d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
      }
];

function RoomsPage() {
  const [roomsData, setRoomsData] = useState(initialRoomsData);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDashboardOpen, setDashboardOpen] = useState(false);
  const navigate = useNavigate();

  const handleCardClick = (room) => {
    if (room.isRoom) {
      localStorage.setItem('room', room.name);
      navigate(`/room/${room.name}`);
    } else {
      console.log('Navigating to private messages');
    }
  };

  const handleCreateRoom = (newRoom) => {
    const roomWithDefaults = {
      ...newRoom,
      users: 1, // Start with 1 user (the creator)
      isRoom: true,
      img: 'https://images.unsplash.com/photo-1505506874110-6a7a69069a08?auto=format&fit=crop&w=1170&q=80', // A default image for new rooms
    };
    setRoomsData([...roomsData, roomWithDefaults]);
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
            onClick={() => setModalOpen(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
          >
            إنشاء غرفة جديدة <i className="fas fa-plus ml-2"></i>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {roomsData.map((room, index) => (
            <div
              key={index}
              className="relative rounded-lg overflow-hidden shadow-lg h-64 bg-cover bg-center cursor-pointer transform hover:scale-105 hover:shadow-2xl transition-all duration-300"
              style={{ backgroundImage: `url('${room.img}')` }}
              onClick={() => handleCardClick(room)}
            >
              <div className="absolute inset-0 bg-black bg-opacity-60 p-6 flex flex-col justify-end">
                <h3 className="text-2xl font-bold text-white shadow-md">{room.name}</h3>
                <p className="text-gray-200 mt-1">{room.topic}</p>
                <div className="flex justify-between items-center mt-6">
                  <span className="text-gray-100 flex items-center">
                    {room.isRoom ? (
                      <>
                        <i className="fas fa-user mr-2"></i>
                        {room.users}
                      </>
                    ) : (
                      <i className="fas fa-envelope"></i>
                    )}
                  </span>
                  <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300">
                    {room.isRoom ? 'انضم الآن' : 'افتح الرسائل'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <CreateRoomModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateRoom}
      />
    </div>
  );
}

export default RoomsPage;
