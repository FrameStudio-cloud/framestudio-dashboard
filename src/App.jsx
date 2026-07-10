import { lazy, Suspense, useContext, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FiLock } from "react-icons/fi";
import { Icon, Alert, ToastProvider } from "cite-ui";
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
const Timeline = lazy(() => import("./pages/Timeline"));
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
  const { login, signUp, resetPassword } = useContext(AuthContext);
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
    <div className="flex h-screen bg-white dark:bg-[#0f172a]">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-800 via-amber-700 to-amber-900" />
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80)" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white font-bold text-sm">F</div>
            <span className="text-white/90 font-semibold tracking-tight">FrameStudio</span>
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-white leading-tight">Craft digital<br />experiences that matter</h2>
            <p className="text-white/60 text-sm max-w-xs leading-relaxed">Manage your clients, finances, projects, and team — all from one place.</p>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-amber-50/40 to-white dark:from-[#0f172a] dark:to-[#0f172a]">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-5 shadow-xl shadow-amber-600/25 ring-1 ring-amber-400/15">
              F
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              {mode === "signin" ? "Welcome back" : "Get started"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1.5">
              {mode === "signin" ? "Sign in to your admin dashboard" : "Create your management account"}
            </p>
          </div>
          <div className="bg-white dark:bg-[#131328] rounded-2xl p-7 shadow-sm border border-gray-100 dark:border-white/5">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert type="error" message={error} className="!p-3 text-xs" />
              )}
              {success && (
                <Alert type="success" message={success} className="!p-3 text-xs" />
              )}
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-slate-300 block mb-1.5 tracking-wide">Email</label>
                <div className="relative">
                  <Icon name="mail" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@agency.com" required className="w-full text-sm border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-[#1a1a2e] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-600 dark:text-slate-300 block tracking-wide">Password</label>
                  {mode === "signin" && (
                    <button type="button" onClick={async () => { const e = prompt("Enter your email:", email); if (e) try { await resetPassword(e); setSuccess("Password reset link sent"); setError(""); } catch (err) { setError(err.message); setSuccess(""); } }} className="text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:underline">Forgot?</button>
                  )}
                </div>
                <div className="relative">
                  <FiLock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === "signin" ? "Enter your password" : "Min 6 characters"} required minLength={6} className="w-full text-sm border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-[#1a1a2e] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all" />
                </div>
              </div>
              <button type="submit" className="w-full text-sm font-semibold bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-xl px-3 py-2.5 hover:from-amber-500 hover:to-amber-400 active:scale-[0.98] transition-all shadow-lg shadow-amber-600/20">
                {mode === "signin" ? "Sign in" : "Create account"}
              </button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100 dark:border-white/5" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white dark:bg-[#131328] px-2 text-gray-400">{mode === "signin" ? "or" : "or"}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 dark:text-slate-500 text-center">
                {mode === "signin" ? (
                  <>Don't have an account? <button type="button" onClick={() => { setMode("signup"); setError(""); setSuccess(""); }} className="text-amber-600 dark:text-amber-400 hover:underline font-semibold">Sign up</button></>
                ) : (
                  <>Already have an account? <button type="button" onClick={() => { setMode("signin"); setError(""); setSuccess(""); }} className="text-amber-600 dark:text-amber-400 hover:underline font-semibold">Sign in</button></>
                )}
              </p>
            </form>
          </div>
        </div>
      </div>
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
          <Route path="/timeline" element={<ProtectedRoute><Timeline /></ProtectedRoute>} />
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
          <ToastProvider position="top-right">
            <AppContent />
          </ToastProvider>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
