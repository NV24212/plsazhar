import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useData } from "@/contexts/DataContext";
import { useDialog } from "@/contexts/DialogContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUpload({
  images,
  onImagesChange,
  maxImages = 5,
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { uploadImage } = useData();
  const { showAlert } = useDialog();
  const { t } = useLanguage();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);

      const files = Array.from(e.dataTransfer.files);
      const imageFiles = files.filter((file) => file.type.startsWith("image/"));

      if (imageFiles.length === 0) {
        showAlert({
          title: t("message.error"),
          message: t("products.dragImages"),
          type: "warning",
        });
        return;
      }

      await handleFiles(imageFiles);
    },
    [images, maxImages, onImagesChange, uploadImage],
  );

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      await handleFiles(files);
      // Reset input
      e.target.value = "";
    },
    [images, maxImages, onImagesChange, uploadImage],
  );

  const handleFiles = async (files: File[]) => {
    if (images.length + files.length > maxImages) {
      showAlert({
        title: t("message.error"),
        message: t("products.maxImages"),
        type: "warning",
      });
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = files.map((file) => uploadImage(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      onImagesChange([...images, ...uploadedUrls]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("message.uploadError");
      showAlert({
        title: t("message.error"),
        message: errorMessage,
        type: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          dragActive
            ? "border-dashboard-primary bg-dashboard-primary/5"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-8">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 mb-4 flex items-center justify-center rounded-full bg-gray-100">
              {uploading ? (
                <Loader2 className="w-6 h-6 animate-spin text-dashboard-primary" />
              ) : (
                <Upload className="w-6 h-6 text-gray-600" />
              )}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {uploading ? t("common.loading") : t("products.productImages")}
            </h3>
            <p className="text-gray-600 mb-4">{t("products.dragImages")}</p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileInput}
              className="hidden"
              id="image-upload"
              disabled={uploading || images.length >= maxImages}
            />
            <Button
              type="button"
              variant="outline"
              disabled={uploading || images.length >= maxImages}
              className="cursor-pointer"
              onClick={() => {
                const input = document.getElementById(
                  "image-upload",
                ) as HTMLInputElement;
                input?.click();
              }}
            >
              <Upload className="w-4 h-4 mr-2" />
              {t("products.uploadImages")}
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              {images.length}/{maxImages} {t("products.images")} •{" "}
              {t("products.maxImages")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", index.toString());
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const fromIndex = parseInt(
                  e.dataTransfer.getData("text/plain"),
                );
                moveImage(fromIndex, index);
              }}
            >
              <img
                src={imageUrl}
                alt={`Product image ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlmYTZiMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJyb2tlbiBJbWFnZTwvdGV4dD48L3N2Zz4=";
                }}
              />

              {/* Image Controls */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => removeImage(index)}
                  className="text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Primary Image Badge */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-dashboard-primary text-white text-xs px-2 py-1 rounded">
                  {t("products.primaryImage")}
                </div>
              )}

              {/* Drag Handle */}
              <div className="absolute top-2 right-2 [dir=rtl]:right-auto [dir=rtl]:left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-6 h-6 bg-white/80 rounded flex items-center justify-center cursor-move">
                  <div className="w-2 h-2 grid grid-cols-2 gap-0.5">
                    <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                    <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                    <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                    <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>{t("products.noImages")}</p>
        </div>
      )}
    </div>
  );
}
