document.getElementById('captureBtn').addEventListener('click', ()=>{
  document.getElementById('cameraInput').click();
});
document.getElementById('cameraInput').addEventListener('change', e=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = ()=>{ document.getElementById('preview').src = reader.result; };
  reader.readAsDataURL(file);
});
document.getElementById('saveBtn').addEventListener('click', ()=>{
  const img = document.getElementById('preview').src;
  const desc = document.getElementById('description').value;
  const notes = JSON.parse(localStorage.getItem('notes')||'[]');
  notes.push({img, desc, date: new Date().toISOString()});
  localStorage.setItem('notes', JSON.stringify(notes));
  alert('Salvato!');
});
