import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FiChevronLeft, FiPlus, FiTrash2, FiMapPin, FiSave } from 'react-icons/fi';
import api from '../../api/apiClient';
import type { MapData } from '../../types';

const AdminMap = () => {
    const { user, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    const [mapData, setMapData] = useState<MapData | null>(null);
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // For map creation
    const [newMapUrl, setNewMapUrl] = useState('');

    // For adding/editing marker
    const [tempMarker, setTempMarker] = useState<{ x: number, y: number } | null>(null);
    const [selectedRoomId, setSelectedRoomId] = useState<string>('');
    const mapContainerRef = useRef<HTMLDivElement>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const roomsRes = await api.get(`/rooms`);
            setRooms(roomsRes.data);

            const mapRes = await api.get(`/map`);
            setMapData(mapRes.data);
        } catch (error: any) {
            if (error.response?.status === 404) {
                // Map not found
                setMapData(null);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'admin') {
            navigate('/admin/login');
            return;
        }
        fetchData();
    }, [isAuthenticated, user, navigate]);

    const handleCreateMap = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post(`/map`, { image_url: newMapUrl });
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to create map');
        }
    };

    const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!mapContainerRef.current) return;

        const rect = mapContainerRef.current.getBoundingClientRect();

        // Calculate percentage from 0 to 100
        const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
        const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

        // Keep it strictly inside the bounds (0 to 100)
        const x = Math.max(0, Math.min(100, xPercent));
        const y = Math.max(0, Math.min(100, yPercent));

        setTempMarker({ x, y });
    };

    const handleSaveMarker = async () => {
        if (!tempMarker || !selectedRoomId || !mapData) return;

        try {
            await api.post(`/maps/${mapData.id}/markers`, {
                room_id: parseInt(selectedRoomId),
                x_coordinate: parseFloat(tempMarker.x.toFixed(2)),
                y_coordinate: parseFloat(tempMarker.y.toFixed(2))
            });
            setTempMarker(null);
            setSelectedRoomId('');
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || 'เซฟหมุดไม่สำเร็จ');
        }
    };

    const handleDeleteMarker = async (markerId: number) => {
        if (!window.confirm('ลบหมุดนี้?')) return;
        try {
            await api.delete(`/markers/${markerId}`);
            fetchData();
        } catch (error) {
            alert('ลบไม่สำเร็จ');
        }
    };

    // Filter out rooms that already have markers
    const availableRooms = rooms.filter(
        r => !mapData?.markers?.some(m => m.room_id === r.id)
    );

    const getRoomName = (roomId: number) => {
        const room = rooms.find(r => r.id === roomId);
        return room ? room.name : `Room ${roomId}`;
    };

    if (loading) return null;

    return (
        <div className="bg-stone-50 min-h-[80vh] py-10 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/admin/dashboard" className="p-2 bg-white text-stone-500 hover:text-stone-800 rounded-xl shadow-sm border border-stone-200 transition-colors">
                        <FiChevronLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-stone-800 tracking-tight">จัดการแผนที่และหมุด</h1>
                        <p className="text-stone-600 mt-1">คลิกที่แผนที่เพื่อกำหนดตำแหน่งของห้องพัก</p>
                    </div>
                </div>

                {!mapData ? (
                    <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-8 text-center max-w-2xl mx-auto">
                        <h2 className="text-xl font-bold text-stone-800 mb-4">ยังไม่มีแผนที่สำหรับโฮมสเตย์นี้</h2>
                        <form onSubmit={handleCreateMap} className="space-y-4">
                            <input
                                type="url"
                                required
                                value={newMapUrl}
                                onChange={e => setNewMapUrl(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                placeholder="ลิงก์รูปภาพแผนที่ (เช่น https://.../map.jpg)"
                            />
                            <button className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 flex items-center justify-center gap-2">
                                <FiPlus /> เพิ่มแผนที่
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Map Workspace */}
                        <div className="flex-1 bg-white rounded-3xl p-6 shadow-sm border border-stone-200 relative">
                            <div className="mb-4 flex justify-between items-center text-sm text-stone-500">
                                <p><span className="font-bold text-rose-500">*คำแนะนำ:</span> คลิกบริเวณที่หน้าแผนที่เพื่อวางหมุดใหม่</p>
                                {tempMarker && (
                                    <button onClick={() => setTempMarker(null)} className="text-stone-400 hover:text-stone-700 underline">ยกเลิกหมุดชั่วคราว</button>
                                )}
                            </div>

                            <div
                                className="w-full bg-stone-100 rounded-xl border border-stone-200 relative overflow-hidden cursor-crosshair group"
                                onClick={handleMapClick}
                                ref={mapContainerRef}
                                style={{ minHeight: '500px' }}
                            >
                                <img
                                    src={mapData.image_url}
                                    alt="Admin Map Workspace"
                                    className="w-full object-contain pointer-events-none select-none"
                                />

                                {/* Permanent Markers */}
                                {mapData.markers?.map((marker, idx) => (
                                    <div
                                        key={marker.id}
                                        className="absolute w-8 h-8 md:w-10 md:h-10 bg-emerald-500 rounded-full shadow-lg border-2 border-white flex items-center justify-center text-white text-xs md:text-sm font-bold opacity-80 hover:opacity-100 transition-all z-10"
                                        style={{
                                            left: `${marker.x_coordinate}%`,
                                            top: `${marker.y_coordinate}%`,
                                            transform: 'translate(-50%, -50%)'
                                        }}
                                        title={getRoomName(marker.room_id)}
                                        onClick={(e) => {
                                            e.stopPropagation(); // prevent map click
                                            handleDeleteMarker(marker.id);
                                        }}
                                    >
                                        {idx + 1}
                                        <div className="absolute -top-2 -right-2 bg-rose-500 w-5 h-5 rounded-full flex items-center justify-center invisible group-hover:visible shadow-sm">
                                            <FiTrash2 size={10} />
                                        </div>
                                    </div>
                                ))}

                                {/* Temporary New Marker */}
                                {tempMarker && (
                                    <div
                                        className="absolute w-10 h-10 bg-rose-500 rounded-full shadow-lg border-2 border-white flex items-center justify-center text-white z-20 animate-bounce"
                                        style={{
                                            left: `${tempMarker.x}%`,
                                            top: `${tempMarker.y}%`,
                                            transform: 'translate(-50%, -100%)'
                                        }}
                                        onClick={(e) => e.stopPropagation()} // don't move it again when clicking itself
                                    >
                                        <FiMapPin size={24} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="w-full lg:w-96 flex flex-col gap-6 shrink-0">
                            {/* Marker Editor */}
                            {tempMarker && (
                                <div className="bg-white rounded-3xl shadow-sm border border-rose-200 p-6 shadow-rose-100/50">
                                    <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                                        <FiMapPin className="text-rose-500" /> บันทึกหมุดจำแหน่งใหม่
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs text-stone-500 mb-2">พิกัดแกน X, Y: {tempMarker.x.toFixed(1)}%, {tempMarker.y.toFixed(1)}%</p>
                                            <label className="block text-sm font-medium text-stone-700 mb-2">เลือกห้องพักที่ว่างอยู่</label>
                                            <select
                                                value={selectedRoomId}
                                                onChange={(e) => setSelectedRoomId(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                                            >
                                                <option value="">-- เลือกห้องพัก --</option>
                                                {availableRooms.map(r => (
                                                    <option key={r.id} value={r.id}>{r.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <button
                                            onClick={handleSaveMarker}
                                            disabled={!selectedRoomId}
                                            className="w-full py-3 bg-stone-800 text-white font-bold rounded-xl hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <FiSave /> บันทึกตำแหน่ง
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Marker List */}
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200">
                                <h3 className="font-bold text-stone-800 mb-4">รายการหมุดปัจจุบัน</h3>
                                <div className="space-y-3">
                                    {mapData.markers?.length === 0 ? (
                                        <p className="text-sm text-stone-500 italic">ยังไม่มีหมุดในระบบ</p>
                                    ) : (
                                        mapData.markers?.map((marker, index) => (
                                            <div key={marker.id} className="flex items-center justify-between p-3 rounded-xl border border-stone-100 bg-stone-50">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-stone-800 line-clamp-1 truncate w-40" title={getRoomName(marker.room_id)}>
                                                            {getRoomName(marker.room_id)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteMarker(marker.id)}
                                                    className="w-8 h-8 flex items-center justify-center text-rose-500 hover:bg-rose-100 rounded-lg transition-colors"
                                                    title="ลบหมุดนี้"
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminMap;
