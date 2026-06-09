'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpenIcon,
  AcademicCapIcon,
  GlobeAltIcon,
  UserGroupIcon,
  SparklesIcon,
  HeartIcon,
  LightBulbIcon,
  FireIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useState, useEffect, useRef } from 'react';

const galleryImages = [
  { src: 'https://images.mbsina.org/field-trips/525653870_1286266496629209_4904426453360321680_n.jpg', alt: 'Field Trip' },
  { src: 'https://images.mbsina.org/641316266_1456153892973801_3874141486794394358_n.jpg', alt: 'Graduation Ceremony' },
  { src: 'https://images.mbsina.org/640398137_1456153876307136_8509879117469714915_n.jpg', alt: 'Graduate Group Photo' },
  { src: 'https://images.mbsina.org/641388672_1456153836307140_2469215302247896029_n.jpg', alt: 'Graduation Day' },
  { src: 'https://images.mbsina.org/641010068_1456153636307160_6158663428550680771_n.jpg', alt: 'Graduate Ministers' },
  { src: 'https://images.mbsina.org/640330441_1456153496307174_1273870152391168587_n.jpg', alt: 'Ministry Ceremony' },
  { src: 'https://images.mbsina.org/637883399_1455506386371885_2410036573811370447_n.jpg', alt: 'Campus Gathering' },
];

const graduatesImages = [
  'https://images.mbsina.org/637649654_1455506319705225_1491741129420180902_n.jpg',
  'https://images.mbsina.org/637762786_1455506283038562_1247305276317172394_n.jpg',
  'https://images.mbsina.org/641192777_1455506433038547_6362646209918826261_n.jpg',
  'https://images.mbsina.org/637655617_1455507183038472_6231199999404545892_n.jpg',
  'https://images.mbsina.org/637769863_1455507136371810_6263204516673870441_n.jpg',
  'https://images.mbsina.org/637002293_1455505983038592_529621221909948630_n.jpg',
  'https://images.mbsina.org/641467736_1455506976371826_6639366107527773460_n.jpg',
  'https://images.mbsina.org/637830056_1455520049703852_6398612744105539037_n.jpg',
];

function GalleryCarousel({ images }: { images: { src: string; alt: string }[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  const prev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));

  return (
    <div className="relative overflow-hidden shadow-2xl aspect-[4/3] group" style={{ borderRadius: '2px', border: '3px solid rgba(245,158,11,0.5)' }}>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent z-10 pointer-events-none"></div>
      {images.map((img, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-all duration-1000 ${i === current ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
        >
          <img
            src={img.src}
            alt={img.alt}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-amber-500 text-white p-2.5 rounded-full transition-all z-20 opacity-0 group-hover:opacity-100"
        aria-label="Previous"
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-amber-500 text-white p-2.5 rounded-full transition-all z-20 opacity-0 group-hover:opacity-100"
        aria-label="Next"
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`transition-all duration-300 rounded-full ${i === current ? 'bg-amber-400 w-6 h-2' : 'bg-white/50 w-2 h-2 hover:bg-white/80'}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
      <div className="absolute bottom-4 right-4 z-20 bg-black/50 text-white text-xs px-2 py-1 rounded font-medium">
        {current + 1} / {images.length}
      </div>
    </div>
  );
}

function ParallaxSection({ children, src, overlayClass, className }: { children: React.ReactNode; src: string; overlayClass?: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const sectionCenter = rect.top + rect.height / 2;
      const viewportCenter = viewportHeight / 2;
      setOffset((sectionCenter - viewportCenter) * 0.3);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section ref={ref} className={`relative overflow-hidden ${className || ''}`}>
      <div className="absolute inset-0" style={{ transform: `translateY(${offset}px)`, willChange: 'transform', top: '-15%', bottom: '-15%' }}>
        <img src={src} alt="" className="w-full h-full object-cover object-top" aria-hidden="true" />
      </div>
      <div className={`absolute inset-0 ${overlayClass || 'bg-gradient-to-r from-blue-900/92 via-slate-900/88 to-blue-900/92'}`}></div>
      <div className="relative">{children}</div>
    </section>
  );
}

export default function Home() {
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
                <Link href="/about" className="text-sm font-medium text-gray-700 hover:text-blue-900 transition-colors">About</Link>
                <Link href="/programs" className="text-sm font-medium text-gray-700 hover:text-blue-900 transition-colors">Programs</Link>
                <Link href="/faculty" className="text-sm font-medium text-gray-700 hover:text-blue-900 transition-colors">Faculty</Link>
                <a href="#contact" className="text-sm font-medium text-gray-700 hover:text-blue-900 transition-colors">Contact</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center px-6 py-2.5 text-sm font-medium text-blue-900 hover:text-blue-800 transition-colors"
              >
                Portal Login
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center px-6 py-2.5 bg-blue-900 text-white text-sm font-medium hover:bg-blue-800 transition-colors shadow-sm"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="relative text-white overflow-hidden min-h-[85vh] flex items-center">
          <div className="absolute inset-0">
            <img
              src="https://images.mbsina.org/637655617_1455507183038472_6231199999404545892_n.jpg"
              alt="MBSI Campus"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-blue-900/80 to-slate-900/85"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36 w-full">
            <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
              <div className="lg:col-span-7">
                <div className="inline-flex items-center px-4 py-1.5 bg-amber-500/20 backdrop-blur-sm rounded-full text-xs font-medium tracking-wide mb-6 border border-amber-400/50 text-amber-200">
                  <FireIcon className="w-4 h-4 mr-2" />
                  Since 1997 - Celebrating Three Decades
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
                  Maranatha Bible School International
                </h1>
                <p className="text-xl sm:text-2xl text-blue-100 mb-4 font-semibold">
                  North America Extension
                </p>
                <p className="text-2xl sm:text-3xl text-amber-300 mb-6 font-bold italic">
                  Called, Consecrated, Competent for the End-Time Mission
                </p>
                <p className="text-lg text-gray-200 mb-8 leading-relaxed max-w-2xl">
                  A biblical academe built upon the guidance and discipline of the living apostle in the end-time. Firmly inclined to prepare the stewards of God to proclaim His word globally, to seek His people and to evangelize the lost.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Link
                    href="/programs"
                    className="inline-flex items-center justify-center px-8 py-4 bg-amber-500 text-slate-900 text-base font-bold hover:bg-amber-400 transition-all shadow-lg"
                  >
                    Explore Programs
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white text-base font-semibold hover:bg-white hover:text-blue-900 transition-all"
                  >
                    Portal Login
                  </Link>
                </div>
                <div className="border-t border-white/20 pt-6">
                  <p className="text-sm text-blue-200 mb-2 uppercase tracking-wider font-semibold">Our Slogan</p>
                  <p className="text-xl font-bold text-white">
                    LTMMTL - <span className="text-amber-300">Love The Ministry More Than Life</span>
                  </p>
                </div>
              </div>
              <div className="hidden lg:block lg:col-span-5 mt-12 lg:mt-0">
                <GalleryCarousel images={galleryImages} />
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="bg-white py-20 sm:py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto mb-16">
              <h2 className="text-sm font-semibold text-blue-900 tracking-wide uppercase mb-3">Our Mission</h2>
              <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                A Beacon of Truth
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                A biblical academe built upon the guidance and discipline of the living apostle in the end-time. Its teachings are strongly shaped by the inspiration and power of the Holy Spirit. It is firmly inclined to prepare the stewards of God to proclaim His word globally, to seek His people and to evangelize the lost. <span className="font-semibold text-blue-900">A beacon of truth: Instituted to reveal the mysteries of times and seasons.</span>
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-lg border-2 border-blue-100 hover:border-blue-900 transition-all">
                <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center mb-6">
                  <FireIcon className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Spirit-Led Teaching</h3>
                <p className="text-gray-600 leading-relaxed">
                  Our teachings are strongly shaped by the inspiration and power of the Holy Spirit, preparing ministers for end-time ministry.
                </p>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-white p-8 rounded-lg border-2 border-amber-100 hover:border-amber-500 transition-all">
                <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mb-6">
                  <GlobeAltIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Global Proclamation</h3>
                <p className="text-gray-600 leading-relaxed">
                  Training stewards of God to proclaim His word globally, establishing churches across North America and beyond.
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-lg border-2 border-blue-100 hover:border-blue-900 transition-all">
                <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center mb-6">
                  <LightBulbIcon className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Revealing Mysteries</h3>
                <p className="text-gray-600 leading-relaxed">
                  Instituted to reveal the mysteries of times and seasons, understanding God's prophetic timeline for the end-time.
                </p>
              </div>
            </div>

            <div className="mt-16 bg-gradient-to-r from-slate-900 to-blue-900 text-white p-12 rounded-lg">
              <div className="grid md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold text-amber-400 mb-2">14</div>
                  <div className="text-sm text-gray-300">Graduate Batches</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-amber-400 mb-2">3</div>
                  <div className="text-sm text-gray-300">Decades of North America Ministry</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-amber-400 mb-2">2</div>
                  <div className="text-sm text-gray-300">Bible School Programs</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-amber-400 mb-2">1</div>
                  <div className="text-sm text-gray-300">End-Time Mission</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gray-950 py-20 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-sm font-semibold text-amber-400 tracking-wide uppercase mb-3">15th Graduating Batch</h2>
              <p className="text-3xl sm:text-4xl font-bold text-white mb-4">
                A Legacy of Faithful Ministers
              </p>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Generation after generation, MBSI North America sends out approved ministers of Jesus Christ into the harvest field.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {graduatesImages.map((src, i) => (
                <div
                  key={i}
                  className="aspect-square overflow-hidden group relative"
                  style={{ border: '2px solid rgba(245,158,11,0.3)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                >
                  <img
                    src={src}
                    alt={`Graduate ${i + 1}`}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-115 group-hover:brightness-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                href="/about"
                className="inline-flex items-center px-8 py-4 bg-amber-500 text-slate-900 text-base font-bold hover:bg-amber-400 transition-all shadow-lg"
              >
                Our Story
              </Link>
            </div>
          </div>
        </section>

        <section id="programs" className="bg-gray-50 py-20 sm:py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-sm font-semibold text-blue-900 tracking-wide uppercase mb-3">Academic Programs</h2>
              <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Training Approved Ministers of Christ
              </p>
              <p className="text-lg text-gray-600">
                Two comprehensive programs designed to equip servants for full-time pastoral ministry and global evangelism.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div className="bg-white border-2 border-gray-200 hover:border-amber-500 transition-all duration-300 group shadow-sm hover:shadow-lg">
                <div className="p-8">
                  <div className="w-12 h-12 bg-amber-500 rounded flex items-center justify-center mb-6">
                    <HeartIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Apostolic Missionary Program</h3>
                  <p className="text-sm text-amber-600 font-semibold mb-4">AMP - 2 Years</p>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    An intensive two-year program focused on practical ministry training, biblical foundations, and missionary preparation for those called to serve in the harvest field.
                  </p>
                  <ul className="space-y-2 mb-8">
                    <li className="flex items-center text-sm text-gray-700">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-3"></span>
                      Practical ministry experience
                    </li>
                    <li className="flex items-center text-sm text-gray-700">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-3"></span>
                      Missionary field training
                    </li>
                    <li className="flex items-center text-sm text-gray-700">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-3"></span>
                      Biblical foundations
                    </li>
                    <li className="flex items-center text-sm text-gray-700">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-3"></span>
                      2-year commitment
                    </li>
                  </ul>
                  <Link href="/programs" className="inline-flex items-center text-amber-600 font-semibold hover:text-amber-700">
                    Learn More
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>

              <div className="bg-white border-2 border-blue-900 shadow-lg relative hover:shadow-xl transition-all duration-300">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-900 text-white px-4 py-1 text-xs font-semibold rounded-full">
                  MOST COMPREHENSIVE
                </div>
                <div className="p-8">
                  <div className="w-12 h-12 bg-blue-900 rounded flex items-center justify-center mb-6">
                    <AcademicCapIcon className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Bachelor of Theology</h3>
                  <p className="text-sm text-blue-900 font-semibold mb-4">B.Th. - Minimum 4 Years</p>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    A comprehensive four-year degree program providing in-depth theological education, biblical scholarship, and pastoral training for those pursuing advanced ministry leadership.
                  </p>
                  <ul className="space-y-2 mb-8">
                    <li className="flex items-center text-sm text-gray-700">
                      <span className="w-1.5 h-1.5 bg-blue-900 rounded-full mr-3"></span>
                      Advanced theological studies
                    </li>
                    <li className="flex items-center text-sm text-gray-700">
                      <span className="w-1.5 h-1.5 bg-blue-900 rounded-full mr-3"></span>
                      Biblical languages & exegesis
                    </li>
                    <li className="flex items-center text-sm text-gray-700">
                      <span className="w-1.5 h-1.5 bg-blue-900 rounded-full mr-3"></span>
                      Pastoral leadership training
                    </li>
                    <li className="flex items-center text-sm text-gray-700">
                      <span className="w-1.5 h-1.5 bg-blue-900 rounded-full mr-3"></span>
                      Minimum 4-year program
                    </li>
                  </ul>
                  <Link href="/programs" className="inline-flex items-center text-blue-900 font-semibold hover:text-blue-800">
                    Learn More
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/programs"
                className="inline-flex items-center px-8 py-4 bg-blue-900 text-white text-base font-semibold hover:bg-blue-800 transition-all shadow-sm"
              >
                View Complete Program Details
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-24 lg:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-sm font-semibold text-blue-900 tracking-wide uppercase mb-3">Our Campus</h2>
              <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Apostle Arsenio T. Ferriol Global Missionary Center
              </p>
              <p className="text-lg text-gray-600">
                Modern facilities equipped for rigorous theological education and practical ministry training.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-center mb-12">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { src: 'https://images.mbsina.org/gym/535553707_1302720071650518_4695658712920848632_n.jpg', label: 'Gym' },
                  { src: 'https://images.mbsina.org/gym/535603733_1302720068317185_770222141414855370_n.jpg', label: 'Facilities' },
                  { src: 'https://images.mbsina.org/gym/536270601_1302720078317184_6495101031103246003_n.jpg', label: 'Recreation' },
                  { src: 'https://images.mbsina.org/637789203_1455513483037842_949561862806831416_n.jpg', label: 'Community' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="aspect-square overflow-hidden group relative"
                    style={{ border: '2px solid #e5e7eb', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}
                  >
                    <img
                      src={item.src}
                      alt={item.label}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-115 group-hover:brightness-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                    <span className="absolute bottom-2 left-0 right-0 text-center text-white text-xs font-semibold tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-500">{item.label}</span>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"></div>
                  </div>
                ))}
              </div>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300">
                  <BookOpenIcon className="w-10 h-10 text-blue-900 mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Libraries & Classrooms</h3>
                  <p className="text-sm text-gray-600">Extensive theological resources and modern learning spaces designed for deep biblical study and discipleship.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300">
                  <UserGroupIcon className="w-10 h-10 text-blue-900 mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Multi-Purpose Theaters</h3>
                  <p className="text-sm text-gray-600">State-of-the-art facilities for worship, ministry gatherings, and special events throughout the academic year.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300">
                  <SparklesIcon className="w-10 h-10 text-blue-900 mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Campus Amenities</h3>
                  <p className="text-sm text-gray-600">On-campus gym, recreation areas, and full student support facilities to support holistic student development.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ParallaxSection
          src="https://images.mbsina.org/641303403_1456153922973798_4837987518281799659_n.jpg"
          overlayClass="bg-gradient-to-b from-slate-950/95 via-blue-950/90 to-slate-950/95"
          className="py-20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:flex lg:items-center lg:justify-between">
              <div className="lg:w-2/3">
                <h2 className="text-3xl font-bold mb-4 text-white">
                  Answer the Call to Ministry
                </h2>
                <p className="text-lg text-blue-100 mb-2">
                  Join 14 batches of graduates serving churches across North America and beyond.
                </p>
                <p className="text-amber-300 font-semibold italic">
                  Called, Consecrated, Competent for the End-Time Mission
                </p>
              </div>
              <div className="mt-8 lg:mt-0 lg:flex-shrink-0 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center px-8 py-4 bg-amber-500 text-slate-900 text-base font-bold hover:bg-amber-400 transition-all shadow-lg"
                >
                  Learn More
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-900 text-base font-semibold hover:bg-gray-100 transition-all shadow-lg"
                >
                  Portal Login
                </Link>
              </div>
            </div>
          </div>
        </ParallaxSection>
      </main>

      <footer id="contact" className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <Image
                  src="/mbsi-logo.png"
                  alt="MBSI Logo"
                  width={48}
                  height={48}
                />
                <div>
                  <h3 className="text-lg font-bold">Maranatha Bible School International</h3>
                  <p className="text-sm text-gray-400">North America Extension</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed mb-4">
                A biblical academe built upon the guidance and discipline of the living apostle in the end-time.
              </p>
              <p className="text-amber-400 font-semibold italic mb-6">
                Called, Consecrated, Competent for the End-Time Mission
              </p>
              <p className="text-sm text-gray-500">
                © 2026 MBSI North America Extension. All rights reserved.
              </p>
              <p className="text-xs text-gray-600 mt-2">
                Founded 1997 - Celebrating Three Decades of Ministry
              </p>
            </div>

            <div>
              <h4 className="text-base font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-gray-400 hover:text-white text-sm transition-colors">About Us</Link></li>
                <li><Link href="/programs" className="text-gray-400 hover:text-white text-sm transition-colors">Programs</Link></li>
                <li><Link href="/faculty" className="text-gray-400 hover:text-white text-sm transition-colors">Faculty</Link></li>
                <li><Link href="/login" className="text-gray-400 hover:text-white text-sm transition-colors">Student Portal</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-base font-semibold mb-4">Contact</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <p className="font-medium text-white mb-1">Email</p>
                  <a href="mailto:info@mbsina.org" className="hover:text-white transition-colors">info@mbsina.org</a>
                </li>
                <li>
                  <p className="font-medium text-white mb-1">Website</p>
                  <a href="https://mbsina.org" className="hover:text-white transition-colors">www.mbsina.org</a>
                </li>
                <li className="pt-4">
                  <p className="font-medium text-amber-400 mb-1">Campus Location</p>
                  <p className="text-xs">Apostle Arsenio T. Ferriol<br />Global Missionary Center</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
