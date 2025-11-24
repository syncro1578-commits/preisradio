import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PrixRadio - Comparateur de Prix Allemand',
  description: 'Comparez les prix des produits allemands',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body>
        <header className="bg-blue-600 text-white p-4">
          <div className="container mx-auto">
            <h1 className="text-3xl font-bold">PrixRadio</h1>
            <p className="text-blue-100">Comparateur de Prix Allemand</p>
          </div>
        </header>
        <main className="container mx-auto py-8">
          {children}
        </main>
        <footer className="bg-gray-800 text-white p-4 mt-12">
          <div className="container mx-auto text-center">
            <p>&copy; 2024 PrixRadio. Tous droits réservés.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
