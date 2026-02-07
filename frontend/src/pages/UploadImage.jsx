import React, { useState } from "react";
import { Upload, X, FileImage, AlertCircle, CheckCircle, Sparkles, Camera, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UploadImage = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const API_BASE_URL = "http://localhost:8000/api/breed/predict";

  const handleFileSelect = (file) => {
    setError("");
    setResult(null);

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image (JPG, PNG)");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) handleFileSelect(e.target.files[0]);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setError("");
    setResult(null);
  };

  const predictBreed = async () => {
    if (!selectedFile) {
      setError("Please select an image first");
      return;
    }

    setProcessing(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch(API_BASE_URL, {
        method: "POST",
        body: formData,
      });

      const responseData = await response.json();
      
      console.log("📥 Full API Response:", responseData);

      if (!response.ok) {
        throw new Error(responseData.error || "Prediction failed");
      }

      if (responseData.success && responseData.data) {
        setResult({
          breed: responseData.data.breed,
          confidence: responseData.data.confidence,
          message: responseData.data.message,
        });
        console.log("✅ Result set:", {
          breed: responseData.data.breed,
          confidence: responseData.data.confidence,
        });
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (err) {
      console.error("❌ Error:", err);
      setError(err.message || "Failed to predict breed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex flex-col items-center justify-center py-12 px-4">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
      </div>

      <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-10 w-full max-w-2xl border border-green-100">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all shadow-md hover:shadow-lg group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4 shadow-lg">
            <Camera className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Breed Prediction
          </h1>
          <p className="text-gray-500 text-sm">Upload an image to identify cattle or buffalo breed</p>
        </div>

        {/* Image Upload or Preview */}
        {!preview ? (
          <div className="border-3 border-dashed border-green-300 rounded-2xl p-12 text-center bg-gradient-to-b from-green-50 to-transparent hover:border-green-400 transition-all duration-300 group">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <FileImage size={80} className="text-green-500 mx-auto mb-4 relative group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-gray-700 font-medium mb-2">Drop your image here or click to browse</p>
            <p className="text-gray-500 text-sm mb-6">Supports JPG, PNG formats</p>
            <label className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl cursor-pointer hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 font-semibold">
              <Upload size={20} className="mr-2" />
              Choose Image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInput}
              />
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl overflow-hidden shadow-inner border-2 border-gray-200">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-96 object-contain p-4"
              />
              <button
                onClick={removeFile}
                className="absolute top-4 right-4 bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-all shadow-lg hover:scale-110"
              >
                <X size={20} />
              </button>
              
              {/* Image Info Badge */}
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm">
                <Sparkles size={16} className="inline mr-2" />
                Ready for analysis
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mt-6 flex items-start bg-red-50 border-2 border-red-200 p-4 rounded-xl shadow-sm animate-shake">
            <AlertCircle className="text-red-600 mt-0.5 mr-3 flex-shrink-0" size={24} />
            <div>
              <p className="text-red-800 font-semibold">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Prediction Result */}
        {result && (
          <div className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 shadow-lg animate-fadeIn">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-500 p-3 rounded-full mr-3 animate-bounce">
                <CheckCircle className="text-white" size={32} />
              </div>
              <h3 className="text-green-800 font-bold text-2xl">Prediction Complete!</h3>
            </div>
            
            <div className="bg-white rounded-xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <span className="text-gray-600 font-medium">Detected Breed:</span>
                <span className="text-2xl font-bold text-green-700">🐄 {result.breed}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">Confidence Score:</span>
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg font-bold text-lg shadow-md">
                    📊 {result.confidence}%
                  </div>
                </div>
              </div>
              
              {/* Confidence Bar */}
              <div className="pt-2">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${result.confidence}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Predict Button */}
        {selectedFile && !processing && (
          <button
            onClick={predictBreed}
            className="mt-6 w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center"
          >
            <Sparkles size={20} className="mr-2" />
            Predict Breed
          </button>
        )}

        {processing && (
          <button
            disabled
            className="mt-6 w-full bg-gradient-to-r from-gray-400 to-gray-500 text-white py-4 rounded-xl font-bold text-lg cursor-not-allowed flex items-center justify-center shadow-lg"
          >
            <div className="animate-spin mr-3 h-6 w-6 border-3 border-white border-t-transparent rounded-full"></div>
            Analyzing Image...
          </button>
        )}
      </div>

      {/* Footer Info */}
      <p className="mt-6 text-gray-500 text-sm text-center">
        Powered by AI • Accurate breed identification
      </p>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default UploadImage;