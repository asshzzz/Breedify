// src/pages/Capture.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Camera, RotateCw, Check, X, ArrowLeft, AlertCircle } from 'lucide-react';
import { isAuthenticated } from '../api';

const Capture = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Cleanup camera on unmount
    return () => {
      stopCamera();
    };
  }, [navigate]);

  const startCamera = async () => {
    try {
      setError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setCameraActive(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions and try again.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0);

      const imageData = canvas.toDataURL('image/jpeg', 0.9); // 0.9 quality
      setCapturedImage(imageData);
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setResult(null);
    setError('');
    startCamera();
  };

  const processImage = async () => {
    if (!capturedImage) {
      setError('Please capture an image first');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // Step 1: Convert base64 to blob
      const imageResponse = await fetch(capturedImage);
      const blob = await imageResponse.blob();

      // Send the captured image directly to prediction and record storage.
      const formData = new FormData();
      formData.append('image', blob, `capture_${Date.now()}.jpg`);

      const apiOrigin = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1').replace(/\/api\/v1$/, '');
      const response = await fetch(`${apiOrigin}/api/breed/predict`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      const responseData = await response.json();
      if (!response.ok || !responseData.success) {
        throw new Error(responseData.error || 'Prediction failed');
      }
      setResult(responseData.data);

    } catch (err) {
      console.error('Error processing image:', err);
      setError(err || 'Failed to process image. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    stopCamera();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#E5E7EB]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-start">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-[#374151] hover:text-[#111827] transition-colors">
            <ArrowLeft size={16} />
            Back
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-12 pb-20">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-[#FEF2F2] border border-[#FCA5A5]/60 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="text-[#DC2626] mt-0.5 flex-shrink-0" size={18} />
            <div className="flex-1">
              <p className="text-[#991B1B] font-medium text-sm">Error</p>
              <p className="text-[#DC2626] text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError('')}
              className="text-[#DC2626]/60 hover:text-[#DC2626]"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Camera Section */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-[#111827] mb-5">Capture Photo</h2>

          <div className="relative bg-[#111827] rounded-xl overflow-hidden mb-6" style={{ aspectRatio: '16/9' }}>
            {!capturedImage ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!cameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#1F2937]">
                    <div className="text-center text-white">
                      <Camera size={40} className="mx-auto mb-4 opacity-50" />
                      <p className="text-sm font-medium mb-1">Camera not started</p>
                      <p className="text-sm text-white/50">Click "Start Camera" to begin</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Guidelines */}
          <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-4 mb-6">
            <h3 className="font-medium text-[#1E3A8A] text-sm mb-2">Photography guidelines</h3>
            <ul className="text-sm text-[#1D4ED8] space-y-1">
              <li>• Ensure good lighting conditions (natural daylight preferred)</li>
              <li>• Capture the animal from the side view for best results</li>
              <li>• Keep the animal centered and fill most of the frame</li>
              <li>• Avoid shadows, reflections, and obstructions</li>
              <li>• Ensure the entire body is visible (head to tail)</li>
              <li>• Keep the camera steady while capturing</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {!cameraActive && !capturedImage && (
              <button
                onClick={startCamera}
                className="flex-1 min-w-48 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#166534] text-white text-sm font-medium rounded-full hover:bg-[#14532D] transition-colors"
              >
                <Camera size={18} />
                <span>Start Camera</span>
              </button>
            )}

            {cameraActive && !capturedImage && (
              <>
                <button
                  onClick={capturePhoto}
                  className="flex-1 min-w-48 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#166534] text-white text-sm font-medium rounded-full hover:bg-[#14532D] transition-colors"
                >
                  <Camera size={18} />
                  <span>Capture Photo</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#E5E7EB] text-[#374151] text-sm font-medium rounded-full hover:bg-[#F9FAFB] transition-colors"
                >
                  <X size={18} />
                  <span>Cancel</span>
                </button>
              </>
            )}

            {capturedImage && (
              <>
                <button
                  onClick={retakePhoto}
                  disabled={processing}
                  className="flex-1 min-w-48 inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#E5E7EB] text-[#374151] text-sm font-medium rounded-full hover:bg-[#F9FAFB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCw size={18} />
                  <span>Retake Photo</span>
                </button>
                <button
                  onClick={processImage}
                  disabled={processing}
                  className="flex-1 min-w-48 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#166534] text-white text-sm font-medium rounded-full hover:bg-[#14532D] transition-colors disabled:bg-[#9CA3AF] disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      <span>Predict breed</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>

          {result && (
            <div className="mt-6 border border-[#DCE7D5] bg-[#F7FAF4] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B8E23]">Prediction saved</p>
              <h3 className="mt-2 text-2xl font-semibold text-[#173B2D]">{result.breed}</h3>
              <p className="mt-2 text-sm text-[#66756D]">
                Cattle number: <span className="font-semibold text-[#173B2D]">{result.record?.animalId}</span>
              </p>
              <button onClick={() => navigate('/records')} className="mt-4 text-sm font-semibold text-[#166534] hover:text-[#14532D]">
                View saved records →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Capture;