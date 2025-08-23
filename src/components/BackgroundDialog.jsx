import React from 'react';
import { X } from 'lucide-react';

const presetBackgrounds = [
  'https://images.unsplash.com/photo-1464618663641-bbdd760ae84a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1488330890490-c291ecf62571?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1588392382834-a891154bca4d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
];

const BackgroundDialog = ({ onClose, onPresetSelect, onCustomUpload }) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (onCustomUpload) {
          onCustomUpload(e.target.result);
        }
        onClose();
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePresetSelect = (bg) => {
    if (onPresetSelect) {
      onPresetSelect(bg);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl text-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Change Room Background</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Upload a custom image</h3>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-violet-50 file:text-violet-700
              hover:file:bg-violet-100"
          />
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Or select a preset</h3>
          <div className="grid grid-cols-3 gap-4" style={{maxHeight: '300px', overflowY: 'auto'}}>
            {presetBackgrounds.map((bg, index) => (
              <div key={index} className="cursor-pointer" onClick={() => handlePresetSelect(bg)}>
                <img src={bg} alt={`Preset ${index + 1}`} className="w-full h-24 object-cover rounded-md hover:opacity-80 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackgroundDialog;
