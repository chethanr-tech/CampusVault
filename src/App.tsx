import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import SearchPage from "./pages/Search";
import UploadPage from "./pages/Upload";
import ResourceDetail from "./pages/ResourceDetail";
import Profile from "./pages/Profile";
import RequestsPage from "./pages/Requests";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <ThemeProvider>
            <AuthProvider>
                <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                        <AppLayout>
                            <Routes>
                                <Route path="/auth" element={<Auth />} />
                                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                                <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
                                <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
                                <Route path="/requests" element={<ProtectedRoute><RequestsPage /></ProtectedRoute>} />
                                <Route path="/resource/:id" element={<ProtectedRoute><ResourceDetail /></ProtectedRoute>} />
                                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                                <Route path="*" element={<NotFound />} />
                            </Routes>
                        </AppLayout>
                    </BrowserRouter>
                </TooltipProvider>
            </AuthProvider>
        </ThemeProvider>
    </QueryClientProvider>
);

export default App;
