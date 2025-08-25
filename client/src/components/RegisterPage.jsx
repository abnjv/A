import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RegisterPage() {
  // The register function is not in the context yet, so we'll add it.
  // For now, we'll just use isAuthenticated and error for redirection.
  const { register, isAuthenticated, error: authError } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    password2: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/rooms');
    }
    if (authError) {
      setError(authError);
    }
  }, [isAuthenticated, authError, navigate]);

  const { username, password, password2 } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== password2) {
      setError('Passwords do not match');
      return;
    }
    try {
      await register({ username, password });
      // The redirection will now be handled by the useEffect
    } catch (err) {
      // Error is handled by the context
    }
  };

  return (
    <div className="bg-gray-950 text-white flex items-center justify-center h-screen p-4">
      <div className="bg-gray-800 p-8 sm:p-12 rounded-3xl shadow-2xl max-w-sm w-full text-center border-t-4 border-purple-500">
        <h2 className="text-3xl font-bold mb-8 text-gray-100">إنشاء حساب</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="اسم المستخدم"
            name="username"
            value={username}
            onChange={onChange}
            required
            className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="password"
            placeholder="كلمة المرور"
            name="password"
            value={password}
            onChange={onChange}
            minLength="6"
            required
            className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="password"
            placeholder="تأكيد كلمة المرور"
            name="password2"
            value={password2}
            onChange={onChange}
            minLength="6"
            required
            className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 transition-all duration-300 text-white font-semibold text-lg"
          >
            تسجيل
          </button>
        </form>
        <p className="mt-6 text-gray-400">
          لديك حساب بالفعل؟{' '}
          <Link to="/login" className="text-purple-400 hover:underline">
            سجل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
