// Elements
const $ = (id) => document.getElementById(id);
const inputText = $("inputText");
const inputMeta = $("inputMeta");
const simplifyBtn = $("simplifyBtn");
const newNoteBtn = $("newNoteBtn");
const sampleBtn = $("sampleBtn");
const copyBtn = $("copyBtn");
const pdfBtn = $("pdfBtn");
const themeBtn = $("themeBtn");
const outputActions = $("outputActions");
const emptyState = $("emptyState");
const loadingState = $("loadingState");
const simplifiedEl = $("simplifiedText");
const readabilitySection = $("readability");
const toastEl = $("toast");

const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
$("shortcutHint").textContent = isMac ? "⌘ ↵" : "Ctrl ↵";

const SAMPLE_NOTE = `HOSPITAL COURSE: The patient is a 58-year-old male with a past medical history significant for hypertension, type 2 diabetes mellitus, and hyperlipidemia who presented to the emergency department with a three-day history of intermittent substernal chest discomfort radiating to the left upper extremity, accompanied by diaphoresis and exertional dyspnea. Electrocardiographic evaluation demonstrated horizontal ST-segment depression in the anterolateral precordial leads, and serial cardiac troponin measurements were elevated, consistent with non-ST-elevation myocardial infarction. Transthoracic echocardiography revealed a mildly reduced left ventricular ejection fraction with regional hypokinesis of the anterior wall. Subsequent left heart catheterization demonstrated a hemodynamically significant stenosis of the proximal left anterior descending artery, which was managed with percutaneous coronary intervention and placement of a drug-eluting stent.

DISCHARGE PLAN: Continue dual antiplatelet therapy with aspirin and clopidogrel for a minimum of twelve months without interruption. Initiate high-intensity statin therapy and titrate beta-adrenergic blockade as tolerated. Metformin may be resumed forty-eight hours post-procedure following confirmation of stable renal function. Outpatient referral to cardiac rehabilitation has been placed. The patient was counseled regarding return precautions, including recurrent angina, progressive dyspnea, presyncope, or hemorrhagic complications.`;

// Shorthand shown in the hero's "jargon decoder" card.
const GLOSSARY = [
  ["HTN", "high blood pressure"],
  ["NPO", "nothing to eat or drink"],
  ["PO BID", "by mouth, twice a day"],
  ["SOB", "short of breath"],
  ["qHS", "every night at bedtime"],
  ["MI", "heart attack"],
  ["PRN", "only when you need it"],
  ["Hx", "your health history"],
];

// What each readability metric means, and whether a lower score is better.
const METRICS = {
  flesch_kincaid_grade: { name: "Flesch–Kincaid grade", desc: "School grade needed to follow the text", lowerIsBetter: true },
  flesch_reading_ease: { name: "Flesch reading ease", desc: "0–100; higher is easier to read", lowerIsBetter: false },
  smog_index: { name: "SMOG index", desc: "Years of education needed", lowerIsBetter: true },
  gunning_fog: { name: "Gunning fog", desc: "Long sentences and complex words", lowerIsBetter: true },
  dale_chall: { name: "Dale–Chall", desc: "Words outside everyday vocabulary", lowerIsBetter: true },
};

// The AMA recommends patient materials be written at or below a 6th-grade level.
const TARGET_GRADE = 6;
const RULER_MAX = 18;

let lastResult = "";

// ---------- Helpers ----------
function countWords(text) {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

function updateInputMeta() {
  const words = countWords(inputText.value);
  inputMeta.textContent = `${words.toLocaleString()} word${words === 1 ? "" : "s"}`;
}

let toastTimer;
function toast(message, { error = false } = {}) {
  toastEl.textContent = message;
  toastEl.classList.toggle("error", error);
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), error ? 5000 : 2200);
}

function replayAnimation(el, cls) {
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}

function showOutput(state) {
  emptyState.hidden = state !== "empty";
  loadingState.hidden = state !== "loading";
  simplifiedEl.hidden = state !== "result";
  outputActions.hidden = state !== "result";
}

function setLoading(loading) {
  simplifyBtn.disabled = loading;
  simplifyBtn.classList.toggle("is-loading", loading);
  simplifyBtn.querySelector(".go-label").textContent = loading ? "Working…" : "Simplify";
}

// A heading is a short line on its own with no sentence punctuation,
// e.g. "Diagnosis" or "Warning Signs:".
function isHeading(line) {
  const clean = line.replace(/:$/, "").trim();
  if (!clean || clean.length > 40) return false;
  if (/[.!?,;]$/.test(clean)) return false;
  return clean.split(/\s+/).length <= 5 && /^[A-Z]/.test(clean);
}

// Split the model output into [{ heading, paragraphs[] }] sections.
function parseSections(text) {
  const sections = [];
  let current = { heading: null, paragraphs: [] };
  let para = [];

  const flushPara = () => {
    if (para.length) current.paragraphs.push(para.join(" "));
    para = [];
  };

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) { flushPara(); continue; }
    if (isHeading(line)) {
      flushPara();
      if (current.heading || current.paragraphs.length) sections.push(current);
      current = { heading: line.replace(/:$/, ""), paragraphs: [] };
    } else {
      para.push(line);
    }
  }
  flushPara();
  if (current.heading || current.paragraphs.length) sections.push(current);
  return sections;
}

function renderSimplified(text) {
  simplifiedEl.replaceChildren();
  for (const section of parseSections(text)) {
    if (section.heading) {
      const h = document.createElement("h3");
      h.textContent = section.heading;
      simplifiedEl.append(h);
    }
    for (const p of section.paragraphs) {
      const el = document.createElement("p");
      el.textContent = p;
      simplifiedEl.append(el);
    }
  }
}

// ---------- Readability report ----------
const fmt = (n, digits = 1) => Number(n).toFixed(digits);

function ordinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function gradePhrase(grade) {
  if (grade > 16) return "graduate-level";
  if (grade > 12) return "college-level";
  return `${ordinal(Math.max(1, Math.round(grade)))}-grade`;
}

// "a 6th-grade", "an 8th-grade", wrapped in <em> for the headline
function gradeEm(grade, cls = "") {
  const phrase = gradePhrase(grade);
  const article = /^(8|11|18)/.test(phrase) ? "an" : "a";
  return `${article} <em${cls ? ` class="${cls}"` : ""}>${phrase}</em>`;
}

function easeLabel(score) {
  if (score >= 90) return "very easy";
  if (score >= 80) return "easy";
  if (score >= 70) return "fairly easy";
  if (score >= 60) return "plain English";
  if (score >= 50) return "fairly difficult";
  if (score >= 30) return "difficult";
  return "very difficult";
}

function renderHeadline(before, after) {
  const gB = before.flesch_kincaid_grade, gA = after.flesch_kincaid_grade;
  const eB = before.flesch_reading_ease, eA = after.flesch_reading_ease;
  let headline;
  if (gA < gB - 0.5) {
    headline = `From ${gradeEm(gB)} read to ${gradeEm(gA, "after")} one.`;
  } else if (gA > gB + 0.5) {
    headline = `This version reads <em>harder</em> than the original.`;
  } else {
    headline = `About the same reading level, at ${gradeEm(gA, "after")} read.`;
  }
  $("reportHeadline").innerHTML = headline;
  const ease = (e) => (e < 0 ? "below 0" : fmt(e, 0));
  $("reportSub").textContent =
    `Reading ease went from ${ease(eB)} (${easeLabel(eB)}) to ${ease(eA)} (${easeLabel(eA)}) on a 0–100 scale.`;

  // Only stamp notes that meet the target (rounded to match the headline)
  const stamp = $("stamp");
  stamp.hidden = Math.round(gA) > TARGET_GRADE;
  if (!stamp.hidden) {
    stamp.innerHTML = "Meets<br>6th-grade<br>target";
    replayAnimation(stamp, "thud");
  }
}

function renderRuler(gB, gA) {
  const pos = (g) => (Math.max(0, Math.min(RULER_MAX, g)) / RULER_MAX) * 100;
  const pB = pos(gB), pA = pos(gA);
  const edge = (p) => (p < 10 ? " edge-left" : p > 90 ? " edge-right" : "");

  let ticks = "";
  for (let g = 0; g <= RULER_MAX; g++) {
    ticks += `<span class="tick${g % 3 === 0 ? " major" : ""}" style="left:${pos(g)}%"></span>`;
  }
  const labels = [[0, "K"], [3, "3rd", true], [6, "6th"], [9, "9th", true], [12, "12th"], [15, "College", true], [RULER_MAX, "Grad"]]
    .map(([g, t, minor]) => `<span class="${minor ? "minor" : ""}" style="left:${pos(g)}%">${t}</span>`)
    .join("");

  $("ruler").innerHTML = `
    <div class="marker marker-before${edge(pB)}" style="left:${pB}%">
      <span class="marker-tag">Before <b>${fmt(gB)}</b></span>
    </div>
    <div class="ruler-bar">
      <div class="ruler-zone" style="width:${pos(TARGET_GRADE)}%"><span class="ruler-zone-label">Patient-friendly</span></div>
      ${ticks}
      <div class="ruler-span" style="left:${pB}%;width:0"></div>
    </div>
    <div class="ruler-labels">${labels}</div>
    <div class="marker marker-after${edge(pA)}" style="left:${pB}%">
      <span class="marker-tag">After <b>${fmt(gA)}</b></span>
    </div>`;

  // Slide the "after" marker from the original grade to the new one
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.querySelector(".marker-after").style.left = `${pA}%`;
    const span = document.querySelector(".ruler-span");
    span.style.left = `${Math.min(pA, pB)}%`;
    span.style.width = `${Math.abs(pB - pA)}%`;
  }));
}

function changeFlag(before, after, lowerIsBetter) {
  const diff = after - before;
  if (Math.abs(diff) < 0.05) return `<span class="flag flag-neutral">no change</span>`;
  const better = lowerIsBetter ? diff < 0 : diff > 0;
  const arrow = diff < 0 ? "▼" : "▲";
  return `<span class="flag ${better ? "flag-good" : "flag-bad"}">${arrow} ${fmt(Math.abs(diff))} <span class="word">${better ? "easier" : "harder"}</span></span>`;
}

function renderLab(before, after) {
  let rows = `<tr><th>Measure</th><th>Original</th><th>Simplified</th><th>Change</th></tr>`;
  for (const [key, m] of Object.entries(METRICS)) {
    rows += `
      <tr>
        <td>${m.name}<span class="desc">${m.desc}</span></td>
        <td class="orig">${fmt(before[key])}</td>
        <td class="simp">${fmt(after[key])}</td>
        <td>${changeFlag(before[key], after[key], m.lowerIsBetter)}</td>
      </tr>`;
  }
  if (before.word_count != null) {
    const d = after.word_count - before.word_count;
    rows += `
      <tr>
        <td>Word count<span class="desc">Plain language often needs more words</span></td>
        <td class="orig">${before.word_count}</td>
        <td class="simp">${after.word_count}</td>
        <td><span class="flag flag-neutral">${d >= 0 ? "+" : "−"}${Math.abs(d)}</span></td>
      </tr>`;
  }
  $("labTable").innerHTML = rows;
  $("labTime").textContent = new Date().toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function renderReadability(before, after) {
  readabilitySection.hidden = false;
  replayAnimation(readabilitySection, "fade-in");
  renderHeadline(before, after);
  renderRuler(before.flesch_kincaid_grade, after.flesch_kincaid_grade);
  renderLab(before, after);
}

// ---------- Actions ----------
async function simplify() {
  const text = inputText.value.trim();
  if (!text) {
    toast("Paste a clinical note first, or use the sample.", { error: true });
    inputText.focus();
    return;
  }
  if (simplifyBtn.disabled) return;

  setLoading(true);
  showOutput("loading");

  try {
    const res = await fetch("/api/simplify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const detail = Array.isArray(data.detail)
        ? "That note is too long. Please shorten it and try again."
        : data.detail;
      throw new Error(detail || `Request failed (${res.status})`);
    }

    lastResult = data.simplified_text;
    renderSimplified(lastResult);
    showOutput("result");
    replayAnimation(simplifiedEl, "fade-in");
    $("outputBody").scrollTop = 0;

    renderReadability(data.readability_before, data.readability_after);

    if (window.matchMedia("(max-width: 1020px)").matches) {
      document.querySelector(".sheet-letter").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  } catch (err) {
    showOutput(lastResult ? "result" : "empty");
    toast(err.message || "Something went wrong. Please try again.", { error: true });
  } finally {
    setLoading(false);
  }
}

function resetAll() {
  inputText.value = "";
  lastResult = "";
  simplifiedEl.replaceChildren();
  readabilitySection.hidden = true;
  showOutput("empty");
  updateInputMeta();
  inputText.focus();
}

async function copyResult() {
  try {
    await navigator.clipboard.writeText(lastResult);
    toast("Copied to clipboard");
  } catch {
    toast("Couldn't access the clipboard.", { error: true });
  }
}

function downloadPdf() {
  if (!window.jspdf) {
    toast("PDF library is still loading. Try again in a moment.", { error: true });
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 56;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const width = pageW - margin * 2;
  let y = margin;

  const ensureSpace = (h) => {
    if (y + h > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // Title
  doc.setFont("times", "italic");
  doc.setFontSize(26);
  doc.setTextColor(31, 27, 22);
  doc.text("Your visit, in plain words", margin, y + 6);
  y += 26;
  doc.setFont("courier", "normal");
  doc.setFontSize(9);
  doc.setTextColor(109, 100, 88);
  doc.text(new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }).toUpperCase(), margin, y);
  y += 12;
  doc.setDrawColor(31, 27, 22);
  doc.setLineWidth(1.2);
  doc.line(margin, y, pageW - margin, y);
  y += 28;

  parseSections(lastResult).forEach((section, i) => {
    if (section.heading) {
      ensureSpace(40);
      doc.setFont("courier", "bold");
      doc.setFontSize(10);
      doc.setTextColor(44, 106, 82);
      doc.text(`${String(i + 1).padStart(2, "0")}  ${section.heading.toUpperCase()}`, margin, y);
      y += 18;
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(31, 27, 22);
    for (const p of section.paragraphs) {
      for (const line of doc.splitTextToSize(p, width)) {
        ensureSpace(17);
        doc.text(line, margin, y);
        y += 17;
      }
      y += 8;
    }
    y += 6;
  });

  // Footer on every page
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("courier", "normal");
    doc.setFontSize(8);
    doc.setTextColor(109, 100, 88);
    doc.text("Simplified from your clinical note. Ask your care team if anything is unclear.", margin, pageH - 28);
    doc.text(`${i} / ${pages}`, pageW - margin, pageH - 28, { align: "right" });
  }

  doc.save("simplified-note.pdf");
}

function toggleTheme() {
  const root = document.documentElement;
  const current = root.dataset.theme
    || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const next = current === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  try { localStorage.setItem("theme", next); } catch {}
}

// ---------- Jargon decoder ----------
function startDecoder() {
  const body = document.querySelector(".decoder-body");
  const term = $("decTerm");
  const plain = $("decPlain");
  const dots = $("decDots");
  dots.innerHTML = GLOSSARY.map(() => "<span></span>").join("");
  let i = 0;

  const show = (n) => {
    term.textContent = GLOSSARY[n][0];
    plain.textContent = GLOSSARY[n][1];
    [...dots.children].forEach((d, k) => d.classList.toggle("on", k === n));
  };
  show(0);

  setInterval(() => {
    if (document.hidden) return;
    i = (i + 1) % GLOSSARY.length;
    body.classList.add("swap");
    setTimeout(() => {
      show(i);
      body.classList.remove("swap");
    }, 300);
  }, 2800);
}

// ---------- Wire up ----------
simplifyBtn.addEventListener("click", simplify);
newNoteBtn.addEventListener("click", resetAll);
copyBtn.addEventListener("click", copyResult);
pdfBtn.addEventListener("click", downloadPdf);
themeBtn.addEventListener("click", toggleTheme);
inputText.addEventListener("input", updateInputMeta);

sampleBtn.addEventListener("click", () => {
  inputText.value = SAMPLE_NOTE;
  updateInputMeta();
  inputText.focus();
});

inputText.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    simplify();
  }
});

updateInputMeta();
startDecoder();
