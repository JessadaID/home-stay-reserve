import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/apiClient';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // For now, always try customer login over this page. (Admin can have a different portal or toggle)
            const response = await api.post('/auth/customer/login', {
                email,
                password,
            });

            const { token, user } = response.data;
            login(user, token);

            // Redirect to home or previous page
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-stone-50 px-4 py-12">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-stone-200 p-8">
                <div className="text-center mb-10">
                    <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-md mx-auto mb-4">
                        H
                    </div>
                    <h2 className="text-3xl font-bold text-stone-800 tracking-tight">เข้าสู่ระบบ</h2>
                    <p className="text-stone-500 mt-2">เพื่อทำการจองและจัดการการเข้าพักของคุณ</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">อีเมล</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-stone-400"
                            placeholder="example@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">รหัสผ่าน</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-stone-400"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center text-stone-600">
                            <input type="checkbox" className="mr-2 rounded text-emerald-600 focus:ring-emerald-500" />
                            จดจำฉันระบบ
                        </label>
                        <a href="#" className="font-medium text-emerald-600 hover:text-emerald-500">ลืมรหัสผ่าน?</a>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 shadow-md transition-all disabled:opacity-70 flex justify-center items-center"
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            'เข้าสู่ระบบ'
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-stone-600">
                    ยังไม่มีไอดี?{' '}
                    <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-500 transition-colors">
                        สมัครสมาชิกใหม่
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
