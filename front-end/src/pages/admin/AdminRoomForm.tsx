import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FiChevronLeft, FiTrash2 } from 'react-icons/fi';
import api from '../../api/apiClient';

const AdminRoomForm = () => {
    const { user, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        capacity: '',
        size: '',
        amenities: ''
    });

    // For managing images
    const [images, setImages] = useState<any[]>([]); // สำหรับรูปเดิมที่มีอยู่แล้ว
    const [imageFiles, setImageFiles] = useState<File[]>([]); // สำหรับไฟล์รูปใหม่ที่จะอัปโหลด


    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'admin') {
            navigate('/admin/login');
            return;
        }

        if (isEditMode) {
            const fetchRoomDetails = async () => {
                try {
                    const res = await api.get(`api/rooms/${id}`);
                    setFormData({
                        name: res.data.name,
                        description: res.data.description || '',
                        price: res.data.price,
                        capacity: res.data.capacity?.toString() || '',
                        size: res.data.size?.toString() || '',
                        amenities: Array.isArray(res.data.amenities) ? res.data.amenities.join(', ') : ''
                    });
                    setImages(res.data.images || []);
                } catch (err) {
                    console.error("Error fetching room details", err);
                    setError("ไม่สามารถโหลดข้อมูลห้องพักได้");
                } finally {
                    setLoading(false);
                }
            };
            fetchRoomDetails();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, user, navigate, id, isEditMode]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            if (formData.description) formDataToSend.append('description', formData.description);
            formDataToSend.append('price', formData.price);
            if (formData.capacity) formDataToSend.append('capacity', formData.capacity);
            if (formData.size) formDataToSend.append('size', formData.size);

            const amenitiesArray = formData.amenities.split(',').map(a => a.trim()).filter(a => a);
            formDataToSend.append('amenities', JSON.stringify(amenitiesArray));

            imageFiles.forEach(file => {
                formDataToSend.append('images', file);
            });

            if (isEditMode) {
                formDataToSend.append('existingImages', JSON.stringify(images));
            }

            if (isEditMode) {
                await api.put(`api/rooms/${id}`, formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('อัปเดตห้องพักเรียบร้อย');
                navigate(`/admin/rooms`);
            } else {
                await api.post(`api/rooms`, formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('เพิ่มห้องพักเรียบร้อย');
                navigate('/admin/rooms');
                return;
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        } finally {
            setSaving(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImageFiles(Array.from(e.target.files));
        }
    };


    const handleDeleteImage = (index: number) => {
        if (!window.confirm('ยืนยันการลบรูปภาพนี้?')) return;
        setImages(images.filter((_, i) => i !== index));
    };

    if (loading) return null;

    return (
        <div className="bg-stone-50 min-h-[80vh] py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/admin/rooms" className="p-2 bg-white text-stone-500 hover:text-stone-800 rounded-xl shadow-sm border border-stone-200 transition-colors">
                        <FiChevronLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-stone-800 tracking-tight">
                            {isEditMode ? 'แก้ไขห้องพัก' : 'เพิ่มห้องพักใหม่'}
                        </h1>
                        <p className="text-stone-600 mt-1">กรอกข้อมูลให้ครบถ้วนเพื่อเปิดให้บริการ</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSave} className="bg-white rounded-3xl shadow-sm border border-stone-200 p-8">
                            <h2 className="text-xl font-bold text-stone-800 mb-6 border-b border-stone-100 pb-4">ข้อมูลพื้นฐาน</h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">ชื่อห้องพัก</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-stone-400"
                                        placeholder="เช่น ห้องเตียงเดี่ยว ดีลักซ์"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">ราคาต่อคืน (บาท)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-stone-400"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-2">รองรับได้ (ท่าน)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.capacity}
                                            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-stone-400"
                                            placeholder="2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-2">ขนาดห้อง (ตร.ม.)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.size}
                                            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-stone-400"
                                            placeholder="35"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">สิ่งอำนวยความสะดวก (คั่นด้วยลูกน้ำ)</label>
                                    <textarea
                                        rows={3}
                                        value={formData.amenities}
                                        onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none placeholder:text-stone-400"
                                        placeholder="เครื่องปรับอากาศ, สมาร์ททีวี, ตู้เย็น, Wi-Fi ฟรี"
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">รายละเอียดห้องพัก</label>
                                    <textarea
                                        rows={5}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none placeholder:text-stone-400"
                                        placeholder="ขนาดห้อง สิ้งอำนวยความสะดวก ฯลฯ"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-stone-100">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 shadow-md transition-all disabled:opacity-70 flex justify-center items-center"
                                >
                                    {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูลห้องพัก'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Images Column */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6">
                            <h2 className="text-lg font-bold text-stone-800 mb-4">{isEditMode ? 'อัปโหลดรูปภาพใหม่ (จะเขียนทับรูปเดิมทั้งหมด)' : 'เพิ่มรูปภาพใหม่'}</h2>
                            <div className="space-y-4">
                                <div>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>
                                {imageFiles.length > 0 && (
                                    <div className="text-sm text-stone-600">
                                        <p className="font-semibold mb-1">ไฟล์ที่เลือก: {imageFiles.length} ไฟล์</p>
                                        <ul className="list-disc pl-5">
                                            {imageFiles.map((f, i) => (
                                                <li key={i}>{f.name}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-lg font-bold text-stone-800">แกลลอรี่ ({images.length})</h2>
                            {images.length === 0 ? (
                                <div className="p-6 bg-stone-100 rounded-2xl text-center text-stone-500 text-sm">
                                    ยังไม่มีรูปภาพ
                                </div>
                            ) : (
                                images.map((url, index) => (
                                    <div key={index} className="relative group rounded-2xl overflow-hidden border border-stone-200 shadow-sm">
                                        <img src={url.startsWith('/') ? `http://localhost:3000${url}` : url} alt={`Room image ${index + 1}`} className="w-full h-40 object-cover" />
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
                                            <p className="text-white text-xs truncate drop-shadow-md">รูปที่ {index + 1}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteImage(index)}
                                            className="absolute top-2 right-2 p-2 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-500 transition-all shadow-md"
                                            title="ลบรูปภาพนี้"
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
        </div>
    );
};

export default AdminRoomForm;
