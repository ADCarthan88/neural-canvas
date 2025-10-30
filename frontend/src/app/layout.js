import './globals.css'

export const metadata = {
  title: 'Neural Canvas - Revolutionary AI Art Platform',
  description: 'Experience the future of digital art with AI-powered neural networks, quantum field visualization, and real-time collaboration.',
  keywords: 'AI art, neural networks, digital canvas, quantum visualization, WebGL, Three.js',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-black overflow-hidden">
        {children}
      </body>
    </html>
  )
}