import React, { useState, useRef, useEffect } from 'react';
import { Shield, CheckCircle2, ScanFace, FileText, Lock, Loader2, Camera, X, RefreshCw, Upload, Image as ImageIcon } from 'lucide-react';

interface KYCProps {
  onComplete: () => void;
}

export const KYC: React.FC<KYCProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [bvn, setBvn] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Document State
  const [idImage, setIdImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Camera State
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');

  // --- BVN LOGIC ---
  const handleVerifyBVN = () => {
    if (bvn.length !== 11) return alert("Please enter a valid 11-digit BVN");
    setIsProcessing(true);
    // Simulate API Check
    setTimeout(() => {
      setIsProcessing(false);
      setStep(2);
    }, 1500);
  };

  // --- DOCUMENT UPLOAD LOGIC ---
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- CAMERA LOGIC ---
  const startCamera = async () => {
    setCameraError('');
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setCameraError('Unable to access camera. Please allow permissions.');
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg');
        setSelfieImage(dataUrl);
        stopCamera();
      }
    }
  };

  const retakeSelfie = () => {
    setSelfieImage(null);
    startCamera();
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);


  // --- SUBMISSION ---
  const handleSubmitDocuments = () => {
    if (!idImage || !selfieImage) return;
    
    setIsProcessing(true);
    // Simulate Upload to Server
    setTimeout(() => {
      setIsProcessing(false);
      setStep(3);
    }, 2500);
  };

  const handleFinish = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 font-inter">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-auto md:h-[600px]">
        
        {/* Sidebar Info */}
        <div className="bg-slate-800 p-8 md:w-1/3 border-r border-slate-700 flex flex-col justify-between">
          <div>
            <div className="bg-indigo-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <Shield className="text-indigo-400" size={24} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Identity Verification</h2>
            <p className="text-slate-400 text-sm mb-6">
              To comply with CBN regulations and ensure the safety of your funds, we need to verify your identity.
            </p>
            <ul className="space-y-4">
              <li className={`flex items-center gap-3 text-sm ${step > 1 ? 'text-emerald-400' : 'text-white'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${step > 1 ? 'bg-emerald-500/20 border-emerald-500' : 'border-slate-600'}`}>
                  {step > 1 ? <CheckCircle2 size={14} /> : '1'}
                </div>
                BVN Verification
              </li>
              <li className={`flex items-center gap-3 text-sm ${step > 2 ? 'text-emerald-400' : step === 2 ? 'text-white' : 'text-slate-500'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${step > 2 ? 'bg-emerald-500/20 border-emerald-500' : step === 2 ? 'border-indigo-500 text-indigo-400' : 'border-slate-600'}`}>
                  {step > 2 ? <CheckCircle2 size={14} /> : '2'}
                </div>
                ID Document & Selfie
              </li>
              <li className={`flex items-center gap-3 text-sm ${step === 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${step === 3 ? 'bg-emerald-500/20 border-emerald-500' : 'border-slate-600'}`}>
                  {step === 3 ? <CheckCircle2 size={14} /> : '3'}
                </div>
                Review
              </li>
            </ul>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-6">
            <Lock size={12} />
            Data encrypted via AES-256
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 md:w-2/3 bg-slate-900 relative overflow-y-auto">
          
          {step === 1 && (
            <div className="animate-fade-in space-y-6 h-full flex flex-col justify-center">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Link your BVN</h3>
                <p className="text-slate-400 text-sm">Enter your 11-digit Bank Verification Number.</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase">BVN Number</label>
                <input 
                  type="text" 
                  maxLength={11}
                  value={bvn}
                  onChange={(e) => setBvn(e.target.value.replace(/\D/g, ''))}
                  placeholder="12345678901"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-2xl tracking-[0.5em] text-center text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder-slate-700"
                />
              </div>
              <button 
                onClick={handleVerifyBVN}
                disabled={isProcessing || bvn.length !== 11}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader2 className="animate-spin" /> : 'Verify BVN'}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Upload Documents</h3>
                <p className="text-slate-400 text-sm">We need a photo of your ID and a live selfie.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ID Upload Section */}
                <div 
                  className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center relative transition-colors h-48 overflow-hidden ${idImage ? 'border-emerald-500 bg-slate-900' : 'border-slate-700 hover:border-indigo-500 bg-slate-800/50 cursor-pointer'}`}
                  onClick={() => !idImage && fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileSelect} 
                  />
                  
                  {idImage ? (
                    <div className="w-full h-full relative group">
                      <img src={idImage} alt="ID" className="w-full h-full object-cover rounded-lg opacity-80" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                            onClick={(e) => { e.stopPropagation(); setIdImage(null); }}
                            className="bg-rose-500 p-2 rounded-full text-white"
                         >
                           <X size={20} />
                         </button>
                      </div>
                      <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <CheckCircle2 size={10} /> Uploaded
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-2 text-indigo-400">
                        <FileText size={24} />
                      </div>
                      <p className="text-white font-medium text-sm">Upload ID Card</p>
                      <p className="text-slate-500 text-[10px] mt-1 text-center">NIN, Passport or Driver's License</p>
                    </>
                  )}
                </div>

                {/* Selfie Section */}
                <div className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center relative h-48 overflow-hidden ${selfieImage ? 'border-emerald-500' : 'border-slate-700 bg-slate-800/50'}`}>
                   {selfieImage ? (
                     <div className="w-full h-full relative group">
                       <img src={selfieImage} alt="Selfie" className="w-full h-full object-cover rounded-lg" />
                       <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                             onClick={retakeSelfie}
                             className="bg-white/20 backdrop-blur text-white p-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-white/30"
                          >
                            <RefreshCw size={16} /> Retake
                          </button>
                       </div>
                       <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <CheckCircle2 size={10} /> Captured
                      </div>
                     </div>
                   ) : isCameraOpen ? (
                     <div className="w-full h-full relative bg-black rounded-lg overflow-hidden">
                       <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                       <div className="absolute bottom-2 left-0 w-full flex justify-center gap-4">
                         <button 
                           onClick={stopCamera} 
                           className="p-2 bg-slate-800/80 rounded-full text-white hover:bg-slate-700"
                         >
                           <X size={20} />
                         </button>
                         <button 
                           onClick={captureSelfie} 
                           className="p-2 bg-white rounded-full text-indigo-600 border-4 border-indigo-600/30 hover:scale-105 transition-transform"
                         >
                           <Camera size={24} />
                         </button>
                       </div>
                       <canvas ref={canvasRef} className="hidden" />
                     </div>
                   ) : (
                      <div 
                        className="flex flex-col items-center cursor-pointer w-full h-full justify-center hover:bg-slate-800 transition-colors rounded-xl"
                        onClick={startCamera}
                      >
                        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-2 text-emerald-400">
                          <ScanFace size={24} />
                        </div>
                        <p className="text-white font-medium text-sm">Take Selfie</p>
                        <p className="text-slate-500 text-[10px] mt-1">Click to open camera</p>
                        {cameraError && <p className="text-rose-500 text-[10px] mt-2">{cameraError}</p>}
                      </div>
                   )}
                </div>
              </div>
              
              <div className="mt-4">
                 <p className="text-xs text-slate-500 mb-4 flex items-center gap-2">
                   <Lock size={12} /> 
                   Documents are securely transmitted and deleted after verification.
                 </p>
                 <button 
                  onClick={handleSubmitDocuments}
                  disabled={isProcessing || !idImage || !selfieImage}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                   {isProcessing ? <Loader2 className="animate-spin" /> : 'Submit Verification'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in text-center flex flex-col items-center justify-center h-full">
              <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Verification Successful</h3>
              <p className="text-slate-400 max-w-xs mx-auto mb-8">
                Your identity has been verified. You now have full access to Klass Wallet features including NGN deposits and unlimited withdrawals.
              </p>
              <button 
                onClick={handleFinish}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20"
              >
                Access Dashboard
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};