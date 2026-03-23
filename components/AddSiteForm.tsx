"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const LocationPicker = dynamic(() => import("./LocationPicker"), { ssr: false });

export default function AddSiteForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!lat || !lng) {
      setError("Click the map to set the site location.");
      return;
    }
    if (!name.trim()) {
      setError("Site name is required.");
      return;
    }

    setStatus("loading");
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in.");
      setStatus("error");
      return;
    }

    let photo_url: string | null = null;

    if (file) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("site-photos")
        .upload(path, file, { upsert: false });

      if (uploadError) {
        setError("Photo upload failed: " + uploadError.message);
        setStatus("error");
        return;
      }

      const { data: urlData } = supabase.storage
        .from("site-photos")
        .getPublicUrl(path);
      photo_url = urlData.publicUrl;
    }

    const { data: site, error: insertError } = await supabase
      .from("sites")
      .insert({
        name: name.trim(),
        description: description.trim() || null,
        photo_url,
        lat,
        lng,
        points_value: 10,
        created_by: user.id,
      })
      .select()
      .single();

    if (insertError) {
      setError("Failed to save site: " + insertError.message);
      setStatus("error");
      return;
    }

    router.push(`/sites/${site.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">Site name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Old City Hall"
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="A bit of history about this place…"
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Photo <span className="text-gray-400">(optional)</span>
        </label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
        {preview ? (
          <div className="relative">
            <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
            <button
              type="button"
              onClick={() => { setFile(null); setPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-amber-400 transition-colors"
          >
            <span className="text-2xl mb-1">📷</span>
            <span className="text-sm">Click to upload a photo</span>
          </button>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Location *{" "}
          {lat && lng && (
            <span className="text-xs text-gray-400 font-normal">
              ({lat.toFixed(5)}, {lng.toFixed(5)})
            </span>
          )}
        </label>
        <div className="h-64 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
          <LocationPicker
            onSelect={(l, g) => { setLat(l); setLng(g); }}
            selectedLat={lat}
            selectedLng={lng}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">Click the map to pin the site location.</p>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "loading" ? "Saving…" : "Add Site"}
      </button>
    </form>
  );
}
