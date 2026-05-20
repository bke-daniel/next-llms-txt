// eslint-disable-next-line prefer-const
let id = 'demo'
export const metadata = {
  // Template-literal title with an interpolation — should round-trip as
  // `Page ${id}` (P2 #29), not silently drop the substitution.
  title: `Page ${id}`,
  description: 'Template-literal title fixture',
}
export default function TemplateTitle() {
  return null
}
