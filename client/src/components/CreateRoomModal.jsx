import React, { useState } from 'react';

function CreateRoomModal({ isOpen, onClose, onCreate }) {
  const [roomName, setRoomName] = useState('');
  const [roomTopic, setRoomTopic] = useState('');

  if (!isOpen) return null;

  const handleCreate = () => {
    // Basic validation
    if (roomName.trim() === '' || roomTopic.trim() === '') {
      alert('الرجاء إدخال اسم وتفاصيل الغرفة.');
      return;
    }
    onCreate({ name: roomName, topic: roomTopic });
    onClose(); // Close modal after creation
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border-t-4 border-purple-500">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">إنشاء غرفة جديدة</h2>
        <div className="space-y-6">
          <input
            type="text"
            placeholder="اسم الغرفة"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full px-5 py-3 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          />
          <input
            type="text"
            placeholder="موضوع الغرفة"
            value={roomTopic}
            onChange={(e) => setRoomTopic(e.target.value)}
            className="w-full px-5 py-3 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
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
            onClick={handleCreate}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
          >
            إنشاء
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateRoomModal;
