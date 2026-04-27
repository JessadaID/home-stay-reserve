export interface Marker {
    id: number;
    room_id: number;
    x_coordinate: number;
    y_coordinate: number;
}

export interface RoomData {
    id: number;
    name: string;
    description: string;
    price: string | number;
    capacity?: number;
    size?: number;
    amenities?: string[];
    images?: string[];
}

export interface Room {
    id: number;
    name: string;
    description: string;
    price: string | number;
    capacity?: number;
    size?: number;
    amenities?: string[];
    images?: string[];
}

export interface Booking {
    id: number;
    room_id?: number;
    room_name?: string;
    check_in: string;
    check_out: string;
    customer_name?: string;
    price?: number;
    total_price?: number | string;
    payment_type?: string;
    payment_status?: string;
    deposit_percentage?: number;
    created_at?: string;
    room_image?: string;
}

export interface Holiday {
    id: number;
    holiday_date: string;
    description: string;
}

export interface BookingData {
    id: number;
    total_price: number | string;
    payment_type?: string;
    deposit_percentage?: number;
}

export interface PaymentModalProps {
    booking: BookingData;
    onClose: () => void;
    onSuccess: () => void;
}

export interface User {
    id: number;
    username: string;
    email: string;
    role: 'customer' | 'admin';
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (userData: User, token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}
