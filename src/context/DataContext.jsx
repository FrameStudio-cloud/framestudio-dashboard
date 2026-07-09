import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { supabaseKeel } from "../lib/supabaseKeel";
import { mockClients, mockLinks, mockIncome, mockFocusItems, mockExpenses, mockInvoices, mockActivityFeed, mockNotifications } from "../data/mock";

function toCamelCase(obj) {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  return Object.entries(obj).reduce((acc, [key, val]) => {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    acc[camelKey] = val;
    return acc;
  }, {});
}

function toSnakeCase(obj) {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  return Object.entries(obj).reduce((acc, [key, val]) => {
    const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
    acc[snakeKey] = val;
    return acc;
  }, {});
}

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const isSupabase = !!supabase;
  const [ready, setReady] = useState(!isSupabase);
  const [clients, setClients] = useState(isSupabase ? [] : mockClients);
  const [links, setLinks] = useState(isSupabase ? [] : mockLinks);
  const [income, setIncome] = useState(isSupabase ? [] : mockIncome);
  const [expenses, setExpenses] = useState(isSupabase ? [] : mockExpenses);
  const [invoices, setInvoices] = useState(isSupabase ? [] : mockInvoices);
  const [focusItems, setFocusItems] = useState(isSupabase ? [] : mockFocusItems);
  const [activityFeed, setActivityFeed] = useState(mockActivityFeed);
  const [notifications, setNotifications] = useState(isSupabase ? [] : mockNotifications);
  const [keelShops, setKeelShops] = useState([]);
  const [keelActivityLog, setKeelActivityLog] = useState([]);

  // Fetch all data from Supabase on mount
  useEffect(() => {
    if (!isSupabase) return;
    let cancelled = false;

    async function fetchAll() {
      const tables = [
        { key: "clients", table: "clients" },
        { key: "links", table: "links" },
        { key: "income", table: "income" },
        { key: "expenses", table: "expenses" },
        { key: "invoices", table: "invoices" },
        { key: "focusItems", table: "focus_items" },
        { key: "notifications", table: "notifications" },
      ];

      const results = await Promise.allSettled(
        tables.map((t) => supabase.from(t.table).select("*").order("created_at", { ascending: false }))
      );

      if (cancelled) return;

      results.forEach((result, i) => {
        const key = tables[i].key;
        if (result.status === "fulfilled" && result.value.data) {
          const setter = { setClients, setLinks, setIncome, setExpenses, setInvoices, setFocusItems, setNotifications }[`set${key.charAt(0).toUpperCase() + key.slice(1)}`];
          if (setter) setter(result.value.data.map(toCamelCase));
        }
      });

      // Also fetch activity feed from FrameStudio's keel_activity_log
      const { data: feedData } = await supabase.from("keel_activity_log").select("*").order("timestamp", { ascending: false }).limit(50);
      if (!cancelled && feedData) {
        const mapped = feedData.map((l) => ({
          id: l.id,
          type: "keel",
          message: `${l.shop} — ${l.detail}`,
          client: l.shop,
          timestamp: l.timestamp,
          link: "/keel",
        }));
        setActivityFeed((prev) => [...mapped, ...prev]);
      }

      // Fetch keel data from Keel's own Supabase project
      if (supabaseKeel) {
        const keelTables = [
          { key: "keelShops", table: "keel_shops" },
          { key: "keelActivityLog", table: "keel_activity_log" },
        ];
        const keelResults = await Promise.allSettled(
          keelTables.map((t) => supabaseKeel.from(t.table).select("*").order("created_at", { ascending: false }))
        );

        // Also fetch from the main `shops` table (where mobile app signups land)
        const { data: appShops } = await supabaseKeel.from("shops").select("id, name, created_at, subscription_expires_at").order("created_at", { ascending: false });

        if (!cancelled) {
          keelResults.forEach((result, i) => {
            const key = keelTables[i].key;
            if (result.status === "fulfilled" && result.value.data) {
              const setter = { setKeelShops, setKeelActivityLog }[`set${key.charAt(0).toUpperCase() + key.slice(1)}`];
              if (setter) setter(result.value.data.map(toCamelCase));
            }
          });

          // Merge shops from the app's `shops` table into keelShops
          if (appShops) {
            setKeelShops((prev) => {
              const existingNames = new Set(prev.map((s) => s.name.toLowerCase().trim()));
              const merged = [...prev];
              appShops.forEach((s) => {
                if (!existingNames.has(s.name.toLowerCase().trim())) {
                  merged.push({
                    id: s.id,
                    name: s.name,
                    status: "active",
                    plan: "starter",
                    revenue: 0,
                    owner: s.name,
                    createdAt: s.created_at,
                    subscriptionExpiresAt: s.subscription_expires_at || new Date(new Date(s.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                  });
                }
              });
              return merged;
            });
          }
        }
      }

      if (!cancelled) setReady(true);
    }

    fetchAll();
    return () => { cancelled = true; };
  }, [isSupabase]);

  // Helper: upsert into supabase and update local state
  const upsertLocal = useCallback((setter, key, record) => {
    const r = toCamelCase(record);
    setter((prev) => {
      const idx = prev.findIndex((item) => item.id === r.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = r;
        return copy;
      }
      return [r, ...prev];
    });
  }, []);

  const removeLocal = useCallback((setter, id) => {
    setter((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const pushActivity = useCallback((entry) => {
    const fullEntry = { id: crypto.randomUUID?.() || String(Date.now()), timestamp: new Date().toISOString(), ...entry };
    setActivityFeed((prev) => [fullEntry, ...prev]);
    if (isSupabase) {
      supabase.from("keel_activity_log").insert({
        action: entry.type || "generic",
        shop: entry.client || "system",
        detail: entry.message || "",
        timestamp: new Date().toISOString(),
      }).then().catch(() => {});
    }
    return fullEntry;
  }, [isSupabase]);

  const pushNotification = useCallback((notif) => {
    const fullNotif = { id: crypto.randomUUID?.() || String(Date.now()), read: false, createdAt: new Date().toISOString(), ...notif };
    setNotifications((prev) => [fullNotif, ...prev]);
    if (isSupabase) {
      supabase.from("notifications").insert({
        type: notif.type || "generic",
        message: notif.message || "",
        link: notif.link || "/",
      }).then().catch(() => {});
    }
    return fullNotif;
  }, [isSupabase]);

  // --- CLIENTS ---
  const addClient = useCallback(async (data) => {
    if (isSupabase) {
      const { data: record, error } = await supabase.from("clients").insert(toSnakeCase(data)).select().single();
      if (error) throw error;
      setClients((prev) => [toCamelCase(record), ...prev]);
      pushActivity({ type: "client", message: `New client: ${data.name} added`, client: data.name, link: "/clients" });
      return toCamelCase(record);
    }
    const client = { ...data, id: String(Date.now()) };
    setClients((prev) => [...prev, client]);
    pushActivity({ type: "client", message: `New client: ${data.name} added`, client: data.name, link: "/clients" });
    return client;
  }, [isSupabase, pushActivity]);

  const updateClient = useCallback(async (id, data) => {
    if (isSupabase) {
      const { data: record } = await supabase.from("clients").update(toSnakeCase(data)).eq("id", id).select().single();
      if (record) upsertLocal(setClients, "clients", record);
      return;
    }
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  }, [isSupabase, upsertLocal]);

  const deleteClient = useCallback(async (id) => {
    if (isSupabase) await supabase.from("clients").delete().eq("id", id);
    removeLocal(setClients, id);
  }, [isSupabase, removeLocal]);

  // --- LINKS ---
  const addLink = useCallback(async (data) => {
    if (isSupabase) {
      const { data: record } = await supabase.from("links").insert(toSnakeCase(data)).select().single();
      if (record) setLinks((prev) => [toCamelCase(record), ...prev]);
      return toCamelCase(record);
    }
    const link = { ...data, id: String(Date.now()) };
    setLinks((prev) => [...prev, link]);
    return link;
  }, [isSupabase]);

  const updateLink = useCallback(async (id, data) => {
    if (isSupabase) {
      const { data: record } = await supabase.from("links").update(toSnakeCase(data)).eq("id", id).select().single();
      if (record) upsertLocal(setLinks, "links", record);
      return;
    }
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...data } : l)));
  }, [isSupabase, upsertLocal]);

  const deleteLink = useCallback(async (id) => {
    if (isSupabase) await supabase.from("links").delete().eq("id", id);
    removeLocal(setLinks, id);
  }, [isSupabase, removeLocal]);

  // --- INCOME ---
  const addIncome = useCallback(async (data) => {
    if (isSupabase) {
      const { data: record } = await supabase.from("income").insert(toSnakeCase(data)).select().single();
      if (record) {
        setIncome((prev) => [toCamelCase(record), ...prev]);
        pushActivity({ type: "payment", message: `${data.clientName} paid KES ${data.amount.toLocaleString()}`, client: data.clientName, link: "/finances" });
      }
      return toCamelCase(record);
    }
    const entry = { ...data, id: String(Date.now()) };
    setIncome((prev) => [...prev, entry]);
    pushActivity({ type: "payment", message: `${data.clientName} paid KES ${data.amount.toLocaleString()}`, client: data.clientName, link: "/finances" });
    return entry;
  }, [isSupabase, pushActivity]);

  const updateIncome = useCallback(async (id, data) => {
    if (isSupabase) {
      const { data: record } = await supabase.from("income").update(toSnakeCase(data)).eq("id", id).select().single();
      if (record) upsertLocal(setIncome, "income", record);
      return;
    }
    setIncome((prev) => prev.map((i) => (i.id === id ? { ...i, ...data } : i)));
  }, [isSupabase, upsertLocal]);

  const deleteIncome = useCallback(async (id) => {
    if (isSupabase) await supabase.from("income").delete().eq("id", id);
    removeLocal(setIncome, id);
  }, [isSupabase, removeLocal]);

  // --- EXPENSES ---
  const addExpense = useCallback(async (data) => {
    if (isSupabase) {
      const { data: record } = await supabase.from("expenses").insert(toSnakeCase(data)).select().single();
      if (record) setExpenses((prev) => [toCamelCase(record), ...prev]);
      return toCamelCase(record);
    }
    const entry = { ...data, id: String(Date.now()) };
    setExpenses((prev) => [...prev, entry]);
    return entry;
  }, [isSupabase]);

  const updateExpense = useCallback(async (id, data) => {
    if (isSupabase) {
      const { data: record } = await supabase.from("expenses").update(toSnakeCase(data)).eq("id", id).select().single();
      if (record) upsertLocal(setExpenses, "expenses", record);
      return;
    }
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));
  }, [isSupabase, upsertLocal]);

  const deleteExpense = useCallback(async (id) => {
    if (isSupabase) await supabase.from("expenses").delete().eq("id", id);
    removeLocal(setExpenses, id);
  }, [isSupabase, removeLocal]);

  // --- INVOICES ---
  const addInvoice = useCallback(async (data) => {
    if (isSupabase) {
      const { data: record } = await supabase.from("invoices").insert(toSnakeCase(data)).select().single();
      if (record) {
        setInvoices((prev) => [toCamelCase(record), ...prev]);
        pushActivity({ type: "invoice", message: `Invoice created for ${data.clientName} — KES ${data.amount.toLocaleString()}`, client: data.clientName, link: "/finances" });
      }
      return toCamelCase(record);
    }
    const inv = { ...data, id: String(Date.now()) };
    setInvoices((prev) => [...prev, inv]);
    pushActivity({ type: "invoice", message: `Invoice created for ${data.clientName} — KES ${data.amount.toLocaleString()}`, client: data.clientName, link: "/finances" });
    return inv;
  }, [isSupabase, pushActivity]);

  const updateInvoice = useCallback(async (id, data) => {
    if (isSupabase) {
      const { data: record } = await supabase.from("invoices").update(toSnakeCase(data)).eq("id", id).select().single();
      if (record) upsertLocal(setInvoices, "invoices", record);
      return;
    }
    setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, ...data } : inv)));
  }, [isSupabase, upsertLocal]);

  const deleteInvoice = useCallback(async (id) => {
    if (isSupabase) await supabase.from("invoices").delete().eq("id", id);
    removeLocal(setInvoices, id);
  }, [isSupabase, removeLocal]);

  // --- FOCUS ITEMS ---
  const addFocusItem = useCallback(async (data) => {
    if (isSupabase) {
      const { data: record } = await supabase.from("focus_items").insert({ ...toSnakeCase(data), sort_order: 0 }).select().single();
      if (record) {
        setFocusItems((prev) => [toCamelCase(record), ...prev]);
        pushActivity({ type: "task", message: `New task: ${data.content}`, client: data.project, link: "/focus" });
      }
      return toCamelCase(record);
    }
    const item = { ...data, id: String(Date.now()), completed: false, status: "todo" };
    setFocusItems((prev) => [...prev, item]);
    pushActivity({ type: "task", message: `New task: ${data.content}`, client: data.project, link: "/focus" });
    return item;
  }, [isSupabase, pushActivity]);

  const updateFocusItem = useCallback(async (id, data) => {
    if (isSupabase) {
      const { data: record } = await supabase.from("focus_items").update(toSnakeCase(data)).eq("id", id).select().single();
      if (record) upsertLocal(setFocusItems, "focus_items", record);
      return;
    }
    setFocusItems((prev) => prev.map((f) => (f.id === id ? { ...f, ...data } : f)));
  }, [isSupabase, upsertLocal]);

  const toggleFocusItem = useCallback(async (id) => {
    if (isSupabase) {
      const item = focusItems.find((f) => f.id === id);
      if (!item) return;
      const nextCompleted = !item.completed;
      const nextStatus = nextCompleted ? "done" : "in_progress";
      const { data: record } = await supabase.from("focus_items").update({ completed: nextCompleted, status: nextStatus }).eq("id", id).select().single();
      if (record) upsertLocal(setFocusItems, "focus_items", toCamelCase(record));
      return;
    }
    setFocusItems((prev) => prev.map((f) => (f.id === id ? { ...f, completed: !f.completed, status: f.completed ? "in_progress" : "done" } : f)));
  }, [isSupabase, focusItems, upsertLocal]);

  const reorderFocusItems = useCallback(async (items) => {
    setFocusItems(items);
    if (isSupabase) {
      const updates = items.map((item, i) => supabase.from("focus_items").update({ sort_order: i }).eq("id", item.id));
      await Promise.allSettled(updates);
    }
  }, [isSupabase]);

  const deleteFocusItem = useCallback(async (id) => {
    if (isSupabase) await supabase.from("focus_items").delete().eq("id", id);
    removeLocal(setFocusItems, id);
  }, [isSupabase, removeLocal]);

  // --- NOTIFICATIONS ---
  const markNotificationRead = useCallback(async (id) => {
    if (isSupabase) await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, [isSupabase]);

  const markAllNotificationsRead = useCallback(async () => {
    if (isSupabase) await supabase.from("notifications").update({ read: true }).neq("id", "none");
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [isSupabase]);

  // --- KEEL ---
  const renewShop = useCallback(async (id, days = 30) => {
    const shop = keelShops.find((s) => s.id === id);
    if (!shop) return;
    const newExpiry = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    if (supabaseKeel) {
      await supabaseKeel.from("keel_shops").update({ status: "active", subscription_expires_at: newExpiry }).eq("id", id);
      const { data: logEntry } = await supabaseKeel.from("keel_activity_log").insert({
        action: "renewal", shop: shop.name, detail: `Renewed for ${days} days by admin`, timestamp: new Date().toISOString(),
      }).select().single();
      setKeelShops((prev) => prev.map((s) => s.id === id ? { ...s, status: "active", subscriptionExpiresAt: newExpiry } : s));
      if (logEntry) {
        const c = toCamelCase(logEntry);
        setKeelActivityLog((prev) => [c, ...prev]);
        setActivityFeed((prev) => [{ id: c.id, type: "keel", message: `${c.shop} — ${c.detail}`, client: c.shop, timestamp: c.timestamp, link: "/keel" }, ...prev]);
      }
      return;
    }
    setKeelShops((prev) => prev.map((s) => s.id === id ? { ...s, status: "active", subscriptionExpiresAt: newExpiry } : s));
    const logEntry = { id: crypto.randomUUID?.() || String(Date.now()), action: "renewal", shop: shop.name, detail: `Renewed for ${days} days by admin`, timestamp: new Date().toISOString() };
    setKeelActivityLog((prev) => [logEntry, ...prev]);
    setActivityFeed((prev) => [{ id: logEntry.id, type: "keel", message: `${logEntry.shop} — ${logEntry.detail}`, client: logEntry.shop, timestamp: logEntry.timestamp, link: "/keel" }, ...prev]);
  }, [keelShops]);

  return (
    <DataContext.Provider value={{
      ready, clients, links, income, expenses, invoices, focusItems, activityFeed, notifications,
      keelShops, keelActivityLog,
      addClient, updateClient, deleteClient,
      addLink, updateLink, deleteLink,
      addIncome, updateIncome, deleteIncome,
      addExpense, updateExpense, deleteExpense,
      addInvoice, updateInvoice, deleteInvoice,
      addFocusItem, updateFocusItem, toggleFocusItem, reorderFocusItems, deleteFocusItem,
      pushActivity, pushNotification,
      markNotificationRead, markAllNotificationsRead,
      renewShop,
    }}>
      {!ready ? (
        <div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-[#0f172a]">
          <div className="text-sm text-slate-600 dark:text-slate-400 animate-pulse">Loading data...</div>
        </div>
      ) : children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
