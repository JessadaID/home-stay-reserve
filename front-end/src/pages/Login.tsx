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
        <div className="min-h-[80vh] flex items-center justify-center bg-[#F9FAF9] px-4 pt-32 pb-12">
            <div className="max-w-md w-full bg-white rounded-sm shadow-xl border border-[#E5EAE5] p-8 md:p-10">
                <div className="text-center mb-10">
                    <div className="w-12 h-12 bg-[#4a6b52] rounded-sm flex items-center justify-center text-white font-serif text-2xl shadow-md mx-auto mb-6">
                        H
                    </div>
                    <h2 className="text-3xl font-sans text-[#1A2F22] tracking-wide mb-2">เข้าสู่ระบบ</h2>
                    <p className="text-stone-500 font-light">เพื่อทำการจองและจัดการการเข้าพักของคุณ</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-sm text-sm text-center font-light">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-[#1A2F22] mb-2">อีเมล</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3.5 rounded-sm border border-[#E5EAE5] focus:ring-1 focus:ring-[#4a6b52] focus:border-[#4a6b52] outline-none transition-all placeholder:text-stone-400 font-light"
                            placeholder="example@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#1A2F22] mb-2">รหัสผ่าน</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3.5 rounded-sm border border-[#E5EAE5] focus:ring-1 focus:ring-[#4a6b52] focus:border-[#4a6b52] outline-none transition-all placeholder:text-stone-400 font-light"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center text-stone-600 font-light cursor-pointer">
                            <input type="checkbox" className="mr-2 rounded-sm text-[#4a6b52] focus:ring-[#4a6b52]" />
                            จดจำฉันในระบบ
                        </label>
                        <a href="#" className="font-medium text-[#4a6b52] hover:text-[#3b5942] transition-colors">ลืมรหัสผ่าน?</a>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-[#4a6b52] text-white font-medium rounded-sm hover:bg-[#3b5942] shadow-md transition-all disabled:opacity-70 flex justify-center items-center tracking-wide"
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            'เข้าสู่ระบบ'
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-stone-600 font-light">
                    ยังไม่มีไอดี?{' '}
                    <Link to="/register" className="font-medium text-[#4a6b52] hover:text-[#3b5942] transition-colors border-b border-[#4a6b52] pb-0.5">
                        สมัครสมาชิกใหม่
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
