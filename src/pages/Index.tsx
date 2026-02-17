import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { ResourceCard } from "@/components/ResourceCard";
import { Link } from "react-router-dom";
import { TrendingUp, BookOpen, Upload, Star, Vault, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Index() {
    const { user } = useAuth();
    const [trending, setTrending] = useState<any[]>([]);
    const [latest, setLatest] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRealResources();
    }, [user]); // Re-fetch when user state changes

    async function fetchRealResources() {
        setLoading(true);
        try {
            let query = supabase.from('resources').select('*');

            // --- LOGIC UPDATE START ---
            if (user?.college) {
                // If user is logged in, show Public resources OR resources for their college
                // Note: We use double quotes inside the string for the college name to handle spaces
                query = query.or(`privacy.eq.public,restricted_to_university.eq."${user.college}"`);
            } else {
                // If guest, show only Public
                query = query.eq('privacy', 'public');
            }
            // --- LOGIC UPDATE END ---

            // Fetch top 15 most recent to populate the dashboard
            const { data: resources, error: resourceError } = await query
                .order('created_at', { ascending: false })
                .limit(15);

            if (resourceError) throw resourceError;

            // Fetch reviews for these specific resources to calculate ratings
            const resourceIds = (resources || []).map((r: any) => r.id);
            let reviewMap = new Map<number, { total: number; count: number }>();

            if (resourceIds.length > 0) {
                const { data: reviews } = await supabase
                    .from('reviews')
                    .select('resource_id, rating')
                    .in('resource_id', resourceIds);

                if (reviews) {
                    reviews.forEach((r: any) => {
                        if (!reviewMap.has(r.resource_id)) {
                            reviewMap.set(r.resource_id, { total: 0, count: 0 });
                        }
                        const entry = reviewMap.get(r.resource_id)!;
                        entry.total += r.rating;
                        entry.count += 1;
                    });
                }
            }

            if (resources && resources.length > 0) {
                // Transform snake_case to camelCase and add calculated ratings
                const transformedData = resources.map((item: any) => {
                    const ratingData = reviewMap.get(item.id);
                    const calculatedRating = ratingData ? ratingData.total / ratingData.count : 0;
                    const calculatedCount = ratingData ? ratingData.count : 0;

                    return {
                        id: item.id.toString(),
                        title: item.title || "Untitled",
                        subject: item.subject || "General",
                        semester: item.semester || 1,
                        department: item.department || "General",
                        type: item.type || "Other",
                        isPrivate: item.privacy === 'private',
                        uploaderId: item.uploader_id || "",
                        uploaderName: item.uploader_name || "Student",
                        uploaderCollege: item.uploader_college || "University",
                        fileUrl: item.file_url || "",
                        fileType: item.file_type || "pdf",
                        fileSize: item.file_size || 0,
                        downloads: item.downloads || 0,
                        // Prefer calculated rating, fallback to DB value
                        averageRating: ratingData ? calculatedRating : (item.average_rating || 0),
                        totalRatings: ratingData ? calculatedCount : (item.total_ratings || 0),
                        createdAt: item.created_at || new Date().toISOString(),
                        tags: item.tags || [],
                        batch: item.batch,
                        sharedWith: item.shared_with || [],
                        restrictedToUniversity: item.restricted_to_university,
                        branch: item.department,
                    };
                });

                // Latest = The first 6 from our "order by created_at desc" query
                setLatest(transformedData.slice(0, 6));

                // Trending = Sort the same list by downloads (or you could do a separate DB query for this)
                const trendingSorted = [...transformedData].sort((a: any, b: any) => b.downloads - a.downloads);
                setTrending(trendingSorted.slice(0, 3));
            } else {
                setLatest([]);
                setTrending([]);
            }
        } catch (error) {
            console.error("Error loading resources:", error);
        } finally {
            setLoading(false);
        }
    }

    const stats = [
        { icon: BookOpen, label: "Resources", value: "100+", color: "text-primary" }, // You can make this dynamic if you want
        { icon: Star, label: "Avg Rating", value: "4.8", color: "text-amber-500" },
        { icon: Upload, label: "Uploads/Day", value: "12", color: "text-emerald-500" },
        { icon: TrendingUp, label: "Active Users", value: "500+", color: "text-primary" },
    ];

    return (
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10 rounded-2xl neon-border bg-card p-8 lg:p-12"
            >
                <div className="flex items-center gap-2 mb-4">
                    <Vault className="h-5 w-5 text-primary" />
                    <span className="text-xs font-semibold uppercase tracking-widest text-primary">Campus Vault</span>
                </div>
                <h1 className="mb-3 font-display text-3xl font-bold lg:text-5xl">
                    {user ? `Welcome back, ${user.name?.split(" ")[0] || 'Student'}` : "Academic Resources,\nSupercharged"}
                </h1>
                <p className="mb-6 max-w-lg text-muted-foreground">
                    Discover, share, and collaborate on academic materials. Notes, solutions, question papers — all in one place.
                </p>
                <div className="flex flex-wrap gap-3">
                    <Link to="/search" className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                        Explore Resources <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link to="/upload" className="flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-medium hover:bg-muted transition-colors">
                        <Upload className="h-4 w-4" /> Upload
                    </Link>
                </div>
            </motion.section>

            <section className="mb-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {stats.map(({ icon: Icon, label, value, color }, i) => (
                    <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="rounded-xl glass p-5"
                    >
                        <Icon className={`mb-2 h-5 w-5 ${color}`} />
                        <p className="font-display text-2xl font-bold">{value}</p>
                        <p className="text-xs text-muted-foreground">{label}</p>
                    </motion.div>
                ))}
            </section>

            {/* TRENDING SECTION */}
            <section className="mb-10">
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="font-display text-xl font-bold flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" /> Trending Now
                    </h2>
                    <Link to="/search?sort=most_popular" className="text-sm text-primary hover:underline flex items-center gap-1">
                        View all <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
                {loading ? (
                    <div className="bento-grid">
                        {[1, 2, 3].map((i) => <div key={i} className="h-64 animate-pulse rounded-xl bg-muted" />)}
                    </div>
                ) : (
                    <div className="bento-grid">
                        {trending.length > 0 ? (
                            trending.map((r, i) => <ResourceCard key={r.id} resource={r} index={i} />)
                        ) : (
                            <div className="col-span-3 text-center py-10 text-muted-foreground">
                                No trending resources yet.
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* LATEST UPLOADS SECTION */}
            <section>
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="font-display text-xl font-bold flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" /> Latest Uploads
                    </h2>
                    <Link to="/search?sort=latest" className="text-sm text-primary hover:underline flex items-center gap-1">
                        View all <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
                {loading ? (
                    <div className="bento-grid">
                        {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-64 animate-pulse rounded-xl bg-muted" />)}
                    </div>
                ) : (
                    <div className="bento-grid">
                        {latest.length > 0 ? (
                            latest.map((r, i) => <ResourceCard key={r.id} resource={r} index={i} />)
                        ) : (
                            <div className="col-span-3 text-center py-10 text-muted-foreground">
                                No recent uploads found.
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}