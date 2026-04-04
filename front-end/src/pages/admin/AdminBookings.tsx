import { useEffect, useState, useContext } from 'react';
import { FiEdit2, FiTrash2, FiSave, FiX, FiCheckCircle, FiClock, FiCreditCard } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/apiClient';
import type { Booking } from '../../types';

const AdminBookings = () => {
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
            const res = await api.get('/bookings');
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
            await api.put(`/bookings/${id}`, { payment_status: editStatus });
            setEditingId(null);
            fetchBookings();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error updating booking');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('ยืนยันการลบการจองนี้?')) return;
        try {
            await api.delete(`/bookings/${id}`);
            fetchBookings();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error deleting booking');
        }
    };

    const getStatusWidget = (status: string) => {
        if (status === 'paid') return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center w-max gap-1"><FiCheckCircle /> ชำระครบแล้ว</span>;
        if (status === 'deposit_paid') return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold flex items-center w-max gap-1"><FiCreditCard /> มัดจำแล้ว</span>;
        return <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-xs font-bold flex items-center w-max gap-1"><FiClock /> รอดำเนินการ</span>;
    };

    if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div></div>;

    return (
        <div className="bg-stone-50 min-h-screen py-10 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-stone-800">จัดการข้อมูลการจอง</h1>
                        <p className="text-stone-600">ตรวจสอบและอัปเดตสถานะการชำระเงินของลูกค้า</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-stone-100/50 border-b border-stone-200 text-stone-600 text-sm">
                                    <th className="p-4 font-semibold">รหัส</th>
                                    <th className="p-4 font-semibold">ลูกค้า</th>
                                    <th className="p-4 font-semibold">ห้องพัก</th>
                                    <th className="p-4 font-semibold">เช็คอิน / เช็คเอาท์</th>
                                    <th className="p-4 font-semibold">ยอดรวม</th>
                                    <th className="p-4 font-semibold">รูปแบบชำระ</th>
                                    <th className="p-4 font-semibold">สถานะ</th>
                                    <th className="p-4 font-semibold text-right">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="p-8 text-center text-stone-500">ยังไม่มีประวัติการจองในระบบ</td>
                                    </tr>
                                ) : (
                                    bookings.map(booking => {
                                        const isLocked = booking.payment_status === 'paid';
                                        const isEditing = editingId === booking.id;

                                        return (
                                            <tr key={booking.id} className="border-b border-stone-100 hover:bg-stone-50/50">
                                                <td className="p-4 font-medium text-stone-700">#{booking.id}</td>
                                                <td className="p-4 font-semibold text-stone-800">{booking.customer_name}</td>
                                                <td className="p-4 text-stone-600">{booking.room_name}</td>
                                                <td className="p-4 text-stone-500 text-sm">
                                                    <div>{new Date(booking.check_in).toLocaleDateString()}</div>
                                                    <div>ถึง {new Date(booking.check_out).toLocaleDateString()}</div>
                                                </td>
                                                <td className="p-4 font-semibold text-emerald-600">฿{Number(booking.total_price).toLocaleString()}</td>
                                                <td className="p-4 text-stone-600 capitalize">{booking.payment_type}</td>
                                                <td className="p-4">
                                                    {isEditing ? (
                                                        <select
                                                            value={editStatus}
                                                            onChange={(e) => setEditStatus(e.target.value)}
                                                            className="px-2 py-1 border border-stone-300 rounded text-sm focus:ring-emerald-500 outline-none"
                                                        >
                                                            <option value="pending">รอดำเนินการ</option>
                                                            <option value="deposit_paid">มัดจำแล้ว</option>
                                                            <option value="paid">ชำระครบแล้ว</option>
                                                        </select>
                                                    ) : (
                                                        getStatusWidget(booking.payment_status || '')
                                                    )}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {isEditing ? (
                                                            <>
                                                                <button onClick={() => handleSave(booking.id)} className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center hover:bg-emerald-200 transition-colors" title="บันทึก">
                                                                    <FiSave />
                                                                </button>
                                                                <button onClick={() => setEditingId(null)} className="w-8 h-8 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center hover:bg-stone-200 transition-colors" title="ยกเลิก">
                                                                    <FiX />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => handleEdit(booking)}
                                                                    disabled={isLocked}
                                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isLocked
                                                                        ? 'bg-stone-100 text-stone-300 cursor-not-allowed'
                                                                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                                                        }`}
                                                                    title={isLocked ? "ไม่สามารถแก้ไขการจองที่จ่ายเต็มจำนวนแล้ว" : "แก้ไขการชำระเงิน"}
                                                                >
                                                                    <FiEdit2 />
                                                                </button>
                                                                <button onClick={() => handleDelete(booking.id)} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-100 transition-colors" title="ลบ">
                                                                    <FiTrash2 />
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
