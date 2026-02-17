import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase"; 
import { Upload as UploadIcon, FileText, X, ArrowLeft, Lock, Globe, School } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadForm {
  title: string;
  subject: string;
  semester: number;
  department: string;
  type: "Notes" | "Solutions" | "Question Papers" | "Lab Reports" | "Other" | "";
  visibility: "public" | "university";
  batch: string;
  tags: string;
}

export default function UploadPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    
    const [loading, setLoading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    
    const [form, setForm] = useState<UploadForm>({
        title: "", 
        subject: "", 
        semester: 3, 
        department: user?.department || "",
        type: "Notes", 
        visibility: "public",
        batch: new Date().getFullYear().toString(),
        tags: "",
    });

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) setFile(f);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !user) {
            toast({ variant: "destructive", title: "Error", description: "Please sign in and select a file." });
            return;
        }

        if (!form.title.trim() || !form.subject.trim()) {
            toast({ variant: "destructive", title: "Validation Error", description: "Please fill in all required fields" });
            return;
        }

        setLoading(true);
        try {
            // 1. Upload file to Supabase Storage
            const fileExt = file.name.split('.').pop() || 'pdf';
            const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
                .from('documents')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // 2. Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('documents')
                .getPublicUrl(fileName);

            // 3. Save to database with all required fields
            const { error: dbError } = await supabase.from('resources').insert({
                title: form.title.trim(),
                subject: form.subject.trim(),
                semester: form.semester,
                department: form.department.trim() || user.department || "General",
                type: form.type || "Notes",
                file_url: publicUrl,
                file_type: fileExt,
                file_size: file.size,
                uploader_id: user.id,
                uploader_name: user.name,
                uploader_college: user.college || "Unknown",
                // Logic: University Only = 'private' privacy + restricted_to_university set to college name
                privacy: form.visibility === 'public' ? 'public' : 'private',
                restricted_to_university: form.visibility === 'university' ? user.college : null,
                batch: form.batch || new Date().getFullYear().toString(),
                tags: form.tags.trim().split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0),
                downloads: 0,
                average_rating: 0,
                total_ratings: 0,
            });

            if (dbError) throw dbError;

            toast({ title: "Success!", description: "Resource uploaded successfully" });
            navigate("/");

        } catch (error: any) {
            console.error(error);
            toast({ variant: "destructive", title: "Error", description: error.message || "Upload failed" });
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <Lock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="font-display text-lg font-semibold">Sign in to upload</p>
                    <button onClick={() => navigate("/auth")} className="mt-4 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground">Sign In</button>
                </div>
            </div>
        );
    }

    const inputClass = "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20";

    return (
        <div className="mx-auto max-w-2xl px-4 py-6 lg:px-8">
            <button
                onClick={() => navigate("/")}
                className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </button>

            <div className="mb-6">
                <h1 className="mb-2 font-display text-3xl font-bold">Upload Resource</h1>
                <p className="text-muted-foreground">Share notes, solutions, or past papers with your batch.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-border bg-card p-6">
                
                {/* File Upload Area */}
                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Resource File <span className="text-destructive">*</span>
                    </label>
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setDragOver(false);
                            const f = e.dataTransfer.files[0];
                            if (f) setFile(f);
                        }}
                        className={`relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all ${dragOver ? "border-primary bg-primary/5" : file ? "border-primary/30 bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}`}
                        onClick={() => document.getElementById("file-input")?.click()}
                    >
                        <input 
                            id="file-input" 
                            type="file" 
                            accept=".pdf,.docx,.doc,.png,.jpg,.jpeg" 
                            className="hidden" 
                            onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} 
                        />
                        {file ? (
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={(e) => { e.stopPropagation(); setFile(null); }} 
                                    className="ml-2 rounded-full p-1 hover:bg-destructive/10 hover:text-destructive"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="p-3 bg-muted rounded-full mb-3">
                                    <UploadIcon className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-medium">Click to browse or drag file here</p>
                                <p className="mt-1 text-xs text-muted-foreground">PDF, Word, or Images (Max 50MB)</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Title */}
                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Title <span className="text-destructive">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="e.g., Data Structures Complete Notes"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className={inputClass}
                        maxLength={100}
                        required
                    />
                    <p className="mt-1 text-xs text-muted-foreground text-right">{form.title.length}/100</p>
                </div>

                {/* Subject & Semester */}
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Subject <span className="text-destructive">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., Data Structures"
                            value={form.subject}
                            onChange={(e) => setForm({ ...form, subject: e.target.value })}
                            className={inputClass}
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium">Semester</label>
                        <select 
                            value={form.semester} 
                            onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })} 
                            className={inputClass}
                        >
                            {Array.from({ length: 8 }, (_, i) => i + 1).map((sem) => (
                                <option key={sem} value={sem}>
                                    Semester {sem}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Department & Type */}
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium">Department</label>
                        <input
                            type="text"
                            placeholder="e.g., Computer Science"
                            value={form.department}
                            onChange={(e) => setForm({ ...form, department: e.target.value })}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium">Resource Type</label>
                        <select 
                            value={form.type} 
                            onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })} 
                            className={inputClass}
                        >
                            <option value="Notes">Notes</option>
                            <option value="Solutions">Solutions</option>
                            <option value="Question Papers">Question Papers</option>
                            <option value="Lab Reports">Lab Reports</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                {/* Batch & Tags */}
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium">Batch/Year</label>
                        <select 
                            value={form.batch} 
                            onChange={(e) => setForm({ ...form, batch: e.target.value })} 
                            className={inputClass}
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
                    <div>
                        <label className="mb-2 block text-sm font-medium">Tags</label>
                        <input
                            type="text"
                            placeholder="e.g., semester3, algorithms, important"
                            value={form.tags}
                            onChange={(e) => setForm({ ...form, tags: e.target.value })}
                            className={inputClass}
                        />
                        <p className="mt-1 text-xs text-muted-foreground">Comma-separated keywords for searchability</p>
                    </div>
                </div>

                {/* Visibility Toggle */}
                <div>
                    <label className="mb-2 block text-sm font-medium">Visibility</label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, visibility: "public" })}
                            className={`flex-1 flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                                form.visibility === "public" 
                                    ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/20" 
                                    : "border-border bg-card hover:bg-muted"
                            }`}
                        >
                            <Globe className="h-4 w-4" />
                            Public Access
                        </button>
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, visibility: "university" })}
                            className={`flex-1 flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                                form.visibility === "university" 
                                    ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/20" 
                                    : "border-border bg-card hover:bg-muted"
                            }`}
                        >
                            <School className="h-4 w-4" />
                            {user.college || "University"} Only
                        </button>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                        {form.visibility === "public" 
                            ? "Visible to students from all universities." 
                            : `Restricted to students from ${user.college || "your university"}.`}
                    </p>
                </div>

                {/* Submit */}
                <div className="flex gap-3 border-t border-border pt-6">
                    <button
                        type="submit"
                        disabled={loading || !file}
                        className="flex-1 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? "Uploading..." : "Upload Resource"}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="rounded-lg border border-border px-6 py-3 font-medium hover:bg-muted"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}