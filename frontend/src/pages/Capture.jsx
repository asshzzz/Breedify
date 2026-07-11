// src/pages/Capture.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Camera, RotateCw, Check, X, ArrowLeft, AlertCircle } from 'lucide-react';
import { imageAPI, recordAPI, isAuthenticated } from '../api';

const Capture = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [animalType, setAnimalType] = useState('cattle');
  const [tagNumber, setTagNumber] = useState('');
  const [breed, setBreed] = useState('');
  const [center, setCenter] = useState('');
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
    setError('');
    startCamera();
  };

  const processImage = async () => {
    // Validation
    if (!tagNumber.trim()) {
      setError('Please enter Tag Number');
      return;
    }

    if (!capturedImage) {
      setError('Please capture an image first');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // Step 1: Convert base64 to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();

      // Step 2: Create FormData for image upload
      const formData = new FormData();
      formData.append('image', blob, `capture_${Date.now()}.jpg`);

      // Step 3: Upload image to backend
      const uploadResponse = await imageAPI.upload(formData);
      const imageData = uploadResponse.data || uploadResponse;

      // Step 4: Create animal record with uploaded image
      const recordData = {
        animalType: animalType,
        tagNumber: tagNumber,
        breed: breed || undefined,
        center: center || undefined,
        imageUrl: imageData.url || imageData.imageUrl,
        imageId: imageData._id || imageData.id,
        status: 'pending', // Initial status
        captureMethod: 'camera',
        capturedAt: new Date().toISOString()
      };

      const recordResponse = await recordAPI.create(recordData);
      const record = recordResponse.data || recordResponse;

      // Step 5: Navigate to result/detail page
      navigate(`/records/${record._id || record.id}`, {
        state: {
          success: true,
          message: 'Image captured and uploaded successfully!'
        }
      });

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
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-[#374151] hover:text-[#111827] transition-colors">
            <ArrowLeft size={16} />
            Back
          </Link>
          <span className="text-sm font-semibold tracking-tight text-[#111827]">Capture Image</span>
          <div className="w-16"></div>
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

        {/* Animal Details Form */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#111827] mb-5">Animal Details</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#374151] text-sm font-medium mb-2">
                Animal Type <span className="text-[#DC2626]">*</span>
              </label>
              <select
                value={animalType}
                onChange={(e) => setAnimalType(e.target.value)}
                className="w-full px-4 py-3 text-sm border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#166534]/30 focus:border-[#166534] outline-none"
              >
                <option value="cattle">Cattle</option>
                <option value="buffalo">Buffalo</option>
              </select>
            </div>

            <div>
              <label className="block text-[#374151] text-sm font-medium mb-2">
                Tag Number <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                value={tagNumber}
                onChange={(e) => setTagNumber(e.target.value)}
                placeholder="Enter tag number"
                className="w-full px-4 py-3 text-sm border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#166534]/30 focus:border-[#166534] outline-none"
              />
            </div>

            <div>
              <label className="block text-[#374151] text-sm font-medium mb-2">
                Breed (Optional)
              </label>
              <input
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder="Enter breed name"
                className="w-full px-4 py-3 text-sm border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#166534]/30 focus:border-[#166534] outline-none"
              />
            </div>

            <div>
              <label className="block text-[#374151] text-sm font-medium mb-2">
                Center (Optional)
              </label>
              <input
                type="text"
                value={center}
                onChange={(e) => setCenter(e.target.value)}
                placeholder="Enter center name"
                className="w-full px-4 py-3 text-sm border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#166534]/30 focus:border-[#166534] outline-none"
              />
            </div>
          </div>
        </div>

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
                      <span>Process &amp; Upload</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Capture;