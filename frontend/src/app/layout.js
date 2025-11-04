export const metadata = {
  title: 'Neural Canvas - AI-Powered Art Platform',
  description: 'Revolutionary AI-powered neural canvas',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ 
        margin: 0, 
        padding: 0, 
        backgroundColor: '#000', 
        color: '#fff', 
        fontFamily: 'system-ui',
        overflow: 'hidden'
      }}>
        {children}
      </body>
    </html>
  )
}