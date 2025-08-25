import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="bg-gray-950 text-white flex items-center justify-center h-screen p-4">
      <div className="bg-gray-800 p-8 sm:p-12 rounded-3xl shadow-2xl max-w-sm w-full text-center border-t-4 border-blue-500">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-gray-100">مرحبًا بك في AirChat</h1>
        <div className="space-y-6">
          <Link to="/login" className="block w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition-all duration-300 text-white font-semibold text-lg btn-press">
            تسجيل الدخول
          </Link>
          <Link to="/rooms" className="block w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            الانتقال إلى الغرف
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
