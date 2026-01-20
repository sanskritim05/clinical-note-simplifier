// Buttons & elements
const simplifyBtn = document.getElementById("simplifyBtn");
const newNoteBtn = document.getElementById("newNoteBtn");
const copyBtn = document.getElementById("copyBtn");
const pdfBtn = document.getElementById("pdfBtn");
const spinner = document.getElementById("spinner");
const inputText = document.getElementById("inputText");

// Build a side‑by‑side readability comparison table
function renderReadability(before, after) {
  const explanations = {
    flesch_reading_ease: "Higher = easier to read",
    flesch_kincaid_grade: "Approximate U.S. grade level",
    smog_index: "Years of education needed to understand",
    gunning_fog: "Higher = more complex writing",
    dale_chall: "Higher = more difficult vocabulary"
  };

  let html = `
    <table class="readability-table">
      <tr>
        <th>Metric</th>
        <th>Before</th>
        <th>After</th>
        <th>Meaning</th>
      </tr>
  `;

  for (const key in before) {
    html += `
      <tr>
        <td>${key}</td>
        <td>${before[key].toFixed(2)}</td>
        <td>${after[key].toFixed(2)}</td>
        <td>${explanations[key]}</td>
      </tr>
    `;
  }

  html += "</table>";
  return html;
}

// Handle Simplify button
simplifyBtn.addEventListener("click", async () => {
  const text = inputText.value.trim();
  if (!text) return alert("Please enter text.");

  // UI state: loading
  spinner.style.display = "block";
  simplifyBtn.disabled = true;
  simplifyBtn.textContent = "Simplifying...";

  const res = await fetch("/simplify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });

  const data = await res.json();

  // Stop spinner
  spinner.style.display = "none";
  simplifyBtn.disabled = false;
  simplifyBtn.textContent = "Simplify";

  // Insert simplified text
  document.getElementById("simplifiedText").textContent = data.simplified_text;

  // Insert readability comparison table
  document.getElementById("readability").innerHTML =
    renderReadability(data.readability_before, data.readability_after);

  // Show results with fade‑in
  const results = document.getElementById("results");
  results.style.display = "block";
  results.classList.add("fade-in");

  // Show utility buttons
  copyBtn.style.display = "inline-block";
  pdfBtn.style.display = "inline-block";
});

// Handle New Note button
newNoteBtn.addEventListener("click", () => {
  inputText.value = "";
  document.getElementById("simplifiedText").textContent = "";
  document.getElementById("readability").innerHTML = "";
  document.getElementById("results").style.display = "none";

  // Hide utility buttons
  copyBtn.style.display = "none";
  pdfBtn.style.display = "none";
});

// Handle Copy button
copyBtn.addEventListener("click", () => {
  const text = document.getElementById("simplifiedText").textContent;
  navigator.clipboard.writeText(text);
  copyBtn.textContent = "Copied!";
  setTimeout(() => (copyBtn.textContent = "Copy Simplified Text"), 1500);
});

// Handle PDF download
pdfBtn.addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const text = document.getElementById("simplifiedText").textContent;
  const lines = doc.splitTextToSize(text, 180);

  doc.text(lines, 15, 15);
  doc.save("simplified_note.pdf");
});
