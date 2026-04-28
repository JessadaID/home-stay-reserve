import { Link, useLocation } from 'react-router-dom';
import { FiMapPin, FiPhone, FiMail } from 'react-icons/fi';

const Footer = () => {
    const location = useLocation();
    const isHome = location.pathname === '/';

    return (
        <footer id="contact" className={isHome ? "bg-stone-900 text-stone-300 border-t border-white/5" : "bg-stone-900 text-stone-300"}>
            <div className={`mx-auto py-12 ${isHome ? 'px-4 sm:px-8 lg:px-12 max-w-[1400px]' : 'px-4 sm:px-6 lg:px-8 max-w-7xl'}`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand & Description */}
                    <div className="space-y-4">
                        {isHome ? (
                            <Link to="/" className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-[#4a6b52] flex items-center justify-center text-white">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
                                        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
                                    </svg>
                                </div>
                                <span className="text-2xl text-white font-serif tracking-normal mt-1">Verdant</span>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center text-white font-bold shadow-md">
                                    H
                                </div>
                                <span className="font-bold text-xl text-white tracking-tight">Warm Homestay</span>
                            </div>
                        )}
                        <p className="text-stone-400 text-sm leading-relaxed max-w-sm">
                            {isHome
                                ? "Discover handpicked homestays surrounded by nature's beauty. Experience comfort, warmth, and botanical serenity."
                                : "ที่พักอบอุ่น สะอาด สะดวกสบาย ใกล้ชิดธรรมชาติ บรรยากาศเป็นกันเอง พร้อมสิ่งอำนวยความสะดวกครบครัน"}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">{isHome ? "Menu" : "เมนูหลัก"}</h3>
                        <ul className="space-y-2">
                            {isHome ? (
                                <>
                                    <li><Link to="/" className="hover:text-[#4a6b52] transition-colors text-sm">Destinations</Link></li>
                                    <li><Link to="/rooms" className="hover:text-[#4a6b52] transition-colors text-sm">Experiences</Link></li>
                                    <li><Link to="/#about" className="hover:text-[#4a6b52] transition-colors text-sm">About</Link></li>
                                </>
                            ) : (
                                <>
                                    <li><Link to="/" className="hover:text-emerald-400 transition-colors text-sm">หน้าหลัก</Link></li>
                                    <li><Link to="/rooms" className="hover:text-emerald-400 transition-colors text-sm">ห้องพักทั้งหมด</Link></li>
                                </>
                            )}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">{isHome ? "Contact Us" : "ติดต่อเรา"}</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-sm">
                                <FiMapPin className={`mt-1 shrink-0 ${isHome ? 'text-[#4a6b52]' : 'text-emerald-500'}`} />
                                <span>123 หมู่ 4 ต.เชียงดาว อ.เชียงดาว จ.เชียงใหม่ 50170</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm">
                                <FiPhone className={`shrink-0 ${isHome ? 'text-[#4a6b52]' : 'text-emerald-500'}`} />
                                <span>081-234-5678</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm">
                                <FiMail className={`shrink-0 ${isHome ? 'text-[#4a6b52]' : 'text-emerald-500'}`} />
                                <span>contact@{isHome ? 'verdantretreat' : 'warmhomestay'}.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className={`border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm ${isHome ? 'border-white/5 text-stone-500' : 'border-stone-800 text-stone-500'}`}>
                    <p>&copy; {new Date().getFullYear()} {isHome ? 'Verdant Retreat' : 'Warm Homestay'}. All rights reserved.</p>
                    <div className="mt-4 md:mt-0 flex space-x-4">
                        <a href="#" className="hover:text-white transition-colors">{isHome ? 'Privacy Policy' : 'นโยบายความเป็นส่วนตัว'}</a>
                        <a href="#" className="hover:text-white transition-colors">{isHome ? 'Terms of Service' : 'เงื่อนไขการให้บริการ'}</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
