import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ResourceRequest {
  id: string;
  title: string;
  subject: string;
  semester: number;
  requested_by_id: string;
  requested_by_name: string;
  requested_by_college: string;
  description: string;
  request_count: number;
  created_at: string;
  status: "open" | "fulfilled";
}

export default function RequestsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<ResourceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    semester: 1,
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("resource_requests")
        .select("*")
        .eq("status", "open")
        .order("request_count", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform snake_case to camelCase
      const transformed = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        subject: item.subject,
        semester: item.semester,
        requested_by_id: item.requested_by_id,
        requested_by_name: item.requested_by_name,
        requested_by_college: item.requested_by_college,
        description: item.description,
        request_count: item.request_count,
        created_at: item.created_at,
        status: item.status,
      }));

      setRequests(transformed);
    } catch (err: any) {
      console.error("Error fetching requests:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load requests",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Submit request
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSubmitting(true);

      const { error } = await supabase.from("resource_requests").insert({
        title: formData.title,
        subject: formData.subject,
        semester: formData.semester,
        description: formData.description,
        requested_by_id: user.id,
        requested_by_name: user.name,
        requested_by_college: user.college,
        status: "open",
        request_count: 1,
      });

      if (error) throw error;

      toast({
        title: "Request Created",
        description: "Your resource request has been posted",
      });

      setFormData({ title: "", subject: "", semester: 1, description: "" });
      setIsOpen(false);
      await fetchRequests();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Support a request (increment count)
  const handleSupportRequest = async (requestId: string, currentCount: number) => {
    try {
      const { error } = await supabase
        .from("resource_requests")
        .update({ request_count: currentCount + 1 })
        .eq("id", requestId);

      if (error) throw error;

      toast({ title: "Support added", description: "Request updated" });
      await fetchRequests();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Resource Requests</h1>
            <p className="mt-2 text-muted-foreground">
              Looking for a specific resource? Create a request and let others help you find it.
            </p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="h-4 w-4" /> New Request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a Resource Request</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    What resource are you looking for?
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g., Data Structures Lecture Notes"
                    className="w-full rounded-lg border border-border bg-card px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      placeholder="e.g., Computer Science"
                      className="w-full rounded-lg border border-border bg-card px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Semester
                    </label>
                    <select
                      value={formData.semester}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          semester: parseInt(e.target.value),
                        })
                      }
                      className="w-full rounded-lg border border-border bg-card px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <option key={sem} value={sem}>
                          Semester {sem}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Additional Details
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe what you're looking for..."
                    className="w-full rounded-lg border border-border bg-card px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Creating..." : "Create Request"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Requests List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-32 animate-pulse bg-muted" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-dashed border-border p-12 text-center"
        >
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No active requests</h3>
          <p className="text-muted-foreground mb-4">
            Be the first to create a resource request!
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {requests.map((req: ResourceRequest) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass-strong p-6 hover:border-primary/50 transition-colors">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{req.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-3 text-sm">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                        {req.subject}
                      </span>
                      <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
                        Sem {req.semester}
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-3">{req.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Requested by <span className="font-medium text-foreground">{req.requested_by_name}</span> · {req.requested_by_college}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:items-end">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">
                        {req.request_count}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {req.request_count === 1 ? "request" : "requests"}
                      </p>
                    </div>
                    <Button
                      onClick={() =>
                        handleSupportRequest(req.id, req.request_count)
                      }
                      variant="outline"
                      size="sm"
                      className="gap-1"
                    >
                      + Support
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
