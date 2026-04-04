import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiClock, FiHome, FiTrash2, FiAlertCircle, FiCreditCard } from 'react-icons/fi';
import api from '../api/apiClient';
import { AuthContext } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';
import type { Booking } from '../types';

const MyBookings = () => {
    const { isAuthenticated } = useContext(AuthContext);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState<number | null>(null);
    const [paymentModalBooking, setPaymentModalBooking] = useState<Booking | null>(null);

    useEffect(() => {
        const fetchBookings = async () => {
            if (!isAuthenticated) {
                setLoading(false);
                return;
            }
            try {
                const response = await api.get('/bookings/me');
                setBookings(response.data);
            } catch (error) {
                console.error("Error fetching my bookings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [isAuthenticated]);

    const refreshBookings = async () => {
        try {
            const response = await api.get('/bookings/me');
            setBookings(response.data);
        } catch (error) {
            console.error("Error refreshing bookings:", error);
        }
    };

    const cancelBooking = async (bookingId: number) => {
        if (!window.confirm('ต้องการยกเลิกการจองนี้ใช่หรือไม่?')) return;
        setCancellingId(bookingId);
        try {
            await api.delete(`/bookings/${bookingId}`);
            // Remove cancelled booking from state
            setBookings((prev) => prev.filter((b) => b.id !== bookingId));
        } catch (error) {
            console.error('Error cancelling booking:', error);
            alert('ไม่สามารถยกเลิกการจองได้ กรุณาลองใหม่อีกครั้ง');
        } finally {
            setCancellingId(null);
        }
    };

    const calculateDays = (start: string, end: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays === 0 ? 1 : diffDays;
    };

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return new Date(dateString).toLocaleDateString('th-TH', options);
    };

    const isUpcoming = (checkInDate: string) => {
        return new Date(checkInDate) >= new Date(new Date().setHours(0, 0, 0, 0));
    };

    if (loading) {
        return (
            <div className="bg-stone-50 min-h-screen py-20 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="bg-stone-50 min-h-screen py-20 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-stone-800 mb-4">กรุณาเข้าสู่ระบบ</h2>
                <p className="text-stone-600 mb-6">เพื่อดูประวัติการจองของคุณ</p>
                <Link to="/login" className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-500 transition-colors">
                    ไปที่หน้าเข้าสู่ระบบ
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-stone-50 min-h-screen py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-stone-800 tracking-tight">การจองของฉัน</h1>
                    <p className="text-stone-600 mt-2">ตรวจสอบรายละเอียดและประวัติการเข้าพักทั้งหมดของคุณที่นี่</p>
                </div>

                {bookings.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-stone-200">
                        <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FiCalendar className="text-stone-400 text-3xl" />
                        </div>
                        <h3 className="text-xl font-bold text-stone-800 mb-2">ยังไม่มีประวัติการจอง</h3>
                        <p className="text-stone-500 mb-8 max-w-sm mx-auto">
                            คุณยังไม่มีรายการเข้าพักในระบบของเรา เริ่มต้นค้นหาห้องพักที่ถูกใจได้เลย
                        </p>
                        <Link to="/rooms" className="px-6 py-3 bg-emerald-600 px-8 py-3 text-white rounded-xl font-bold hover:bg-emerald-500 transition-colors inline-block">
                            ค้นหาห้องพัก
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {bookings.map((booking) => {
                            const days = calculateDays(booking.check_in, booking.check_out);
                            const totalAmount = days * (Number(booking.price) || 0);
                            const upcoming = isUpcoming(booking.check_in);

                            return (
                                <div key={booking.id} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-stone-200 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                                    {/* Thumbnail */}
                                    <div className="w-full md:w-48 h-48 md:h-auto bg-stone-100 rounded-2xl overflow-hidden shrink-0 relative">
                                        {booking.room_image ? (
                                            <img src={booking.room_image} alt={booking.room_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-stone-400 flex-col gap-2">
                                                <FiHome size={24} />
                                                <span className="text-sm">ไม่มีรูปภาพ</span>
                                            </div>
                                        )}
                                        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${upcoming ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-600'}`}>
                                            {upcoming ? 'เช็คอินเร็วๆ นี้' : 'เข้าพักแล้ว'}
                                        </div>
                                        {booking.payment_status && (
                                            <div className={`absolute bottom-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md 
                                                ${booking.payment_status === 'pending' ? 'bg-rose-500/90 text-white' :
                                                    booking.payment_status === 'deposit_paid' ? 'bg-orange-500/90 text-white' : 'bg-emerald-500/90 text-white'}`}>
                                                {booking.payment_status === 'pending' ? 'รอการชำระเงิน' :
                                                    booking.payment_status === 'deposit_paid' ? 'ชำระมัดจำแล้ว' : 'ชำระเงินครบแล้ว'}
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <Link to={`/rooms/${booking.room_id}`} className="text-2xl font-bold text-stone-800 hover:text-emerald-600 transition-colors flex items-center gap-2">
                                                {booking.room_name}
                                            </Link>
                                            <div className="text-right">
                                                <div className="text-xl font-bold text-emerald-600">฿{booking.total_price ? Number(booking.total_price).toLocaleString() : totalAmount.toLocaleString()}</div>
                                                <div className="text-xs text-stone-500">รวม {days} คืน</div>
                                            </div>
                                        </div>

                                        {/* Booking date */}
                                        <div className="text-sm text-stone-500 mb-4 flex items-center gap-1">
                                            <FiClock />
                                            ทำการจองเมื่อ:{' '}
                                            {booking.created_at
                                                ? formatDate(booking.created_at)
                                                : 'ไม่มีข้อมูล'}
                                        </div>

                                        <div className="mt-auto grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-100 mb-4">
                                            <div>
                                                <p className="text-xs text-stone-500 font-medium mb-1 uppercase tracking-wider">วันเช็คอิน</p>
                                                <p className="font-bold text-stone-800 flex items-center gap-2">
                                                    <FiCalendar className="text-emerald-600" />
                                                    {formatDate(booking.check_in)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-stone-500 font-medium mb-1 uppercase tracking-wider">วันเช็คเอาท์</p>
                                                <p className="font-bold text-stone-800 flex items-center gap-2">
                                                    <FiCalendar className="text-emerald-600" />
                                                    {formatDate(booking.check_out)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Action buttons - only for upcoming bookings */}
                                        {upcoming && (
                                            <div className="self-start flex flex-wrap gap-3">
                                                {booking.payment_status === 'pending' && (
                                                    <button
                                                        onClick={() => setPaymentModalBooking(booking)}
                                                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-all"
                                                    >
                                                        <FiCreditCard size={14} />
                                                        ชำระเงิน
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => cancelBooking(booking.id)}
                                                    disabled={cancellingId === booking.id}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-rose-600 border border-rose-200 hover:bg-rose-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {cancellingId === booking.id ? (
                                                        <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <FiTrash2 size={14} />
                                                    )}
                                                    ยกเลิกการจอง
                                                </button>
                                            </div>
                                        )}
                                        {!upcoming && (
                                            <div className="self-start flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-stone-400 border border-stone-100 bg-stone-50">
                                                <FiAlertCircle size={14} />
                                                เข้าพักเรียบร้อย ไม่สามารถยกเลิกได้
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {paymentModalBooking && (
                <PaymentModal
                    booking={{
                        id: paymentModalBooking.id,
                        total_price: paymentModalBooking.total_price || (calculateDays(paymentModalBooking.check_in, paymentModalBooking.check_out) * (paymentModalBooking.price || 0)),
                        payment_type: paymentModalBooking.payment_type,
                        deposit_percentage: paymentModalBooking.deposit_percentage || 50 // Default fallback
                    }}
                    onClose={() => setPaymentModalBooking(null)}
                    onSuccess={() => {
                        setPaymentModalBooking(null);
                        refreshBookings();
                    }}
                />
            )}
        </div>
    );
};

export default MyBookings;
