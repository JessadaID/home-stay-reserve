import { FiArrowUp } from "react-icons/fi";
import { useEffect, useState } from "react";
const ScrollToTop = () => {
    const [visible, setVisible] = useState(false);

    const toggleVisible = () => {
        const scrolled = window.scrollY;
        if (scrolled > 300) {
            setVisible(true);
        } else {
            setVisible(false);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisible);
        return () => window.removeEventListener('scroll', toggleVisible);
    }, []);
    return (
        <>
            {visible && (
                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-5 right-5 bg-[#7bb188] text-stone-900 p-3 rounded-full z-50 hover:bg-[#4a6b52] transition-colors cursor-pointer">
                    <FiArrowUp />
                </button>
            )}
        </>
    );
};

export default ScrollToTop;
