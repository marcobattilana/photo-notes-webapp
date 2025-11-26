const camInput = document.getElementById("cameraInput");
const takeBtn = document.getElementById("takePhotoBtn");
const preview = document.getElementById("preview");
const descInput = document.getElementById("description");
const saveBtn = document.getElementById("saveBtn");
const galleryDiv = document.getElementById("gallery");

// Apri fotocamera
takeBtn.addEventListener("click", () => camInput.click());

// Carica immagine scelta
camInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    preview.src = reader.result;
    preview.style.display = "block";
  };
  reader.readAsDataURL(file);
});

// Salva foto + descrizione in localStorage
saveBtn.addEventListener("click", () => {
  const img = preview.src;
  const desc = descInput.value.trim();
  if (!img || img.length < 10) {
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

  // Reset UI
  preview.style.display = "none";
  preview.src = "";
  descInput.value = "";
  
  loadGallery();
});

// Carica galleria
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
}

// Cancella elemento
function deleteNote(id) {
  let notes = JSON.parse(localStorage.getItem("photoNotes") || "[]");
  notes = notes.filter(n => n.id !== id);
  localStorage.setItem("photoNotes", JSON.stringify(notes));
  loadGallery();
}

// Download imagem + descrizione (JSON)
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

// Carica iniziale
loadGallery();
