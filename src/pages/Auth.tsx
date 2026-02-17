import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Vault, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "", email: "", password: "", college: "", department: "", semester: 3,
    });

    const update = (key: string, value: string | number) => setForm((f) => ({ ...f, [key]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            if (isLogin) {
                await login(form.email, form.password);
            } else {
                await register({ ...form, semester: Number(form.semester) });
            }
            navigate("/");
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20";

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="glass-strong rounded-2xl p-8">
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                            <Vault className="h-7 w-7 text-primary" />
                        </div>
                        <h1 className="font-display text-2xl font-bold">{isLogin ? "Welcome Back" : "Join Campus Vault"}</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {isLogin ? "Sign in to access your resources" : "Create your academic profile"}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <input className={inputClass} placeholder="Full Name" value={form.name} onChange={(e) => update("name", e.target.value)} required />
                        )}
                        <input className={inputClass} type="email" placeholder="Email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
                        <div className="relative">
                            <input className={inputClass} type={showPassword ? "text" : "password"} placeholder="Password" value={form.password} onChange={(e) => update("password", e.target.value)} required />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>

                        {!isLogin && (
                            <>
                                <div>
                                    <select className={inputClass} value={form.college} onChange={(e) => update("college", e.target.value)} required>
                                        <option value="">Select University</option>
                                        <option>IIT Delhi</option>
                                        <option>IIT Bombay</option>
                                        <option>IIT Madras</option>
                                        <option>BITS Pilani</option>
                                        <option>NIT Trichy</option>
                                        <option>VIT Vellore</option>
                                        <option>IIIT Hyderabad</option>
                                        <option>Delhi University</option>
                                        <option>Mumbai University</option>
                                        <option>Anna University</option>
                                        <option>Christ University</option>
                                    </select>
                                    <p className="mt-1 text-xs text-muted-foreground text-center">
                                        Don't see your college? <a href="mailto:contact@campusvault.com" className="text-primary hover:underline">Contact us</a>
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <select className={inputClass} value={form.department} onChange={(e) => update("department", e.target.value)} required>
                                        <option value="">Department</option>
                                        <option>Computer Science</option>
                                        <option>Electronics & Communication</option>
                                        <option>Mechanical Engineering</option>
                                        <option>Civil Engineering</option>
                                        <option>Electrical Engineering</option>
                                        <option>Information Technology</option>
                                        <option>Biotechnology</option>
                                        <option>Chemical Engineering</option>
                                        <option>Aerospace Engineering</option>
                                    </select>
                                    <select className={inputClass} value={form.semester} onChange={(e) => update("semester", Number(e.target.value))} required>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                                            <option key={s} value={s}>Semester {s}</option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
                        >
                            {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                        <button onClick={() => { setIsLogin(!isLogin); setError(""); }} className="font-medium text-primary hover:underline">
                            {isLogin ? "Sign up" : "Sign in"}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
