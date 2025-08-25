import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function ProfilePage() {
  const { user, updateUser, loading } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    profileBackgroundUrl: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        profileBackgroundUrl: user.profileBackgroundUrl || '',
      });
    }
  }, [user]);

  const { username, profileBackgroundUrl } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUpdate = (e) => {
    e.preventDefault();
    updateUser(formData);
    setIsEditing(false);
  };

  if (loading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div
      className="min-h-screen text-white p-8 bg-cover bg-center"
      style={{ backgroundImage: `url(${user.profileBackgroundUrl})` }}
    >
      <div className="max-w-md mx-auto bg-gray-800 bg-opacity-80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border-t-4 border-pink-500">
        <div className="flex flex-col items-center">
          <img
            src={`https://avatar.iran.liara.run/public/boy?username=${user.username}`}
            alt={user.username}
            className="w-32 h-32 rounded-full border-4 border-pink-500"
          />
          {!isEditing ? (
            <div className="text-center mt-6">
              <h2 className="text-4xl font-bold">{user.username}</h2>
              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg text-white font-semibold"
              >
                تعديل الملف الشخصي
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="w-full mt-6 space-y-4">
              <input
                type="text"
                name="username"
                value={username}
                onChange={onChange}
                className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white placeholder-gray-400 text-center text-2xl focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <input
                type="text"
                name="profileBackgroundUrl"
                placeholder="رابط صورة الخلفية"
                value={profileBackgroundUrl}
                onChange={onChange}
                className="w-full px-4 py-2 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <div className="flex justify-center gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-semibold"
                >
                  حفظ التغييرات
                </button>
              </div>
            </form>
          )}
          <p className="text-gray-400 mt-2">عضو في AirChat</p>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
