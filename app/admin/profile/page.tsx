"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id?: string;
  name: string;
  headline: string;
  bio: string;
  location: string;
  email: string;
  github_url: string;
  linkedin_url: string;
  resume_url: string;
  photo_url: string;
};

const emptyProfile: Profile = {
  name: "",
  headline: "",
  bio: "",
  location: "",
  email: "",
  github_url: "",
  linkedin_url: "",
  resume_url: "",
  photo_url: "",
};

export default function ProfileAdminPage() {
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [profileId, setProfileId] = useState<string | null>(null);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Profile load error:", error);
        setMessage("Failed to load profile.");
        setLoading(false);
        return;
      }

      if (data) {
        setProfile({
          id: data.id,
          name: data.name || "",
          headline: data.headline || "",
          bio: data.bio || "",
          location: data.location || "",
          email: data.email || "",
          github_url: data.github_url || "",
          linkedin_url: data.linkedin_url || "",
          resume_url: data.resume_url || "",
          photo_url: data.photo_url || "",
        });

        setProfileId(data.id);
        setPhotoPreview(data.photo_url || "");
      }

      setLoading(false);
    }

    loadProfile();
  }, []);

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;

    setProfile((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Photo must be smaller than 5MB.");
      return;
    }

    setMessage("");
    setPhotoFile(file);

    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
  }

  async function uploadPhoto(): Promise<string | null> {
    if (!photoFile) {
      return profile.photo_url || null;
    }

    const extension =
      photoFile.name.split(".").pop()?.toLowerCase() || "jpg";

    const fileName = `profile-${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const filePath = `profile/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-photos")
      .upload(filePath, photoFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: photoFile.type,
      });

    if (uploadError) {
      console.error("Photo upload error:", uploadError);
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage
      .from("profile-photos")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      let photoUrl = profile.photo_url || null;

      if (photoFile) {
        photoUrl = await uploadPhoto();
      }

      const profileData = {
        name: profile.name,
        headline: profile.headline || null,
        bio: profile.bio || null,
        location: profile.location || null,
        email: profile.email || null,
        github_url: profile.github_url || null,
        linkedin_url: profile.linkedin_url || null,
        resume_url: profile.resume_url || null,
        photo_url: photoUrl,
        updated_at: new Date().toISOString(),
      };

      if (profileId) {
        const { error } = await supabase
          .from("profiles")
          .update(profileData)
          .eq("id", profileId);

        if (error) {
          throw new Error(error.message);
        }
      } else {
        const { data, error } = await supabase
          .from("profiles")
          .insert(profileData)
          .select()
          .single();

        if (error) {
          throw new Error(error.message);
        }

        if (data) {
          setProfileId(data.id);
        }
      }

      setProfile((current) => ({
        ...current,
        photo_url: photoUrl || "",
      }));

      setPhotoFile(null);

      setMessage("Profile updated successfully.");
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Profile</h1>

        <p className="mt-2 text-gray-500">
          Manage the information displayed on your portfolio.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile Photo */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Profile Photo</h2>

          <p className="mt-1 text-sm text-gray-500">
            Upload a professional photo for your portfolio homepage.
          </p>

          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-40 w-40 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed bg-gray-50">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-center text-gray-400">
                  <div className="text-4xl">📷</div>
                  <p className="mt-2 text-xs">No photo</p>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="photo"
                className="inline-block cursor-pointer rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                Choose Photo
              </label>

              <input
                id="photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
                className="hidden"
              />

              <p className="mt-3 text-sm text-gray-500">
                JPG, PNG, or WebP.
                <br />
                Maximum size: 5MB.
              </p>

              {photoFile && (
                <p className="mt-2 text-sm font-medium text-green-600">
                  Selected: {photoFile.name}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Basic Information */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Basic Information</h2>

          <div className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium"
              >
                Name
              </label>

              <input
                id="name"
                name="name"
                value={profile.name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
              />
            </div>

            <div>
              <label
                htmlFor="headline"
                className="mb-2 block text-sm font-medium"
              >
                Headline
              </label>

              <input
                id="headline"
                name="headline"
                value={profile.headline}
                onChange={handleChange}
                placeholder="Computer Science Graduate Student | Data & Cloud"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
              />
            </div>

            <div>
              <label
                htmlFor="bio"
                className="mb-2 block text-sm font-medium"
              >
                Bio
              </label>

              <textarea
                id="bio"
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                rows={6}
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
              />
            </div>

            <div>
              <label
                htmlFor="location"
                className="mb-2 block text-sm font-medium"
              >
                Location
              </label>

              <input
                id="location"
                name="location"
                value={profile.location}
                onChange={handleChange}
                placeholder="Jersey City, NJ"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={profile.email}
                onChange={handleChange}
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
              />
            </div>
          </div>
        </section>

        {/* Links */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Links</h2>

          <div className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="github_url"
                className="mb-2 block text-sm font-medium"
              >
                GitHub URL
              </label>

              <input
                id="github_url"
                name="github_url"
                type="url"
                value={profile.github_url}
                onChange={handleChange}
                placeholder="https://github.com/..."
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
              />
            </div>

            <div>
              <label
                htmlFor="linkedin_url"
                className="mb-2 block text-sm font-medium"
              >
                LinkedIn URL
              </label>

              <input
                id="linkedin_url"
                name="linkedin_url"
                type="url"
                value={profile.linkedin_url}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/..."
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
              />
            </div>

            <div>
              <label
                htmlFor="resume_url"
                className="mb-2 block text-sm font-medium"
              >
                Resume URL
              </label>

              <input
                id="resume_url"
                name="resume_url"
                type="url"
                value={profile.resume_url}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
              />
            </div>
          </div>
        </section>

        {/* Save */}
        <div className="flex items-center justify-between">
          <div>
            {message && (
              <p
                className={`text-sm ${
                  message.includes("successfully")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-black px-6 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}