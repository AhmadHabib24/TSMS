'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // setShowPrompt(true); // Hidden as requested
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
      <div className="p-4 flex gap-4 items-start">
        <div className="bg-yellow-100 text-yellow-600 p-2.5 rounded-xl shrink-0">
          <Download size={24} />
        </div>
        <div className="flex-1">
          <h3 className="text-gray-900 font-bold mb-1">Install App</h3>
          <p className="text-sm text-gray-500">Install this application to your device for easy access and a better experience.</p>
          
          <div className="mt-3 flex gap-2">
            <button 
              onClick={handleInstallClick}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Install App
            </button>
            <button 
              onClick={() => setShowPrompt(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
        <button onClick={() => setShowPrompt(false)} className="text-gray-400 hover:text-gray-600 shrink-0">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
