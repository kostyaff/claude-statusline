#!/usr/bin/env node
// Claude Code statusline. Reads session JSON from stdin, prints one line.
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

let raw = "";
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  let d = {};
  try { d = JSON.parse(raw); } catch (e) {}

  const C = {
    reset: "\x1b[0m", gray: "\x1b[90m", cyan: "\x1b[36m",
    green: "\x1b[32m", yellow: "\x1b[33m", red: "\x1b[31m",
    blue: "\x1b[34m", magenta: "\x1b[35m",
  };

  // --- directory + git branch ---
  const cwd = (d.workspace && d.workspace.current_dir) || d.cwd || "";
  const dirName = cwd ? path.basename(cwd) : "?";
  let branch = "";
  try {
    branch = execSync("git rev-parse --abbrev-ref HEAD", {
      cwd, stdio: ["ignore", "pipe", "ignore"],
    }).toString().trim();
  } catch (e) {}
  const dirSeg = `${C.cyan}${dirName}${C.reset}` +
    (branch ? `${C.gray}:${C.magenta}${branch}${C.reset}` : "");

  // --- model (+ 1M context marker) ---
  const cw = d.context_window || {};
  const winSize = cw.context_window_size || 200000;
  const modelName = (d.model && d.model.display_name) || "?";
  const modelSeg = `${C.blue}${modelName}${C.reset}` +
    (winSize >= 1000000 ? `${C.gray} (1M context)${C.reset}` : "");

  // --- context usage ---
  const used = cw.total_input_tokens || 0;
  const fmt = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(n >= 10000000 ? 0 : 1).replace(/\.0$/, "") + "M";
    if (n >= 1000) return Math.round(n / 1000) + "k";
    return String(n);
  };
  const pct = cw.used_percentage || 0;
  const ctxColor = pct > 80 ? C.red : pct > 50 ? C.yellow : C.green;
  const ctxSeg = `${ctxColor}${fmt(used)}/${fmt(winSize)}${C.reset}`;

  // --- rate limits ---
  let limitSeg = "";
  const rl = d.rate_limits;
  if (rl) {
    const now = Date.now() / 1000;
    const dur = (ts) => {
      if (!ts || ts <= now) return "";
      let s = Math.floor(ts - now);
      const dy = Math.floor(s / 86400);
      const h = Math.floor((s % 86400) / 3600);
      const m = Math.floor((s % 3600) / 60);
      if (dy > 0) return `${dy}d${h}h`;
      return h > 0 ? `${h}h${String(m).padStart(2, "0")}m` : `${m}m`;
    };
    const lc = (p) => (p > 80 ? C.red : p > 50 ? C.yellow : C.green);
    const segs = [];
    if (rl.five_hour) {
      const p = rl.five_hour.used_percentage || 0;
      const t = dur(rl.five_hour.resets_at);
      segs.push(`${C.gray}h ${lc(p)}${p}%${C.reset}` + (t ? ` ${C.gray}${t}${C.reset}` : ""));
    }
    if (rl.seven_day) {
      const p = rl.seven_day.used_percentage || 0;
      const t = dur(rl.seven_day.resets_at);
      segs.push(`${C.gray}W ${lc(p)}${p}%${C.reset}` + (t ? ` ${C.gray}${t}${C.reset}` : ""));
    }
    if (segs.length) limitSeg = `${C.gray}[ ${C.reset}${segs.join(`${C.gray} | ${C.reset}`)}${C.gray} ]${C.reset}`;
  }

  // --- cost ---
  const cost = (d.cost && d.cost.total_cost_usd) || 0;
  const costSeg = `${C.green}$${cost.toFixed(2)}${C.reset}`;

  // --- assemble ---
  const dot = `${C.gray} • ${C.reset}`;
  const parts = [dirSeg, modelSeg, ctxSeg];
  if (limitSeg) parts.push(limitSeg);
  parts.push(costSeg);
  process.stdout.write(parts.join(dot));
});
