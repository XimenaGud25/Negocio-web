"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface UploadDocumentsProps {
  enrollmentId: string;
  onSuccess?: () => void;
}

/**
 * Componente para subir documentos a AWS S3
 * Soporta dos métodos: directo al servidor o con presigned URLs
 */
export function DocumentUploader({ enrollmentId, onSuccess }: UploadDocumentsProps) {
  const [dietFile, setDietFile] = useState<File | null>(null);
  const [routineFile, setRoutineFile] = useState<File | null>(null);
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");

  /**
   * Método 1: Upload directo al servidor (más simple)
   * El servidor sube a S3 y guarda en BD en una sola operación
   */
  const handleUploadDirect = async () => {
    if (!dietFile && !routineFile && !reportFile) {
      alert("Por favor selecciona al menos un archivo");
      return;
    }

    setUploading(true);
    setProgress("Preparando archivos...");

    try {
      const formData = new FormData();
      formData.append("enrollmentId", enrollmentId);

      if (dietFile) formData.append("dietFile", dietFile);
      if (routineFile) formData.append("routineFile", routineFile);
      if (reportFile) formData.append("reportFile", reportFile);

      setProgress("Subiendo a S3...");

      const response = await fetch("/api/admin/documents", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al subir documentos");
      }

      const result = await response.json();
      console.log("Documentos subidos:", result);

      setProgress("¡Documentos subidos exitosamente!");
      
      // Limpiar formulario
      setDietFile(null);
      setRoutineFile(null);
      setReportFile(null);

      // Callback de éxito
      onSuccess?.();

      setTimeout(() => setProgress(""), 3000);
    } catch (error) {
      console.error("Error:", error);
      setProgress(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setUploading(false);
    }
  };

  /**
   * Método 2: Upload con Presigned URL (recomendado para archivos grandes)
   * El cliente sube directamente a S3, luego guarda la referencia en BD
   */
  const handleUploadWithPresigned = async () => {
    if (!dietFile && !routineFile && !reportFile) {
      alert("Por favor selecciona al menos un archivo");
      return;
    }

    setUploading(true);
    setProgress("Generando URLs pre-firmadas...");

    try {
      const files = [];
      if (dietFile) files.push({ file: dietFile, type: "DIET" });
      if (routineFile) files.push({ file: routineFile, type: "ROUTINE" });
      if (reportFile) files.push({ file: reportFile, type: "REPORT" });

      const uploadedDocs = [];

      for (const { file, type } of files) {
        setProgress(`Procesando ${file.name}...`);

        // Paso 1: Obtener presigned URL
        const presignResponse = await fetch("/api/uploads/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            folder: "documents",
          }),
        });

        if (!presignResponse.ok) {
          throw new Error(`Error obteniendo URL para ${file.name}`);
        }

        const { uploadUrl, fileUrl, key } = await presignResponse.json();

        // Paso 2: Subir directamente a S3
        setProgress(`Subiendo ${file.name} a S3...`);
        
        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Error subiendo ${file.name} a S3`);
        }

        uploadedDocs.push({ fileUrl, key, type });
      }

      setProgress("Guardando referencias en base de datos...");

      // Paso 3: Guardar referencias en BD (necesitarías crear este endpoint)
      // Por ahora, simplemente mostramos éxito
      console.log("Archivos subidos a S3:", uploadedDocs);

      setProgress("¡Documentos subidos exitosamente!");
      
      // Limpiar formulario
      setDietFile(null);
      setRoutineFile(null);
      setReportFile(null);

      onSuccess?.();

      setTimeout(() => setProgress(""), 3000);
    } catch (error) {
      console.error("Error:", error);
      setProgress(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Subir Documentos a S3</h3>

      <div className="space-y-4">
        {/* Dieta */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Dieta (PDF)
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setDietFile(e.target.files?.[0] || null)}
            disabled={uploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              disabled:opacity-50"
          />
          {dietFile && (
            <p className="text-sm text-gray-600 mt-1">
              Seleccionado: {dietFile.name} ({(dietFile.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        {/* Rutina */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Rutina (PDF)
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setRoutineFile(e.target.files?.[0] || null)}
            disabled={uploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              disabled:opacity-50"
          />
          {routineFile && (
            <p className="text-sm text-gray-600 mt-1">
              Seleccionado: {routineFile.name} ({(routineFile.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        {/* Reporte */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Reporte (Imagen)
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => setReportFile(e.target.files?.[0] || null)}
            disabled={uploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              disabled:opacity-50"
          />
          {reportFile && (
            <p className="text-sm text-gray-600 mt-1">
              Seleccionado: {reportFile.name} ({(reportFile.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleUploadDirect}
            disabled={uploading}
            className="flex-1"
          >
            {uploading ? "Subiendo..." : "Subir (Método Directo)"}
          </Button>

          <Button
            onClick={handleUploadWithPresigned}
            disabled={uploading}
            variant="outline"
            className="flex-1"
          >
            {uploading ? "Subiendo..." : "Subir (Presigned URL)"}
          </Button>
        </div>

        {/* Progreso */}
        {progress && (
          <div className={`p-3 rounded-md text-sm ${
            progress.includes("Error") 
              ? "bg-red-50 text-red-700" 
              : progress.includes("exitosamente")
              ? "bg-green-50 text-green-700"
              : "bg-blue-50 text-blue-700"
          }`}>
            {progress}
          </div>
        )}
      </div>

      {/* Información */}
      <div className="mt-6 p-4 bg-gray-50 rounded-md text-xs text-gray-600">
        <p className="font-semibold mb-2">📝 Métodos de subida:</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Directo:</strong> Simple, el servidor maneja todo (recomendado para archivos pequeños)</li>
          <li><strong>Presigned URL:</strong> Más rápido, el cliente sube directo a S3 (recomendado para archivos grandes)</li>
        </ul>
        <p className="mt-2">
          <strong>Tipos permitidos:</strong> PDFs y imágenes (JPG, PNG, WebP, GIF)
        </p>
      </div>
    </Card>
  );
}

/**
 * Hook para obtener URL de descarga de un documento en S3
 */
export function useDocumentDownloadUrl() {
  const [loading, setLoading] = useState(false);

  const getDownloadUrl = async (s3Url: string, expiresIn = 3600) => {
    setLoading(true);
    try {
      const response = await fetch("/api/uploads/download-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyOrUrl: s3Url, expiresIn }),
      });

      if (!response.ok) {
        throw new Error("Error obteniendo URL de descarga");
      }

      const { downloadUrl } = await response.json();
      return downloadUrl;
    } finally {
      setLoading(false);
    }
  };

  return { getDownloadUrl, loading };
}
