import { useEffect, useState, useContext } from 'react';
import { FiEdit2, FiTrash2, FiSave, FiX, FiCheckCircle, FiClock, FiCreditCard } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/apiClient';
import type { Booking } from '../../types';

const AdminBookings = () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const { user, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editStatus, setEditStatus] = useState<string>('');

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'admin') {
            navigate('/admin/login');
            return;
        }
        fetchBookings();
    }, [isAuthenticated, user]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await api.get(`${API_URL}/api/bookings`);
            setBookings(res.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (booking: Booking) => {
        setEditingId(booking.id);
        setEditStatus(booking.payment_status || '');
    };

    const handleSave = async (id: number) => {
        try {
            await api.put(`${API_URL}/api/bookings/${id}`, { payment_status: editStatus });
            setEditingId(null);
            fetchBookings();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error updating booking');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('ยืนยันการลบการจองนี้?')) return;
        try {
            await api.delete(`${API_URL}/api/bookings/${id}`);
            fetchBookings();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error deleting booking');
        }
    };

    const getStatusWidget = (status: string) => {
        if (status === 'paid') return <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded text-xs font-semibold border border-emerald-200 flex items-center w-max gap-1"><FiCheckCircle /> ชำระครบแล้ว</span>;
        if (status === 'deposit_paid') return <span className="bg-orange-50 text-orange-700 px-2.5 py-0.5 rounded text-xs font-semibold border border-orange-200 flex items-center w-max gap-1"><FiCreditCard /> มัดจำแล้ว</span>;
        return <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded text-xs font-semibold border border-slate-200 flex items-center w-max gap-1"><FiClock /> รอดำเนินการ</span>;
    };

    if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

    return (
        <div className="bg-slate-50 min-h-screen pt-32 pb-8 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-6 border-b border-slate-200 pb-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Manage Bookings</h1>
                        <p className="text-slate-500 text-sm mt-1">Review and update customer payment status</p>
                    </div>
                </div>

                <div className="bg-white rounded shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
                                    <th className="px-4 py-3 font-semibold">ID</th>
                                    <th className="px-4 py-3 font-semibold">Customer</th>
                                    <th className="px-4 py-3 font-semibold">Room</th>
                                    <th className="px-4 py-3 font-semibold">Dates (In - Out)</th>
                                    <th className="px-4 py-3 font-semibold">Total</th>
                                    <th className="px-4 py-3 font-semibold">Type</th>
                                    <th className="px-4 py-3 font-semibold">Status</th>
                                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {bookings.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="p-8 text-center text-slate-500">No booking records found.</td>
                                    </tr>
                                ) : (
                                    bookings.map(booking => {
                                        const isLocked = booking.payment_status === 'paid';
                                        const isEditing = editingId === booking.id;

                                        return (
                                            <tr key={booking.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                                <td className="px-4 py-3 font-medium text-slate-700">#{booking.id}</td>
                                                <td className="px-4 py-3 font-semibold text-slate-800">{booking.customer_name}</td>
                                                <td className="px-4 py-3 text-slate-600">{booking.room_name}</td>
                                                <td className="px-4 py-3 text-slate-500 text-xs">
                                                    <div>{new Date(booking.check_in).toLocaleDateString()} to</div>
                                                    <div>{new Date(booking.check_out).toLocaleDateString()}</div>
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-blue-600">฿{Number(booking.total_price).toLocaleString()}</td>
                                                <td className="px-4 py-3 text-slate-600 capitalize">{booking.payment_type}</td>
                                                <td className="px-4 py-3">
                                                    {isEditing ? (
                                                        <select
                                                            value={editStatus}
                                                            onChange={(e) => setEditStatus(e.target.value)}
                                                            className="px-2 py-1.5 border border-blue-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none w-full"
                                                        >
                                                            <option value="pending">รอดำเนินการ</option>
                                                            <option value="deposit_paid">มัดจำแล้ว</option>
                                                            <option value="paid">ชำระครบแล้ว</option>
                                                        </select>
                                                    ) : (
                                                        getStatusWidget(booking.payment_status || '')
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-1.5">
                                                        {isEditing ? (
                                                            <>
                                                                <button onClick={() => handleSave(booking.id)} className="p-1.5 rounded bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors" title="Save">
                                                                    <FiSave size={16} />
                                                                </button>
                                                                <button onClick={() => setEditingId(null)} className="p-1.5 rounded bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors" title="Cancel">
                                                                    <FiX size={16} />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => handleEdit(booking)}
                                                                    disabled={isLocked}
                                                                    className={`p-1.5 rounded transition-colors border ${isLocked
                                                                        ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                                                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                                                        }`}
                                                                    title={isLocked ? "Cannot edit fully paid booking" : "Edit status"}
                                                                >
                                                                    <FiEdit2 size={16} />
                                                                </button>
                                                                <button onClick={() => handleDelete(booking.id)} className="p-1.5 rounded bg-white text-red-600 border border-red-200 hover:bg-red-50 transition-colors" title="Delete">
                                                                    <FiTrash2 size={16} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminBookings;
