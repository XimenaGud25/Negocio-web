# 💻 Ejemplos de Integración - Sistema S3

Ejemplos prácticos para integrar el sistema S3 en tu aplicación.

---

## 🎯 Caso 1: Página de Admin - Subir Documentos

### app/admin/usuario/[id]/documents.tsx

```typescript
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function UserDocumentsPage() {
  const params = useParams();
  const userId = params.id as string;
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState([]);

  // Método simple: upload directo
  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch('/api/admin/documents', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Error al subir');

      const result = await response.json();
      console.log('Documentos subidos:', result.documents);
      
      // Actualizar lista de documentos
      await fetchDocuments();
      
      // Limpiar formulario
      e.currentTarget.reset();
      
      alert('¡Documentos subidos exitosamente!');
    } catch (error) {
      console.error(error);
      alert('Error al subir documentos');
    } finally {
      setUploading(false);
    }
  };

  const fetchDocuments = async () => {
    const response = await fetch(`/api/admin/documents?enrollmentId=${userId}`);
    const data = await response.json();
    setDocuments(data.documents);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Documentos del Cliente</h1>

      {/* Formulario de Upload */}
      <Card className="p-6 mb-6">
        <form onSubmit={handleUpload}>
          <input type="hidden" name="enrollmentId" value={userId} />
          
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Dieta (PDF)</label>
              <input 
                type="file" 
                name="dietFile" 
                accept="application/pdf"
                className="block w-full"
              />
            </div>

            <div>
              <label className="block mb-2">Rutina (PDF)</label>
              <input 
                type="file" 
                name="routineFile" 
                accept="application/pdf"
                className="block w-full"
              />
            </div>

            <div>
              <label className="block mb-2">Reporte (Imagen)</label>
              <input 
                type="file" 
                name="reportFile" 
                accept="image/*"
                className="block w-full"
              />
            </div>

            <Button type="submit" disabled={uploading}>
              {uploading ? 'Subiendo...' : 'Subir Documentos'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Lista de documentos */}
      <DocumentsList documents={documents} />
    </div>
  );
}
```

---

## 🎯 Caso 2: Vista de Cliente - Descargar Documentos

### app/dashboard/client/documents/page.tsx

```typescript
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Document {
  id: string;
  type: string;
  filename: string;
  url: string;
  uploadedAt: string;
}

export default function ClientDocumentsPage() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/client/documents');
      const data = await response.json();
      setDocuments(data.documents);
    } catch (error) {
      console.error('Error cargando documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      // Obtener URL pre-firmada
      const response = await fetch('/api/uploads/download-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          keyOrUrl: doc.url,
          expiresIn: 3600 
        }),
      });

      if (!response.ok) throw new Error('Error obteniendo URL');

      const { downloadUrl } = await response.json();
      
      // Abrir en nueva pestaña
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al descargar documento');
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Mis Documentos</h1>

      <div className="grid gap-4">
        {documents.map((doc) => (
          <Card key={doc.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{doc.type}</h3>
                <p className="text-sm text-gray-600">{doc.filename}</p>
                <p className="text-xs text-gray-400">
                  {new Date(doc.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              <Button onClick={() => handleDownload(doc)}>
                Descargar
              </Button>
            </div>
          </Card>
        ))}

        {documents.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            No tienes documentos disponibles
          </p>
        )}
      </div>
    </div>
  );
}
```

---

## 🎯 Caso 3: Upload Progresivo con Presigned URL

### components/AdvancedDocumentUploader.tsx

```typescript
"use client";

import { useState } from "react";
import { Progress } from "@/components/ui/progress";

export function AdvancedDocumentUploader({ enrollmentId }: { enrollmentId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      // Paso 1: Obtener presigned URL (10%)
      setProgress(10);
      const presignResponse = await fetch('/api/uploads/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          folder: 'documents',
        }),
      });

      if (!presignResponse.ok) throw new Error('Error obteniendo presigned URL');

      const { uploadUrl, fileUrl, key } = await presignResponse.json();
      setProgress(30);

      // Paso 2: Subir a S3 con seguimiento de progreso
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = 30 + (e.loaded / e.total) * 60; // 30% - 90%
          setProgress(Math.round(percentComplete));
        }
      });

      await new Promise((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            setProgress(90);
            resolve(xhr.response);
          } else {
            reject(new Error('Upload failed'));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Upload failed')));
        
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

      // Paso 3: Guardar en base de datos (100%)
      await fetch('/api/admin/documents/save-reference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollmentId,
          fileUrl,
          key,
          filename: file.name,
          fileSize: file.size,
          type: 'DIET', // o el tipo que corresponda
        }),
      });

      setProgress(100);
      alert('¡Archivo subido exitosamente!');
      
      // Limpiar
      setFile(null);
      setProgress(0);
      
    } catch (error) {
      console.error('Error:', error);
      alert('Error al subir archivo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        disabled={uploading}
        className="block w-full"
      />

      {file && (
        <div>
          <p className="text-sm mb-2">{file.name} ({(file.size / 1024).toFixed(2)} KB)</p>
          
          {uploading && (
            <Progress value={progress} className="mb-2" />
          )}

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {uploading ? `Subiendo... ${progress}%` : 'Subir a S3'}
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 🎯 Caso 4: Visualizador de PDFs

### components/DocumentViewer.tsx

```typescript
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface DocumentViewerProps {
  documentUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentViewer({ documentUrl, isOpen, onClose }: DocumentViewerProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && documentUrl) {
      fetchSignedUrl();
    }
  }, [isOpen, documentUrl]);

  const fetchSignedUrl = async () => {
    try {
      const response = await fetch('/api/uploads/download-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          keyOrUrl: documentUrl,
          expiresIn: 7200 // 2 horas para visualización
        }),
      });

      const data = await response.json();
      setSignedUrl(data.downloadUrl);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            Cargando documento...
          </div>
        ) : signedUrl ? (
          <iframe
            src={signedUrl}
            className="w-full h-full border-0"
            title="Document Viewer"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            Error al cargar documento
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

---

## 🎯 Caso 5: Hook Personalizado para S3

### hooks/useS3Upload.ts

```typescript
import { useState } from "react";

interface UploadOptions {
  folder?: string;
  onProgress?: (progress: number) => void;
}

export function useS3Upload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (
    file: File, 
    options: UploadOptions = {}
  ): Promise<{ fileUrl: string; key: string } | null> => {
    const { folder = 'documents', onProgress } = options;
    
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Obtener presigned URL
      const presignResponse = await fetch('/api/uploads/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          folder,
        }),
      });

      if (!presignResponse.ok) {
        throw new Error('Error obteniendo presigned URL');
      }

      const { uploadUrl, fileUrl, key } = await presignResponse.json();

      // Subir a S3
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setProgress(percent);
          onProgress?.(percent);
        }
      });

      await new Promise((resolve, reject) => {
        xhr.addEventListener('load', () => {
          xhr.status === 200 ? resolve(xhr.response) : reject(new Error('Upload failed'));
        });
        xhr.addEventListener('error', () => reject(new Error('Upload failed')));
        
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

      setProgress(100);
      return { fileUrl, key };

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploadFile, uploading, progress, error };
}

// Uso:
// const { uploadFile, uploading, progress } = useS3Upload();
// 
// const result = await uploadFile(file, {
//   folder: 'documents',
//   onProgress: (p) => console.log(`${p}%`)
// });
```

---

## 🎯 Caso 6: Galería de Reportes (Imágenes)

### components/ReportsGallery.tsx

```typescript
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Report {
  id: string;
  url: string;
  filename: string;
  uploadedAt: string;
}

export function ReportsGallery({ enrollmentId }: { enrollmentId: string }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    const response = await fetch(`/api/admin/documents?enrollmentId=${enrollmentId}&type=REPORT`);
    const data = await response.json();
    setReports(data.documents);

    // Obtener URLs pre-firmadas para todas las imágenes
    const urls = await Promise.all(
      data.documents.map(async (doc: Report) => {
        const res = await fetch('/api/uploads/download-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keyOrUrl: doc.url }),
        });
        const { downloadUrl } = await res.json();
        return { id: doc.id, url: downloadUrl };
      })
    );

    const urlsMap = urls.reduce((acc, { id, url }) => {
      acc[id] = url;
      return acc;
    }, {} as Record<string, string>);

    setSignedUrls(urlsMap);
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {reports.map((report) => (
        <div key={report.id} className="border rounded-lg overflow-hidden">
          {signedUrls[report.id] ? (
            <Image
              src={signedUrls[report.id]}
              alt={report.filename}
              width={400}
              height={300}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 animate-pulse" />
          )}
          <div className="p-2 text-sm">
            <p className="truncate">{report.filename}</p>
            <p className="text-xs text-gray-500">
              {new Date(report.uploadedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## 🎯 Caso 7: Drag & Drop Upload

### components/DragDropUpload.tsx

```typescript
"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

export function DragDropUpload({ onUpload }: { onUpload: (file: File) => void }) {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0]);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif']
    },
    maxFiles: 1,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        transition-colors
        ${isDragging 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 hover:border-gray-400'
        }
      `}
    >
      <input {...getInputProps()} />
      <p className="text-gray-600">
        {isDragging
          ? '¡Suelta el archivo aquí!'
          : 'Arrastra un archivo o haz clic para seleccionar'
        }
      </p>
      <p className="text-sm text-gray-400 mt-2">
        PDFs o imágenes (JPG, PNG, WebP, GIF)
      </p>
    </div>
  );
}
```

---

## 📝 Resumen de Patrones

| Patrón | Cuándo Usar |
|--------|-------------|
| **Upload Directo** | Archivos pequeños, formularios simples |
| **Presigned URL** | Archivos grandes, necesitas progreso |
| **Batch Upload** | Múltiples archivos a la vez |
| **Lazy Loading** | Galerías con muchas imágenes |
| **Drag & Drop** | UX mejorada para uploads |
| **Hooks Custom** | Reutilizar lógica en múltiples componentes |

---

¿Necesitas más ejemplos? Consulta [DOCUMENTS_S3_UPLOAD.md](./DOCUMENTS_S3_UPLOAD.md)
