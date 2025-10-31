import { useState, useRef } from 'react';

export default function AIIntegration({ onStyleChange, onColorChange }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [voiceListening, setVoiceListening] = useState(false);

  const generateAIStyle = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    try {
      // Simulate AI style generation
      const styles = {
        'psychedelic': { intensity: 2.5, colors: ['#ff00ff', '#00ffff', '#ffff00'] },
        'cosmic': { intensity: 1.8, colors: ['#000080', '#4169e1', '#ffffff'] },
        'fire': { intensity: 3.0, colors: ['#ff4500', '#ff6347', '#ffd700'] },
        'ocean': { intensity: 1.2, colors: ['#006994', '#47b5ff', '#06ffa5'] },
        'forest': { intensity: 1.5, colors: ['#228b22', '#32cd32', '#90ee90'] }
      };
      
      // Simple keyword matching (would be replaced with actual AI)
      const keywords = Object.keys(styles);
      const matchedStyle = keywords.find(keyword => 
        prompt.toLowerCase().includes(keyword)
      ) || 'psychedelic';
      
      const selectedStyle = styles[matchedStyle];
      
      if (onStyleChange) {
        onStyleChange(selectedStyle.intensity);
      }
      
      if (onColorChange) {
        onColorChange(selectedStyle.colors);
      }
      
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const startVoiceCommand = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice recognition not supported');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    setVoiceListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setPrompt(transcript);
      setVoiceListening(false);
    };

    recognition.onerror = () => {
      setVoiceListening(false);
    };

    recognition.onend = () => {
      setVoiceListening(false);
    };

    recognition.start();
  };

  const presetStyles = [
    { name: '🌈 Psychedelic', prompt: 'psychedelic rainbow colors' },
    { name: '🌌 Cosmic', prompt: 'cosmic space nebula' },
    { name: '🔥 Fire', prompt: 'fire and flames' },
    { name: '🌊 Ocean', prompt: 'ocean waves blue' },
    { name: '🌲 Forest', prompt: 'forest green nature' }
  ];

  return (
    <div className="absolute bottom-4 left-4 z-20 bg-black/40 backdrop-blur-lg rounded-lg p-3 w-64">
      <h3 className="text-white font-bold text-sm mb-2">🤖 AI Style Generator</h3>
      
      <div className="flex gap-1 mb-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your vision..."
          className="flex-1 px-2 py-1 bg-black/50 text-white text-xs rounded border border-white/20 focus:border-pink-500 outline-none"
        />
        <button
          onClick={startVoiceCommand}
          disabled={voiceListening}
          className={`px-2 py-1 rounded text-xs font-bold transition-all ${
            voiceListening 
              ? 'bg-red-500 animate-pulse' 
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white`}
        >
          {voiceListening ? '🎤' : '🎙️'}
        </button>
      </div>
      
      <button
        onClick={generateAIStyle}
        disabled={isGenerating || !prompt.trim()}
        className="w-full px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded text-xs font-bold hover:shadow-lg transition-all disabled:opacity-50 mb-2"
      >
        {isGenerating ? '🧠 Generating...' : '✨ Generate Style'}
      </button>
      
      <div className="grid grid-cols-2 gap-1">
        {presetStyles.map((style, index) => (
          <button
            key={index}
            onClick={() => {
              setPrompt(style.prompt);
              setTimeout(generateAIStyle, 100);
            }}
            className="px-2 py-1 bg-black/50 text-white text-xs rounded hover:bg-white/10 transition-all"
          >
            {style.name}
          </button>
        ))}
      </div>
    </div>
  );
}