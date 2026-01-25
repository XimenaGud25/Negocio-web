"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Calendar, FileVideo, Download, X } from "lucide-react";

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

interface UserVideosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName?: string;
}

export function UserVideosModal({ open, onOpenChange, userId, userName }: UserVideosModalProps) {
  const [videos, setVideos] = useState<UserVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<UserVideo | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchVideos = async () => {
    if (!open || !userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/users/${userId}/videos`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al cargar videos");
      }
      
      const data = await response.json();
      setVideos(data.videos || []);
    } catch (err) {
      console.error("Error fetching videos:", err);
      setError(err instanceof Error ? err.message : "Error al cargar videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [open, userId]);

  const handlePlayVideo = (video: UserVideo) => {
    setPlayingVideo(video);
  };

  const handleCloseVideoPlayer = () => {
    setPlayingVideo(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <FileVideo className="w-5 h-5 text-blue-600" />
              Videos de {userName || "Usuario"}
              <Badge variant="outline" className="ml-auto">
                {videos.length} videos
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Cargando videos...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {!loading && !error && videos.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileVideo className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No hay videos subidos
                </h3>
                <p className="text-gray-600">
                  Este usuario aún no ha subido ningún video.
                </p>
              </div>
            )}

            {!loading && !error && videos.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {videos.map((video) => (
                  <Card key={video.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileVideo className="w-6 h-6 text-blue-600" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {video.title || video.fileName}
                          </h4>
                          {video.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {video.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(video.uploadedAt)}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {formatFileSize(video.fileSize)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                        <Button
                          size="sm"
                          onClick={() => handlePlayVideo(video)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <a href={video.filePath} download target="_blank">
                            <Download className="w-4 h-4 mr-1" />
                            Descargar
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {playingVideo && (
        <Dialog open={!!playingVideo} onOpenChange={() => handleCloseVideoPlayer()}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{playingVideo.title || playingVideo.fileName}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseVideoPlayer}
                >
                  <X className="w-4 h-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  controls
                  autoPlay
                  className="w-full h-full"
                  src={playingVideo.filePath}
                >
                  Tu navegador no soporta el elemento de video.
                </video>
              </div>
              
              {playingVideo.description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Descripción</h4>
                  <p className="text-gray-700">
                    {playingVideo.description}
                  </p>
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Subido: {formatDate(playingVideo.uploadedAt)}</span>
                <span>Tamaño: {formatFileSize(playingVideo.fileSize)}</span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}