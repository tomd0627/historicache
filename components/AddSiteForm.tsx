"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const LocationPicker = dynamic(() => import("./LocationPicker"), { ssr: false });

function resizeToBase64(file: File, maxPx: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("canvas 2d unavailable")); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.85).split(",")[1]);
    };
    img.onerror = reject;
    img.src = url;
  });
}

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
  const [aiHistory, setAiHistory] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));

    setAiHistory(null);
    setAiStatus("loading");
    try {
      const base64 = await resizeToBase64(f, 1024);
      const res = await fetch("/api/identify-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, mediaType: "image/jpeg" }),
      });
      const data = await res.json();
      if (data.history) {
        setAiHistory(data.history);
        setAiStatus("done");
        // Pre-fill name only if the user hasn't typed one yet
        if (data.name && !name.trim()) setName(data.name);
        // Pre-fill description (AI-generated, user can edit)
        setDescription(data.history);
        // Auto-pin location if AI recognised the site and user hasn't pinned yet
        if (data.lat && data.lng && lat === null) {
          setLat(data.lat);
          setLng(data.lng);
        }
      } else {
        setAiStatus("error");
      }
    } catch {
      setAiStatus("error");
    }
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
        setError(`Photo upload failed: ${uploadError.message}`);
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
        ai_history: aiHistory,
      })
      .select()
      .single();

    if (insertError) {
      setError(`Failed to save site: ${insertError.message}`);
      setStatus("error");
      return;
    }

    router.push(`/sites/${site.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="site-name" className="block text-sm font-medium mb-1 text-stone-700 dark:text-stone-300">
          Site name *
        </label>
        <input
          id="site-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Old City Hall"
          className="w-full border border-stone-300 dark:border-stone-600 rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-forest-500 text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="site-description" className="block text-sm font-medium mb-1 text-stone-700 dark:text-stone-300">
          Description
          {aiStatus === "done" && (
            <span className="ml-2 text-xs font-normal text-amber-600 dark:text-amber-400">AI-generated — feel free to edit</span>
          )}
        </label>
        <textarea
          id="site-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="A bit of history about this place…"
          className="w-full border border-stone-300 dark:border-stone-600 rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-forest-500 text-sm resize-none"
        />
      </div>

      <div>
        <label htmlFor="site-photo" className="block text-sm font-medium mb-1 text-stone-700 dark:text-stone-300">
          Photo <span className="text-stone-400 font-normal">(optional)</span>
        </label>
        <input
          ref={fileRef}
          id="site-photo"
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
        {preview ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
            <button
              type="button"
              onClick={() => { setFile(null); setPreview(null); setAiHistory(null); setAiStatus("idle"); if (fileRef.current) fileRef.current.value = ""; }}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full h-32 border-2 border-dashed border-stone-300 dark:border-stone-600 rounded-lg flex flex-col items-center justify-center text-stone-400 hover:border-forest-400 hover:text-forest-500 transition-colors"
          >
            <span className="text-2xl mb-1">📷</span>
            <span className="text-sm">Click to upload a photo</span>
          </button>
        )}
        {aiStatus === "loading" && (
          <p className="mt-2 text-sm text-stone-400 animate-pulse">Identifying historical site…</p>
        )}
        {aiStatus === "error" && (
          <p className="mt-2 text-xs text-stone-400">AI identification unavailable — fill in the details manually.</p>
        )}
      </div>

      <div>
        <p className="text-sm font-medium mb-2 text-stone-700 dark:text-stone-300">
          Location *{" "}
          {lat && lng && (
            <span className="text-xs text-stone-400 font-normal">
              ({lat.toFixed(5)}, {lng.toFixed(5)})
            </span>
          )}
        </p>
        <div className="h-64 rounded-lg overflow-hidden border border-stone-300 dark:border-stone-600">
          <LocationPicker
            onSelect={(l, g) => { setLat(l); setLng(g); }}
            selectedLat={lat}
            selectedLng={lng}
          />
        </div>
        <p className="text-xs text-stone-400 mt-1">Click the map to pin the site location.</p>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-3 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "loading" ? "Saving…" : "Add Site"}
      </button>
    </form>
  );
}
