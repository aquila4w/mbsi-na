import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeftIcon, AcademicCapIcon, GlobeAltIcon, UserGroupIcon, FireIcon } from '@heroicons/react/24/outline';

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
        <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/" className="inline-flex items-center text-blue-200 hover:text-white mb-8 text-sm">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">About MBSI</h1>
            <p className="text-xl text-blue-100">
              Celebrating 50 years of training approved ministers of Jesus Christ
            </p>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center mb-20">
              <div>
                <h2 className="text-sm font-semibold text-blue-900 tracking-wide uppercase mb-3">Our History</h2>
                <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                  Five Decades of Faithful Service
                </p>
                <div className="prose prose-lg text-gray-700 space-y-4">
                  <p>
                    Maranatha Bible School International (MBSI) was founded in <span className="font-semibold text-blue-900">1975</span> as the ministerial training arm of the Pentecostal Missionary Church of Christ (4th Watch).
                  </p>
                  <p>
                    Established by the Goodman of the House, <span className="font-semibold">Apostle Arsenio T. Ferriol</span>, alongside Archbishop Arturo Ferriol and Evangelist Leticia S. Ferriol, the institution was created to train future generations as approved ministers of Jesus Christ.
                  </p>
                  <p>
                    Since its inception, MBSI has expanded into four global extensions: <span className="font-semibold">North America, Europe, Japan, and the Middle East</span>.
                  </p>
                </div>
              </div>
              <div className="mt-12 lg:mt-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-blue-500/20 blur-3xl"></div>
                  <Image
                    src="/mbsi-logo.png"
                    alt="MBSI Logo"
                    width={500}
                    height={500}
                    className="relative rounded-lg shadow-xl"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-amber-50 p-12 rounded-lg mb-20">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">The North America Extension Story</h3>
              <div className="space-y-6 max-w-4xl mx-auto">
                <p className="text-gray-700 leading-relaxed">
                  The <span className="font-semibold text-blue-900">North America Extension</span> was the first of the global extensions and remains the largest within the global mission. It was formed in <span className="font-semibold">1997</span> through the efforts of <span className="font-semibold">Apostle Jonathan S. Ferriol</span> and <span className="font-semibold">Presbyter Marites Ferriol</span> with only a handful of students.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Over 25 years later, MBSI has graduated <span className="font-semibold text-blue-900">14 batches of full-fledged ministers</span>, with the 15th batch set to graduate this year, 2026, alongside dozens of Apostolic Missionary Program (AMP) interns.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Its alumni have emerged as flourishing leaders within the church, serving as coordinators, sub-coordinators, and MBSI faculty members. Furthermore, graduates have established <span className="font-semibold text-blue-900">numerous churches across the United States, Canada, and Latin America</span>.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  In 2020, the school rebranded to <span className="font-semibold">Maranatha Bible School International</span> to reflect its ever-expanding global mission.
                </p>
              </div>
            </div>

            <div className="mb-20">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Major Milestones</h3>
              <div className="max-w-4xl mx-auto">
                <div className="space-y-8">
                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">1975</span>
                      </div>
                    </div>
                    <div className="flex-1 pt-2">
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Foundation</h4>
                      <p className="text-gray-600">MBSI founded by Apostle Arsenio T. Ferriol as the ministerial training arm of PMCC 4th Watch.</p>
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">1997</span>
                      </div>
                    </div>
                    <div className="flex-1 pt-2">
                      <h4 className="text-lg font-bold text-gray-900 mb-2">North America Extension Formed</h4>
                      <p className="text-gray-600">Apostle Jonathan S. Ferriol and Presbyter Marites Ferriol establish the North America Extension.</p>
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">2020</span>
                      </div>
                    </div>
                    <div className="flex-1 pt-2">
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Rebranding</h4>
                      <p className="text-gray-600">School rebrands to Maranatha Bible School International to reflect global mission expansion.</p>
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">2021</span>
                      </div>
                    </div>
                    <div className="flex-1 pt-2">
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Campus Inauguration</h4>
                      <p className="text-gray-600">Official campus opened: Apostle Arsenio T. Ferriol Global Missionary Center with modern amenities.</p>
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">2024</span>
                      </div>
                    </div>
                    <div className="flex-1 pt-2">
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Leadership Transition</h4>
                      <p className="text-gray-600">Following the passing of Chancellor Emeritus Apostle Arsenio T. Ferriol, Apostle Jonathan S. Ferriol becomes MBSI Chancellor.</p>
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">2026</span>
                      </div>
                    </div>
                    <div className="flex-1 pt-2">
                      <h4 className="text-lg font-bold text-gray-900 mb-2">50th Anniversary</h4>
                      <p className="text-gray-600">Celebrating 50 years of ministry with the 15th batch of graduates.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white p-8 rounded-lg">
                <FireIcon className="w-12 h-12 text-amber-400 mb-4" />
                <h3 className="text-xl font-bold mb-3">Our Vision</h3>
                <p className="text-blue-100 leading-relaxed">
                  To be a beacon of truth, instituted to reveal the mysteries of times and seasons, preparing ministers for the end-time mission.
                </p>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-8 rounded-lg">
                <AcademicCapIcon className="w-12 h-12 text-white mb-4" />
                <h3 className="text-xl font-bold mb-3">Our Mission</h3>
                <p className="text-amber-50 leading-relaxed">
                  To train approved ministers of Jesus Christ through Spirit-led teaching and comprehensive biblical education.
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white p-8 rounded-lg">
                <GlobeAltIcon className="w-12 h-12 text-amber-400 mb-4" />
                <h3 className="text-xl font-bold mb-3">Our Calling</h3>
                <p className="text-blue-100 leading-relaxed">
                  Called, Consecrated, Competent for the End-Time Mission - preparing stewards to proclaim God's word globally.
                </p>
              </div>
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
                <p className="text-xs text-gray-400">Since 1975</p>
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
