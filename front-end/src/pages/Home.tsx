import { FiCalendar, FiUsers, FiSearch } from 'react-icons/fi';
import Room from '../components/Room';

const Home = () => {
    return (
        <div className="w-full relative bg-[#0B1D12] text-stone-200 overflow-hidden min-h-screen">
            {/* The right-aligned vertical dark leaf image */}
            <div className="absolute top-0 right-[4%] md:right-[10%] lg:right-[15%] w-[80%] md:w-[280px] lg:w-[320px] h-[65vh] min-h-[500px] z-0 overflow-hidden mix-blend-lighten pointer-events-none hidden md:block">
                <img
                    src="https://www.seub.or.th/seubweb/wp-content/uploads/2023/10/%E0%B8%94%E0%B8%AD%E0%B8%A2%E0%B8%AB%E0%B8%A5%E0%B8%A7%E0%B8%87%E0%B9%80%E0%B8%8A%E0%B8%B5%E0%B8%A2%E0%B8%87%E0%B8%94%E0%B8%B2%E0%B8%A7.jpg"
                    alt="Dark Leaves Texture"
                    className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0a0f0d] via-[#0a0f0d]/80 to-transparent"></div>
            </div>

            <div className="absolute top-60 right-[10%] md:right-[90%] lg:right-[60%] w-[80%] md:w-[280px] lg:w-[520px] h-[65vh] min-h-[500px] z-0 overflow-hidden mix-blend-lighten pointer-events-none hidden md:block">
                <img
                    src="https://f.ptcdn.info/850/053/000/owx43e8yxDifbU5aNmN-o.jpg"
                    alt="Dark Leaves Texture"
                    className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0a0f0d] via-[#0a0f0d]/80 to-transparent"></div>
            </div>

            {/* Hero Section */}
            <section className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pt-40 md:pt-48 pb-20 md:pb-24 flex flex-col items-center text-center">
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif text-white mb-6 md:mb-8 tracking-wide drop-shadow-md">
                    Find Your Perfect Retreat
                </h1>
                <p className="font-sans text-base sm:text-lg md:text-xl text-stone-300 max-w-3xl font-light leading-relaxed mb-12 drop-shadow-md px-4">
                    พักกายในโฮมสเตย์ที่คัดสรรมาเพื่อคุณ โอบล้อมด้วยความงามของธรรมชาติ สัมผัสความอุ่นใจและผ่อนคลายไปกับความเขียวขจีที่แสนสงบ
                </p>

                {/* Search Bar */}
                <div className="bg-[#18211a] rounded-sm border border-[#2b3a2e] w-full max-w-4xl flex flex-col md:flex-row shadow-2xl relative z-20 mt-4 md:mt-12 text-left">
                    {/* Check in / Check out */}
                    <div className="flex-1 px-6 py-4 md:py-6 border-b md:border-b-0 md:border-r border-[#2b3a2e] flex items-center gap-4 hover:bg-[#1f2a22] transition-colors cursor-pointer">
                        <FiCalendar className="text-stone-400 text-xl shrink-0" />
                        <span className="text-stone-400 font-sans text-sm md:text-base tracking-wide">วันเข้าพัก - วันออก</span>
                    </div>
                    {/* Guests */}
                    <div className="flex-1 px-6 py-4 md:py-6 border-b md:border-b-0 md:border-r border-[#2b3a2e] flex items-center gap-4 hover:bg-[#1f2a22] transition-colors cursor-pointer">
                        <FiUsers className="text-stone-400 text-xl shrink-0" />
                        <span className="text-stone-400 font-sans text-sm md:text-base tracking-wide">จำนวนผู้เข้าพัก</span>
                    </div>
                    {/* Search Button */}
                    <button className="bg-[#4a6b52] hover:bg-[#3b5942] text-white font-medium px-8 py-5 md:py-0 flex items-center justify-center gap-3 transition-colors md:w-56 text-base tracking-wide">
                        <FiSearch className="text-lg" />
                        <span className="font-sans">ค้นหา</span>
                    </button>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 mt-12 md:mt-24 pb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
                    {/* Left side Images (Masonry / overlapping) */}
                    <div className="relative h-[400px] md:h-[600px] w-full flex justify-center items-center mt-8 md:mt-0">
                        {/* Background potted plant */}
                        {/* <div className="absolute top-0 right-[5%] w-[60%] md:w-[250px] h-[250px] md:h-[350px] z-0 opacity-40 shadow-lg hidden md:block">
                            <img src="https://www.seub.or.th/seubweb/wp-content/uploads/2023/10/%E0%B8%94%E0%B8%AD%E0%B8%A2%E0%B8%AB%E0%B8%A5%E0%B8%A7%E0%B8%87%E0%B9%80%E0%B8%8A%E0%B8%B5%E0%B8%A2%E0%B8%87%E0%B8%94%E0%B8%B2%E0%B8%A7.jpg" alt="Potted Plant" className="w-full h-full object-cover object-left" />
                        </div> */}
                        {/* Foreground warm interior */}
                        <div className="relative z-10 w-[85%] md:w-[350px] lg:w-[450px] h-[300px] md:h-[450px] shadow-2xl mr-auto md:ml-0 md:mr-16">
                            <img src="https://www.konlongtang.com/wp-content/uploads/2024/01/420969581_917255486434790_311687239160099067_n-1024x1024.jpg" alt="Warm Interior" className="w-full h-full object-cover" />
                        </div>
                    </div>

                    {/* Right side Text */}
                    <div className="px-4 md:px-0">
                        <h2 className="text-3xl md:text-5xl font-serif text-white mb-6 md:mb-8 tracking-wide">Our Story</h2>
                        <p className="text-base md:text-lg text-stone-400 font-light leading-relaxed mb-6">
                            ในเช้าที่หมอกจางๆ เคลื่อนตัวผ่านทิวไม้ เสียงแรกที่ทักทายคุณไม่ใช่ความวุ่นวายจากเมืองใหญ่ แต่เป็นเสียงกระซิบของใบไม้ที่ไหวเอนตามลม โฮมสเตย์ของเราถูกออกแบบมาให้เป็นส่วนหนึ่งของผืนป่า ที่ซึ่งเถาวัลย์ธรรมชาติและไม้เลื้อยเขียวชอุ่มทำหน้าที่เป็นปราการทางสายตา โอบกอดตัวอาคารไว้อย่างอ่อนโยน ให้คุณได้ทิ้งตัวลงบนพื้นที่ส่วนตัวที่ถูกโอบล้อมด้วยเฉดสีเขียวอันลึกซึ้ง และสัมผัสถึงความผ่อนคลายที่เริ่มต้นตั้งแต่ก้าวแรกที่มาถึง
                        </p>
                        <p className="text-base md:text-lg text-stone-400 font-light leading-relaxed mb-10">
                            90/2 หมู่ 1 บ้านห้วยหินลาด ตำบลป่าตอง อำเภอเชียงดาว จังหวัดเชียงใหม่ 50310
                        </p>
                        <button className="text-white border-b border-[#4a6b52] pb-1 font-medium hover:text-[#4a6b52] hover:border-[#3b5942] transition-colors text-lg tracking-wide inline-block">
                            อ่านเพิ่มเติม
                        </button>
                    </div>

                    <div className="absolute top-90 right-[70%] md:right-[90%] lg:right-[5%] w-[100%] md:w-[280px] lg:w-[300px] h-[65vh] min-h-[500px] z-0 overflow-hidden mix-blend-lighten pointer-events-none hidden md:block">
                        <img
                            src="https://www.expedia.co.th/stories/wp-content/uploads/2022/07/1.%E0%B8%94%E0%B8%AD%E0%B8%A2%E0%B8%AB%E0%B8%A5%E0%B8%A7%E0%B8%87%E0%B9%80%E0%B8%8A%E0%B8%B5%E0%B8%A2%E0%B8%87%E0%B8%94%E0%B8%B2%E0%B8%A7-1.jpg"
                            alt="Dark Leaves Texture"
                            className="w-full h-full object-cover opacity-30"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0a0f0d] via-[#0a0f0d]/80 to-transparent"></div>
                    </div>
                </div>
            </section>

            <section className="w-full mx-auto pb-32">
                <Room />
            </section>
        </div>
    );
};

export default Home;
