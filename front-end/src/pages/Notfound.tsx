import { Link } from "react-router-dom";

const Notfound = () => {
    return (
        <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <div className="mb-8">

                    <h1 className="text-6xl font-bold text-stone-800 mb-2">404</h1>
                    <h2 className="text-2xl font-bold text-stone-800 mb-4">ไม่พบหน้าที่คุณค้นหา</h2>
                    <p className="text-stone-600 mb-8">
                        ขออภัย หน้าเว็บที่คุณพยายามเข้าถึงอาจจะถูกย้ายหรือลบไปแล้ว
                    </p>
                </div>

                <div className="space-y-4">
                    <Link
                        to="/"
                        className="block w-full px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 transition-colors"
                    >
                        กลับไปหน้าแรก
                    </Link>
                    <Link
                        to="/rooms"
                        className="block w-full px-6 py-3 bg-stone-200 text-stone-800 rounded-xl font-bold hover:bg-stone-300 transition-colors"
                    >
                        ค้นหาห้องพัก
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Notfound;