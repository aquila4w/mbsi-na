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
  FireIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
                Student Portal
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
        <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzE0IDAgNiAyLjY4NiA2IDZzLTIuNjg2IDYtNiA2LTYtMi42ODYtNi02IDIuNjg2LTYgNi02ek0yNCA0NGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
            <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
              <div className="lg:col-span-7">
                <div className="inline-flex items-center px-4 py-1.5 bg-amber-500/20 backdrop-blur-sm rounded-full text-xs font-medium tracking-wide mb-6 border border-amber-400/50 text-amber-200">
                  <FireIcon className="w-4 h-4 mr-2" />
                  Since 1975 - Celebrating 50 Years
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
                    Student Portal
                  </Link>
                </div>
                <div className="border-t border-white/20 pt-6">
                  <p className="text-sm text-blue-200 mb-2 uppercase tracking-wider font-semibold">Our Slogan</p>
                  <p className="text-xl font-bold text-white">
                    LTMMTL - <span className="text-amber-300">Love The Ministry More Than Life</span>
                  </p>
                </div>
              </div>
              <div className="hidden lg:block lg:col-span-5">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-blue-500/20 blur-3xl"></div>
                  <Image
                    src="/mbsi-logo.png"
                    alt="MBSI Logo"
                    width={400}
                    height={400}
                    className="relative drop-shadow-2xl"
                  />
                </div>
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
                  <div className="text-4xl font-bold text-amber-400 mb-2">25</div>
                  <div className="text-sm text-gray-300">Years of North America Ministry</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-amber-400 mb-2">14</div>
                  <div className="text-sm text-gray-300">Graduate Batches</div>
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
              <div className="bg-white border-2 border-gray-200 hover:border-amber-500 transition-all duration-300 group">
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

              <div className="bg-white border-2 border-blue-900 shadow-lg relative">
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

        <section className="bg-gradient-to-br from-blue-50 via-white to-amber-50 py-20 sm:py-24 lg:py-32">
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

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <BookOpenIcon className="w-10 h-10 text-blue-900 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Libraries & Classrooms</h3>
                <p className="text-sm text-gray-600">Extensive theological resources and modern learning spaces</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <UserGroupIcon className="w-10 h-10 text-blue-900 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Multi-Purpose Theaters</h3>
                <p className="text-sm text-gray-600">State-of-the-art facilities for worship and gatherings</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <SparklesIcon className="w-10 h-10 text-blue-900 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Campus Amenities</h3>
                <p className="text-sm text-gray-600">On-campus gym and student support facilities</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-blue-900 via-slate-900 to-blue-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:flex lg:items-center lg:justify-between">
              <div className="lg:w-2/3">
                <h2 className="text-3xl font-bold mb-4">
                  Answer the Call to Ministry
                </h2>
                <p className="text-lg text-blue-100 mb-2">
                  Join 15 batches of graduates serving churches across North America and beyond.
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
                  Student Portal
                </Link>
              </div>
            </div>
          </div>
        </section>
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
                Founded 1975 - Celebrating 50 Years of Ministry
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
