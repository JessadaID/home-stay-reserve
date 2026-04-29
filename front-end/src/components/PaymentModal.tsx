import React, { useState } from 'react';
import api from '../api/apiClient';
import { FiCreditCard, FiCheckCircle, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import type { PaymentModalProps } from '../types';

const PaymentModal: React.FC<PaymentModalProps> = ({ booking, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const totalPrice = Number(booking.total_price);
    const amountToPay = booking.payment_type === 'deposit' && booking.deposit_percentage
        ? (totalPrice * booking.deposit_percentage) / 100
        : totalPrice;

    const handlePayment = async () => {
        setLoading(true);
        setError('');
        try {
            await api.post(`${API_URL}/api/payments/mock`, { booking_id: booking.id });
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
        <div className="fixed inset-0 bg-stone-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-[#F9FAF9] rounded-sm max-w-md w-full p-8 shadow-2xl relative overflow-hidden border border-[#E5EAE5]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-stone-400 hover:text-[#1A2F22] transition-colors"
                >
                    <FiX size={24} />
                </button>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-white border border-[#E5EAE5] text-[#4a6b52] rounded-sm flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <FiCreditCard size={30} />
                    </div>
                    <h2 className="text-2xl font-sans text-[#1A2F22] tracking-wide mb-1">ยืนยันการชำระเงิน</h2>
                    <p className="text-stone-500 font-light text-sm">ทำรายการชำระเงินเพื่อยืนยันการจอง</p>
                </div>

                <div className="bg-white rounded-sm p-5 mb-8 text-sm border border-[#E5EAE5] shadow-sm">
                    <div className="flex justify-between mb-3">
                        <span className="text-stone-500 font-light">รหัสการจอง:</span>
                        <span className="font-medium text-[#1A2F22]">#{booking.id}</span>
                    </div>
                    <div className="flex justify-between mb-3">
                        <span className="text-stone-500 font-light">ยอดรวมทั้งหมด:</span>
                        <span className="font-medium text-[#1A2F22]">฿{totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mb-4">
                        <span className="text-stone-500 font-light">รูปแบบการชำระเงิน:</span>
                        <span className="font-medium text-[#1A2F22] capitalize">
                            {booking.payment_type === 'deposit'
                                ? `มัดจำ (${booking.deposit_percentage}%)`
                                : booking.payment_type === 'pay_on_arrival'
                                    ? 'จ่ายเมื่อเข้าพัก'
                                    : 'ชำระเต็มจำนวน'}
                        </span>
                    </div>
                    <div className="flex justify-between pt-4 border-t border-[#E5EAE5] items-end">
                        <span className="font-medium text-[#1A2F22] text-sm">ยอดที่ต้องชำระทันที:</span>
                        <span className="font-sans text-[#4a6b52] text-2xl">
                            ฿{amountToPay.toLocaleString()}
                        </span>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-rose-50 text-rose-700 text-sm rounded-sm mb-6 border border-rose-200 font-light text-center">
                        {error}
                    </div>
                )}

                <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full py-4 bg-[#4a6b52] text-white font-medium rounded-sm hover:bg-[#3b5942] shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 tracking-wide"
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
