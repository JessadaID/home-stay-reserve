import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const MainLayout = () => {
    const location = useLocation();
    const isHome = location.pathname === '/';

    return (
        <div className={`flex flex-col min-h-screen font-sans ${isHome ? 'bg-[#0a0f0d] text-stone-100' : 'bg-stone-50 text-stone-800'}`}>
            <Header />
            <main className="flex-grow flex flex-col relative w-full">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
