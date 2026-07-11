import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Download, Share2, Save, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"; // ✅ Adjust according to backend

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  // 🧠 Fetch actual AI result if passed from previous page
  useEffect(() => {
    const data = location.state?.result;
    if (data) {
      setResult(data);
    } else {
      toast.error("No result data found!");
      navigate("/dashboard");
    }
  }, [location.state, navigate]);

  if (!result) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
        <p className="text-sm text-[#6B7280]">Loading result...</p>
      </div>
    );
  }

  // 🧾 Save record to backend
  const saveRecord = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          animalId: result.animalId,
          animalType: result.animalType,
          breed: result.breed,
          imageUrl: result.imageUrl,
          overallScore: result.overallScore,
          parameters: result.parameters,
          classification: result.classification,
          recommendations: result.recommendations,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Record saved successfully!");
        navigate("/records");
      } else {
        toast.error(data.message || "Failed to save record");
      }
    } catch (err) {
      console.error("Error saving record:", err);
      toast.error("Error saving record");
    } finally {
      setSaving(false);
    }
  };

  // 📄 Download result report (PDF)
  const downloadReport = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/records/${result.animalId}/report`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!response.ok) throw new Error("Failed to download report");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${result.animalId}_Report.pdf`;
      link.click();

      toast.success("Report downloaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Error downloading report");
    }
  };

  // 🔗 Share result (copy link)
  const shareResult = async () => {
    try {
      const shareUrl = `${window.location.origin}/result/${result.animalId}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.info("Result link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#E5E7EB]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#374151] hover:text-[#111827] transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
          <span className="text-sm font-semibold tracking-tight text-[#111827]">Classification Result</span>
          <div className="w-16"></div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pt-12 pb-20">
        {/* Success Banner */}
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-6 mb-6 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
            <CheckCircle className="text-[#166534]" size={22} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#14532D]">Classification complete</h2>
            <p className="text-sm text-[#166534]">
              AI analysis successfully completed for {result.animalType} #{result.animalId}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Image */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
              <img
                src={result.imageUrl}
                alt={`${result.animalType} ${result.animalId}`}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://placehold.co/400x300?text=Image+Unavailable";
                }}
              />
              <div className="p-5 space-y-3">
                <div>
                  <p className="text-xs text-[#9CA3AF]">Animal ID</p>
                  <p className="text-sm font-semibold text-[#111827]">{result.animalId}</p>
                </div>
                <div>
                  <p className="text-xs text-[#9CA3AF]">Type</p>
                  <p className="text-sm font-medium text-[#374151]">{result.animalType}</p>
                </div>
                <div>
                  <p className="text-xs text-[#9CA3AF]">Breed</p>
                  <p className="text-sm font-medium text-[#374151]">{result.breed}</p>
                </div>
              </div>
            </div>

            {/* Score */}
            <div className="bg-[#166534] rounded-2xl p-6 text-white">
              <p className="text-sm text-white/80 mb-2">Overall Score</p>
              <div className="flex items-end gap-2 mb-3">
                <h2 className="text-5xl font-semibold">{result.overallScore}</h2>
                <span className="text-xl text-white/80 pb-1">/100</span>
              </div>
              <div className="w-full bg-white/25 rounded-full h-2 mb-4">
                <div
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{ width: `${result.overallScore}%` }}
                ></div>
              </div>
              <p className="text-sm font-medium">
                Classification: {result.classification}
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Parameters */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[#111827] mb-6">
                Body Structure Parameters
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(result.parameters).map(([key, param]) => (
                  <div key={key} className="border border-[#E5E7EB] rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-medium text-[#374151] capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </p>
                      <span className="px-2 py-1 bg-[#F0FDF4] text-[#166534] text-xs font-semibold rounded-full">
                        {param.score}/100
                      </span>
                    </div>
                    <p className="text-2xl font-semibold text-[#111827]">
                      {param.value} {param.unit || ""}
                    </p>
                    <div className="w-full bg-[#F3F4F6] rounded-full h-1.5 mt-3">
                      <div
                        className="bg-[#166534] rounded-full h-1.5 transition-all duration-500"
                        style={{ width: `${param.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[#111827] mb-4">Recommendations</h3>
              <ul className="space-y-3">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle
                      className="text-[#166534] mt-0.5 flex-shrink-0"
                      size={18}
                    />
                    <span className="text-sm text-[#374151]">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[#111827] mb-4">Actions</h3>
              <div className="grid md:grid-cols-3 gap-3">
                <button
                  onClick={saveRecord}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#166534] text-white text-sm font-medium rounded-full hover:bg-[#14532D] transition-colors disabled:bg-[#9CA3AF]"
                >
                  <Save size={16} />
                  <span>{saving ? "Saving..." : "Save to BPA"}</span>
                </button>
                <button
                  onClick={downloadReport}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-[#E5E7EB] text-[#374151] text-sm font-medium rounded-full hover:bg-[#F9FAFB] transition-colors"
                >
                  <Download size={16} />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={shareResult}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-[#E5E7EB] text-[#374151] text-sm font-medium rounded-full hover:bg-[#F9FAFB] transition-colors"
                >
                  <Share2 size={16} />
                  <span>Share Result</span>
                </button>
              </div>
            </div>

            {/* Timestamp */}
            <p className="text-center text-sm text-[#9CA3AF]">
              Analysis completed on{" "}
              {new Date(result.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Result;