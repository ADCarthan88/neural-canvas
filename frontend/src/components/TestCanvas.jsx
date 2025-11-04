export default function TestCanvas() {
  return (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          🧠 Neural Canvas
        </h1>
        <p className="text-gray-300">
          Revolutionary AI-powered neural canvas
        </p>
        <div className="mt-8 w-32 h-32 mx-auto bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}