import LabBox from '../components/LabBox'
import EnhancedLabBox from '../components/EnhancedLabBox'
import PhETEmbed from '../components/PhETEmbed'

export default function LabPage() {
  const demoSrc = 'https://phet.colorado.edu/sims/html/states-of-matter-basics/latest/states-of-matter-basics_en.html'

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Lab Sandbox Demo</h1>
      <EnhancedLabBox />

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Legacy LabBox (simple demo)</h3>
        <LabBox />
      </div>

      <PhETEmbed src={demoSrc} title="PhET: States of Matter (Demo)" />
    </main>
  )
}
