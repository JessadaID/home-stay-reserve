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
                const res = await api.get('api/rooms');
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
            await api.delete(`api/rooms/${roomId}`);
            setRooms(rooms.filter(r => r.id !== roomId));
            alert('ลบห้องพักเรียบร้อยแล้ว');
        } catch (error: any) {
            console.error("Error deleting room", error);
            alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบห้องพัก');
        }
    };

    if (!user || user.role !== 'admin') return null;

    return (
        <div className="bg-slate-50 min-h-screen pt-32 pb-8 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 border-b border-slate-200 pb-4">
                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                        <Link to="/admin/dashboard" className="p-2 bg-white text-slate-500 hover:text-slate-800 rounded shadow-sm border border-slate-200 transition-colors">
                            <FiChevronLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">Manage Rooms</h1>
                            <p className="text-slate-500 text-sm mt-1">Configure pricing and descriptions</p>
                        </div>
                    </div>
                    <Link
                        to={`/admin/rooms/new`}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 shadow-sm transition-all text-sm"
                    >
                        <FiPlus size={18} /> Add Room
                    </Link>
                </div>


                {loading ? (
                    <div className="text-center py-20 text-slate-500 flex flex-col items-center">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        Loading data...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {rooms.length === 0 ? (
                            <div className="col-span-full text-center py-20 bg-white rounded border border-slate-200 text-slate-500 shadow-sm">
                                No rooms found. Please add a new room.
                            </div>
                        ) : (
                            rooms.map(room => (
                                <div key={room.id} className="bg-white rounded shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                                    <div className="h-40 bg-slate-200 relative border-b border-slate-200">
                                        {room.images && room.images.length > 0 ? (
                                            <img src={`${import.meta.env.VITE_API_URL}${room.images[0]}`} alt={room.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                                                No Image
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-slate-800 shadow border border-slate-100">
                                            ฿{Number(room.price).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <h3 className="text-base font-bold text-slate-800 mb-1 line-clamp-1">{room.name}</h3>
                                        <p className="text-slate-500 text-xs mb-4 line-clamp-2 pb-4 border-b border-slate-100 flex-1">{room.description || 'No description'}</p>

                                        <div className="flex items-center gap-2 mt-auto">
                                            <Link
                                                to={`/admin/rooms/${room.id}/edit`}
                                                className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-50 text-slate-700 text-sm font-medium rounded border border-slate-200 hover:bg-slate-100 transition-colors"
                                            >
                                                <FiEdit2 size={14} /> Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteRoom(room.id)}
                                                className="p-2 bg-red-50 text-red-600 rounded border border-red-100 hover:bg-red-100 transition-colors tooltip"
                                                title="Delete Room"
                                            >
                                                <FiTrash2 size={16} />
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
