document.title = 'आमंत्रण';

const defaults = {
  groom: 'आकाश', bride: 'वैष्णवी', note: 'आपल्या प्रेमळ उपस्थितीची अपेक्षा आहे.',
  welcomeKicker: 'शुभ मंगल सावधान', welcomeTitle: 'आमच्या शुभविवाहाचे हार्दिक आमंत्रण', welcomeCopy: 'तुमच्या उपस्थितीने आमचा आनंद द्विगुणित होईल.',
  parents: { title:'आई व वडील', symbol:'♡', fields:[['नावे','श्री. व सौ. आपले नाव']] },
  venue: { title:'विवाह स्थळ', symbol:'⌂', fields:[['स्थळाचे नाव','आपले विवाह स्थळ'],['पूर्ण पत्ता','येथे संपूर्ण पत्ता टाका']], mapQuery:'', whatsappNumber:'', whatsappText:'' },
  datetime: { title:'दिनांक व वेळ', symbol:'◷', fields:[['���िनांक','रविवार, १५ डिसेंबर २०२६'],['वेळ','सायंकाळी ६:००']], iso:'' },
  wellwishers: { title:'आपले कृपाभीलाषी', symbol:'✧', fields:[['नावे','आपले प्रियजन व मित्रपरिवार']] },
  welcome: { title:'स्वागतोत्सुक', symbol:'✤', fields:[['नावे','आपले नाव व कुटुंब']] },
  mama: { title:'आमच्या मामाच्या लग्नाला यायचं हं!', symbol:'☻', fields:[['संदेश','तुमची उपस्थिती आमच्या हृदयाला स्पर्श करेल']]} 
};
const folderOrder = ['parents','venue','datetime','wellwishers','welcome','mama'];
let state = JSON.parse(localStorage.getItem('marathiWeddingInvite') || 'null') || structuredClone(defaults);
let currentFolder = null;
let isAdmin = false;
let countdownTimer = null;
const $ = s => document.querySelector(s);
function persist(){ localStorage.setItem('marathiWeddingInvite', JSON.stringify(state)); }
function folderPreview(folder) { return state[folder].fields[0][1]; }
function renderFolders() {
  $('#folderGrid').innerHTML = folderOrder.map(key => { const f=state[key];
    const extra = key==='venue' && f.mapQuery ? `<small class="map-preview-text">${f.mapQuery}</small>` : '';
    return `<button class="folder-card" data-folder="${key}" type="button"><span class="folder-icon">${f.symbol}</span><div class="folder-body"><b>${f.title}</b><small>${f.fields[0][1]}</small>${extra}</div><span class="chevron">›</span></button>`;
  }).join('');
  document.querySelectorAll('[data-folder]').forEach(el => el.addEventListener('click', () => openModal(el.dataset.folder)));
}
function loadImages(){
  const couple=localStorage.getItem('couplePhoto'); const bg=localStorage.getItem('weddingBackground');
  if(couple) $('#welcomeBackdrop').style.backgroundImage=`linear-gradient(145deg,rgba(60,43,35,.4),rgba(88,31,37,.25)),url(${couple})`;
  if(bg) $('#heroImage').style.backgroundImage=`url(${bg})`; else if(couple) $('#heroImage').style.backgroundImage=`url(${couple})`;
}
function updateText(){
  document.querySelectorAll('[data-key]').forEach(el => el.textContent = state[el.dataset.key] || defaults[el.dataset.key]);
  $('#notePreview').textContent = state.note || defaults.note;
}
function setAdminMode(enabled) {
  isAdmin = enabled;
  $('#couplePhotoBtn').classList.toggle('hidden', !enabled);
  $('#backgroundBtn').classList.toggle('hidden', !enabled);
  $('#adminLogout').classList.toggle('hidden', !enabled);
  $('#editToggle').classList.toggle('hidden', !enabled);
  $('#adminHomePanel').classList.toggle('hidden', !enabled);
  $('#showAdminLogin').classList.toggle('hidden', enabled);
  document.querySelectorAll('[data-key]').forEach(el => { el.contentEditable = enabled ? 'true' : 'false'; el.title = enabled ? 'नाव बदलण्यासाठी टॅप करा' : ''; });
  document.getElementById('adminWhatsappShare')?.classList.toggle('hidden', !enabled);
}
function openModal(key){
  currentFolder=key; 
  const f = key==='note' ? {title:'टीप',symbol:'✦',fields:[['आपली टीप',state.note]]} : state[key];
  $('#modalSymbol').textContent=f.symbol; $('#modalKicker').textContent=key==='note'?'विशेष संदेश':'विवाह सोहळा'; $('#modalTitle').textContent=f.title;
  $('#modalFields').innerHTML = '';
  f.fields.forEach(([label,value]) => addField(label, value, key === 'note'));

  if(key==='venue'){
    const mapHtml = `
      <div class="field full-width">
        <label>Maps स्थान (पत्ता किंवा lat,lng)</label>
        <input id="venueMapQuery" data-value value="${escapeHtml(state.venue.mapQuery || '')}" placeholder="उदा. 19.075983,72.877655 या पूर्ण पत्ता" />
        <button id="previewMapBtn" type="button">नकाशा पहा</button>
      </div>
      <div class="field">
        <label>WhatsApp नंबर (Admin)</label>
        <input id="venueWhatsappNumber" data-value value="${escapeHtml(state.venue.whatsappNumber || '')}" placeholder="९१XXXXXXXXXX" />
      </div>
      <div class="field full-width">
        <label>WhatsApp शेअर मेसेज (Admin)</label>
        <textarea id="venueWhatsappText">${escapeHtml(state.venue.whatsappText || '')}</textarea>
      </div>
      <div class="field full-width" id="venueMapPreviewWrap">
        <label>नकाशा पूर्वावलोकन</label>
        <div id="venueMapPreview"></div>
      </div>
    `;
    $('#modalFields').insertAdjacentHTML('beforeend', mapHtml);
  }

  if(key==='datetime'){
    const isoVal = state.datetime?.iso || '';
    const dtHtml = `
      <div class="field">
        <label>दिनांक व वेळ सेट करा</label>
        <input id="datetimeISO" type="datetime-local" value="${isoVal ? isoValToLocal(isoVal) : ''}" />
      </div>
    `;
    $('#modalFields').insertAdjacentHTML('beforeend', dtHtml);
  }

  $('#addDetail').classList.toggle('hidden', key === 'note' || !isAdmin);
  $('#saveDetail').classList.toggle('hidden', !isAdmin);

  document.querySelectorAll('#modalFields input, #modalFields textarea').forEach(el => el.disabled = !isAdmin);
  document.querySelectorAll('.remove-detail').forEach(el => el.classList.toggle('hidden', !isAdmin));

  if(key==='venue') renderVenueMapPreview();
  $('#previewMapBtn')?.addEventListener('click', ()=>{ renderVenueMapPreview(true); });
  $('#detailModal').classList.remove('hidden');
}
function addField(label = 'माहितीचे शीर्षक', value = '', isNote = false) {
  const field = document.createElement('div'); field.className = 'field';
  if (isNote || ['पूर्ण पत्ता', 'संदेश'].includes(label)) field.classList.add('full-width');
  field.innerHTML = isNote
    ? `<label>आपली टीप</label><textarea data-value>${escapeHtml(value)}</textarea>`
    : `<input class="field-label-input" data-label value="${escapeHtml(label)}" aria-label="माहितीचे शीर्षक" /><input data-value value="${escapeHtml(value)}" aria-label="तपशील" /><button class="remove-detail" type="button">✕</button>`;
  $('#modalFields').append(field);
}
function closeModal(){ $('#detailModal').classList.add('hidden'); currentFolder=null; }
function fileToStore(input,key,after){ const file=input.files[0]; if(!file)return; const reader=new FileReader(); reader.onload=()=>{ try { localStorage.setItem(key,reader.result); after(); } catch(e){console.error(e)} }; reader.readAsDataURL(file); }
function showInvitation(name, admin = false) { setAdminMode(admin); $('#guestGreeting').textContent = admin ? 'प्रिय आयोजक' : (name ? `प्रिय ${name}` : 'प्रिय पाहुणे'); $('#welcomeScreen').classList.add('hidden'); $('#invitationScreen').classList.remove('hidden'); }

$('#guestForm').addEventListener('submit', e=>{e.preventDefault(); showInvitation($('#guestName').value.trim()); });
$('#backBtn').addEventListener('click',()=>{ $('#invitationScreen').classList.add('hidden'); $('#welcomeScreen').classList.remove('hidden'); });
$('#showAdminLogin').addEventListener('click', () => { $('#welcomeScreen').classList.add('hidden'); $('#adminScreen').classList.remove('hidden'); $('#adminPassword').focus(); });
$('#adminBackBtn').addEventListener('click', () => { $('#adminScreen').classList.add('hidden'); $('#welcomeScreen').classList.remove('hidden'); });
$('#adminForm').addEventListener('submit', e => { e.preventDefault(); const password = $('#adminPassword').value; const savedPassword = localStorage.getItem('weddingAdminPassword') || '';
  if(!savedPassword){
    localStorage.setItem('weddingAdminPassword', password);
    $('#adminPassword').value='';
    $('#adminScreen').classList.add('hidden');
    showInvitation('', true);
    return;
  }
  if(password === savedPassword){ $('#adminPassword').value=''; $('#adminScreen').classList.add('hidden'); showInvitation('', true); }
  else { $('#loginError').classList.remove('hidden'); setTimeout(()=>$('#loginError').classList.add('hidden'),2500); }
});
$('#adminLogout').addEventListener('click', () => { setAdminMode(false); $('#invitationScreen').classList.add('hidden'); $('#welcomeScreen').classList.remove('hidden'); });
$('#editCeremonyBtn').addEventListener('click', () => showInvitation('', true));
$('#homeLogoutBtn').addEventListener('click', () => { setAdminMode(false); });
$('#couplePhotoBtn').addEventListener('click',()=>$('#couplePhotoInput').click()); $('#backgroundBtn').addEventListener('click',()=>$('#backgroundInput').click());
$('#couplePhotoInput').addEventListener('change',e=>fileToStore(e.target,'couplePhoto',loadImages)); $('#backgroundInput').addEventListener('change',e=>fileToStore(e.target,'weddingBackground',loadImages));
$('#addDetail').addEventListener('click', () => addField(['parents', 'wellwishers', 'welcome'].includes(currentFolder) ? 'नाव' : 'माहितीचे शीर्षक'));
$('#modalFields').addEventListener('click', event => { if (event.target.matches('.remove-detail')) event.target.closest('.field').remove(); });

$('#saveDetail').addEventListener('click',()=>{
  if(!currentFolder) return;
  if(currentFolder==='note') state.note=$('#modalFields [data-value]').value.trim()||defaults.note;
  else {
    const fields=[...document.querySelectorAll('#modalFields .field')]
      .filter(f=>!f.querySelector('#venueMapQuery'))
      .map(field=>{
        const labelEl = field.querySelector('[data-label]');
        const valEl = field.querySelector('[data-value]');
        const label = labelEl ? labelEl.value.trim() : field.querySelector('label')?.textContent || 'माहिती';
        const val = valEl ? valEl.value.trim() : field.querySelector('[data-value]')?.textContent || '';
        return [label || 'माहिती', val || ''];
      });
    state[currentFolder].fields = fields.length ? fields : defaults[currentFolder].fields;
  }

  if(currentFolder==='venue'){
    const mq = document.getElementById('venueMapQuery')?.value.trim() || '';
    const wn = document.getElementById('venueWhatsappNumber')?.value.trim() || '';
    const wt = document.getElementById('venueWhatsappText')?.value.trim() || '';
    state.venue.mapQuery = mq;
    state.venue.whatsappNumber = wn;
    state.venue.whatsappText = wt;
  }
  if(currentFolder==='datetime'){
    const iso = document.getElementById('datetimeISO')?.value || '';
    if(iso){
      state.datetime.iso = localToIso(iso);
      const d = new Date(state.datetime.iso);
      state.datetime.fields = [["दिनांक", d.toLocaleDateString('mr-IN', {weekday:'long', year:'numeric', month:'long', day:'numeric'})],["वेळ", d.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})]];
    }
  }

  persist(); updateText(); renderFolders(); closeModal(); renderVenueMapPreview(); startCountdown();
});

document.querySelectorAll('[data-close]').forEach(el=>el.addEventListener('click',closeModal));
$('#editToggle').addEventListener('click',()=>openModal('note'));
document.querySelectorAll('[data-key]').forEach(el=>el.addEventListener('blur',()=>{ if (!isAdmin) return; state[el.dataset.key]=el.textContent.trim()||defaults[el.dataset.key];persist(); }));

$('#whatsappShare').addEventListener('click', ()=>{
  const shareText = buildShareText();
  const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  window.open(url,'_blank');
});
$('#adminWhatsappShare').addEventListener('click', ()=>{
  const num = state.venue.whatsappNumber || '';
  if(!num){ alert('Admin: कृपया प्रथम WhatsApp नंबर सेट करा.'); return; }
  const shareText = state.venue.whatsappText || buildShareText();
  const url = `https://wa.me/${num.replace(/[^0-9]/g,'')}?text=${encodeURIComponent(shareText)}`;
  window.open(url,'_blank');
});

function buildShareText(){
  const names = `${state.groom || defaults.groom} ✦ ${state.bride || defaults.bride}`;
  const dt = state.datetime?.iso ? new Date(state.datetime.iso).toLocaleString('mr-IN') : (state.datetime?.fields?.[0]?.[1] || 'दिनांक आणि वेळ');
  const maps = state.venue?.mapQuery ? (isLatLng(state.venue.mapQuery) ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(state.venue.mapQuery)}` : `https://www.google.com/maps?q=${encodeURIComponent(state.venue.mapQuery)}`) : '';
  return `${names} यांचे विवाह - ${dt}\n${state.venue?.fields?.find(f=>f[0]==='पूर्ण पत्ता')?.[1] || ''}\n${maps}`.trim();
}

function isLatLng(q){ return /^\s*-?\d+\.?\d*\s*,\s*-?\d+\.?\d*\s*$/.test(q); }

function renderVenueMapPreview(forceFromInput=false){
  const wrap = document.getElementById('venueMapPreview');
  if(!wrap) return;
  const query = (forceFromInput ? document.getElementById('venueMapQuery')?.value.trim() : state.venue.mapQuery) || '';
  if(!query){ wrap.innerHTML = '<em>नकाशासाठी पत्ता किंवा lat,lng सेट करा (Admin).</em>'; return; }
  let src = '';
  if(isLatLng(query)) src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  else src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  wrap.innerHTML = `<iframe src="${src}" width="100%" height="300" style="border:0;" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
}

function startCountdown(){
  const el = document.getElementById('countdown');
  if(!el) return;
  if(countdownTimer) clearInterval(countdownTimer);
  const iso = state.datetime?.iso || '';
  if(!iso){ el.textContent = ''; return; }
  function tick(){
    const now = new Date(); const target = new Date(state.datetime.iso);
    const diff = target - now;
    if(diff<=0){ el.textContent = 'सुखरूप शुभविवाह'; clearInterval(countdownTimer); return; }
    const days = Math.floor(diff/86400000); const hrs = Math.floor((diff%86400000)/3600000); const mins = Math.floor((diff%3600000)/60000); const secs = Math.floor((diff%60000)/1000);
    el.textContent = `${days} दिवस ${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  tick(); countdownTimer = setInterval(tick,1000);
}

function pad(n){ return String(n).padStart(2,'0'); }
function isoValToLocal(iso){ if(!iso) return ''; const d = new Date(iso); const off = d.getTimezoneOffset(); const local = new Date(d.getTime() - off*60000); return local.toISOString().slice(0,16); }
function localToIso(local){ if(!local) return ''; const d = new Date(local); return d.toISOString(); }

function escapeHtml(str){ return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

loadImages(); updateText(); renderFolders(); setAdminMode(false); startCountdown();