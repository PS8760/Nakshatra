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
