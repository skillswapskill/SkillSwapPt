import React from 'react';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <br></br>
      <br></br>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-indigo-900 mb-6">
            About SkillSwap
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            The story of a vision to make India a global superpower through skill sharing and innovation
          </p>
        </div>

        {/* Founder's Story */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-16">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Our Founder's Journey</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 mx-auto mb-8"></div>
            </div>
            
            {/* Founder Profile */}
            <div className="flex flex-col lg:flex-row items-center gap-12 mb-12">
              <div className="lg:w-1/3">
                <div className="relative">
                  <img
                    src="anubhab-chowdhury.png"
                    alt="Anubhab Chowdhury - Founder of SkillSwap"
                    className="w-64 h-64 rounded-full shadow-2xl object-cover mx-auto ring-4 ring-indigo-100 ring-offset-4"
                    style={{
                      backgroundImage: "url('data:image/jpeg;base64,...')", // Your actual photo will be here
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                  <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div className="text-center mt-6">
                  <h3 className="text-2xl font-bold text-gray-800">Anubhab Chowdhury</h3>
                  <p className="text-indigo-600 font-medium">Founder & Visionary</p>
                  <div className="flex justify-center space-x-2 mt-2">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">Entrepreneur</span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Innovator</span>
                  </div>
                </div>
              </div>
              
              <div className="lg:w-2/3">
                <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
                  <p>
                    It all began with a simple yet revolutionary thought: <strong className="text-indigo-600">
                    "Why not create a website where users can both teach and learn on the same platform?"</strong> 
                    This idea sparked in the mind of Anubhab Chowdhury, a young visionary who dreamed of 
                    transforming how knowledge is shared in India.
                  </p>
                  
                  <p>
                    Anubhab envisioned a platform where learning wouldn't be limited by financial barriers. 
                    Instead of paying money, users could earn <strong className="text-purple-600">credits</strong> by 
                    sharing their skills with others. To encourage participation, he decided to give 
                    <strong className="text-green-600"> 300 bonus credits</strong> to every new user, 
                    ensuring everyone could start their journey immediately.
                  </p>
                  
                  <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-l-4 border-indigo-500">
                    <h4 className="font-semibold text-indigo-800 mb-3">🚀 The SkillCoin Vision</h4>
                    <p className="text-indigo-700">
                      But Anubhab's vision went beyond just credits. He planned to launch 
                      <strong> SkillCoin</strong>, a cryptocurrency that users could redeem their credits for, 
                      creating real monetary value for knowledge sharing and making SkillSwap the first 
                      platform of its kind in India.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* The Journey */}
            <div className="space-y-8">
              <div className="bg-gray-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">The Challenging Beginning</h3>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    The first few months were incredibly tedious and challenging. Anubhab worked alone, 
                    dedicating countless hours to coding, designing, and building the platform from scratch. 
                    There were sleepless nights, moments of doubt, and technical hurdles that seemed impossible to overcome.
                  </p>
                  
                  <p>
                    But his determination never wavered. Every line of code he wrote, every feature he implemented, 
                    was driven by his unwavering belief in the potential of Indian talent and his vision of 
                    democratizing education through technology.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Building the Team</h3>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    Slowly and gradually, as SkillSwap began to take shape, Anubhab started hiring a dedicated team. 
                    Each team member was carefully selected not just for their skills, but for their shared 
                    commitment to the mission of empowering India through education and innovation.
                  </p>
                  
                  <p>
                    Today, SkillSwap is powered by a passionate team of developers, designers, and visionaries 
                    who believe in transforming India's educational landscape through technology.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">The Greater Mission</h3>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    For Anubhab, SkillSwap is not just a platform—it's the foundation of a much larger vision. 
                    <strong className="text-orange-600"> His ultimate goal is to make India a global superpower 
                    and a better place for living.</strong> He believes that when people can freely share knowledge 
                    and skills, entire communities prosper.
                  </p>
                  
                  <p>
                    SkillSwap represents just the starting point of this ambitious journey. Through this platform, 
                    Anubhab aims to unlock the immense potential of Indian talent, foster innovation, and create 
                    opportunities that will propel India to the forefront of the global stage.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 text-white text-center">
                <h3 className="text-2xl font-bold mb-6">A Dedication to India</h3>
                <div className="space-y-4 text-lg leading-relaxed">
                  <p>
                    Anubhab Chowdhury has dedicated his knowledge, attitude, and ego to serve India 
                    and transform it into a global leader and superpower. Every decision, every feature, 
                    and every line of code in SkillSwap reflects this unwavering commitment.
                  </p>
                  
                  <p className="font-semibold text-xl">
                    "Through SkillSwap, we're not just sharing skills—we're building the foundation 
                    for India's technological and educational revolution."
                  </p>
                  
                  <p className="text-sm opacity-90">- Anubhab Chowdhury, Founder and CEO</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Connect with Us */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Connect with Our Journey</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Follow our story and be part of the mission to make India a global superpower through skill sharing
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <a 
              href="https://www.youtube.com/@SkillSwap-n4r" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-red-50 hover:bg-red-100 rounded-2xl p-6 text-center transition-colors border-2 border-transparent hover:border-red-200"
            >
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
              <h4 className="font-bold text-gray-800 mb-2">YouTube</h4>
              <p className="text-sm text-gray-600">Watch our journey & tutorials</p>
            </a>

            <a 
              href="https://www.instagram.com/skillswap_2025/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-pink-50 hover:bg-pink-100 rounded-2xl p-6 text-center transition-colors border-2 border-transparent hover:border-pink-200"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
              <h4 className="font-bold text-gray-800 mb-2">Instagram</h4>
              <p className="text-sm text-gray-600">Daily updates & behind the scenes</p>
            </a>

            <a 
              href="https://www.linkedin.com/in/skill-swap-434622373/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-blue-50 hover:bg-blue-100 rounded-2xl p-6 text-center transition-colors border-2 border-transparent hover:border-blue-200"
            >
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
              <h4 className="font-bold text-gray-800 mb-2">LinkedIn</h4>
              <p className="text-sm text-gray-600">Professional insights & networking</p>
            </a>

            <a 
              href="https://x.com/2025Skills72565" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gray-50 hover:bg-gray-100 rounded-2xl p-6 text-center transition-colors border-2 border-transparent hover:border-gray-200"
            >
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
              <h4 className="font-bold text-gray-800 mb-2">X (Twitter)</h4>
              <p className="text-sm text-gray-600">Real-time updates & thoughts</p>
            </a>
          </div>

          <div className="text-center mt-12">
            <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl inline-block">
              <h4 className="font-semibold text-gray-800 mb-2">Join the Mission</h4>
              <p className="text-gray-600 mb-4">Be part of India's journey to becoming a global superpower</p>
              <a href="mailto:skillswapskill@gmail.com" className="text-indigo-600 hover:text-indigo-700 font-medium">
                📧 skillswapskill@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
