export const mockClients = [
  { id: "1", name: "Ancy Luxe", business: "Luxury Hair & Wigs", email: "ancy@ancyluxe.com", phone: "+254 700 000 001", whatsapp: "https://wa.me/254700000001", liveUrl: "https://ancyluxe.vercel.app", supabaseProject: "ancyluxe-db", vercelDashboard: "https://vercel.com/lewis/ancy-luxe", githubRepo: "https://github.com/lewis/ancy-luxe", projectStatus: "delivered", invoiceStatus: "paid", projectValue: 45000, whatWasBuilt: "Mini-catalogue website with WhatsApp ordering", stage: "delivered", notes: "Happy client. Referred Zuri Fashion." },
  { id: "2", name: "Zuri Fashion", business: "Clothing Boutique", email: "info@zurifashion.co.ke", phone: "+254 700 000 002", whatsapp: "https://wa.me/254700000002", liveUrl: "https://zurifashion.vercel.app", supabaseProject: "zuri-fashion-db", vercelDashboard: "https://vercel.com/lewis/zuri-fashion", githubRepo: "https://github.com/lewis/zuri-fashion", projectStatus: "delivered", invoiceStatus: "partial", projectValue: 35000, whatWasBuilt: "Full e-commerce catalogue with inventory management", stage: "delivered", notes: "Phase 1 complete. Phase 2 (inventory sync) in discussion." },
  { id: "3", name: "PowerSec Solutions", business: "Security Systems", email: "info@powersec.co.ke", phone: "+254 700 000 003", whatsapp: "https://wa.me/254700000003", liveUrl: "https://powersec.vercel.app", supabaseProject: "powersec-db", vercelDashboard: "https://vercel.com/lewis/powersec", githubRepo: "https://github.com/lewis/powersec", projectStatus: "building", invoiceStatus: "pending", projectValue: 65000, whatWasBuilt: "Business website + client portal", stage: "development", notes: "Client portal taking longer than expected. Awaiting API keys." },
  { id: "4", name: "Mini Electricals", business: "Electronics Shop", email: "minielec@gmail.com", phone: "+254 700 000 004", whatsapp: "https://wa.me/254700000004", liveUrl: "https://minielectricals.vercel.app", supabaseProject: "minielec-db", vercelDashboard: "https://vercel.com/lewis/mini-electricals", githubRepo: "https://github.com/lewis/mini-electricals", projectStatus: "on_retainer", invoiceStatus: "paid", projectValue: 12000, whatWasBuilt: "Catalogue site + monthly maintenance", stage: "delivered", notes: "Monthly retainer. Stable client." },
  { id: "5", name: "Campus Glow", business: "Skincare Products", email: "hello@campusglow.com", phone: "+254 700 000 005", whatsapp: "https://wa.me/254700000005", liveUrl: null, supabaseProject: null, vercelDashboard: null, githubRepo: null, projectStatus: "planning", invoiceStatus: "pending", projectValue: 28000, whatWasBuilt: "Online store + booking system", stage: "discovery", notes: "Initial meeting done. Waiting for product photos." },
  { id: "6", name: "Lumière Hair", business: "Premium Hair Studio", email: "lumiere@gmail.com", phone: "+254 700 000 006", whatsapp: "https://wa.me/254700000006", liveUrl: null, supabaseProject: null, vercelDashboard: null, githubRepo: null, projectStatus: "planning", invoiceStatus: "pending", projectValue: 15000, whatWasBuilt: "Portfolio site with booking", stage: "discovery", notes: "Lead from Instagram. Very early stage." },
]

export const mockLinks = [
  { id: "1", clientName: "Zuri Fashion", liveUrl: "https://zurifashion.vercel.app", supabaseProject: "zuri-fashion-db", vercelDashboard: "https://vercel.com/lewis/zuri-fashion", githubRepo: "https://github.com/lewis/zuri-fashion", notes: "Mini-catalogue phase 2", category: "client-sites", favourite: true, tags: ["ecommerce", "react"] },
  { id: "2", clientName: "PowerSec Solutions", liveUrl: "https://powersec.vercel.app", supabaseProject: "powersec-db", vercelDashboard: "https://vercel.com/lewis/powersec", githubRepo: "https://github.com/lewis/powersec", notes: "Under development", category: "client-sites", favourite: false, tags: ["nextjs", "portal"] },
  { id: "3", clientName: "Mini Electricals", liveUrl: "https://minielectricals.vercel.app", supabaseProject: "minielec-db", vercelDashboard: "https://vercel.com/lewis/mini-electricals", githubRepo: "https://github.com/lewis/mini-electricals", notes: "", category: "client-sites", favourite: false, tags: ["catalogue"] },
  { id: "4", clientName: "Keel", liveUrl: "https://keel.nu", supabaseProject: "keel-prod", vercelDashboard: "https://vercel.com/lewis/keel", githubRepo: "https://github.com/lewis/keel", notes: "Dashboard app — own product", category: "products", favourite: true, tags: ["saas", "dashboard"] },
  { id: "5", clientName: "Ancy Luxe", liveUrl: "https://ancyluxe.vercel.app", supabaseProject: "ancyluxe-db", vercelDashboard: "https://vercel.com/lewis/ancy-luxe", githubRepo: "https://github.com/lewis/ancy-luxe", notes: "Wig catalogue", category: "client-sites", favourite: false, tags: ["ecommerce"] },
  { id: "6", clientName: "FrameStudio", liveUrl: "https://framestudio.vercel.app", supabaseProject: "framestudio-db", vercelDashboard: "https://vercel.com/lewis/framestudio", githubRepo: "https://github.com/lewis/framestudio", notes: "Company website", category: "internal", favourite: true, tags: ["marketing"] },
  { id: "7", clientName: "FrameStudio Dashboard", liveUrl: null, supabaseProject: "framestudio-db", vercelDashboard: "https://vercel.com/lewis/framestudio-dashboard", githubRepo: "https://github.com/lewis/framestudio-dashboard", notes: "Admin panel (this app)", category: "internal", favourite: true, tags: ["react", "admin"] },
]

export const mockIncome = [
  { id: "1", clientName: "Ancy Luxe", amount: 45000, description: "Full payment — catalogue website", date: "2026-06-15", paymentMethod: "M-Pesa" },
  { id: "2", clientName: "Zuri Fashion", amount: 20000, description: "Partial payment — phase 1", date: "2026-06-10", paymentMethod: "Bank" },
  { id: "3", clientName: "Mini Electricals", amount: 12000, description: "Monthly retainer — June", date: "2026-06-01", paymentMethod: "M-Pesa" },
  { id: "4", clientName: "Zuri Fashion", amount: 15000, description: "Partial payment — phase 2", date: "2026-05-20", paymentMethod: "Cash" },
  { id: "5", clientName: "Keel", amount: 8000, description: "Subscription revenue — May", date: "2026-05-01", paymentMethod: "Bank" },
  { id: "6", clientName: "Ancy Luxe", amount: 10000, description: "Deposit — initial build", date: "2026-04-28", paymentMethod: "M-Pesa" },
  { id: "7", clientName: "Mini Electricals", amount: 12000, description: "Monthly retainer — May", date: "2026-05-01", paymentMethod: "M-Pesa" },
  { id: "8", clientName: "Mini Electricals", amount: 12000, description: "Monthly retainer — April", date: "2026-04-01", paymentMethod: "Bank" },
]

export const mockExpenses = [
  { id: "1", description: "Vercel Pro subscription", amount: 2200, category: "Hosting", date: "2026-06-05", paymentMethod: "Bank" },
  { id: "2", description: "Supabase Pro plan", amount: 2500, category: "Hosting", date: "2026-06-03", paymentMethod: "Bank" },
  { id: "3", description: "Domain renewals (4 domains)", amount: 4800, category: "Domains", date: "2026-05-28", paymentMethod: "M-Pesa" },
  { id: "4", description: "Internet bundle", amount: 3000, category: "Utilities", date: "2026-05-15", paymentMethod: "M-Pesa" },
  { id: "5", description: "Canva Pro", amount: 1800, category: "Software", date: "2026-05-10", paymentMethod: "Bank" },
  { id: "6", description: "Freelancer payment — UI assets", amount: 5000, category: "Contractors", date: "2026-04-20", paymentMethod: "M-Pesa" },
]

export const mockInvoices = [
  { id: "1", clientName: "Ancy Luxe", amount: 45000, status: "paid", issued: "2026-06-01", due: "2026-06-30", paidAt: "2026-06-15", description: "Catalogue website — full payment" },
  { id: "2", clientName: "Zuri Fashion", amount: 35000, status: "partial", issued: "2026-05-01", due: "2026-06-01", paidAt: null, description: "E-commerce site — balance of 15000" },
  { id: "3", clientName: "PowerSec Solutions", amount: 65000, status: "sent", issued: "2026-06-01", due: "2026-07-01", paidAt: null, description: "Business website + portal" },
  { id: "4", clientName: "Mini Electricals", amount: 12000, status: "paid", issued: "2026-06-01", due: "2026-06-15", paidAt: "2026-06-01", description: "Monthly retainer — June" },
  { id: "5", clientName: "Campus Glow", amount: 14000, status: "draft", issued: null, due: null, paidAt: null, description: "50% deposit — online store" },
]

export const mockKeelPulse = {
  activeShops: 7,
  pendingApprovals: 2,
  flaggedIssues: 1,
  monthlySubscriptionRevenue: 24000,
  shops: [
    { name: "Zuri Fashion", status: "active", plan: "standard", revenue: 5000 },
    { name: "Mini Electricals", status: "active", plan: "standard", revenue: 5000 },
    { name: "Ancy Luxe", status: "active", plan: "premium", revenue: 8000 },
    { name: "Campus Glow", status: "active", plan: "standard", revenue: 5000 },
    { name: "Lumière Hair", status: "active", plan: "starter", revenue: 1000 },
    { name: "TechHive KE", status: "active", plan: "standard", revenue: 5000 },
    { name: "Fresh Mart", status: "active", plan: "starter", revenue: 1000 },
    { name: "Urban Styles", status: "pending", plan: "standard", revenue: 0 },
    { name: "Gadget Hub", status: "pending", plan: "starter", revenue: 0 },
  ],
  approvals: [
    { id: "a1", shopName: "Urban Styles", owner: "James K.", plan: "standard", submittedAt: "2026-06-27T10:30:00", status: "pending" },
    { id: "a2", shopName: "Gadget Hub", owner: "Faith W.", plan: "starter", submittedAt: "2026-06-28T08:15:00", status: "pending" },
    { id: "a3", shopName: "Fresh Mart", owner: "Peter N.", plan: "starter", submittedAt: "2026-06-20T14:00:00", status: "approved" },
  ],
  activityLog: [
    { id: "l1", action: "new_shop", shop: "Gadget Hub", detail: "Registered for Starter plan", timestamp: "2026-06-28T08:15:00" },
    { id: "l2", action: "payment", shop: "Fresh Mart", detail: "M-Pesa payment of KES 1,000 received", timestamp: "2026-06-27T16:45:00" },
    { id: "l3", action: "approval", shop: "Fresh Mart", detail: "Shop approved by admin", timestamp: "2026-06-27T16:30:00" },
    { id: "l4", action: "flag", shop: "Ancy Luxe", detail: "Payment verification required — transaction mismatch", timestamp: "2026-06-26T09:00:00" },
    { id: "l5", action: "new_shop", shop: "Urban Styles", detail: "Registered for Standard plan", timestamp: "2026-06-25T14:20:00" },
    { id: "l6", action: "subscription", shop: "TechHive KE", detail: "Auto-renewed Standard plan", timestamp: "2026-06-24T00:00:00" },
  ],
}

export const mockFocusItems = [
  { id: "1", content: "Finish Keel inventory page", project: "Keel", completed: false, priority: "high", dueDate: "2026-07-02", status: "in_progress" },
  { id: "2", content: "Follow up with Ancy Luxe", project: "Ancy Luxe", completed: false, priority: "medium", dueDate: "2026-06-30", status: "todo" },
  { id: "3", content: "Post TikTok", project: null, completed: false, priority: "low", dueDate: null, status: "todo" },
  { id: "4", content: "Push PowerSec deployment", project: "PowerSec Solutions", completed: true, priority: "high", dueDate: "2026-06-25", status: "done" },
  { id: "5", content: "Send invoice to Zuri Fashion", project: "Zuri Fashion", completed: true, priority: "medium", dueDate: "2026-06-20", status: "done" },
  { id: "6", content: "Design Campus Glow homepage", project: "Campus Glow", completed: false, priority: "medium", dueDate: "2026-07-05", status: "in_progress" },
  { id: "7", content: "Review Keel subscription analytics", project: "Keel", completed: false, priority: "low", dueDate: null, status: "todo" },
  { id: "8", content: "Call Lumière Hair lead", project: "Lumière Hair", completed: false, priority: "high", dueDate: "2026-06-29", status: "todo" },
]

export const mockActivityFeed = [
  { id: "f1", type: "payment", message: "Ancy Luxe paid KES 45,000", client: "Ancy Luxe", timestamp: "2026-06-28T14:30:00", link: "/finances" },
  { id: "f2", type: "client", message: "New client: Lumière Hair added", client: "Lumière Hair", timestamp: "2026-06-27T11:00:00", link: "/clients" },
  { id: "f3", type: "keel", message: "Gadget Hub registered for Keel Starter", client: null, timestamp: "2026-06-27T08:15:00", link: "/keel" },
  { id: "f4", type: "task", message: "PowerSec deployment pushed to production", client: "PowerSec Solutions", timestamp: "2026-06-26T18:45:00", link: "/focus" },
  { id: "f5", type: "payment", message: "Mini Electricals retainer KES 12,000 received", client: "Mini Electricals", timestamp: "2026-06-26T09:00:00", link: "/finances" },
  { id: "f6", type: "invoice", message: "Invoice sent to PowerSec Solutions — KES 65,000", client: "PowerSec Solutions", timestamp: "2026-06-25T15:30:00", link: "/finances" },
  { id: "f7", type: "keel", message: "Urban Styles pending approval", client: null, timestamp: "2026-06-25T14:20:00", link: "/keel" },
  { id: "f8", type: "task", message: "Invoice sent to Zuri Fashion", client: "Zuri Fashion", timestamp: "2026-06-24T12:00:00", link: "/focus" },
]

export const mockNotifications = [
  { id: "n1", type: "overdue_invoice", message: "Zuri Fashion invoice (KES 15,000) overdue", link: "/finances", read: false, createdAt: "2026-06-29T00:00:00" },
  { id: "n2", type: "pending_approval", message: "2 Keel shops pending approval", link: "/keel", read: false, createdAt: "2026-06-28T08:15:00" },
  { id: "n3", type: "task_due", message: "Call Lumière Hair lead — due today", link: "/focus", read: false, createdAt: "2026-06-29T06:00:00" },
  { id: "n4", type: "task_due", message: "Follow up with Ancy Luxe — due tomorrow", link: "/focus", read: true, createdAt: "2026-06-28T06:00:00" },
  { id: "n5", type: "overdue_invoice", message: "PowerSec Solutions invoice (KES 65,000) due in 2 days", link: "/finances", read: true, createdAt: "2026-06-28T00:00:00" },
]

export const monthlyRevenue = [
  { month: "Jan", revenue: 18000 },
  { month: "Feb", revenue: 22000 },
  { month: "Mar", revenue: 15000 },
  { month: "Apr", revenue: 28000 },
  { month: "May", revenue: 23000 },
  { month: "Jun", revenue: 24000 },
]

export const revenueByClient = [
  { name: "Ancy Luxe", value: 55000 },
  { name: "Zuri Fashion", value: 35000 },
  { name: "PowerSec", value: 65000 },
  { name: "Mini Electricals", value: 36000 },
  { name: "Keel", value: 8000 },
]

export const clientStatusBreakdown = [
  { status: "Delivered", count: 2 },
  { status: "Building", count: 1 },
  { status: "On Retainer", count: 1 },
  { status: "Planning", count: 2 },
]

export const invoiceStatusDistribution = [
  { status: "Paid", count: 2 },
  { status: "Partial", count: 1 },
  { status: "Pending", count: 1 },
  { status: "Draft", count: 1 },
]

export const monthlyComparison = [
  { month: "Jan", collected: 15000, outstanding: 3000 },
  { month: "Feb", collected: 20000, outstanding: 2000 },
  { month: "Mar", collected: 12000, outstanding: 3000 },
  { month: "Apr", collected: 25000, outstanding: 3000 },
  { month: "May", collected: 18000, outstanding: 5000 },
  { month: "Jun", collected: 17000, outstanding: 7000 },
]

export const revenueByPlan = [
  { plan: "Starter", revenue: 2000 },
  { plan: "Standard", revenue: 15000 },
  { plan: "Premium", revenue: 8000 },
]

export const weeklyCompletion = [
  { day: "Mon", completed: 2, total: 4 },
  { day: "Tue", completed: 3, total: 4 },
  { day: "Wed", completed: 1, total: 3 },
  { day: "Thu", completed: 4, total: 5 },
  { day: "Fri", completed: 2, total: 3 },
]

export const tasksByProject = [
  { project: "Keel", count: 3 },
  { project: "Ancy Luxe", count: 2 },
  { project: "PowerSec", count: 1 },
  { project: "Campus Glow", count: 1 },
  { project: "Personal", count: 2 },
]

export const revenueByServiceType = [
  { type: "Website", revenue: 98000 },
  { type: "Bot", revenue: 35000 },
  { type: "Dashboard", revenue: 28000 },
  { type: "SaaS", revenue: 24000 },
]

export const monthOverMonthGrowth = [
  { month: "Feb", growth: 22.2 },
  { month: "Mar", growth: -31.8 },
  { month: "Apr", growth: 86.7 },
  { month: "May", growth: -17.9 },
  { month: "Jun", growth: 4.3 },
]

export const allTimeStats = {
  totalRevenue: 187000,
  totalClients: 6,
  totalProjects: 9,
  avgProjectValue: 31200,
  totalExpenses: 19300,
  totalInvoiced: 171000,
  outstandingAmount: 35000,
  bestMonth: { month: "April 2026", revenue: 28000 },
  worstMonth: { month: "March 2026", revenue: 15000 },
  clientAcquisition: [
    { month: "Jan", newClients: 1 },
    { month: "Feb", newClients: 0 },
    { month: "Mar", newClients: 2 },
    { month: "Apr", newClients: 1 },
    { month: "May", newClients: 0 },
    { month: "Jun", newClients: 1 },
  ],
}
