import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiMap, FiList, FiMenu, FiX, FiLogOut, FiUser } from 'react-icons/fi';
import { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Declare context and router hooks before effects
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useContext(AuthContext);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Reset dropdown whenever auth state changes (login/logout)
    useEffect(() => {
        setIsDropdownOpen(false);
    }, [isAuthenticated]);

    const navLinks = [
        { name: 'หน้าหลัก', path: '/', icon: <FiHome className="mr-2" /> },
        { name: 'ห้องพัก', path: '/rooms', icon: <FiList className="mr-2" /> },
        { name: 'แผนที่', path: '/map', icon: <FiMap className="mr-2" /> },
    ];

    const checkActive = (path: string) => location.pathname === path;

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsMenuOpen(false);
    };

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md">
                            H
                        </div>
                        <span className="font-bold text-xl text-stone-800 tracking-tight">Warm Homestay</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-8">
                        {user?.role === 'admin' && (
                            <Link
                                key='/admin'
                                to='/admin/dashboard'
                                className={`flex items-center px-3 py-2 rounded-md font-medium transition-colors ${checkActive('/admin/dashboard')
                                    ? 'text-emerald-700 bg-emerald-50'
                                    : 'text-stone-600 hover:text-emerald-600 hover:bg-stone-50'
                                    }`}
                            >
                                <FiHome className="mr-2" />
                                Dashboard
                            </Link>
                        )}
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center px-3 py-2 rounded-md font-medium transition-colors ${checkActive(link.path)
                                    ? 'text-emerald-700 bg-emerald-50'
                                    : 'text-stone-600 hover:text-emerald-600 hover:bg-stone-50'
                                    }`}
                            >
                                {link.icon}
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Auth Area (Desktop) */}
                    <div className="hidden md:flex items-center gap-4">
                        {isAuthenticated ? (
                            <div className="flex items-center gap-4">
                                <div ref={dropdownRef} className="relative">
                                    {/* Trigger button */}
                                    <button
                                        onClick={() => setIsDropdownOpen((prev) => !prev)}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-stone-50 transition-colors text-stone-700 font-medium"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                            <FiUser />
                                        </div>
                                        <span className="max-w-[150px] truncate">{user?.username}</span>
                                    </button>

                                    {/* Dropdown */}
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
                                className="px-5 py-2 rounded-full border border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white font-medium transition-colors"
                            >
                                เข้าสู่ระบบ
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-stone-500 hover:text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-md p-2"
                        >
                            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-b border-stone-200">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex items-center px-3 py-3 rounded-md text-base font-medium ${checkActive(link.path)
                                    ? 'text-emerald-700 bg-emerald-50'
                                    : 'text-stone-600 hover:text-emerald-600 hover:bg-stone-50'
                                    }`}
                            >
                                {link.icon}
                                {link.name}
                            </Link>
                        ))}

                        <div className="border-t border-stone-200 my-2 pt-2">
                            {isAuthenticated ? (
                                <>
                                    <div className="px-3 py-3 flex items-center gap-3 text-stone-700 font-medium mb-2">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                            <FiUser />
                                        </div>
                                        <div>
                                            <div>{user?.username}</div>
                                            <div className="text-sm font-normal text-stone-500">{user?.email}</div>
                                        </div>
                                    </div>
                                    <Link
                                        to="/bookings"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                                    >
                                        <FiList />
                                        การจองของฉัน
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                                    >
                                        <FiLogOut />
                                        ออกจากระบบ
                                    </button>
                                </>
                            ) : (
                                <Link
                                    to="/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block w-full text-center mt-2 px-5 py-3 rounded-md bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors"
                                >
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
