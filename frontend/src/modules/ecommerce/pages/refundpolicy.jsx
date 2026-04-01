import React from "react";

const sections = [
  { id: "returns", title: "Return Eligibility" },
  { id: "process", title: "Return Process" },
  { id: "refunds", title: "Refund Policy" },
  { id: "nonreturnable", title: "Non-returnable Items" },
  { id: "damaged", title: "Damaged or Incorrect Items" },
  { id: "shipping", title: "Return Shipping" },
  { id: "contact", title: "Contact Us" },
];

function ReturnPolicy() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-8">

        {/* LEFT SIDEBAR */}
        <div className="md:w-1/4 w-full">
          <div className="sticky top-24 bg-white border rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-4">
              Return Policy
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
            Return & Refund Policy
          </h1>

          {/* 🔥 Clean intro */}
          <p className="text-gray-600 mb-8">
            We aim to provide a smooth shopping experience. This policy explains how returns, replacements, and refunds are handled on our platform.
          </p>

          {/* Sections */}

          <section id="returns" className="mb-8 scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Return Eligibility</h2>
            <ul className="list-disc ml-5 text-gray-600 space-y-1">
              <li>Returns are accepted within 7 days from the date of delivery.</li>
              <li>Items must be unused, undamaged, and in original packaging.</li>
              <li>Original invoice or proof of purchase is required.</li>
              <li>Products showing signs of use may not be eligible for return.</li>
            </ul>
          </section>

          <section id="process" className="mb-8 scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Return Process</h2>
            <p className="text-gray-600">
              To initiate a return, please contact our support team with your order details. Once your request is approved, you will receive instructions for returning the product. Items sent without prior approval may not be accepted.
            </p>
          </section>

          <section id="refunds" className="mb-8 scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Refund Policy</h2>
            <p className="text-gray-600">
              After receiving and inspecting the returned item, refunds will be processed to the original payment method. The refund may take 5–7 business days to reflect, depending on your bank or payment provider.
            </p>
          </section>

          <section id="nonreturnable" className="mb-8 scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Non-returnable Items</h2>
            <ul className="list-disc ml-5 text-gray-600 space-y-1">
              <li>Perishable goods (e.g., food, supplements)</li>
              <li>Personal care or hygiene products</li>
              <li>Customized or personalized items</li>
              <li>Items marked as non-returnable on the product page</li>
            </ul>
          </section>

          <section id="damaged" className="mb-8 scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Damaged or Incorrect Items</h2>
            <p className="text-gray-600">
              If you receive a damaged, defective, or incorrect product, please notify us within 48 hours of delivery. We will arrange a replacement or refund after verifying the issue.
            </p>
          </section>

          <section id="shipping" className="mb-8 scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Return Shipping</h2>
            <p className="text-gray-600">
              Return shipping charges may apply unless the return is due to an error from our side (such as damaged or incorrect items). In such cases, we will bear the return shipping cost.
            </p>
          </section>

          <section id="contact" className="scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Contact Us</h2>
            <p className="text-gray-600">
              For any return or refund queries, please contact our support team:
              <br />
              Email: support@yourstore.com
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}

export default ReturnPolicy;