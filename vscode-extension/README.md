# AutoDBA: PostgreSQL Insights (Alpha)

AI-powered insights for faster, leaner PostgreSQL databases — right inside VS Code.

## 🧠 What It Does

AutoDBA helps developers and DBAs find and fix common PostgreSQL performance issues — fast. It surfaces unused indexes, misconfigurations, and silent slowdowns directly in your editor.

> ⚠️ This is an early preview release — currently focused on PostgreSQL setup and indexing insights.  
> ✅ No telemetry. No cloud connection. 100% local.

## 🚀 How to Use It

1. Open VS Code.
2. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows).
3. Select: `AutoDBA: PostgreSQL Insights`.
4. Connect to your Postgres database.
5. Click **“Insights”** and review recommendations.
6. Optionally run `checks:list` to view available checks and specify which ones
   to execute with `insights:list`.

## ✅ Current Features

- 🔍 **Unused Index Detection** — find redundant or unutilized indexes.
- ⚙️ **Configuration Checker** — flag suboptimal memory and planner settings.
- 🛑 **Extension Validator** — detect missing tools like `pg_stat_statements`.

## 🛣️ Coming Soon

- ✨ **EXPLAIN/BUFFERS Query Analysis**  
  Automatically interpret `EXPLAIN (ANALYZE, BUFFERS)` plans and highlight inefficiencies like sequential scans, nested loops, or excessive I/O.

- 🤖 **AI-Powered Query Rewrites**  
  Use LLMs to suggest query optimizations: flatten subqueries, reorder joins, remove `SELECT *`, and push filters closer to source data.

- 📊 **Table Size & Bloat Detection**  
  Surface bloated tables, oversized indexes, and cold data with suggestions for partitioning, archiving, or compression.

- 🧪 **Schema Smell Detection**  
  Identify schema anti-patterns:
  - Inconsistent types
  - Unused foreign keys
  - Over-indexed tables
  - Naming conventions and nullable misuse
  - Misuse of Data Warehousing best practicies

- 📨 **Export/Share Reports + Email Alerts**  
  Export optimization reports as Markdown/HTML. Optionally send via email or webhook (opt-in only).

- 📅 **Scheduled Analysis**  
  Run performance audits on a schedule and receive insights over time (e.g., growing table size, degrading config).

- 🔁 **Insight History & Diffing**  
  Track changes to insights across runs. Identify regressions or improvements over time.

- 🛠️ **PostgreSQL Linting in CI/CD**  
  Integrate AutoDBA into pipelines to block schema merges with critical smells or costly defaults.

- 🗂 **Multi-Connection & Workspace Support**  
  Switch between environments (dev, staging, prod) with persistent profiles and per-project settings.

- 🌐 **Expanded Database Support**  
  Add insights for additional systems:
  - ✅ PostgreSQL (now)
  - 🛠️ MySQL
  - 🛠️ SQLite (for dev/test)
  - 🛠️ dbt Core (YAML + model linting)
  - 🛠️ Snowflake (warehouse efficiency)

- 📈 **Performance Visualizations**  
  Inline charts for bloat growth, query latency, and index usage patterns — all local and exportable.

- 🧰 **Inline Fix Suggestions + Commands**  
  Generate `CREATE INDEX`, `DROP INDEX`, or `ALTER TABLE` scripts with confidence scores and EXPLAIN previews.

- 🔒 **Audit & Compliance Checks**  
  Highlight missing constraints, permissive roles, or poorly documented tables that violate best practices.

- 🧩 **Plugin Framework**  
  Allow advanced users to write custom optimization checks or rules using config or scripting.

- ⚗️ **Experimental Feature Flags**  
  Try bleeding-edge capabilities like AI schema summarization, vector index checks, or usage pattern detection.

- 🧪 **Interactive Refactor UI (optional)**  
  Drag-and-drop schema builder with guided suggestions for denormalization, column pruning, or restructuring.

## 🔒 Security & Privacy

- All processing happens locally on your machine.
- Database credentials and data never leave your device.
- No external API calls. No telemetry. Ever.

## 🗣 Feedback & Support

We’re building this in public — come help shape it!

- 💬 [Join the Discord](https://discord.gg/wbB8Pdb3nm)

## ✍️ Notes

- Currently supports **PostgreSQL only**
- This is an **alpha release** — expect bugs and limitations
- Designed to be fast, helpful, and transparent
