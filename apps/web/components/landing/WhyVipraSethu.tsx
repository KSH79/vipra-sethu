export function WhyVipraSethu() {
  const items = [
    { title: 'Verified', desc: 'Background-checked providers', icon: '🔒' },
    { title: 'Community-Aligned', desc: 'Values match traditions', icon: '🕉️' },
    { title: 'Quality-Focused', desc: 'Experienced professionals', icon: '⭐' },
  ]
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-xl md:text-2xl font-bold text-center mb-6">Why Vipra Sethu</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {items.map((i) => (
            <div key={i.title} className="rounded-xl border bg-white p-4 text-center shadow-sm">
              <div className="text-2xl mb-1" aria-hidden>{i.icon}</div>
              <h3 className="text-base font-semibold">{i.title}</h3>
              <p className="text-sm text-gray-600">{i.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
