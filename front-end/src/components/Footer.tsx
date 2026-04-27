import { Link } from 'react-router-dom';
import { FiMapPin, FiPhone, FiMail } from 'react-icons/fi';

const Footer = () => {
    return (
        <footer className="bg-stone-900 text-stone-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand & Description */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center text-white font-bold shadow-md">
                                H
                            </div>
                            <span className="font-bold text-xl text-white tracking-tight">Warm Homestay</span>
                        </div>
                        <p className="text-stone-400 text-sm leading-relaxed">
                            ที่พักอบอุ่น สะอาด สะดวกสบาย ใกล้ชิดธรรมชาติ บรรยากาศเป็นกันเอง พร้อมสิ่งอำนวยความสะดวกครบครัน
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">เมนูหลัก</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/" className="hover:text-emerald-400 transition-colors text-sm">
                                    หน้าหลัก
                                </Link>
                            </li>
                            <li>
                                <Link to="/rooms" className="hover:text-emerald-400 transition-colors text-sm">
                                    ห้องพักทั้งหมด
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">ติดต่อเรา</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-sm">
                                <FiMapPin className="mt-1 text-emerald-500 shrink-0" />
                                <span>123 หมู่ 4 ต.เชียงดาว อ.เชียงดาว จ.เชียงใหม่ 50170</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm">
                                <FiPhone className="text-emerald-500 shrink-0" />
                                <span>081-234-5678</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm">
                                <FiMail className="text-emerald-500 shrink-0" />
                                <span>contact@warmhomestay.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-stone-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-stone-500">
                    <p>&copy; {new Date().getFullYear()} Warm Homestay. All rights reserved.</p>
                    <div className="mt-4 md:mt-0 flex space-x-4">
                        <a href="#" className="hover:text-white transition-colors">นโยบายความเป็นส่วนตัว</a>
                        <a href="#" className="hover:text-white transition-colors">เงื่อนไขการให้บริการ</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
