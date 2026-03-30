/**
 * CogniscanAI — Cognitive Report PDF Generator
 * Uses jsPDF for pure client-side generation.
 */
export async function exportReportPdf(
  result: {
    finalScore: number;
    riskLevel: string;
    explanation: string;
    recommendations: string[];
    aiInsight?: string;
    rawScores?: { memory: number; reaction: number; pattern: number; speech: number; facial?: number };
  },
  userName: string
) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const W = 210;
  const H = 297;
  const PAD = 14;

  // ── Palette ──────────────────────────────────────────────────────────────
  const C = {
    dark:    [2, 24, 43]       as [number, number, number],
    panel:   [3, 30, 53]       as [number, number, number],
    panel2:  [4, 36, 62]       as [number, number, number],
    accent:  [9, 255, 211]     as [number, number, number],
    white:   [255, 255, 255]   as [number, number, number],
    gray:    [140, 155, 170]   as [number, number, number],
    dimgray: [80, 95, 110]     as [number, number, number],
  };

  const riskPalette: Record<string, [number, number, number]> = {
    Low:    [9, 255, 211],
    Medium: [245, 158, 11],
    High:   [239, 68, 68],
  };
  const RC = riskPalette[result.riskLevel] ?? C.accent;

  // ── Helpers ───────────────────────────────────────────────────────────────
  const fill  = (r: [number,number,number]) => doc.setFillColor(...r);
  const text  = (r: [number,number,number]) => doc.setTextColor(...r);
  const draw  = (r: [number,number,number]) => doc.setDrawColor(...r);

  function card(x: number, y: number, w: number, h: number, color = C.panel) {
    fill(color);
    doc.roundedRect(x, y, w, h, 3, 3, "F");
  }

  function label(str: string, x: number, y: number) {
    text(C.dimgray);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.text(str.toUpperCase(), x, y);
  }

  function wrappedText(str: string, x: number, y: number, maxW: number, lineH: number, maxLines = 99): number {
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(str, maxW) as string[];
    const visible = lines.slice(0, maxLines);
    doc.text(visible, x, y);
    return y + visible.length * lineH;
  }

  // ── PAGE BACKGROUND ───────────────────────────────────────────────────────
  fill(C.dark);
  doc.rect(0, 0, W, H, "F");

  // ── HEADER ────────────────────────────────────────────────────────────────
  fill(C.panel);
  doc.rect(0, 0, W, 44, "F");

  // Accent top stripe
  fill(C.accent);
  doc.rect(0, 0, W, 1.8, "F");

  // Logo
  text(C.accent);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("CogniscanAI", PAD, 17);

  text(C.gray);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Cognitive Health Report", PAD, 24);
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`,
    PAD, 30
  );

  // Patient info (right side)
  text(C.white);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(userName, W - PAD, 17, { align: "right" });

  text(C.gray);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text("Patient", W - PAD, 23, { align: "right" });

  // Risk badge in header
  const badgeLabel = `${result.riskLevel} Risk`;
  const badgeW = 32;
  fill([RC[0] * 0.12, RC[1] * 0.12, RC[2] * 0.12] as unknown as [number,number,number]);
  doc.roundedRect(W - PAD - badgeW, 28, badgeW, 9, 2, 2, "F");
  text(RC);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text(badgeLabel, W - PAD - badgeW / 2, 33.5, { align: "center" });

  // ── SCORE SECTION ─────────────────────────────────────────────────────────
  let y = 52;

  // Score circle
  const cx = W / 2;
  const cy = y + 22;
  const r  = 20;

  fill(C.panel);
  doc.circle(cx, cy, r + 3, "F");

  draw(RC);
  doc.setLineWidth(2.5);
  doc.circle(cx, cy, r, "S");

  text(RC);
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.text(String(result.finalScore), cx, cy + 5, { align: "center" });

  text(C.gray);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("/ 100", cx, cy + 12, { align: "center" });

  y += 52;

  // ── DOMAIN BREAKDOWN ──────────────────────────────────────────────────────
  if (result.rawScores) {
    const domains = [
      { label: "Memory",   score: result.rawScores.memory,          color: C.accent },
      { label: "Reaction", score: result.rawScores.reaction,        color: [99, 102, 241]  as [number,number,number] },
      { label: "Pattern",  score: result.rawScores.pattern,         color: [245, 158, 11]  as [number,number,number] },
      { label: "Speech",   score: result.rawScores.speech,          color: [236, 72, 153]  as [number,number,number] },
      { label: "Facial",   score: result.rawScores.facial ?? 70,    color: [167, 139, 250] as [number,number,number] },
    ];

    const cardH = 46;
    card(PAD, y, W - PAD * 2, cardH);

    label("Domain Breakdown", PAD + 4, y + 8);

    const colW = (W - PAD * 2 - 8) / domains.length;
    const barMaxW = colW - 6;
    const barY = y + 14;
    const barH = 3.5;

    domains.forEach((d, i) => {
      const bx = PAD + 4 + i * colW;

      // Domain label
      text(C.gray);
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      doc.text(d.label, bx, barY);

      // Background track
      fill(C.panel2);
      doc.roundedRect(bx, barY + 2.5, barMaxW, barH, 1, 1, "F");

      // Score fill
      fill(d.color);
      const fillW = Math.max((barMaxW * d.score) / 100, 1);
      doc.roundedRect(bx, barY + 2.5, fillW, barH, 1, 1, "F");

      // Score number
      text(d.color);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(String(d.score), bx, barY + 16);

      // /100
      text(C.dimgray);
      doc.setFontSize(6);
      doc.setFont("helvetica", "normal");
      doc.text("/100", bx + 8, barY + 16);
    });

    y += cardH + 6;
  }

  // ── AI INSIGHT ────────────────────────────────────────────────────────────
  if (result.aiInsight) {
    const insightLines = doc.splitTextToSize(result.aiInsight, W - PAD * 2 - 16) as string[];
    const insightH = Math.max(24, insightLines.length * 4.5 + 16);
    card(PAD, y, W - PAD * 2, insightH, C.panel);

    // Accent left bar
    fill(C.accent);
    doc.roundedRect(PAD, y, 2.5, insightH, 1, 1, "F");

    label("AI Insight", PAD + 8, y + 8);

    text(C.white);
    doc.setFontSize(8);
    wrappedText(result.aiInsight, PAD + 8, y + 14, W - PAD * 2 - 16, 4.5);

    y += insightH + 6;
  }

  // ── ANALYSIS ──────────────────────────────────────────────────────────────
  const analysisLines = doc.splitTextToSize(result.explanation, W - PAD * 2 - 16) as string[];
  const analysisH = Math.max(24, analysisLines.length * 4.5 + 16);
  card(PAD, y, W - PAD * 2, analysisH, C.panel);

  label("Analysis", PAD + 4, y + 8);

  text(C.white);
  doc.setFontSize(8);
  wrappedText(result.explanation, PAD + 4, y + 14, W - PAD * 2 - 12, 4.5);

  y += analysisH + 6;

  // ── RECOMMENDATIONS ───────────────────────────────────────────────────────
  const recs = result.recommendations.slice(0, 6);
  const recLineH = 4.5;

  // Pre-calculate total height
  let totalRecH = 14;
  recs.forEach((rec) => {
    const lines = doc.splitTextToSize(rec, W - PAD * 2 - 22) as string[];
    totalRecH += lines.length * recLineH + 3;
  });
  totalRecH = Math.max(totalRecH, 30);

  // Page break if needed
  if (y + totalRecH > H - 22) {
    doc.addPage();
    fill(C.dark);
    doc.rect(0, 0, W, H, "F");
    y = 16;
  }

  card(PAD, y, W - PAD * 2, totalRecH, C.panel);
  label("Recommendations", PAD + 4, y + 8);

  let ry = y + 14;
  recs.forEach((rec) => {
    // Bullet dot
    fill(C.accent);
    doc.circle(PAD + 8, ry - 1, 1.2, "F");

    text(C.white);
    doc.setFontSize(8);
    const lines = doc.splitTextToSize(rec, W - PAD * 2 - 22) as string[];
    doc.text(lines, PAD + 12, ry);
    ry += lines.length * recLineH + 3;
  });

  y += totalRecH + 6;

  // ── DISCLAIMER ────────────────────────────────────────────────────────────
  if (y + 14 < H - 22) {
    fill([3, 20, 36] as unknown as [number,number,number]);
    doc.roundedRect(PAD, y, W - PAD * 2, 12, 2, 2, "F");
    text(C.dimgray);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.text(
      "⚠  This report is a screening tool only and does not constitute a medical diagnosis. Consult a qualified healthcare professional.",
      W / 2, y + 7.5,
      { align: "center", maxWidth: W - PAD * 2 - 8 }
    );
  }

  // ── FOOTER ────────────────────────────────────────────────────────────────
  fill(C.panel);
  doc.rect(0, H - 14, W, 14, "F");

  fill(C.accent);
  doc.rect(0, H - 14, W, 1, "F");

  text(C.dimgray);
  doc.setFontSize(6.5);
  doc.text("CogniscanAI — Early Detection. Better Prevention.", W / 2, H - 7, { align: "center" });
  doc.text(`nakshatra.vercel.app`, W / 2, H - 3, { align: "center" });

  // ── SAVE ──────────────────────────────────────────────────────────────────
  const filename = `CogniscanAI_Report_${userName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
}

// ─────────────────────────────────────────────────────────────────────────────
// OVERALL REPORT — multi-test cumulative PDF
// ─────────────────────────────────────────────────────────────────────────────

export interface HistoryEntry {
  date: string;
  finalScore: number;
  riskLevel: string;
  rawScores?: { memory: number; reaction: number; pattern: number; speech: number; facial?: number };
  aiInsight?: string;
}

export async function exportOverallReportPdf(entries: HistoryEntry[], userName: string) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const W = 210;
  const H = 297;
  const PAD = 14;

  const C = {
    dark:    [2, 24, 43]     as [number, number, number],
    panel:   [3, 30, 53]     as [number, number, number],
    panel2:  [4, 36, 62]     as [number, number, number],
    accent:  [9, 255, 211]   as [number, number, number],
    white:   [255, 255, 255] as [number, number, number],
    gray:    [140, 155, 170] as [number, number, number],
    dimgray: [80, 95, 110]   as [number, number, number],
  };

  const riskPalette: Record<string, [number, number, number]> = {
    Low: [9, 255, 211], Medium: [245, 158, 11], High: [239, 68, 68],
  };
  const DOMAIN_COLORS: Record<string, [number, number, number]> = {
    memory:   [9, 255, 211],
    reaction: [99, 102, 241],
    pattern:  [245, 158, 11],
    speech:   [236, 72, 153],
    facial:   [167, 139, 250],
  };

  const fill = (r: [number, number, number]) => doc.setFillColor(...r);
  const text = (r: [number, number, number]) => doc.setTextColor(...r);
  const draw = (r: [number, number, number]) => doc.setDrawColor(...r);

  function card(x: number, y: number, w: number, h: number, color = C.panel) {
    fill(color); doc.roundedRect(x, y, w, h, 3, 3, "F");
  }
  function sectionLabel(str: string, x: number, y: number) {
    text(C.dimgray); doc.setFontSize(6.5); doc.setFont("helvetica", "normal");
    doc.text(str.toUpperCase(), x, y);
  }

  // ── Compute stats ──────────────────────────────────────────────────────────
  const sorted = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const latest = entries[0];
  const avgScore = Math.round(entries.reduce((s, e) => s + e.finalScore, 0) / entries.length);
  const highRisk = entries.filter((e) => e.riskLevel === "High").length;
  const trend = entries.length >= 2 ? entries[0].finalScore - entries[entries.length - 1].finalScore : 0;

  const domainKeys = ["memory", "reaction", "pattern", "speech", "facial"] as const;
  const domainAvg: Record<string, number | null> = {};
  domainKeys.forEach((d) => {
    const vals = entries.map((e) => e.rawScores?.[d]).filter((v): v is number => v !== undefined);
    domainAvg[d] = vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : null;
  });

  // ── PAGE 1 ─────────────────────────────────────────────────────────────────

  // Background
  fill(C.dark); doc.rect(0, 0, W, H, "F");

  // Header
  fill(C.panel); doc.rect(0, 0, W, 44, "F");
  fill(C.accent); doc.rect(0, 0, W, 1.8, "F");

  text(C.accent); doc.setFontSize(18); doc.setFont("helvetica", "bold");
  doc.text("CogniscanAI", PAD, 17);
  text(C.gray); doc.setFontSize(8); doc.setFont("helvetica", "normal");
  doc.text("Cumulative Cognitive Health Report", PAD, 24);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`, PAD, 30);
  doc.text(`Period: ${new Date(sorted[0].date).toLocaleDateString("en-IN")} — ${new Date(sorted[sorted.length - 1].date).toLocaleDateString("en-IN")}`, PAD, 36);

  text(C.white); doc.setFontSize(11); doc.setFont("helvetica", "bold");
  doc.text(userName, W - PAD, 17, { align: "right" });
  text(C.gray); doc.setFontSize(7.5); doc.setFont("helvetica", "normal");
  doc.text(`${entries.length} tests`, W - PAD, 23, { align: "right" });

  // Risk badge
  const RC = riskPalette[latest.riskLevel] ?? C.accent;
  fill([RC[0] * 0.12, RC[1] * 0.12, RC[2] * 0.12] as unknown as [number, number, number]);
  doc.roundedRect(W - PAD - 34, 28, 34, 9, 2, 2, "F");
  text(RC); doc.setFontSize(7); doc.setFont("helvetica", "bold");
  doc.text(`${latest.riskLevel} Risk (Latest)`, W - PAD - 17, 33.5, { align: "center" });

  // ── Summary stat cards ─────────────────────────────────────────────────────
  let y = 52;
  const statW = (W - PAD * 2 - 9) / 4;
  const stats = [
    { label: "Latest Score", value: String(latest.finalScore), color: riskPalette[latest.riskLevel] ?? C.accent },
    { label: "Average Score", value: String(avgScore), color: C.accent },
    { label: "Total Tests", value: String(entries.length), color: [99, 102, 241] as [number, number, number] },
    { label: "High Risk", value: String(highRisk), color: highRisk > 0 ? [239, 68, 68] as [number, number, number] : C.gray },
  ];
  stats.forEach((s, i) => {
    const sx = PAD + i * (statW + 3);
    card(sx, y, statW, 22);
    text(s.color); doc.setFontSize(14); doc.setFont("helvetica", "bold");
    doc.text(s.value, sx + statW / 2, y + 12, { align: "center" });
    text(C.dimgray); doc.setFontSize(6); doc.setFont("helvetica", "normal");
    doc.text(s.label, sx + statW / 2, y + 18, { align: "center" });
  });
  y += 28;

  // Trend indicator
  card(PAD, y, W - PAD * 2, 12);
  const trendColor = trend > 0 ? C.accent : trend < 0 ? [239, 68, 68] as [number, number, number] : C.gray;
  text(trendColor); doc.setFontSize(8); doc.setFont("helvetica", "bold");
  const trendStr = trend > 0 ? `▲ +${trend} improvement` : trend < 0 ? `▼ ${trend} decline` : "→ Stable";
  doc.text(`Trend: ${trendStr} (first vs latest test)`, PAD + 4, y + 7.5);
  y += 18;

  // ── Score timeline (mini chart) ────────────────────────────────────────────
  const chartH = 36;
  card(PAD, y, W - PAD * 2, chartH + 14);
  sectionLabel("Score Timeline", PAD + 4, y + 8);

  const chartX = PAD + 4;
  const chartY = y + 12;
  const chartW = W - PAD * 2 - 8;

  // Grid lines
  [25, 50, 75].forEach((pct) => {
    const gy = chartY + chartH - (pct / 100) * chartH;
    fill(C.panel2); doc.setLineWidth(0.2); draw(C.panel2);
    doc.line(chartX, gy, chartX + chartW, gy);
    text(C.dimgray); doc.setFontSize(5);
    doc.text(String(pct), chartX - 2, gy + 1, { align: "right" });
  });

  // Plot line
  if (sorted.length >= 2) {
    const pts = sorted.map((e, i) => ({
      x: chartX + (i / (sorted.length - 1)) * chartW,
      y: chartY + chartH - (e.finalScore / 100) * chartH,
    }));
    doc.setLineWidth(1.2); draw(C.accent);
    for (let i = 1; i < pts.length; i++) {
      doc.line(pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y);
    }
    pts.forEach((p, i) => {
      const rc = riskPalette[sorted[i].riskLevel] ?? C.accent;
      fill(rc); doc.circle(p.x, p.y, 1.5, "F");
    });
  }

  // Date labels
  text(C.dimgray); doc.setFontSize(5.5);
  doc.text(new Date(sorted[0].date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }), chartX, chartY + chartH + 6);
  if (sorted.length > 1) {
    doc.text(
      new Date(sorted[sorted.length - 1].date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      chartX + chartW, chartY + chartH + 6, { align: "right" }
    );
  }
  y += chartH + 22;

  // ── Domain averages ────────────────────────────────────────────────────────
  const domainCardH = 46;
  card(PAD, y, W - PAD * 2, domainCardH);
  sectionLabel("Domain Averages (All Tests)", PAD + 4, y + 8);

  const activeDomains = domainKeys.filter((d) => domainAvg[d] !== null);
  const colW = (W - PAD * 2 - 8) / activeDomains.length;

  activeDomains.forEach((d, i) => {
    const bx = PAD + 4 + i * colW;
    const score = domainAvg[d]!;
    const dc = DOMAIN_COLORS[d];
    const barMaxW = colW - 6;
    const barY = y + 14;

    text(C.gray); doc.setFontSize(6.5); doc.setFont("helvetica", "normal");
    doc.text(d.charAt(0).toUpperCase() + d.slice(1), bx, barY);

    fill(C.panel2); doc.roundedRect(bx, barY + 2.5, barMaxW, 3.5, 1, 1, "F");
    fill(dc); doc.roundedRect(bx, barY + 2.5, Math.max((barMaxW * score) / 100, 1), 3.5, 1, 1, "F");

    text(dc); doc.setFontSize(11); doc.setFont("helvetica", "bold");
    doc.text(String(score), bx, barY + 16);
    text(C.dimgray); doc.setFontSize(6); doc.setFont("helvetica", "normal");
    doc.text("/100", bx + 8, barY + 16);
  });
  y += domainCardH + 6;

  // ── Risk distribution ──────────────────────────────────────────────────────
  const riskCounts = { Low: 0, Medium: 0, High: 0 };
  entries.forEach((e) => { if (e.riskLevel in riskCounts) riskCounts[e.riskLevel as keyof typeof riskCounts]++; });
  const riskCardH = 20;
  card(PAD, y, W - PAD * 2, riskCardH);
  sectionLabel("Risk Distribution", PAD + 4, y + 7);

  const riskW = (W - PAD * 2 - 8) / 3;
  (["Low", "Medium", "High"] as const).forEach((r, i) => {
    const rx = PAD + 4 + i * riskW;
    const rc = riskPalette[r];
    const pct = entries.length ? Math.round((riskCounts[r] / entries.length) * 100) : 0;
    text(rc); doc.setFontSize(10); doc.setFont("helvetica", "bold");
    doc.text(`${riskCounts[r]}`, rx + riskW / 2 - 8, y + 14, { align: "center" });
    text(C.dimgray); doc.setFontSize(6);
    doc.text(`${r} (${pct}%)`, rx + riskW / 2 - 8, y + 18, { align: "center" });
  });
  y += riskCardH + 6;

  // ── PAGE 2: Per-test history ───────────────────────────────────────────────
  doc.addPage();
  fill(C.dark); doc.rect(0, 0, W, H, "F");

  // Page 2 header
  fill(C.panel); doc.rect(0, 0, W, 18, "F");
  fill(C.accent); doc.rect(0, 0, W, 1.2, "F");
  text(C.accent); doc.setFontSize(10); doc.setFont("helvetica", "bold");
  doc.text("CogniscanAI", PAD, 11);
  text(C.gray); doc.setFontSize(7); doc.setFont("helvetica", "normal");
  doc.text("Test History Detail", PAD + 32, 11);
  text(C.dimgray); doc.text(userName, W - PAD, 11, { align: "right" });

  y = 26;
  sectionLabel("Individual Test Results", PAD, y);
  y += 6;

  entries.forEach((e, idx) => {
    const rowH = e.rawScores ? 22 : 16;
    if (y + rowH > H - 18) {
      doc.addPage();
      fill(C.dark); doc.rect(0, 0, W, H, "F");
      fill(C.panel); doc.rect(0, 0, W, 14, "F");
      fill(C.accent); doc.rect(0, 0, W, 1, "F");
      y = 22;
    }

    const eRC = riskPalette[e.riskLevel] ?? C.accent;
    card(PAD, y, W - PAD * 2, rowH);

    // Score badge
    fill(eRC); doc.roundedRect(PAD + 2, y + 2, 12, rowH - 4, 2, 2, "F");
    text(C.dark); doc.setFontSize(9); doc.setFont("helvetica", "bold");
    doc.text(String(e.finalScore), PAD + 8, y + rowH / 2 + 2, { align: "center" });

    // Date + risk
    text(eRC); doc.setFontSize(7.5); doc.setFont("helvetica", "bold");
    doc.text(`${e.riskLevel} Risk`, PAD + 18, y + 7);
    text(C.gray); doc.setFontSize(6.5); doc.setFont("helvetica", "normal");
    doc.text(new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }), PAD + 18, y + 12);

    // Domain mini bars
    if (e.rawScores) {
      const barStartX = PAD + 55;
      const barW = 22;
      const bDomains = ["memory", "reaction", "pattern", "speech"] as const;
      bDomains.forEach((d, di) => {
        const bx = barStartX + di * (barW + 4);
        const score = e.rawScores![d] ?? 0;
        const dc = DOMAIN_COLORS[d];
        text(C.dimgray); doc.setFontSize(5.5);
        doc.text(d.slice(0, 3).toUpperCase(), bx, y + 7);
        fill(C.panel2); doc.roundedRect(bx, y + 8.5, barW, 2.5, 0.5, 0.5, "F");
        fill(dc); doc.roundedRect(bx, y + 8.5, Math.max((barW * score) / 100, 0.5), 2.5, 0.5, 0.5, "F");
        text(dc); doc.setFontSize(6); doc.setFont("helvetica", "bold");
        doc.text(String(score), bx + barW + 1, y + 11);
      });
    }

    // AI insight snippet
    if (e.aiInsight) {
      text(C.dimgray); doc.setFontSize(6); doc.setFont("helvetica", "normal");
      const snippet = e.aiInsight.length > 80 ? e.aiInsight.slice(0, 80) + "..." : e.aiInsight;
      doc.text(snippet, W - PAD - 2, y + 7, { align: "right", maxWidth: 55 });
    }

    // Test number
    text(C.dimgray); doc.setFontSize(5.5);
    doc.text(`#${entries.length - idx}`, W - PAD - 2, y + rowH - 3, { align: "right" });

    y += rowH + 3;
  });

  // ── FOOTER on all pages ────────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    fill(C.panel); doc.rect(0, H - 12, W, 12, "F");
    fill(C.accent); doc.rect(0, H - 12, W, 0.8, "F");
    text(C.dimgray); doc.setFontSize(6);
    doc.text("CogniscanAI — Early Detection. Better Prevention.", W / 2, H - 6, { align: "center" });
    doc.text(`Page ${p} of ${totalPages}`, W - PAD, H - 6, { align: "right" });
  }

  const filename = `CogniscanAI_Overall_Report_${userName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
}
