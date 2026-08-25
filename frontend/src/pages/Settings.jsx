import { useEffect, useState } from "react";
import { ArrowLeft, Edit3, Loader2, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authAPI, setUserData } from "../api.js";
import { toast } from "react-toastify";

export default function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [savedName, setSavedName] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const userResponse = await authAPI.getCurrentUser();
        const user = userResponse.data?.user || userResponse.data || userResponse.user || userResponse;
        const name = user?.name || "";
        setProfileForm({ name, email: user?.email || "" });
        setSavedName(name);

      } catch (error) {
        toast.error(error || "Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (event) => {
    event.preventDefault();
    const name = profileForm.name.trim();
    if (!name) {
      toast.error("Name cannot be empty");
      return;
    }
    setSaving(true);
    try {
      const profileData = { name };
      const response = await authAPI.updateProfile(profileData);
      const updatedUser = response.user || response.data?.user || { ...profileForm, name };
      setProfileForm((current) => ({ ...current, name: updatedUser.name || name }));
      setSavedName(updatedUser.name || name);
      setUserData(updatedUser);
      setEditingProfile(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error || "Unable to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center"><Loader2 className="animate-spin text-[#166534]" /><span className="ml-2 text-sm text-[#6B7280]">Loading settings...</span></div>;
  }

  const inputClass = "w-full px-4 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534]/30 focus:border-[#166534]";
  return (
    <div className="min-h-screen bg-[#FAFAF9] py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-start">
          <button onClick={() => navigate("/dashboard")} className="inline-flex items-center gap-2 text-sm font-medium text-[#374151] hover:text-[#111827]"><ArrowLeft className="w-4 h-4" /> Back to Dashboard</button>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
          <form onSubmit={handleSave} className="p-6">
            <div className="space-y-5">
                <h2 className="text-base font-semibold text-[#111827]">Account Information</h2>
                <label className="block text-sm font-medium text-[#374151]">Name<input name="name" value={profileForm.name} disabled={!editingProfile} onChange={(event) => setProfileForm({ ...profileForm, name: event.target.value })} className={`${inputClass} mt-2 disabled:bg-[#F9FAFB] disabled:text-[#6B7280]`} placeholder="Enter your name" /></label>
                <label className="block text-sm font-medium text-[#374151]">Email<input name="email" type="email" value={profileForm.email} disabled className={`${inputClass} mt-2 bg-[#F9FAFB] text-[#6B7280]`} /></label>
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setEditingProfile(true)}
                disabled={saving || editingProfile}
                className="w-full border border-[#166534] text-[#166534] hover:bg-[#F0FDF4] text-sm font-medium py-3 rounded-full flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Edit3 className="w-4 h-4 mr-2" /> Edit Information
              </button>
              <button
                type="submit"
                disabled={!editingProfile || saving || profileForm.name.trim() === savedName.trim()}
                className="w-full bg-[#166534] hover:bg-[#14532D] text-white text-sm font-medium py-3 rounded-full flex justify-center items-center disabled:bg-[#D1D5DB] disabled:text-[#6B7280] disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" /> {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
