import { Link } from 'react-router-dom';
import { FiMapPin, FiPhone, FiMail } from 'react-icons/fi';

const Footer = () => {

    return (
        <footer id="contact" className={"bg-stone-900 text-stone-300 border-t border-white/5"}>
            <div className={'mx-auto py-12 px-4 sm:px-8 lg:px-12 max-w-[1400px]'}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand & Description */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-[#4a6b52] flex items-center justify-center text-white">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
                                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
                                </svg>
                            </div>
                            <span className="text-2xl text-white font-serif tracking-normal mt-1">Verdant</span>
                        </Link>
                        <p className="text-stone-400 text-sm leading-relaxed max-w-sm">
                            Discover handpicked homestays surrounded by nature's beauty. Experience comfort, warmth, and botanical serenity.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Menu</h3>
                        <ul className="space-y-2">
                            <>
                                <li><Link to="/" className="hover:text-[#4a6b52] transition-colors text-sm">Destinations</Link></li>
                                <li><Link to="/rooms" className="hover:text-[#4a6b52] transition-colors text-sm">Experiences</Link></li>
                                <li><Link to="/#about" className="hover:text-[#4a6b52] transition-colors text-sm">About</Link></li>
                            </>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-sm">
                                <FiMapPin className={`mt-1 shrink-0 text-[#4a6b52]`} />
                                <span>123 หมู่ 4 ต.เชียงดาว อ.เชียงดาว จ.เชียงใหม่ 50170</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm">
                                <FiPhone className={`shrink-0 text-[#4a6b52]`} />
                                <span>081-234-5678</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm">
                                <FiMail className={`shrink-0 text-[#4a6b52]`} />
                                <span>contact@verdantretreat.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className={`border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm border-stone-800 text-stone-500`}>
                    <p>&copy; {new Date().getFullYear()} {'Verdant Retreat'}. All rights reserved.</p>
                    <div className="mt-4 md:mt-0 flex space-x-4">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
