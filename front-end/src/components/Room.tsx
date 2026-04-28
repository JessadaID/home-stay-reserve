import { useState, useEffect } from "react";
import api from "../api/apiClient";
import type { Room as RoomType } from "../types";
import { useNavigate } from "react-router-dom";
const Room = () => {
    const [rooms, setRooms] = useState<RoomType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const navigate = useNavigate();
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await api.get("/api/rooms?limit=3");
                setRooms(response.data);
            } catch (error) {
                setError("Failed to fetch rooms");
            } finally {
                setLoading(false);
            }
        };
        fetchRooms();
    }, []);

    if (loading) {
        return <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">กำลังโหลด...</div>;
    }

    if (error) {
        return <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้ง</div>;
    }

    return (
        <div id="rooms">
            <h2 className="font-serif text-3xl md:text-5xl text-white mb-8 md:mb-8 tracking-wide max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pb-12">Rooms</h2>

            <div className="flex flex-col gap-16 md:gap-16 w-full mx-auto">
                {rooms.map((room, index) => (
                    <div key={room.id} className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center`}>
                        {/* Image takes 60% */}
                        <div className="w-full md:w-[60%] shrink-0">
                            <img className="w-full h-[300px] md:h-[450px] object-cover shadow-2xl" src={`${API_URL}${room.images?.[0]}`} alt={room.name} />
                        </div>

                        {/* Details take 40% */}
                        <div className="w-full md:w-[40%] flex flex-col justify-center text-left px-12">
                            <h2 className="text-3xl md:text-4xl font-sans text-white mb-4 tracking-wide">{room.name}</h2>
                            <p className="text-base md:text-lg text-stone-400 font-light leading-relaxed mb-6">
                                {room.description}
                            </p>
                            <p className="text-xl md:text-2xl font-medium text-[#4a6b52] tracking-wide">
                                ฿{room.price} <span className="text-lg text-stone-500 font-light">/ คืน</span>
                            </p>

                            <button onClick={() => navigate(`/rooms/${room.id}`)} className="mt-8 self-start text-white border-b border-[#4a6b52] pb-1 font-medium hover:text-[#4a6b52] hover:border-[#3b5942] transition-colors text-lg tracking-wide inline-block">
                                จองห้องพัก
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <center>
                <button onClick={() => navigate('/rooms')} className="mt-12 text-white border border-[#4a6b52] hover:bg-[#4a6b52] hover:text-white px-4 py-2 font-medium hover:border-[#3b5942] transition-colors text-lg tracking-wide inline-block">
                    ดูห้องพักทั้งหมด
                </button>
            </center>
        </div>
    );
};

export default Room;