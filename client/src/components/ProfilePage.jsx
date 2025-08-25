import React from 'react';

function ProfilePage() {
  const username = localStorage.getItem('username') || 'ضيف';

  return (
    <div className="bg-gray-900 min-h-screen text-white p-8">
      <div className="max-w-md mx-auto bg-gray-800 rounded-2xl shadow-2xl p-8 border-t-4 border-pink-500">
        <div className="flex flex-col items-center">
          <img
            src={`https://avatar.iran.liara.run/public/boy?username=${username}`}
            alt={username}
            className="w-32 h-32 rounded-full border-4 border-pink-500"
          />
          <h2 className="text-4xl font-bold mt-6">{username}</h2>
          <p className="text-gray-400 mt-2">عضو في AirChat</p>
        </div>
        <div className="mt-8 text-center">
          <h3 className="text-xl font-bold text-pink-400">الإحصائيات</h3>
          <div className="flex justify-around mt-4">
            <div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-gray-400">غرف تم الانضمام إليها</p>
            </div>
            <div>
              <p className="text-2xl font-bold">158</p>
              <p className="text-gray-400">رسائل مرسلة</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
