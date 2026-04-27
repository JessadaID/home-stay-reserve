import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FiChevronLeft, FiPlus, FiTrash2, FiCalendar } from 'react-icons/fi';
import api from '../../api/apiClient';
import type { Holiday } from '../../types';

const AdminHolidays = () => {
    const { user, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [loading, setLoading] = useState(true);

    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [adding, setAdding] = useState(false);

    const fetchHolidays = async () => {
        setLoading(true);
        try {
            const res = await api.get(`${API_URL}/api/holidays`);
            setHolidays(res.data);
        } catch (error) {
            console.error("Error fetching holidays", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'admin') {
            navigate('/admin/login');
            return;
        }
        fetchHolidays();
    }, [isAuthenticated, user, navigate]);

    const handleAddHoliday = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date) return;

        setAdding(true);
        try {
            await api.post(`${API_URL}/api/holidays`, {
                holiday_date: date,
                description
            });
            setDate('');
            setDescription('');
            fetchHolidays();
        } catch (error: any) {
            alert(error.response?.data?.message || 'เพิ่มวันหยุดไม่สำเร็จ');
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('คุณต้องการยกเลิกวันหยุดนี้ใช่หรือไม่?')) return;
        try {
            await api.delete(`${API_URL}/api/holidays/${id}`);
            fetchHolidays();
        } catch (error) {
            alert('ลบวันหยุดล้มเหลว');
        }
    };

    if (loading && holidays.length === 0) return null;

    return (
        <div className="bg-stone-50 min-h-[80vh] py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/admin/dashboard" className="p-2 bg-white text-stone-500 hover:text-stone-800 rounded-xl shadow-sm border border-stone-200 transition-colors">
                        <FiChevronLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-stone-800 tracking-tight">จัดการวันหยุดที่พัก</h1>
                        <p className="text-stone-600 mt-1">กำหนดวันที่โฮมสเตย์ปิดให้บริการ (ลูกค้าจะไม่สามารถจองได้)</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Add Holiday Form */}
                    <div className="md:col-span-1">
                        <form onSubmit={handleAddHoliday} className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200">
                            <h2 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
                                <FiPlus className="text-rose-500" /> เพิ่มวันหยุด
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">วันที่ต้องการปิดรับจอง</label>
                                    <input
                                        type="date"
                                        required
                                        value={date}
                                        onChange={e => setDate(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">เหตุผล (ไม่บังคับ)</label>
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder="เช่น ปิดปรับปรุงประจำเดือน"
                                        className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 outline-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={adding || !date}
                                    className="w-full py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-500 transition-all disabled:opacity-50"
                                >
                                    {adding ? 'กำลังบันทึก...' : 'บันทึกวันหยุด'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Holiday List */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
                            <div className="p-6 border-b border-stone-100 bg-stone-50/50">
                                <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                                    <FiCalendar className="text-stone-500" /> รายการวันหยุดที่เพิ่มเข้ามา
                                </h2>
                            </div>
                            <div className="p-6">
                                {holidays.length === 0 ? (
                                    <div className="text-center py-10 text-stone-500">
                                        ยังไม่ได้กำหนดวันหยุดใดๆ สำหรับโฮมสเตย์นี้
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {holidays.map((h) => {
                                            const d = new Date(h.holiday_date);
                                            return (
                                                <div key={h.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-stone-200 hover:border-rose-200 hover:bg-rose-50/30 transition-colors group">
                                                    <div>
                                                        <p className="font-bold text-stone-800 text-lg">
                                                            {d.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                        </p>
                                                        {h.description && (
                                                            <p className="text-sm text-stone-500 mt-1">{h.description}</p>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => handleDelete(h.id)}
                                                        className="mt-3 sm:mt-0 p-2.5 text-rose-500 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors w-fit"
                                                    >
                                                        <FiTrash2 size={18} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHolidays;
