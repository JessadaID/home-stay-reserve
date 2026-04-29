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
        <div className="bg-slate-50 min-h-screen pt-32 pb-8 px-6">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-4 mb-6 border-b border-slate-200 pb-4">
                    <Link to="/admin/rooms" className="p-2 bg-white text-slate-500 hover:text-slate-800 rounded shadow-sm border border-slate-200 transition-colors">
                        <FiChevronLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">
                            {isEditMode ? 'Edit Room' : 'Add New Room'}
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Fill in the room details and configuration</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSave} className="bg-white rounded shadow-sm border border-slate-200 p-6">
                            <h2 className="text-base font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-3">Basic Information</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Room Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 text-sm rounded border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                                        placeholder="e.g. Deluxe Double Room"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Price per night (THB)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-3 py-2 text-sm rounded border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Capacity (Guests)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.capacity}
                                            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                            className="w-full px-3 py-2 text-sm rounded border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                                            placeholder="2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Size (sqm)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.size}
                                            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                            className="w-full px-3 py-2 text-sm rounded border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                                            placeholder="35"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Amenities (Comma separated)</label>
                                    <textarea
                                        rows={2}
                                        value={formData.amenities}
                                        onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                                        className="w-full px-3 py-2 text-sm rounded border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none placeholder:text-slate-400"
                                        placeholder="AC, Smart TV, Fridge, Free Wi-Fi"
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                    <textarea
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 text-sm rounded border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none placeholder:text-slate-400"
                                        placeholder="Room details..."
                                    ></textarea>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-70 flex justify-center items-center"
                                >
                                    {saving ? 'Saving...' : 'Save Room Data'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Images Column */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white rounded shadow-sm border border-slate-200 p-5">
                            <h2 className="text-sm font-semibold text-slate-800 mb-3">{isEditMode ? 'Upload New Images (Overwrites existing)' : 'Add Images'}</h2>
                            <div className="space-y-3">
                                <div>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="w-full px-2 py-1.5 text-xs rounded border border-slate-300 focus:ring-1 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                {imageFiles.length > 0 && (
                                    <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                                        <p className="font-semibold mb-1">Selected: {imageFiles.length} files</p>
                                        <ul className="list-disc pl-4 space-y-0.5">
                                            {imageFiles.map((f, i) => (
                                                <li key={i} className="truncate">{f.name}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded shadow-sm border border-slate-200 p-5">
                            <h2 className="text-sm font-semibold text-slate-800 mb-3">Gallery ({images.length})</h2>
                            {images.length === 0 ? (
                                <div className="p-4 bg-slate-50 border border-slate-100 rounded text-center text-slate-500 text-xs">
                                    No images
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {images.map((url, index) => (
                                        <div key={index} className="relative group rounded overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
                                            <img src={url.startsWith('/') ? `http://localhost:3000${url}` : url} alt={`Room image ${index + 1}`} className="w-full h-24 object-cover" />
                                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-6">
                                                <p className="text-white text-[10px] truncate">Image {index + 1}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteImage(index)}
                                                className="absolute top-1 right-1 p-1.5 bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 hover:bg-red-700 transition-all shadow"
                                                title="Delete this image"
                                            >
                                                <FiTrash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminRoomForm;
