import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const { login, isAuthenticated, error: authError } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
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


  const { username, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ username, password });
    } catch (err) {
      // The error is now handled by the context, but we can still catch it
      // if we need to do something specific in the component.
      // The error message will be displayed via the `authError` state from context.
    }
  };

  return (
    <div className="bg-gray-950 text-white flex items-center justify-center h-screen p-4">
      <div className="bg-gray-800 p-8 sm:p-12 rounded-3xl shadow-2xl max-w-sm w-full text-center border-t-4 border-blue-500">
        <h2 className="text-3xl font-bold mb-8 text-gray-100">تسجيل الدخول</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="اسم المستخدم"
            name="username"
            value={username}
            onChange={onChange}
            required
            className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="كلمة المرور"
            name="password"
            value={password}
            onChange={onChange}
            required
            className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition-all duration-300 text-white font-semibold text-lg"
          >
            دخول
          </button>
        </form>
        <p className="mt-6 text-gray-400">
          ليس لديك حساب؟{' '}
          <Link to="/register" className="text-blue-400 hover:underline">
            أنشئ حسابًا
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
