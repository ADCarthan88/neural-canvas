'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';

const MasterCanvas = dynamic(() => import('../components/MasterCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-pulse">🧠</div>
        <div className="text-white text-2xl font-bold animate-pulse holographic-text">
          Loading Neural Canvas...
        </div>
        <div className="text-gray-400 text-sm mt-2">
          Initializing quantum reality engine
        </div>
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <ErrorBoundary>
      <main className="w-full h-screen overflow-hidden">
        <Suspense fallback={
          <div className="w-full h-screen bg-black flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-spin">⚛️</div>
              <div className="text-white text-2xl font-bold animate-pulse holographic-text">
                Initializing Reality Engine...
              </div>
              <div className="text-gray-400 text-sm mt-2">
                Preparing mind-blowing visuals
              </div>
            </div>
          </div>
        }>
          <MasterCanvas />
        </Suspense>
      </main>
    </ErrorBoundary>
  );
}