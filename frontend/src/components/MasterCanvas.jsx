import { useState, useEffect } from 'react';
import InclusiveNeuralCanvas from './InclusiveNeuralCanvas';
import MobileNeuralCanvas from './MobileNeuralCanvas';

export default function MasterCanvas() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const width = window.innerWidth;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) || width < 768;
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile ? <MobileNeuralCanvas /> : <InclusiveNeuralCanvas />;
}