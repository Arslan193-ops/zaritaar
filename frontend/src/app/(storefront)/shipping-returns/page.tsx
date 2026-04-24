export default function ShippingReturnsPage() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-black selection:text-white">
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-24 animate-in fade-in duration-700">
        
        {/* Header */}
        <div className="mb-20">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-8 h-[1px] bg-[#D4AF37]" />
            <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.4em]">Logistics</p>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 tracking-tight">Shipping & Returns</h1>
        </div>

        <div className="prose prose-neutral max-w-none space-y-12">
          <section className="space-y-4">
            <h2 className="text-xl font-serif text-gray-900 italic">01. Complimentary Shipping</h2>
            <p className="text-gray-500 leading-relaxed text-sm">
              Zaritaar offers complimentary standard shipping on all orders within Pakistan. Each piece is meticulously packed in our signature boutique packaging to ensure it reaches you in perfect condition.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-serif text-gray-900 italic">02. Dispatch Timeline</h2>
            <p className="text-gray-500 leading-relaxed text-sm">
              Standard orders are typically dispatched within 3-5 business days. For handcrafted bridal and couture pieces, please allow 4-6 weeks for delivery as each item is made to order in our atelier.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-serif text-gray-900 italic">03. Return Policy</h2>
            <p className="text-gray-500 leading-relaxed text-sm">
              Due to the delicate nature of our handcrafted garments, we only accept returns for items that are defective or damaged upon arrival. Notification must be sent within 48 hours of receipt.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-serif text-gray-900 italic">04. Non-Returnable Items</h2>
            <p className="text-gray-500 leading-relaxed text-sm">
              Please note that custom-sized garments, items purchased during sales, and intimate wear are non-returnable and non-exchangeable.
            </p>
          </section>

          <section className="space-y-4">
             <h2 className="text-xl font-serif text-gray-900 italic">05. Support</h2>
             <p className="text-gray-500 leading-relaxed text-sm">
               Should you have any questions regarding your shipment, please contact our concierge at <span className="font-bold text-gray-900">contact@zaritaar.com</span>.
             </p>
          </section>
        </div>

      </main>
    </div>
  )
}
