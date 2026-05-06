import { useEffect, useState } from 'react';
import { FiUsers, FiMaximize2, FiCheck, FiCreditCard } from 'react-icons/fi';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/apiClient';
import type { Room } from '../types';

const Rooms = () => {
    const [searchparamshook] = useSearchParams();
    const checkin = searchparamshook.get('checkin') || null;
    const checkout = searchparamshook.get('checkout') || null;
    const capacity = searchparamshook.get('capacity') || null;
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_ROOM_SERVICE_URL || ""
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const params = new URLSearchParams();
                if (checkin) params.set('checkin', checkin);
                if (checkout) params.set('checkout', checkout);
                if (capacity) params.set('capacity', capacity);

                const response = await api.get(`${API_URL}/api/rooms?${params.toString()}`);
                setRooms(response.data);
            } catch (error) {
                console.error("Error fetching rooms:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, [checkin, checkout, capacity]);

    if (loading) {
        return (
            <div className="bg-[#0B1D12] min-h-screen py-20 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4a6b52]"></div>
            </div>
        );
    }

    return (
        <div className="w-full relative bg-[#0B1D12] text-stone-200 min-h-screen py-32 px-4 sm:px-8 lg:px-12">
            <div className="max-w-7xl mx-auto">
                <div className="mb-20 text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-6 tracking-wide drop-shadow-md">Rooms</h1>
                    <p className="text-stone-400 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
                        เลือกห้องพักที่เหมาะกับคุณ เพื่อประสบการณ์การพักผ่อนที่ดีที่สุด
                    </p>
                    <h3 className="text-stone-200 mt-6 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">จำนวนห้องพักทั้งหมด {rooms.length} ห้อง</h3>
                    <hr />
                </div>

                <div className="flex flex-col gap-24 md:gap-32 w-full mx-auto">
                    {rooms.map((room, index) => (
                        <div key={room.id} className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center`}>
                            {/* Image */}
                            <div className="w-full md:w-[55%] shrink-0 relative group overflow-hidden shadow-2xl">
                                {room.images && room.images.length > 0 ? (
                                    <img
                                        className="w-full h-[350px] md:h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
                                        src={`${API_URL}${room.images[0]}`}
                                        alt={room.name}
                                    />
                                ) : (
                                    <div className="w-full h-[350px] md:h-[500px] flex items-center justify-center bg-[#18211a] text-stone-500">
                                        ไม่มีรูปภาพ
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <div className={`w-full md:w-[45%] flex flex-col justify-center text-left py-10 md:py-0 ${index % 2 === 0 ? 'md:pl-16 lg:pl-24' : 'md:pr-16 lg:pr-24'}`}>
                                <h2 className="text-3xl md:text-4xl font-sans text-white mb-4 tracking-wide">{index + 1}. {room.name}</h2>

                                <div className="flex gap-6 text-sm md:text-base text-stone-400 mb-6 font-light">
                                    <div className="flex items-center gap-2">
                                        <FiUsers className="text-[#7bb188]" />
                                        <span>พักได้ {room.capacity || '?'} ท่าน</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FiMaximize2 className="text-[#7bb188]" />
                                        <span>{room.size || '?'} ตร.ม.</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FiCreditCard className="text-[#7bb188]" />
                                        <span>{room.payment_option === 'deposit' ? 'ชำระมัดจำ' : room.payment_option === 'pay_on_arrival' ? 'ชำระเมื่อเข้าพัก' : 'ชำระเต็มจำนวน'}</span>
                                    </div>
                                </div>

                                <p className="text-base md:text-lg text-stone-400 font-light leading-relaxed mb-6">
                                    {room.description}
                                </p>

                                {/* Amenities */}
                                {room.amenities && room.amenities.length > 0 && (
                                    <div className="mb-8">
                                        <h3 className="text-sm text-stone-300 mb-3 uppercase tracking-wider font-medium">สิ่งอำนวยความสะดวก</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {room.amenities.map((amenity, i) => (
                                                <div key={i} className="flex items-center gap-1.5 text-xs md:text-sm text-stone-300 bg-[#18211a] border border-[#2b3a2e] px-3 py-1.5 rounded-full">
                                                    <FiCheck className="text-[#4a6b52]" />
                                                    <span>{amenity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-end justify-between mt-auto">
                                    <p className="text-xl md:text-2xl font-medium text-[#4a6b52] tracking-wide">
                                        ฿{Number(room.price).toLocaleString()} <span className="text-lg text-stone-500 font-light">/ คืน</span>
                                    </p>

                                    <button
                                        onClick={() => navigate(`/rooms/${room.id}`)}
                                        className="text-white border-b border-[#4a6b52] pb-1 font-medium hover:text-[#4a6b52] hover:border-[#3b5942] transition-colors text-lg tracking-wide inline-block"
                                    >
                                        จองห้องพัก
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {rooms.length === 0 && (
                        <div className="col-span-full text-center text-stone-500 py-20 text-lg font-light">
                            ยังไม่มีห้องพักที่ตรงกับเงื่อนไข
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Rooms;
