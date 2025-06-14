import React from "react";

function Business() {
  return (
    <div className="min-h-screen bg-white text-gray-800 p-20">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-600">
            Partner With SkillSwap
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Build the future of learning, collaboration, and innovation with us.
          </p>
        </section>

        {/* About Business Section */}
        <section className="grid md:grid-cols-2 gap-12 mb-16 items-center">
          <div>
            <h2 className="text-2xl font-semibold mb-4">What We Offer</h2>
            <ul className="space-y-3 text-gray-700">
              <li>✅ Custom branding and white-labeled platforms</li>
              <li>✅ Real-time collaboration tools</li>
              <li>✅ Scalable infrastructure for large teams</li>
              <li>✅ Analytics & performance dashboards</li>
              <li>✅ Seamless API integrations and support</li>
            </ul>
          </div>
          <img
            src="https://images.pexels.com/photos/3760069/pexels-photo-3760069.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="Business collaboration"
            className="w-84 h-84 rounded-2xl"
          />
        </section>

        {/* Use Cases */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Perfect For
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="p-6 shadow-md rounded-xl border">
              <h3 className="text-lg font-bold text-blue-500">Startups</h3>
              <p className="text-gray-600 mt-2">
                Accelerate onboarding, collaboration, and team training.
              </p>
            </div>
            <div className="p-6 shadow-md rounded-xl border">
              <h3 className="text-lg font-bold text-blue-500">
                Educational Institutions
              </h3>
              <p className="text-gray-600 mt-2">
                Enable peer-to-peer learning in an innovative ecosystem.
              </p>
            </div>
            <div className="p-6 shadow-md rounded-xl border">
              <h3 className="text-lg font-bold text-blue-500">
                Enterprise Teams
              </h3>
              <p className="text-gray-600 mt-2">
                Streamline learning and performance metrics at scale.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center mt-16">
          <h2 className="text-2xl font-semibold">Let’s Build Together</h2>
          <p className="mt-2 text-gray-600">
            Partner with us to reshape the future of skill exchange and talent
            development.
          </p>
          <a
            href="mailto:skillswapskill@gmail.com"
            target="_blank"

            className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition duration-300"
          >
            Contact Us
          </a>
        </section>
      </div>
    </div>
  );
}

export default Business;
