"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Loader2 } from "lucide-react";

interface VideoUploaderProps {
  userId: string;
  onVideoUploaded?: () => void;
}

export function VideoUploader({ userId, onVideoUploaded }: VideoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ["video/mp4", "video/avi", "video/mov", "video/quicktime", "video/x-msvideo"];
      if (!allowedTypes.includes(file.type)) {
        alert("Tipo de archivo no permitido. Solo se permiten videos MP4, AVI y MOV");
        return;
      }

      // Validar tamaño (100MB)
      if (file.size > 100 * 1024 * 1024) {
        alert("El archivo es demasiado grande. Máximo 100MB permitido");
        return;
      }

      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, "")); // Remover extensión
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("video", selectedFile);
      formData.append("title", title);
      formData.append("description", description);

      const response = await fetch(`/api/users/${userId}/videos`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al subir video");
      }

      // Resetear formulario
      setSelectedFile(null);
      setTitle("");
      setDescription("");
      
      // Reset file input
      const fileInput = document.getElementById("video-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      // Callback para refrescar la lista
      onVideoUploaded?.();

      alert("Video subido exitosamente");

    } catch (error) {
      console.error("Error uploading video:", error);
      alert(error instanceof Error ? error.message : "Error al subir video");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label 
          htmlFor="video-upload"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-800 border-dashed rounded-lg cursor-pointer bg-black hover:bg-gray-900 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-300">
              <span className="font-semibold">Haz clic para subir</span> tu video
            </p>
            <p className="text-xs text-gray-500">
              MP4, AVI, MOV (Máx. 100MB)
            </p>
          </div>
          <input
            id="video-upload"
            type="file"
            className="hidden"
            accept="video/*"
            onChange={handleFileSelect}
          />
        </label>
      </div>

      {selectedFile && (
        <>
          <div className="text-sm text-gray-300">
            Archivo seleccionado: <span className="text-yellow-400">{selectedFile.name}</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Título
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título del video"
                className="bg-black border-gray-800 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Descripción (opcional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe tu video..."
                className="w-full p-2 bg-black border border-gray-800 rounded-md text-white text-sm resize-none"
                rows={3}
              />
            </div>

            <Button
              onClick={handleUpload}
              disabled={isUploading || !title.trim()}
              className="w-full bg-yellow-400 text-black hover:bg-yellow-300 disabled:bg-gray-600 disabled:text-gray-400"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Subir Video
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}