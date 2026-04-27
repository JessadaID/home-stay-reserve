import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiCalendar, FiUser, FiMaximize2, FiInfo } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { eachDayOfInterval, addDays } from 'date-fns';
import api from '../api/apiClient';
import PaymentModal from '../components/PaymentModal';
import type { RoomData, Booking, Holiday } from '../types';

const RoomDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useContext(AuthContext);
    const [room, setRoom] = useState<RoomData | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
    const [config, setConfig] = useState<any>(null);
    const [holidays, setHolidays] = useState<Holiday[]>([]);

    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [createdBooking, setCreatedBooking] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [roomRes, bookingsRes, configRes, holidaysRes] = await Promise.all([
                    api.get(`/rooms/${id}`),
                    api.get(`/bookings/rooms/${id}`),
                    api.get(`/config`),
                    api.get(`/holidays`)
                ]);
                setRoom(roomRes.data);
                setBookings(bookingsRes.data);
                setConfig(configRes.data);
                setHolidays(holidaysRes.data);
            } catch (error) {
                console.error("Error fetching room or bookings:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    const getDisabledDates = () => {
        let dates: Date[] = [];
        bookings.forEach(booking => {
            const start = new Date(booking.check_in);
            const end = new Date(booking.check_out);

            // Generate all dates between check-in and check-out (exclusive of check-out day for new check-ins, but we disable all to be safe)
            // Or actually, someone can check-in on the exact day someone checks out. 
            // react-datepicker doesn't easily support half-day disabled without custom day rendering.
            // For simplicity, we disable the whole interval except checkout day for checkin, but disable fully for strict overlap.
            const intervalDates = eachDayOfInterval({ start, end });
            dates = [...dates, ...intervalDates];
        });

        holidays.forEach(holiday => {
            const [year, month, day] = holiday.holiday_date.split('-');
            dates.push(new Date(Number(year), Number(month) - 1, Number(day)));
        });

        return dates;
    };

    const disabledDates = getDisabledDates();

    const calculateTotalAmount = () => {
        if (!startDate || !endDate || !room) return 0;
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return (diffDays === 0 ? 1 : diffDays) * Number(room.price);
    };

    const getDaysCount = () => {
        if (!startDate || !endDate) return 0;
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return days === 0 ? 1 : days;
    };

    const handleBooking = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (!startDate || !endDate || !room) return;

        setIsSubmitting(true);
        setSubmitMessage({ type: '', text: '' });

        try {
            // Local timezone offset fix for full dates
            const checkIn = new Date(startDate.getTime() - (startDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
            const checkOut = new Date(endDate.getTime() - (endDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

            const res = await api.post('/bookings', {
                room_id: room.id,
                customer_name: user?.username || 'Customer',
                check_in: checkIn,
                check_out: checkOut,
            });

            setSubmitMessage({ type: 'success', text: 'สร้างการจองสำเร็จ! กรุณาชำระเงินเพื่อยืนยันการจอง' });
            setCreatedBooking(res.data);
            setShowPaymentModal(true);

            // Refresh bookings to disable newly booked dates
            const bookingsRes = await api.get(`/bookings/rooms/${id}`);
            setBookings(bookingsRes.data);

            // Reset dates
            setStartDate(null);
            setEndDate(null);

        } catch (err: any) {
            console.error(err);
            setSubmitMessage({
                type: 'error',
                text: err.response?.data?.message || 'เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-stone-50 min-h-screen py-20 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (!room) {
        return (
            <div className="bg-stone-50 min-h-screen py-20 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-stone-600 mb-4">ไม่พบข้อมูลห้องพัก</h2>
                <Link to="/rooms" className="text-emerald-600 hover:underline">กลับไปหน้ารวมห้องพัก</Link>
            </div>
        );
    }

    const capacity = room.capacity || 2;
    const size = room.size || 35;
    const amenities = room.amenities && room.amenities.length > 0
        ? room.amenities
        : ['เครื่องปรับอากาศ', 'สมาร์ททีวี', 'ตู้เย็น', 'เครื่องทำน้ำอุ่น', 'Wi-Fi ฟรี'];

    return (
        <div className="bg-stone-50 min-h-screen py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <Link to="/rooms" className="inline-flex items-center gap-2 text-stone-500 hover:text-emerald-600 transition-colors mb-6 font-medium">
                    <FiArrowLeft /> กลับไปหน้ารวมห้องพัก
                </Link>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-bold text-stone-800 mb-2">{room.name}</h1>
                        <div className="flex flex-wrap gap-4 text-sm text-stone-600 mt-4">
                            <span className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm border border-stone-200">
                                <FiUser className="text-emerald-600" /> พักได้ {capacity} ท่าน
                            </span>
                            <span className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm border border-stone-200">
                                <FiMaximize2 className="text-emerald-600" /> พื้นที่ {size} ตร.ม.
                            </span>
                        </div>
                    </div>
                    <div className="text-left md:text-right">
                        <div className="text-3xl font-bold text-emerald-600">฿{Number(room.price).toLocaleString()}</div>
                        <div className="text-stone-500 text-sm">ต่อคืน (รวมภาษี)</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-[500px] mb-12 rounded-3xl overflow-hidden shadow-sm bg-stone-200">
                    {room.images && room.images.length > 0 ? (
                        <>
                            <div className="md:col-span-3 row-span-2 relative group overflow-hidden">
                                <img src={room.images[0].url} alt="Main view" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            </div>
                            <div className="hidden md:block overflow-hidden relative group bg-stone-300">
                                {room.images[1] ? (
                                    <img src={room.images[1].url} alt="Side view 1" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-stone-400">ไม่มีรูปภาพเพิ่มเติม</div>
                                )}
                            </div>
                            <div className="hidden md:block overflow-hidden relative group bg-stone-300">
                                {room.images[2] ? (
                                    <img src={room.images[2].url} alt="Side view 2" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-stone-400">ไม่มีรูปภาพเพิ่มเติม</div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="col-span-4 row-span-2 flex items-center justify-center text-stone-400 text-lg">
                            ยังไม่มีรูปภาพสำหรับห้องพักนี้
                        </div>
                    )}
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="flex-1 space-y-10">
                        <section>
                            <h2 className="text-2xl font-bold text-stone-800 mb-4">รายละเอียดห้องพัก</h2>
                            <p className="text-stone-600 leading-relaxed text-lg whitespace-pre-wrap">
                                {room.description || 'ไม่มีคำอธิบาย'}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-stone-800 mb-4">สิ่งอำนวยความสะดวก</h2>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                                {amenities.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 text-stone-700">
                                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                            <FiCheck size={14} />
                                        </div>
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="w-full lg:w-96 shrink-0">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 sticky top-24">
                            <h3 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2">
                                <FiCalendar className="text-emerald-600" /> ระบุวันเข้าพัก
                            </h3>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">เช็คอิน (วันเข้าพัก)</label>
                                    <DatePicker
                                        selected={startDate}
                                        onChange={(date: Date | null) => {
                                            if (date) setStartDate(date);
                                            // Reset end date if needed
                                            if (date && endDate && date >= endDate) {
                                                setEndDate(addDays(date, 1));
                                            }
                                        }}
                                        selectsStart
                                        startDate={startDate || undefined}
                                        endDate={endDate || undefined}
                                        minDate={new Date()}
                                        excludeDates={disabledDates}
                                        className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                        placeholderText="เลือกวันเช็คอิน"
                                        dateFormat="dd/MM/yyyy"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">เช็คเอาท์ (วันออก)</label>
                                    <DatePicker
                                        selected={endDate}
                                        onChange={(date: Date | null) => {
                                            if (date) setEndDate(date);
                                        }}
                                        selectsEnd
                                        startDate={startDate || undefined}
                                        endDate={endDate || undefined}
                                        minDate={startDate ? addDays(startDate, 1) : addDays(new Date(), 1)}
                                        excludeDates={disabledDates}
                                        className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                        placeholderText="เลือกวันเช็คเอาท์"
                                        dateFormat="dd/MM/yyyy"
                                    />
                                </div>
                            </div>

                            <div className="border-t border-stone-200 pt-6 mb-6 mt-6">
                                <div className="flex justify-between text-stone-600 mb-2">
                                    <span>฿{Number(room.price).toLocaleString()} x {getDaysCount()} คืน</span>
                                    <span>฿{calculateTotalAmount().toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-stone-600 mb-4 pb-4 border-b border-stone-100">
                                    <span>รูปแบบการชำระเงิน</span>
                                    <span className="font-medium capitalize text-stone-800">
                                        {config?.payment_option === 'deposit'
                                            ? `มัดจำ (${config?.deposit_percentage || 50}%)`
                                            : 'ชำระเต็มจำนวน'
                                        }
                                    </span>
                                </div>
                                <div className="flex justify-between font-bold text-stone-800 text-lg">
                                    <span>ยอดรวมทั้งหมด</span>
                                    <span className="text-emerald-600">฿{calculateTotalAmount().toLocaleString()}</span>
                                </div>
                                {config?.payment_option === 'deposit' && (
                                    <div className="flex justify-between font-bold text-stone-800 text-base mt-2">
                                        <span>ยอดที่ต้องชำระทันที</span>
                                        <span className="text-orange-500">฿{(calculateTotalAmount() * (config?.deposit_percentage || 50) / 100).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>

                            {submitMessage.text && (
                                <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${submitMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                                    {submitMessage.text}
                                </div>
                            )}

                            <button
                                onClick={handleBooking}
                                className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                                disabled={!startDate || !endDate || isSubmitting}>
                                {isSubmitting ? (
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    isAuthenticated ? 'ยืนยันการจอง' : 'เข้าสู่ระบบเพื่อจอง'
                                )}
                            </button>

                            <p className="text-center text-xs text-stone-500 mt-4 flex items-center justify-center gap-1">
                                <FiInfo /> สามารถยกเลิกการจองได้ภายหลัง
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {showPaymentModal && createdBooking && (
                <PaymentModal
                    booking={createdBooking}
                    onClose={() => setShowPaymentModal(false)}
                    onSuccess={() => {
                        setShowPaymentModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default RoomDetails;
