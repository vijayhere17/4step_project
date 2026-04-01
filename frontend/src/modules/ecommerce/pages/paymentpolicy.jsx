import React from "react";

const sections = [
  { id: "gateway", title: "Payment Methods" },
  { id: "processing", title: "Payment Processing" },
  { id: "security", title: "Security & Protection" },
  { id: "failure", title: "Failed Transactions" },
  { id: "refunds", title: "Refunds" },
  { id: "charges", title: "Charges & Fees" },
  { id: "confirmation", title: "Payment Confirmation" },
  { id: "fraud", title: "Fraud Prevention" },
  { id: "compliance", title: "Compliance" },
  { id: "contact", title: "Contact Us" },
];

function PaymentPolicy() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-8">

        {/* LEFT SIDEBAR */}
        <div className="md:w-1/4 w-full">
          <div className="sticky top-24 bg-white border rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-4">
              Payment Policy
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
            Payment Policy
          </h1>

          {/* 🔥 Clean intro */}
          <p className="text-gray-600 mb-8">
            This Payment Policy explains how payments are processed on our platform, including accepted methods, security practices, and refund handling.
          </p>

          {/* Sections */}

          <section id="gateway" className="mb-8 scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Payment Methods</h2>
            <ul className="list-disc ml-5 text-gray-600 space-y-1">
              <li>Credit / Debit Cards (Visa, MasterCard, etc.)</li>
              <li>UPI (Google Pay, PhonePe, Paytm, etc.)</li>
              <li>Net Banking</li>
              <li>Digital Wallets</li>
            </ul>
          </section>

          <section id="processing" className="mb-8 scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Payment Processing</h2>
            <p className="text-gray-600">
              All payments are securely processed through trusted third-party payment providers. We do not store your card or payment details on our servers. Orders are confirmed only after successful payment authorization.
            </p>
          </section>

          <section id="security" className="mb-8 scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Security & Protection</h2>
            <p className="text-gray-600">
              We use industry-standard encryption (SSL) to ensure secure transactions. Sensitive payment data is handled directly by certified payment gateways, ensuring maximum protection.
            </p>
          </section>

          <section id="failure" className="mb-8 scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Failed Transactions</h2>
            <p className="text-gray-600">
              If a transaction fails but the amount is deducted, the amount is automatically refunded by your payment provider. This process may take 5–7 business days depending on your bank.
            </p>
          </section>

          <section id="refunds" className="mb-8 scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Refunds</h2>
            <p className="text-gray-600">
              Refunds are processed as per our Return & Refund Policy. Once approved, the amount will be credited back to your original payment method within a few business days.
            </p>
          </section>

          <section id="charges" className="mb-8 scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Charges & Fees</h2>
            <p className="text-gray-600">
              Any applicable charges, including taxes or payment processing fees, will be clearly displayed during checkout. We ensure transparency in all transactions.
            </p>
          </section>

          <section id="confirmation" className="mb-8 scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Payment Confirmation</h2>
            <p className="text-gray-600">
              Once your payment is successful, you will receive an order confirmation via email or SMS. Please ensure your contact details are accurate.
            </p>
          </section>

          <section id="fraud" className="mb-8 scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Fraud Prevention</h2>
            <p className="text-gray-600">
              We reserve the right to cancel or hold any order if suspicious or fraudulent activity is detected. Additional verification may be required in such cases.
            </p>
          </section>

          <section id="compliance" className="mb-8 scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Compliance</h2>
            <p className="text-gray-600">
              All payment transactions comply with applicable laws and regulations, including RBI guidelines where applicable.
            </p>
          </section>

          <section id="contact" className="scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Contact Us</h2>
            <p className="text-gray-600">
              For any payment-related queries, please contact us:
              <br />
              Email: support@yourstore.com
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}

export default PaymentPolicy;