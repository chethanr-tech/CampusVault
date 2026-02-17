import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate("/auth", { replace: true });
        }
    }, [user, loading, navigate]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    // DEMO MODE: Approval check disabled for local testing
    // To enable approval workflow, uncomment the code below
    // if (user.pendingApproval && !user.isApproved) {
    //     return approval pending screen
    // }

    return <>{children}</>;
}
