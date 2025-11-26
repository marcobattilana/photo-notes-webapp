/* ============================
   INIZIO: JSZip incorporato
   ============================ */
// Mini versione integrata di JSZip (solo funzioni necessarie)
class SimpleZip {
  constructor() { this.files = {}; }

  file(name, content) {
    this.files[name] = content;
  }

  async generateAsync() {
    function toUint8Array(str) {
      const raw = atob(str.split(",")[1]);
      const arr = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
      return arr;
    }

    let parts = [];
    let metadata = [];

    for (const name in this.files) {
      const file = this.files[name];
      if (typeof file === "string" && file.startsWith("data:image")) {
        parts.push({ name, content: toUint8Array(file) });
      } else {
        parts.push({ name, content: new TextEncoder().encode(file) });
      }
    }
    return parts;
  }
}
/* ============================
   FINE JSZip
   ============================ */

const camInput = document.getElementById("cameraInput");
const takeBtn = document.getElementById("takePhotoBtn");
const preview = document.getElementById("preview");
const descInput = document.getElementById("description");
const saveBtn = document.getElementById("saveBtn");
const galleryDiv = document.getElementById("gallery");

/* ============================
   SCATTO FOTO
   ============================ */

takeBtn.addEventListener("click", () => camInput.click());

camInput.addEventListener("change", e => {
  camInput.value = ""; // Fix fondamentale per iPhone

  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    preview.src = reader.result;
    preview.style.display = "block";
  };
  reader.readAsDataURL(file);
});

/* ============================
   SALVATAGGIO
   ============================ */

saveBtn.addEventListener("click", () => {
  const img = preview.src;
  const desc = descInput.value.trim();

  if (!img || img.length < 50) {
    alert("Scatta una foto prima di salvare!");
    return;
  }

  const item = {
    id: Date.now(),
    img,
    desc,
    date: new Date().toLocaleString()
  };

  const notes = JSON.parse(localStorage.getItem("photoNotes") || "[]");
  notes.push(item);
  localStorage.setItem("photoNotes", JSON.stringify(notes));

  preview.style.display = "none";
  preview.src = "";
  descInput.value = "";
  camInput.value = ""; // Reset input

  loadGallery();
});

/* ============================
   CARICAMENTO GALLERIA
   ============================ */

function loadGallery() {
  const notes = JSON.parse(localStorage.getItem("photoNotes") || "[]");
  galleryDiv.innerHTML = "";

  notes.forEach(note => {
    const div = document.createElement("div");
    div.className = "photoCard";

    div.innerHTML = `
      <img src="${note.img}">
      <p>${note.desc || "(senza descrizione)"}</p>
      <button class="downloadBtn" onclick="downloadNote(${note.id})">⬇️ Scarica</button>
      <button class="deleteBtn" onclick="deleteNote(${note.id})">🗑 Elimina</button>
    `;

    galleryDiv.appendChild(div);
  });

  addExportAllButton();
}

/* ============================
   CANCELLA ELEMENTO
   ============================ */

function deleteNote(id) {
  let notes = JSON.parse(localStorage.getItem("photoNotes") || "[]");
  notes = notes.filter(n => n.id !== id);
  localStorage.setItem("photoNotes", JSON.stringify(notes));
  loadGallery();
}

/* ============================
   DOWNLOAD SINGOLO ELEMENTO
   ============================ */

function downloadNote(id) {
  const notes = JSON.parse(localStorage.getItem("photoNotes") || "[]");
  const item = notes.find(n => n.id === id);

  const blob = new Blob(
    [JSON.stringify(item, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `note-${id}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ============================
   ESPORTAZIONE ZIP COMPLETO
   ============================ */

function addExportAllButton() {
  if (!document.getElementById("exportAllBtn")) {
    const btn = document.createElement("button");
    btn.id = "exportAllBtn";
    btn.className = "downloadBtn";
    btn.innerText = "📦 Esporta Galleria (ZIP)";
    btn.style.marginTop = "20px";
    btn.onclick = exportAllZip;
    galleryDiv.parentElement.appendChild(btn);
  }
}

async function exportAllZip() {
  const notes = JSON.parse(localStorage.getItem("photoNotes") || "[]");

  if (notes.length === 0) {
    alert("Nessuna foto salvata!");
    return;
  }

  const zip = new SimpleZip();

  let metadata = [];

  notes.forEach(note => {
    zip.file(`photo-${note.id}.png`, note.img);
    metadata.push({
      id: note.id,
      desc: note.desc,
      date: note.date,
      file: `photo-${note.id}.png`
    });
  });

  zip.file("metadata.json", JSON.stringify(metadata, null, 2));

  const parts = await zip.generateAsync();

  const blob = new Blob(parts.map(p => p.content), { type: "application/zip" });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "photo-notes.zip";
  a.click();
  URL.revokeObjectURL(url);
}

/* ============================
   CARICAMENTO INIZIALE
   ============================ */
loadGallery();
