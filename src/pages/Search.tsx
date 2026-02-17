import { useState, useEffect } from "react";
import { apiClient, SearchFilters, SortOption } from "@/lib/api-client";
import { supabase } from "@/lib/supabase";
import { ResourceCard } from "@/components/ResourceCard";
import { Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";

interface FilterState extends SearchFilters {
  tags?: string[];
  batch?: string;
}

export default function SearchPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ sort: "latest" });
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const subjects = apiClient.getSubjects();
  const departments = apiClient.getDepartments();
  const semesters = apiClient.getSemesters();

  const fetchResources = async () => {
    setLoading(true);
    try {
      let query_builder = supabase.from('resources').select('*');

      // 1. Text Search (Title, Subject, or Tags)
      if (query) {
        query_builder = query_builder.or(`title.ilike.%${query}%,subject.ilike.%${query}%,tags.cs.{${query}}`);
      }

      // 2. Filters
      if (filters.subject) query_builder = query_builder.eq('subject', filters.subject);
      if (filters.semester) query_builder = query_builder.eq('semester', filters.semester);
      if (filters.department) query_builder = query_builder.eq('department', filters.department);
      if (filters.batch) query_builder = query_builder.eq('batch', filters.batch);

      // 3. Tag Filter
      if (selectedTags.length > 0) {
        query_builder = query_builder.overlaps('tags', selectedTags);
      }

      // 4. Privacy
      if (filters.isPrivate !== undefined) {
        query_builder = query_builder.eq('privacy', filters.isPrivate ? 'private' : 'public');
      }

      // 5. Sorting (Note: Sorting by rating might still be imprecise if DB columns aren't updated, 
      // but this fetch will correct the display)
      if (filters.sort === 'highest_rated') {
        query_builder = query_builder.order('average_rating', { ascending: false });
      } else if (filters.sort === 'most_popular') {
        query_builder = query_builder.order('downloads', { ascending: false });
      } else {
        query_builder = query_builder.order('created_at', { ascending: false });
      }

      const { data, error } = await query_builder;
      if (error) throw error;

      // --- FIX: Fetch real-time reviews to calculate accurate rating ---
      const resourceIds = (data || []).map((r: any) => r.id);
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
      // ----------------------------------------------------------------

      const mappedData = (data || []).map((item: any) => {
        // Calculate rating from the reviews we just fetched
        const ratingInfo = reviewMap.get(item.id);
        const calculatedRating = ratingInfo ? ratingInfo.total / ratingInfo.count : 0;
        const calculatedCount = ratingInfo ? ratingInfo.count : 0;

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
          // Use calculated values if they exist, otherwise fallback to DB
          averageRating: ratingInfo ? calculatedRating : (item.average_rating || 0),
          totalRatings: ratingInfo ? calculatedCount : (item.total_ratings || 0),
          createdAt: item.created_at || new Date().toISOString(),
          tags: item.tags || [],
          batch: item.batch,
          sharedWith: item.shared_with || [],
          restrictedToUniversity: item.restricted_to_university,
        };
      });

      setResources(mappedData);
    } catch (error) {
      console.error('Error fetching resources:', error);
      setResources([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchResources(); }, [filters, selectedTags]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResources();
  };

  const allTags = Array.from(new Set(resources.flatMap((r) => r.tags || []))) as string[];
  const selectClass = "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20";
  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "latest", label: "Latest" },
    { value: "highest_rated", label: "Highest Rated" },
    { value: "most_popular", label: "Most Popular" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Discover Resources</h1>
        <p className="mt-1 text-muted-foreground">Search and filter through academic materials</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, subject, or tag..."
            className="w-full rounded-xl border border-border bg-card py-3 pl-12 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button type="submit" className="rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          Search
        </button>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`rounded-xl border px-4 transition-colors ${showFilters ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}
        >
          <SlidersHorizontal className="h-5 w-5" />
        </button>
      </form>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 overflow-hidden rounded-xl glass p-5"
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold">Filters</h3>
            <button onClick={() => { setFilters({ sort: "latest" }); setQuery(""); setSelectedTags([]); }} className="text-xs text-primary hover:underline">Clear All</button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <select className={selectClass} value={filters.subject || ""} onChange={(e) => setFilters((f) => ({ ...f, subject: e.target.value || undefined }))}>
              <option value="">All Subjects</option>
              {subjects.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select className={selectClass} value={filters.semester || ""} onChange={(e) => setFilters((f) => ({ ...f, semester: e.target.value ? Number(e.target.value) : undefined }))}>
              <option value="">All Semesters</option>
              {semesters.map((s) => <option key={s} value={s}>Semester {s}</option>)}
            </select>
            <select className={selectClass} value={filters.department || ""} onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value || undefined }))}>
              <option value="">All Departments</option>
              {departments.map((b) => <option key={b}>{b}</option>)}
            </select>
            <select className={selectClass} value={filters.batch || ""} onChange={(e) => setFilters((f) => ({ ...f, batch: e.target.value || undefined }))}>
              <option value="">All Years</option>
              {Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - i).sort().map((year) => (
                <option key={year} value={year.toString()}>Batch {year}</option>
              ))}
            </select>
          </div>
          <div className="mt-3">
            <label className="mb-2 block text-sm font-medium">Tags</label>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${selectedTags.includes(tag) ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:border-primary"}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3">
            <select className={selectClass} value={filters.isPrivate === undefined ? "" : filters.isPrivate ? "private" : "public"} onChange={(e) => setFilters((f) => ({ ...f, isPrivate: e.target.value === "" ? undefined : e.target.value === "private" }))}>
              <option value="">All Privacy</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
        </motion.div>
      )}

      {/* Sort & Results */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Sort by:</span>
        {sortOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilters((f) => ({ ...f, sort: opt.value }))}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${filters.sort === opt.value ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
          >
            {opt.label}
          </button>
        ))}
        <span className="ml-auto text-sm text-muted-foreground">{resources.length} results</span>
      </div>

      {loading ? (
        <div className="bento-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-64 animate-pulse rounded-xl bg-muted" />)}
        </div>
      ) : resources.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <SearchIcon className="mb-4 h-12 w-12" />
          <p className="font-display text-lg font-semibold">No resources found</p>
          <p className="text-sm">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="bento-grid">
          {resources.map((r, i) => <ResourceCard key={r.id} resource={r} index={i} />)}
        </div>
      )}
    </div>
  );
}