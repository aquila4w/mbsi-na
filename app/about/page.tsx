'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeftIcon, AcademicCapIcon, GlobeAltIcon, FireIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';

function ParallaxBg({ src, overlayClass, children, className }: { src: string; overlayClass: string; children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const sectionCenter = rect.top + rect.height / 2;
      setOffset((sectionCenter - viewportCenter) * 0.28);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className || ''}`}>
      <div className="absolute inset-0" style={{ transform: `translateY(${offset}px)`, willChange: 'transform', top: '-15%', bottom: '-15%' }}>
        <img src={src} alt="" className="w-full h-full object-cover" aria-hidden="true" />
      </div>
      <div className={`absolute inset-0 ${overlayClass}`}></div>
      <div className="relative">{children}</div>
    </div>
  );
}

function StyledPhoto({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div
      className={`overflow-hidden group relative ${className || ''}`}
      style={{ border: '2px solid rgba(245,158,11,0.35)', boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/55 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"></div>
      <div className="absolute inset-0 ring-0 group-hover:ring-2 group-hover:ring-amber-400/60 transition-all duration-500 pointer-events-none rounded-sm"></div>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-600 origin-left pointer-events-none"></div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link href="/" className="flex items-center space-x-3">
                  <Image
                    src="/mbsi-logo.png"
                    alt="MBSI Logo"
                    width={60}
                    height={60}
                  />
                  <div>
                    <h1 className="text-lg font-bold text-gray-900 leading-tight">MBSI</h1>
                    <p className="text-xs text-gray-600">North America Extension</p>
                  </div>
                </Link>
              </div>
              <nav className="hidden lg:ml-10 lg:flex lg:space-x-8">
                <Link href="/about" className="text-sm font-medium text-blue-900 border-b-2 border-blue-900 pb-1">About</Link>
                <Link href="/programs" className="text-sm font-medium text-gray-700 hover:text-blue-900 transition-colors">Programs</Link>
                <Link href="/faculty" className="text-sm font-medium text-gray-700 hover:text-blue-900 transition-colors">Faculty</Link>
                <Link href="/#contact" className="text-sm font-medium text-gray-700 hover:text-blue-900 transition-colors">Contact</Link>
              </nav>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center px-6 py-2.5 bg-blue-900 text-white text-sm font-medium hover:bg-blue-800 transition-colors shadow-sm"
            >
              Student Portal
            </Link>
          </div>
        </div>
      </header>

      <main>
        <ParallaxBg
          src="https://images.mbsina.org/637883399_1455506386371885_2410036573811370447_n.jpg"
          overlayClass="bg-gradient-to-b from-slate-950/95 via-slate-900/92 to-slate-950/95"
          className="text-white py-28"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/" className="inline-flex items-center text-blue-200 hover:text-white mb-8 text-sm">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">About MBSI</h1>
            <p className="text-xl text-blue-100">
              Three decades of training approved ministers of Jesus Christ
            </p>
          </div>
        </ParallaxBg>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ParallaxBg
              src="https://images.mbsina.org/641192777_1455506433038547_6362646209918826261_n.jpg"
              overlayClass="bg-gradient-to-br from-slate-900/88 via-blue-900/80 to-slate-900/88"
              className="text-white rounded-xl mb-20 py-16"
            >
              <div className="max-w-7xl mx-auto px-8 lg:px-16">
                <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
                  <div className="lg:col-span-7">
                    <h2 className="text-sm font-semibold text-amber-300 tracking-wide uppercase mb-3">Our History</h2>
                    <p className="text-3xl sm:text-4xl font-bold text-white mb-6 leading-tight">
                      Five Decades of Faithful Service
                    </p>
                    <div className="space-y-4">
                      <p className="text-gray-200 leading-relaxed">
                        Maranatha Bible School International (MBSI) was founded in <span className="font-semibold text-amber-300">1975</span> as the ministerial training arm of the Pentecostal Missionary Church of Christ (4th Watch).
                      </p>
                      <p className="text-gray-200 leading-relaxed">
                        Established by the Goodman of the House, <span className="font-semibold text-white">Apostle Arsenio T. Ferriol</span>, alongside Archbishop Arturo Ferriol and Evangelist Leticia S. Ferriol, the institution was created to train future generations as approved ministers of Jesus Christ.
                      </p>
                      <p className="text-gray-200 leading-relaxed">
                        Since its inception, MBSI has expanded into four global extensions: <span className="font-semibold text-amber-300">North America, Europe, Japan, and the Middle East</span>.
                      </p>
                    </div>
                  </div>
                  <div className="lg:col-span-5 mt-10 lg:mt-0">
                    <div className="grid grid-cols-2 gap-3">
                      <StyledPhoto
                        src="https://images.mbsina.org/637002293_1455505983038592_529621221909948630_n.jpg"
                        alt="MBSI History"
                        className="aspect-square rounded-lg col-span-1 row-span-2"
                      />
                      <StyledPhoto
                        src="https://images.mbsina.org/637762786_1455506283038562_1247305276317172394_n.jpg"
                        alt="MBSI Community"
                        className="aspect-square rounded-lg"
                      />
                      <StyledPhoto
                        src="https://images.mbsina.org/637830056_1455520049703852_6398612744105539037_n.jpg"
                        alt="Ministry Training"
                        className="aspect-square rounded-lg"
                      />
                    </div>
                    <div className="mt-3">
                      <StyledPhoto
                        src="https://images.mbsina.org/482832080_4231049790514712_895923824956936336_n.jpg"
                        alt="MBSI Anniversary"
                        className="w-full aspect-[16/7] rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </ParallaxBg>

            <div className="bg-gradient-to-br from-blue-50 to-amber-50 p-12 rounded-xl mb-20 border border-blue-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">The North America Extension Story</h3>
              <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
                <div className="space-y-5 max-w-2xl">
                  <p className="text-gray-700 leading-relaxed">
                    The <span className="font-semibold text-blue-900">North America Extension</span> was the first of the global extensions and remains the largest within the global mission. It was formed in <span className="font-semibold">1997</span> through the efforts of <span className="font-semibold">Apostle Jonathan S. Ferriol</span> and <span className="font-semibold">Presbyter Marites Ferriol</span> with only a handful of students.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Over three decades later, MBSI has graduated <span className="font-semibold text-blue-900">14 batches of full-fledged ministers</span>, with the 15th batch set to graduate this year, 2026, alongside dozens of Apostolic Missionary Program (AMP) interns.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Its alumni have emerged as flourishing leaders within the church, serving as coordinators, sub-coordinators, and MBSI faculty members. Furthermore, graduates have established <span className="font-semibold text-blue-900">numerous churches across the United States, Canada, and Latin America</span>.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    In 2020, the school rebranded to <span className="font-semibold">Maranatha Bible School International</span> to reflect its ever-expanding global mission.
                  </p>
                </div>
                <div className="mt-10 lg:mt-0">
                  <StyledPhoto
                    src="https://images.mbsina.org/637649654_1455506319705225_1491741129420180902_n.jpg"
                    alt="MBSI North America"
                    className="w-full aspect-[4/3] rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="mb-20">
              <h3 className="text-2xl font-bold text-gray-900 mb-10 text-center">Major Milestones</h3>
              <div className="max-w-5xl mx-auto space-y-8">
                {[
                  {
                    year: '1975', color: 'bg-blue-900', title: 'Foundation',
                    desc: 'MBSI founded by Apostle Arsenio T. Ferriol as the ministerial training arm of PMCC 4th Watch.',
                    imgs: [
                      'https://images.mbsina.org/faculty/471192025_897106575935494_7653902803360758079_n.jpg',
                      'https://images.mbsina.org/faculty/477708379_926989566280528_6210590653100352050_n.jpg',
                    ],
                  },
                  {
                    year: '1997', color: 'bg-amber-500', title: 'North America Extension Formed',
                    desc: 'Apostle Jonathan S. Ferriol and Presbyter Marites Ferriol establish the North America Extension with only a handful of students.',
                    imgs: [
                      'https://images.mbsina.org/faculty/526757433_1286062569982935_3464660697682852645_n.jpg',
                      'https://images.mbsina.org/faculty/475144760_917400737239411_6377940372261510392_n.jpg',
                    ],
                  },
                  {
                    year: '2020', color: 'bg-blue-900', title: 'Rebranding',
                    desc: 'School rebrands to Maranatha Bible School International to reflect its ever-expanding global mission across four continents.',
                    imgs: [
                      'https://images.mbsina.org/641192777_1455506433038547_6362646209918826261_n.jpg',
                      'https://images.mbsina.org/637655617_1455507183038472_6231199999404545892_n.jpg',
                    ],
                  },
                  {
                    year: '2021', color: 'bg-amber-500', title: 'Campus Inauguration',
                    desc: 'Official campus opened: Apostle Arsenio T. Ferriol Global Missionary Center — with modern classrooms, gym, library, and full student facilities.',
                    imgs: [
                      'https://images.mbsina.org/637769863_1455507136371810_6263204516673870441_n.jpg',
                      'https://images.mbsina.org/gym/535553707_1302720071650518_4695658712920848632_n.jpg',
                    ],
                  },
                  {
                    year: '2024', color: 'bg-blue-900', title: 'Leadership Transition',
                    desc: 'Following the passing of Chancellor Emeritus Apostle Arsenio T. Ferriol, Apostle Jonathan S. Ferriol is installed as MBSI Chancellor.',
                    imgs: [
                      'https://images.mbsina.org/faculty/526757433_1286062569982935_3464660697682852645_n.jpg',
                      'https://images.mbsina.org/482832080_4231049790514712_895923824956936336_n.jpg',
                    ],
                  },
                  {
                    year: '2026', color: 'bg-amber-500', title: 'Three Decades & 15th Batch',
                    desc: 'Celebrating three decades of North America ministry with the graduation of the 15th batch of full-fledged ministers.',
                    imgs: [
                      'https://images.mbsina.org/641303403_1456153922973798_4837987518281799659_n.jpg',
                      'https://images.mbsina.org/641316266_1456153892973801_3874141486794394358_n.jpg',
                    ],
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-5 items-start bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                    <div className="flex-shrink-0">
                      <div className={`w-16 h-16 ${item.color} rounded-full flex items-center justify-center shadow-lg`}>
                        <span className="text-white font-bold text-sm leading-tight text-center">{item.year}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <h4 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                    <div className="hidden sm:flex flex-shrink-0 gap-2">
                      {item.imgs.map((src, j) => (
                        <div
                          key={j}
                          className="w-28 h-20 overflow-hidden rounded-lg group"
                          style={{ border: '2px solid rgba(245,158,11,0.35)', boxShadow: '0 2px 10px rgba(0,0,0,0.13)' }}
                        >
                          <img
                            src={src}
                            alt={item.title}
                            className="w-full h-full object-cover object-top group-hover:scale-110 group-hover:brightness-110 transition-all duration-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white p-8 rounded-xl shadow-lg">
                <FireIcon className="w-12 h-12 text-amber-400 mb-4" />
                <h3 className="text-xl font-bold mb-3">Our Vision</h3>
                <p className="text-blue-100 leading-relaxed">
                  To be a beacon of truth, instituted to reveal the mysteries of times and seasons, preparing ministers for the end-time mission.
                </p>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-8 rounded-xl shadow-lg">
                <AcademicCapIcon className="w-12 h-12 text-white mb-4" />
                <h3 className="text-xl font-bold mb-3">Our Mission</h3>
                <p className="text-amber-50 leading-relaxed">
                  To train approved ministers of Jesus Christ through Spirit-led teaching and comprehensive biblical education.
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white p-8 rounded-xl shadow-lg">
                <GlobeAltIcon className="w-12 h-12 text-amber-400 mb-4" />
                <h3 className="text-xl font-bold mb-3">Our Calling</h3>
                <p className="text-blue-100 leading-relaxed">
                  Called, Consecrated, Competent for the End-Time Mission - preparing stewards to proclaim God's word globally.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-sm font-semibold text-blue-900 tracking-wide uppercase mb-3">Campus Life</h2>
              <p className="text-2xl font-bold text-gray-900">Life at MBSI North America</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                'https://images.mbsina.org/637838964_1455513643037826_8697834871975361149_n.jpg',
                'https://images.mbsina.org/637848694_1455513696371154_8778760080235421395_n.jpg',
                'https://images.mbsina.org/639147750_1455513609704496_1534814447602031335_n.jpg',
                'https://images.mbsina.org/637789203_1455513483037842_949561862806831416_n.jpg',
                'https://images.mbsina.org/641467736_1455506976371826_6639366107527773460_n.jpg',
                'https://images.mbsina.org/637766449_1455513386371185_3451572275493343593_n.jpg',
              ].map((src, i) => (
                <StyledPhoto
                  key={i}
                  src={src}
                  alt={`Campus life ${i + 1}`}
                  className="aspect-square rounded-lg"
                />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-blue-900 to-slate-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Continue Your Journey</h2>
            <p className="text-lg text-blue-100 mb-8">
              Discover how you can be part of this legacy
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/programs"
                className="inline-flex items-center justify-center px-8 py-4 bg-amber-500 text-slate-900 text-base font-bold hover:bg-amber-400 transition-all shadow-lg"
              >
                View Programs
              </Link>
              <Link
                href="/faculty"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-900 text-base font-semibold hover:bg-gray-100 transition-all shadow-lg"
              >
                Meet Our Faculty
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Image
                src="/mbsi-logo.png"
                alt="MBSI Logo"
                width={48}
                height={48}
              />
              <div>
                <span className="font-bold">MBSI North America Extension</span>
                <p className="text-xs text-gray-400">Since 1997</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              © 2026 MBSI North America Extension. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
