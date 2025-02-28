import React, { useEffect, useRef } from 'react';
import { Download } from 'lucide-react';
import { generateShareImage } from './shareImageGenerator';

const ShareModal = ({ 
  showShareModal, 
  setShowShareModal, 
  shareFormat, 
  setShareFormat, 
  userName, 
  games, 
  totalPlaytime, 
  horoscope 
}) => {
  const canvasRef = useRef(null);

  const downloadImage = () => {
    const dataUrl = generateShareImage(
      canvasRef.current,
      shareFormat,
      userName,
      games,
      totalPlaytime, 
      horoscope
    );
    const link = document.createElement('a');
    link.download = `steamscope-${shareFormat}-${userName.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = dataUrl;
    link.click();
  };

  // Initialize the share image when the modal opens
  useEffect(() => {
    if (showShareModal && canvasRef.current) {
      setTimeout(() => {
        generateShareImage(
          canvasRef.current,
          shareFormat,
          userName,
          games,
          totalPlaytime,
          horoscope
        );
      }, 100);
    }
  }, [showShareModal, shareFormat, userName, games, totalPlaytime, horoscope]);

  if (!showShareModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-3xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold dark:text-white">Share Your Replay</h2>
          <button
            onClick={() => setShowShareModal(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="flex justify-center mb-6">
          <select
            value={shareFormat}
            onChange={(e) => setShareFormat(e.target.value)}
            className="px-4 py-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="tall">INSTAGRAM / STORIES</option>
            <option value="wide">TWITTER / FACEBOOK</option>
          </select>
        </div>
        
        <div className="flex justify-center overflow-hidden mb-6">
          <div className="relative border border-gray-300 dark:border-gray-600 rounded-md max-w-full" style={{ maxHeight: '60vh' }}>
            <div className="overflow-auto p-2">
              <canvas 
                ref={canvasRef} 
                className="mx-auto" 
                style={{ 
                  width: shareFormat === 'tall' ? '270px' : '480px',
                  height: shareFormat === 'tall' ? '480px' : '270px',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>
            
            <div className="flex justify-center space-x-2 mt-4">
              <div className={`w-3 h-3 rounded-full ${shareFormat === 'tall' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
              <div className={`w-3 h-3 rounded-full ${shareFormat === 'wide' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
            </div>
          </div>
        </div>
        
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
          {shareFormat === 'tall' ? (
            <p>TALL FORMAT BEST FOR: STORIES ON INSTAGRAM / FACEBOOK / SNAPCHAT / TIKTOK / PINTEREST</p>
          ) : (
            <p>WIDE FORMAT BEST FOR: TWITTER / FACEBOOK / LINKEDIN POSTS</p>
          )}
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={downloadImage}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Download className="h-5 w-5 mr-2" />
            Save Image
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;