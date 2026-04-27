import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle } from 'react-icons/fi';

const Home = () => {
    return (
        <div className="flex-1 w-full bg-stone-50">
            {/* Hero Section */}
            <section className="relative w-full h-[60vh] min-h-[500px] flex items-center justify-center bg-stone-900 overflow-hidden">
                <div className="absolute inset-0 opacity-40">
                    <img
                        src="https://images.unsplash.com/photo-1510798831971-661eb04b3739?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
                        alt="Warm Homestay Background"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-12">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
                        ค้นพบความอบอุ่น <br />
                        <span className="text-emerald-400">ในทุกการพักผ่อนของคุณ</span>
                    </h1>
                    <p className="text-lg md:text-xl text-stone-200 mb-10 max-w-2xl mx-auto font-light drop-shadow-md">
                        สัมผัสประสบการณ์การพักผ่อนแบบใกล้ชิดธรรมชาติ
                        พร้อมบริการที่เป็นกันเองและการพักผ่อนที่เหนือระดับ
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/rooms"
                            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-full shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            จองห้องพัก <FiArrowRight />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-stone-800 mb-4">สิ่งอำนวยความสะดวกของเรา</h2>
                    <div className="h-1 w-20 bg-emerald-500 mx-auto rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { title: 'เตียงนอนหนานุ่ม', desc: 'หลับสบายตลอดคืนด้วยชุดเครื่องนอนคุณภาพเยี่ยม' },
                        { title: 'อาหารเช้าท้องถิ่น', desc: 'สัมผัสรสชาติอาหารพื้นเมืองแสนอร่อย ปรุงสดใหม่ทุกวัน' },
                        { title: 'ใกล้ชิดธรรมชาติ', desc: 'ตื่นมารับอากาศบริสุทธิ์ ชมวิวภูเขาและสายหมอกยามเช้า' },
                    ].map((feature, i) => (
                        <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                                <FiCheckCircle size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-stone-800 mb-3">{feature.title}</h3>
                            <p className="text-stone-600 leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
