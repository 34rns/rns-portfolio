# Licensing decisions

Resolved project: D:/CustomCodex/rns-portfolio. See PROGRESS.md for execution rulings and ../superpowers/specs/2026-11-14-license-admin-design.md for full rules.

Prefer Cloudflare Workers Free for bandwidth/request headroom after measured OpenNext size/crypto compatibility. Preserve Neon and all legacy data. Never weaken crypto to fit a free quota. No paid upgrade. Local real PostgreSQL testing is independent of production.

Keep device activation separate from redemption count; sign app and environment into v1 tokens. New access entitlements are additive to legacy license keys. Backend feature enforcement is the premium-security boundary; client UI locks alone do not protect shipped code.
