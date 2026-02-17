import { Lock, FileText, Download, Eye } from "lucide-react";
import { Resource } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import { StarRating } from "./StarRating";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface ResourceCardProps {
  resource: Resource & { tags?: string[]; batch?: string };
  index?: number;
}

const typeColors: Record<string, string> = {
  Notes: "bg-primary/15 text-primary",
  Solutions: "bg-success/15 text-success",
  "Question Papers": "bg-warning/15 text-warning",
  "Lab Reports": "bg-accent text-accent-foreground",
  Other: "bg-muted text-muted-foreground",
};

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function ResourceCard({ resource, index = 0 }: ResourceCardProps) {
  const { user } = useAuth();
  const isLocked = resource.isPrivate && user?.college !== resource.uploaderCollege;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link
        to={`/resource/${resource.id}`}
        className="group relative block overflow-hidden rounded-xl glass transition-all duration-300 hover:neon-border hover:-translate-y-1"
      >
        {/* Lock overlay */}
        {isLocked && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm">
            <Lock className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="px-4 text-center text-xs text-muted-foreground">
              Private — only for {resource.uploaderCollege} students
            </p>
          </div>
        )}

        <div className="p-5">
          {/* Header */}
          <div className="mb-3 flex items-start justify-between gap-2">
            <span className={`rounded-md px-2 py-1 text-xs font-medium ${typeColors[resource.type] || typeColors.Other}`}>
              {resource.type}
            </span>
            {resource.isPrivate && <Lock className="h-4 w-4 text-muted-foreground" />}
          </div>

          {/* Title */}
          <h3 className="mb-2 font-display text-base font-semibold leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {resource.title}
          </h3>

          {/* Meta */}
          <div className="mb-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>{resource.subject}</span>
            <span>•</span>
            <span>Sem {resource.semester}</span>
            <span>•</span>
            <span>{resource.department}</span>
          </div>

          {/* Rating */}
          <div className="mb-3 flex items-center gap-2">
            <StarRating rating={resource.averageRating} size="sm" />
            <span className="text-xs text-muted-foreground">
              {resource.averageRating.toFixed(1)} ({resource.totalRatings})
            </span>
          </div>

          {/* Tags */}
          {resource.tags && resource.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1">
              {resource.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                  #{tag}
                </span>
              ))}
              {resource.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">+{resource.tags.length - 3}</span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              <span>{resource.fileType.toUpperCase()} · {formatSize(resource.fileSize)}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><Download className="h-3.5 w-3.5" /> {resource.downloads}</span>
              <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {resource.downloads + 50}</span>
            </div>
          </div>

          {/* Uploader */}
          <div className="mt-3 text-xs text-muted-foreground">
            by <span className="font-medium text-foreground">{resource.uploaderName}</span> · {resource.uploaderCollege}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
