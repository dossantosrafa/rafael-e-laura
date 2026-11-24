import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const cfg = window.ALBUM_SUPABASE || {};
const configured = /^https:\/\/[\w-]+\.supabase\.co\/?$/.test(cfg.url || '') && !!cfg.anonKey;
const supabase = configured ? createClient(cfg.url, cfg.anonKey) : null;
const $ = (s) => document.querySelector(s);
let user = null;
let admin = false;
let memories = [];
let editing = null;
let removedPaths = new Set();
let busy = false;
const BUCKET = 'album-fotos';
const MAX = 6;
const MAX_FILE = 10 * 1024 * 1024;
const allowed = new Set(['image/jpeg','image/png','image/webp']);
const niceDate = s => new Date(s + 'T12:00:00').toLocaleDateString('pt-BR', {day:'numeric',month:'long',year:'numeric'});
const safe = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const publicUrl = path => supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
const showError = text => { $('#loadError').textContent = text; $('#loadError').hidden = !text; };
const feedback = (id,text) => { $(id).textContent = text; };
function openModal(id) { document.getElementById(id).hidden = false; document.body.style.overflow='hidden'; document.querySelector('#'+id+' [role="dialog"]').focus(); }
function closeModal(id) { document.getElementById(id).hidden = true; if ([...document.querySelectorAll('.modal')].every(m=>m.hidden)) document.body.style.overflow=''; }
document.addEventListener('click',e=> { const close=e.target.closest('[data-close]'); if(close)closeModal(close.dataset.close); });
document.addEventListener('keydown',e=>{if(e.key==='Escape') document.querySelectorAll('.modal:not([hidden])').forEach(m=>closeModal(m.id));});

function setAuthUI() {
  $('#loginBtn').textContent = admin ? 'Sair ♡' : 'Entrar ♡';
  $('#newBtn').hidden = !admin;
}
async function refreshAdmin() {
  const {data:{user:u}, error} = await supabase.auth.getUser();
  user = error ? null : u;
  admin = false;
  if(user) {
    const {data, error:memberError} = await supabase.from('album_admins').select('user_id').eq('user_id',user.id).maybeSingle();
    if(memberError) console.warn('Não foi possível verificar permissão administrativa:',memberError.message);
    admin = !!data;
  }
  setAuthUI(); render();
}
async function loadMemories() {
  if(!configured) { $('#setup').hidden=false; $('#count').textContent='Em breve, mais capítulos'; return; }
  const {data,error} = await supabase.from('album_memories').select('id,title,story,event_date,photo_paths,created_at').order('event_date',{ascending:false}).order('created_at',{ascending:false});
  if(error) {showError('Não foi possível carregar as novas lembranças. Confira a configuração do Supabase e execute o arquivo SQL.'); console.error(error);return;}
  showError('');memories=data||[];render();
}
function render() {
  $('#feed').replaceChildren();
  $('#count').textContent = memories.length ? `${memories.length} ${memories.length===1?'lembrança guardada':'lembranças guardadas'}` : 'Cada momento vale a pena';
  $('#empty').hidden = !configured || memories.length > 0;
  for (const m of memories) {
    const article=document.createElement('article');article.className='memory';
    const paths = Array.isArray(m.photo_paths) ? m.photo_paths : [];
    const gallery = paths.length ? `<div class="memory-photos ${paths.length===1?'single':''}">${paths.map(p=>`<button class="photo-open" type="button" data-src="${safe(publicUrl(p))}" data-caption="${safe(m.title)}"><img loading="lazy" src="${safe(publicUrl(p))}" alt="${safe(m.title)}"></button>`).join('')}</div>` : '';
    article.innerHTML = `${gallery}<div class="memory-body"><div class="memory-date">${safe(niceDate(m.event_date))}</div><h3>${safe(m.title)}</h3><p class="memory-story">${safe(m.story)}</p>${admin?`<div class="memory-actions"><button class="tiny edit" type="button">Editar ✎</button><button class="tiny danger delete" type="button">Excluir</button></div>`:''}</div>`;
    if(admin) {article.querySelector('.edit').addEventListener('click',()=>openEditor(m));article.querySelector('.delete').addEventListener('click',()=>deleteMemory(m));}
    $('#feed').appendChild(article);
  }
}
function openEditor(m=null) {
  if(!admin) return;
  editing=m;removedPaths=new Set(); $('#editForm').reset();
  $('#editTitle').innerHTML = m ? 'Editar <em>lembrança.</em>' : 'Nova <em>lembrança.</em>';
  $('#title').value=m?.title||''; $('#story').value=m?.story||''; $('#date').value=m?.event_date||new Date().toLocaleDateString('en-CA');
  $('#fileSummary').textContent='';feedback('#editMsg','');renderExisting();openModal('editModal');
}
function renderExisting() {
  $('#existing').replaceChildren();
  for (const p of (editing?.photo_paths||[])) {
    const span=document.createElement('span');
    span.textContent=removedPaths.has(p)?'Foto removida':'Foto salva';
    const btn=document.createElement('button');btn.type='button';btn.textContent=removedPaths.has(p)?' ↶ desfazer':' × remover';
    btn.addEventListener('click',()=>{removedPaths.has(p)?removedPaths.delete(p):removedPaths.add(p);renderExisting();});
    span.appendChild(btn);$('#existing').appendChild(span);
  }
}
$('#photos').addEventListener('change',()=>{
  const files=[...$('#photos').files];$('#fileSummary').textContent=files.length?`${files.length} nova(s) foto(s) selecionada(s)`:'';
});
async function optimize(file) {
  if(!allowed.has(file.type))throw Error('Use somente fotos JPG, PNG ou WebP.');
  if(file.size>MAX_FILE)throw Error('Cada foto deve ter no máximo 10 MB.');
  const bitmap=await createImageBitmap(file);
  const scale=Math.min(1,1800/Math.max(bitmap.width,bitmap.height));
  const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
  canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
  const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Falha ao processar imagem.')),'image/jpeg',0.82));
  return blob;
}
async function uploadFiles(files){
  const uploaded=[];
  try {
    for(let i=0;i<files.length;i++){
      feedback('#editMsg',`Enviando foto ${i+1} de ${files.length}...`);
      const blob=await optimize(files[i]);
      const path=`${user.id}/${crypto.randomUUID()}.jpg`;
      const {error}=await supabase.storage.from(BUCKET).upload(path,blob,{contentType:'image/jpeg',upsert:false});
      if(error) throw error;
      uploaded.push(path);
    }
    return uploaded;
  } catch(e) {if(uploaded.length) await supabase.storage.from(BUCKET).remove(uploaded);throw e;}
}
$('#editForm').addEventListener('submit',async e=>{
  e.preventDefault();if(busy||!admin||!user)return;
  const files=[...$('#photos').files];const kept=(editing?.photo_paths||[]).filter(p=>!removedPaths.has(p));
  if(files.length+kept.length>MAX){feedback('#editMsg','Cada lembrança aceita até seis fotos no total.');return;}
  if(files.some(f=>!allowed.has(f.type)||f.size>MAX_FILE)){feedback('#editMsg','Selecione imagens JPG, PNG ou WebP de até 10 MB.');return;}
  busy=true;$('#saveBtn').disabled=true;let uploaded=[];
  try {
    uploaded=await uploadFiles(files);
    const payload={title:$('#title').value.trim(),story:$('#story').value.trim(),event_date:$('#date').value,photo_paths:[...kept,...uploaded]};
    if(!payload.title||!payload.story||!payload.event_date)throw Error('Preencha todos os campos.');
    const req=editing?supabase.from('album_memories').update(payload).eq('id',editing.id):supabase.from('album_memories').insert({...payload,created_by:user.id});
    const {error}=await req;
    if(error)throw error;
    if(removedPaths.size) {const {error:deleteError}=await supabase.storage.from(BUCKET).remove([...removedPaths]);if(deleteError)console.warn('Fotos antigas precisam de limpeza:',deleteError.message);}
    closeModal('editModal');await loadMemories();
  }catch(err){if(uploaded.length)await supabase.storage.from(BUCKET).remove(uploaded);feedback('#editMsg',err.message||'Não foi possível salvar.');console.error(err);}
  finally {busy=false;$('#saveBtn').disabled=false;}
});
async function deleteMemory(m){
  if(!admin||busy||!confirm(`Excluir definitivamente a lembrança "${m.title}"?`))return;
  busy=true;
  try{
    const {error}=await supabase.from('album_memories').delete().eq('id',m.id);if(error)throw error;
    if(m.photo_paths?.length){const res=await supabase.storage.from(BUCKET).remove(m.photo_paths);if(res.error)console.warn('Imagens não removidas:',res.error.message);}
    await loadMemories();
  }catch(e){alert('Não foi possível excluir: '+e.message);}finally{busy=false;}
}
$('#newBtn').addEventListener('click',()=>openEditor());
$('#loginBtn').addEventListener('click',async()=>{
  if(admin){if(confirm('Sair do painel de memórias?'))await supabase.auth.signOut();return;}
  feedback('#authMsg','');openModal('authModal');
});
$('#authForm').addEventListener('submit',async e=>{
  e.preventDefault();if(!configured)return;
  $('#authSubmit').disabled=true;feedback('#authMsg','Entrando...');
  const {error}=await supabase.auth.signInWithPassword({email:$('#email').value.trim(),password:$('#password').value});
  $('#authSubmit').disabled=false;
  if(error){feedback('#authMsg','Não foi possível entrar. Verifique e-mail e senha.');return;}
  await refreshAdmin();
  if(admin){$('#authForm').reset();closeModal('authModal');}
  else {feedback('#authMsg','Esta conta não tem permissão para editar o álbum.');await supabase.auth.signOut();}
});
document.addEventListener('click',e=>{
  const btn=e.target.closest('.photo-open');if(!btn)return;
  $('#bigImage').src=btn.dataset.src;$('#bigCaption').textContent=btn.dataset.caption||'';openModal('imageModal');
});
async function start(){
  if(!configured){$('#setup').hidden=false;$('#loginBtn').disabled=true;$('#loginBtn').title='Configure o Supabase para ativar o login';return;}
  supabase.auth.onAuthStateChange(()=>{setTimeout(()=>refreshAdmin(),0);});
  await refreshAdmin();await loadMemories();
}
start();
