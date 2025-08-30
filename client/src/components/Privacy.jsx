import React, { useState } from 'react';

const Privacy = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = {
    'overview': 'Overview',
    'collection': 'Data Collection',
    'usage': 'How We Use Data',
    'sharing': 'Data Sharing',
    'security': 'Security',
    'rights': 'Your Rights',
    'contact': 'Contact Us'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <br></br>
      <br></br>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-indigo-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600">
            Last updated: August 30, 2025 • Effective Date: September 1, 2025
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h3 className="font-semibold text-gray-800 mb-4">Quick Navigation</h3>
              <nav className="space-y-2">
                {Object.entries(sections).map(([key, title]) => (
                  <button
                    key={key}
                    onClick={() => setActiveSection(key)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors text-sm ${
                      activeSection === key
                        ? 'bg-indigo-100 text-indigo-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              
              {/* OVERVIEW SECTION */}
              {activeSection === 'overview' && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">Privacy Overview</h2>
                  
                  <div className="bg-indigo-50 border-l-4 border-indigo-400 p-6 rounded mb-8">
                    <h3 className="font-semibold text-indigo-800 mb-3">🛡️ Your Privacy Matters</h3>
                    <p className="text-indigo-700">
                      At SkillSwap, we're committed to protecting your privacy and giving you control over your personal information. 
                      This policy explains how we collect, use, and safeguard your data.
                    </p>
                  </div>

                  <div className="space-y-8">
                    <section>
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Key Privacy Principles</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-4 bg-green-50 rounded-lg">
                          <h4 className="font-medium text-green-800 mb-2">🎯 Purpose Limitation</h4>
                          <p className="text-sm text-green-700">We only collect data that's necessary for providing our skill-swapping service.</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-800 mb-2">🔒 Data Minimization</h4>
                          <p className="text-sm text-blue-700">We collect the least amount of personal information required to operate effectively.</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <h4 className="font-medium text-purple-800 mb-2">⏰ Retention Limits</h4>
                          <p className="text-sm text-purple-700">We only keep your data as long as necessary to provide our services.</p>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-lg">
                          <h4 className="font-medium text-orange-800 mb-2">🔄 Transparency</h4>
                          <p className="text-sm text-orange-700">We're clear about what data we collect and how we use it.</p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h3>
                      <div className="p-6 bg-indigo-50 rounded-lg">
                        <p className="text-indigo-800 font-medium">
                          📧 Privacy Questions: <a href="mailto:skillswapskill@gmail.com" className="underline">skillswapskill@gmail.com</a>
                        </p>
                        <p className="text-indigo-700 text-sm mt-2">
                          We typically respond within 48 hours
                        </p>
                      </div>
                    </section>
                  </div>
                </div>
              )}

              {/* DATA COLLECTION SECTION */}
              {activeSection === 'collection' && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">Data We Collect</h2>
                  
                  <div className="space-y-8">
                    <section>
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Information You Provide</h3>
                      <div className="space-y-6">
                        <div className="p-6 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-800 mb-3">👤 Profile Information</h4>
                          <ul className="list-disc list-inside space-y-1 text-blue-700 text-sm">
                            <li>Name, email address, and profile photo</li>
                            <li>Skills, expertise levels, and learning interests</li>
                            <li>Location and availability preferences</li>
                            <li>Bio and personal descriptions</li>
                            <li>Language preferences</li>
                          </ul>
                        </div>
                        
                        <div className="p-6 bg-green-50 rounded-lg">
                          <h4 className="font-medium text-green-800 mb-3">💬 Communication Data</h4>
                          <ul className="list-disc list-inside space-y-1 text-green-700 text-sm">
                            <li>Messages sent through our platform</li>
                            <li>Skill exchange session notes and feedback</li>
                            <li>Support ticket communications</li>
                            <li>Community forum posts and comments</li>
                          </ul>
                        </div>

                        <div className="p-6 bg-purple-50 rounded-lg">
                          <h4 className="font-medium text-purple-800 mb-3">💳 Payment & Credits Information</h4>
                          <ul className="list-disc list-inside space-y-1 text-purple-700 text-sm">
                            <li>Credit purchase transactions</li>
                            <li>SkillCoin redemption requests</li>
                            <li>Payment method details (encrypted)</li>
                            <li>Transaction history and receipts</li>
                          </ul>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Automatically Collected Data</h3>
                      <div className="p-6 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-3">🔧 Technical Information</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                          <li>Device information (type, operating system, browser)</li>
                          <li>IP address and general location data</li>
                          <li>Usage patterns and feature interactions</li>
                          <li>Session duration and frequency</li>
                          <li>Crash reports and error logs</li>
                        </ul>
                      </div>
                    </section>
                  </div>
                </div>
              )}

              {/* HOW WE USE DATA SECTION */}
              {activeSection === 'usage' && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">How We Use Your Data</h2>
                  
                  <div className="space-y-8">
                    <section>
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Primary Uses</h3>
                      <div className="space-y-6">
                        <div className="p-6 bg-indigo-50 rounded-lg">
                          <h4 className="font-medium text-indigo-800 mb-3">🎯 Platform Operations</h4>
                          <ul className="list-disc list-inside space-y-1 text-indigo-700 text-sm">
                            <li>Create and manage your account</li>
                            <li>Match you with suitable skill exchange partners</li>
                            <li>Facilitate communication and skill sessions</li>
                            <li>Process credit transactions and SkillCoin redemptions</li>
                            <li>Provide customer support</li>
                          </ul>
                        </div>

                        <div className="p-6 bg-green-50 rounded-lg">
                          <h4 className="font-medium text-green-800 mb-3">🛠️ Service Improvement</h4>
                          <ul className="list-disc list-inside space-y-1 text-green-700 text-sm">
                            <li>Analyze usage patterns to improve features</li>
                            <li>Develop new tools and functionality</li>
                            <li>Optimize search and matching algorithms</li>
                            <li>Enhance user experience and interface</li>
                            <li>Prevent fraud and ensure platform security</li>
                          </ul>
                        </div>

                        <div className="p-6 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-800 mb-3">💬 Communication</h4>
                          <ul className="list-disc list-inside space-y-1 text-blue-700 text-sm">
                            <li>Send important platform updates and notifications</li>
                            <li>Provide customer support and assistance</li>
                            <li>Share community news and events</li>
                            <li>Deliver personalized skill recommendations</li>
                            <li>Send marketing communications (with consent)</li>
                          </ul>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Legal Basis for Processing</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border border-gray-200 rounded-lg">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-800">Purpose</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-800">Legal Basis</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            <tr>
                              <td className="px-4 py-3 text-sm text-gray-600">Platform service delivery</td>
                              <td className="px-4 py-3 text-sm text-gray-600">Contract performance</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 text-sm text-gray-600">Safety and security</td>
                              <td className="px-4 py-3 text-sm text-gray-600">Legitimate interest</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 text-sm text-gray-600">Marketing communications</td>
                              <td className="px-4 py-3 text-sm text-gray-600">Consent</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 text-sm text-gray-600">Legal compliance</td>
                              <td className="px-4 py-3 text-sm text-gray-600">Legal obligation</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </section>
                  </div>
                </div>
              )}

              {/* DATA SHARING SECTION */}
              {activeSection === 'sharing' && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">Data Sharing & Disclosure</h2>
                  
                  <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded mb-8">
                    <h3 className="font-semibold text-green-800 mb-2">🔒 Our Commitment</h3>
                    <p className="text-green-700">
                      We do not sell, rent, or trade your personal information to third parties for marketing purposes. 
                      Your data is shared only in specific circumstances outlined below.
                    </p>
                  </div>

                  <div className="space-y-8">
                    <section>
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">When We Share Data</h3>
                      
                      <div className="space-y-6">
                        <div className="p-6 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-800 mb-3">👥 Other SkillSwap Users</h4>
                          <p className="text-blue-700 text-sm mb-3">Information visible to other users:</p>
                          <ul className="list-disc list-inside space-y-1 text-blue-700 text-sm">
                            <li>Public profile information (name, photo, bio, skills)</li>
                            <li>Ratings and reviews (anonymous to reviewers)</li>
                            <li>Community forum posts and comments</li>
                            <li>Skill exchange history (basic statistics only)</li>
                          </ul>
                        </div>

                        <div className="p-6 bg-purple-50 rounded-lg">
                          <h4 className="font-medium text-purple-800 mb-3">🔧 Service Providers</h4>
                          <p className="text-purple-700 text-sm mb-3">Trusted partners who help us operate:</p>
                          <ul className="list-disc list-inside space-y-1 text-purple-700 text-sm">
                            <li>Cloud hosting and data storage providers</li>
                            <li>Payment processing services</li>
                            <li>Email and communication services</li>
                            <li>Analytics and performance monitoring tools</li>
                            <li>Customer support platforms</li>
                          </ul>
                        </div>

                        <div className="p-6 bg-orange-50 rounded-lg">
                          <h4 className="font-medium text-orange-800 mb-3">⚖️ Legal Requirements</h4>
                          <p className="text-orange-700 text-sm mb-3">We may disclose data when required to:</p>
                          <ul className="list-disc list-inside space-y-1 text-orange-700 text-sm">
                            <li>Comply with legal obligations or court orders</li>
                            <li>Protect our rights and property</li>
                            <li>Ensure user safety and platform security</li>
                            <li>Prevent fraud or illegal activities</li>
                            <li>Respond to government requests</li>
                          </ul>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Data Transfer Safeguards</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <h4 className="font-medium text-gray-800 mb-2">🛡️ Encryption</h4>
                          <p className="text-sm text-gray-600">All data transfers use industry-standard encryption</p>
                        </div>
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <h4 className="font-medium text-gray-800 mb-2">📋 Contracts</h4>
                          <p className="text-sm text-gray-600">Service providers bound by strict data protection agreements</p>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              )}

              {/* SECURITY SECTION */}
              {activeSection === 'security' && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">Data Security</h2>
                  
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded mb-8">
                    <h3 className="font-semibold text-blue-800 mb-2">🔐 Security First</h3>
                    <p className="text-blue-700">
                      We implement comprehensive security measures to protect your personal information against 
                      unauthorized access, alteration, disclosure, or destruction.
                    </p>
                  </div>

                  <div className="space-y-8">
                    <section>
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Technical Safeguards</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 bg-green-50 rounded-lg">
                          <h4 className="font-medium text-green-800 mb-3">🔒 Encryption</h4>
                          <ul className="list-disc list-inside space-y-1 text-green-700 text-sm">
                            <li>AES-256 encryption for data at rest</li>
                            <li>TLS 1.3 for data in transit</li>
                            <li>End-to-end encryption for sensitive communications</li>
                            <li>Encrypted backups and archives</li>
                          </ul>
                        </div>

                        <div className="p-6 bg-purple-50 rounded-lg">
                          <h4 className="font-medium text-purple-800 mb-3">🛡️ Access Controls</h4>
                          <ul className="list-disc list-inside space-y-1 text-purple-700 text-sm">
                            <li>Multi-factor authentication for admin access</li>
                            <li>Role-based access permissions</li>
                            <li>Regular access reviews and audits</li>
                            <li>Automated access logging and monitoring</li>
                          </ul>
                        </div>

                        <div className="p-6 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-800 mb-3">🔍 Monitoring</h4>
                          <ul className="list-disc list-inside space-y-1 text-blue-700 text-sm">
                            <li>24/7 security monitoring and alerting</li>
                            <li>Intrusion detection and prevention systems</li>
                            <li>Regular vulnerability assessments</li>
                            <li>Automated threat detection</li>
                          </ul>
                        </div>

                        <div className="p-6 bg-orange-50 rounded-lg">
                          <h4 className="font-medium text-orange-800 mb-3">🏢 Infrastructure</h4>
                          <ul className="list-disc list-inside space-y-1 text-orange-700 text-sm">
                            <li>Secure, certified data centers</li>
                            <li>Redundant systems and backup procedures</li>
                            <li>Physical security controls</li>
                            <li>Disaster recovery planning</li>
                          </ul>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Data Breach Response</h3>
                      <p className="text-gray-600 mb-4">In the unlikely event of a data breach, we will:</p>
                      <ol className="list-decimal list-inside space-y-2 text-gray-600">
                        <li>Contain the breach and assess the risk within 24 hours</li>
                        <li>Notify affected users within 72 hours</li>
                        <li>Report to relevant authorities as required by law</li>
                        <li>Provide clear information about what data was affected</li>
                        <li>Offer appropriate support and remediation</li>
                        <li>Conduct thorough investigation and implement improvements</li>
                      </ol>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Role in Security</h3>
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded">
                        <h4 className="font-medium text-yellow-800 mb-3">🤝 Shared Responsibility</h4>
                        <p className="text-yellow-700 text-sm mb-3">Help keep your account secure by:</p>
                        <ul className="list-disc list-inside space-y-1 text-yellow-700 text-sm">
                          <li>Using a strong, unique password</li>
                          <li>Enabling two-factor authentication when available</li>
                          <li>Logging out from shared devices</li>
                          <li>Reporting suspicious activity immediately</li>
                          <li>Keeping your contact information up to date</li>
                        </ul>
                      </div>
                    </section>
                  </div>
                </div>
              )}

              {/* YOUR RIGHTS SECTION */}
              {activeSection === 'rights' && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">Your Privacy Rights</h2>
                  
                  <div className="bg-indigo-50 border-l-4 border-indigo-400 p-6 rounded mb-8">
                    <h3 className="font-semibold text-indigo-800 mb-2">✊ Your Data, Your Rights</h3>
                    <p className="text-indigo-700">
                      You have important rights regarding your personal data. Contact us at skillswapskill@gmail.com to exercise any of these rights.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-6 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-3">👁️ Access Your Data</h4>
                        <p className="text-blue-700 text-sm">Request a copy of all personal data we have about you</p>
                      </div>
                      <div className="p-6 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-800 mb-3">✏️ Correct Your Data</h4>
                        <p className="text-green-700 text-sm">Update or correct any inaccurate information</p>
                      </div>
                      <div className="p-6 bg-red-50 rounded-lg">
                        <h4 className="font-medium text-red-800 mb-3">🗑️ Delete Your Data</h4>
                        <p className="text-red-700 text-sm">Request complete deletion of your account and data</p>
                      </div>
                      <div className="p-6 bg-purple-50 rounded-lg">
                        <h4 className="font-medium text-purple-800 mb-3">📦 Export Your Data</h4>
                        <p className="text-purple-700 text-sm">Download your data in a portable format</p>
                      </div>
                    </div>

                    <section>
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">How to Exercise Your Rights</h3>
                      <div className="p-6 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-3">📧 Contact Us</h4>
                        <p className="text-blue-700 mb-3">
                          To exercise any of your privacy rights, contact us at:
                        </p>
                        <div className="bg-white p-4 rounded border border-blue-200">
                          <p className="text-blue-800 font-medium">
                            Email: <a href="mailto:skillswapskill@gmail.com" className="underline">skillswapskill@gmail.com</a>
                          </p>
                          <p className="text-blue-700 text-sm mt-1">
                            Subject: Privacy Rights Request
                          </p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Response Timeline</h3>
                      <p className="text-gray-600">
                        We will respond to your privacy requests within 30 days. For complex requests, 
                        we may extend this by an additional 60 days and will notify you of any delay.
                      </p>
                    </section>
                  </div>
                </div>
              )}

              {/* CONTACT US SECTION */}
              {activeSection === 'contact' && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">Contact Us About Privacy</h2>
                  
                  <div className="space-y-8">
                    <div className="p-8 bg-indigo-50 rounded-xl text-center">
                      <h3 className="text-xl font-semibold text-indigo-900 mb-4">Get in Touch</h3>
                      <p className="text-indigo-700 mb-6">
                        Have questions about your privacy or how we handle your data? We're here to help.
                      </p>
                      <div className="space-y-4">
                        <div className="p-4 bg-white rounded-lg">
                          <p className="text-indigo-800 font-medium">
                            📧 <a href="mailto:skillswapskill@gmail.com" className="underline">skillswapskill@gmail.com</a>
                          </p>
                          <p className="text-indigo-600 text-sm">Response time: Within 48 hours</p>
                        </div>
                      </div>
                    </div>

                    <section>
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Types of Privacy Inquiries</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-800 mb-2">🔍 Data Access Requests</h4>
                          <p className="text-sm text-gray-600">Request copies of your personal data</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-800 mb-2">✏️ Data Correction</h4>
                          <p className="text-sm text-gray-600">Update or correct your information</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-800 mb-2">🗑️ Account Deletion</h4>
                          <p className="text-sm text-gray-600">Delete your account and data</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-800 mb-2">❓ General Questions</h4>
                          <p className="text-sm text-gray-600">Ask about our privacy practices</p>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
