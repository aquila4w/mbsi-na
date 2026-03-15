import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeftIcon, HeartIcon, AcademicCapIcon, CheckCircleIcon, ClockIcon, BookOpenIcon } from '@heroicons/react/24/outline';

export default function ProgramsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link href="/" className="flex items-center space-x-3">
                  <Image
                    src="/mbsi_logo copy.png"
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
                <Link href="/programs" className="text-sm font-medium text-blue-900 border-b-2 border-blue-900 pb-1">Programs</Link>
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
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Academic Programs</h1>
            <p className="text-xl text-blue-100 mb-2">
              Training approved ministers for full-time pastoral ministry
            </p>
            <p className="text-amber-300 font-semibold italic">
              LTMMTL - Love The Ministry More Than Life
            </p>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Two Pathways to Ministry
              </h2>
              <p className="text-lg text-gray-600">
                MBSI offers two comprehensive programs designed to equip students for effective ministry leadership and global evangelism.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 mb-20">
              <div className="bg-gradient-to-br from-amber-50 to-white border-2 border-amber-200 rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-8">
                  <div className="flex items-center mb-4">
                    <HeartIcon className="w-12 h-12 mr-4" />
                    <div>
                      <h3 className="text-3xl font-bold">Apostolic Missionary Program</h3>
                      <p className="text-amber-100">AMP</p>
                    </div>
                  </div>
                  <div className="flex items-center text-white/90">
                    <ClockIcon className="w-5 h-5 mr-2" />
                    <span className="font-semibold">2-Year Program</span>
                  </div>
                </div>

                <div className="p-8">
                  <h4 className="text-xl font-bold text-gray-900 mb-4">Program Overview</h4>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    The Apostolic Missionary Program is an intensive two-year training designed for those called to full-time ministry. This program emphasizes practical ministry experience, biblical foundations, and missionary preparation.
                  </p>

                  <h4 className="text-lg font-bold text-gray-900 mb-4">Program Focus</h4>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Intensive practical ministry training and field experience</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Biblical foundations and systematic theology</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Missionary preparation and evangelism training</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Church planting and ministry leadership</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Spirit-led worship and prayer ministry</span>
                    </li>
                  </ul>

                  <h4 className="text-lg font-bold text-gray-900 mb-4">Ideal For</h4>
                  <ul className="space-y-2 mb-8">
                    <li className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
                      Those sensing a clear call to full-time ministry
                    </li>
                    <li className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
                      Future church planters and missionaries
                    </li>
                    <li className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
                      Ministry workers seeking formal training
                    </li>
                    <li className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
                      Those committed to hands-on ministry experience
                    </li>
                  </ul>

                  <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg">
                    <h5 className="font-bold text-gray-900 mb-3">Program Outcomes</h5>
                    <p className="text-sm text-gray-700">
                      Graduates of the AMP program receive comprehensive preparation for missionary service and are equipped to establish and lead churches across North America and beyond.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-8">
                  <div className="flex items-center mb-4">
                    <AcademicCapIcon className="w-12 h-12 mr-4 text-amber-400" />
                    <div>
                      <h3 className="text-3xl font-bold">Bachelor of Theology</h3>
                      <p className="text-blue-100">B.Th.</p>
                    </div>
                  </div>
                  <div className="flex items-center text-white/90">
                    <ClockIcon className="w-5 h-5 mr-2" />
                    <span className="font-semibold">Minimum 4-Year Program</span>
                  </div>
                </div>

                <div className="p-8">
                  <h4 className="text-xl font-bold text-gray-900 mb-4">Program Overview</h4>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    The Bachelor of Theology is a comprehensive four-year degree program providing in-depth theological education, biblical scholarship, and pastoral training for those pursuing advanced ministry leadership.
                  </p>

                  <h4 className="text-lg font-bold text-gray-900 mb-4">Program Focus</h4>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-blue-900 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Advanced systematic theology and biblical studies</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-blue-900 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Biblical languages (Hebrew and Greek) and exegesis</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-blue-900 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Church history and historical theology</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-blue-900 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Pastoral theology and ministry leadership</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-blue-900 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Homiletics, hermeneutics, and biblical exposition</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-blue-900 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">End-time prophecy and eschatology</span>
                    </li>
                  </ul>

                  <h4 className="text-lg font-bold text-gray-900 mb-4">Ideal For</h4>
                  <ul className="space-y-2 mb-8">
                    <li className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-blue-900 rounded-full mr-3"></span>
                      Those seeking comprehensive theological education
                    </li>
                    <li className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-blue-900 rounded-full mr-3"></span>
                      Future senior pastors and ministry leaders
                    </li>
                    <li className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-blue-900 rounded-full mr-3"></span>
                      Those pursuing teaching ministry
                    </li>
                    <li className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-blue-900 rounded-full mr-3"></span>
                      Students desiring in-depth biblical scholarship
                    </li>
                  </ul>

                  <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                    <h5 className="font-bold text-gray-900 mb-3">Program Outcomes</h5>
                    <p className="text-sm text-gray-700">
                      B.Th. graduates emerge as theologically sound and academically equipped ministers, prepared for senior pastoral leadership and advanced ministry roles within the global church.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white p-12 rounded-lg mb-20">
              <h3 className="text-2xl font-bold mb-6 text-center">What Makes MBSI Unique</h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpenIcon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-bold mb-2">Spirit-Led Teaching</h4>
                  <p className="text-sm text-blue-100">
                    Teachings strongly shaped by the inspiration and power of the Holy Spirit
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AcademicCapIcon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-bold mb-2">Apostolic Guidance</h4>
                  <p className="text-sm text-blue-100">
                    Built upon the guidance and discipline of the living apostle in the end-time
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HeartIcon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-bold mb-2">Global Mission</h4>
                  <p className="text-sm text-blue-100">
                    Preparing stewards to proclaim God's word globally and evangelize the lost
                  </p>
                </div>
              </div>
            </div>

            <div className="max-w-4xl mx-auto bg-gray-50 p-10 rounded-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Admission Information</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">General Requirements</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-blue-900 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Clear testimony of faith in Jesus Christ</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-blue-900 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Demonstrated calling to full-time ministry</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-blue-900 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Letter of recommendation from pastor or church leader</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-blue-900 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Completed application form</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-blue-900 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">High school diploma or equivalent</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-blue-900 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Commitment to LTMMTL - Love The Ministry More Than Life</span>
                    </li>
                  </ul>
                </div>

                <div className="border-t border-gray-300 pt-6">
                  <h4 className="font-bold text-gray-900 mb-3">Application Process</h4>
                  <p className="text-gray-700 mb-4">
                    Prospective students should contact the admissions office to begin the application process. Applications are reviewed on a rolling basis.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center px-8 py-4 bg-blue-900 text-white text-base font-semibold hover:bg-blue-800 transition-all shadow-sm"
                    >
                      Apply Through Student Portal
                    </Link>
                    <a
                      href="mailto:info@mbsina.org"
                      className="inline-flex items-center justify-center px-8 py-4 border-2 border-blue-900 text-blue-900 text-base font-semibold hover:bg-blue-900 hover:text-white transition-all"
                    >
                      Contact Admissions
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-blue-900 to-slate-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Begin Your Training?</h2>
            <p className="text-lg text-blue-100 mb-8">
              Join 15 batches of graduates serving in churches worldwide
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/about"
                className="inline-flex items-center justify-center px-8 py-4 bg-amber-500 text-slate-900 text-base font-bold hover:bg-amber-400 transition-all shadow-lg"
              >
                Learn About MBSI
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
                src="/mbsi_logo copy.png"
                alt="MBSI Logo"
                width={48}
                height={48}
                              />
              <div>
                <span className="font-bold">MBSI North America Extension</span>
                <p className="text-xs text-gray-400">Training Ministers Since 1975</p>
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
