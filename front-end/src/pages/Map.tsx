import { useEffect, useState } from 'react';
import { FiInfo } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../api/apiClient';

interface Marker {
    id: number;
    room_id: number;
    x_coordinate: number;
    y_coordinate: number;
}

interface MapData {
    id: number;
    image_url: string;
    markers: Marker[];
}

interface RoomData {
    id: number;
    name: string;
    description: string;
    price: string | number;
}

const Map = () => {
    const [mapData, setMapData] = useState<MapData | null>(null);
    const [rooms, setRooms] = useState<RoomData[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMapAndRooms = async () => {
            try {
                const [mapRes, roomsRes] = await Promise.all([
                    api.get('/map'),
                    api.get('/rooms')
                ]);
                setMapData(mapRes.data);
                setRooms(roomsRes.data);
            } catch (error) {
                console.error("Error fetching map/rooms data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMapAndRooms();
    }, []);

    const getRoomName = (roomId: number) => {
        const room = rooms.find(r => r.id === roomId);
        return room ? room.name : `Room ${roomId}`;
    };

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
                    <h1 className="text-4xl font-bold text-stone-800 mb-4 tracking-tight">แผนผังที่พัก</h1>
                    <p className="text-stone-600 max-w-2xl mx-auto">
                        ดูตำแหน่งห้องพักและสิ่งอำนวยความสะดวกต่างๆ เพื่อประกอบการตัดสินใจ
                    </p>
                </div>

                <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-stone-200">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Map Area */}
                        <div className="flex-1 bg-stone-100 rounded-2xl min-h-[500px] border-2 border-stone-200 relative overflow-hidden flex items-center justify-center">
                            {mapData ? (
                                <>
                                    <img
                                        src={mapData.image_url}
                                        alt="Homestay Map"
                                        className="w-full h-full object-cover"
                                    />
                                    {mapData.markers.map((marker, index) => (
                                        <div
                                            key={marker.id}
                                            onClick={() => navigate(`/rooms/${marker.room_id}`)}
                                            className="absolute w-8 h-8 md:w-10 md:h-10 bg-emerald-500 rounded-full shadow-lg border-2 border-white flex items-center justify-center text-white text-xs md:text-sm font-bold cursor-pointer hover:scale-110 hover:bg-emerald-400 transition-all group"
                                            style={{
                                                left: `${marker.x_coordinate}%`,
                                                top: `${marker.y_coordinate}%`,
                                                transform: 'translate(-50%, -50%)'
                                            }}
                                            title={getRoomName(marker.room_id)}
                                        >
                                            {index + 1}

                                            {/* Tooltip on hover */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-stone-800 text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-10 pointer-events-none">
                                                {getRoomName(marker.room_id)}
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-800"></div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <div className="text-stone-500 font-medium p-8 text-center">
                                    ยังไม่มีแผนที่ในระบบ<br />
                                    <span className="text-sm font-normal">แอดมินยังไม่ได้ตั้งค่าผังที่พัก</span>
                                </div>
                            )}
                        </div>

                        {/* Map Legend */}
                        <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
                            <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
                                <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                                    <FiInfo className="text-emerald-600" /> สัญลักษณ์และห้องพัก
                                </h3>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-sm text-stone-600 border-b border-stone-200 pb-4">
                                        <span className="w-4 h-4 rounded-full bg-emerald-500 shadow-sm"></span>
                                        ตำแหน่งห้องพัก (คลิกเพื่อดูรายละเอียด)
                                    </div>

                                    {mapData?.markers && mapData.markers.length > 0 && (
                                        <div className="pt-2">
                                            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">รายชื่อห้องตามหมายเลข</h4>
                                            <ul className="space-y-3">
                                                {mapData.markers.map((marker, index) => (
                                                    <li key={marker.id} className="flex gap-3 text-sm">
                                                        <span className="font-bold text-stone-800 w-5">{index + 1}.</span>
                                                        <span className="text-stone-600 line-clamp-1 hover:text-emerald-600 cursor-pointer transition-colors"
                                                            onClick={() => navigate(`/rooms/${marker.room_id}`)}
                                                        >
                                                            {getRoomName(marker.room_id)}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Map;
