import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeftIcon, AcademicCapIcon, StarIcon } from '@heroicons/react/24/outline';

export default function FacultyPage() {
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
                <Link href="/faculty" className="text-sm font-medium text-blue-900 border-b-2 border-blue-900 pb-1">Faculty</Link>
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
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Leadership & Faculty</h1>
            <p className="text-xl text-blue-100">
              Guided by apostolic vision and Spirit-led teaching
            </p>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-sm font-semibold text-blue-900 tracking-wide uppercase mb-3">Our Leadership</h2>
              <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Apostolic Guidance for End-Time Ministry
              </p>
              <p className="text-lg text-gray-600">
                MBSI is blessed with leadership that carries the apostolic mandate and vision for training ministers in the last days.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-20 max-w-5xl mx-auto">
              <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white p-8 rounded-lg shadow-xl">
                <div className="flex items-center mb-6">
                  <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mr-4">
                    <AcademicCapIcon className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      <StarIcon className="w-5 h-5 text-amber-400 mr-2" />
                      <span className="text-sm text-amber-300 font-semibold">CHANCELLOR</span>
                    </div>
                    <h3 className="text-2xl font-bold">Apostle Jonathan S. Ferriol</h3>
                  </div>
                </div>
                <p className="text-blue-100 leading-relaxed mb-4">
                  As the current Chancellor of MBSI, Apostle Jonathan S. Ferriol carries forward the vision established by his father. He co-founded the North America Extension in 1997 alongside Presbyter Marites Ferriol, beginning with just a handful of students.
                </p>
                <p className="text-blue-100 leading-relaxed">
                  Under his leadership, MBSI North America has grown to become the largest of the four global extensions, graduating 15 batches of ministers and establishing churches across the United States, Canada, and Latin America.
                </p>
                <div className="mt-6 pt-6 border-t border-white/20">
                  <p className="text-sm text-amber-300 font-semibold">Legacy & Vision</p>
                  <p className="text-sm text-blue-100 mt-2">
                    Continuing the apostolic mandate to train approved ministers for the end-time harvest
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-700 to-slate-900 text-white p-8 rounded-lg shadow-xl border-2 border-amber-500">
                <div className="flex items-center mb-6">
                  <div className="w-20 h-20 bg-amber-600 rounded-full flex items-center justify-center mr-4">
                    <AcademicCapIcon className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      <StarIcon className="w-5 h-5 text-amber-400 mr-2" />
                      <span className="text-sm text-amber-300 font-semibold">CHANCELLOR EMERITUS</span>
                    </div>
                    <h3 className="text-2xl font-bold">Apostle Arsenio T. Ferriol</h3>
                    <p className="text-sm text-gray-400">1924 - 2024</p>
                  </div>
                </div>
                <p className="text-gray-200 leading-relaxed mb-4">
                  The Goodman of the House and founder of MBSI in 1975. Apostle Arsenio T. Ferriol established the school as the ministerial training arm of the Pentecostal Missionary Church of Christ (4th Watch).
                </p>
                <p className="text-gray-200 leading-relaxed mb-4">
                  His apostolic vision birthed four global extensions of MBSI: North America, Europe, Japan, and the Middle East. His legacy lives on through the hundreds of ministers trained under his guidance.
                </p>
                <div className="mt-6 pt-6 border-t border-white/20">
                  <p className="text-sm text-amber-400 font-semibold">Founding Vision</p>
                  <p className="text-sm text-gray-200 mt-2">
                    "To train future generations as approved ministers of Jesus Christ for the end-time mission"
                  </p>
                </div>
                <div className="mt-4 bg-amber-500/20 border border-amber-500/50 p-4 rounded">
                  <p className="text-xs text-amber-200 font-semibold mb-1">CAMPUS NAMED IN HONOR</p>
                  <p className="text-sm text-white">Apostle Arsenio T. Ferriol Global Missionary Center</p>
                </div>
              </div>
            </div>

            <div className="max-w-5xl mx-auto mb-20">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Administrative Leadership</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 p-8 rounded-lg">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-bold text-xl">E</span>
                    </div>
                    <div>
                      <p className="text-sm text-blue-900 font-semibold uppercase tracking-wide">Dean</p>
                      <h4 className="text-xl font-bold text-gray-900">Evangelist Leticia S. Ferriol</h4>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    As one of the founding members of MBSI alongside Apostle Arsenio T. Ferriol and Archbishop Arturo Ferriol, Evangelist Leticia S. Ferriol serves as the Dean, overseeing the academic excellence and spiritual formation of students.
                  </p>
                  <div className="mt-6 pt-6 border-t border-blue-200">
                    <p className="text-sm text-blue-900 font-semibold">Areas of Oversight</p>
                    <ul className="mt-2 space-y-1 text-sm text-gray-700">
                      <li className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-blue-900 rounded-full mr-2"></span>
                        Academic curriculum and standards
                      </li>
                      <li className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-blue-900 rounded-full mr-2"></span>
                        Spiritual formation and character development
                      </li>
                      <li className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-blue-900 rounded-full mr-2"></span>
                        Faculty coordination and development
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-white border-2 border-amber-200 p-8 rounded-lg">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-bold text-xl">P</span>
                    </div>
                    <div>
                      <p className="text-sm text-amber-700 font-semibold uppercase tracking-wide">North America Administrator</p>
                      <h4 className="text-xl font-bold text-gray-900">Presbyter Marites M. Ferriol</h4>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Co-founder of the North America Extension in 1997, Presbyter Marites M. Ferriol serves as the Administrator, managing the daily operations, student affairs, and campus facilities of MBSI North America.
                  </p>
                  <div className="mt-6 pt-6 border-t border-amber-200">
                    <p className="text-sm text-amber-700 font-semibold">Areas of Oversight</p>
                    <ul className="mt-2 space-y-1 text-sm text-gray-700">
                      <li className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mr-2"></span>
                        Campus operations and management
                      </li>
                      <li className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mr-2"></span>
                        Student services and support
                      </li>
                      <li className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mr-2"></span>
                        Admissions and enrollment
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white p-12 rounded-lg">
              <h3 className="text-2xl font-bold mb-6 text-center">Faculty Excellence</h3>
              <div className="max-w-4xl mx-auto">
                <p className="text-blue-100 text-center mb-8 leading-relaxed">
                  Our faculty consists of experienced ministers, many of whom are MBSI graduates themselves, now serving as coordinators, sub-coordinators, and teachers. They bring both academic excellence and practical ministry experience to the classroom.
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <AcademicCapIcon className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-bold mb-2">Qualified Instructors</h4>
                    <p className="text-sm text-blue-100">
                      Faculty with theological training and active ministry experience
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <StarIcon className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-bold mb-2">MBSI Alumni</h4>
                    <p className="text-sm text-blue-100">
                      Many faculty are graduates who now lead churches and train others
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <AcademicCapIcon className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-bold mb-2">Ministry Leaders</h4>
                    <p className="text-sm text-blue-100">
                      Active pastors, coordinators, and missionaries serving globally
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-blue-50 to-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white border-2 border-blue-900 p-10 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">The MBSI Legacy</h3>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  For 50 years, MBSI has been guided by apostolic vision and Spirit-led teaching. From its founding in 1975 to today, the school has remained committed to training approved ministers of Jesus Christ for the end-time mission.
                </p>
                <p>
                  The North America Extension, under the leadership of Apostle Jonathan S. Ferriol and Presbyter Marites M. Ferriol, continues to produce graduates who are:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="text-amber-500 mr-2">•</span>
                    <span><span className="font-semibold">Called</span> - Responding to God's divine calling</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-500 mr-2">•</span>
                    <span><span className="font-semibold">Consecrated</span> - Set apart for holy service</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-500 mr-2">•</span>
                    <span><span className="font-semibold">Competent</span> - Thoroughly equipped for ministry</span>
                  </li>
                </ul>
                <p className="text-center text-blue-900 font-bold italic pt-6 border-t border-gray-200 mt-6">
                  "LTMMTL - Love The Ministry More Than Life"
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-blue-900 to-slate-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Join Our Community of Learners</h2>
            <p className="text-lg text-blue-100 mb-8">
              Be trained by experienced leaders committed to your ministerial development
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/programs"
                className="inline-flex items-center justify-center px-8 py-4 bg-amber-500 text-slate-900 text-base font-bold hover:bg-amber-400 transition-all shadow-lg"
              >
                View Programs
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-900 text-base font-semibold hover:bg-gray-100 transition-all shadow-lg"
              >
                Learn Our History
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
                <p className="text-xs text-gray-400">Apostolic Leadership Since 1975</p>
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
