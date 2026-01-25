"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Upload, Video, Calendar, Download } from "lucide-react";
import { VideoUploader } from "@/components/VideoUploader";
import { VideoList } from "@/components/VideoList";
import { DocumentViewer } from "@/components/ui/document-viewer";
import Link from "next/link";

interface Document {
  id: string;
  type: string;
  fileName?: string | null;
  filename?: string | null;
  filePath?: string | null;
  url?: string | null;
  fileSize?: number | null;
  description?: string | null;
  createdAt: Date | string;
}

interface UserVideo {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  title?: string | null;
  description?: string | null;
  uploadedAt: Date | string;
}

interface ClientDocumentsContentProps {
  userId: string;
}

export function ClientDocumentsContent({ userId }: ClientDocumentsContentProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [videos, setVideos] = useState<UserVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewerDoc, setViewerDoc] = useState<{ url: string; type?: string; filename?: string } | null>(null);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/documents`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      } else {
        console.error("Failed to fetch documents");
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const fetchVideos = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/videos`);
      if (response.ok) {
        const data = await response.json();
        setVideos(data.videos || []);
      } else {
        console.error("Failed to fetch videos");
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  const handleVideoUploaded = () => {
    fetchVideos();
  };

  const handleVideoDeleted = () => {
    fetchVideos();
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchDocuments(), fetchVideos()]);
      } catch (error) {
        setError("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Agrupar documentos por tipo
  const documentsByType = {
    DIET: documents.filter(doc => doc.type === "DIET"),
    TRAINING: documents.filter(doc => doc.type === "TRAINING"), 
    ROUTINE: documents.filter(doc => doc.type === "ROUTINE"),
    IMAGE: documents.filter(doc => doc.type === "IMAGE"),
    REPORT: documents.filter(doc => doc.type === "REPORT"),
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      DIET: "Dieta",
      TRAINING: "Entrenamiento",
      ROUTINE: "Rutina",
      IMAGE: "Imagen",
      REPORT: "Reporte",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      DIET: "bg-green-500/20 text-green-400 border-green-500/30",
      TRAINING: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      ROUTINE: "bg-purple-500/20 text-purple-400 border-purple-500/30", 
      IMAGE: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      REPORT: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    };
    return colors[type as keyof typeof colors] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando documentos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Mis Documentos</h1>
        <p className="text-gray-400 mt-1">
          Documentos enviados por tu entrenador y videos subidos
        </p>
      </div>

      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="bg-[#0f0f0f] border border-gray-800">
          <TabsTrigger value="documents" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            <FileText className="w-4 h-4 mr-2" />
            Documentos del Entrenador
          </TabsTrigger>
          <TabsTrigger value="videos" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            <Video className="w-4 h-4 mr-2" />
            Mis Videos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          {documents.length === 0 ? (
            <Card className="bg-[#0f0f0f] border-gray-800">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="w-16 h-16 text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  No hay documentos disponibles
                </h3>
                <p className="text-gray-400 text-center">
                  Tu entrenador no ha subido documentos aún.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(documentsByType).map(([type, docs]) => (
                docs.length > 0 && (
                  <Card key={type} className="bg-[#0f0f0f] border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        {getTypeLabel(type)}
                        <Badge className={getTypeColor(type)}>
                          {docs.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {docs.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 bg-black rounded-lg border border-gray-800"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="w-8 h-8 text-yellow-400 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-white truncate">
                                {doc.fileName || doc.filename || "Sin nombre"}
                              </p>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(doc.createdAt).toLocaleDateString("es-ES")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() =>
                                setViewerDoc({
                                  url: doc.filePath || doc.url || "",
                                  type: doc.type,
                                  filename: doc.fileName || doc.filename || "documento",
                                })
                              }
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-yellow-400 text-black rounded hover:bg-yellow-300 transition-colors"
                            >
                              <FileText className="w-3 h-3" />
                              Ver
                            </button>
                            <Link
                              href={doc.filePath || doc.url || "#"}
                              target="_blank"
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-yellow-400 text-black rounded hover:bg-yellow-300 transition-colors"
                            >
                              <Download className="w-3 h-3" />
                              Descargar
                            </Link>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card className="bg-[#0f0f0f] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Upload className="w-5 h-5 text-yellow-400" />
                    Subir Video
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <VideoUploader userId={userId} onVideoUploaded={handleVideoUploaded} />
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="bg-[#0f0f0f] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Video className="w-5 h-5 text-blue-400" />
                    Videos Subidos
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {videos.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <VideoList videos={videos} userId={userId} onVideoDeleted={handleVideoDeleted} />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      {viewerDoc && (
        <DocumentViewer
          open={!!viewerDoc}
          onOpenChange={(open) => {
            if (!open) setViewerDoc(null);
          }}
          url={viewerDoc?.url}
          type={viewerDoc?.type}
          filename={viewerDoc?.filename}
        />
      )}
    </div>
  );
}