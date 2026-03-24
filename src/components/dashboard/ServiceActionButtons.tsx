"use client";

import { useState, useRef } from "react";
import { iniciarServico, finalizarServico } from "@/actions/servico.actions";

interface ServicoData {
  id: string;
  status: string;
  fotoInicioUrl: string | null;
}

export function ServiceActionButtons({ servico }: { servico: ServicoData }) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const isInitial = servico.status === "INICIADO" && !servico.fotoInicioUrl;
  const canFinalize = servico.status === "PENDENTE_MB";

  if (!isInitial && !canFinalize) return null;

  async function compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          const maxWidth = 1600;
          if (width > maxWidth) {
            height = Math.round((maxWidth / width) * height);
            width = maxWidth;
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0, width, height);

          (function tryQuality(quality: number) {
            canvas.toBlob(
              (blob) => {
                if (!blob) return reject("Falha ao criar blob");
                if (blob.size / 1024 <= 380 || quality <= 0.4) {
                  const r = new FileReader();
                  r.onloadend = () => resolve(r.result as string);
                  r.readAsDataURL(blob);
                } else {
                  tryQuality(quality - 0.1);
                }
              },
              "image/jpeg",
              quality
            );
          })(0.9);
        };
        img.onerror = () => reject("Erro ao carregar imagem");
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  function getGeolocation(): Promise<{ lat: number; lng: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file);
      setPreview(compressed);
    } catch (err) {
      setMessage({ type: "error", text: String(err) });
    }
  }

  async function handleSubmit() {
    if (!preview) return;
    setLoading(true);
    setMessage(null);

    try {
      const geo = await getGeolocation();

      const action = isInitial ? iniciarServico : finalizarServico;
      const result = await action({
        servicoId: servico.id,
        lat: geo?.lat ?? null,
        lng: geo?.lng ?? null,
        fotoBase64: preview,
      });

      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: result.success! });
        setPreview(null);
        setShowUpload(false);
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (err) {
      setMessage({ type: "error", text: String(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {!showUpload ? (
        <button
          onClick={() => setShowUpload(true)}
          className={`btn w-full ${isInitial ? "btn-primary" : "btn-success"}`}
        >
          {isInitial ? "📷 Iniciar Serviço" : "📷 Finalizar Serviço"}
        </button>
      ) : (
        <div
          className="p-4 rounded-xl space-y-3"
          style={{
            background: "oklch(0.5 0.15 175 / 0.05)",
            border: "1px solid oklch(0.5 0.15 175 / 0.15)",
          }}
        >
          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            {isInitial ? "📷 Foto Inicial (obrigatória)" : "📷 Foto Final (obrigatória)"}
          </p>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="input text-sm"
          />

          {preview && (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full max-h-48 object-cover rounded-lg"
              />
              <button
                onClick={() => {
                  setPreview(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center text-sm hover:bg-black/80"
              >
                ✕
              </button>
            </div>
          )}

          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            📍 A geolocalização será capturada automaticamente
          </p>

          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                message.type === "success"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!preview || loading}
              className={`btn flex-1 ${isInitial ? "btn-primary" : "btn-success"}`}
            >
              {loading ? (
                <>
                  <div
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    style={{ animation: "spin 0.6s linear infinite" }}
                  />
                  Enviando...
                </>
              ) : (
                "Enviar"
              )}
            </button>
            <button
              onClick={() => {
                setShowUpload(false);
                setPreview(null);
              }}
              className="btn btn-ghost"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
