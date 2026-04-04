import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FiUsers, FiCalendar, FiDollarSign, FiMap, FiGrid, FiList } from 'react-icons/fi';
import api from '../../api/apiClient';

const AdminDashboard = () => {
    const { user, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        bookings: 0,
        customers: 0,
        revenue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'admin') {
            navigate('/admin/login');
            return;
        }

        const fetchDashboardData = async () => {
            try {
                const [bookingsRes] = await Promise.all([
                    api.get('/bookings')
                ]);

                const bookings = bookingsRes.data;

                const uniqueCustomers = new Set(bookings.map((b: any) => b.customer_id).filter(Boolean));

                const totalRevenue = bookings.reduce((sum: number, b: any) => {
                    // Only count paid or deposit_paid
                    if (b.payment_status === 'paid' || b.payment_status === 'deposit_paid') {
                        return sum + (Number(b.total_price) || 0);
                    }
                    return sum;
                }, 0);

                setStats({
                    bookings: bookings.length,
                    customers: uniqueCustomers.size,
                    revenue: totalRevenue
                });
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [isAuthenticated, user, navigate]);

    if (!user || user.role !== 'admin') {
        return null;
    }

    return (
        <div className="bg-stone-50 min-h-[80vh] py-10 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-stone-800 tracking-tight">Admin Dashboard</h1>
                    <p className="text-stone-600 mt-2">ยินดีต้อนรับกลับ, {user.username}. ภาพรวมของระบบ Homestay Reserve</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 flex items-center gap-4">
                        <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                            <FiCalendar size={24} />
                        </div>
                        <div>
                            <p className="text-stone-500 text-sm font-medium">การจองทั้งหมด</p>
                            <h3 className="text-2xl font-bold text-stone-800">{loading ? '--' : stats.bookings} รายการ</h3>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 flex items-center gap-4">
                        <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                            <FiUsers size={24} />
                        </div>
                        <div>
                            <p className="text-stone-500 text-sm font-medium">ลูกค้าทั้งหมด</p>
                            <h3 className="text-2xl font-bold text-stone-800">{loading ? '--' : stats.customers} คน</h3>
                        </div>
                    </div>
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 flex items-center gap-4">
                        <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                            <FiDollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-stone-500 text-sm font-medium">รายได้รวมที่ชำระแล้ว</p>
                            <h3 className="text-2xl font-bold text-stone-800">{loading ? '--' : `฿${stats.revenue.toLocaleString()}`}</h3>
                        </div>
                    </div>
                </div>

                {/* Main Dashboard Info Area */}
                <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-8 min-h-[400px]">
                    <h2 className="text-2xl font-bold text-stone-800 mb-8 border-b border-stone-100 pb-4">ฟังก์ชันการจัดการ</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Manage Bookings */}
                        <div onClick={() => navigate('/admin/bookings')} className="group cursor-pointer bg-stone-50 hover:bg-purple-50 rounded-2xl p-6 border border-stone-200 hover:border-purple-200 transition-all text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                                <FiList size={28} />
                            </div>
                            <h3 className="text-lg font-bold text-stone-800 mb-2">จัดการออเดอร์ (Bookings)</h3>
                            <p className="text-sm text-stone-500">ตรวจสอบและแก้ไขสถานะออเดอร์</p>
                        </div>
                        {/* Manage Rooms */}
                        <div onClick={() => navigate('/admin/rooms')} className="group cursor-pointer bg-stone-50 hover:bg-emerald-50 rounded-2xl p-6 border border-stone-200 hover:border-emerald-200 transition-all text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                                <FiGrid size={28} />
                            </div>
                            <h3 className="text-lg font-bold text-stone-800 mb-2">จัดการห้องพัก</h3>
                            <p className="text-sm text-stone-500">เพิ่ม, แก้ไข หรือลบห้องพัก และกำหนดราคา</p>
                        </div>

                        {/* Manage Map */}
                        <div onClick={() => navigate('/admin/map')} className="group cursor-pointer bg-stone-50 hover:bg-blue-50 rounded-2xl p-6 border border-stone-200 hover:border-blue-200 transition-all text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                                <FiMap size={28} />
                            </div>
                            <h3 className="text-lg font-bold text-stone-800 mb-2">จัดการแผนที่</h3>
                            <p className="text-sm text-stone-500">กำหนดหมุดตำแหน่ง และแก้ไขพิกัดที่พัก</p>
                        </div>

                        {/* Manage Holidays */}
                        <div onClick={() => navigate('/admin/holidays')} className="group cursor-pointer bg-stone-50 hover:bg-rose-50 rounded-2xl p-6 border border-stone-200 hover:border-rose-200 transition-all text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-rose-600 mb-4 group-hover:scale-110 transition-transform">
                                <FiCalendar size={28} />
                            </div>
                            <h3 className="text-lg font-bold text-stone-800 mb-2">จัดการวันหยุดที่พัก</h3>
                            <p className="text-sm text-stone-500">กำหนดวันปิดบริการ หรือวันหยุดของโฮมสเตย์</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
