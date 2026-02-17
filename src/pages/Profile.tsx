import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { User, BookOpen, GraduationCap, Building2, LogOut, Upload, Star, Eye, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

interface UserResource {
  id: string;
  title: string;
  subject: string;
  type: string;
  downloads: number;
  average_rating: number;
  created_at: string;
}

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userResources, setUserResources] = useState<UserResource[]>([]);
  const [stats, setStats] = useState({
    totalUploads: 0,
    totalDownloads: 0,
    totalRatings: 0,
  });
  const [loading, setLoading] = useState(true);

  if (!user) {
    navigate("/auth");
    return null;
  }

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user's resources
        const { data: resources, error: resourceError } = await supabase
          .from("resources")
          .select("id, title, subject, type, downloads, average_rating, created_at")
          .eq("uploader_id", user.id)
          .order("created_at", { ascending: false });

        if (resourceError) throw resourceError;

        setUserResources(resources || []);

        // Calculate stats
        const totalUploads = resources?.length || 0;
        const totalDownloads = resources?.reduce((sum, r) => sum + (r.downloads || 0), 0) || 0;
        const totalRatings = resources?.reduce((sum, r) => sum + Math.round(r.average_rating * 5) || 0, 0) || 0;

        setStats({
          totalUploads,
          totalDownloads,
          totalRatings,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile data",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user.id]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Profile Header */}
        <div className="mb-8 rounded-2xl glass-strong p-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            <div className="flex h-32 w-32 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 text-4xl font-bold text-primary">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1">
              <h1 className="font-display text-3xl font-bold mb-2">{user.name}</h1>
              <p className="flex items-center gap-2 text-muted-foreground mb-4">
                <Mail className="h-4 w-4" />
                {user.email}
              </p>

              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-primary/5 p-3">
                  <p className="text-2xl font-bold text-primary">{stats.totalUploads}</p>
                  <p className="text-xs text-muted-foreground">Uploads</p>
                </div>
                <div className="rounded-lg bg-primary/5 p-3">
                  <p className="text-2xl font-bold text-primary">{stats.totalDownloads}</p>
                  <p className="text-xs text-muted-foreground">Downloads</p>
                </div>
                <div className="rounded-lg bg-primary/5 p-3">
                  <p className="text-2xl font-bold text-primary">{userResources.length > 0 ? (stats.totalRatings / userResources.length).toFixed(1) : '0'}</p>
                  <p className="text-xs text-muted-foreground">Avg Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="mb-8 rounded-2xl glass-strong p-8">
          <h2 className="mb-6 font-display text-xl font-bold flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Account Information
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Building2, label: "College/University", value: user.college, color: "from-blue-500/20 to-blue-400/10" },
              { icon: BookOpen, label: "Department", value: user.department, color: "from-purple-500/20 to-purple-400/10" },
              { icon: GraduationCap, label: "Semester", value: `Semester ${user.semester}`, color: "from-emerald-500/20 to-emerald-400/10" },
            ].map(({ icon: Icon, label, value, color }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl bg-gradient-to-br ${color} border border-border p-4`}
              >
                <div className="flex items-start gap-3">
                  <Icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Your Resources */}
        <div className="mb-8 rounded-2xl glass-strong p-8">
          <h2 className="mb-6 font-display text-xl font-bold flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Your Resources ({stats.totalUploads})
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : userResources.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-lg border border-dashed border-border p-12 text-center"
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No resources yet</h3>
              <p className="text-muted-foreground mb-4">
                Share your first resource to help other students!
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              {userResources.map((resource) => (
                <div
                  key={resource.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-lg border border-border p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">
                      {resource.title}
                    </h3>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5">{resource.type}</span>
                      <span>{resource.subject}</span>
                      <span>{new Date(resource.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-6 text-sm sm:text-right">
                    <div className="text-center">
                      <div className="flex items-center gap-1 justify-center sm:justify-end text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        {resource.downloads}
                      </div>
                      <p className="text-xs text-muted-foreground">downloads</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 justify-center sm:justify-end text-muted-foreground">
                        <Star className="h-4 w-4" />
                        {resource.average_rating.toFixed(1)}
                      </div>
                      <p className="text-xs text-muted-foreground">rating</p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Account Actions */}
        <div className="mb-8 rounded-2xl glass-strong p-8">
          <h2 className="mb-6 font-display text-xl font-bold">Account Settings</h2>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Manage your account settings, security, and preferences.
            </p>
            <button
              onClick={() => {
                logout();
                navigate("/auth");
              }}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-destructive/30 px-6 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out from All Devices
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
