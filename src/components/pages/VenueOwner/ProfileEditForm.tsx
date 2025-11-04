import React, { useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../Api/urls";

export default function ProfileEditForm({
  profile,
  setProfile,
}: {
  profile: any;
  setProfile: (p: any) => void;
}) {
  const [form, setForm] = useState({
    name: profile.name || "",
    email: profile.email || "",
    phone: profile.phone || "",
    address: profile.address || "",
    profile_image: profile.profile_image || "",
    user_type: profile.user_type || "venue_owner",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    profile.profile_image || null
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f) {
      setSelectedFile(f);
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
      setForm((prev) => ({ ...prev, profile_image: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      let res;
      if (selectedFile) {
        const fd = new FormData();
        fd.append("profile_image", selectedFile);
        fd.append("name", form.name);
        fd.append("email", form.email);
        fd.append("phone", form.phone);
        fd.append("address", form.address);
        res = await axiosInstance.patch("/api/user-dashboard/profile/", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await axiosInstance.patch("/api/user-dashboard/profile/", form);
      }
      setProfile(res.data);
      setSuccess(true);
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      setError("Failed to update profile");
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl bg-gray-50 rounded-lg shadow p-6"
    >
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">Name</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">Phone</label>
        <input
          type="text"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">Address</label>
        <input
          type="text"
          name="address"
          value={form.address}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">
          Profile Image URL
        </label>
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className=""
          />
          <input
            type="text"
            name="profile_image"
            value={form.profile_image}
            onChange={handleChange}
            placeholder="Or paste an image URL"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
        {(previewUrl || form.profile_image) && (
          <img
            src={previewUrl || form.profile_image}
            alt="Profile"
            className="w-20 h-20 rounded-full mt-2 border"
          />
        )}
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">
          User Type
        </label>
        <input
          type="text"
          name="user_type"
          value={form.user_type}
          disabled
          className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-500"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">Joined</label>
        <input
          type="text"
          value={
            profile.date_joined
              ? new Date(profile.date_joined).toLocaleDateString()
              : "-"
          }
          disabled
          className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-500"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">Status</label>
        <span
          className={`text-sm font-semibold px-2 py-1 rounded ${
            profile.is_active
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {profile.is_active ? "Active" : "Inactive"}
        </span>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">Profile updated!</div>}
      <button
        type="submit"
        className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
