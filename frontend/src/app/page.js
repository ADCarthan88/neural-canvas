import './animations.css';

export default function Home() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      color: 'white'
    }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '1rem', fontWeight: 'bold' }}>
        🧠 Neural Canvas
      </h1>
      <p style={{ fontSize: '1.5rem', opacity: 0.9 }}>
        Revolutionary AI-powered neural canvas
      </p>
      <div style={{ maxWidth: '800px', margin: '2rem 0', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>What is Neural Canvas?</h2>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.6' }}>
          Neural Canvas is a sanctuary for creative expression, designed to be a safe and inclusive space for everyone. We are dedicated to empowering individuals who use American Sign Language (ASL), people with autism, and those with other accessibility needs to explore their artistic talents. Our platform offers a calming and affirming environment where you can transform your imagination into beautiful visual art. With advanced AI, Neural Canvas provides a unique and supportive experience, fostering creativity and well-being for all.
        </p>
      </div>
      <div className="neural-network">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="node"></div>
        ))}
      </div>
      <button style={{
        marginTop: '2rem',
        padding: '1rem 2rem',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: '#764ba2',
        backgroundColor: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
        transition: 'transform 0.2s'
      }}>
        Try It Now
      </button>
    </div>
  );
}