import { useEffect, useState } from 'react';
import { FiUsers, FiMaximize2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import api from '../api/apiClient';
import type { Room } from '../types';

const Rooms = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await api.get(`${API_URL}/api/rooms`);
                setRooms(response.data);
            } catch (error) {
                console.error("Error fetching rooms:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, []);

    if (loading) {
        return (
            <div className="bg-stone-50 min-h-screen py-20 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-stone-50 min-h-screen py-10 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-bold text-stone-800 mb-4 tracking-tight">เลือกห้องพักที่ถูกใจ</h1>
                    <p className="text-stone-600 max-w-2xl mx-auto">
                        เรามีห้องพักหลากหลายรูปแบบให้คุณเลือก เพื่อตอบโจทย์ทุกความต้องการในการพักผ่อน
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {rooms.map((room) => (
                        <div key={room.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200 hover:shadow-lg transition-all group flex flex-col">
                            <div className="relative h-60 overflow-hidden bg-stone-200">
                                {room.images && room.images.length > 0 ? (
                                    <img
                                        src={`${API_URL}${room.images[0]}`}
                                        alt={room.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-stone-400">
                                        ไม่มีรูปภาพ
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-emerald-700 shadow-sm">
                                    ฿{Number(room.price).toLocaleString()} / คืน
                                </div>
                            </div>

                            <div className="p-6 flex flex-col flex-1">
                                <h3 className="text-xl font-bold text-stone-800 mb-4">{room.name}</h3>

                                <div className="flex gap-4 text-sm text-stone-500 mb-6">
                                    <div className="flex items-center gap-1">
                                        <FiUsers className="text-emerald-500" />
                                        <span>พักได้ {room.capacity || '?'} ท่าน</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <FiMaximize2 className="text-emerald-500" />
                                        <span>{room.size || '?'} ตร.ม.</span>
                                    </div>
                                </div>

                                <div className="mt-auto">
                                    <Link to={`/rooms/${room.id}`} className="block w-full text-center py-3 bg-emerald-50 text-emerald-700 font-medium rounded-xl hover:bg-emerald-600 hover:text-white transition-colors">
                                        ดูรายละเอียดและจอง
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}

                    {rooms.length === 0 && (
                        <div className="col-span-full text-center text-stone-500 py-10">
                            ยังไม่มีห้องพักในระบบ
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Rooms;
