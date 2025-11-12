export function HowItWorks() {
  const steps = [
    { title: 'Browse verified providers', icon: '🔍' },
    { title: 'Connect via WhatsApp/Call', icon: '📱' },
    { title: 'Book your ritual or event', icon: '📅' },
  ]
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s, idx) => (
            <div key={idx} className="rounded-xl border bg-white p-6 text-center shadow-sm">
              <div className="text-3xl mb-2" aria-hidden>{s.icon}</div>
              <p className="text-sm text-gray-700">{s.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
