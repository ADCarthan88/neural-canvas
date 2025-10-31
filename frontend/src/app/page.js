'use client';

import dynamic from 'next/dynamic';

const MasterCanvas = dynamic(() => import('../components/MasterCanvas'), {
  ssr: false,
});

export default function Home() {
  return <MasterCanvas />;
}