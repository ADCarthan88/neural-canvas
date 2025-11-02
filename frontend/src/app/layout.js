import ErrorBoundary from '../components/ErrorBoundary'

export const metadata = {
  title: 'Neural Canvas - AI-Powered Art Platform',
  description: 'Revolutionary AI-powered neural canvas with voice control, ASL recognition, and DALL-E integration',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body style={{ 
        margin: 0, 
        padding: 0, 
        backgroundColor: '#000', 
        color: '#fff', 
        fontFamily: 'system-ui',
        overflow: 'hidden',
        touchAction: 'manipulation'
      }}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}