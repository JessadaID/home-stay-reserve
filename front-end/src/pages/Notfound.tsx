import { Link } from "react-router-dom";

const Notfound = () => {
    return (
        <div className="min-h-screen bg-[#F9FAF9] flex flex-col items-center justify-center px-4 pt-32 pb-16">
            <div className="max-w-md w-full text-center">
                <div className="mb-10">
                    <h1 className="text-8xl font-serif text-[#1A2F22] mb-4">404</h1>
                    <h2 className="text-2xl font-serif text-[#1A2F22] mb-4 tracking-wide">ไม่พบหน้าที่คุณค้นหา</h2>
                    <p className="text-stone-500 font-light mb-8">
                        ขออภัย หน้าเว็บที่คุณพยายามเข้าถึงอาจจะถูกย้ายหรือลบไปแล้ว
                    </p>
                </div>

                <div className="space-y-4">
                    <Link
                        to="/"
                        className="block w-full px-6 py-4 bg-[#4a6b52] text-white rounded-sm font-medium hover:bg-[#3b5942] transition-colors tracking-wide shadow-md"
                    >
                        กลับไปหน้าแรก
                    </Link>
                    <Link
                        to="/rooms"
                        className="block w-full px-6 py-4 bg-white border border-[#E5EAE5] text-[#1A2F22] rounded-sm font-medium hover:bg-[#F4F7F4] transition-colors tracking-wide shadow-sm"
                    >
                        ค้นหาห้องพัก
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Notfound;