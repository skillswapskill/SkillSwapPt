import React, { useState } from 'react';

const Support = () => {
  const [activeTab, setActiveTab] = useState('faq');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <br></br>
      <br></br>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-indigo-900 mb-4">
            Support Center
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're here to help you make the most of your SkillSwap experience. 
            Find answers, get support, and connect with our community.
          </p>
        </div>

        {/* Quick Contact */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="grid md:grid-cols-1 gap-6 max-w-md mx-auto">
            <div className="text-center p-6 bg-indigo-50 rounded-xl">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Email Support</h3>
              <p className="text-sm text-gray-600 mb-3">Get help via email</p>
              <a href="mailto:skillswapskill@gmail.com" className="text-indigo-600 hover:text-indigo-700 font-medium">
                skillswapskill@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* YouTube Channel Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Follow us on YouTube</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Subscribe to our YouTube channel for tutorials, tips, success stories, and quick solutions to common issues. 
              Get visual guides and stay updated with the latest SkillSwap features!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="https://www.youtube.com/@SkillSwap-n4r" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span>Subscribe to SkillSwap</span>
              </a>
              <div className="text-sm text-gray-500">
                Get instant help through video tutorials
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800 text-sm">📹 How-to Guides</h4>
                <p className="text-xs text-gray-600">Step-by-step tutorials</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800 text-sm">🎯 Tips & Tricks</h4>
                <p className="text-xs text-gray-600">Expert advice & shortcuts</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800 text-sm">🔧 Troubleshooting</h4>
                <p className="text-xs text-gray-600">Quick problem solutions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center mb-8">
          <div className="bg-white rounded-xl p-2 shadow-lg">
            {['faq', 'tickets'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                {tab === 'faq' && 'FAQ'}
                {tab === 'tickets' && 'Support Tickets'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {activeTab === 'faq' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-6">
                {[
                  {
                    q: "How do I create a skill exchange?",
                    a: "Navigate to your dashboard and click 'Create Exchange'. Fill in your skill details and what you're looking to learn in return. You can also watch our step-by-step tutorial on our YouTube channel!"
                  },
                  {
                    q: "Is SkillSwap free to use?",
                    a: "Yes! SkillSwap is completely free. We believe in democratizing skill sharing and learning."
                  },
                  {
                    q: "How do I find the right skill partner?",
                    a: "Use our advanced search filters to find users with complementary skills in your area or available for online sessions. Check out our YouTube tutorials for advanced search tips!"
                  },
                  {
                    q: "What if I'm not satisfied with a skill exchange?",
                    a: "We have a rating and review system. If issues arise, contact our support team for mediation."
                  },
                  {
                    q: "How do I update my profile information?",
                    a: "Go to your profile settings and click 'Edit Profile'. You can update your skills, bio, availability, and contact preferences. Need help? Watch our profile optimization video on YouTube!"
                  },
                  {
                    q: "Can I exchange skills with people from other countries?",
                    a: "Absolutely! SkillSwap supports both local and international skill exchanges through our video call integration."
                  },
                  {
                    q: "How does the rating system work?",
                    a: "After each skill exchange session, both parties can rate their experience. This helps maintain quality and trust in our community."
                  },
                  {
                    q: "What should I do if someone doesn't show up for a scheduled session?",
                    a: "Contact our support team immediately. We take no-shows seriously and will help mediate the situation."
                  },
                  {
                    q: "Where can I find video tutorials and guides?",
                    a: "Visit our YouTube channel @SkillSwap-n4r for comprehensive video tutorials, tips, and troubleshooting guides!"
                  }
                ].map((item, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4">
                    <h3 className="font-semibold text-gray-800 mb-2">{item.q}</h3>
                    <p className="text-gray-600">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tickets' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Submit a Support Ticket</h2>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded mb-6">
                <p className="text-blue-700">
                  <strong>💡 Tip:</strong> Before submitting a ticket, check our FAQ above and visit our 
                  <a href="https://www.youtube.com/@SkillSwap-n4r" target="_blank" rel="noopener noreferrer" className="underline ml-1 hover:text-blue-800">
                    YouTube channel
                  </a> for video solutions!
                </p>
              </div>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
                    <input type="text" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Enter your full name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                    <input type="email" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="your@email.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                  <input type="text" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Brief description of your issue" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="">Select a category</option>
                    <option>Technical Issue</option>
                    <option>Account Problem</option>
                    <option>Profile Issues</option>
                    <option>Skill Exchange Problem</option>
                    <option>Payment Issue</option>
                    <option>Feature Request</option>
                    <option>Bug Report</option>
                    <option>Safety Concern</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option>Low - General inquiry</option>
                    <option>Medium - Non-urgent issue</option>
                    <option>High - Urgent problem</option>
                    <option>Critical - Platform blocking issue</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea rows={5} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Please provide detailed information about your issue, including steps to reproduce if applicable..."></textarea>
                </div>
                <div className="flex items-center space-x-3">
                  <input type="checkbox" id="urgent" className="rounded text-indigo-600" />
                  <label htmlFor="urgent" className="text-sm text-gray-600">This is an urgent matter that affects my ability to use SkillSwap</label>
                </div>
                <div className="flex items-center space-x-3">
                  <input type="checkbox" id="youtube" className="rounded text-indigo-600" />
                  <label htmlFor="youtube" className="text-sm text-gray-600">
                    I have checked the 
                    <a href="https://www.youtube.com/@SkillSwap-n4r" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 underline mx-1">
                      YouTube channel
                    </a>
                    for video solutions
                  </label>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                    Submit Ticket
                  </button>
                  <button type="reset" className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    Clear Form
                  </button>
                </div>
              </form>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">📧 What happens next?</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• You'll receive an email confirmation with your ticket number</li>
                  <li>• Our team will respond within 24-48 hours</li>
                  <li>• Urgent issues are prioritized and addressed faster</li>
                  <li>• You can reply to the email to add more information</li>
                  <li>• Check our YouTube channel for instant video solutions while you wait!</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Bottom CTA for YouTube */}
        <div className="mt-12 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Need Instant Help?</h3>
          <p className="mb-6 opacity-90">
            Don't wait for email responses! Get instant visual solutions on our YouTube channel.
          </p>
          <a 
            href="https://www.youtube.com/@SkillSwap-n4r" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-white text-red-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span>Visit SkillSwap YouTube</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Support;
