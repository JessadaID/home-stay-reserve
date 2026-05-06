import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FiUsers, FiCalendar, FiDollarSign, FiGrid, FiList } from 'react-icons/fi';
import api from '../../api/apiClient';

const AdminDashboard = () => {
    const BOOKING_SERVICE_URL = import.meta.env.VITE_BOOKING_SERVICE_URL || ""
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
                    api.get(`${BOOKING_SERVICE_URL}/api/bookings`)
                ]);

                const bookings = bookingsRes.data;

                const uniqueCustomers = new Set(bookings.map((b: any) => b.customer_id).filter(Boolean));

                const totalRevenue = bookings.reduce((sum: number, b: any) => {
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
    }, [isAuthenticated, user, navigate, BOOKING_SERVICE_URL]);

    if (!user || user.role !== 'admin') {
        return null;
    }

    return (
        <div className="bg-slate-50 min-h-screen pt-32 pb-8 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 flex justify-between items-end border-b border-slate-200 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Control Panel</h1>
                        <p className="text-slate-500 text-sm mt-1">Logged in as {user.username}</p>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded border border-slate-200 p-5 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded flex items-center justify-center">
                            <FiCalendar size={20} />
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Total Bookings</p>
                            <h3 className="text-xl font-bold text-slate-800 mt-1">{loading ? '--' : stats.bookings}</h3>
                        </div>
                    </div>

                    <div className="bg-white rounded border border-slate-200 p-5 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded flex items-center justify-center">
                            <FiUsers size={20} />
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Total Customers</p>
                            <h3 className="text-xl font-bold text-slate-800 mt-1">{loading ? '--' : stats.customers}</h3>
                        </div>
                    </div>
                    <div className="bg-white rounded border border-slate-200 p-5 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded flex items-center justify-center">
                            <FiDollarSign size={20} />
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Total Revenue</p>
                            <h3 className="text-xl font-bold text-slate-800 mt-1">{loading ? '--' : `฿${stats.revenue.toLocaleString()}`}</h3>
                        </div>
                    </div>
                </div>

                {/* Main Dashboard Info Area */}
                <div className="bg-white rounded shadow-sm border border-slate-200">
                    <div className="border-b border-slate-200 p-4">
                        <h2 className="text-lg font-semibold text-slate-800">System Modules</h2>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Manage Bookings */}
                        <div onClick={() => navigate('/admin/bookings')} className="cursor-pointer bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 p-5 transition-colors flex flex-col items-start">
                            <div className="text-slate-700 mb-3">
                                <FiList size={24} />
                            </div>
                            <h3 className="text-base font-semibold text-slate-800">Bookings</h3>
                            <p className="text-xs text-slate-500 mt-1">Manage customer reservations</p>
                        </div>
                        {/* Manage Rooms */}
                        <div onClick={() => navigate('/admin/rooms')} className="cursor-pointer bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 p-5 transition-colors flex flex-col items-start">
                            <div className="text-slate-700 mb-3">
                                <FiGrid size={24} />
                            </div>
                            <h3 className="text-base font-semibold text-slate-800">Rooms</h3>
                            <p className="text-xs text-slate-500 mt-1">Manage rooms and pricing</p>
                        </div>

                        {/* Manage Holidays */}
                        <div onClick={() => navigate('/admin/holidays')} className="cursor-pointer bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 p-5 transition-colors flex flex-col items-start">
                            <div className="text-slate-700 mb-3">
                                <FiCalendar size={24} />
                            </div>
                            <h3 className="text-base font-semibold text-slate-800">Holidays</h3>
                            <p className="text-xs text-slate-500 mt-1">Manage closed dates</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
