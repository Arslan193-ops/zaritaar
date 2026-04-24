export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-black selection:text-white">
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-24 animate-in fade-in duration-700">
        
        {/* Header */}
        <div className="mb-20">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-8 h-[1px] bg-[#D4AF37]" />
            <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.4em]">Legal</p>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-gray-400 mt-4 font-medium uppercase tracking-widest">Effective Date: April 24, 2026</p>
        </div>

        <div className="prose prose-neutral max-w-none space-y-12">
          <section className="space-y-4">
            <h2 className="text-xl font-serif text-gray-900 italic">01. Overview</h2>
            <p className="text-gray-500 leading-relaxed text-sm">
              At Zaritaar, we respect your privacy and are committed to protecting your personal data. This policy outlines how we handle your information when you visit our boutique or make a purchase.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-serif text-gray-900 italic">02. Information We Collect</h2>
            <p className="text-gray-500 leading-relaxed text-sm">
              To provide a seamless boutique experience, we collect necessary information such as your name, contact details, shipping address, and payment information during the checkout process.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-serif text-gray-900 italic">03. Usage of Data</h2>
            <p className="text-gray-500 leading-relaxed text-sm">
              Your data is primarily used to process your orders, provide customer support, and, with your consent, share updates about our new collections and exclusive offers.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-serif text-gray-900 italic">04. Data Security</h2>
            <p className="text-gray-500 leading-relaxed text-sm">
              We implement industry-standard encryption (SSL) to protect your transaction details. Your sensitive data is handled with the highest level of care in our secure digital atelier.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-serif text-gray-900 italic">05. Contact Us</h2>
            <p className="text-gray-500 leading-relaxed text-sm">
              For any inquiries regarding your privacy or to request data deletion, please contact our support team at <span className="font-bold text-gray-900">contact@zaritaar.com</span>.
            </p>
          </section>
        </div>

      </main>
    </div>
  )
}
