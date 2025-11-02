/**
 * ASL Interface Component
 * Visual feedback and learning system for ASL users
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ASLInterface({ 
  currentLetter, 
  currentSpelling, 
  recognizedCommand, 
  isActive 
}) {
  const [showAlphabet, setShowAlphabet] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [recentCommands, setRecentCommands] = useState([]);

  // ASL Alphabet for reference
  const aslAlphabet = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
    'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
    'U', 'V', 'W', 'X', 'Y', 'Z'
  ];

  // Common ASL commands
  const aslCommands = [
    { sign: 'MORE', action: 'Increase intensity', gesture: '👐➡️👐' },
    { sign: 'BRIGHT', action: 'Brighter colors', gesture: '✋⬆️✨' },
    { sign: 'DARK', action: 'Darker colors', gesture: '✋⬇️🌑' },
    { sign: 'FAST', action: 'Faster animation', gesture: '👍💨' },
    { sign: 'SLOW', action: 'Slower animation', gesture: '✋🐌' },
    { sign: 'BIG', action: 'More particles', gesture: '👐⬅️➡️' },
    { sign: 'SMALL', action: 'Fewer particles', gesture: '👌' },
    { sign: 'BEAUTIFUL', action: 'Ultimate mode', gesture: '👋😍' },
    { sign: 'CHANGE', action: 'Next mode', gesture: '✊🔄' },
    { sign: 'STOP', action: 'Pause', gesture: '✋🛑' },
    { sign: 'START', action: 'Play', gesture: '👉▶️' },
    { sign: 'COLOR', action: 'Cycle colors', gesture: '👋🌈' }
  ];

  useEffect(() => {
    if (recognizedCommand) {
      setRecentCommands(prev => [
        { command: recognizedCommand, time: Date.now() },
        ...prev.slice(0, 4)
      ]);
    }
  }, [recognizedCommand]);

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      {/* ASL Status Indicator */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        className={`mb-4 p-4 rounded-lg backdrop-blur-md border ${
          isActive 
            ? 'bg-green-500/20 border-green-400 text-green-100' 
            : 'bg-gray-500/20 border-gray-400 text-gray-300'
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🤟</span>
          <span className="font-semibold">ASL Recognition</span>
          <div className={`w-2 h-2 rounded-full ${
            isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
          }`} />
        </div>
        
        {/* Current Recognition */}
        {currentLetter && (
          <motion.div
            key={currentLetter}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center p-2 bg-white/10 rounded mb-2"
          >
            <div className="text-3xl font-bold text-blue-300">{currentLetter}</div>
          </motion.div>
        )}

        {/* Current Spelling */}
        {currentSpelling && (
          <div className="text-center p-2 bg-white/10 rounded mb-2">
            <div className="text-sm text-gray-300">Spelling:</div>
            <div className="text-lg font-mono text-yellow-300">{currentSpelling}</div>
          </div>
        )}

        {/* Recent Commands */}
        <AnimatePresence>
          {recentCommands.map((item, index) => (
            <motion.div
              key={item.time}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1 - (index * 0.2), y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="text-sm text-green-300 mb-1"
            >
              ✓ {item.command}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setShowAlphabet(!showAlphabet)}
          className="px-3 py-2 bg-blue-500/20 border border-blue-400 rounded text-blue-100 hover:bg-blue-500/30 transition-colors"
        >
          ABC
        </button>
        <button
          onClick={() => setShowCommands(!showCommands)}
          className="px-3 py-2 bg-purple-500/20 border border-purple-400 rounded text-purple-100 hover:bg-purple-500/30 transition-colors"
        >
          Commands
        </button>
      </div>

      {/* ASL Alphabet Reference */}
      <AnimatePresence>
        {showAlphabet && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mb-4 p-4 bg-black/50 backdrop-blur-md border border-gray-600 rounded-lg"
          >
            <h3 className="text-lg font-semibold text-white mb-3">ASL Alphabet</h3>
            <div className="grid grid-cols-6 gap-2">
              {aslAlphabet.map(letter => (
                <div
                  key={letter}
                  className={`p-2 text-center rounded border ${
                    currentLetter === letter
                      ? 'bg-blue-500/30 border-blue-400 text-blue-100'
                      : 'bg-gray-700/30 border-gray-600 text-gray-300'
                  }`}
                >
                  {letter}
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-gray-400">
              Spell words to control the canvas
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ASL Commands Reference */}
      <AnimatePresence>
        {showCommands && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="p-4 bg-black/50 backdrop-blur-md border border-gray-600 rounded-lg max-h-96 overflow-y-auto"
          >
            <h3 className="text-lg font-semibold text-white mb-3">ASL Commands</h3>
            <div className="space-y-2">
              {aslCommands.map(cmd => (
                <div
                  key={cmd.sign}
                  className="p-2 bg-gray-700/30 border border-gray-600 rounded"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-blue-300">{cmd.sign}</span>
                    <span className="text-lg">{cmd.gesture}</span>
                  </div>
                  <div className="text-sm text-gray-300">{cmd.action}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-gray-400">
              Use gestures or spell words for control
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Learning Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="p-3 bg-indigo-500/20 border border-indigo-400 rounded-lg text-indigo-100"
      >
        <div className="text-sm font-semibold mb-1">💡 ASL Tips</div>
        <div className="text-xs space-y-1">
          <div>• Hold letters clearly for 1 second</div>
          <div>• Pause between words</div>
          <div>• Use gestures for quick commands</div>
          <div>• Practice with the reference guides</div>
        </div>
      </motion.div>
    </div>
  );
}