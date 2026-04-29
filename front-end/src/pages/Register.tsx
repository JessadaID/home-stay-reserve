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

            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
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
                    <h2 className="text-3xl font-sans text-[#1A2F22] tracking-wide mb-2">สมัครสมาชิกใหม่</h2>
                    <p className="text-stone-500 font-light">เข้าร่วมกับเราเพื่อรับสิทธิพิเศษและการจองที่ง่ายขึ้น</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-sm text-sm text-center font-light">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-[#1A2F22] mb-1">ชื่อผู้ใช้ (Name)</label>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3.5 rounded-sm border border-[#E5EAE5] focus:ring-1 focus:ring-[#4a6b52] focus:border-[#4a6b52] outline-none transition-all placeholder:text-stone-400 font-light"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#1A2F22] mb-1">อีเมล</label>
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
                        <label className="block text-sm font-medium text-[#1A2F22] mb-1">รหัสผ่าน</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3.5 rounded-sm border border-[#E5EAE5] focus:ring-1 focus:ring-[#4a6b52] focus:border-[#4a6b52] outline-none transition-all placeholder:text-stone-400 font-light"
                            placeholder="••••••••"
                            minLength={6}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#1A2F22] mb-1">ยืนยันรหัสผ่าน</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3.5 rounded-sm border border-[#E5EAE5] focus:ring-1 focus:ring-[#4a6b52] focus:border-[#4a6b52] outline-none transition-all placeholder:text-stone-400 font-light"
                            placeholder="••••••••"
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-[#4a6b52] text-white font-medium rounded-sm hover:bg-[#3b5942] shadow-md transition-all disabled:opacity-70 flex justify-center items-center mt-4 tracking-wide"
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            'ยืนยันการสมัครสมาชิก'
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-stone-600 font-light">
                    มีไอดีอยู่แล้ว?{' '}
                    <Link to="/login" className="font-medium text-[#4a6b52] hover:text-[#3b5942] transition-colors border-b border-[#4a6b52] pb-0.5">
                        เข้าสู่ระบบเลย
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
