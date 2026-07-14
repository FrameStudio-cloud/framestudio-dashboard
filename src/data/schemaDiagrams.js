export const domainColors = {
  auth: { bg: "#3b82f6", bgLight: "bg-blue-500/10", text: "text-blue-400", hex: "#3b82f6" },
  "user-owned": { bg: "#f59e0b", bgLight: "bg-amber-500/10", text: "text-amber-400", hex: "#f59e0b" },
  keel: { bg: "#8b5cf6", bgLight: "bg-purple-500/10", text: "text-purple-400", hex: "#8b5cf6" },
  shop: { bg: "#ec4899", bgLight: "bg-pink-500/10", text: "text-pink-400", hex: "#ec4899" },
  finance: { bg: "#22c55e", bgLight: "bg-green-500/10", text: "text-green-400", hex: "#22c55e" },
  chat: { bg: "#14b8a6", bgLight: "bg-teal-500/10", text: "text-teal-400", hex: "#14b8a6" },
  catalog: { bg: "#f97316", bgLight: "bg-orange-500/10", text: "text-orange-400", hex: "#f97316" },
  content: { bg: "#06b6d4", bgLight: "bg-cyan-500/10", text: "text-cyan-400", hex: "#06b6d4" },
};

function col(name, type, opts = {}) {
  return { name, type, pk: opts.pk || false, fk: opts.fk || null, nullable: opts.nullable || false, default: opts.default || null };
}

function table(id, label, domain, x, y, columns) {
  return { id, label, domain, x, y, width: 232, columns };
}

function buildRelationships(tables) {
  const edges = [];
  tables.forEach((t) => {
    t.columns.forEach((c) => {
      if (c.fk) {
        edges.push({
          id: `edge-${t.id}-${c.name}`,
          fromTable: t.id,
          fromColumn: c.name,
          toTable: c.fk.table,
          toColumn: c.fk.column,
        });
      }
    });
  });
  return edges;
}

const framestudioTables = [
  table("auth-users", "auth.users", "auth", 480, 30, [
    col("id", "uuid", { pk: true }),
    col("email", "text"),
    col("created_at", "timestamptz"),
  ]),
  table("clients", "clients", "user-owned", 60, 200, [
    col("id", "uuid", { pk: true }),
    col("user_id", "uuid", { fk: { table: "auth-users", column: "id" } }),
    col("name", "text"),
    col("business", "text"),
    col("email", "text"),
    col("phone", "text"),
    col("project_status", "text"),
    col("invoice_status", "text"),
    col("project_value", "bigint"),
    col("stage", "text"),
    col("created_at", "timestamptz"),
  ]),
  table("links", "links", "user-owned", 340, 200, [
    col("id", "uuid", { pk: true }),
    col("user_id", "uuid", { fk: { table: "auth-users", column: "id" } }),
    col("client_name", "text"),
    col("live_url", "text"),
    col("category", "text"),
    col("favourite", "boolean"),
    col("tags", "jsonb"),
    col("created_at", "timestamptz"),
  ]),
  table("notifications", "notifications", "user-owned", 620, 200, [
    col("id", "uuid", { pk: true }),
    col("user_id", "uuid", { fk: { table: "auth-users", column: "id" } }),
    col("type", "text"),
    col("message", "text"),
    col("link", "text"),
    col("read", "boolean"),
    col("created_at", "timestamptz"),
  ]),
  table("income", "income", "finance", 60, 420, [
    col("id", "uuid", { pk: true }),
    col("user_id", "uuid", { fk: { table: "auth-users", column: "id" } }),
    col("client_name", "text"),
    col("amount", "bigint"),
    col("description", "text"),
    col("date", "date"),
    col("payment_method", "text"),
    col("created_at", "timestamptz"),
  ]),
  table("expenses", "expenses", "finance", 340, 420, [
    col("id", "uuid", { pk: true }),
    col("user_id", "uuid", { fk: { table: "auth-users", column: "id" } }),
    col("description", "text"),
    col("amount", "bigint"),
    col("category", "text"),
    col("date", "date"),
    col("payment_method", "text"),
    col("created_at", "timestamptz"),
  ]),
  table("invoices", "invoices", "finance", 620, 420, [
    col("id", "uuid", { pk: true }),
    col("user_id", "uuid", { fk: { table: "auth-users", column: "id" } }),
    col("client_name", "text"),
    col("amount", "bigint"),
    col("status", "text"),
    col("issued", "date"),
    col("due", "date"),
    col("paid_at", "date"),
    col("created_at", "timestamptz"),
  ]),
  table("focus-items", "focus_items", "user-owned", 340, 620, [
    col("id", "uuid", { pk: true }),
    col("user_id", "uuid", { fk: { table: "auth-users", column: "id" } }),
    col("content", "text"),
    col("project", "text"),
    col("completed", "boolean"),
    col("priority", "text"),
    col("due_date", "date"),
    col("status", "text"),
    col("sort_order", "integer"),
    col("created_at", "timestamptz"),
  ]),
  table("keel-shops", "keel_shops", "keel", 60, 640, [
    col("id", "uuid", { pk: true }),
    col("name", "text"),
    col("status", "text"),
    col("plan", "text"),
    col("revenue", "bigint"),
    col("owner", "text"),
    col("created_at", "timestamptz"),
  ]),
  table("keel-approvals", "keel_approvals", "keel", 340, 640, [
    col("id", "uuid", { pk: true }),
    col("shop_name", "text"),
    col("owner", "text"),
    col("plan", "text"),
    col("status", "text"),
    col("submitted_at", "timestamptz"),
    col("created_at", "timestamptz"),
  ]),
  table("keel-activity-log", "keel_activity_log", "keel", 620, 640, [
    col("id", "uuid", { pk: true }),
    col("action", "text"),
    col("shop", "text"),
    col("detail", "text"),
    col("timestamp", "timestamptz"),
  ]),
];

const blogTables = [
  table("blog-users", "users", "auth", 400, 30, [
    col("id", "uuid", { pk: true }),
    col("email", "text"),
    col("name", "text"),
    col("avatar_url", "text"),
    col("created_at", "timestamptz"),
  ]),
  table("posts", "posts", "user-owned", 100, 220, [
    col("id", "uuid", { pk: true }),
    col("author_id", "uuid", { fk: { table: "blog-users", column: "id" } }),
    col("title", "text"),
    col("slug", "text"),
    col("content", "text"),
    col("published", "boolean"),
    col("created_at", "timestamptz"),
  ]),
  table("comments", "comments", "user-owned", 400, 220, [
    col("id", "uuid", { pk: true }),
    col("post_id", "uuid", { fk: { table: "posts", column: "id" } }),
    col("author_id", "uuid", { fk: { table: "blog-users", column: "id" } }),
    col("body", "text"),
    col("created_at", "timestamptz"),
  ]),
  table("categories", "categories", "content", 100, 420, [
    col("id", "uuid", { pk: true }),
    col("name", "text"),
    col("slug", "text"),
    col("description", "text"),
  ]),
  table("post-categories", "post_categories", "content", 400, 420, [
    col("id", "uuid", { pk: true }),
    col("post_id", "uuid", { fk: { table: "posts", column: "id" } }),
    col("category_id", "uuid", { fk: { table: "categories", column: "id" } }),
  ]),
  table("tags", "tags", "content", 100, 580, [
    col("id", "uuid", { pk: true }),
    col("name", "text"),
    col("slug", "text"),
  ]),
  table("post-tags", "post_tags", "content", 400, 580, [
    col("id", "uuid", { pk: true }),
    col("post_id", "uuid", { fk: { table: "posts", column: "id" } }),
    col("tag_id", "uuid", { fk: { table: "tags", column: "id" } }),
  ]),
];

const keelTables = [
  table("shops", "shops", "shop", 480, 20, [
    col("id", "uuid", { pk: true }),
    col("name", "text"),
    col("slug", "text"),
    col("subscription_expires_at", "timestamptz"),
    col("scheduled_deletion_at", "timestamptz"),
    col("created_at", "timestamptz"),
  ]),
  table("store-settings", "store_settings", "shop", 120, 20, [
    col("id", "uuid", { pk: true }),
    col("shop_id", "uuid", { fk: { table: "shops", column: "id" } }),
    col("store_name", "text"),
    col("currency_symbol", "text"),
    col("theme", "text"),
    col("whatsapp", "text"),
    col("logo_url", "text"),
  ]),
  table("shop-users", "users", "shop", 840, 20, [
    col("id", "uuid", { pk: true }),
    col("auth_user_id", "uuid"),
    col("shop_id", "uuid", { fk: { table: "shops", column: "id" } }),
    col("name", "text"),
    col("email", "text"),
  ]),
  table("products", "products", "catalog", 80, 200, [
    col("id", "uuid", { pk: true }),
    col("shop_id", "uuid", { fk: { table: "shops", column: "id" } }),
    col("name", "text"),
    col("price", "numeric"),
    col("stock", "integer"),
    col("cost_price", "numeric"),
    col("image", "text"),
    col("created_at", "timestamptz"),
  ]),
  table("catalogue", "catalogue", "catalog", 360, 200, [
    col("id", "uuid", { pk: true }),
    col("shop_id", "uuid", { fk: { table: "shops", column: "id" } }),
    col("product_id", "uuid", { fk: { table: "products", column: "id" } }),
    col("name", "text"),
    col("price", "numeric"),
    col("image", "text"),
    col("available", "boolean"),
    col("featured", "boolean"),
    col("created_at", "timestamptz"),
  ]),
  table("sales", "sales", "finance", 80, 400, [
    col("id", "uuid", { pk: true }),
    col("shop_id", "uuid", { fk: { table: "shops", column: "id" } }),
    col("product_id", "uuid"),
    col("product_name", "text"),
    col("amount", "numeric"),
    col("quantity", "integer"),
    col("method", "text"),
    col("created_at", "timestamptz"),
  ]),
  table("payments", "payments", "finance", 360, 400, [
    col("id", "uuid", { pk: true }),
    col("shop_id", "uuid", { fk: { table: "shops", column: "id" } }),
    col("invoice_id", "text"),
    col("provider", "text"),
    col("amount", "numeric"),
    col("status", "text"),
    col("created_at", "timestamptz"),
  ]),
  table("expenses-keel", "expenses", "finance", 640, 400, [
    col("id", "uuid", { pk: true }),
    col("shop_id", "uuid", { fk: { table: "shops", column: "id" } }),
    col("description", "text"),
    col("amount", "numeric"),
    col("category", "text"),
    col("payment_method", "text"),
    col("expense_date", "date"),
  ]),
  table("banners", "banners", "content", 640, 200, [
    col("id", "uuid", { pk: true }),
    col("shop_id", "uuid", { fk: { table: "shops", column: "id" } }),
    col("type", "text"),
    col("title", "text"),
    col("message", "text"),
    col("image_url", "text"),
    col("active", "boolean"),
  ]),
  table("posts-keel", "posts", "content", 840, 200, [
    col("id", "uuid", { pk: true }),
    col("shop_id", "uuid", { fk: { table: "shops", column: "id" } }),
    col("platform", "text"),
    col("caption", "text"),
    col("status", "text"),
    col("likes", "integer"),
    col("created_at", "timestamptz"),
  ]),
  table("stock-movements", "stock_movements", "catalog", 840, 400, [
    col("id", "uuid", { pk: true }),
    col("shop_id", "uuid", { fk: { table: "shops", column: "id" } }),
    col("product_name", "text"),
    col("change", "integer"),
    col("reason", "text"),
    col("created_at", "timestamptz"),
  ]),
  table("page-views", "page_views", "content", 80, 560, [
    col("id", "uuid", { pk: true }),
    col("shop_id", "uuid", { fk: { table: "shops", column: "id" } }),
    col("page", "text"),
    col("product_name", "text"),
    col("referrer", "text"),
    col("created_at", "timestamptz"),
  ]),
  table("categories-keel", "categories", "catalog", 1080, 200, [
    col("id", "uuid", { pk: true }),
    col("name", "text"),
    col("slug", "text"),
    col("created_at", "timestamptz"),
  ]),
  table("category-attributes", "category_attributes", "catalog", 1080, 340, [
    col("id", "uuid", { pk: true }),
    col("category_id", "uuid", { fk: { table: "categories-keel", column: "id" } }),
    col("name", "text"),
    col("type", "text"),
    col("options", "jsonb"),
    col("required", "boolean"),
  ]),
  table("product-attr-values", "product_attribute_values", "catalog", 1080, 500, [
    col("id", "uuid", { pk: true }),
    col("product_id", "uuid", { fk: { table: "products", column: "id" } }),
    col("attribute_id", "uuid", { fk: { table: "category-attributes", column: "id" } }),
    col("shop_id", "uuid", { fk: { table: "shops", column: "id" } }),
    col("value", "text"),
  ]),
  table("catalogue-attr-values", "catalogue_attribute_values", "catalog", 1080, 660, [
    col("id", "uuid", { pk: true }),
    col("catalogue_id", "uuid", { fk: { table: "catalogue", column: "id" } }),
    col("attribute_id", "uuid", { fk: { table: "category-attributes", column: "id" } }),
    col("shop_id", "uuid", { fk: { table: "shops", column: "id" } }),
    col("value", "text"),
  ]),
  table("chat-config", "chat_config", "chat", 80, 720, [
    col("shop_id", "uuid", { pk: true, fk: { table: "shops", column: "id" } }),
    col("enabled", "boolean"),
    col("welcome_message", "text"),
    col("widget_color", "text"),
    col("position", "text"),
    col("whatsapp_number", "text"),
    col("groq_api_key", "text"),
  ]),
  table("chat-faqs", "chat_faqs", "chat", 360, 720, [
    col("id", "bigint", { pk: true }),
    col("shop_id", "uuid", { fk: { table: "shops", column: "id" } }),
    col("question", "text"),
    col("answer", "text"),
    col("sort_order", "integer"),
  ]),
  table("chat-messages", "chat_messages", "chat", 640, 720, [
    col("id", "bigint", { pk: true }),
    col("shop_id", "uuid", { fk: { table: "shops", column: "id" } }),
    col("question", "text"),
    col("answer", "text"),
    col("customer_name", "text"),
    col("status", "text"),
  ]),
  table("chat-callbacks", "chat_callbacks", "chat", 840, 720, [
    col("id", "bigint", { pk: true }),
    col("shop_id", "uuid", { fk: { table: "shops", column: "id" } }),
    col("name", "text"),
    col("phone", "text"),
    col("question", "text"),
    col("status", "text"),
  ]),
  table("chat-stock-alerts", "chat_stock_alerts", "chat", 1080, 720, [
    col("id", "bigint", { pk: true }),
    col("shop_id", "uuid", { fk: { table: "shops", column: "id" } }),
    col("product_name", "text"),
    col("customer_note", "text"),
    col("status", "text"),
  ]),
  table("announcements", "announcements", "content", 80, 880, [
    col("id", "uuid", { pk: true }),
    col("title", "text"),
    col("message", "text"),
    col("variant", "text"),
    col("active", "boolean"),
    col("starts_at", "timestamptz"),
    col("expires_at", "timestamptz"),
  ]),
  table("announcement-dismissals", "announcement_dismissals", "content", 400, 880, [
    col("id", "uuid", { pk: true }),
    col("announcement_id", "uuid", { fk: { table: "announcements", column: "id" } }),
    col("shop_id", "uuid", { fk: { table: "shops", column: "id" } }),
    col("dismissed_at", "timestamptz"),
  ]),
  table("keel-shops-keel", "keel_shops", "keel", 840, 880, [
    col("id", "uuid", { pk: true }),
    col("name", "text"),
    col("status", "text"),
    col("plan", "text"),
    col("revenue", "bigint"),
    col("subscription_expires_at", "timestamptz"),
    col("created_at", "timestamptz"),
  ]),
  table("keel-approvals-keel", "keel_approvals", "keel", 1080, 880, [
    col("id", "uuid", { pk: true }),
    col("shop_name", "text"),
    col("owner", "text"),
    col("plan", "text"),
    col("status", "text"),
    col("submitted_at", "timestamptz"),
  ]),
];

function flowNode(id, type, label, subtitle, x, y, width) {
  return { id, type, label, subtitle, x, y, width: width || 180 };
}

const authFlowNodes = [
  flowNode("f-app-start", "trigger", "App Start", null, 240, 10),
  flowNode("f-check-env", "decision", "Supabase Env", "VITE_SUPABASE_URL + KEY set?", 240, 80),

  flowNode("f-offline-mode", "state", "Offline Mode", "supabase = null", 60, 180),
  flowNode("f-protected-offline", "gate", "ProtectedRoute", "renders children directly", 60, 270),
  flowNode("f-dashboard-mock", "page", "Dashboard (Mock)", "clients, finance, keel data", 60, 360),

  flowNode("f-supabase-client", "service", "Supabase Client", "createClient(url, anon_key)", 420, 180),
  flowNode("f-login-page", "page", "Login Page", "Sign in / Sign up / Forgot", 420, 270),
  flowNode("f-sign-in", "action", "Sign In", "signInWithPassword()", 420, 360),
  flowNode("f-auth-context", "service", "AuthContext", "onAuthStateChange listener", 420, 450),
  flowNode("f-user-session", "state", "User Session Set", "user object in context", 420, 540),
  flowNode("f-protected-auth", "gate", "ProtectedRoute", "user found → show app", 420, 630),
  flowNode("f-data-provider", "service", "DataProvider", "fetches 7 tables via Promise.allSettled", 420, 720),

  flowNode("f-main-db", "database", "Main Supabase", "user-owned + RLS (7 tables)", 240, 840),
  flowNode("f-keel-db", "database", "Keel Supabase", "anon key, no RLS (23+ tables)", 600, 840),

  flowNode("f-dashboard-ui", "page", "Dashboard UI", "Dashboard, Clients, Focus...", 240, 940),
  flowNode("f-keel-pulse", "page", "Keel Pulse", "shops, approvals, activity", 600, 940),
];

// ─── Mini Catalogue Flow ────────────────────────────────────────────
const miniCatalogueNodes = [
  flowNode("mc-visit", "trigger", "Visitor Loads Site", null, 340, 10),
  flowNode("mc-config-shop", "service", "Load shop.js", "brand, social, contact, location", 80, 100),
  flowNode("mc-config-products", "service", "Load products.js", "categories, items, prices, images", 600, 100),
  flowNode("mc-compose", "action", "Compose Sections", "read config → render components", 340, 200),
  flowNode("mc-hero", "page", "Hero Section", "headline, service cards, CTA", 80, 310),
  flowNode("mc-catalogue", "page", "Catalogue Grid", "search bar, filters, product cards", 340, 310),
  flowNode("mc-modal", "page", "Product Modal", "detail view, variants, WhatsApp enquiry", 600, 310),
  flowNode("mc-gallery", "page", "Gallery + Social", "image lightbox, IG/TikTok follow", 80, 420),
  flowNode("mc-footer", "page", "Location + Footer", "Google Maps, contact, business hours", 340, 420),
  flowNode("mc-whatsapp", "action", "WhatsApp Float CTA", "floating button with tooltip", 600, 420),
];

const miniCatalogueEdges = [
  { id: "mce1", fromTable: "mc-visit", toTable: "mc-config-shop" },
  { id: "mce2", fromTable: "mc-visit", toTable: "mc-config-products" },
  { id: "mce3", fromTable: "mc-config-shop", toTable: "mc-compose" },
  { id: "mce4", fromTable: "mc-config-products", toTable: "mc-compose" },
  { id: "mce5", fromTable: "mc-compose", toTable: "mc-hero" },
  { id: "mce6", fromTable: "mc-compose", toTable: "mc-catalogue" },
  { id: "mce7", fromTable: "mc-catalogue", toTable: "mc-modal" },
  { id: "mce8", fromTable: "mc-hero", toTable: "mc-gallery" },
  { id: "mce9", fromTable: "mc-catalogue", toTable: "mc-footer" },
  { id: "mce10", fromTable: "mc-gallery", toTable: "mc-footer" },
  { id: "mce11", fromTable: "mc-footer", toTable: "mc-whatsapp" },
];

// ─── PowerSec Architecture ──────────────────────────────────────────
const powerSecNodes = [
  flowNode("ps-trigger", "trigger", "Visitor Arrives", null, 340, 10),
  flowNode("ps-home", "page", "Homepage", "hero, services, trust bar, stats", 80, 110),
  flowNode("ps-products", "page", "Products / Services", "filterable catalogue with dropdowns", 340, 110),
  flowNode("ps-about", "page", "About + Contact", "company info, enquiry form", 600, 110),
  flowNode("ps-admin-gate", "gate", "Is Admin?", "session check → gatekeeper", 600, 230),
  flowNode("ps-login", "page", "Admin Login", "Supabase email/password auth", 600, 340),
  flowNode("ps-dashboard", "page", "Admin Dashboard", "CRUD: products, services, content", 600, 450),
  flowNode("ps-db", "database", "Supabase DB", "products, catalogue, pages, content", 340, 340),
];

const powerSecEdges = [
  { id: "pse1", fromTable: "ps-trigger", toTable: "ps-home" },
  { id: "pse2", fromTable: "ps-trigger", toTable: "ps-products" },
  { id: "pse3", fromTable: "ps-trigger", toTable: "ps-about" },
  { id: "pse4", fromTable: "ps-home", toTable: "ps-db" },
  { id: "pse5", fromTable: "ps-products", toTable: "ps-db" },
  { id: "pse6", fromTable: "ps-about", toTable: "ps-admin-gate" },
  { id: "pse7", fromTable: "ps-admin-gate", toTable: "ps-login", label: "YES" },
  { id: "pse8", fromTable: "ps-admin-gate", toTable: "ps-home", label: "NO" },
  { id: "pse9", fromTable: "ps-login", toTable: "ps-dashboard" },
  { id: "pse10", fromTable: "ps-dashboard", toTable: "ps-db" },
];

// ─── StudyKit Multi-Tool ────────────────────────────────────────────
const studyKitNodes = [
  flowNode("sk-trigger", "trigger", "User Opens StudyKit", null, 340, 10),
  flowNode("sk-selector", "service", "Tool Selector UI", "pick from 4 tool categories", 340, 100),
  flowNode("sk-calc", "action", "Calculators", "academic / math / utility tools", 60, 220),
  flowNode("sk-dfd", "action", "DFD Generator", "describe process → Groq generates", 300, 220),
  flowNode("sk-pdf", "action", "PDF Extractor", "upload PDF → extract text", 540, 220),
  flowNode("sk-svg", "action", "SVG Diagram Editor", "AI-generated SVG rendering", 780, 220),
  flowNode("sk-groq", "database", "Groq AI API", "llama-3.1-8b-instant model", 300, 350),
  flowNode("sk-result", "page", "Results View", "diagram, text, or rendered output", 540, 350),
];

const studyKitEdges = [
  { id: "ske1", fromTable: "sk-trigger", toTable: "sk-selector" },
  { id: "ske2", fromTable: "sk-selector", toTable: "sk-calc" },
  { id: "ske3", fromTable: "sk-selector", toTable: "sk-dfd" },
  { id: "ske4", fromTable: "sk-selector", toTable: "sk-pdf" },
  { id: "ske5", fromTable: "sk-selector", toTable: "sk-svg" },
  { id: "ske6", fromTable: "sk-dfd", toTable: "sk-groq" },
  { id: "ske7", fromTable: "sk-groq", toTable: "sk-result" },
  { id: "ske8", fromTable: "sk-pdf", toTable: "sk-result" },
  { id: "ske9", fromTable: "sk-svg", toTable: "sk-result" },
];

// ─── AI Assistant Pipeline ──────────────────────────────────────────
const aiAssistantNodes = [
  flowNode("ai-trigger", "trigger", "User Picks a Skill", "Website / Code / JSON / Bug / API", 340, 10),
  flowNode("ai-prompt", "action", "Types Description", "quick action pill or free text", 340, 110),
  flowNode("ai-style", "service", "Style Profile Injected", "dark, bold, Kenyan audience preferences", 80, 230),
  flowNode("ai-examples", "service", "Past Examples Injected", "few-shot learning from localStorage", 600, 230),
  flowNode("ai-groq", "service", "Groq API Call", "llama-3.3-70b-versatile + system prompt", 340, 350),
  flowNode("ai-code", "state", "Code Generated", "React, Tailwind, or JSON output", 340, 460),
  flowNode("ai-preview", "page", "Live Preview", "Babel standalone + CDN React in iframe", 80, 570),
  flowNode("ai-export", "action", "Export / Deploy", "copy code or deploy to Vercel", 600, 570),
];

const aiAssistantEdges = [
  { id: "aie1", fromTable: "ai-trigger", toTable: "ai-prompt" },
  { id: "aie2", fromTable: "ai-prompt", toTable: "ai-style" },
  { id: "aie3", fromTable: "ai-prompt", toTable: "ai-examples" },
  { id: "aie4", fromTable: "ai-style", toTable: "ai-groq" },
  { id: "aie5", fromTable: "ai-examples", toTable: "ai-groq" },
  { id: "aie6", fromTable: "ai-groq", toTable: "ai-code" },
  { id: "aie7", fromTable: "ai-code", toTable: "ai-preview" },
  { id: "aie8", fromTable: "ai-code", toTable: "ai-export" },
];

// ─── CLI Tool Flow ──────────────────────────────────────────────────
const cliNodes = [
  flowNode("cli-trigger", "trigger", "npx create-mini-catalogue", null, 340, 10),
  flowNode("cli-prompt", "decision", "Has slug arg?", "slug passed as arg or prompt for autocomplete", 340, 100),
  flowNode("cli-keel", "service", "Connect to Keel Supabase", "hmcowpwfefeeossztuem.supabase.co", 100, 220),
  flowNode("cli-fetch", "action", "Fetch Shop Data", "shops, store_settings, catalogue, products, banners", 340, 220),
  flowNode("cli-fallback", "database", "Keel Database", "23+ tables across 7 domains", 580, 220),
  flowNode("cli-generate", "service", "Generate Vite Project", "EJS templates → scaffold with cite-ui + config", 340, 350),
  flowNode("cli-ready", "state", "Site Ready", "cd my-shop && npm run dev", 160, 470),
  flowNode("cli-deploy", "action", "Deploy to Vercel", "one-command deploy with custom domain", 520, 470),
];

const cliEdges = [
  { id: "clie1", fromTable: "cli-trigger", toTable: "cli-prompt" },
  { id: "clie2", fromTable: "cli-prompt", toTable: "cli-fetch", label: "YES" },
  { id: "clie3", fromTable: "cli-prompt", toTable: "cli-keel", label: "NO" },
  { id: "clie4", fromTable: "cli-keel", toTable: "cli-fallback" },
  { id: "clie5", fromTable: "cli-fallback", toTable: "cli-fetch" },
  { id: "clie6", fromTable: "cli-fetch", toTable: "cli-generate" },
  { id: "clie7", fromTable: "cli-generate", toTable: "cli-ready" },
  { id: "clie8", fromTable: "cli-generate", toTable: "cli-deploy" },
];

// ─── Sales CRM Bot Pipeline ─────────────────────────────────────────
const crmNodes = [
  flowNode("crm-trigger", "trigger", "Lead Arrives", "Telegram message or WhatsApp chat", 340, 10),
  flowNode("crm-platform", "decision", "Platform Router", "Telegram Bot or whatsapp-web.js", 340, 100),
  flowNode("crm-telegram", "service", "Telegram Bot", "personal assistant bot (Node.js)", 100, 220),
  flowNode("crm-whatsapp", "service", "WhatsApp Bot", "whatsapp-web.js session management", 580, 220),
  flowNode("crm-groq", "service", "Groq AI Response", "llama-3.1-8b-instant model", 340, 340),
  flowNode("crm-sheets", "database", "Google Sheets CRM", "lead capture, follow-up tracking", 340, 450),
  flowNode("crm-followup", "action", "Follow-up Triggered", "timed response based on lead data", 340, 560),
];

const crmEdges = [
  { id: "crme1", fromTable: "crm-trigger", toTable: "crm-platform" },
  { id: "crme2", fromTable: "crm-platform", toTable: "crm-telegram", label: "Telegram" },
  { id: "crme3", fromTable: "crm-platform", toTable: "crm-whatsapp", label: "WhatsApp" },
  { id: "crme4", fromTable: "crm-telegram", toTable: "crm-groq" },
  { id: "crme5", fromTable: "crm-whatsapp", toTable: "crm-groq" },
  { id: "crme6", fromTable: "crm-groq", toTable: "crm-sheets" },
  { id: "crme7", fromTable: "crm-sheets", toTable: "crm-followup" },
];

// ─── cite-ui Component Library ──────────────────────────────────────
const citeuiNodes = [
  flowNode("cu-trigger", "trigger", "Source Components", "40+ components + 4 hooks + 7 utils + icons", 340, 10),
  flowNode("cu-mode", "decision", "Build Target", "library (npm) or docs (Vercel)", 340, 100),
  flowNode("cu-lib", "service", "Vite Library Mode", "ESM + UMD output (111kB / 85kB)", 80, 220),
  flowNode("cu-docs", "service", "Vite Docs Config", "separate vite.docs.config.js → dist-docs", 600, 220),
  flowNode("cu-npm", "action", "Publish to npm", "npm publish v1.0.0, peer dep React 18+", 80, 350),
  flowNode("cu-vercel", "action", "Auto-Deploy to Vercel", "root URL → docs.html with rewrites", 600, 350),
  flowNode("cu-consumer", "page", "Consumer Site", "npm install cite-ui → import components", 340, 480),
];

const citeuiEdges = [
  { id: "cue1", fromTable: "cu-trigger", toTable: "cu-mode" },
  { id: "cue2", fromTable: "cu-mode", toTable: "cu-lib", label: "Library" },
  { id: "cue3", fromTable: "cu-mode", toTable: "cu-docs", label: "Docs" },
  { id: "cue4", fromTable: "cu-lib", toTable: "cu-npm" },
  { id: "cue5", fromTable: "cu-docs", toTable: "cu-vercel" },
  { id: "cue6", fromTable: "cu-npm", toTable: "cu-consumer" },
  { id: "cue7", fromTable: "cu-vercel", toTable: "cu-consumer" },
];

// ─── Mini Catalogue Electricals ─────────────────────────────────────
const electricalsNodes = [
  flowNode("el-trigger", "trigger", "User Visits Store", "frame-studio-electricals.vercel.app", 340, 10),
  flowNode("el-navbar", "page", "Navbar (fixed)", "AnnouncementBar embedded, scroll-aware", 80, 120),
  flowNode("el-hero", "page", "Hero Section", "headline, service cards, stats, WhatsApp CTA", 340, 120),
  flowNode("el-trust", "page", "TrustBar", "slow marquee trust badges (60s loop)", 600, 120),
  flowNode("el-catalogue", "page", "Catalogue Grid", "product/service cards, search, filters, modal", 80, 250),
  flowNode("el-gallery", "page", "Gallery Lightbox", "image grid with keyboard lightbox", 340, 250),
  flowNode("el-social", "page", "Social Feed", "Instagram / TikTok follow cards", 600, 250),
  flowNode("el-footer", "page", "Location + Footer", "Google Maps, contact, hours, WhatsAppFloat", 340, 380),
  flowNode("el-admin-gate", "gate", "Admin Panel", "auth-protected CRUD dashboard", 600, 380),
  flowNode("el-supabase", "database", "Supabase (shared)", "banners, catalogue, store_settings, page_views", 340, 500),
];

const electricalsEdges = [
  { id: "ele1", fromTable: "el-trigger", toTable: "el-navbar" },
  { id: "ele2", fromTable: "el-trigger", toTable: "el-hero" },
  { id: "ele3", fromTable: "el-trigger", toTable: "el-trust" },
  { id: "ele4", fromTable: "el-hero", toTable: "el-catalogue" },
  { id: "ele5", fromTable: "el-catalogue", toTable: "el-gallery" },
  { id: "ele6", fromTable: "el-gallery", toTable: "el-social" },
  { id: "ele7", fromTable: "el-social", toTable: "el-footer" },
  { id: "ele8", fromTable: "el-trust", toTable: "el-catalogue" },
  { id: "ele9", fromTable: "el-footer", toTable: "el-admin-gate" },
  { id: "ele10", fromTable: "el-navbar", toTable: "el-supabase" },
  { id: "ele11", fromTable: "el-hero", toTable: "el-supabase" },
  { id: "ele12", fromTable: "el-catalogue", toTable: "el-supabase" },
  { id: "ele13", fromTable: "el-footer", toTable: "el-supabase" },
  { id: "ele14", fromTable: "el-admin-gate", toTable: "el-supabase" },
];

// ─── DB Provisioning Flow ───────────────────────────────────────────
const dbSetupNodes = [
  flowNode("db-trigger", "trigger", "New Client Request", null, 340, 10),
  flowNode("db-create", "action", "Create Supabase Project", "supabase.com → New project → choose region", 340, 110),
  flowNode("db-migrate", "action", "Run Migrations", "shops + catalogue tables with RLS", 340, 220),
  flowNode("db-insert", "action", "Insert Shop Row", "INSERT INTO shops with unique slug", 340, 330),
  flowNode("db-clone", "service", "Clone Mini-Catalogue Template", "git clone → set .env", 100, 450),
  flowNode("db-env", "action", "Set Environment", "VITE_SUPABASE_URL + ANON_KEY + SHOP_SLUG", 580, 450),
  flowNode("db-deploy", "service", "Deploy Frontend", "Vercel / Netlify / Cloudflare", 340, 570),
  flowNode("db-seed", "database", "Keel / Admin Dashboard", "Create catalogue items in DB", 340, 680),
  flowNode("db-live", "state", "Site Live", "public-facing store with live data", 340, 780),
];

// ─── Keel Ecosystem Architecture ────────────────────────────────────
const keelEcosystemNodes = [
  flowNode("keel-owner", "trigger", "Shop Owner", "Manages shop via dashboard", 160, 10),
  flowNode("keel-customer", "trigger", "Customer", "Browses storefront, shops", 740, 10),

  flowNode("keel-dashboard", "page", "Keel Dashboard", "React v4, 16+ routes, Tailwind v4", 160, 120, 220),
  flowNode("keel-storefront", "page", "keel-storefront-*", "Public sites: Zuri, Electricals, Wix", 740, 120, 240),

  flowNode("keel-manage", "action", "Manage Shop", "Inventory, Sales, Settings, Content", 40, 260, 210),
  flowNode("keel-provision", "action", "Provision Storefront", "Pick template → set subdomain → deploy", 320, 260, 230),
  flowNode("keel-provisioner", "service", "storefront-provisioner", "Railway, Express + EJS, auto-deploy", 580, 260, 250),
  flowNode("keel-vercel", "service", "Vercel API", "createProject / deploy / DNS domain", 860, 260, 230),

  flowNode("keel-cart", "action", "Cart & WhatsApp Orders", "CartDrawer, WhatsAppFloat CTA", 740, 380, 230),
  flowNode("keel-chat", "action", "Chat Widget (Pro)", "Groq AI, FAQ, callbacks, stock alerts", 740, 500, 240),

  flowNode("keel-api", "service", "keel-api", "Hono.js gateway, Railway, service_role key", 380, 460, 250),
  flowNode("keel-supabase", "database", "Supabase (shared DB)", "Multi-tenant via shop_id, no RLS", 580, 460, 250),

  flowNode("keel-fsdash", "page", "FrameStudio Dashboard", "Admin Keel Pulse oversight", 160, 460, 230),
  flowNode("keel-pulse", "action", "Keel Pulse", "Shops, Announcements, Activity Log", 160, 600, 210),
];

const keelEcosystemEdges = [
  { id: "kee1", fromTable: "keel-owner", toTable: "keel-dashboard" },
  { id: "kee2", fromTable: "keel-customer", toTable: "keel-storefront" },
  { id: "kee3", fromTable: "keel-dashboard", toTable: "keel-manage" },
  { id: "kee4", fromTable: "keel-dashboard", toTable: "keel-provision" },
  { id: "kee5", fromTable: "keel-provision", toTable: "keel-provisioner", label: "POST /provision" },
  { id: "kee6", fromTable: "keel-provisioner", toTable: "keel-vercel" },
  { id: "kee7", fromTable: "keel-provisioner", toTable: "keel-supabase", label: "reads + writes deployments" },
  { id: "kee8", fromTable: "keel-manage", toTable: "keel-supabase", label: "CRUD" },
  { id: "kee9", fromTable: "keel-storefront", toTable: "keel-cart" },
  { id: "kee10", fromTable: "keel-storefront", toTable: "keel-chat", label: "Runtime" },
  { id: "kee11", fromTable: "keel-storefront", toTable: "keel-api", label: "Build time reads" },
  { id: "kee12", fromTable: "keel-chat", toTable: "keel-api", label: "Groq AI" },
  { id: "kee13", fromTable: "keel-api", toTable: "keel-supabase" },
  { id: "kee14", fromTable: "keel-cart", toTable: "keel-api", label: "Orders" },
  { id: "kee15", fromTable: "keel-fsdash", toTable: "keel-pulse" },
  { id: "kee16", fromTable: "keel-pulse", toTable: "keel-supabase" },
  { id: "kee17", fromTable: "keel-vercel", toTable: "keel-storefront", label: "Deploys" },
  { id: "kee18", fromTable: "keel-dashboard", toTable: "keel-api", label: "Migrating" },
];

const dbSetupEdges = [
  { id: "dbe1", fromTable: "db-trigger", toTable: "db-create" },
  { id: "dbe2", fromTable: "db-create", toTable: "db-migrate" },
  { id: "dbe3", fromTable: "db-migrate", toTable: "db-insert" },
  { id: "dbe4", fromTable: "db-insert", toTable: "db-clone" },
  { id: "dbe5", fromTable: "db-insert", toTable: "db-env" },
  { id: "dbe6", fromTable: "db-clone", toTable: "db-deploy" },
  { id: "dbe7", fromTable: "db-env", toTable: "db-deploy" },
  { id: "dbe8", fromTable: "db-deploy", toTable: "db-seed" },
  { id: "dbe9", fromTable: "db-seed", toTable: "db-live" },
];

const authFlowEdges = [
  { id: "fe1", fromTable: "f-app-start", toTable: "f-check-env" },
  { id: "fe2", fromTable: "f-check-env", toTable: "f-offline-mode", label: "NO" },
  { id: "fe3", fromTable: "f-check-env", toTable: "f-supabase-client", label: "YES" },
  { id: "fe4", fromTable: "f-offline-mode", toTable: "f-protected-offline" },
  { id: "fe5", fromTable: "f-protected-offline", toTable: "f-dashboard-mock" },
  { id: "fe6", fromTable: "f-supabase-client", toTable: "f-login-page" },
  { id: "fe7", fromTable: "f-login-page", toTable: "f-sign-in" },
  { id: "fe8", fromTable: "f-sign-in", toTable: "f-auth-context" },
  { id: "fe9", fromTable: "f-auth-context", toTable: "f-user-session" },
  { id: "fe10", fromTable: "f-user-session", toTable: "f-protected-auth" },
  { id: "fe11", fromTable: "f-protected-auth", toTable: "f-data-provider" },
  { id: "fe12", fromTable: "f-data-provider", toTable: "f-main-db" },
  { id: "fe13", fromTable: "f-data-provider", toTable: "f-keel-db" },
  { id: "fe14", fromTable: "f-main-db", toTable: "f-dashboard-ui" },
  { id: "fe15", fromTable: "f-keel-db", toTable: "f-keel-pulse" },
];

export const defaultDiagrams = [
  {
    id: "framestudio-dashboard",
    name: "FrameStudio Dashboard",
    description: "Main admin dashboard — user-owned tables with auth, finance, and Keel monitoring",
    diagramType: "database",
    projectRef: "sjhwllnhuozxeplpygnc",
    zoom: 0.75,
    tables: framestudioTables,
    relationships: buildRelationships(framestudioTables),
  },
  {
    id: "keel-pos",
    name: "Keel POS",
    description: "Point-of-sale system — shops hub, chat, catalog, attribute system, and admin",
    diagramType: "database",
    projectRef: "hmcowpwfefeeossztuem",
    zoom: 0.45,
    tables: keelTables,
    relationships: buildRelationships(keelTables),
  },
  {
    id: "simple-blog",
    name: "Simple Blog",
    description: "Example schema — users, posts, comments, categories, and tags",
    diagramType: "database",
    projectRef: null,
    zoom: 0.85,
    tables: blogTables,
    relationships: buildRelationships(blogTables),
  },
  {
    id: "auth-flow",
    name: "Auth & Data Flow",
    description: "How FrameStudio Dashboard handles auth and connects to both Supabase projects",
    diagramType: "flow",
    projectRef: null,
    zoom: 0.82,
    tables: authFlowNodes,
    relationships: authFlowEdges,
  },
  {
    id: "mini-catalogue",
    name: "Mini Catalogue Template",
    description: "Config-driven site template for small Kenyan clothing shops — two config files drive all sections",
    diagramType: "flow",
    projectRef: null,
    zoom: 0.85,
    tables: miniCatalogueNodes,
    relationships: miniCatalogueEdges,
  },
  {
    id: "powersec",
    name: "PowerSec Client Site",
    description: "Multi-page website with Supabase admin dashboard for a CCTV/solar/electricals business",
    diagramType: "flow",
    projectRef: null,
    zoom: 0.8,
    tables: powerSecNodes,
    relationships: powerSecEdges,
  },
  {
    id: "studykit",
    name: "StudyKit Multi-Tool",
    description: "Student platform with calculators, Groq AI DFD generator, PDF extraction, and SVG rendering",
    diagramType: "flow",
    projectRef: null,
    zoom: 0.8,
    tables: studyKitNodes,
    relationships: studyKitEdges,
  },
  {
    id: "ai-assistant",
    name: "FrameStudio AI Assistant",
    description: "Chat-based code generator with skill selection, Groq AI, style profiles, and live preview",
    diagramType: "flow",
    projectRef: null,
    zoom: 0.82,
    tables: aiAssistantNodes,
    relationships: aiAssistantEdges,
  },
  {
    id: "create-mini-catalogue",
    name: "create-mini-catalogue CLI",
    description: "CLI tool that scaffolds a complete mini-catalogue site from Keel Supabase data with one command",
    diagramType: "flow",
    projectRef: "hmcowpwfefeeossztuem",
    zoom: 0.82,
    tables: cliNodes,
    relationships: cliEdges,
  },
  {
    id: "sales-crm-bot",
    name: "Sales CRM Bot",
    description: "Telegram + WhatsApp + Groq AI + Google Sheets pipeline for automated lead capture and follow-ups",
    diagramType: "flow",
    projectRef: null,
    zoom: 0.85,
    tables: crmNodes,
    relationships: crmEdges,
  },
  {
    id: "cite-ui",
    name: "cite-ui Component Library",
    description: "React component library build pipeline — source → Vite library mode → npm publish + docs deploy",
    diagramType: "flow",
    projectRef: null,
    zoom: 0.85,
    tables: citeuiNodes,
    relationships: citeuiEdges,
  },
  {
    id: "mini-catalogue-electricals",
    name: "Mini Catalogue Electricals",
    description: "Public-facing store website with single-page scrolling layout and Supabase-backed admin panel",
    diagramType: "flow",
    projectRef: null,
    zoom: 0.78,
    tables: electricalsNodes,
    relationships: electricalsEdges,
  },
  {
    id: "db-provisioning",
    name: "DB Provisioning Flow",
    description: "Step-by-step checklist for provisioning a Supabase project and connecting a mini-catalogue frontend",
    diagramType: "flow",
    projectRef: null,
    zoom: 0.85,
    tables: dbSetupNodes,
    relationships: dbSetupEdges,
  },
  {
    id: "keel-ecosystem",
    name: "Keel Ecosystem",
    description: "Three-service architecture: Keel Dashboard, storefront-provisioner, keel-storefronts, and keel-api gateways",
    diagramType: "flow",
    projectRef: "hmcowpwfefeeossztuem",
    zoom: 0.72,
    tables: keelEcosystemNodes,
    relationships: keelEcosystemEdges,
  },
];
