import { useEffect, useState } from "react";
import { User, Mail, Lock, Save, Loader2, ArrowLeft, Bell, Globe, Monitor, Zap, Settings } from "lucide-react";
import { authAPI, settingsAPI } from "../api.js";
import { toast } from "react-toastify";

export default function Setting() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [settingsForm, setSettingsForm] = useState({
    systemSettings: {
      language: "en",
      timezone: "Asia/Kolkata",
      dateFormat: "DD/MM/YYYY"
    },
    notifications: {
      email: {
        enabled: true,
        newEvaluation: true,
        reportGenerated: true,
        statusUpdate: true
      },
      sms: {
        enabled: false,
        criticalAlerts: false
      },
      inApp: {
        enabled: true
      }
    },
    displaySettings: {
      theme: "light",
      compactMode: false,
      itemsPerPage: 20
    },
    defaults: {
      center: "",
      animalType: "",
      breed: ""
    }
  });

  // 🔥 FETCH USER AND SETTINGS ON LOAD
  useEffect(() => {
    const fetchUserAndSettings = async () => {
      try {
        // Fetch user profile
        const userData = await authAPI.getCurrentUser();
        console.log('👤 User API Response:', userData);

        // Handle different response structures
        const user = userData.data?.user || userData.data || userData.user || userData;

        console.log('👤 Extracted User:', user);

        if (user) {
          setUser(user);
          setProfileForm({
            name: user.name || "",
            email: user.email || "",
            password: ""
          });
        } else {
          console.error('❌ Could not extract user from response');
          toast.error("Could not load user data");
        }

        // Fetch settings
        try {
          const settingsData = await settingsAPI.get();
          console.log('📊 Settings API Response:', settingsData);

          // Handle different response structures
          const settings = settingsData.data || settingsData;

          if (settings && (settings.systemSettings || settings.notifications)) {
            setSettingsForm({
              systemSettings: settings.systemSettings || settingsForm.systemSettings,
              notifications: settings.notifications || settingsForm.notifications,
              displaySettings: settings.displaySettings || settingsForm.displaySettings,
              defaults: settings.defaults || settingsForm.defaults
            });
            console.log('✅ Settings loaded successfully');
          } else {
            console.log('ℹ️ No existing settings found, using defaults');
          }
        } catch (settingsErr) {
          console.log('ℹ️ Settings not found or error:', settingsErr);
          console.log('Using default settings');
        }
      } catch (err) {
        console.error("❌ Failed to load user info:", err);
        toast.error("Failed to load user information");
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndSettings();
  }, []);

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleSettingsChange = (section, field, value) => {
    setSettingsForm(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedChange = (section, subsection, field, value) => {
    setSettingsForm(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  // 🔥 FIXED SAVE FUNCTION - ACTUAL API CALLS
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let hasErrors = false;

      // Save Profile (if changed)
      if (activeTab === "profile") {
        try {
          const profileData = {
            name: profileForm.name,
            email: profileForm.email,
          };

          // Only include password if it's not empty
          if (profileForm.password && profileForm.password.trim() !== "") {
            profileData.password = profileForm.password;
          }

          console.log('🔄 Updating profile...', profileData);
          await authAPI.updateProfile(profileData);
          toast.success("Profile updated successfully!");

          // Clear password field after save
          setProfileForm(prev => ({ ...prev, password: "" }));
        } catch (err) {
          console.error("❌ Profile update failed:", err);
          toast.error(err || "Failed to update profile");
          hasErrors = true;
        }
      } else {
        // Save Settings for other tabs
        try {
          console.log('🔄 Updating settings...', settingsForm);

          // ✅ CORRECT: Send only settingsForm data
          const response = await settingsAPI.update(settingsForm);

          console.log('✅ Settings updated:', response);
          toast.success("Settings saved successfully!");
        } catch (err) {
          console.error("❌ Settings update failed:", err);
          toast.error(err || "Failed to save settings");
          hasErrors = true;
        }
      }

      if (!hasErrors) {
        console.log('✅ All changes saved successfully');
      }
    } catch (err) {
      console.error("❌ Save error:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleBackToDashboard = () => {
    window.location.href = "/dashboard";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex justify-center items-center">
        <Loader2 className="animate-spin w-5 h-5 mr-2 text-[#166534]" />
        <span className="text-sm text-[#6B7280]">Loading settings...</span>
      </div>
    );
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "system", label: "System", icon: Settings },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "display", label: "Display", icon: Monitor },
    { id: "defaults", label: "Defaults", icon: Globe }
  ];

  const inputClass =
    "w-full px-4 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534]/30 focus:border-[#166534]";

  return (
    <div className="min-h-screen bg-[#FAFAF9] py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={handleBackToDashboard}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#374151] hover:text-[#111827] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <span className="text-sm font-semibold tracking-tight text-[#111827]">Settings</span>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
          <div className="flex border-b border-[#E5E7EB] overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "text-[#166534] border-[#166534]"
                      : "text-[#6B7280] border-transparent hover:text-[#111827]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {activeTab === "profile" && (
              <div className="space-y-5">
                <h2 className="text-base font-semibold text-[#111827] mb-4">Account Information</h2>

                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    className={inputClass}
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    className={inputClass}
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">New Password</label>
                  <input
                    type="password"
                    name="password"
                    value={profileForm.password}
                    onChange={handleProfileChange}
                    className={inputClass}
                    placeholder="••••••••"
                  />
                  <p className="text-xs text-[#9CA3AF] mt-1">Leave blank to keep current password</p>
                </div>
              </div>
            )}

            {activeTab === "system" && (
              <div className="space-y-5">
                <h2 className="text-base font-semibold text-[#111827] mb-4">System Settings</h2>

                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">Language</label>
                  <select
                    value={settingsForm.systemSettings.language}
                    onChange={(e) => handleSettingsChange("systemSettings", "language", e.target.value)}
                    className={inputClass}
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="es">Spanish</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">Timezone</label>
                  <select
                    value={settingsForm.systemSettings.timezone}
                    onChange={(e) => handleSettingsChange("systemSettings", "timezone", e.target.value)}
                    className={inputClass}
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="America/New_York">America/New York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">Date Format</label>
                  <select
                    value={settingsForm.systemSettings.dateFormat}
                    onChange={(e) => handleSettingsChange("systemSettings", "dateFormat", e.target.value)}
                    className={inputClass}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-5">
                <h2 className="text-base font-semibold text-[#111827] mb-4">Notification Preferences</h2>

                <div className="border border-[#E5E7EB] rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-[#111827] mb-3">Email Notifications</h3>

                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-[#374151]">Enable Email Notifications</span>
                      <input
                        type="checkbox"
                        checked={settingsForm.notifications.email.enabled}
                        onChange={(e) => handleNestedChange("notifications", "email", "enabled", e.target.checked)}
                        className="w-4 h-4 rounded accent-[#166534]"
                      />
                    </label>

                    <label className="flex items-center justify-between">
                      <span className="text-sm text-[#374151]">New Evaluation Alerts</span>
                      <input
                        type="checkbox"
                        checked={settingsForm.notifications.email.newEvaluation}
                        onChange={(e) => handleNestedChange("notifications", "email", "newEvaluation", e.target.checked)}
                        className="w-4 h-4 rounded accent-[#166534]"
                      />
                    </label>

                    <label className="flex items-center justify-between">
                      <span className="text-sm text-[#374151]">Report Generated</span>
                      <input
                        type="checkbox"
                        checked={settingsForm.notifications.email.reportGenerated}
                        onChange={(e) => handleNestedChange("notifications", "email", "reportGenerated", e.target.checked)}
                        className="w-4 h-4 rounded accent-[#166534]"
                      />
                    </label>

                    <label className="flex items-center justify-between">
                      <span className="text-sm text-[#374151]">Status Updates</span>
                      <input
                        type="checkbox"
                        checked={settingsForm.notifications.email.statusUpdate}
                        onChange={(e) => handleNestedChange("notifications", "email", "statusUpdate", e.target.checked)}
                        className="w-4 h-4 rounded accent-[#166534]"
                      />
                    </label>
                  </div>
                </div>

                <div className="border border-[#E5E7EB] rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-[#111827] mb-3">SMS Notifications</h3>

                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-[#374151]">Enable SMS Notifications</span>
                      <input
                        type="checkbox"
                        checked={settingsForm.notifications.sms.enabled}
                        onChange={(e) => handleNestedChange("notifications", "sms", "enabled", e.target.checked)}
                        className="w-4 h-4 rounded accent-[#166534]"
                      />
                    </label>

                    <label className="flex items-center justify-between">
                      <span className="text-sm text-[#374151]">Critical Alerts Only</span>
                      <input
                        type="checkbox"
                        checked={settingsForm.notifications.sms.criticalAlerts}
                        onChange={(e) => handleNestedChange("notifications", "sms", "criticalAlerts", e.target.checked)}
                        className="w-4 h-4 rounded accent-[#166534]"
                      />
                    </label>
                  </div>
                </div>

                <div className="border border-[#E5E7EB] rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-[#111827] mb-3">In-App Notifications</h3>

                  <label className="flex items-center justify-between">
                    <span className="text-sm text-[#374151]">Enable In-App Notifications</span>
                    <input
                      type="checkbox"
                      checked={settingsForm.notifications.inApp.enabled}
                      onChange={(e) => handleNestedChange("notifications", "inApp", "enabled", e.target.checked)}
                      className="w-4 h-4 rounded accent-[#166534]"
                    />
                  </label>
                </div>
              </div>
            )}

            {activeTab === "display" && (
              <div className="space-y-5">
                <h2 className="text-base font-semibold text-[#111827] mb-4">Display Preferences</h2>

                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">Theme</label>
                  <div className="grid grid-cols-3 gap-3">
                    {["light", "dark", "auto"].map((theme) => (
                      <button
                        key={theme}
                        type="button"
                        onClick={() => handleSettingsChange("displaySettings", "theme", theme)}
                        className={`p-3 text-sm border rounded-xl capitalize transition-colors ${
                          settingsForm.displaySettings.theme === theme
                            ? "border-[#166534] bg-[#F0FDF4] text-[#166534]"
                            : "border-[#E5E7EB] bg-white text-[#374151] hover:border-[#D1D5DB]"
                        }`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center justify-between border border-[#E5E7EB] rounded-xl p-4">
                  <div>
                    <span className="text-sm font-medium text-[#111827] block">Compact Mode</span>
                    <span className="text-xs text-[#9CA3AF]">Reduce spacing and padding</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsForm.displaySettings.compactMode}
                    onChange={(e) => handleSettingsChange("displaySettings", "compactMode", e.target.checked)}
                    className="w-4 h-4 rounded accent-[#166534]"
                  />
                </label>

                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">Items Per Page</label>
                  <input
                    type="number"
                    value={settingsForm.displaySettings.itemsPerPage}
                    onChange={(e) => handleSettingsChange("displaySettings", "itemsPerPage", parseInt(e.target.value))}
                    className={inputClass}
                    min="10"
                    max="100"
                  />
                </div>
              </div>
            )}

            {activeTab === "defaults" && (
              <div className="space-y-5">
                <h2 className="text-base font-semibold text-[#111827] mb-4">Default Values</h2>

                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">Default Center</label>
                  <input
                    type="text"
                    value={settingsForm.defaults.center}
                    onChange={(e) => handleSettingsChange("defaults", "center", e.target.value)}
                    className={inputClass}
                    placeholder="Enter default center name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">Default Animal Type</label>
                  <input
                    type="text"
                    value={settingsForm.defaults.animalType}
                    onChange={(e) => handleSettingsChange("defaults", "animalType", e.target.value)}
                    className={inputClass}
                    placeholder="e.g., Cattle, Buffalo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">Default Breed</label>
                  <input
                    type="text"
                    value={settingsForm.defaults.breed}
                    onChange={(e) => handleSettingsChange("defaults", "breed", e.target.value)}
                    className={inputClass}
                    placeholder="Enter default breed"
                  />
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-[#166534] hover:bg-[#14532D] text-white text-sm font-medium py-3 rounded-full flex justify-center items-center transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save All Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}