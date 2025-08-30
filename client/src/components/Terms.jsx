import React from 'react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <br></br>
      <br></br>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-indigo-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600">
            Last updated: August 30, 2025
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                By accessing and using SkillSwap ("the Service"), you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Description of Service</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                SkillSwap is a platform that connects individuals who wish to exchange skills, knowledge, and expertise. 
                Our service allows users to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                <li>Create profiles showcasing their skills and learning interests</li>
                <li>Search for and connect with other skill-sharing partners</li>
                <li>Engage in skill exchange sessions via various communication methods</li>
                <li>Earn and purchase credits for enhanced platform features</li>
                <li>Redeem credits for SkillCoin cryptocurrency (upon launch)</li>
                <li>Rate and review their skill exchange experiences</li>
                <li>Participate in community discussions and events</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Credit System & SkillCoin</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">3.1 Credits</h3>
                  <p className="text-gray-600 leading-relaxed">
                    SkillSwap operates on a credit-based system where users can earn, purchase, and spend credits for various platform activities. 
                    New users receive 300 bonus credits upon registration to get started.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">3.2 Earning Credits</h3>
                  <p className="text-gray-600 leading-relaxed mb-2">Users can earn credits through:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                    <li>Teaching skills to other users</li>
                    <li>Completing profile verification</li>
                    <li>Participating in community activities</li>
                    <li>Referring new users to the platform</li>
                    <li>Maintaining high ratings and positive reviews</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">3.3 Purchasing Credits</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Users may purchase additional credits through secure payment methods supported by the platform. 
                    All credit purchases are final and non-refundable unless otherwise required by applicable law.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">3.4 SkillCoin Cryptocurrency</h3>
                  <p className="text-gray-600 leading-relaxed">
                    SkillSwap will launch SkillCoin, our native cryptocurrency. Users will be able to redeem their earned credits 
                    for SkillCoins once the cryptocurrency is officially launched. The exchange rate and redemption process will be 
                    announced prior to launch. SkillCoins may have monetary value and be tradeable on cryptocurrency exchanges.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">3.5 Credit Expiration & Limitations</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                    <li>Credits do not expire but may be subject to inactivity policies</li>
                    <li>Credits cannot be transferred between users</li>
                    <li>Credits have no monetary value until redeemed for SkillCoins</li>
                    <li>SkillSwap reserves the right to adjust credit values and exchange rates</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">4. User Responsibilities</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">4.1 Account Security</h3>
                  <p className="text-gray-600 leading-relaxed">
                    You are responsible for maintaining the confidentiality of your account credentials and for all 
                    activities that occur under your account, including credit transactions.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">4.2 Accurate Information</h3>
                  <p className="text-gray-600 leading-relaxed">
                    You agree to provide accurate, current, and complete information about yourself and your skills. 
                    Misrepresentation of abilities or credentials is strictly prohibited and may result in credit forfeiture.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">4.3 Fair Use of Credits</h3>
                  <p className="text-gray-600 leading-relaxed">
                    You agree not to engage in credit manipulation, fraud, or any activities that may artificially 
                    inflate credit earnings. Violation may result in account suspension and credit forfeiture.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Prohibited Uses</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                You may not use SkillSwap for any unlawful purpose. Specifically, you agree not to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                <li>Manipulate the credit system through fraudulent means</li>
                <li>Create multiple accounts to exploit bonus credits</li>
                <li>Use the platform for commercial purposes without explicit permission</li>
                <li>Share inappropriate, offensive, or illegal content</li>
                <li>Attempt to gain unauthorized access to other users' accounts or credits</li>
                <li>Violate any local, state, national, or international law</li>
                <li>Engage in money laundering or other financial crimes through SkillCoins</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Financial Terms</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">6.1 Payment Processing</h3>
                  <p className="text-gray-600 leading-relaxed">
                    All payments for credit purchases are processed through secure by Razorpay. 
                    SkillSwap does not store payment information.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">6.2 Refund Policy</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Credit purchases are generally non-refundable. Refunds may be considered in cases of technical 
                    errors or unauthorized transactions, subject to investigation.
                  </p>
                </div>
                {/* <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">6.3 Tax Responsibilities</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Users are responsible for any tax implications arising from earning, trading, or redeeming 
                    credits and SkillCoins in their jurisdiction.
                  </p>
                </div> */}
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Privacy and Data Protection</h2>
              <p className="text-gray-600 leading-relaxed">
                Your privacy is important to us. Our Privacy Policy, which is incorporated into these Terms by 
                reference, explains how we collect, use, and protect your information, including financial and 
                transaction data.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Disclaimers and Limitation of Liability</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">8.1 Service Availability</h3>
                  <p className="text-gray-600 leading-relaxed">
                    SkillSwap is provided "as is" without warranties. We do not guarantee the value or 
                    exchangeability of credits or SkillCoins.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">8.2 Cryptocurrency Risks</h3>
                  <p className="text-gray-600 leading-relaxed">
                    SkillCoin is a cryptocurrency subject to market volatility. Users acknowledge the risks 
                    associated with cryptocurrency ownership and trading.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">8.3 Financial Liability</h3>
                  <p className="text-gray-600 leading-relaxed">
                    SkillSwap is not liable for any financial losses resulting from credit transactions, 
                    SkillCoin trading, or market fluctuations.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">9. Termination</h2>
              <p className="text-gray-600 leading-relaxed">
                We may terminate or suspend your account and bar access to the Service immediately, without prior 
                notice, for any reason including violation of credit system rules. Upon termination, you may lose 
                access to unused credits, subject to applicable law requirements.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">10. Changes to Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to modify these Terms, including credit system rules and SkillCoin policies, 
                at any time. Material changes will be communicated with at least 30 days notice.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">11. Contact Information</h2>
              <p className="text-gray-600 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                <p className="text-indigo-800 font-medium">
                  📧 Email: <a href="mailto:skillswapskill@gmail.com" className="underline">skillswapskill@gmail.com</a>
                </p>
              </div>
            </section>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                By using SkillSwap, you acknowledge that you have read and understood these Terms of Service 
                and agree to be bound by them, including our credit system and future SkillCoin policies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
