import { lazy, Suspense, useContext, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuthProvider, { AuthContext } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { supabase } from "./lib/supabase";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 10_000 } },
});

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Clients = lazy(() => import("./pages/Clients"));
const Links = lazy(() => import("./pages/Links"));
const Finances = lazy(() => import("./pages/Finances"));
const KeelPulse = lazy(() => import("./pages/KeelPulse"));
const Focus = lazy(() => import("./pages/Focus"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Reports = lazy(() => import("./pages/Reports"));

function Loading() {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-[#0f172a]">
      <div className="text-sm text-slate-600 dark:text-slate-400 animate-pulse">Loading...</div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <Loading />;
  if (!supabase) return children;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function LoginPage() {
  const { login, signUp } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState("signin");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setSuccess("");
      if (mode === "signin") {
        await login(email, password);
      } else {
        const result = await signUp(email, password);
        if (result?.user?.identities?.length === 0) {
          setError("This email is already registered. Try signing in.");
        } else {
          setSuccess("Account created! Check your email to confirm, then sign in.");
          setMode("signin");
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-[#0f172a]">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-white/10 rounded-2xl p-6 w-full max-w-xs shadow-sm">
        <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center text-white font-bold mx-auto mb-3">F</div>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-1">FrameStudio</h1>
        <p className="text-xs text-gray-400 dark:text-slate-500 text-center mb-5">{mode === "signin" ? "Sign in to your admin dashboard" : "Create your admin account"}</p>
        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
        {success && <p className="text-xs text-green-500 mb-3">{success}</p>}
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="w-full text-sm border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 mb-2 bg-slate-50 dark:bg-[#1a1a2e] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-amber-400" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 6 chars)" required minLength={6} className="w-full text-sm border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 mb-4 bg-slate-50 dark:bg-[#1a1a2e] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-amber-400" />
        <button type="submit" className="w-full text-sm font-medium bg-amber-600 text-white rounded-lg px-3 py-2 hover:bg-amber-500 transition-colors">
          {mode === "signin" ? "Sign in" : "Create account"}
        </button>
        <p className="text-xs text-gray-400 dark:text-slate-500 text-center mt-4">
          {mode === "signin" ? (
            <>No account? <button type="button" onClick={() => { setMode("signup"); setError(""); setSuccess(""); }} className="text-amber-600 dark:text-amber-400 hover:underline">Sign up</button></>
          ) : (
            <>Already have one? <button type="button" onClick={() => { setMode("signin"); setError(""); setSuccess(""); }} className="text-amber-600 dark:text-amber-400 hover:underline">Sign in</button></>
          )}
        </p>
      </form>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <Loading />;

  if (!user && supabase) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <Suspense fallback={<Loading />}>
      <DataProvider>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
          <Route path="/links" element={<ProtectedRoute><Links /></ProtectedRoute>} />
          <Route path="/finances" element={<ProtectedRoute><Finances /></ProtectedRoute>} />
          <Route path="/keel" element={<ProtectedRoute><KeelPulse /></ProtectedRoute>} />
          <Route path="/focus" element={<ProtectedRoute><Focus /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DataProvider>
    </Suspense>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
