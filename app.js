const defaults = {
  groom: 'आकाश', bride: 'वैष्णवी', note: 'आपल्या प्रेमळ उपस्थितीची अपेक्षा आहे.',
  welcomeKicker: 'शुभ मंगल सावधान', welcomeTitle: 'आमच्या शुभविवाहाचे हार्दिक आमंत्रण', welcomeCopy: 'तुमच्या उपस्थितीने आमचा आनंद द्विगुणित होईल.', monogram: 'अ ✦ व',
  parents: { title:'आई व वडील', symbol:'♡', fields:[['नावे','श्री. व सौ. आपले नाव']] },
  venue: { title:'विवाह स्थळ', symbol:'⌂', fields:[['स्थळाचे नाव','आपले विवाह स्थळ'],['पूर्ण पत्ता','येथे पूर्ण पत्ता लिहा']] },
  datetime: { title:'दिनांक व वेळ', symbol:'◷', fields:[['दिनांक','रविवार, १५ डिसेंबर २०२६'],['वेळ','सायंकाळी ६:०० वाजता']] },
  wellwishers: { title:'आपले कृपाभीलाषी', symbol:'✧', fields:[['नावे','आपले प्रियजन व मित्रपरिवार']] },
  welcome: { title:'स्वागतोत्सुक', symbol:'✤', fields:[['नावे','आपले नाव व कुटुंब']] },
  mama: { title:'आमच्या मामाच्या लग्नाला यायचं हं!', symbol:'☻', fields:[['संदेश','तुमची उपस्थिती आमच्यासाठी खूप खास आहे!']] }
};
const folderOrder = ['parents','venue','datetime','wellwishers','welcome','mama'];
let state = JSON.parse(localStorage.getItem('marathiWeddingInvite') || 'null') || structuredClone(defaults);
let currentFolder = null;
let isAdmin = false;
const $ = s => document.querySelector(s);
function persist(){ localStorage.setItem('marathiWeddingInvite', JSON.stringify(state)); }
function folderPreview(folder) { return state[folder].fields[0][1]; }
function renderFolders() {
  $('#folderGrid').innerHTML = folderOrder.map(key => { const f=state[key]; return `<button class="folder-card" data-folder="${key}" type="button"><span class="folder-icon">${f.symbol}</span><b>${f.title}</b><small>${folderPreview(key)}</small><span class="chevron">›</span></button>`; }).join('');
  document.querySelectorAll('[data-folder]').forEach(el => el.addEventListener('click', () => openModal(el.dataset.folder)));
}
function loadImages(){
  const couple=localStorage.getItem('couplePhoto'); const bg=localStorage.getItem('weddingBackground');
  if(couple) $('#welcomeBackdrop').style.backgroundImage=`linear-gradient(145deg,rgba(60,43,35,.4),rgba(88,31,37,.25)),url(${couple})`;
  if(bg) $('#heroImage').style.backgroundImage=`url(${bg})`; else if(couple) $('#heroImage').style.backgroundImage=`url(${couple})`;
}
function updateText(){
  document.querySelectorAll('[data-key]').forEach(el => el.textContent = state[el.dataset.key] || defaults[el.dataset.key]); $('#notePreview').textContent=state.note; }
function setAdminMode(enabled) {
  isAdmin = enabled;
  $('#couplePhotoBtn').classList.toggle('hidden', !enabled);
  $('#backgroundBtn').classList.toggle('hidden', !enabled);
  $('#adminLogout').classList.toggle('hidden', !enabled);
  $('#editToggle').classList.toggle('hidden', !enabled);
  $('#adminHomePanel').classList.toggle('hidden', !enabled);
  $('#showAdminLogin').classList.toggle('hidden', enabled);
  document.querySelectorAll('[data-key]').forEach(el => { el.contentEditable = enabled ? 'true' : 'false'; el.title = enabled ? 'नाव बदलण्यासाठी टॅप करा' : ''; });
}
function openModal(key){
  currentFolder=key; const f=key==='note'?{title:'टीप',symbol:'✦',fields:[['आपली टीप',state.note]]}:state[key];
  $('#modalSymbol').textContent=f.symbol; $('#modalKicker').textContent=key==='note'?'विशेष संदेश':'विवाह सोहळा'; $('#modalTitle').textContent=f.title;
  $('#modalFields').innerHTML = '';
  f.fields.forEach(([label,value]) => addField(label, value, key === 'note'));
  $('#addDetail').classList.toggle('hidden', key === 'note' || !isAdmin);
  $('#saveDetail').classList.toggle('hidden', !isAdmin);
  document.querySelectorAll('#modalFields input, #modalFields textarea').forEach(el => el.disabled = !isAdmin);
  document.querySelectorAll('.remove-detail').forEach(el => el.classList.toggle('hidden', !isAdmin));
  $('#detailModal').classList.remove('hidden');
}
function addField(label = 'माहितीचे शीर्षक', value = '', isNote = false) {
  const field = document.createElement('div'); field.className = 'field';
  field.innerHTML = isNote
    ? `<label>आपली टीप</label><textarea data-value>${value}</textarea>`
    : `<input class="field-label-input" data-label value="${label}" aria-label="माहितीचे शीर्षक" /><input data-value value="${value}" aria-label="तपशील" /><button class="remove-detail" type="button" aria-label="ही माहिती काढा">×</button>`;
  $('#modalFields').append(field);
}
function closeModal(){ $('#detailModal').classList.add('hidden'); currentFolder=null; }
function fileToStore(input,key,after){ const file=input.files[0]; if(!file)return; const reader=new FileReader(); reader.onload=()=>{ try { localStorage.setItem(key,reader.result); after(); } catch { alert('फोटोचा आकार खूप मोठा आहे. कृपया छोटा फोटो निवडा.'); } }; reader.readAsDataURL(file); }
function showInvitation(name, admin = false) { setAdminMode(admin); $('#guestGreeting').textContent = admin ? 'प्रिय आयोजक' : (name ? `प्रिय ${name}` : 'प्रिय पाहुणे'); $('#welcomeScreen').classList.add('hidden'); $('#adminScreen').classList.add('hidden'); $('#invitationScreen').classList.remove('hidden'); }
$('#guestForm').addEventListener('submit', e=>{e.preventDefault(); showInvitation($('#guestName').value.trim()); });
$('#backBtn').addEventListener('click',()=>{ $('#invitationScreen').classList.add('hidden'); $('#welcomeScreen').classList.remove('hidden'); });
$('#showAdminLogin').addEventListener('click', () => { $('#welcomeScreen').classList.add('hidden'); $('#adminScreen').classList.remove('hidden'); $('#adminPassword').focus(); });
$('#adminBackBtn').addEventListener('click', () => { $('#adminScreen').classList.add('hidden'); $('#welcomeScreen').classList.remove('hidden'); });
$('#adminForm').addEventListener('submit', e => { e.preventDefault(); const password = $('#adminPassword').value; const savedPassword = localStorage.getItem('weddingAdminPassword') || 'admin123'; if (password !== savedPassword) { $('#loginError').classList.remove('hidden'); return; } $('#loginError').classList.add('hidden'); $('#adminPassword').value = ''; setAdminMode(true); $('#adminScreen').classList.add('hidden'); $('#welcomeScreen').classList.remove('hidden'); });
$('#adminLogout').addEventListener('click', () => { setAdminMode(false); $('#invitationScreen').classList.add('hidden'); $('#welcomeScreen').classList.remove('hidden'); });
$('#editCeremonyBtn').addEventListener('click', () => showInvitation('', true));
$('#homeLogoutBtn').addEventListener('click', () => { setAdminMode(false); });
$('#couplePhotoBtn').addEventListener('click',()=>$('#couplePhotoInput').click()); $('#backgroundBtn').addEventListener('click',()=>$('#backgroundInput').click());
$('#couplePhotoInput').addEventListener('change',e=>fileToStore(e.target,'couplePhoto',loadImages)); $('#backgroundInput').addEventListener('change',e=>fileToStore(e.target,'weddingBackground',loadImages));
$('#addDetail').addEventListener('click', () => addField());
$('#modalFields').addEventListener('click', event => { if (event.target.matches('.remove-detail')) event.target.closest('.field').remove(); });
$('#saveDetail').addEventListener('click',()=>{
  if(currentFolder==='note') state.note=$('#modalFields [data-value]').value.trim()||defaults.note;
  else { const fields=[...document.querySelectorAll('#modalFields .field')].map(field=>[field.querySelector('[data-label]').value.trim()||'माहिती',field.querySelector('[data-value]').value.trim()]).filter(([,value])=>value); state[currentFolder].fields=fields.length?fields:[['माहिती','']]; }
  persist(); updateText(); renderFolders(); closeModal();
});
document.querySelectorAll('[data-close]').forEach(el=>el.addEventListener('click',closeModal));
$('#editToggle').addEventListener('click',()=>openModal('note'));
document.querySelectorAll('[data-key]').forEach(el=>el.addEventListener('blur',()=>{ if (!isAdmin) return; state[el.dataset.key]=el.textContent.trim()||defaults[el.dataset.key];persist(); }));
loadImages(); updateText(); renderFolders(); setAdminMode(false);
