import React from "react";

const sections = [
  { id: "info", title: "Information We Collect" },
  { id: "use", title: "How We Use Information" },
  { id: "security", title: "Data Security" },
  { id: "cookies", title: "Cookies" },
  { id: "thirdparty", title: "Third-Party Services" },
  { id: "rights", title: "Your Rights" },
  { id: "retention", title: "Data Retention" },
  { id: "updates", title: "Policy Updates" },
  { id: "contact", title: "Contact Us" },
];

function PrivacyPolicy() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-8">

        {/* Sidebar */}
        <div className="md:w-1/4 w-full">
          <div className="sticky top-24 border rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-4">Privacy Policy</h2>
            <ul className="space-y-2 text-sm">
              {sections.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="text-gray-600 hover:text-blue-600 transition"
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Content */}
        <div className="md:w-3/4 w-full p-6 md:p-10 border rounded-xl">
          <h1 className="text-3xl font-bold mb-3">Privacy Policy</h1>

          {/* 🔥 Clean intro */}
          <p className="text-gray-600 mb-8">
            We are committed to protecting your personal information and ensuring transparency in how your data is collected, used, and safeguarded when you use our website.
          </p>

          {/* Sections */}

          <section id="info" className="mb-8 scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Information We Collect</h2>
            <p className="text-gray-600">
              We collect personal details such as your name, email address, phone number, and shipping information when you place an order or register on our platform. We may also collect order history and transaction details to improve your shopping experience.
            </p>
          </section>

          <section id="use" className="mb-8 scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">How We Use Information</h2>
            <p className="text-gray-600">
              Your information is used to process orders, provide customer support, and improve our services. We may also use it to communicate updates, offers, or important notifications related to your account or purchases.
            </p>
          </section>

          <section id="security" className="mb-8 scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Data Security</h2>
            <p className="text-gray-600">
              We implement industry-standard security measures to protect your data from unauthorized access, misuse, or disclosure. Payment details are securely handled by certified payment providers and are not stored on our servers.
            </p>
          </section>

          <section id="cookies" className="mb-8 scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Cookies</h2>
            <p className="text-gray-600">
              Cookies are used to enhance your browsing experience, remember preferences, and analyze website traffic. You can manage or disable cookies through your browser settings if you prefer.
            </p>
          </section>

          <section id="thirdparty" className="mb-8 scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Third-Party Services</h2>
            <p className="text-gray-600">
              We may share necessary information with trusted third-party services such as payment gateways and delivery partners to complete transactions and fulfill orders. These providers are obligated to protect your data.
            </p>
          </section>

          <section id="rights" className="mb-8 scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Your Rights</h2>
            <p className="text-gray-600">
              You have the right to access, update, or request deletion of your personal information. If you wish to exercise these rights, you may contact our support team at any time.
            </p>
          </section>

          <section id="retention" className="mb-8 scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Data Retention</h2>
            <p className="text-gray-600">
              We retain your personal information only for as long as necessary to fulfill orders, comply with legal obligations, and improve our services. Once no longer required, data is securely deleted or anonymized.
            </p>
          </section>

          <section id="updates" className="mb-8 scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Policy Updates</h2>
            <p className="text-gray-600">
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. Continued use of the website indicates your acceptance of the updated policy.
            </p>
          </section>

          <section id="contact" className="scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Contact Us</h2>
            <p className="text-gray-600">
              If you have any questions about this Privacy Policy or how your data is handled, please contact us:
              <br />
              Email: support@yourstore.com
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;