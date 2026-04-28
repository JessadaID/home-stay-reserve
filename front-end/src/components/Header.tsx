import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiList, FiMenu, FiX, FiLogOut, FiUser } from 'react-icons/fi';
import { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useContext(AuthContext);

    const isHome = location.pathname === '/';

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setIsDropdownOpen(false);
    }, [isAuthenticated]);

    useEffect(() => {
        if (location.hash) {
            const id = location.hash.replace('#', '');
            const element = document.getElementById(id);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 0);
            }
        }
    }, [location]);

    const navLinks = isHome ? [
        { name: 'Rooms', path: '/#rooms', icon: null },
        { name: 'Story', path: '/#story', icon: null },
        { name: 'Contact', path: '/#contact', icon: null },
    ] : [
        { name: 'หน้าหลัก', path: '/', icon: <FiHome className="mr-2" /> },
        { name: 'ห้องพัก', path: '/rooms', icon: <FiList className="mr-2" /> },
    ];

    const checkActive = (path: string) => location.pathname === path;

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsMenuOpen(false);
    };

    return (
        <header className={`${isHome ? 'absolute top-0 w-full z-50 bg-transparent py-4' : 'bg-white shadow-sm border-b border-stone-200 backdrop-blur-md'}`}>
            <div className=" mx-auto px-4 sm:px-8 lg:px-12 max-w-[1400px]">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
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
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                                H
                            </div>
                            <span className="font-bold text-xl text-stone-800 tracking-tight">Warm Homestay</span>
                        </Link>
                    )}

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center">
                        <nav className="flex space-x-8 mr-8">
                            {user?.role === 'admin' && (
                                <Link
                                    key='/admin'
                                    to='/admin/dashboard'
                                    className={`flex items-center px-3 py-2 rounded-md font-medium transition-colors ${isHome ? 'text-stone-300 hover:text-white' : checkActive('/admin/dashboard') ? 'text-emerald-700 bg-emerald-50' : 'text-stone-600 hover:text-emerald-600 hover:bg-stone-50'}`}
                                >
                                    {isHome ? null : <FiHome className="mr-2" />}
                                    Dashboard
                                </Link>
                            )}
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`flex items-center text-sm font-medium transition-colors ${isHome
                                        ? 'text-stone-300 hover:text-white'
                                        : `px-3 py-2 rounded-md ${checkActive(link.path) ? 'text-emerald-700 bg-emerald-50' : 'text-stone-600 hover:text-emerald-600 hover:bg-stone-50'}`
                                        }`}
                                >
                                    {link.icon}
                                    {link.name}
                                </Link>
                            ))}
                        </nav>

                        {/* Auth Area (Desktop) */}
                        <div className="flex items-center gap-4">
                            {isAuthenticated ? (
                                <div className="flex items-center gap-4">
                                    <div ref={dropdownRef} className="relative">
                                        <button
                                            onClick={() => setIsDropdownOpen((prev) => !prev)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors font-medium ${isHome ? 'hover:bg-white/10 text-stone-200' : 'hover:bg-stone-50 text-stone-700'}`}
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isHome ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
                                                <FiUser />
                                            </div>
                                            <span className="max-w-[150px] truncate">{user?.username}</span>
                                        </button>

                                        {isDropdownOpen && (
                                            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-stone-100 flex flex-col overflow-hidden z-50">
                                                <Link
                                                    to="/bookings"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                    className="px-4 py-3 text-sm text-stone-700 hover:bg-stone-50 font-medium flex items-center gap-2 border-b border-stone-100"
                                                >
                                                    <FiList /> การจองของฉัน
                                                </Link>
                                                <button
                                                    onClick={handleLogout}
                                                    className="px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 font-medium flex items-center gap-2 text-left w-full"
                                                >
                                                    <FiLogOut /> ออกจากระบบ
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    className={isHome ? "px-6 py-2 bg-[#4a6b52] hover:bg-[#3b5942] text-white font-medium rounded-sm transition-colors text-sm" : "px-5 py-2 rounded-full border border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white font-medium transition-colors"}
                                >
                                    {isHome ? 'Sign In' : 'เข้าสู่ระบบ'}
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`${isHome ? 'text-stone-300 hover:text-white' : 'text-stone-500 hover:text-stone-700'} focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-md p-2`}
                        >
                            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-b border-stone-200 absolute w-full top-full left-0 shadow-lg">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 text-stone-800">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex items-center px-3 py-3 rounded-md text-base font-medium text-stone-600 hover:text-emerald-600 hover:bg-stone-50`}
                            >
                                {link.icon}
                                {link.name}
                            </Link>
                        ))}
                        <div className="border-t border-stone-200 my-2 pt-2">
                            {isAuthenticated ? (
                                <>
                                    <Link to="/bookings" onClick={() => setIsMenuOpen(false)} className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-stone-700 hover:bg-stone-50 flex items-center gap-2">
                                        <FiList /> การจองของฉัน
                                    </Link>
                                    <button onClick={handleLogout} className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2">
                                        <FiLogOut /> ออกจากระบบ
                                    </button>
                                </>
                            ) : (
                                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block w-full text-center mt-2 px-5 py-3 rounded-md bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors">
                                    เข้าสู่ระบบ
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
