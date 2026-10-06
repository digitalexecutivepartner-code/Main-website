// Floating AI chat widget injected on every public page (see src/site/layout.js).
import { CHAT_DEFAULTS, LEAD_TOKEN } from './config.js';

// Talks to POST /api/chat and renders the streamed answer. Texts come from Admin → Settings → AI chat.

const CSS = `
.dc-launch{position:fixed;right:20px;bottom:20px;z-index:90;display:flex;align-items:center;gap:10px;height:56px;padding:0 20px 0 16px;border:0;border-radius:999px;cursor:pointer;
  color:#04121a;font:600 15px/1 Inter,"Inter Fallback",system-ui,sans-serif;background:linear-gradient(135deg,var(--cyan,#22d3ee),var(--violet,#a855f7));
  box-shadow:0 10px 30px rgba(34,211,238,.28),0 2px 8px rgba(0,0,0,.4);transition:transform .2s,box-shadow .2s}
.dc-launch:hover{transform:translateY(-2px);box-shadow:0 14px 36px rgba(168,85,247,.35),0 2px 8px rgba(0,0,0,.4)}
.dc-launch:focus-visible,.dc button:focus-visible,.dc textarea:focus-visible,.dc a:focus-visible{outline:2px solid var(--cyan,#22d3ee);outline-offset:2px}
.dc-launch svg{flex:none}
.dc-launch .dc-dot{position:absolute;top:6px;right:8px;width:10px;height:10px;border-radius:50%;background:#34d399;border:2px solid #050818}
.dc-open .dc-launch{transform:scale(.9);opacity:0;pointer-events:none}
.dc{position:fixed;right:20px;bottom:20px;z-index:91;width:min(400px,calc(100vw - 40px));height:min(620px,calc(100dvh - 40px));display:flex;flex-direction:column;
  background:var(--bg2,#080d24);color:var(--text,#eaf0ff);border:1px solid var(--line,rgba(255,255,255,.09));border-radius:20px;overflow:hidden;
  box-shadow:0 24px 70px rgba(0,0,0,.55);font:400 15px/1.55 Inter,"Inter Fallback",system-ui,sans-serif;
  opacity:0;transform:translateY(16px) scale(.98);transform-origin:bottom right;pointer-events:none;visibility:hidden;transition:opacity .2s,transform .2s,visibility 0s .2s}
.dc-open .dc{opacity:1;transform:none;pointer-events:auto;visibility:visible;transition:opacity .2s,transform .2s}
.dc-head{display:flex;align-items:center;gap:12px;padding:14px 14px 14px 16px;background:linear-gradient(135deg,rgba(34,211,238,.14),rgba(168,85,247,.14));border-bottom:1px solid var(--line,rgba(255,255,255,.09))}
.dc-av{flex:none;width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:linear-gradient(135deg,var(--cyan,#22d3ee),var(--violet,#a855f7));color:#04121a}
.dc-ttl{flex:1;min-width:0}
.dc-ttl b{display:block;font-size:15px;font-weight:650}
.dc-ttl span{display:flex;align-items:center;gap:6px;white-space:nowrap;overflow:hidden;font-size:12.5px;color:var(--muted,#a1abd0)}
.dc-ttl span:before{content:"";width:7px;height:7px;border-radius:50%;background:#34d399}
.dc-ib{flex:none;width:34px;height:34px;border:0;border-radius:10px;background:transparent;color:var(--muted,#a1abd0);cursor:pointer;display:grid;place-items:center}
.dc-ib:hover{background:rgba(255,255,255,.07);color:var(--text,#eaf0ff)}
.dc-log{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;overscroll-behavior:contain;scrollbar-width:thin}
.dc-m{max-width:88%;padding:10px 13px;border-radius:16px;word-wrap:break-word;overflow-wrap:anywhere}
.dc-m p{margin:0 0 .5em}.dc-m p:last-child,.dc-m ul:last-child,.dc-m ol:last-child{margin-bottom:0}
.dc-m ul,.dc-m ol{margin:0 0 .5em;padding-left:1.2em}.dc-m li{margin:.15em 0}
.dc-m a{color:var(--cyan,#22d3ee);text-decoration:underline;text-underline-offset:2px}
.dc-bot{align-self:flex-start;background:var(--panel,#0d1433);border:1px solid var(--line,rgba(255,255,255,.09));border-bottom-left-radius:6px}
.dc-me{align-self:flex-end;background:linear-gradient(135deg,#1d4ed8,#7c3aed);color:#fff;border-bottom-right-radius:6px;white-space:pre-wrap}
.dc-err{align-self:center;max-width:95%;font-size:13.5px;color:#fecaca;background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.3);border-radius:12px;padding:8px 12px;text-align:center}
.dc-err a{color:#fff}
.dc-typing{display:inline-flex;gap:4px;padding:4px 0}.dc-typing i{width:7px;height:7px;border-radius:50%;background:var(--muted,#a1abd0);animation:dcb 1.2s infinite}
.dc-typing i:nth-child(2){animation-delay:.15s}.dc-typing i:nth-child(3){animation-delay:.3s}
@keyframes dcb{0%,60%,100%{opacity:.3;transform:none}30%{opacity:1;transform:translateY(-3px)}}
.dc-sug{display:flex;flex-wrap:wrap;gap:8px;padding:0 16px 10px}
.dc-sug[hidden]{display:none}
.dc-lead{align-self:stretch;background:linear-gradient(135deg,rgba(34,211,238,.08),rgba(168,85,247,.10));border:1px solid rgba(34,211,238,.35);border-radius:16px;padding:14px;display:grid;gap:9px}
.dc-lead b{font-size:14.5px}.dc-lead p{margin:0;font-size:13px;color:var(--muted,#a1abd0)}
.dc-lead input,.dc-lead textarea{width:100%;padding:9px 11px;border-radius:10px;border:1px solid var(--line,rgba(255,255,255,.14));background:var(--bg,#050818);color:var(--text,#eaf0ff);font:400 14px/1.4 inherit;font-family:inherit}
.dc-lead textarea{resize:vertical;min-height:58px}
.dc-lead input[aria-invalid=true]{border-color:#f87171}
.dc-lead .dc-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.dc-lead .dc-acts{display:flex;align-items:center;gap:12px}
.dc-lead .dc-go{border:0;border-radius:10px;padding:10px 14px;cursor:pointer;font:650 14px/1 inherit;font-family:inherit;color:#04121a;background:linear-gradient(135deg,var(--cyan,#22d3ee),var(--violet,#a855f7))}
.dc-lead .dc-go:disabled{opacity:.6;cursor:default}
.dc-lead .dc-skip{background:none;border:0;color:var(--muted,#a1abd0);font:500 13px/1 inherit;font-family:inherit;cursor:pointer;text-decoration:underline;text-underline-offset:2px}
.dc-lead .dc-msg{font-size:12.5px;color:#fca5a5}
.dc-lead.dc-done{border-color:rgba(52,211,153,.45);background:rgba(52,211,153,.08)}
.dc-hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
@media (max-width:380px){.dc-lead .dc-row{grid-template-columns:1fr}}
.dc *{box-sizing:border-box}.dc form,.dc div{margin:0}
.dc-sug button{border:1px solid rgba(34,211,238,.35);background:rgba(34,211,238,.08);color:var(--text,#eaf0ff);border-radius:999px;padding:7px 12px;font:500 13px/1.3 inherit;font-family:inherit;cursor:pointer;text-align:left}
.dc-sug button:hover{background:rgba(34,211,238,.16)}
.dc-form{display:flex;align-items:flex-end;gap:8px;padding:12px;border-top:1px solid var(--line,rgba(255,255,255,.09));background:var(--bg,#050818)}
.dc-form textarea{flex:1;resize:none;max-height:120px;min-height:44px;padding:11px 13px;border-radius:14px;border:1px solid var(--line,rgba(255,255,255,.12));background:var(--panel,#0d1433);color:var(--text,#eaf0ff);font:400 15px/1.45 inherit;font-family:inherit}
.dc-form textarea::placeholder{color:var(--dim,#7580a8)}
.dc-send{flex:none;width:44px;height:44px;border:0;border-radius:14px;cursor:pointer;display:grid;place-items:center;color:#04121a;background:linear-gradient(135deg,var(--cyan,#22d3ee),var(--violet,#a855f7))}
.dc-send:disabled{opacity:.45;cursor:default}
.dc-foot{display:flex;justify-content:space-between;gap:8px;padding:0 14px 10px;background:var(--bg,#050818);font-size:11.5px;color:var(--dim,#7580a8)}
.dc-foot a{color:var(--muted,#a1abd0)}
@media (max-width:520px){
  .dc{right:0;bottom:0;width:100vw;height:100dvh;border-radius:0;border:0}
  .dc-launch{right:14px;bottom:14px;padding:0;width:56px;justify-content:center}
  .dc-launch .dc-lbl{display:none}
  .dc-open{overflow:hidden}
}
@media (prefers-reduced-motion:reduce){.dc,.dc-launch{transition:none}.dc-typing i{animation:none}}
`;

const JS = `(function(){
  var cfgEl=document.getElementById('dc-config');if(!cfgEl)return;
  var C=JSON.parse(cfgEl.textContent),KEY='dep-chat-v1',root=document.documentElement;
  var launch=document.getElementById('dc-launch'),box=document.getElementById('dc'),log=box.querySelector('.dc-log'),
      form=box.querySelector('.dc-form'),ta=form.querySelector('textarea'),send=form.querySelector('.dc-send'),sug=box.querySelector('.dc-sug');
  var state={session:'',msgs:[]},busy=false;
  try{var s=JSON.parse(sessionStorage.getItem(KEY)||'null');if(s&&Array.isArray(s.msgs))state=s}catch(e){}
  if(!state.session)state.session=(Date.now().toString(36)+Math.random().toString(36).slice(2,10));
  var visitor='';try{visitor=localStorage.getItem('dep-chat-visitor')||'';if(!visitor){visitor='v'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);localStorage.setItem('dep-chat-visitor',visitor)}}catch(e){visitor=state.session}
  function save(){try{sessionStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}
  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function inline(s){
    s=esc(s);
    s=s.replace(/\\[([^\\]]+)\\]\\(((?:https?:\\/\\/|\\/|mailto:)[^\\s)]+)\\)/g,function(_,t,u){var ext=/^https?:/.test(u)&&u.indexOf(location.host)<0;return '<a href="'+u+'"'+(ext?' target="_blank" rel="noopener"':'')+'>'+t+'</a>'});
    s=s.replace(/(^|[\\s(])((?:https?:\\/\\/)[^\\s<)]+[^\\s<).,!?;:])/g,'$1<a href="$2" target="_blank" rel="noopener">$2</a>');
    s=s.replace(/\\*\\*([^*]+)\\*\\*/g,'<strong>$1</strong>').replace(/(^|[^*])\\*([^*\\s][^*]*)\\*/g,'$1<em>$2</em>').replace(/\`([^\`]+)\`/g,'<code>$1</code>');
    return s}
  function md(src){
    var out=[],list=null;
    String(src).replace(/\\r/g,'').split('\\n').forEach(function(l){
      var m=l.match(/^\\s*([-*•]|\\d+[.)])\\s+(.*)$/);
      if(m){var t=/\\d/.test(m[1])?'ol':'ul';if(!list||list.t!==t){if(list)out.push('</'+list.t+'>');list={t:t};out.push('<'+t+'>')}out.push('<li>'+inline(m[2])+'</li>');return}
      if(list){out.push('</'+list.t+'>');list=null}
      var h=l.replace(/^#{1,6}\\s+/,'');
      if(h.trim())out.push('<p>'+(h!==l?'<strong>'+inline(h)+'</strong>':inline(h))+'</p>')});
    if(list)out.push('</'+list.t+'>');
    return out.join('')}

  function visible(t){t=String(t).split(C.token).join('');var i=t.lastIndexOf('[[');if(i>-1&&t.indexOf(']]',i)<0)t=t.slice(0,i);return t.replace(/\\s+$/,'')}
  var L=C.lead,LKEY='dep-chat-lead';
  function saved(){try{return JSON.parse(localStorage.getItem(LKEY)||'null')}catch(e){return null}}
  function maybeLead(force){
    if(!L||log.querySelector('.dc-lead'))return;
    if(saved()){if(force)knownNote();return} // already left their details: never ask again
    var n=state.msgs.filter(function(m){return m.role==='assistant'}).length;
    if(force||(L.after>0&&n>=L.after&&!state.leadShown)){state.leadShown=true;save();showLead()}}
  function knownNote(){
    if(log.querySelector('.dc-known'))log.querySelector('.dc-known').remove();
    var me=saved()||{},d=document.createElement('div');d.className='dc-lead dc-done dc-known';
    d.innerHTML='<b>✓ We already have your details'+(me.name?' — '+esc(me.name):'')+(me.email?' · '+esc(me.email):'')+'</b><p>Our team will contact you soon. Anything else to add to your request? Just type it here.</p><div class="dc-acts"><button class="dc-skip" type="button">Update my details</button></div>';
    d.querySelector('.dc-skip').onclick=function(){d.remove();showLead()};log.appendChild(d);scroll()}
  function fill(t,v){return String(t||'').replace(/\\{\\{\\s*(\\w+)\\s*\\}\\}/g,function(m,k){return v[k]!=null?v[k]:m})}
  function showLead(){
    var old=log.querySelector('.dc-lead:not(.dc-done)');if(old){old.querySelector('input').focus();old.scrollIntoView({block:'nearest'});return}
    var me=saved()||{},lastQ='';for(var i=state.msgs.length-1;i>=0;i--)if(state.msgs[i].role==='user'){lastQ=state.msgs[i].content;break}
    var d=document.createElement('form');d.className='dc-lead';d.noValidate=true;d.setAttribute('aria-label',L.title);
    d.innerHTML='<b>'+esc(L.title)+'</b><p>'+esc(L.text)+'</p>'+
      '<div class="dc-row"><input name="name" autocomplete="name" placeholder="Your name *" aria-label="Your name" value="'+esc(me.name||'')+'">'+
      '<input name="email" type="email" autocomplete="email" placeholder="Email *" aria-label="Email" value="'+esc(me.email||'')+'"></div>'+
      (L.phone?'<input name="phone" type="tel" autocomplete="tel" placeholder="Phone / WhatsApp (optional)" aria-label="Phone (optional)" value="'+esc(me.phone||'')+'">':'')+
      '<textarea name="need" rows="2" maxlength="2000" placeholder="What do you need help with?" aria-label="What do you need help with?">'+esc(lastQ)+'</textarea>'+
      '<input class="dc-hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">'+
      '<div class="dc-acts"><button class="dc-go" type="submit">Send my details</button><button class="dc-skip" type="button">Not now</button></div><div class="dc-msg" role="alert"></div>';
    log.appendChild(d);scroll();
    d.querySelector('.dc-skip').onclick=function(){d.remove();ta.focus()};
    d.addEventListener('submit',function(e){
      e.preventDefault();
      var f={};['name','email','phone','need','website'].forEach(function(k){var el=d.elements[k];f[k]=el?el.value.trim():''});
      var msg=d.querySelector('.dc-msg'),bad=null;
      [['name',f.name.length<2],['email',!/^[^\\s@]+@[^\\s@]+\\.[a-z]{2,}$/i.test(f.email)]].forEach(function(x){var el=d.elements[x[0]];el.setAttribute('aria-invalid',x[1]?'true':'false');if(x[1]&&!bad)bad=el});
      if(bad){msg.textContent='Please enter your name and a valid email.';bad.focus();return}
      var go=d.querySelector('.dc-go');go.disabled=true;go.textContent='Sending…';msg.textContent='';
      fetch('/api/chat/lead',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:f.name,email:f.email,phone:f.phone,need:f.need,website:f.website,visitor:visitor,session:state.session,page:location.href,transcript:state.msgs.slice(-20)})})
        .then(function(r){return r.json().catch(function(){return{}}).then(function(j){if(!r.ok||!j.ok)throw new Error(j.error||'Could not send. Please try again.');return j})})
        .then(function(){
          try{localStorage.setItem(LKEY,JSON.stringify({name:f.name,email:f.email,phone:f.phone}))}catch(e){}
          d.className='dc-lead dc-done';d.innerHTML='<b>✓ '+esc(fill(L.thanks,{name:f.name.split(' ')[0],email:f.email}))+'</b>';
          state.msgs.push({role:'assistant',content:fill(L.thanks,{name:f.name.split(' ')[0],email:f.email})});save();scroll()})
        .catch(function(e){go.disabled=false;go.textContent='Send my details';msg.textContent=e.message})});
    setTimeout(function(){var first=d.querySelector('input:not([value]),input[value=""]');(first||d.querySelector('textarea')).focus({preventScroll:true});scroll()},50)}
  function bubble(role,text){var d=document.createElement('div');d.className='dc-m '+(role==='user'?'dc-me':'dc-bot');
    if(role==='user')d.textContent=text;else d.innerHTML=md(text);log.appendChild(d);scroll();return d}
  function scroll(){log.scrollTop=log.scrollHeight}
  function err(msg){var d=document.createElement('div');d.className='dc-err';d.setAttribute('role','alert');d.innerHTML=esc(msg)+(C.contact?' <a href="'+esc(C.contact)+'">'+esc(C.contactLabel)+'</a>':'');log.appendChild(d);scroll()}
  function render(){log.innerHTML='';bubble('assistant',C.greeting);state.msgs.forEach(function(m){bubble(m.role,m.content)});sug.hidden=state.msgs.length>0}
  function open(){root.classList.add('dc-open');box.setAttribute('aria-hidden','false');launch.setAttribute('aria-expanded','true');if(!log.childNodes.length)render();setTimeout(function(){ta.focus()},60);scroll()}
  function close(){root.classList.remove('dc-open');box.setAttribute('aria-hidden','true');launch.setAttribute('aria-expanded','false');launch.focus()}
  function grow(){ta.style.height='auto';ta.style.height=Math.min(ta.scrollHeight,120)+'px';send.disabled=busy||!ta.value.trim()}
  function ask(text){
    text=String(text||'').trim();if(!text||busy)return;
    busy=true;ta.value='';grow();sug.hidden=true;
    state.msgs.push({role:'user',content:text});save();bubble('user',text);
    var b=bubble('assistant','');b.innerHTML='<span class="dc-typing" aria-label="Typing"><i></i><i></i><i></i></span>';
    var answer='';
    fetch('/api/chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({messages:state.msgs.slice(-6),session:state.session,visitor:visitor,page:location.href,lead:saved()?{name:saved().name||''}:null})})
      .then(function(r){
        if(!r.ok)return r.json().catch(function(){return{}}).then(function(j){throw new Error(j.error||C.errorText)});
        var rd=r.body.getReader(),dec=new TextDecoder();
        var raf=0;function paint(){raf=0;b.innerHTML=md(visible(answer));scroll()}
        function pump(){return rd.read().then(function(x){if(x.done){if(raf)cancelAnimationFrame(raf);paint();return}answer+=dec.decode(x.value,{stream:true});if(!raf)raf=requestAnimationFrame(paint);return pump()})}
        return pump()})
      .then(function(){var want=answer.indexOf(C.token)>-1;answer=visible(answer);if(!answer.trim())throw new Error(C.errorText);state.msgs.push({role:'assistant',content:answer});save();maybeLead(want)})
      .catch(function(e){b.remove();state.msgs.pop();save();err(e&&e.message&&e.message!=='Failed to fetch'?e.message:C.errorText)})
      .finally(function(){busy=false;grow();ta.focus()})}
  var warmed=false;function warm(){if(warmed)return;warmed=true;fetch('/api/chat',{method:'GET',cache:'no-store'}).catch(function(){})}
  launch.addEventListener('pointerenter',warm);launch.addEventListener('focus',warm);launch.addEventListener('touchstart',warm,{passive:true});
  launch.addEventListener('click',function(){warm();open()});
  box.querySelector('.dc-close').addEventListener('click',close);
  var cb=box.querySelector('.dc-contact');if(cb)cb.addEventListener('click',function(){if(!log.childNodes.length)render();showLead()});
  box.querySelector('.dc-reset').addEventListener('click',function(){if(busy)return;state={session:state.session,msgs:[]};save();render();ta.focus()});
  sug.addEventListener('click',function(e){var t=e.target.closest('button');if(t)ask(t.textContent)});
  form.addEventListener('submit',function(e){e.preventDefault();ask(ta.value)});
  ta.addEventListener('input',grow);
  ta.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();ask(ta.value)}});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&root.classList.contains('dc-open'))close()});
  if(state.msgs.length&&C.reopen)open();
  grow();
})();`;

export { CHAT_DEFAULTS };

const esc = (s = '') => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const lines = (v) => (Array.isArray(v) ? v : String(v ?? '').split('\n')).map((s) => String(s).trim()).filter(Boolean);


export function chatWidget(settings = {}) {
  const c = { ...CHAT_DEFAULTS, ...Object.fromEntries(Object.entries(settings.chat || {}).filter(([, v]) => v !== '' && v != null)) };
  if (c.enabled === false) return '';
  const cfg = {
    greeting: c.greeting,
    contact: '/contact', contactLabel: 'Contact the team →',
    errorText: 'Sorry, I could not answer right now. Please try again or use the contact form.',
    reopen: false,
    token: LEAD_TOKEN,
    lead: c.lead_enabled === false ? null : {
      after: Number(c.lead_after) || 0, phone: c.lead_phone !== false,
      title: c.lead_title, text: c.lead_text, thanks: c.lead_thanks,
    },
  };
  const sug = lines(c.suggestions).slice(0, 4).map((s) => `<button type="button">${esc(s)}</button>`).join('');
  const bot = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>`;
  return `<style>${CSS}</style>
<button id="dc-launch" class="dc-launch" type="button" aria-controls="dc" aria-expanded="false" aria-label="${esc(c.button)}"><span class="dc-dot" aria-hidden="true"></span>${bot}<span class="dc-lbl">${esc(c.button)}</span></button>
<div id="dc" class="dc" role="dialog" aria-modal="false" aria-label="${esc(c.title)}" aria-hidden="true">
  <div class="dc-head">
    <div class="dc-av" aria-hidden="true">${bot}</div>
    <div class="dc-ttl"><b>${esc(c.title)}</b><span>${esc(c.subtitle)}</span></div>
${c.lead_enabled === false ? '' : `<button class="dc-ib dc-contact" type="button" aria-label="Leave your contact details" title="Leave your contact details"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg></button>`}
    <button class="dc-ib dc-reset" type="button" aria-label="New conversation" title="New conversation"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg></button>
    <button class="dc-ib dc-close" type="button" aria-label="Close chat" title="Close"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
  </div>
  <div class="dc-log" aria-live="polite"></div>
  <div class="dc-sug">${sug}</div>
  <form class="dc-form" autocomplete="off">
    <label class="sr-only" for="dc-input" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Your message</label>
    <textarea id="dc-input" rows="1" maxlength="1500" placeholder="Type your question…"></textarea>
    <button class="dc-send" type="submit" aria-label="Send" disabled><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
  </form>
  <div class="dc-foot"><span>AI answers may be imperfect.</span><a href="/contact">Talk to a person</a></div>
</div>
<script type="application/json" id="dc-config">${JSON.stringify(cfg).replace(/</g, '\\u003c')}</script>
<script>${JS}</script>`;
}
