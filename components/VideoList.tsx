"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Play, MoreVertical, Calendar, Trash2, FileVideo, Download } from "lucide-react";

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

interface VideoListProps {
  videos: UserVideo[];
  userId?: string;
  onVideoDeleted?: () => void;
}

export function VideoList({ videos, userId, onVideoDeleted }: VideoListProps) {
  const [selectedVideo, setSelectedVideo] = useState<UserVideo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

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

  const handlePlayVideo = (video: UserVideo) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!userId) return;

    setIsDeleting(videoId);
    try {
      const response = await fetch(`/api/users/${userId}/videos?videoId=${videoId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al eliminar video");
      }

      onVideoDeleted?.();
    } catch (error) {
      console.error("Error deleting video:", error);
      alert(error instanceof Error ? error.message : "Error al eliminar video");
    } finally {
      setIsDeleting(null);
    }
  };

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileVideo className="w-16 h-16 text-gray-600 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          No hay videos subidos
        </h3>
        <p className="text-gray-400">
          Sube tu primer video para comenzar a compartir tu progreso
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {videos.map((video) => (
          <Card key={video.id} className="bg-black border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileVideo className="w-6 h-6 text-yellow-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate">
                      {video.title || video.fileName}
                    </h4>
                    {video.description && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {video.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(video.uploadedAt)}
                      </span>
                      <Badge variant="outline" className="text-xs border-gray-700">
                        {formatFileSize(video.fileSize)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePlayVideo(video)}
                    className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Ver
                  </Button>

                  {userId && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-[#0f0f0f] border-gray-800" align="end">
                        <DropdownMenuItem asChild>
                          <a 
                            href={video.filePath} 
                            download
                            className="flex items-center text-sm text-white hover:bg-gray-800"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Descargar
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.preventDefault();
                            if (window.confirm("¿Estás seguro de que quieres eliminar este video? Esta acción no se puede deshacer.")) {
                              handleDeleteVideo(video.id);
                            }
                          }}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          disabled={isDeleting === video.id}
                        >
                          {isDeleting === video.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400 mr-2"></div>
                          ) : (
                            <Trash2 className="w-4 h-4 mr-2" />
                          )}
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Video Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl bg-[#0f0f0f] border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedVideo?.title || selectedVideo?.fileName}
            </DialogTitle>
          </DialogHeader>
          
          {selectedVideo && (
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  controls
                  className="w-full h-full"
                  src={selectedVideo.filePath}
                  poster="/api/placeholder/800/450"
                >
                  Tu navegador no soporta el elemento de video.
                </video>
              </div>
              
              {selectedVideo.description && (
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">Descripción</h4>
                  <p className="text-sm text-gray-300">
                    {selectedVideo.description}
                  </p>
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Subido: {formatDate(selectedVideo.uploadedAt)}</span>
                <span>Tamaño: {formatFileSize(selectedVideo.fileSize)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}