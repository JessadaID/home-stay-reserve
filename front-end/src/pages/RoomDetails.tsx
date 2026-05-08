import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiCalendar } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { eachDayOfInterval, addDays } from 'date-fns';
import api from '../api/apiClient';
import PaymentModal from '../components/PaymentModal';
import type { RoomData, Booking, Holiday } from '../types';

const RoomDetails = () => {
    const ROOM_SERVICE_URL = import.meta.env.VITE_ROOM_SERVICE_URL || ""
    const BOOKING_SERVICE_URL = import.meta.env.VITE_BOOKING_SERVICE_URL || ""
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
                    api.get(`${ROOM_SERVICE_URL}/api/rooms/${id}`),
                    api.get(`${BOOKING_SERVICE_URL}/api/bookings`),
                    api.get(`${ROOM_SERVICE_URL}/api/config`),
                    api.get(`${ROOM_SERVICE_URL}/api/holidays`)
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
            const checkIn = new Date(startDate.getTime() - (startDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
            const checkOut = new Date(endDate.getTime() - (endDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

            const res = await api.post(`${BOOKING_SERVICE_URL}/api/bookings`, {
                room_id: room.id,
                customer_name: user?.username || 'Customer',
                check_in: checkIn,
                check_out: checkOut,
            });

            if (res.data.payment_type === 'pay_on_arrival') {
                setSubmitMessage({ type: 'success', text: 'สร้างการจองสำเร็จ! คุณสามารถชำระเงินเมื่อเข้าพักได้เลย' });
            } else {
                setSubmitMessage({ type: 'success', text: 'สร้างการจองสำเร็จ! กรุณาชำระเงินเพื่อยืนยันการจอง' });
                setShowPaymentModal(true);
            }
            setCreatedBooking(res.data);

            const bookingsRes = await api.get(`${BOOKING_SERVICE_URL}/api/bookings/rooms/${id}`);
            setBookings(bookingsRes.data);

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
            <div className="bg-[#0B1D12] min-h-screen py-20 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4a6b52]"></div>
            </div>
        );
    }

    if (!room) {
        return (
            <div className="bg-[#0B1D12] min-h-screen py-20 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-stone-200 mb-4 tracking-wide">ไม่พบข้อมูลห้องพัก</h2>
                <Link to="/rooms" className="text-[#4a6b52] hover:text-[#7bb188] transition-colors hover:underline">กลับไปหน้ารวมห้องพัก</Link>
            </div>
        );
    }

    const capacity = room.capacity || 2;
    const size = room.size || 35;
    const amenities = room.amenities && room.amenities.length > 0
        ? room.amenities
        : ['เครื่องปรับอากาศ', 'ตู้เย็น', 'เครื่องทำน้ำอุ่น', 'Wi-Fi ฟรี'];

    const effectivePaymentOption = room.payment_option || config?.payment_option;
    const effectiveDepositPercentage = (room.deposit_percentage !== null && room.deposit_percentage !== undefined)
        ? room.deposit_percentage
        : (config?.deposit_percentage || 50);

    return (
        <div className="bg-[#0B1D12] text-stone-200 min-h-screen py-16 px-4 sm:px-8 lg:px-12 font-sans pt-32">
            <div className="max-w-6xl mx-auto">
                <Link to="/rooms" className="inline-flex items-center gap-2 text-stone-400 hover:text-[#7bb188] transition-colors mb-8 font-light tracking-wide">
                    <FiArrowLeft /> กลับไปหน้ารวมห้องพัก
                </Link>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Left Column */}
                    <div className="flex-1 w-full">
                        {/* Image Gallery */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 mb-8">
                            {room.images && room.images.length > 0 ? (
                                <>
                                    <div className="md:col-span-4 h-[300px] md:h-[450px] relative group overflow-hidden border border-[#2b3a2e]">
                                        <img src={`${ROOM_SERVICE_URL}${room.images[0]}`} alt="Main view" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    </div>
                                    {room.images.slice(1, 5).map((img, index) => {
                                        const isLastSlot = index === 3;
                                        const remainingCount = (room.images?.length || 0) - 4;
                                        const showOverlay = isLastSlot && remainingCount > 0;

                                        return (
                                            <div key={index} className="hidden md:block h-[120px] relative group border border-[#2b3a2e] bg-[#0a0f0d] overflow-hidden">
                                                <img src={`${ROOM_SERVICE_URL}${img}`} alt={`Side view ${index + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                {showOverlay && (
                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center group-hover:bg-black/50 transition-colors duration-500">
                                                        <span className="text-white text-2xl font-medium tracking-wider">+{remainingCount}</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </>
                            ) : (
                                <div className="col-span-4 h-[300px] md:h-[450px] flex items-center justify-center text-stone-500 text-lg font-light border border-[#2b3a2e] bg-[#18211a]">
                                    ยังไม่มีรูปภาพสำหรับห้องพักนี้
                                </div>
                            )}
                        </div>

                        {/* Title and Info Box */}
                        <div className="bg-[#18211a] p-8 md:p-10 border border-[#2b3a2e]">
                            <h1 className="text-4xl md:text-5xl font-sans text-white tracking-wide">{room.name}</h1>

                            <div className="flex gap-12 text-sm text-stone-300 font-light mt-8 pt-8 border-t border-[#2b3a2e]">
                                <div>
                                    <div className="text-stone-500 mb-1">ขนาดห้องพัก</div>
                                    <div className="text-white font-medium text-base">{size} m²</div>
                                </div>
                                <div>
                                    <div className="text-stone-500 mb-1">จำนวนผู้เข้าพัก</div>
                                    <div className="text-white font-medium text-base">{capacity} Adults</div>
                                </div>
                            </div>

                            {/* Description and Amenities */}
                            <div className="space-y-12 px-2 md:px-0 pt-8">
                                <section>
                                    <h2 className="text-2xl font-sans text-white mb-6 tracking-wide">รายละเอียดห้องพัก</h2>
                                    <p className="text-stone-400 leading-relaxed text-lg whitespace-pre-wrap font-light">
                                        {room.description || 'ไม่มีคำอธิบาย'}
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-sans text-white mb-6 tracking-wide">สิ่งอำนวยความสะดวก</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8">
                                        {amenities.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4 text-stone-300 font-light">
                                                <div className="w-6 h-6 flex items-center justify-center shrink-0">
                                                    <FiCheck className="text-[#4a6b52]" size={20} />
                                                </div>
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        </div>


                    </div>

                    {/* Right Column Booking Panel */}
                    <div className="w-full lg:w-[400px] shrink-0 sticky top-6 z-10">
                        <div className="bg-[#18211a] p-8 md:p-10 border border-[#2b3a2e]">

                            <div className="mb-8 border-b border-[#2b3a2e] pb-6">
                                <div className="text-4xl font-sans text-white tracking-wide">
                                    ฿{Number(room.price).toLocaleString()} <span className="text-lg text-stone-500 font-medium font-sans">/ คืน</span>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div>
                                    <label className="block text-sm font-bold text-white mb-2 tracking-wide">วันเวลาเข้าพัก</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-1">
                                            <FiCalendar className="text-stone-400" />
                                        </div>
                                        <DatePicker
                                            wrapperClassName="w-full"
                                            selected={startDate}
                                            onChange={(date: Date | null) => {
                                                if (date) setStartDate(date);
                                                if (date && endDate && date >= endDate) {
                                                    setEndDate(addDays(date, 1));
                                                }
                                            }}
                                            selectsStart
                                            startDate={startDate || undefined}
                                            endDate={endDate || undefined}
                                            minDate={new Date()}
                                            excludeDates={disabledDates}
                                            className="w-full pl-12 pr-4 py-4 bg-[#0B1D12] text-stone-200 border border-[#2b3a2e] focus:ring-1 focus:ring-[#4a6b52] focus:border-[#4a6b52] outline-none transition-all font-light"
                                            placeholderText="เลือกวันเช็คอิน"
                                            dateFormat="dd/MM/yyyy"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-white mb-2 tracking-wide">วันเวลาเช็คเอาท์</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-1">
                                            <FiCalendar className="text-stone-400" />
                                        </div>
                                        <DatePicker
                                            wrapperClassName="w-full"
                                            selected={endDate}
                                            onChange={(date: Date | null) => {
                                                if (date) setEndDate(date);
                                            }}
                                            selectsEnd
                                            startDate={startDate || undefined}
                                            endDate={endDate || undefined}
                                            minDate={startDate ? addDays(startDate, 1) : addDays(new Date(), 1)}
                                            excludeDates={disabledDates}
                                            className="w-full pl-12 pr-4 py-4 bg-[#0B1D12] text-stone-200 border border-[#2b3a2e] focus:ring-1 focus:ring-[#4a6b52] focus:border-[#4a6b52] outline-none transition-all font-light"
                                            placeholderText="เลือกวันเช็คเอาท์"
                                            dateFormat="dd/MM/yyyy"
                                        />
                                    </div>
                                </div>

                            </div>

                            <div className="border-t border-[#2b3a2e] pt-6 mb-8 mt-8 space-y-3">
                                <div className="flex justify-between text-stone-400 font-light">
                                    <span>฿{Number(room.price).toLocaleString()} x {getDaysCount()} คืน</span>
                                    <span>฿{calculateTotalAmount().toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-stone-400 pb-6 border-b border-[#2b3a2e] font-light">
                                    <span>รูปแบบการชำระเงิน</span>
                                    <span className="font-medium capitalize text-stone-200">
                                        {effectivePaymentOption === 'deposit'
                                            ? `มัดจำ (${effectiveDepositPercentage}%)`
                                            : effectivePaymentOption === 'pay_on_arrival'
                                                ? 'จ่ายเมื่อเข้าพัก'
                                                : 'ชำระเต็มจำนวน'
                                        }
                                    </span>
                                </div>
                                <div className="flex justify-between font-serif text-white text-2xl tracking-wide pt-2">
                                    <span>Total</span>
                                    <span className="text-white font-medium">฿{calculateTotalAmount().toLocaleString()}</span>
                                </div>
                                {effectivePaymentOption === 'deposit' && (
                                    <div className="flex justify-between text-stone-400 text-sm mt-2 font-light">
                                        <span>ยอดที่ต้องชำระทันที</span>
                                        <span className="text-[#c27b4b] font-medium">฿{(calculateTotalAmount() * (effectiveDepositPercentage) / 100).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>

                            {submitMessage.text && (
                                <div className={`p-4 mb-6 text-sm font-light tracking-wide ${submitMessage.type === 'success' ? 'bg-[#1f2a22] text-[#7bb188] border border-[#2b3a2e]' : 'bg-[#2a1b1b] text-rose-400 border border-[#3a2020]'}`}>
                                    {submitMessage.text}
                                </div>
                            )}

                            <button
                                onClick={handleBooking}
                                className="w-full py-4 bg-[#4a6b52] text-white font-medium hover:bg-[#3b5942] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center tracking-wide text-lg"
                                disabled={!startDate || !endDate || isSubmitting}>
                                {isSubmitting ? (
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    isAuthenticated ? 'ยืนยันการจอง' : 'เข้าสู่ระบบเพื่อจอง'
                                )}
                            </button>
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
