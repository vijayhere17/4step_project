import React from "react";

const sections = [
  { id: "eligibility", title: "Eligibility" },
  { id: "account", title: "Account & Registration" },
  { id: "products", title: "Products & Pricing" },
  { id: "orders", title: "Orders & Payments" },
  { id: "shipping", title: "Shipping & Delivery" },
  { id: "returns", title: "Return & Refund Policy" },
  { id: "ip", title: "Intellectual Property" },
  { id: "prohibited", title: "Prohibited Activities" },
  { id: "liability", title: "Limitation of Liability" },
  { id: "privacy", title: "Privacy Policy" },
  { id: "changes", title: "Changes to Terms" },
  { id: "contact", title: "Contact Us" },
];

function Terms() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-8">

        {/* LEFT SIDEBAR */}
        <div className="md:w-1/4 w-full">
          <div className="sticky top-24 bg-white border rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-4">
              Terms & Conditions
            </h2>
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

        {/* RIGHT CONTENT */}
        <div className="md:w-3/4 w-full bg-white p-6 md:p-10 rounded-xl border">
          <h1 className="text-3xl font-bold mb-3">
            Terms & Conditions
          </h1>

          {/* 🔥 Clean intro line */}
          <p className="text-gray-600 mb-8">
            By accessing or using our website, you agree to comply with the following terms and conditions.
          </p>

          {/* Sections */}

          <section id="eligibility" className="mb-8 scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Eligibility</h2>
            <p className="text-gray-600">
              You must be at least 18 years old or accessing the platform under the supervision of a parent or guardian. You agree to provide accurate and complete information.
            </p>
          </section>

          <section id="account" className="mb-8 scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Account & Registration</h2>
            <ul className="list-disc ml-5 text-gray-600 space-y-1">
              <li>You are responsible for maintaining account confidentiality.</li>
              <li>All activities under your account are your responsibility.</li>
              <li>Accounts may be suspended in case of misuse.</li>
            </ul>
          </section>

          <section id="products" className="mb-8 scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Products & Pricing</h2>
            <p className="text-gray-600">
              Products are subject to availability. Prices and descriptions may change without notice. Errors may occur and will be corrected when identified.
            </p>
          </section>

          <section id="orders" className="mb-8 scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Orders & Payments</h2>
            <p className="text-gray-600">
              Orders are confirmed only after successful payment. We may cancel orders due to errors, stock issues, or suspicious activity. Payments are processed securely via trusted providers.
            </p>
          </section>

          <section id="shipping" className="mb-8 scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Shipping & Delivery</h2>
            <p className="text-gray-600">
              Delivery timelines are estimates and may vary. We are not responsible for delays caused by logistics partners or external factors.
            </p>
          </section>

          <section id="returns" className="mb-8 scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Return & Refund Policy</h2>
            <p className="text-gray-600">
              Returns and refunds are handled according to our Return Policy. Items must be unused and returned within the specified period.
            </p>
          </section>

          <section id="ip" className="mb-8 scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Intellectual Property</h2>
            <p className="text-gray-600">
              All website content is owned by the company and protected by applicable laws. Unauthorized use is prohibited.
            </p>
          </section>

          <section id="prohibited" className="mb-8 scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Prohibited Activities</h2>
            <ul className="list-disc ml-5 text-gray-600 space-y-1">
              <li>Illegal use of the website</li>
              <li>Attempting unauthorized access</li>
              <li>Disrupting services</li>
              <li>Copying or misusing content</li>
            </ul>
          </section>

          <section id="liability" className="mb-8 scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Limitation of Liability</h2>
            <p className="text-gray-600">
              We are not liable for indirect or incidental damages arising from website usage or service interruptions.
            </p>
          </section>

          <section id="privacy" className="mb-8 scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Privacy Policy</h2>
            <p className="text-gray-600">
              Your use of the website is also governed by our Privacy Policy.
            </p>
          </section>

          <section id="changes" className="mb-8 scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Changes to Terms</h2>
            <p className="text-gray-600">
              We may update these terms at any time. Continued use of the website means you accept the changes.
            </p>
          </section>

          <section id="contact" className="scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Contact Us</h2>
            <p className="text-gray-600">
              Email: support@yourstore.com
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}

export default Terms;