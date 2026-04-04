import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/apiClient';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
            return;
        }

        setIsLoading(true);

        try {
            await api.post('/auth/customer/register', {
                username,
                email,
                password,
            });

            // After successful registration, route to login or auto-login
            // For simplicity, route to login page
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
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
                    <h2 className="text-3xl font-bold text-stone-800 tracking-tight">สมัครสมาชิกใหม่</h2>
                    <p className="text-stone-500 mt-2">เข้าร่วมกับเราเพื่อรับสิทธิพิเศษและการจองที่ง่ายขึ้น</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">ชื่อผู้ใช้ (Username)</label>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-stone-400"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">อีเมล</label>
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
                        <label className="block text-sm font-medium text-stone-700 mb-1">รหัสผ่าน</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-stone-400"
                            placeholder="••••••••"
                            minLength={6}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">ยืนยันรหัสผ่าน</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-stone-400"
                            placeholder="••••••••"
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 shadow-md transition-all disabled:opacity-70 flex justify-center items-center mt-2"
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            'ยืนยันการสมัครสมาชิก'
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-stone-600">
                    มีไอดีอยู่แล้ว?{' '}
                    <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-500 transition-colors">
                        เข้าสู่ระบบเลย
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
