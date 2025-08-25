import React, { useState, useEffect } from 'react';
import axios from 'axios';

function EditRoomModal({ isOpen, onClose, room, onRoomUpdated }) {
  const [formData, setFormData] = useState({
    name: '',
    topic: '',
    backgroundUrl: '',
  });

  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name,
        topic: room.topic,
        backgroundUrl: room.backgroundUrl || '',
      });
    }
  }, [room]);

  if (!isOpen || !room) return null;

  const { name, topic, backgroundUrl } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUpdate = async () => {
    try {
      const res = await axios.put(`/api/rooms/${room._id}`, formData);
      onRoomUpdated(res.data);
      onClose();
    } catch (err) {
      console.error('Error updating room', err);
      // Optionally show an error
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border-t-4 border-pink-500">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">تعديل الغرفة</h2>
        <div className="space-y-6">
          <input
            type="text"
            name="name"
            placeholder="اسم الغرفة"
            value={name}
            onChange={onChange}
            className="w-full px-5 py-3 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <input
            type="text"
            name="topic"
            placeholder="موضوع الغرفة"
            value={topic}
            onChange={onChange}
            className="w-full px-5 py-3 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <input
            type="text"
            name="backgroundUrl"
            placeholder="رابط صورة الخلفية"
            value={backgroundUrl}
            onChange={onChange}
            className="w-full px-5 py-3 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white font-semibold transition-all"
          >
            إلغاء
          </button>
          <button
            onClick={handleUpdate}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold shadow-lg hover:shadow-xl"
          >
            حفظ التغييرات
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditRoomModal;
