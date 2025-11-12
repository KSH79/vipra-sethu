export function OurValues() {
  const values = [
    'Trust through verification',
    'Respect for tradition',
    'Community first',
  ]
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Our Values</h2>
        <ul className="max-w-2xl mx-auto list-disc list-inside text-gray-700 space-y-2">
          {values.map(v => (<li key={v}>{v}</li>))}
        </ul>
      </div>
    </section>
  )
}
