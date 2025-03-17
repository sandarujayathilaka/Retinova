
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ZoomIn, ZoomOut, X, Download, RotateCw, FileText } from "lucide-react";

const ImageViewerDialog = ({ image, onClose }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [rotation, setRotation] = useState(0);
  const imageContainerRef = useRef(null);

  const handleZoom = (direction) => {
    setZoomLevel((prev) => {
      const newZoom = direction === "in" ? prev * 1.2 : prev / 1.2;
      const clampedZoom = Math.min(Math.max(0.5, newZoom), 3);
      setPosition({ x: 0, y: 0 });
      return clampedZoom;
    });
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
    setPosition({ x: 0, y: 0 });
  };

  const handleImageLoad = (e) => {
    setImageSize({ width: e.target.naturalWidth, height: e.target.naturalHeight });
  };

  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !imageContainerRef.current) return;

    const container = imageContainerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const scaledWidth = imageSize.width * zoomLevel;
    const scaledHeight = imageSize.height * zoomLevel;

    const maxX = Math.max(0, (scaledWidth - containerWidth) / 2);
    const minX = -maxX;
    const maxY = Math.max(0, (scaledHeight - containerHeight) / 2);
    const minY = -maxY;

    let newX = e.clientX - startPos.x;
    let newY = e.clientY - startPos.y;

    newX = Math.min(Math.max(newX, minX), maxX);
    newY = Math.min(Math.max(newY, minY), maxY);

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDownload = () => {
    if (!image) return;
    
    const link = document.createElement('a');
    link.href = image;
    link.download = getCleanFileName(image);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (!image) {
      setPosition({ x: 0, y: 0 });
      setImageSize({ width: 0, height: 0 });
      setZoomLevel(1);
      setRotation(0);
    }
  }, [image]);

  const getCleanFileName = (path) => {
    if (!path) return "";
    const fileName = path.split("/").pop();
    return decodeURIComponent(fileName.replace(/^\d+_/, ""));
  };

  return (
    <Dialog open={!!image} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="max-w-5xl p-0 bg-gray-900 rounded-xl shadow-2xl border-0 overflow-hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="relative h-[85vh]" ref={imageContainerRef}>
          {/* Image container */}
          <div
            className="flex justify-center items-center overflow-hidden h-full cursor-grab"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ userSelect: "none" }}
          >
            {image && (
              <img
                src={image}
                alt="Enlarged view"
                className="w-auto h-auto object-contain max-h-full max-w-full"
                onLoad={handleImageLoad}
                style={{
                  transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
                  transition: isDragging ? "none" : "transform 0.2s ease-in-out",
                }}
              />
            )}
          </div>
          
          {/* Top toolbar */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white/10 backdrop-blur-sm p-2 rounded-full">
                <FileText className="h-5 w-5 text-white" />
                <span className="text-white ml-2 text-sm font-medium">
                  {image && getCleanFileName(image)}
                </span>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Controls toolbar */}
          <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center items-center bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-2 rounded-full">
              <Button
                onClick={() => handleZoom("in")}
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full bg-indigo-600/80 hover:bg-indigo-700/80 text-white"
                title="Zoom In"
              >
                <ZoomIn className="h-5 w-5" />
              </Button>
              <Button
                onClick={() => handleZoom("out")}
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full bg-indigo-600/80 hover:bg-indigo-700/80 text-white"
                title="Zoom Out"
              >
                <ZoomOut className="h-5 w-5" />
              </Button>
              <Button
                onClick={handleRotate}
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full bg-indigo-600/80 hover:bg-indigo-700/80 text-white"
                title="Rotate"
              >
                <RotateCw className="h-5 w-5" />
              </Button>
            
            </div>
          </div>
          
          {/* Zoom level indicator */}
          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
            {Math.round(zoomLevel * 100)}%
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewerDialog;