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
    }, [isAuthenticated, user, navigate, API_URL]);

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
        <div className="bg-slate-50 min-h-screen pt-32 pb-8 px-6">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-4 mb-6 border-b border-slate-200 pb-4">
                    <Link to="/admin/dashboard" className="p-2 bg-white text-slate-500 hover:text-slate-800 rounded shadow-sm border border-slate-200 transition-colors">
                        <FiChevronLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Manage Holidays</h1>
                        <p className="text-slate-500 text-sm mt-1">Set dates when the homestay is closed for booking</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Add Holiday Form */}
                    <div className="md:col-span-1">
                        <form onSubmit={handleAddHoliday} className="bg-white rounded p-5 shadow-sm border border-slate-200">
                            <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                                <FiPlus className="text-blue-600" /> Add Closed Date
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={date}
                                        onChange={e => setDate(e.target.value)}
                                        className="w-full px-3 py-2 rounded border border-slate-300 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Reason (Optional)</label>
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder="e.g. Monthly maintenance"
                                        className="w-full px-3 py-2 rounded border border-slate-300 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={adding || !date}
                                    className="w-full py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {adding ? 'Saving...' : 'Save Date'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Holiday List */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-4 border-b border-slate-100 bg-slate-50">
                                <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                    <FiCalendar className="text-slate-500" /> Scheduled Holidays
                                </h2>
                            </div>
                            <div className="p-5">
                                {holidays.length === 0 ? (
                                    <div className="text-center py-8 text-slate-500 text-sm">
                                        No closed dates scheduled.
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {holidays.map((h) => {
                                            const d = new Date(h.holiday_date);
                                            return (
                                                <div key={h.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded border border-slate-200 hover:border-slate-300 bg-white transition-colors group">
                                                    <div>
                                                        <p className="font-semibold text-slate-800 text-sm">
                                                            {d.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                        </p>
                                                        {h.description && (
                                                            <p className="text-xs text-slate-500 mt-0.5">{h.description}</p>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => handleDelete(h.id)}
                                                        className="mt-2 sm:mt-0 p-1.5 text-red-500 hover:text-red-700 bg-white rounded hover:bg-red-50 transition-colors w-fit border border-transparent hover:border-red-100"
                                                        title="Delete this date"
                                                    >
                                                        <FiTrash2 size={16} />
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
