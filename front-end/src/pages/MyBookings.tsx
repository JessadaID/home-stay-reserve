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
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    useEffect(() => {
        const fetchBookings = async () => {
            if (!isAuthenticated) {
                setLoading(false);
                return;
            }
            try {
                const response = await api.get(`${API_URL}/api/bookings/me`);
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
            const response = await api.get(`${API_URL}/api/bookings/me`);
            setBookings(response.data);
        } catch (error) {
            console.error("Error refreshing bookings:", error);
        }
    };

    const cancelBooking = async (bookingId: number) => {
        if (!window.confirm('ต้องการยกเลิกการจองนี้ใช่หรือไม่?')) return;
        setCancellingId(bookingId);
        try {
            await api.delete(`${API_URL}/api/bookings/${bookingId}`);
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
            <div className="bg-[#F9FAF9] min-h-screen py-20 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4a6b52]"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="bg-[#F9FAF9] min-h-screen py-20 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-serif text-[#1A2F22] mb-4">กรุณาเข้าสู่ระบบ</h2>
                <p className="text-stone-500 mb-6 font-light">เพื่อดูประวัติการจองของคุณ</p>
                <Link to="/login" className="px-6 py-3 bg-[#4a6b52] text-white rounded-sm font-medium hover:bg-[#3b5942] transition-colors">
                    ไปที่หน้าเข้าสู่ระบบ
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-[#F9FAF9] min-h-screen pt-32 pb-16 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-12 text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-sans text-[#1A2F22] tracking-wide mb-3">การจองของฉัน</h1>
                    <p className="text-stone-500 font-light text-base md:text-lg">ตรวจสอบรายละเอียดและประวัติการเข้าพักทั้งหมดของคุณที่นี่</p>
                </div>

                {bookings.length === 0 ? (
                    <div className="bg-white rounded-sm p-16 text-center shadow-lg border border-[#E5EAE5]">
                        <div className="w-20 h-20 bg-[#F4F7F4] rounded-full flex items-center justify-center mx-auto mb-6">
                            <FiCalendar className="text-[#4a6b52] text-3xl" />
                        </div>
                        <h3 className="text-xl font-sans text-[#1A2F22] mb-2">ยังไม่มีประวัติการจอง</h3>
                        <p className="text-stone-500 mb-8 max-w-sm mx-auto font-light">
                            คุณยังไม่มีรายการเข้าพักในระบบของเรา เริ่มต้นค้นหาห้องพักที่ถูกใจได้เลย
                        </p>
                        <Link to="/rooms" className="px-8 py-3 bg-[#4a6b52] text-white rounded-sm font-medium hover:bg-[#3b5942] transition-colors inline-block tracking-wide">
                            ค้นหาห้องพัก
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {bookings.map((booking) => {
                            const days = calculateDays(booking.check_in, booking.check_out);
                            const totalAmount = days * (Number(booking.price) || 0);
                            const upcoming = isUpcoming(booking.check_in);

                            return (
                                <div key={booking.id} className="bg-white rounded-sm p-6 md:p-8 shadow-lg border border-[#E5EAE5] flex flex-col md:flex-row gap-8 hover:shadow-xl transition-shadow group">
                                    {/* Thumbnail */}
                                    <div className="w-full md:w-56 h-56 md:h-auto bg-stone-100 rounded-sm overflow-hidden shrink-0 relative">
                                        {booking.room_image ? (
                                            <img src={`${API_URL}${booking.room_image}`} alt={booking.room_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-stone-400 flex-col gap-2">
                                                <FiHome size={24} />
                                                <span className="text-sm font-light">ไม่มีรูปภาพ</span>
                                            </div>
                                        )}
                                        <div className={`absolute top-3 left-3 px-3 py-1 rounded-sm text-xs font-medium shadow-sm tracking-wide ${upcoming ? 'bg-white text-[#4a6b52] border border-[#4a6b52]/20' : 'bg-stone-800 text-stone-200'}`}>
                                            {upcoming ? 'เช็คอินเร็วๆ นี้' : 'เข้าพักแล้ว'}
                                        </div>
                                        {booking.payment_status && (
                                            <div className={`absolute bottom-3 right-3 px-3 py-1 rounded-sm text-xs font-medium shadow-sm backdrop-blur-md 
                                                ${booking.payment_status === 'pending' ? (booking.payment_type === 'pay_on_arrival' ? 'bg-[#4a6b52]/90 text-white' : 'bg-rose-500/90 text-white') :
                                                    booking.payment_status === 'deposit_paid' ? 'bg-[#b68d40]/90 text-white' : 'bg-[#4a6b52]/90 text-white'}`}>
                                                {booking.payment_status === 'pending' ? (booking.payment_type === 'pay_on_arrival' ? 'จ่ายเมื่อเข้าพัก' : 'รอการชำระเงิน') :
                                                    booking.payment_status === 'deposit_paid' ? 'ชำระมัดจำแล้ว' : 'ชำระเงินครบแล้ว'}
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-4">
                                            <Link to={`/rooms/${booking.room_id}`} className="text-2xl md:text-3xl font-serif text-[#1A2F22] hover:text-[#4a6b52] transition-colors flex items-center gap-2">
                                                {booking.room_name}
                                            </Link>
                                            <div className="text-right">
                                                <div className="text-xl md:text-2xl font-serif text-[#4a6b52]">฿{booking.total_price ? Number(booking.total_price).toLocaleString() : totalAmount.toLocaleString()}</div>
                                                <div className="text-xs text-stone-500 font-light mt-1">รวม {days} คืน</div>
                                            </div>
                                        </div>

                                        {/* Booking date */}
                                        <div className="text-sm text-stone-500 mb-6 flex items-center gap-2 font-light">
                                            <FiClock className="text-stone-400" />
                                            ทำการจองเมื่อ:{' '}
                                            <span className="text-stone-600 font-medium">
                                                {booking.created_at
                                                    ? formatDate(booking.created_at)
                                                    : 'ไม่มีข้อมูล'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F9FAF9] p-5 rounded-sm border border-[#E5EAE5] mb-6">
                                            <div>
                                                <p className="text-xs text-stone-500 font-light mb-1 uppercase tracking-wider">วันเช็คอิน</p>
                                                <p className="font-medium text-[#1A2F22] flex items-center gap-2">
                                                    <FiCalendar className="text-[#4a6b52]" />
                                                    {formatDate(booking.check_in)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-stone-500 font-light mb-1 uppercase tracking-wider">วันเช็คเอาท์</p>
                                                <p className="font-medium text-[#1A2F22] flex items-center gap-2">
                                                    <FiCalendar className="text-[#4a6b52]" />
                                                    {formatDate(booking.check_out)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Action buttons - only for upcoming bookings */}
                                        <div className="mt-auto">
                                            {upcoming ? (
                                                <div className="flex flex-wrap gap-3">
                                                    {booking.payment_status === 'pending' && booking.payment_type !== 'pay_on_arrival' && (
                                                        <button
                                                            onClick={() => setPaymentModalBooking(booking)}
                                                            className="flex items-center gap-2 px-5 py-2.5 rounded-sm text-sm font-medium text-white bg-[#4a6b52] hover:bg-[#3b5942] shadow-sm transition-all tracking-wide"
                                                        >
                                                            <FiCreditCard size={16} />
                                                            ชำระเงิน
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => cancelBooking(booking.id)}
                                                        disabled={cancellingId === booking.id}
                                                        className="flex items-center gap-2 px-5 py-2.5 rounded-sm text-sm font-medium text-rose-700 border border-rose-200 hover:bg-rose-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
                                                    >
                                                        {cancellingId === booking.id ? (
                                                            <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <FiTrash2 size={16} />
                                                        )}
                                                        ยกเลิกการจอง
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 px-4 py-2.5 rounded-sm text-sm text-stone-500 border border-[#E5EAE5] bg-[#F9FAF9] font-light">
                                                    <FiAlertCircle size={16} className="text-stone-400" />
                                                    เข้าพักเรียบร้อย ไม่สามารถยกเลิกได้
                                                </div>
                                            )}
                                        </div>
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
