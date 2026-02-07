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

  if (!result) return <div className="p-10 text-center text-gray-600">Loading result...</div>;

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Classification Result</h1>
          <div className="w-32"></div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Success Banner */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6 flex items-center">
            <CheckCircle className="text-green-600 mr-4" size={32} />
            <div>
              <h2 className="text-xl font-bold text-green-900">Classification Complete!</h2>
              <p className="text-green-700">
                AI analysis successfully completed for {result.animalType} #{result.animalId}
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Image */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <img
                  src={result.imageUrl}
                  alt={`${result.animalType} ${result.animalId}`}
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://placehold.co/400x300?text=Image+Unavailable";
                  }}
                />
                <div className="p-4">
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">Animal ID</p>
                    <p className="text-lg font-bold text-gray-800">{result.animalId}</p>
                  </div>
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="text-lg font-semibold text-gray-800">{result.animalType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Breed</p>
                    <p className="text-lg font-semibold text-gray-800">{result.breed}</p>
                  </div>
                </div>
              </div>

              {/* Score */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                <p className="text-sm opacity-90 mb-2">Overall Score</p>
                <div className="flex items-end space-x-2 mb-2">
                  <h2 className="text-5xl font-bold">{result.overallScore}</h2>
                  <span className="text-2xl opacity-90 pb-2">/100</span>
                </div>
                <div className="w-full bg-white bg-opacity-30 rounded-full h-2 mb-3">
                  <div
                    className="bg-white rounded-full h-2 transition-all duration-500"
                    style={{ width: `${result.overallScore}%` }}
                  ></div>
                </div>
                <p className="text-lg font-semibold">
                  Classification: {result.classification}
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Parameters */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6">
                  Body Structure Parameters
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(result.parameters).map(([key, param]) => (
                    <div key={key} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-semibold text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </p>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                          {param.score}/100
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-800">
                        {param.value} {param.unit || ""}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
                        <div
                          className="bg-green-500 rounded-full h-1.5 transition-all duration-500"
                          style={{ width: `${param.score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Recommendations</h3>
                <ul className="space-y-3">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle
                        className="text-green-600 mr-3 mt-0.5 flex-shrink-0"
                        size={20}
                      />
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Actions</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <button
                    onClick={saveRecord}
                    disabled={saving}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
                  >
                    <Save size={20} />
                    <span>{saving ? "Saving..." : "Save to BPA"}</span>
                  </button>
                  <button
                    onClick={downloadReport}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    <Download size={20} />
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={shareResult}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
                  >
                    <Share2 size={20} />
                    <span>Share Result</span>
                  </button>
                </div>
              </div>

              {/* Timestamp */}
              <div className="text-center text-sm text-gray-500">
                Analysis completed on{" "}
                {new Date(result.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Result;
