import React, { useState } from "react";
import { Upload, X, FileImage, AlertCircle, CheckCircle, Camera, ArrowLeft } from "lucide-react";
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

      if (!response.ok) {
        throw new Error(responseData.error || "Prediction failed");
      }

      if (responseData.success && responseData.data) {
        setResult({
          breed: responseData.data.breed,
          confidence: responseData.data.confidence,
          message: responseData.data.message,
        });
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (err) {
      setError(err.message || "Failed to predict breed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#E5E7EB]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#374151] hover:text-[#111827] transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <span className="text-sm font-semibold tracking-tight text-[#111827]">
            ATC System
          </span>
        </div>
      </nav>

      {/* Main */}
      <div className="max-w-3xl mx-auto px-6 pt-16 pb-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#F0FDF4] mb-5">
            <Camera className="text-[#166534]" size={20} />
          </div>
          <p className="text-xs font-semibold tracking-[0.2em] text-[#166534] uppercase mb-3">
            Breed Prediction
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#111827] mb-3 leading-[1.15]">
            Identify a breed from a photo
          </h1>
          <p className="text-base text-[#6B7280] leading-relaxed">
            Upload an image of a cattle or buffalo for an AI-driven breed assessment.
          </p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8">
          {/* Upload or Preview */}
          {!preview ? (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#E5E7EB] rounded-2xl py-16 px-8 text-center cursor-pointer hover:border-[#166534]/40 hover:bg-[#F0FDF4]/40 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-[#F0FDF4] flex items-center justify-center mb-5">
                <FileImage className="text-[#166534]" size={20} />
              </div>
              <p className="text-sm font-medium text-[#111827] mb-1">
                Drop an image here or click to browse
              </p>
              <p className="text-sm text-[#9CA3AF] mb-6">Supports JPG and PNG</p>
              <span className="inline-flex items-center gap-2 bg-[#166534] text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-[#14532D] transition-colors">
                <Upload size={16} />
                Choose image
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInput}
              />
            </label>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-[#E5E7EB]">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-80 object-contain bg-[#FAFAF9]"
              />
              <button
                onClick={removeFile}
                className="absolute top-3 right-3 bg-white border border-[#E5E7EB] text-[#374151] p-2 rounded-full hover:bg-[#F9FAFB] transition-colors shadow-sm"
              >
                <X size={16} />
              </button>
              <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-lg">
                Ready for analysis
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-5 flex items-start gap-3 bg-[#FEF2F2] border border-[#FCA5A5]/60 p-4 rounded-xl">
              <AlertCircle className="text-[#DC2626] mt-0.5 flex-shrink-0" size={18} />
              <div>
                <p className="text-[#991B1B] font-medium text-sm">Error</p>
                <p className="text-[#DC2626] text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="mt-5 border border-[#E5E7EB] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-full bg-[#F0FDF4] flex items-center justify-center">
                  <CheckCircle className="text-[#166534]" size={18} />
                </div>
                <h3 className="text-[#111827] font-semibold text-lg">Prediction complete</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
                  <span className="text-[#6B7280] text-sm">Detected breed</span>
                  <span className="text-lg font-semibold text-[#111827]">{result.breed}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#6B7280] text-sm">Confidence score</span>
                  <span className="text-sm font-semibold text-[#166534] bg-[#F0FDF4] px-3 py-1 rounded-full">
                    {result.confidence}%
                  </span>
                </div>

                <div className="w-full bg-[#F3F4F6] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#166534] h-2 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${result.confidence}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          {selectedFile && !processing && (
            <button
              onClick={predictBreed}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-[#166534] text-white text-sm font-medium py-3 rounded-full hover:bg-[#14532D] transition-colors"
            >
              Predict breed
            </button>
          )}

          {processing && (
            <button
              disabled
              className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-[#9CA3AF] text-white text-sm font-medium py-3 rounded-full cursor-not-allowed"
            >
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Analyzing image...
            </button>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-[#9CA3AF]">
          Powered by AI · Accurate breed identification
        </p>
      </div>
    </div>
  );
};

export default UploadImage;