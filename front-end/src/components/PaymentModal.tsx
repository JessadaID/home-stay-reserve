import React, { useState } from 'react';
import api from '../api/apiClient';
import { FiCreditCard, FiCheckCircle, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import type { PaymentModalProps } from '../types';

const PaymentModal: React.FC<PaymentModalProps> = ({ booking, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const totalPrice = Number(booking.total_price);
    const amountToPay = booking.payment_type === 'deposit' && booking.deposit_percentage
        ? (totalPrice * booking.deposit_percentage) / 100
        : totalPrice;

    const handlePayment = async () => {
        setLoading(true);
        setError('');
        try {
            await api.post('/payments/mock', { booking_id: booking.id });
            onSuccess();
            // Optionally redirect to My Bookings
            navigate('/bookings');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการจ่ายเงิน');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl relative overflow-hidden">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors"
                >
                    <FiX size={24} />
                </button>

                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiCreditCard size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-stone-800">ยืนยันการชำระเงิน</h2>
                    <p className="text-stone-500 text-sm mt-1">ทำรายการชำระเงินเพื่อยืนยันการจอง</p>
                </div>

                <div className="bg-stone-50 rounded-xl p-4 mb-6 text-sm border border-stone-200">
                    <div className="flex justify-between mb-2">
                        <span className="text-stone-600">รหัสการจอง:</span>
                        <span className="font-semibold text-stone-800">#{booking.id}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                        <span className="text-stone-600">ยอดรวมทั้งหมด:</span>
                        <span className="font-semibold text-stone-800">฿{totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                        <span className="text-stone-600">รูปแบบการชำระเงิน:</span>
                        <span className="font-semibold text-stone-800 capitalize">
                            {booking.payment_type === 'deposit'
                                ? `มัดจำ (${booking.deposit_percentage}%)`
                                : 'ชำระเต็มจำนวน'}
                        </span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-stone-200 mt-2">
                        <span className="font-bold text-stone-800 text-base">ยอดที่ต้องชำระทันที:</span>
                        <span className="font-bold text-emerald-600 text-xl">
                            ฿{amountToPay.toLocaleString()}
                        </span>
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl mb-4 border border-red-200">
                        {error}
                    </div>
                )}

                <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full py-3.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <FiCheckCircle />
                            ชำระเงิน (Mock Payment)
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default PaymentModal;
