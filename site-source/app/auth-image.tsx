"use client";

import { useEffect, useState } from "react";
import { apiFetch, onGithubPages } from "../lib/api-client";

export default function AuthImage({ src, alt }: { src: string; alt: string }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!onGithubPages()) return;
    let active = true;
    let objectUrl: string | null = null;
    apiFetch(src).then(response => {
      if (!response.ok) throw new Error("Photograph unavailable");
      return response.blob();
    }).then(blob => {
      if (!active) return;
      objectUrl = URL.createObjectURL(blob);
      setBlobUrl(objectUrl);
    }).catch(() => setBlobUrl(null));
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [src]);
  if (!onGithubPages()) return <img src={src} alt={alt} />;
  return blobUrl ? <img src={blobUrl} alt={alt} /> : <div className="image-loading">Photograph loading…</div>;
}
