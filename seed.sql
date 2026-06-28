-- Seed data for lewisirungu489@gmail.com (3c758dfd-8bb0-4654-8d30-3ca8225a0381)

-- CLIENTS
INSERT INTO clients (id, user_id, name, business, email, phone, whatsapp, live_url, supabase_project, vercel_dashboard, github_repo, project_status, invoice_status, project_value, what_was_built, stage, notes, created_at) VALUES
  ('a0000001-0000-0000-0000-000000000001', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'Ancy Luxe', 'Luxury Hair & Wigs', 'ancy@ancyluxe.com', '+254 700 000 001', 'https://wa.me/254700000001', 'https://ancyluxe.vercel.app', 'ancyluxe-db', 'https://vercel.com/lewis/ancy-luxe', 'https://github.com/lewis/ancy-luxe', 'delivered', 'paid', 45000, 'Mini-catalogue website with WhatsApp ordering', 'delivered', 'Happy client. Referred Zuri Fashion.', '2026-04-01T00:00:00Z'),
  ('a0000002-0000-0000-0000-000000000002', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'Zuri Fashion', 'Clothing Boutique', 'info@zurifashion.co.ke', '+254 700 000 002', 'https://wa.me/254700000002', 'https://zurifashion.vercel.app', 'zuri-fashion-db', 'https://vercel.com/lewis/zuri-fashion', 'https://github.com/lewis/zuri-fashion', 'delivered', 'partial', 35000, 'Full e-commerce catalogue with inventory management', 'delivered', 'Phase 1 complete. Phase 2 in discussion.', '2026-03-15T00:00:00Z'),
  ('a0000003-0000-0000-0000-000000000003', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'PowerSec Solutions', 'Security Systems', 'info@powersec.co.ke', '+254 700 000 003', 'https://wa.me/254700000003', 'https://powersec.vercel.app', 'powersec-db', 'https://vercel.com/lewis/powersec', 'https://github.com/lewis/powersec', 'building', 'pending', 65000, 'Business website + client portal', 'development', 'Client portal taking longer than expected.', '2026-05-01T00:00:00Z'),
  ('a0000004-0000-0000-0000-000000000004', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'Mini Electricals', 'Electronics Shop', 'minielec@gmail.com', '+254 700 000 004', 'https://wa.me/254700000004', 'https://minielectricals.vercel.app', 'minielec-db', 'https://vercel.com/lewis/mini-electricals', 'https://github.com/lewis/mini-electricals', 'on_retainer', 'paid', 12000, 'Catalogue site + monthly maintenance', 'delivered', 'Monthly retainer. Stable client.', '2026-04-01T00:00:00Z'),
  ('a0000005-0000-0000-0000-000000000005', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'Campus Glow', 'Skincare Products', 'hello@campusglow.com', '+254 700 000 005', 'https://wa.me/254700000005', NULL, NULL, NULL, NULL, 'planning', 'pending', 28000, 'Online store + booking system', 'discovery', 'Initial meeting done. Waiting for product photos.', '2026-06-01T00:00:00Z'),
  ('a0000006-0000-0000-0000-000000000006', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'Lumière Hair', 'Premium Hair Studio', 'lumiere@gmail.com', '+254 700 000 006', 'https://wa.me/254700000006', NULL, NULL, NULL, NULL, 'planning', 'pending', 15000, 'Portfolio site with booking', 'discovery', 'Lead from Instagram. Very early stage.', '2026-06-27T00:00:00Z');

-- LINKS
INSERT INTO links (id, user_id, client_name, live_url, supabase_project, vercel_dashboard, github_repo, notes, category, favourite, tags, created_at) VALUES
  ('b0000001-0000-0000-0000-000000000001', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'Zuri Fashion', 'https://zurifashion.vercel.app', 'zuri-fashion-db', 'https://vercel.com/lewis/zuri-fashion', 'https://github.com/lewis/zuri-fashion', 'Mini-catalogue phase 2', 'client-sites', true, '["ecommerce","react"]', '2026-03-15T00:00:00Z'),
  ('b0000002-0000-0000-0000-000000000002', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'PowerSec Solutions', 'https://powersec.vercel.app', 'powersec-db', 'https://vercel.com/lewis/powersec', 'https://github.com/lewis/powersec', 'Under development', 'client-sites', false, '["nextjs","portal"]', '2026-05-01T00:00:00Z'),
  ('b0000003-0000-0000-0000-000000000003', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'Mini Electricals', 'https://minielectricals.vercel.app', 'minielec-db', 'https://vercel.com/lewis/mini-electricals', 'https://github.com/lewis/mini-electricals', '', 'client-sites', false, '["catalogue"]', '2026-04-01T00:00:00Z'),
  ('b0000004-0000-0000-0000-000000000004', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'Keel', 'https://keel.nu', 'keel-prod', 'https://vercel.com/lewis/keel', 'https://github.com/lewis/keel', 'Dashboard app — own product', 'products', true, '["saas","dashboard"]', '2026-01-01T00:00:00Z'),
  ('b0000005-0000-0000-0000-000000000005', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'Ancy Luxe', 'https://ancyluxe.vercel.app', 'ancyluxe-db', 'https://vercel.com/lewis/ancy-luxe', 'https://github.com/lewis/ancy-luxe', 'Wig catalogue', 'client-sites', false, '["ecommerce"]', '2026-04-01T00:00:00Z'),
  ('b0000006-0000-0000-0000-000000000006', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'FrameStudio', 'https://framestudio.vercel.app', 'framestudio-db', 'https://vercel.com/lewis/framestudio', 'https://github.com/lewis/framestudio', 'Company website', 'internal', true, '["marketing"]', '2026-01-15T00:00:00Z'),
  ('b0000007-0000-0000-0000-000000000007', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'FrameStudio Dashboard', NULL, 'framestudio-db', 'https://vercel.com/lewis/framestudio-dashboard', 'https://github.com/lewis/framestudio-dashboard', 'Admin panel (this app)', 'internal', true, '["react","admin"]', '2026-02-01T00:00:00Z');

-- INCOME
INSERT INTO income (id, user_id, client_name, amount, description, date, payment_method, created_at) VALUES
  ('c0000001-0000-0000-0000-000000000001', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'Ancy Luxe', 45000, 'Full payment — catalogue website', '2026-06-15', 'M-Pesa', '2026-06-15T00:00:00Z'),
  ('c0000002-0000-0000-0000-000000000002', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'Zuri Fashion', 20000, 'Partial payment — phase 1', '2026-06-10', 'Bank', '2026-06-10T00:00:00Z'),
  ('c0000003-0000-0000-0000-000000000003', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'Mini Electricals', 12000, 'Monthly retainer — June', '2026-06-01', 'M-Pesa', '2026-06-01T00:00:00Z'),
  ('c0000004-0000-0000-0000-000000000004', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'Zuri Fashion', 15000, 'Partial payment — phase 2', '2026-05-20', 'Cash', '2026-05-20T00:00:00Z'),
  ('c0000005-0000-0000-0000-000000000005', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'Keel', 8000, 'Subscription revenue — May', '2026-05-01', 'Bank', '2026-05-01T00:00:00Z'),
  ('c0000006-0000-0000-0000-000000000006', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'Ancy Luxe', 10000, 'Deposit — initial build', '2026-04-28', 'M-Pesa', '2026-04-28T00:00:00Z'),
  ('c0000007-0000-0000-0000-000000000007', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'Mini Electricals', 12000, 'Monthly retainer — May', '2026-05-01', 'M-Pesa', '2026-05-01T00:00:00Z'),
  ('c0000008-0000-0000-0000-000000000008', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'Mini Electricals', 12000, 'Monthly retainer — April', '2026-04-01', 'Bank', '2026-04-01T00:00:00Z');

-- EXPENSES
INSERT INTO expenses (id, user_id, description, amount, category, date, payment_method, created_at) VALUES
  ('d0000001-0000-0000-0000-000000000001', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'Vercel Pro subscription', 2200, 'Hosting', '2026-06-05', 'Bank', '2026-06-05T00:00:00Z'),
  ('d0000002-0000-0000-0000-000000000002', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'Supabase Pro plan', 2500, 'Hosting', '2026-06-03', 'Bank', '2026-06-03T00:00:00Z'),
  ('d0000003-0000-0000-0000-000000000003', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'Domain renewals (4 domains)', 4800, 'Domains', '2026-05-28', 'M-Pesa', '2026-05-28T00:00:00Z'),
  ('d0000004-0000-0000-0000-000000000004', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'Internet bundle', 3000, 'Utilities', '2026-05-15', 'M-Pesa', '2026-05-15T00:00:00Z'),
  ('d0000005-0000-0000-0000-000000000005', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'Canva Pro', 1800, 'Software', '2026-05-10', 'Bank', '2026-05-10T00:00:00Z'),
  ('d0000006-0000-0000-0000-000000000006', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'Freelancer payment — UI assets', 5000, 'Contractors', '2026-04-20', 'M-Pesa', '2026-04-20T00:00:00Z');

-- INVOICES
INSERT INTO invoices (id, user_id, client_name, amount, status, issued, due, paid_at, description, created_at) VALUES
  ('e0000001-0000-0000-0000-000000000001', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'Ancy Luxe', 45000, 'paid', '2026-06-01', '2026-06-30', '2026-06-15', 'Catalogue website — full payment', '2026-06-01T00:00:00Z'),
  ('e0000002-0000-0000-0000-000000000002', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'Zuri Fashion', 35000, 'partial', '2026-05-01', '2026-06-01', NULL, 'E-commerce site — balance of 15000', '2026-05-01T00:00:00Z'),
  ('e0000003-0000-0000-0000-000000000003', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'PowerSec Solutions', 65000, 'sent', '2026-06-01', '2026-07-01', NULL, 'Business website + portal', '2026-06-01T00:00:00Z'),
  ('e0000004-0000-0000-0000-000000000004', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'Mini Electricals', 12000, 'paid', '2026-06-01', '2026-06-15', '2026-06-01', 'Monthly retainer — June', '2026-06-01T00:00:00Z'),
  ('e0000005-0000-0000-0000-000000000005', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'Campus Glow', 14000, 'draft', NULL, NULL, NULL, '50% deposit — online store', '2026-06-20T00:00:00Z');

-- FOCUS ITEMS
INSERT INTO focus_items (id, user_id, content, project, completed, priority, due_date, status, sort_order, created_at) VALUES
  ('f0000001-0000-0000-0000-000000000001', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'Finish Keel inventory page', 'Keel', false, 'high', '2026-07-02', 'in_progress', 0, '2026-06-28T00:00:00Z'),
  ('f0000002-0000-0000-0000-000000000002', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'Follow up with Ancy Luxe', 'Ancy Luxe', false, 'medium', '2026-06-30', 'todo', 1, '2026-06-28T00:00:00Z'),
  ('f0000003-0000-0000-0000-000000000003', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'Post TikTok', NULL, false, 'low', NULL, 'todo', 2, '2026-06-27T00:00:00Z'),
  ('f0000004-0000-0000-0000-000000000004', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'Push PowerSec deployment', 'PowerSec Solutions', true, 'high', '2026-06-25', 'done', 3, '2026-06-20T00:00:00Z'),
  ('f0000005-0000-0000-0000-000000000005', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'Send invoice to Zuri Fashion', 'Zuri Fashion', true, 'medium', '2026-06-20', 'done', 4, '2026-06-18T00:00:00Z'),
  ('f0000006-0000-0000-0000-000000000006', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'Design Campus Glow homepage', 'Campus Glow', false, 'medium', '2026-07-05', 'in_progress', 5, '2026-06-25T00:00:00Z'),
  ('f0000007-0000-0000-0000-000000000007', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'Review Keel subscription analytics', 'Keel', false, 'low', NULL, 'todo', 6, '2026-06-26T00:00:00Z'),
  ('f0000008-0000-0000-0000-000000000008', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'Call Lumière Hair lead', 'Lumière Hair', false, 'high', '2026-06-29', 'todo', 7, '2026-06-27T00:00:00Z');

-- KEEL SHOPS
INSERT INTO keel_shops (id, name, status, plan, revenue, owner, created_at) VALUES
  ('aa000001-0000-0000-0000-000000000001', 'Zuri Fashion', 'active', 'standard', 5000, '', '2026-03-15T00:00:00Z'),
  ('aa000002-0000-0000-0000-000000000002', 'Mini Electricals', 'active', 'standard', 5000, '', '2026-04-01T00:00:00Z'),
  ('aa000003-0000-0000-0000-000000000003', 'Ancy Luxe', 'active', 'premium', 8000, '', '2026-04-01T00:00:00Z'),
  ('aa000004-0000-0000-0000-000000000004', 'Campus Glow', 'active', 'standard', 5000, '', '2026-06-01T00:00:00Z'),
  ('aa000005-0000-0000-0000-000000000005', 'Lumière Hair', 'active', 'starter', 1000, '', '2026-06-27T00:00:00Z'),
  ('aa000006-0000-0000-0000-000000000006', 'TechHive KE', 'active', 'standard', 5000, '', '2026-05-01T00:00:00Z'),
  ('aa000007-0000-0000-0000-000000000007', 'Fresh Mart', 'active', 'starter', 1000, '', '2026-06-20T00:00:00Z'),
  ('aa000008-0000-0000-0000-000000000008', 'Urban Styles', 'pending', 'standard', 0, 'James K.', '2026-06-25T00:00:00Z'),
  ('aa000009-0000-0000-0000-000000000009', 'Gadget Hub', 'pending', 'starter', 0, 'Faith W.', '2026-06-28T00:00:00Z');

-- KEEL APPROVALS
INSERT INTO keel_approvals (id, shop_name, owner, plan, status, submitted_at, created_at) VALUES
  ('ab000001-0000-0000-0000-000000000001', 'Urban Styles', 'James K.', 'standard', 'pending', '2026-06-25T14:20:00Z', '2026-06-25T14:20:00Z'),
  ('ab000002-0000-0000-0000-000000000002', 'Gadget Hub', 'Faith W.', 'starter', 'pending', '2026-06-28T08:15:00Z', '2026-06-28T08:15:00Z'),
  ('ab000003-0000-0000-0000-000000000003', 'Fresh Mart', 'Peter N.', 'starter', 'approved', '2026-06-20T14:00:00Z', '2026-06-20T14:00:00Z');

-- KEEL ACTIVITY LOG
INSERT INTO keel_activity_log (id, action, shop, detail, timestamp) VALUES
  ('ac000001-0000-0000-0000-000000000001', 'new_shop', 'Gadget Hub', 'Registered for Starter plan', '2026-06-28T08:15:00Z'),
  ('ac000002-0000-0000-0000-000000000002', 'payment', 'Fresh Mart', 'M-Pesa payment of KES 1,000 received', '2026-06-27T16:45:00Z'),
  ('ac000003-0000-0000-0000-000000000003', 'approval', 'Fresh Mart', 'Shop approved by admin', '2026-06-27T16:30:00Z'),
  ('ac000004-0000-0000-0000-000000000004', 'flag', 'Ancy Luxe', 'Payment verification required — transaction mismatch', '2026-06-26T09:00:00Z'),
  ('ac000005-0000-0000-0000-000000000005', 'new_shop', 'Urban Styles', 'Registered for Standard plan', '2026-06-25T14:20:00Z'),
  ('ac000006-0000-0000-0000-000000000006', 'subscription', 'TechHive KE', 'Auto-renewed Standard plan', '2026-06-24T00:00:00Z');

-- NOTIFICATIONS
INSERT INTO notifications (id, user_id, type, message, link, read, created_at) VALUES
  ('ad000001-0000-0000-0000-000000000001', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'overdue_invoice', 'Zuri Fashion invoice (KES 15,000) overdue', '/finances', false, '2026-06-29T00:00:00Z'),
  ('ad000002-0000-0000-0000-000000000002', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'pending_approval', '2 Keel shops pending approval', '/keel', false, '2026-06-28T08:15:00Z'),
  ('ad000003-0000-0000-0000-000000000003', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'task_due', 'Call Lumière Hair lead — due today', '/focus', false, '2026-06-29T06:00:00Z'),
  ('ad000004-0000-0000-0000-000000000004', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'task_due', 'Follow up with Ancy Luxe — due tomorrow', '/focus', true, '2026-06-28T06:00:00Z'),
  ('ad000005-0000-0000-0000-000000000005', '3c758dfd-8bb0-4654-8d30-3ca8225a0381', 'overdue_invoice', 'PowerSec Solutions invoice (KES 65,000) due in 2 days', '/finances', true, '2026-06-28T00:00:00Z');
