import { X, Download, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DocumentPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileUrl: string;
  fileName: string;
  fileType: string;
}

export function DocumentPreview({
  open,
  onOpenChange,
  fileUrl,
  fileName,
  fileType,
}: DocumentPreviewProps) {
  const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(
    fileType.toLowerCase()
  );
  const isPdf = fileType.toLowerCase() === "pdf";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Preview: {fileName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto rounded-lg border border-border bg-card p-4">
          {isPdf ? (
            <iframe
              src={fileUrl}
              className="w-full h-full border-0 rounded"
              title="Document Preview"
            />
          ) : isImage ? (
            <div className="flex items-center justify-center h-full">
              <img
                src={fileUrl}
                alt={fileName}
                className="max-w-full max-h-full object-contain rounded"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Preview not available</p>
                <p className="text-sm">
                  This file type ({fileType.toUpperCase()}) cannot be previewed.
                </p>
                <p className="text-xs mt-4">
                  Please download the file to view it.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Close
          </Button>
          <a
            href={fileUrl}
            download
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Download className="h-4 w-4" />
            Download
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
