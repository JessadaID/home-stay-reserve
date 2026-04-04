import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FiPlus, FiEdit2, FiTrash2, FiChevronLeft } from 'react-icons/fi';
import api from '../../api/apiClient';

const AdminRooms = () => {
    const { user, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'admin') {
            navigate('/admin/login');
            return;
        }

        const fetchRooms = async () => {
            setLoading(true);
            try {
                const res = await api.get('/rooms');
                setRooms(res.data);
            } catch (error) {
                console.error("Error fetching rooms", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, [isAuthenticated, user, navigate]);

    const handleDeleteRoom = async (roomId: number) => {
        if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบห้องพักนี้? ข้อมูลการจองที่เกี่ยวข้องอาจได้รับผลกระทบ')) {
            return;
        }

        try {
            await api.delete(`/rooms/${roomId}`);
            setRooms(rooms.filter(r => r.id !== roomId));
            alert('ลบห้องพักเรียบร้อยแล้ว');
        } catch (error: any) {
            console.error("Error deleting room", error);
            alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบห้องพัก');
        }
    };

    if (!user || user.role !== 'admin') return null;

    return (
        <div className="bg-stone-50 min-h-[80vh] py-10 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link to="/admin/dashboard" className="p-2 bg-white text-stone-500 hover:text-stone-800 rounded-xl shadow-sm border border-stone-200 transition-colors">
                            <FiChevronLeft size={24} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-stone-800 tracking-tight">จัดการห้องพัก</h1>
                            <p className="text-stone-600 mt-1">ตั้งค่า อัปเดตราคา และลบห้องพัก</p>
                        </div>
                    </div>
                    <Link
                        to={`/admin/rooms/new`}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-emerald-500 shadow-sm transition-all"
                    >
                        <FiPlus size={20} /> เพิ่มห้องพัก
                    </Link>
                </div>


                {loading ? (
                    <div className="text-center py-20 text-stone-500 flex flex-col items-center">
                        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        กำลังโหลดข้อมูล...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rooms.length === 0 ? (
                            <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-stone-200 text-stone-500">
                                ไม่พบห้องพักในโฮมสเตย์นี้ กรุณาเพิ่มห้องพักใหม่
                            </div>
                        ) : (
                            rooms.map(room => (
                                <div key={room.id} className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden flex flex-col">
                                    <div className="h-48 bg-stone-200 relative">
                                        {room.images && room.images.length > 0 ? (
                                            <img src={room.images[0].url} alt={room.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-stone-400">
                                                ไม่มีรูปภาพ
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-stone-800 shadow-sm">
                                            ฿{Number(room.price).toLocaleString()} / คืน
                                        </div>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <h3 className="text-xl font-bold text-stone-800 mb-2 line-clamp-1">{room.name}</h3>
                                        <p className="text-stone-500 text-sm mb-6 line-clamp-2 pb-4 border-b border-stone-100 flex-1">{room.description || 'ไม่มีรายละเอียด'}</p>

                                        <div className="flex items-center gap-3 mt-auto">
                                            <Link
                                                to={`/admin/rooms/${room.id}/edit`}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-stone-100 text-stone-700 font-medium rounded-xl hover:bg-stone-200 transition-colors"
                                            >
                                                <FiEdit2 size={18} /> แก้ไข
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteRoom(room.id)}
                                                className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors tooltip"
                                                title="ลบห้องพัก"
                                            >
                                                <FiTrash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminRooms;
