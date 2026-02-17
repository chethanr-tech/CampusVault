import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { StarRating } from "@/components/StarRating";
import { DocumentPreview } from "@/components/DocumentPreview";
import { Lock, Download, FileText, ArrowLeft, Shield, UserPlus, X, Mail, Check, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface ResourceData {
  id: string;
  title: string;
  subject: string;
  semester: number;
  department: string;
  type: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploader_id: string;
  uploader_name: string;
  uploader_college: string;
  privacy: string;
  downloads: number;
  average_rating: number;
  total_ratings: number;
  created_at: string;
  shared_with?: string[];
  restricted_to_university?: string;
}

interface ReviewData {
  id: string;
  resource_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function ResourceDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [resource, setResource] = useState<ResourceData | null>(null);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [sharing, setSharing] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingResource, setIsEditingResource] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    subject: "",
    department: "",
    type: "",
    batch: "",
    tags: "",
  });

  useEffect(() => {
    if (!id) return;
    Promise.all([fetchResource(id), fetchReviews(id)]).catch(console.error);
  }, [id]);

  async function fetchResource(resourceId: string) {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('id', resourceId)
        .single();

      if (error) throw error;
      setResource(data);
    } catch (error) {
      console.error("Error fetching resource:", error);
      setResource(null);
    } finally {
      setLoading(false);
    }
  }

  async function fetchReviews(resourceId: string) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('resource_id', parseInt(resourceId))
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  }

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  }

  if (!resource) {
    return <div className="flex min-h-[60vh] items-center justify-center"><p>Resource not found</p></div>;
  }

  const isOwner = user?.id === resource.uploader_id;
  
  // College-based access control for private resources
  const isPrivateResource = resource.privacy === 'private';
  const isSharedWithUser = resource.shared_with?.includes(user?.id || '') || false;
  const isSameCollege = user && resource.uploader_college && user.college === resource.uploader_college;
  const canAccess = !isPrivateResource || isOwner || isSharedWithUser || isSameCollege;

  // Access denied UI
  if (!canAccess) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6 lg:px-8">
        <button
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-center">
            <Lock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-2 font-display text-lg font-semibold">Access Denied</p>
            <p className="text-sm text-muted-foreground">This is a private resource. Only the owner and their college classmates can access it.</p>
          </div>
        </div>
      </div>
    );
  }
  const hasReviewed = reviews.some((r) => r.user_id === user?.id);

  // Delete resource
  const handleDeleteResource = async () => {
    if (!id || !isOwner) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: "Resource deleted", description: "Your resource has been removed" });
      navigate('/');
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsDeleting(false);
    }
  };

  // Start editing resource
  const handleStartEdit = () => {
    if (!resource) return;
    setEditForm({
      title: resource.title,
      subject: resource.subject,
      department: resource.department,
      type: resource.type,
      batch: (resource as any).batch || "",
      tags: ((resource as any).tags || []).join(", "),
    });
    setIsEditingResource(true);
  };

  // Save edited resource
  const handleSaveResourceEdit = async () => {
    if (!id || !isOwner || !resource) return;
    try {
      const { error } = await supabase
        .from('resources')
        .update({
          title: editForm.title.trim(),
          subject: editForm.subject.trim(),
          department: editForm.department.trim(),
          type: editForm.type,
          batch: editForm.batch || new Date().getFullYear().toString(),
          tags: editForm.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0),
        })
        .eq('id', id);

      if (error) throw error;

      await fetchResource(id);
      setIsEditingResource(false);
      toast({ title: "Resource updated", description: "Your changes have been saved" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || !resource) return;
    setReviewError("");
    setSubmitting(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        resource_id: parseInt(id),
        user_id: user.id,
        user_name: user.name,
        rating: newRating,
        comment: newComment,
      });

      if (error) throw error;

      // Fetch all reviews to calculate new average
      const { data: allReviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('resource_id', parseInt(id));

      if (allReviews && allReviews.length > 0) {
        const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = totalRating / allReviews.length;

        // Update resource with new ratings
        await supabase
          .from('resources')
          .update({
            average_rating: parseFloat(avgRating.toFixed(2)),
            total_ratings: allReviews.length,
          })
          .eq('id', parseInt(id));
      }

      // Refresh reviews and resource
      await fetchReviews(id);
      await fetchResource(id);
      setNewRating(0);
      setNewComment("");
      toast({ title: "Review submitted!", description: "Thank you for your feedback" });
    } catch (err: any) {
      setReviewError(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareEmail || !id || !isOwner) return;
    setSharing(true);
    try {
      const sharedWith = resource.shared_with || [];
      if (!sharedWith.includes(shareEmail)) {
        sharedWith.push(shareEmail);
      }
      
      const { error } = await supabase
        .from('resources')
        .update({ shared_with: sharedWith })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setResource({ ...resource, shared_with: sharedWith });
      toast({ title: "Shared successfully", description: `Resource shared with ${shareEmail}` });
      setShareEmail("");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setSharing(false);
    }
  };

  // Remove shared access
  const handleUnshare = async (email: string) => {
    if (!resource || !id) return;
    try {
      const sharedWith = (resource.shared_with || []).filter((e) => e !== email);
      const { error } = await supabase
        .from('resources')
        .update({ shared_with: sharedWith })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setResource({ ...resource, shared_with: sharedWith });
      toast({ title: "Access removed", description: `Removed access for ${email}` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  // Delete review
  const handleDeleteReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      // Fetch remaining reviews and update resource ratings
      if (id) {
        const { data: remainingReviews } = await supabase
          .from('reviews')
          .select('rating')
          .eq('resource_id', parseInt(id));

        if (remainingReviews && remainingReviews.length > 0) {
          const totalRating = remainingReviews.reduce((sum, r) => sum + r.rating, 0);
          const avgRating = totalRating / remainingReviews.length;

          await supabase
            .from('resources')
            .update({
              average_rating: parseFloat(avgRating.toFixed(2)),
              total_ratings: remainingReviews.length,
            })
            .eq('id', parseInt(id));
        } else {
          // No reviews left
          await supabase
            .from('resources')
            .update({
              average_rating: 0,
              total_ratings: 0,
            })
            .eq('id', parseInt(id));
        }

        await fetchReviews(id);
        await fetchResource(id);
      }
      toast({ title: "Review deleted", description: "Your review has been removed" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  // Edit review
  const handleEditReview = (review: ReviewData) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  // Save edited review
  const handleSaveEdit = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ rating: editRating, comment: editComment })
        .eq('id', reviewId);

      if (error) throw error;

      // Recalculate ratings
      if (id) {
        const { data: allReviews } = await supabase
          .from('reviews')
          .select('rating')
          .eq('resource_id', parseInt(id));

        if (allReviews && allReviews.length > 0) {
          const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
          const avgRating = totalRating / allReviews.length;

          await supabase
            .from('resources')
            .update({
              average_rating: parseFloat(avgRating.toFixed(2)),
              total_ratings: allReviews.length,
            })
            .eq('id', parseInt(id));
        }

        await fetchReviews(id);
        await fetchResource(id);
      }
      setEditingReviewId(null);
      setEditRating(0);
      setEditComment("");
      toast({ title: "Review updated", description: "Your review has been updated" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };



  return (
    <div className="mx-auto max-w-4xl px-4 py-6 lg:px-8">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Access Denied */}
      {!canAccess ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center rounded-2xl glass-strong py-20">
          <Shield className="mb-4 h-16 w-16 text-destructive/60" />
          <h2 className="mb-2 font-display text-xl font-bold">Access Denied</h2>
          <p className="max-w-sm text-center text-sm text-muted-foreground">
            This is a private resource and you don't have access to it.
          </p>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Resource Header */}
          <div className="mb-8 rounded-2xl glass-strong p-6 lg:p-8">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">{resource.type}</span>
              {isPrivateResource && (
                <span className="flex items-center gap-1 rounded-md bg-warning/15 px-2.5 py-1 text-xs font-medium text-warning">
                  <Lock className="h-3 w-3" /> Private
                </span>
              )}
              {resource.restricted_to_university && (
                <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  {resource.restricted_to_university} Only
                </span>
              )}
            </div>
            <h1 className="mb-3 font-display text-2xl font-bold lg:text-3xl">{resource.title}</h1>
            <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span>{resource.subject}</span>
              <span>Semester {resource.semester}</span>
              <span>{resource.department}</span>
            </div>
            <div className="mb-6 flex items-center gap-4">
              <StarRating rating={resource.average_rating} />
              <span className="text-sm text-muted-foreground">{resource.average_rating.toFixed(1)} ({resource.total_ratings} ratings)</span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2 rounded-xl bg-primary/10 px-6 py-3 text-sm font-semibold text-primary hover:bg-primary/20 transition-colors"
              >
                <Eye className="h-4 w-4" /> Preview
              </button>
              <button 
                onClick={async () => {
                  try {
                    // Increment downloads count
                    await supabase
                      .from('resources')
                      .update({ downloads: resource.downloads + 1 })
                      .eq('id', id);
                    
                    // Refresh resource to show updated count
                    if (id) await fetchResource(id);
                    
                    // Trigger download
                    const link = document.createElement('a');
                    link.href = resource.file_url;
                    link.download = true;
                    link.click();
                  } catch (err) {
                    console.error('Download error:', err);
                  }
                }}
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Download className="h-4 w-4" /> Download
              </button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                {resource.file_type.toUpperCase()} · {(resource.file_size / (1024 * 1024)).toFixed(1)} MB
              </div>
              <span className="text-sm text-muted-foreground">{resource.downloads} downloads</span>
            </div>
            <div className="mt-6 border-t border-border pt-4 text-sm text-muted-foreground">
              Uploaded by <span className="font-medium text-foreground">{resource.uploader_name}</span> · {resource.uploader_college}
            </div>
          </div>
          {/* Resource Management (for resource owner) */}
          {isOwner && (
            <div className="mb-8 rounded-2xl glass-strong p-6 lg:p-8 border border-destructive/20">
              <h2 className="mb-4 font-display text-xl font-bold flex items-center gap-2">
                <Shield className="h-5 w-5 text-destructive" /> Manage Resource
              </h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Edit metadata or delete this resource. Delete action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleStartEdit}
                  className="rounded-lg border border-primary/30 px-6 py-3 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                >
                  Edit Details
                </button>
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this resource? This action cannot be undone.")) {
                      handleDeleteResource();
                    }
                  }}
                  disabled={isDeleting}
                  className="rounded-lg border border-destructive/30 px-6 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50 transition-colors"
                >
                  {isDeleting ? "Deleting..." : "Delete Resource"}
                </button>
              </div>
            </div>
          )}
          {/* Edit Resource Form */}
          {isEditingResource && isOwner && (
            <div className="mb-8 rounded-2xl glass-strong p-6 lg:p-8 border border-primary/20">
              <h2 className="mb-4 font-display text-xl font-bold">Edit Resource Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Subject</label>
                    <input
                      type="text"
                      value={editForm.subject}
                      onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                      className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Department</label>
                    <input
                      type="text"
                      value={editForm.department}
                      onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                      className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Type</label>
                    <select
                      value={editForm.type}
                      onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                      className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="Notes">Notes</option>
                      <option value="Solutions">Solutions</option>
                      <option value="Question Papers">Question Papers</option>
                      <option value="Lab Reports">Lab Reports</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Batch</label>
                    <select
                      value={editForm.batch}
                      onChange={(e) => setEditForm({ ...editForm, batch: e.target.value })}
                      className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      {Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - i)
                        .sort()
                        .map((year) => (
                          <option key={year} value={year.toString()}>
                            Batch {year}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Tags</label>
                  <input
                    type="text"
                    value={editForm.tags}
                    onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                    placeholder="e.g., semester3, algorithms, important"
                    className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Comma-separated keywords</p>
                </div>
                <div className="flex gap-3 border-t border-border pt-4">
                  <button
                    onClick={handleSaveResourceEdit}
                    className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditingResource(false)}
                    className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Share Management (for resource owner) */}
          {isOwner && isPrivateResource && (
            <div className="mb-8 rounded-2xl glass-strong p-6 lg:p-8">
              <h2 className="mb-4 font-display text-xl font-bold flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" /> Share Access
              </h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Grant access to specific users by entering their email address.
              </p>
              <form onSubmit={handleShare} className="mb-4 flex gap-2">
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="flex-1 rounded-lg border border-border bg-card px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="submit"
                  disabled={sharing || !shareEmail}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {sharing ? "Sharing..." : "Share"}
                </button>
              </form>

              {/* Shared with list */}
              {resource.shared_with && resource.shared_with.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold">Shared with:</h3>
                  <div className="space-y-2">
                    {resource.shared_with.map((email) => (
                      <div key={email} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-primary" />
                          <span className="text-sm">{email}</span>
                        </div>
                        <button
                          onClick={() => handleUnshare(email)}
                          className="rounded p-1 text-destructive hover:bg-destructive/10"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reviews */}
          <div className="rounded-2xl glass-strong p-6 lg:p-8">
            <h2 className="mb-6 font-display text-xl font-bold">Reviews ({reviews.length})</h2>

            {/* Add Review */}
            {user && !hasReviewed && (
              <form onSubmit={submitReview} className="mb-8 rounded-xl border border-border p-5">
                <h3 className="mb-3 text-sm font-semibold">Write a Review</h3>
                {reviewError && <p className="mb-3 text-sm text-destructive">{reviewError}</p>}
                <div className="mb-3">
                  <StarRating rating={newRating} interactive onChange={setNewRating} />
                </div>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="mb-3 w-full rounded-lg border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                  rows={3}
                  required
                />
                <button type="submit" disabled={submitting || newRating === 0} className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}
            {user && hasReviewed && (
              <p className="mb-6 rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">You've already reviewed this resource.</p>
            )}

            {/* Review List */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">No reviews yet. Be the first!</p>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="rounded-xl border border-border p-4">
                    {editingReviewId === review.id ? (
                      // Edit Form
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Edit Your Review</p>
                          <button
                            onClick={() => setEditingReviewId(null)}
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            ✕
                          </button>
                        </div>
                        <div>
                          <StarRating rating={editRating} interactive onChange={setEditRating} />
                        </div>
                        <textarea
                          value={editComment}
                          onChange={(e) => setEditComment(e.target.value)}
                          placeholder="Update your review..."
                          className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(review.id)}
                            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingReviewId(null)}
                            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Review Display
                      <>
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                              {review.user_name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{review.user_name}</p>
                              <p className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <StarRating rating={review.rating} size="sm" />
                            {user && review.user_id === user.id && (
                              <div className="flex gap-1 ml-4">
                                <button
                                  onClick={() => handleEditReview(review)}
                                  className="text-xs px-2 py-1 rounded hover:bg-muted transition-colors"
                                  title="Edit review"
                                >
                                  ✎
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm("Delete this review?")) {
                                      handleDeleteReview(review.id);
                                    }
                                  }}
                                  className="text-xs px-2 py-1 rounded hover:bg-destructive/10 text-destructive transition-colors"
                                  title="Delete review"
                                >
                                  🗑
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Document Preview Modal */}
      {resource && (
        <DocumentPreview
          open={showPreview}
          onOpenChange={setShowPreview}
          fileUrl={resource.file_url}
          fileName={resource.title}
          fileType={resource.file_type}
        />
      )}
    </div>
  );
}
