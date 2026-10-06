// Admin HTML: login screen and the single-page admin app.
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const BASE_CSS = `
@font-face{font-family:Inter;src:url(/assets/inter-var-latin.woff2) format("woff2");font-weight:100 900;font-display:swap}
:root{--bg:#060918;--bg2:#0a0f26;--panel:#0e1532;--panel2:#131c40;--line:rgba(255,255,255,.09);--line2:rgba(255,255,255,.16);--text:#e9eeff;--muted:#9ba5cb;--dim:#6f7aa3;--cyan:#22d3ee;--violet:#a855f7;--ok:#34d399;--warn:#fbbf24;--bad:#f87171}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Inter,system-ui,sans-serif;background:var(--bg);color:var(--text);font-size:14px;line-height:1.5;-webkit-font-smoothing:antialiased}
a{color:inherit}
button,input,select,textarea{font:inherit;color:inherit}
:focus-visible{outline:2px solid var(--cyan);outline-offset:2px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:38px;padding:0 14px;border-radius:10px;border:1px solid var(--line2);background:rgba(255,255,255,.04);font-weight:600;cursor:pointer;text-decoration:none;white-space:nowrap;transition:background .15s,border-color .15s}
.btn:hover{background:rgba(255,255,255,.09)}
.btn.primary{background:linear-gradient(135deg,#0e9ab5,#7c3aed);border-color:transparent;color:#fff}
.btn.primary:hover{filter:brightness(1.08)}
.btn.danger{color:#fecaca;border-color:rgba(248,113,113,.35)}
.btn.danger:hover{background:rgba(248,113,113,.12)}
.btn.sm{height:30px;padding:0 10px;font-size:13px;border-radius:8px}
.btn.icon{width:30px;flex:0 0 30px;padding:0}
.btn[disabled]{opacity:.5;cursor:not-allowed}
input[type=text],input[type=url],input[type=password],input[type=datetime-local],select,textarea{width:100%;background:rgba(255,255,255,.04);border:1px solid var(--line2);border-radius:9px;padding:9px 11px;min-height:38px;transition:border-color .15s,box-shadow .15s}
textarea{resize:vertical;line-height:1.5}
textarea.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:13px}
input:focus,select:focus,textarea:focus{outline:none;border-color:var(--cyan);box-shadow:0 0 0 3px rgba(34,211,238,.18)}
select option{background:#0e1532}
label.f{display:grid;gap:6px;font-size:12.5px;font-weight:600;color:#c9d1f0}
label.f .hint{font-weight:500;color:var(--dim)}
.chk{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:#c9d1f0;cursor:pointer}
.chk input{width:16px;height:16px;accent-color:#22d3ee}
`;

export function loginHtml(error = '') {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Sign in · DEP CMS</title><link rel="icon" href="/favicon.ico"><style>${BASE_CSS}
body{min-height:100vh;display:grid;place-items:center;padding:20px;background:radial-gradient(600px 400px at 20% 10%,rgba(34,211,238,.15),transparent 60%),radial-gradient(600px 400px at 85% 90%,rgba(168,85,247,.18),transparent 60%),var(--bg)}
.box{width:100%;max-width:380px;background:var(--panel);border:1px solid var(--line);border-radius:20px;padding:32px;display:grid;gap:18px;box-shadow:0 30px 80px -30px rgba(0,0,0,.7)}
.brand{display:flex;align-items:center;gap:10px;font-weight:800;font-size:16px}.brand img{width:40px;height:40px;border-radius:10px}
h1{font-size:22px}.sub{color:var(--muted);margin-top:-10px}.err{background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.3);color:#fecaca;border-radius:10px;padding:10px 12px}
.btn{height:44px}
</style></head><body>
<form class="box" method="post" action="/admin/login">
  <div class="brand"><img src="/assets/logo-96.webp" alt="">DEP CMS</div>
  <h1>Sign in</h1><p class="sub">Manage pages, posts and SEO for your website.</p>
  ${error ? `<div class="err" role="alert">${esc(error)}</div>` : ''}
  <label class="f">Admin password<input type="password" name="password" autocomplete="current-password" required autofocus></label>
  <button class="btn primary" type="submit">Sign in</button>
</form></body></html>`;
}

export function appHtml(schemas) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>DEP CMS</title><link rel="icon" href="/favicon.ico"><style>${BASE_CSS}${APP_CSS}</style></head>
<body>
<header class="top">
  <a class="brand" href="#/pages"><img src="/assets/logo-96.webp" alt=""><span>DEP CMS</span></a>
  <nav><a href="#/pages" data-nav="pages">Pages</a><a href="#/posts" data-nav="posts">Blog posts</a><a href="#/media" data-nav="media">Media</a><a href="#/inbox" data-nav="inbox">Inbox<span class="nb" id="nbInbox" hidden></span></a><a href="#/seo" data-nav="seo">SEO Agent<span class="nb" id="nbSeo" hidden></span></a><a href="#/settings" data-nav="settings">Settings</a></nav>
  <div class="right"><a class="btn sm" href="/" target="_blank" rel="noopener">View site ↗</a><button class="btn sm" type="button" id="clearCache" title="Show the latest content on every page right away">⟳ Clear cache</button><a class="btn sm" href="/admin/logout">Sign out</a></div>
</header>
<main id="app" class="app"><div class="loading">Loading…</div></main>
<div id="toast" class="toast" role="status" aria-live="polite"></div>
<div id="modal" class="modal" hidden></div>
<script>window.CMS=${JSON.stringify(schemas).replace(/</g, '\\u003c')};</script>
<script>${APP_JS}</script>
</body></html>`;
}

const APP_CSS = `
.top{position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:24px;height:60px;padding:0 20px;background:rgba(6,9,24,.88);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.top .brand{display:flex;align-items:center;gap:10px;font-weight:800;text-decoration:none}.top .brand img{width:32px;height:32px;border-radius:8px}
.top nav{display:flex;gap:4px}.top nav a{padding:8px 12px;border-radius:8px;text-decoration:none;color:var(--muted);font-weight:600}
.top nav a:hover{color:var(--text);background:rgba(255,255,255,.05)}.top nav a.on{color:var(--text);background:rgba(34,211,238,.12)}
.top .right{margin-left:auto;display:flex;gap:8px}
.app{max-width:1320px;margin:0 auto;padding:28px 20px 80px}
.loading{color:var(--muted);padding:40px;text-align:center}
.head{display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin-bottom:20px}.head h1{font-size:24px;margin-right:auto}
.card{background:var(--panel);border:1px solid var(--line);border-radius:16px}
table.list{width:100%;border-collapse:collapse}
.list th{text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--dim);padding:12px 16px;border-bottom:1px solid var(--line)}
.list td{padding:13px 16px;border-bottom:1px solid var(--line);vertical-align:middle}
.list tr:last-child td{border-bottom:0}.list tr:hover td{background:rgba(255,255,255,.02)}
.list .t a{font-weight:700;text-decoration:none}.list .t a:hover{color:var(--cyan)}.list .path{color:var(--dim);font-size:12.5px;font-family:ui-monospace,Menlo,monospace}
.list .acts{display:flex;gap:6px;justify-content:flex-end}
.pill{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:700;padding:3px 9px;border-radius:999px}
.pill.published{background:rgba(52,211,153,.14);color:var(--ok)}.pill.draft{background:rgba(251,191,36,.14);color:var(--warn)}
.score{display:inline-grid;place-items:center;min-width:42px;height:24px;border-radius:999px;font-size:12px;font-weight:800}
.score.g{background:rgba(52,211,153,.15);color:var(--ok)}.score.m{background:rgba(251,191,36,.15);color:var(--warn)}.score.b{background:rgba(248,113,113,.15);color:var(--bad)}
.empty{padding:40px;text-align:center;color:var(--muted)}
/* editor */
.ed-top{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:-10px 0 18px;padding:10px 0;position:sticky;top:60px;z-index:15;background:rgba(6,9,24,.92);backdrop-filter:blur(10px)}
.ed-top .back{color:var(--muted);text-decoration:none;font-weight:600;margin-right:6px}.ed-top .back:hover{color:var(--text)}
.ed-top .grow{flex:1}
.dirty{font-size:12.5px;color:var(--warn);font-weight:600}
.ed{display:grid;grid-template-columns:minmax(0,1fr) 380px;gap:22px;align-items:start}
.ed .side{position:sticky;top:132px;display:grid;gap:16px;max-height:calc(100vh - 150px);overflow:auto;padding-bottom:20px}
.title-in{font-size:24px!important;font-weight:800;padding:12px 14px!important;margin-bottom:16px}
.panel{padding:18px;display:grid;gap:14px}.panel h3{font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}
.slugrow{display:flex;align-items:center;border:1px solid var(--line2);border-radius:9px;overflow:hidden;background:rgba(255,255,255,.04)}
.slugrow span{padding:0 4px 0 11px;color:var(--dim);font-family:ui-monospace,Menlo,monospace;font-size:12.5px;white-space:nowrap}
.slugrow input{border:0!important;box-shadow:none!important;background:none!important;padding-left:0!important;font-family:ui-monospace,Menlo,monospace;font-size:13px}
.blocks{display:grid;gap:12px}
.blk{background:var(--panel);border:1px solid var(--line);border-radius:14px;overflow:hidden}
.blk.hidden-blk{opacity:.55}
.blk-h{display:flex;align-items:center;gap:10px;padding:10px 12px;cursor:pointer;user-select:none}
.blk-h:hover{background:rgba(255,255,255,.03)}
.blk-h .ty{font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;padding:3px 8px;border-radius:6px;background:rgba(34,211,238,.12);color:var(--cyan);white-space:nowrap}
.blk-h .sum{flex:1;min-width:0;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.blk-h .tools{display:flex;gap:4px}
.blk-b{padding:6px 16px 18px;display:grid;grid-template-columns:minmax(0,1fr);gap:14px;border-top:1px solid var(--line)}
.grp{border:1px solid var(--line);border-radius:12px;padding:12px;display:grid;gap:12px;background:rgba(255,255,255,.015)}
.grp>legend{font-size:12.5px;font-weight:700;color:#c9d1f0;padding:0 6px}
.lst{display:grid;grid-template-columns:minmax(0,1fr);gap:8px}
.lst-h{display:flex;align-items:center;justify-content:space-between;font-size:12.5px;font-weight:700;color:#c9d1f0}
.item{border:1px solid var(--line);border-radius:10px;background:rgba(255,255,255,.02)}
.item-h{display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:pointer}
.item-h .n{font-size:11px;color:var(--dim);font-weight:700;min-width:18px}
.item-h .sum{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:600}
.item-b{padding:4px 12px 12px;display:grid;grid-template-columns:minmax(0,1fr);gap:12px;border-top:1px solid var(--line)}
.imgf{display:grid;grid-template-columns:1fr 56px;gap:8px;align-items:center}
.imgf .th{width:56px;height:40px;border-radius:8px;border:1px solid var(--line2);background:#0a0f26 center/contain no-repeat}
.addbar{display:flex;gap:8px;margin-top:14px}
.addbar select{max-width:260px}
.cnt{float:right;font-weight:700}.cnt.ok{color:var(--ok)}.cnt.warn{color:var(--warn)}.cnt.bad{color:var(--bad)}
.gprev{background:#fff;color:#202124;border-radius:12px;padding:14px 16px;font-family:Arial,sans-serif}
.gprev .u{font-size:12.5px;color:#4d5156;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gprev .t{font-size:18px;color:#1a0dab;line-height:1.3;margin:4px 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.gprev .d{font-size:13.5px;color:#4d5156;line-height:1.45;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.checks{list-style:none;display:grid;gap:7px}
.checks li{display:flex;gap:8px;font-size:13px;color:#cdd5f3}
.checks li b{flex:0 0 18px;height:18px;border-radius:50%;display:grid;place-items:center;font-size:11px}
.checks li.ok b{background:rgba(52,211,153,.18);color:var(--ok)}.checks li.no b{background:rgba(251,191,36,.18);color:var(--warn)}
.toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%) translateY(20px);opacity:0;background:#141c40;border:1px solid var(--line2);padding:11px 16px;border-radius:12px;font-weight:600;transition:all .2s;pointer-events:none;z-index:60;max-width:90vw}
.toast.show{opacity:1;transform:translateX(-50%)}.toast.err{border-color:rgba(248,113,113,.5);color:#fecaca}
.modal{position:fixed;inset:0;z-index:50;background:rgba(2,4,12,.7);display:grid;place-items:center;padding:20px}
.modal[hidden]{display:none}
.modal .box{width:100%;max-width:480px;background:var(--panel);border:1px solid var(--line2);border-radius:18px;padding:24px;display:grid;gap:16px;max-height:85vh;overflow:auto}
.modal h2{font-size:19px}.modal .row{display:flex;justify-content:flex-end;gap:8px}
.rev{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 0;border-bottom:1px solid var(--line)}
[hidden]{display:none!important}
.st-h1{font-size:22px}
.st{display:grid;grid-template-columns:236px minmax(0,1fr);gap:28px;align-items:start}
.st-nav{position:sticky;top:136px;display:grid;gap:2px}
.st-nav button{position:relative;display:grid;gap:1px;text-align:left;background:none;border:0;border-radius:10px;padding:9px 28px 9px 12px;cursor:pointer}
.st-nav button b{font-size:13.5px;font-weight:600;color:#c9d1f0}
.st-nav button span{font-size:12px;color:var(--dim)}
.st-nav button:hover{background:rgba(255,255,255,.04)}
.st-nav button.on{background:rgba(34,211,238,.1);box-shadow:inset 3px 0 0 var(--cyan)}
.st-nav button.on b{color:#fff}
.st-nav .dot{position:absolute;right:12px;top:15px;width:7px;height:7px;border-radius:50%;background:var(--warn)}
.st-main{display:grid;gap:16px;max-width:880px;min-width:0}
.st-title h2{font-size:20px;font-weight:800}.st-title p{color:var(--muted);margin-top:2px}
.sc{padding:20px 22px;display:grid;gap:16px}
.sc-h{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.sc-h h3{font-size:15px;font-weight:700}.sc-h p{color:var(--muted);font-size:13px;margin-top:3px}
.fgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 18px}
.fgrid>.full{grid-column:1/-1}
.fgrid>.fc{min-width:0}
.sub{border-top:1px solid var(--line);padding-top:16px;display:grid;gap:12px}
.sub h4{font-size:13px;font-weight:700;color:#c9d1f0}
.sr{display:grid;grid-template-columns:130px minmax(0,1fr);gap:12px;padding:9px 0;border-top:1px solid var(--line);font-size:13.5px}
.sr:first-child{border-top:0;padding-top:0}
.sr>span{color:var(--dim);font-weight:600}
.okc{color:var(--ok)!important}.badc{color:var(--bad)!important}.muted{color:var(--muted)}
.presets,.phs{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.presets>span,.phs>span{font-size:12.5px;font-weight:600;color:var(--dim);margin-right:4px}
.chip{height:30px;padding:0 12px;border-radius:999px;border:1px solid var(--line2);background:rgba(255,255,255,.03);font-size:12.5px;font-weight:600;cursor:pointer}
.chip:hover{border-color:rgba(34,211,238,.5)}.chip.on{background:rgba(34,211,238,.14);border-color:rgba(34,211,238,.55);color:#fff}
.chip.mono{font-family:ui-monospace,Menlo,monospace;font-size:12px;font-weight:500;height:26px;padding:0 9px}
.cl{border-top:1px solid var(--line)}.cl:first-child{border-top:0}
.cl summary{display:grid;grid-template-columns:minmax(150px,220px) minmax(0,1fr) auto;gap:14px;align-items:center;padding:12px 4px;cursor:pointer;list-style:none}
.cl summary::-webkit-details-marker{display:none}.cl summary:hover{background:rgba(255,255,255,.03)}
.cl-who{display:grid;gap:2px;min-width:0}.cl-who b{font-size:13.5px}.cl-who span{font-size:12px;color:var(--dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cl-last{font-size:13px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cl-n{font-size:12px;color:var(--dim);text-align:right;white-space:nowrap}
.cl-body{display:grid;gap:8px;padding:4px 4px 16px}
.cl-sep{font-size:11.5px;font-weight:700;color:var(--dim);text-transform:uppercase;letter-spacing:.04em;margin-top:6px}
.cl-q,.cl-a{max-width:85%;padding:9px 12px;border-radius:12px;font-size:13.5px;line-height:1.5;white-space:pre-wrap}
.cl-q{justify-self:end;background:rgba(124,58,237,.25);border:1px solid rgba(168,85,247,.35)}
.cl-a{justify-self:start;background:var(--panel2,rgba(255,255,255,.04));border:1px solid var(--line);color:#cdd5f3}
.cl-badge{display:inline-block;font-size:10.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;padding:2px 7px;border-radius:999px;background:rgba(52,211,153,.18);color:var(--ok);margin-right:7px;vertical-align:1px}
.cl.has-lead summary{background:rgba(52,211,153,.04)}
.cl-lead{border:1px solid rgba(52,211,153,.35);background:rgba(52,211,153,.07);border-radius:12px;padding:10px 12px;display:grid;gap:4px;font-size:13.5px}
.cl-lead b{font-size:12px;color:var(--ok)}.cl-lead a{color:var(--cyan)}.cl-need{white-space:pre-wrap;color:#cdd5f3}
.cl-pager{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-top:12px;border-top:1px solid var(--line);font-size:12.5px;color:var(--dim)}
@media (max-width:700px){.cl summary{grid-template-columns:1fr auto}.cl-last{display:none}}
.pwbox{border:1px solid rgba(34,211,238,.28);background:rgba(34,211,238,.04);border-radius:14px;padding:16px;display:grid;gap:12px}
.pw-h{display:flex;align-items:center;gap:10px}
.badge{font-size:11.5px;font-weight:700;padding:3px 9px;border-radius:999px;background:rgba(255,255,255,.08);color:var(--muted)}
.badge.ok{background:rgba(52,211,153,.15);color:var(--ok)}.badge.bad{background:rgba(248,113,113,.15);color:var(--bad)}
.pw-row,.testrow{display:flex;gap:8px;flex-wrap:wrap}
.pw-row input{flex:1;min-width:200px;font-family:ui-monospace,Menlo,monospace;letter-spacing:.04em}
.testrow input{flex:1;min-width:200px}
.pw-acts{display:flex;align-items:center;flex-wrap:wrap;gap:10px}
.pwbox p.hint,.pw-acts .hint{font-size:12.5px;color:var(--dim)}
.help{font-size:13px;color:#cdd5f3}.help summary{cursor:pointer;font-weight:600;color:var(--cyan)}
.help ol{margin:10px 0 8px 20px;display:grid;gap:6px}.help a{color:var(--cyan)}
.help code{font-family:ui-monospace,Menlo,monospace;font-size:12px;background:rgba(255,255,255,.07);padding:1px 6px;border-radius:5px}
.seg{display:inline-flex;gap:4px;padding:4px;border:1px solid var(--line);border-radius:12px;background:var(--panel);justify-self:start;flex-wrap:wrap}
.seg button{border:0;background:none;padding:7px 14px;border-radius:9px;font-weight:600;cursor:pointer;color:var(--muted)}
.seg button.on{background:rgba(34,211,238,.14);color:#fff}
@media(max-width:900px){.st{grid-template-columns:minmax(0,1fr);gap:16px}.st-nav{position:static;display:flex;overflow-x:auto;gap:6px;scrollbar-width:none;padding-bottom:2px}.st-nav button{display:block;white-space:nowrap;padding:8px 12px;border:1px solid var(--line);flex:0 0 auto}.st-nav button span{display:none}.st-nav button.on{box-shadow:none;border-color:rgba(34,211,238,.5)}.st-nav .dot{position:static;display:inline-block;margin-left:6px;vertical-align:middle}}
@media(max-width:640px){.fgrid{grid-template-columns:minmax(0,1fr)}.sc{padding:16px}.sr{grid-template-columns:minmax(0,1fr);gap:2px}.st-h1{font-size:18px}}
.imgbtns{display:flex;gap:6px;margin-top:-4px}
.imgf.drag input{outline:2px dashed var(--cyan);outline-offset:2px}
.mgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}
.mtile{border:1px solid var(--line);border-radius:12px;overflow:hidden;background:var(--panel);display:grid;text-align:left;cursor:pointer;transition:border-color .15s,transform .15s;padding:0}
.mtile:hover{border-color:rgba(34,211,238,.5);transform:translateY(-2px)}
.mtile img{width:100%;aspect-ratio:4/3;object-fit:contain;background:#070b1f;display:block}
.mtile .mm{padding:8px 10px;display:grid;gap:2px;font-size:12px;min-width:0}
.mtile .mm b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12.5px}
.mtile .mm span{color:var(--dim)}
.mtile .ma{display:flex;gap:6px;padding:0 10px 10px}
.modal .box.wide{max-width:960px}
.dropzone{border:2px dashed var(--line2);border-radius:14px;padding:22px;text-align:center;color:var(--muted)}
.dropzone.drag{border-color:var(--cyan);background:rgba(34,211,238,.06)}
@media(max-width:1060px){.ed{grid-template-columns:minmax(0,1fr)}.ed .side{position:static;max-height:none}}
@media(max-width:640px){.top{gap:8px;padding:0 10px}.top nav{overflow-x:auto;scrollbar-width:none}.top nav a{padding:6px 8px;white-space:nowrap;font-size:13px}.top .brand span{display:none}.list .path,.list .hide-sm{display:none}.list td,.list th{padding:11px 10px}.list .acts .btn+.btn{display:none}.top .right .btn:first-child{display:none}.app{padding:18px 12px 60px}.blk-h{flex-wrap:wrap}.blk-h .sum{order:3;flex-basis:100%}.blk-h .tools{margin-left:auto}.blk-b{padding:6px 12px 14px}.ed-top .btn.sm{padding:0 8px}.title-in{font-size:20px!important}}
/* inbox */
.nb{display:inline-grid;place-items:center;min-width:18px;height:18px;padding:0 5px;margin-left:6px;border-radius:999px;background:var(--cyan);color:#04121a;font-size:11px;font-weight:800;vertical-align:1px}
.ib-bar{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:14px}
.ib-tabs{display:flex;flex-wrap:wrap;gap:6px;margin-right:auto}
.ib-tabs button{height:32px;padding:0 12px;border-radius:999px;border:1px solid var(--line2);background:none;color:var(--muted);font-weight:600;cursor:pointer;font-size:13px}
.ib-tabs button:hover{color:var(--text)}.ib-tabs button.on{background:rgba(34,211,238,.12);border-color:rgba(34,211,238,.5);color:var(--text)}
.ib-tabs button i{font-style:normal;color:var(--dim);margin-left:5px;font-size:12px}
.ib-search{width:260px!important}
.ib-bulk{display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:10px 14px;border-bottom:1px solid var(--line);font-size:13px;color:var(--muted)}
.ib-list td{cursor:pointer}.ib-list td.ck{cursor:default;width:36px}
.ib-list tr.unread td{background:rgba(34,211,238,.04)}.ib-list tr.unread .who b::before{content:"";display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--cyan);margin-right:7px;vertical-align:2px}
.ib-list .who b{display:block;font-weight:700}.ib-list .who span{color:var(--dim);font-size:12.5px}
.ib-list .msg{color:var(--muted);max-width:420px}.ib-list .msg div{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ib-list .msg small{color:var(--dim)}
.ib-list .when{white-space:nowrap;color:var(--muted);font-size:12.5px}
.ib-list input[type=checkbox],.ib-bulk input[type=checkbox]{width:16px;height:16px;accent-color:#22d3ee;cursor:pointer}
.pill.new{background:rgba(34,211,238,.14);color:var(--cyan)}.pill.read{background:rgba(255,255,255,.08);color:var(--muted)}.pill.replied{background:rgba(52,211,153,.14);color:var(--ok)}.pill.archived{background:rgba(255,255,255,.05);color:var(--dim)}.pill.spam{background:rgba(248,113,113,.14);color:var(--bad)}
.ib-d{display:grid;gap:14px}
.ib-d .hd{display:flex;align-items:flex-start;gap:12px}.ib-d .hd a{color:var(--cyan);text-decoration:none;font-weight:600}
.ib-d .msgbox{white-space:pre-wrap;line-height:1.6;background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:12px;padding:14px 16px;font-size:14px;max-height:40vh;overflow:auto}
.ib-d .acts{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.ib-d .acts .grow{flex:1}
@media(max-width:700px){.ib-search{width:100%!important}.ib-list .msg,.ib-list .hide-sm{display:none}}
/* seo agent */
.seo-strip{display:flex;flex-wrap:wrap;gap:8px 18px;margin:-6px 0 16px;font-size:13px}
.ib-tabs a{display:inline-flex;align-items:center;height:32px;padding:0 12px;border-radius:999px;border:1px solid var(--line2);color:var(--muted);font-weight:600;font-size:13px;text-decoration:none}
.ib-tabs a:hover{color:var(--text)}.ib-tabs a.on{background:rgba(34,211,238,.12);border-color:rgba(34,211,238,.5);color:var(--text)}
.ib-list .msg small a{color:var(--cyan);text-decoration:none}
.pill.sp-drafted{background:rgba(168,85,247,.16);color:#d8b4fe}
.pill.sp-published{background:rgba(52,211,153,.14);color:var(--ok)}.pill.sp-rejected{background:rgba(255,255,255,.05);color:var(--dim)}.pill.sp-failed{background:rgba(248,113,113,.14);color:var(--bad)}
.seo-set{padding:20px;display:grid;gap:16px;max-width:780px}.seo-3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
@media(max-width:700px){.seo-3{grid-template-columns:minmax(0,1fr)}}
.modal .box.pr{max-width:1240px;height:90vh;max-height:90vh;grid-template-rows:auto minmax(0,1fr) auto}
.pr-grid{display:grid;grid-template-columns:340px minmax(0,1fr);gap:16px;min-height:0}
.pr-side{display:grid;gap:12px;align-content:start;overflow:auto;min-height:0}
.pr-card{border:1px solid var(--line);border-radius:12px;padding:12px 14px;background:rgba(255,255,255,.02)}.pr-card.bad{border-color:rgba(248,113,113,.4)}
.pr-lbl{font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--dim);margin-bottom:8px}
.serp{background:#fff;border-radius:8px;padding:12px 14px;font-family:Arial,sans-serif}.serp .su{color:#202124;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.serp .st{color:#1a0dab;font-size:18px;line-height:1.3;margin:4px 0}.serp .sd{color:#4d5156;font-size:13px;line-height:1.5}
.pr-checks{list-style:none;display:grid;gap:5px;font-size:13px}.pr-checks li.ok{color:var(--ok)}.pr-checks li.no{color:var(--warn)}
.pr-frame{width:100%;height:100%;min-height:300px;border:1px solid var(--line);border-radius:12px;background:#fff}
.seo-set+.seo-set{margin-top:16px}.ap.on{border-color:rgba(52,211,153,.45);background:linear-gradient(135deg,rgba(52,211,153,.06),transparent)}.ap-h{display:flex;flex-wrap:wrap;gap:16px;align-items:center;justify-content:space-between}.ap-h h3{font-size:18px;display:flex;gap:10px;align-items:center;margin-bottom:6px}.ap-h p{font-size:13px;max-width:560px}.ap-b{display:flex;gap:8px;flex-wrap:wrap}.gsc-up{display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:14px;border:1px dashed var(--line2);border-radius:12px}.gsc-up.inline{padding:0;border:0}.gsc-up.over{border-color:var(--cyan);background:rgba(34,211,238,.06)}
.gsc-steps{margin:8px 0 0 18px;display:grid;gap:4px;color:var(--muted);line-height:1.6}.gsc-steps a{color:var(--cyan)}#gscCard code{font-size:12.5px;background:rgba(255,255,255,.06);padding:2px 6px;border-radius:6px}
@media(max-width:900px){.modal .box.pr{height:auto}.pr-grid{grid-template-columns:minmax(0,1fr)}.pr-frame{height:60vh}}
`;

const APP_JS = String.raw`
(function(){
var S = window.CMS, BL = S.BLOCKS;
var app = document.getElementById('app'), toastEl = document.getElementById('toast'), modal = document.getElementById('modal');
var state = { view: null, page: null, settings: null, dirty: false, open: {} };

function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function toast(msg, err){ toastEl.textContent = msg; toastEl.className = 'toast show' + (err ? ' err' : ''); clearTimeout(toast.t); toast.t = setTimeout(function(){ toastEl.className = 'toast'; }, err ? 5000 : 2500); }
function api(method, url, body){
  return fetch('/admin/api/' + url, { method: method, headers: body ? { 'content-type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined, credentials: 'same-origin' })
    .then(function(r){ return r.json().catch(function(){ return {}; }).then(function(d){ if (r.status === 401) { location.reload(); } if (!r.ok) throw new Error(d.error || ('Error ' + r.status)); return d; }); });
}
function pathFor(p){ return p.type === 'home' ? '/' : p.type === 'post' ? '/blog/' + p.slug : '/' + p.slug; }
function fmt(d){ if (!d) return ''; var x = new Date(d); return x.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + x.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }); }
function get(obj, path){ return path.split('.').reduce(function(o, k){ return o == null ? undefined : o[k]; }, obj); }
function set(obj, path, val){
  var ks = path.split('.'), o = obj;
  for (var i = 0; i < ks.length - 1; i++){ var k = ks[i]; if (o[k] == null || typeof o[k] !== 'object') o[k] = /^\d+$/.test(ks[i+1]) ? [] : {}; o = o[k]; }
  o[ks[ks.length - 1]] = val;
}
function clone(x){ return JSON.parse(JSON.stringify(x)); }
function linesOf(v){ return (Array.isArray(v) ? v : String(v || '').split('\n')).map(function(s){ return String(s).trim(); }).filter(Boolean); }
document.getElementById('clearCache').onclick = function(){
  var btn = this; if (btn.disabled) return;
  if (!confirm('Clear the page cache? Every page will be rebuilt from the latest content. Visitors will not notice anything.')) return;
  btn.disabled = true; btn.textContent = '⟳ Clearing…';
  api('POST', 'cache/clear').then(function(r){ toast('Cache cleared ✓ ' + r.pages + ' pages are being rebuilt'); })
    .catch(function(e){ toast(e.message, true); })
    .then(function(){ btn.disabled = false; btn.textContent = '⟳ Clear cache'; });
};

/* ---------- SEO scoring ---------- */
function seoInfo(p, settings, lite){
  var site = (settings && settings.site) || {}, seo = p.seo || {};
  var title = seo.title || (p.type === 'home' ? site.name : (p.title + (site.title_suffix || '')));
  var firstLead = ''; (p.blocks || []).some(function(b){ var d = b.data || {}; firstLead = d.lead || d.body || ''; return !!firstLead; });
  var desc = seo.description || p.excerpt || String(firstLead).replace(/[#*_>\[\]()]/g, '').slice(0, 158);
  var words = 0, missingAlt = 0;
  (function walk(o){ if (!o || typeof o !== 'object') return; if (o.src && !o.alt) missingAlt++; Object.keys(o).forEach(function(k){ var v = o[k]; if (typeof v === 'string' && !/^(https?:|\/|#|mailto:)/.test(v) && k !== 'src' && k !== 'src_large' && k !== 'logo') words += v.split(/\s+/).filter(Boolean).length; else if (typeof v === 'object') walk(v); }); })(p.blocks);
  var checks = [
    { ok: (seo.title || '').length >= 30 && (seo.title || '').length <= 60, t: 'Meta title is 30–60 characters' },
    { ok: (seo.description || '').length >= 70 && (seo.description || '').length <= 160, t: 'Meta description is 70–160 characters' },
    { ok: !!(seo.og_image || p.cover_image || site.default_og_image), t: 'Has a social share image' },
    { ok: missingAlt === 0, t: missingAlt ? missingAlt + ' image(s) missing alt text' : 'All images have alt text' },
    { ok: words >= (p.type === 'home' ? 300 : 300), t: 'Content length: ' + words + ' words (aim for 300+)' },
    { ok: p.type === 'home' || (p.slug || '').length <= 60, t: 'Short, readable URL' },
    { ok: !(seo.noindex && p.status === 'published'), t: seo.noindex ? 'Hidden from Google (noindex is on)' : 'Visible to Google' },
  ];
  if (lite) checks = checks.filter(function(c, i){ return i !== 3 && i !== 4; });
  var score = Math.round(100 * checks.filter(function(c){ return c.ok; }).length / checks.length);
  return { title: title, desc: desc, checks: checks, score: score };
}
function scoreBadge(n){ return '<span class="score ' + (n >= 85 ? 'g' : n >= 60 ? 'm' : 'b') + '">' + n + '</span>'; }

/* ---------- form builder ---------- */
function summaryOf(v, key){ var s = v && (v[key] || v.title || v.heading || v.name || v.q || v.label || v.body); return String(s || '').replace(/\s+/g, ' ').slice(0, 90); }
function field(f, val, path){
  var id = 'f_' + path.replace(/\./g, '_');
  var label = '<span>' + esc(f.label || f.key) + (f.max ? '<span class="cnt" data-cnt="' + path + '" data-max="' + f.max + '"></span>' : '') + '</span>' + (f.hint ? '<span class="hint">' + esc(f.hint) + '</span>' : '');
  switch (f.type) {
    case 'text': case 'url':
      return '<label class="f" for="' + id + '">' + label + '<input id="' + id + '" type="text" data-path="' + path + '" value="' + esc(val) + '"' + (f.type === 'url' ? ' placeholder="https://… or /page or #section"' : '') + '></label>';
    case 'image':
      return '<div class="f-img"><label class="f" for="' + id + '">' + label + '<div class="imgf" data-drop="' + path + '"><input id="' + id + '" type="text" data-path="' + path + '" data-img value="' + esc(val) + '" placeholder="Upload, pick from the library, or paste a URL"><span class="th" style="background-image:url(\'' + esc(val || '') + '\')"></span></div></label>' +
        '<div class="imgbtns"><button type="button" class="btn sm" data-act="upload" data-path="' + path + '">⬆ Upload</button><button type="button" class="btn sm" data-act="library" data-path="' + path + '">🖼 Library</button>' + (val ? '<button type="button" class="btn sm" data-act="clearimg" data-path="' + path + '">Remove</button>' : '') + '</div></div>';
    case 'textarea':
      return '<label class="f" for="' + id + '">' + label + '<textarea id="' + id + '" rows="3" data-path="' + path + '">' + esc(val) + '</textarea></label>';
    case 'markdown':
      return '<label class="f" for="' + id + '">' + label + '<textarea id="' + id + '" class="mono" rows="' + (path === 'chat.instructions' ? 20 : path === 'chat.capabilities' ? 16 : path.indexOf('json_ld') > -1 || path.indexOf('_txt') > -1 ? 8 : 10) + '" data-path="' + path + '">' + esc(val) + '</textarea></label>';
    case 'lines':
      return '<label class="f" for="' + id + '">' + label + '<textarea id="' + id + '" rows="4" data-path="' + path + '">' + esc(Array.isArray(val) ? val.join('\n') : val) + '</textarea></label>';
    case 'select':
      return '<label class="f" for="' + id + '">' + label + '<select id="' + id + '" data-path="' + path + '">' + (f.options || []).map(function(o){ return '<option' + (String(val) === String(o) ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select></label>';
    case 'boolean':
      return '<label class="chk"><input type="checkbox" data-path="' + path + '"' + (val ? ' checked' : '') + '>' + esc(f.label) + '</label>';
    case 'group':
      return '<fieldset class="grp"><legend>' + esc(f.label) + '</legend>' + f.fields.map(function(sf){ return field(sf, (val || {})[sf.key], path + '.' + sf.key); }).join('') + '</fieldset>';
    case 'list':
      var items = Array.isArray(val) ? val : [];
      return '<div class="lst"><div class="lst-h"><span>' + esc(f.label) + ' (' + items.length + ')</span><button type="button" class="btn sm" data-act="add" data-path="' + path + '">+ Add</button></div>' +
        items.map(function(it, i){
          var p = path + '.' + i, open = state.open[p];
          return '<div class="item"><div class="item-h" data-toggle="' + p + '"><span class="n">' + (i + 1) + '</span><span class="sum">' + esc(summaryOf(it, f.item) || '(empty)') + '</span>' +
            '<button type="button" class="btn sm icon" data-act="up" data-path="' + path + '" data-i="' + i + '" title="Move up">↑</button><button type="button" class="btn sm icon" data-act="down" data-path="' + path + '" data-i="' + i + '" title="Move down">↓</button><button type="button" class="btn sm icon" data-act="dup" data-path="' + path + '" data-i="' + i + '" title="Duplicate">⧉</button><button type="button" class="btn sm icon danger" data-act="del" data-path="' + path + '" data-i="' + i + '" title="Remove">✕</button></div>' +
            (open ? '<div class="item-b">' + f.fields.map(function(sf){ return field(sf, it[sf.key], p + '.' + sf.key); }).join('') + '</div>' : '') + '</div>';
        }).join('') + '</div>';
  }
  return '';
}
function schemaAt(path){
  // find field definition for a list path (used when adding items)
  var ks = path.split('.'), fields, i = 0;
  if (state.view === 'settings') { fields = S.SETTINGS_FIELDS; }
  else { if (ks[0] === 'blocks') { var b = state.page.blocks[+ks[1]]; fields = BL[b.type].fields; i = 3; } }
  var f = null;
  for (; i < ks.length; i++){
    if (/^\d+$/.test(ks[i])) { fields = f.fields; continue; }
    f = (fields || []).filter(function(x){ return x.key === ks[i]; })[0];
    if (!f) return null;
    if (f.type === 'group') fields = f.fields;
  }
  return f;
}
function blank(fields){ var o = {}; (fields || []).forEach(function(f){ o[f.key] = f.type === 'list' ? [] : f.type === 'group' ? blank(f.fields) : f.type === 'boolean' ? false : f.type === 'select' ? (f.options || [''])[0] : ''; }); return o; }
function root(){ return state.view === 'settings' ? state.settings : state.page; }

/* ---------- views ---------- */
function nav(v){ document.querySelectorAll('[data-nav]').forEach(function(a){ a.classList.toggle('on', a.getAttribute('data-nav') === v); }); }

function viewList(type){
  state.view = 'list'; nav(type === 'post' ? 'posts' : 'pages');
  app.innerHTML = '<div class="loading">Loading…</div>';
  Promise.all([api('GET', 'pages'), state.settings ? Promise.resolve(state.settings) : api('GET', 'settings')]).then(function(r){
    state.settings = r[1];
    var rows = r[0].filter(function(p){ return type === 'post' ? p.type === 'post' : p.type !== 'post'; });
    app.innerHTML = '<div class="head"><h1>' + (type === 'post' ? 'Blog posts' : 'Pages') + '</h1><button class="btn primary" id="new">+ New ' + (type === 'post' ? 'post' : 'page') + '</button></div>' +
      '<div class="card">' + (rows.length ? '<table class="list"><thead><tr><th>Title</th><th>Status</th><th class="hide-sm">SEO</th><th class="hide-sm">Updated</th><th></th></tr></thead><tbody>' + rows.map(function(p){
        var info = seoInfo(Object.assign({ blocks: [] }, p), state.settings, true);
        return '<tr><td class="t"><a href="#/edit/' + p.id + '">' + esc(p.title) + '</a><div class="path">' + esc(pathFor(p)) + '</div></td><td><span class="pill ' + p.status + '">' + (p.status === 'published' ? 'Published' : 'Draft') + '</span></td><td class="hide-sm">' + scoreBadge(info.score) + '</td><td class="hide-sm" style="color:var(--muted)">' + fmt(p.updated_at) + '</td><td><div class="acts"><a class="btn sm" href="#/edit/' + p.id + '">Edit</a>' + (p.status === 'published' ? '<a class="btn sm" href="' + pathFor(p) + '" target="_blank" rel="noopener">View ↗</a>' : '<a class="btn sm" href="/admin/preview/' + p.id + '" target="_blank" rel="noopener">Preview ↗</a>') + '</div></td></tr>';
      }).join('') + '</tbody></table>' : '<div class="empty">Nothing here yet. Create your first ' + (type === 'post' ? 'post' : 'page') + '.</div>') + '</div>' +
      (type !== 'post' ? '<p style="color:var(--dim);margin-top:12px;font-size:13px">The SEO score in this list only checks title, description and URL. Open a page to see the full checklist.</p>' : '');
    document.getElementById('new').onclick = function(){ newDialog(type || 'page'); };
  }).catch(function(e){ app.innerHTML = '<div class="empty">' + esc(e.message) + '</div>'; });
}

function newDialog(type){
  modal.innerHTML = '<form class="box" id="nf"><h2>New ' + (type === 'post' ? 'blog post' : 'page') + '</h2>' +
    '<label class="f">Title<input type="text" name="title" required autofocus placeholder="' + (type === 'post' ? 'How to sync Shopify with Zoho CRM' : 'Zoho Consulting') + '"></label>' +
    '<label class="f">URL <span class="hint">' + (type === 'post' ? 'digitalexecutivepartner.app/blog/…' : 'digitalexecutivepartner.app/… (use services/name for service pages)') + '</span><input type="text" name="slug" placeholder="generated from the title"></label>' +
    '<div class="row"><button type="button" class="btn" id="nc">Cancel</button><button class="btn primary">Create</button></div></form>';
  modal.hidden = false;
  var f = document.getElementById('nf');
  f.title.focus();
  document.getElementById('nc').onclick = function(){ modal.hidden = true; };
  f.onsubmit = function(e){ e.preventDefault(); api('POST', 'pages', { type: type, title: f.title.value, slug: f.slug.value }).then(function(p){ modal.hidden = true; location.hash = '#/edit/' + p.id; }).catch(function(err){ toast(err.message, true); }); };
}

function viewEdit(id){
  state.view = 'edit'; state.open = {};
  app.innerHTML = '<div class="loading">Loading…</div>';
  Promise.all([api('GET', 'pages/' + id), state.settings ? Promise.resolve(state.settings) : api('GET', 'settings')]).then(function(r){
    state.page = r[0]; state.settings = r[1]; state.dirty = false;
    nav(state.page.type === 'post' ? 'posts' : 'pages');
    renderEditor();
  }).catch(function(e){ app.innerHTML = '<div class="empty">' + esc(e.message) + '</div>'; });
}

function renderEditor(){
  var p = state.page, isHome = p.type === 'home';
  var prefix = p.type === 'post' ? '/blog/' : '/';
  var blocksHtml = (p.blocks || []).map(function(b, i){
    var def = BL[b.type] || { label: b.type, fields: [] }, path = 'blocks.' + i, open = state.open[path];
    return '<div class="blk' + (b.hidden ? ' hidden-blk' : '') + '"><div class="blk-h" data-toggle="' + path + '"><span class="ty">' + esc(def.label) + '</span><span class="sum">' + esc(summaryOf(b.data, def.summary)) + (b.hidden ? ' · hidden' : '') + '</span><span class="tools">' +
      '<button type="button" class="btn sm icon" data-act="up" data-path="blocks" data-i="' + i + '" title="Move up">↑</button><button type="button" class="btn sm icon" data-act="down" data-path="blocks" data-i="' + i + '" title="Move down">↓</button><button type="button" class="btn sm icon" data-act="hide" data-i="' + i + '" title="' + (b.hidden ? 'Show' : 'Hide') + ' section">' + (b.hidden ? '◌' : '◉') + '</button><button type="button" class="btn sm icon" data-act="dup" data-path="blocks" data-i="' + i + '" title="Duplicate">⧉</button><button type="button" class="btn sm icon danger" data-act="del" data-path="blocks" data-i="' + i + '" title="Delete section">✕</button></span></div>' +
      (open ? '<div class="blk-b">' + def.fields.map(function(f){ return field(f, (b.data || {})[f.key], path + '.data.' + f.key); }).join('') + '</div>' : '') + '</div>';
  }).join('');
  var addOpts = Object.keys(BL).map(function(k){ return '<option value="' + k + '">' + esc(BL[k].label) + '</option>'; }).join('');
  app.innerHTML =
    '<div class="ed-top"><a class="back" href="#/' + (p.type === 'post' ? 'posts' : 'pages') + '">← All ' + (p.type === 'post' ? 'posts' : 'pages') + '</a><span class="pill ' + p.status + '">' + (p.status === 'published' ? 'Published' : 'Draft') + '</span><span class="grow"></span><span class="dirty" id="dirty"></span>' +
    '<button class="btn sm" id="hist">History</button><button class="btn sm" id="prev">Preview ↗</button>' + (p.status === 'published' ? '<a class="btn sm" href="' + pathFor(p) + '" target="_blank" rel="noopener">View live ↗</a>' : '') + '<button class="btn primary" id="save">Save</button></div>' +
    '<div class="ed"><div>' +
      '<input type="text" class="title-in" data-path="title" value="' + esc(p.title) + '" aria-label="Page title" placeholder="Page title">' +
      '<div class="blocks" id="blocks">' + (blocksHtml || '<div class="card empty">No sections yet. Add one below.</div>') + '</div>' +
      '<div class="addbar"><select id="addType">' + addOpts + '</select><button class="btn" id="addBlk">+ Add section</button></div>' +
    '</div><aside class="side">' +
      '<div class="card panel"><h3>Publish</h3>' +
        (isHome ? '<p style="color:var(--muted)">The home page is always published at <b>/</b>.</p>' :
        '<label class="f">Status<select data-path="status"><option value="draft"' + (p.status === 'draft' ? ' selected' : '') + '>Draft (hidden)</option><option value="published"' + (p.status === 'published' ? ' selected' : '') + '>Published (live)</option></select></label>' +
        '<label class="f">URL<div class="slugrow"><span>' + prefix + '</span><input type="text" data-path="slug" value="' + esc(p.slug) + '"></div></label>') +
        '<label class="f">Short summary <span class="hint">used on blog cards and as a fallback description</span><textarea rows="3" data-path="excerpt">' + esc(p.excerpt) + '</textarea></label>' +
        (p.type === 'post' ? field({ type: 'image', label: 'Cover image' }, p.cover_image, 'cover_image') : '') +
        (!isHome ? '<button class="btn sm danger" id="del" style="justify-self:start">Delete ' + (p.type === 'post' ? 'post' : 'page') + '</button>' : '') +
      '</div>' +
      '<div class="card panel" id="seoPanel"></div>' +
    '</aside></div>';
  renderSeo();
  bindEditor();
  markDirty(state.dirty);
}

function renderSeo(){
  var p = state.page, info = seoInfo(p, state.settings), site = state.settings.site || {};
  var url = (site.url || '') + pathFor(p);
  var el = document.getElementById('seoPanel');
  var fieldsHtml = S.SEO_FIELDS.map(function(f){ return field(f, (p.seo || {})[f.key], 'seo.' + f.key); }).join('');
  if (!el.dataset.built) {
    el.innerHTML = '<h3>SEO ' + '<span id="seoScore"></span></h3><div class="gprev" id="gprev"></div><ul class="checks" id="seoChecks"></ul>' + fieldsHtml;
    el.dataset.built = '1';
  }
  document.getElementById('seoScore').innerHTML = scoreBadge(info.score);
  document.getElementById('gprev').innerHTML = '<div class="u">' + esc(url.replace(/^https?:\/\//, '')) + '</div><div class="t">' + esc(info.title) + '</div><div class="d">' + esc(info.desc) + '</div>';
  document.getElementById('seoChecks').innerHTML = info.checks.map(function(c){ return '<li class="' + (c.ok ? 'ok' : 'no') + '"><b>' + (c.ok ? '✓' : '!') + '</b>' + esc(c.t) + '</li>'; }).join('');
  updateCounters();
}
function updateCounters(){
  document.querySelectorAll('[data-cnt]').forEach(function(c){
    var v = String(get(root(), c.getAttribute('data-cnt')) || ''), max = +c.getAttribute('data-max'), n = v.length;
    c.textContent = n + '/' + max; c.className = 'cnt ' + (n === 0 ? 'bad' : n > max ? 'bad' : n < max * 0.5 ? 'warn' : 'ok');
  });
}
function markDirty(d){ state.dirty = d; var el = document.getElementById('dirty'); if (el) el.textContent = d ? 'Unsaved changes' : ''; }

function bindForm(container, onChange){
  container.addEventListener('input', function(e){
    var t = e.target, path = t.getAttribute && t.getAttribute('data-path'); if (!path) return;
    var def = null, val = t.type === 'checkbox' ? t.checked : t.value;
    set(root(), path, val);
    if (t.hasAttribute('data-img')) {
      var th = t.parentNode.querySelector('.th'); if (th) th.style.backgroundImage = "url('" + t.value.replace(/'/g, '') + "')";
      if (/\.src$/.test(path) && t.value) { var im = new Image(); im.onload = function(){ var base = path.replace(/\.src$/, ''); if (get(root(), path) === t.value) { set(root(), base + '.width', im.naturalWidth); set(root(), base + '.height', im.naturalHeight); } }; im.src = t.value; }
    }
    onChange(path);
  });
  container.addEventListener('change', function(e){ var t = e.target; if (t.type === 'checkbox' || t.tagName === 'SELECT') { set(root(), t.getAttribute('data-path'), t.type === 'checkbox' ? t.checked : t.value); onChange(t.getAttribute('data-path'), true); } });
  container.addEventListener('click', function(e){
    var b = e.target.closest('[data-act]');
    if (b) {
      e.stopPropagation();
      var act = b.getAttribute('data-act'), path = b.getAttribute('data-path'), i = +b.getAttribute('data-i');
      if (act === 'upload') return pickFiles(false, function(files){ uploadFile(files[0], path); });
      if (act === 'library') return openLibrary(path);
      if (act === 'clearimg') { applyMedia(path, null); return; }
      if (act === 'hide') { var blk = state.page.blocks[i]; blk.hidden = !blk.hidden; onChange('blocks', true); return rerender(); }
      var arr = get(root(), path); if (!Array.isArray(arr)) { arr = []; set(root(), path, arr); }
      if (act === 'add') { var f = schemaAt(path); arr.push(blank(f && f.fields)); state.open[path + '.' + (arr.length - 1)] = true; }
      if (act === 'del') { if (path === 'blocks' && !confirm('Delete this section?')) return; arr.splice(i, 1); }
      if (act === 'dup') { arr.splice(i + 1, 0, clone(arr[i])); }
      if (act === 'up' && i > 0) { var x = arr[i]; arr[i] = arr[i - 1]; arr[i - 1] = x; }
      if (act === 'down' && i < arr.length - 1) { var y = arr[i]; arr[i] = arr[i + 1]; arr[i + 1] = y; }
      if (act !== 'add') { Object.keys(state.open).forEach(function(k){ if (k.indexOf(path + '.') === 0) delete state.open[k]; }); }
      onChange(path, true); return rerender();
    }
    var tg = e.target.closest('[data-toggle]');
    if (tg && !e.target.closest('input,select,textarea')) { var k = tg.getAttribute('data-toggle'); state.open[k] = !state.open[k]; rerender(); }
  });
}
function bindDrop(container){
  container.addEventListener('dragover', function(e){ var z = e.target.closest && e.target.closest('[data-drop]'); if (!z) return; e.preventDefault(); z.classList.add('drag'); });
  container.addEventListener('dragleave', function(e){ var z = e.target.closest && e.target.closest('[data-drop]'); if (z) z.classList.remove('drag'); });
  container.addEventListener('drop', function(e){ var z = e.target.closest && e.target.closest('[data-drop]'); if (!z) return; e.preventDefault(); z.classList.remove('drag'); var f = e.dataTransfer.files && e.dataTransfer.files[0]; if (f) uploadFile(f, z.getAttribute('data-drop')); });
}

/* ---------- media: convert in the browser, upload to R2 ---------- */
function pickFiles(multiple, cb){
  var i = document.createElement('input'); i.type = 'file'; i.accept = 'image/jpeg,image/png,image/webp,image/gif,image/avif'; i.multiple = !!multiple;
  i.onchange = function(){ if (i.files.length) cb([].slice.call(i.files)); }; i.click();
}
function loadImage(file){
  return new Promise(function(res, rej){ var u = URL.createObjectURL(file), im = new Image(); im.onload = function(){ res(im); }; im.onerror = function(){ rej(new Error('This file could not be read as an image.')); }; im.src = u; });
}
function encode(im, maxW, srcType){
  var w = im.naturalWidth, h = im.naturalHeight, scale = Math.min(1, maxW / w), cw = Math.round(w * scale), ch = Math.round(h * scale);
  var c = document.createElement('canvas'); c.width = cw; c.height = ch;
  var ctx = c.getContext('2d'); ctx.imageSmoothingQuality = 'high'; ctx.drawImage(im, 0, 0, cw, ch);
  return new Promise(function(res){
    c.toBlob(function(b){
      if (b && b.type === 'image/webp') return res({ blob: b, w: cw, h: ch, resized: scale < 1 });
      c.toBlob(function(b2){ res({ blob: b2, w: cw, h: ch, resized: scale < 1 }); }, srcType === 'image/png' ? 'image/png' : 'image/jpeg', 0.86);
    }, 'image/webp', 0.82);
  });
}
function prepare(file, twoSizes){
  if (/svg/.test(file.type)) return Promise.reject(new Error('SVG files are not allowed. Use PNG or WebP instead.'));
  return loadImage(file).then(function(im){
    var w = im.naturalWidth, h = im.naturalHeight;
    if (file.type === 'image/gif') return { small: { blob: file, w: w, h: h } };   // keep animation
    var smallMax = twoSizes ? 1000 : 1600;
    return encode(im, smallMax, file.type).then(function(small){
      if (!small.resized && small.blob.size > file.size && /jpeg|webp/.test(file.type)) small = { blob: file, w: w, h: h };
      if (!twoSizes || w <= smallMax * 1.25) return { small: small };
      return encode(im, 2000, file.type).then(function(large){ return { small: small, large: large }; });
    });
  });
}
function upload(file, twoSizes){
  return prepare(file, twoSizes).then(function(v){
    var fd = new FormData(), name = file.name.replace(/\.[^.]+$/, '');
    fd.append('name', name); fd.append('file', v.small.blob, name); fd.append('width', v.small.w); fd.append('height', v.small.h);
    if (v.large) { fd.append('large', v.large.blob, name + '-2x'); fd.append('width_large', v.large.w); fd.append('height_large', v.large.h); }
    return fetch('/admin/api/media', { method: 'POST', body: fd, credentials: 'same-origin' }).then(function(r){ return r.json().then(function(d){ if (r.status === 401) location.reload(); if (!r.ok) throw new Error(d.error || 'Upload failed'); return d; }); });
  });
}
function uploadFile(file, path){
  toast('Uploading ' + file.name + '…');
  upload(file, /\.src$/.test(path)).then(function(item){ applyMedia(path, item); toast('Uploaded ✓ ' + Math.round(item.size / 1024) + ' KB'); }).catch(function(e){ toast(e.message, true); });
}
function humanize(n){ n = String(n || '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim(); return n.charAt(0).toUpperCase() + n.slice(1); }
function applyMedia(path, item){
  set(root(), path, item ? item.url : '');
  if (/\.src$/.test(path)) {
    var base = path.replace(/\.src$/, '');
    set(root(), base + '.width', item ? item.width : ''); set(root(), base + '.height', item ? item.height : '');
    set(root(), base + '.src_large', item && item.large ? item.large : '');
    set(root(), base + '.width_large', item && item.large ? item.width_large : ''); set(root(), base + '.height_large', item && item.large ? item.height_large : '');
    if (item && !get(root(), base + '.alt')) set(root(), base + '.alt', humanize(item.name));
  }
  markDirty(true); rerender();
}
function mediaGrid(items, picking){
  if (!items.length) return '<p style="color:var(--muted)">No images yet. Upload your first one.</p>';
  return '<div class="mgrid">' + items.map(function(m, i){
    return '<div class="mtile" data-mi="' + i + '"' + (picking ? ' role="button" tabindex="0" title="Use this image"' : '') + '><img src="' + esc(m.url) + '" alt="" loading="lazy"><div class="mm"><b>' + esc(m.name) + '</b><span>' + (m.width ? m.width + '×' + m.height + ' · ' : '') + Math.round(m.size / 1024) + ' KB' + (m.large ? ' · +2x' : '') + '</span></div>' +
      '<div class="ma"><button type="button" class="btn sm" data-copy="' + i + '">Copy URL</button><button type="button" class="btn sm danger" data-mdel="' + i + '">Delete</button></div></div>';
  }).join('') + '</div>';
}
function bindGrid(el, items, onPick, refresh){
  el.onclick = function(e){
    var c = e.target.closest('[data-copy]'), d = e.target.closest('[data-mdel]'), t = e.target.closest('[data-mi]');
    if (c) { var it = items[+c.getAttribute('data-copy')]; (navigator.clipboard ? navigator.clipboard.writeText(location.origin + it.url) : Promise.reject()).then(function(){ toast('URL copied'); }, function(){ prompt('Image URL', location.origin + it.url); }); return; }
    if (d) { var m = items[+d.getAttribute('data-mdel')]; if (!confirm('Delete "' + m.name + '"? Pages that use this image will show a broken image.')) return; api('DELETE', 'media/' + encodeURIComponent(m.key)).then(function(){ toast('Deleted'); refresh(); }).catch(function(err){ toast(err.message, true); }); return; }
    if (t && onPick) onPick(items[+t.getAttribute('data-mi')]);
  };
}
function uploadMany(files, done){
  var n = 0; toast('Uploading ' + files.length + ' image(s)…');
  files.reduce(function(p, f){ return p.then(function(){ return upload(f, true).then(function(){ n++; }); }); }, Promise.resolve())
    .then(function(){ toast(n + ' image(s) uploaded ✓'); done(); }).catch(function(e){ toast(e.message, true); done(); });
}
function openLibrary(path){
  modal.innerHTML = '<div class="box wide"><div style="display:flex;align-items:center;gap:10px"><h2 style="margin-right:auto">Choose an image</h2><button class="btn sm primary" id="mlUp">⬆ Upload</button><button class="btn sm" id="mlClose">Close</button></div><div id="mlGrid"><div class="loading">Loading…</div></div></div>';
  modal.hidden = false;
  document.getElementById('mlClose').onclick = function(){ modal.hidden = true; };
  function load(){ api('GET', 'media').then(function(r){ var g = document.getElementById('mlGrid'); g.innerHTML = mediaGrid(r.items, true); bindGrid(g, r.items, function(item){ modal.hidden = true; applyMedia(path, item); }, load); }).catch(function(e){ document.getElementById('mlGrid').innerHTML = '<p style="color:#fecaca">' + esc(e.message) + '</p>'; }); }
  document.getElementById('mlUp').onclick = function(){ pickFiles(false, function(files){ modal.hidden = true; uploadFile(files[0], path); }); };
  load();
}
function viewMedia(){
  state.view = 'media'; nav('media');
  app.innerHTML = '<div class="head"><h1>Media</h1><button class="btn primary" id="mUp">⬆ Upload images</button></div>' +
    '<div class="dropzone" id="mDrop">Drag images here, or use the Upload button. JPG/PNG are converted to WebP automatically (a normal and a high-resolution version).</div><div id="mGrid" style="margin-top:18px"><div class="loading">Loading…</div></div>';
  function load(){ api('GET', 'media').then(function(r){ var g = document.getElementById('mGrid'); if (!g) return; g.innerHTML = mediaGrid(r.items, false); bindGrid(g, r.items, null, load); }).catch(function(e){ var g = document.getElementById('mGrid'); if (g) g.innerHTML = '<div class="card empty">' + esc(e.message) + '</div>'; }); }
  document.getElementById('mUp').onclick = function(){ pickFiles(true, function(files){ uploadMany(files, load); }); };
  var dz = document.getElementById('mDrop');
  dz.ondragover = function(e){ e.preventDefault(); dz.classList.add('drag'); };
  dz.ondragleave = function(){ dz.classList.remove('drag'); };
  dz.ondrop = function(e){ e.preventDefault(); dz.classList.remove('drag'); var fs = [].slice.call(e.dataTransfer.files || []).filter(function(f){ return /^image\//.test(f.type); }); if (fs.length) uploadMany(fs, load); };
  load();
}

function rerender(){ var y = window.scrollY; if (state.view === 'settings') renderSettings(); else renderEditor(); window.scrollTo(0, y); }

function bindEditor(){
  if (!app._bound) { app._bound = true; bindDrop(app); bindForm(app, function(path, structural){ markDirty(true); if (/^(seo|title|slug|excerpt|status|cover_image)/.test(path) || structural) renderSeo(); else { clearTimeout(bindEditor.t); bindEditor.t = setTimeout(renderSeo, 400); } }); }
  document.getElementById('save').onclick = save;
  document.getElementById('addBlk').onclick = function(){
    var t = document.getElementById('addType').value; state.page.blocks = state.page.blocks || [];
    state.page.blocks.push({ type: t, data: blank(BL[t].fields) }); state.open['blocks.' + (state.page.blocks.length - 1)] = true; markDirty(true); rerender();
  };
  document.getElementById('prev').onclick = function(){
    var f = document.createElement('form'); f.method = 'post'; f.action = '/admin/preview'; f.target = '_blank';
    var i = document.createElement('input'); i.type = 'hidden'; i.name = 'payload'; i.value = JSON.stringify(state.page); f.appendChild(i); document.body.appendChild(f); f.submit(); f.remove();
  };
  document.getElementById('hist').onclick = showHistory;
  var d = document.getElementById('del');
  if (d) d.onclick = function(){ if (!confirm('Delete "' + state.page.title + '"? This cannot be undone.')) return; api('DELETE', 'pages/' + state.page.id).then(function(){ state.dirty = false; toast('Deleted'); location.hash = state.page.type === 'post' ? '#/posts' : '#/pages'; }).catch(function(e){ toast(e.message, true); }); };
}

function save(){
  var btn = document.getElementById('save'); if (!btn || btn.disabled) return;
  btn.disabled = true; btn.textContent = 'Saving…';
  var p = state.page;
  api('PUT', 'pages/' + p.id, { title: p.title, slug: p.slug, excerpt: p.excerpt, cover_image: p.cover_image, status: p.status, blocks: p.blocks, seo: p.seo || {} })
    .then(function(res){ state.page = res; state.dirty = false; toast(res.status === 'published' ? 'Saved — live on the site' : 'Saved as draft'); rerender(); })
    .catch(function(e){ toast(e.message, true); btn.disabled = false; btn.textContent = 'Save'; });
}

function showHistory(){
  api('GET', 'pages/' + state.page.id + '/revisions').then(function(list){
    modal.innerHTML = '<div class="box"><h2>Version history</h2>' + (list.length ? list.map(function(r){ return '<div class="rev"><div><b>' + esc(fmt(r.created_at)) + '</b><div style="color:var(--muted);font-size:12.5px">' + esc(r.title) + ' · ' + esc(r.status) + '</div></div><button class="btn sm" data-rev="' + r.id + '">Restore</button></div>'; }).join('') : '<p style="color:var(--muted)">No earlier versions yet. A version is kept every time you save.</p>') + '<div class="row"><button class="btn" id="hc">Close</button></div></div>';
    modal.hidden = false;
    document.getElementById('hc').onclick = function(){ modal.hidden = true; };
    modal.querySelectorAll('[data-rev]').forEach(function(b){ b.onclick = function(){
      api('GET', 'pages/' + state.page.id + '/revisions/' + b.getAttribute('data-rev')).then(function(snap){
        ['title','slug','excerpt','cover_image','status','blocks','seo'].forEach(function(k){ state.page[k] = snap[k]; });
        modal.hidden = true; state.open = {}; markDirty(true); rerender(); toast('Older version loaded. Click Save to keep it.');
      }).catch(function(e){ toast(e.message, true); });
    }; });
  }).catch(function(e){ toast(e.message, true); });
}

/* ---------- settings ---------- */
var PH = ['name', 'first_name', 'email', 'company', 'service', 'budget', 'site_name'];
var WIDE = { textarea: 1, markdown: 1, lines: 1, list: 1, group: 1, image: 1, boolean: 1 };
var PRESETS = {
  gmail: { label: 'Gmail / Google Workspace', host: 'smtp.gmail.com', port: '465' },
  zoho: { label: 'Zoho Mail', host: 'smtp.zoho.com', port: '465' },
  outlook: { label: 'Outlook / Microsoft 365', host: 'smtp.office365.com', port: '587' },
};
function fdef(key, list){ return (list || S.SETTINGS_FIELDS).filter(function(f){ return f.key === key; })[0]; }
function tabOf(key){ return S.SETTINGS_TABS.filter(function(t){ return t.keys.indexOf(key) > -1; })[0]; }
function fgrid(fields, val, path){
  return '<div class="fgrid">' + fields.map(function(f){
    var v = (val || {})[f.key], p = path ? path + '.' + f.key : f.key;
    if (f.type === 'group') return '<div class="sub full"><h4>' + esc(f.label) + '</h4>' + fgrid(f.fields, v, p) + '</div>';
    return '<div class="fc' + ((WIDE[f.type] && !f.half) || f.wide ? ' full' : '') + '">' + field(f, v, p) + '</div>';
  }).join('') + '</div>';
}
function card(title, desc, body, extra){ return '<section class="card sc"><div class="sc-h"><div><h3>' + title + '</h3>' + (desc ? '<p>' + desc + '</p>' : '') + '</div>' + (extra || '') + '</div>' + body + '</section>'; }

function genericTab(t){
  return t.keys.map(function(k){
    var f = fdef(k); if (!f) return '';
    if (f.type === 'group') {
      var v = state.settings[k] || {};
      var plain = f.fields.filter(function(x){ return x.type !== 'group'; }), groups = f.fields.filter(function(x){ return x.type === 'group'; });
      return (plain.length ? card(esc(f.label), '', fgrid(plain, v, k)) : '') +
        groups.map(function(g){ return card(esc(g.label), '', fgrid(g.fields, v[g.key], k + '.' + g.key)); }).join('');
    }
    return card(esc(f.label), esc(f.hint || ''), fgrid([Object.assign({}, f, { label: 'File content', hint: '' })], state.settings, ''));
  }).join('');
}

function emailTab(){
  var g = fdef('email'), v = state.settings.email = state.settings.email || {};
  if (v.autoreply === undefined) v.autoreply = true; // server default is on
  function F(k, full){ var f = fdef(k, g.fields); return f ? '<div class="fc' + (full ? ' full' : '') + '">' + field(f, v[k], 'email.' + k) + '</div>' : ''; }
  var host = String(v.smtp_host || '').trim().toLowerCase();
  var cur = Object.keys(PRESETS).filter(function(k){ return PRESETS[k].host === host; })[0];
  return card('Status', 'Based on the saved settings.', '<div id="mailStatus" class="stat"><div class="muted">Checking email setup…</div></div>') +
    card('Who receives enquiries', 'Messages from the website contact form are delivered to these addresses.', '<div class="fgrid">' + F('to') + F('cc') + F('autoreply', true) + '</div>') +
    card('Sender', 'The name and address people see in their inbox.', '<div class="fgrid">' + F('from_name') + F('from_email') + '</div>') +
    card('Mail server &amp; app password', 'Sign in with an <b>app password</b>, not your normal email password.',
      '<div class="presets"><span>Quick setup</span>' + Object.keys(PRESETS).map(function(k){ return '<button type="button" class="chip' + (k === cur ? ' on' : '') + '" data-preset="' + k + '">' + esc(PRESETS[k].label) + '</button>'; }).join('') + '</div>' +
      '<div class="fgrid">' + F('smtp_host') + F('smtp_port') + F('smtp_user', true) + '</div>' + pwBox()) +
    card('Send a test', 'Sends both emails (team notification and customer confirmation) with sample data, using the saved settings.',
      '<div class="testrow"><input type="text" id="testTo" placeholder="you@example.com" aria-label="Send the test to"><button type="button" class="btn primary" id="sendTest">Send test</button></div>' +
      '<div class="testrow"><button type="button" class="btn sm" data-preview="owner">Preview team notification</button><button type="button" class="btn sm" data-preview="customer">Preview customer confirmation</button></div>');
}
function pwBox(){
  return '<div class="pwbox"><div class="pw-h"><b>App password</b><span id="pwState" class="badge">Checking…</span></div>' +
    '<div class="pw-row"><input type="password" id="pwIn" autocomplete="new-password" spellcheck="false" placeholder="16 letters, e.g. abcd efgh ijkl mnop" aria-label="App password"><button type="button" class="btn" id="pwEye">Show</button><button type="button" class="btn primary" id="pwSave">Save password</button></div>' +
    '<div class="pw-acts"><button type="button" class="btn sm" id="pwVerify">Test connection</button><button type="button" class="btn sm danger" id="pwDel" hidden>Remove saved password</button><span id="pwMsg" class="hint"></span></div>' +
    '<p class="hint">Stored encrypted on the server as soon as you click <b>Save password</b> (separate from “Save settings”). It is never shown again; to change it, enter a new one. <b>Test connection</b> uses the host, port and username above, even before you save them.</p>' +
    '<details class="help"><summary>How to create a Gmail app password</summary><ol>' +
      '<li>Turn on <b>2-Step Verification</b> for the Google account (Google Account → Security).</li>' +
      '<li>Open <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener">myaccount.google.com/apppasswords</a> and sign in.</li>' +
      '<li>Type a name such as <i>Website contact form</i> and click <b>Create</b>.</li>' +
      '<li>Copy the 16-letter password, paste it above, click <b>Save password</b>, then <b>Test connection</b>.</li>' +
      '<li>Use the same Gmail address as <b>SMTP username</b>, host <code>smtp.gmail.com</code>, port <code>465</code>.</li>' +
    '</ol><p class="hint">Google Workspace: your admin may need to allow 2-Step Verification. Zoho Mail: My Account → Security → App Passwords.</p></details></div>';
}
function loadMailStatus(){
  var st = document.getElementById('mailStatus'); if (!st) return;
  api('GET', 'email/status').then(function(s){
    function ok(t){ return '<span class="okc">✓ ' + t + '</span>'; }
    function bad(t){ return '<span class="badc">✗ ' + t + '</span>'; }
    function row(k, v){ return '<div class="sr"><span>' + k + '</span><div>' + v + '</div></div>'; }
    var src = s.pass_source;
    var pw = src === 'admin' ? ok('App password saved' + (s.pass_updated_at ? ' · ' + esc(fmt(s.pass_updated_at)) : ''))
      : src === 'secret' ? ok('Using the Cloudflare secret SMTP_PASS') + (s.pass_broken ? '<br>' + bad('The app password saved here can’t be read any more — enter it again') : '')
      : src === 'broken' ? bad('The saved app password can’t be read (the encryption key changed) — enter it again')
      : bad('No app password yet — add one below');
    st.innerHTML = row('Password', pw) +
      row('Sending as', esc(s.from.name) + ' &lt;' + esc(s.from.email || '—') + '&gt;') +
      row('Server', esc(s.host) + ':' + s.port + ' · user ' + (s.smtp_user ? esc(s.smtp_user) : bad('not set'))) +
      row('Enquiries to', esc((s.to || []).join(', ') || '—') + (s.cc && s.cc.length ? ' · CC ' + esc(s.cc.join(', ')) : '')) +
      row('Confirmation', s.autoreply ? 'Sent to the customer' : 'Off');
    var badge = document.getElementById('pwState'), del = document.getElementById('pwDel');
    if (badge) {
      badge.className = 'badge ' + (src === 'admin' || src === 'secret' ? 'ok' : 'bad');
      badge.textContent = src === 'admin' ? 'Saved' : src === 'secret' ? 'Using SMTP_PASS secret' : src === 'broken' ? 'Enter again' : 'Not set';
    }
    if (del) del.hidden = !(src === 'admin' || src === 'broken' || s.pass_broken);
    var t = document.getElementById('testTo'); if (t && !t.value) t.value = (s.to || [])[0] || '';
  }).catch(function(e){ st.textContent = e.message; });
}
function bindEmailTab(){
  loadMailStatus();
  var pin = document.getElementById('pwIn'), msg = document.getElementById('pwMsg');
  document.getElementById('pwEye').onclick = function(){ var show = pin.type === 'password'; pin.type = show ? 'text' : 'password'; this.textContent = show ? 'Hide' : 'Show'; };
  pin.onkeydown = function(e){ if (e.key === 'Enter') { e.preventDefault(); document.getElementById('pwSave').click(); } };
  document.getElementById('pwSave').onclick = function(){
    var btn = this, v = pin.value.trim();
    if (!v) { pin.focus(); return toast('Paste the app password first.', true); }
    btn.disabled = true; btn.textContent = 'Saving…';
    api('PUT', 'email/password', { password: v }).then(function(){ pin.value = ''; pin.type = 'password'; document.getElementById('pwEye').textContent = 'Show'; msg.className = 'hint'; msg.textContent = ''; toast('App password saved'); loadMailStatus(); })
      .catch(function(e){ toast(e.message, true); }).then(function(){ btn.disabled = false; btn.textContent = 'Save password'; });
  };
  document.getElementById('pwDel').onclick = function(){
    if (!confirm('Remove the saved app password? The contact form stops sending email unless the SMTP_PASS secret is set in Cloudflare.')) return;
    api('DELETE', 'email/password').then(function(){ toast('App password removed'); loadMailStatus(); }).catch(function(e){ toast(e.message, true); });
  };
  document.getElementById('pwVerify').onclick = function(){
    var btn = this, e = state.settings.email || {}, typed = pin.value.trim();
    btn.disabled = true; btn.textContent = 'Testing…'; msg.className = 'hint'; msg.textContent = 'Connecting to ' + (e.smtp_host || 'smtp.gmail.com') + '…';
    api('POST', 'email/verify', { host: e.smtp_host, port: e.smtp_port, user: e.smtp_user, password: typed })
      .then(function(r){ msg.className = 'hint okc'; msg.textContent = '✓ Signed in to ' + r.host + ':' + r.port + ' as ' + r.user + (typed ? ' — now click Save password.' : '.'); })
      .catch(function(err){ msg.className = 'hint badc'; msg.textContent = '✗ ' + err.message; })
      .then(function(){ btn.disabled = false; btn.textContent = 'Test connection'; });
  };
  document.getElementById('sendTest').onclick = function(){
    var btn = this, to = document.getElementById('testTo').value;
    if (state.dirty && !confirm('You have unsaved changes. The test uses the saved settings. Send anyway?')) return;
    btn.disabled = true; btn.textContent = 'Sending…';
    api('POST', 'email/test', { to: to }).then(function(){ toast('Test emails sent to ' + to + ' — check the inbox (and spam).'); }).catch(function(e){ toast(e.message, true); }).then(function(){ btn.disabled = false; btn.textContent = 'Send test'; });
  };
}
function previewEmail(kind){
  api('POST', 'email/preview', { kind: kind, settings: state.settings }).then(function(r){
    modal.innerHTML = '<div class="box wide"><div style="display:flex;align-items:center;gap:10px"><h2 style="margin-right:auto;font-size:16px">Subject: ' + esc(r.subject) + '</h2><button class="btn sm" id="pvClose">Close</button></div><iframe id="pvFrame" title="Email preview" style="width:100%;height:70vh;border:0;border-radius:12px;background:#eef1f8"></iframe><p style="color:var(--dim);font-size:12.5px">Preview with sample data (Jane Nguyen). Unsaved changes are included.</p></div>';
    modal.hidden = false; document.getElementById('pvFrame').srcdoc = r.html; document.getElementById('pvClose').onclick = function(){ modal.hidden = true; };
  }).catch(function(e){ toast(e.message, true); });
}

function templatesTab(){
  var g = fdef('email_templates'), v = state.settings.email_templates || {};
  var sub = fdef(state.tplTab || 'owner', g.fields) || g.fields[0];
  var desc = { owner: 'Sent to your team when someone submits the contact form.', customer: 'Sent to the customer as a receipt (switch it on or off in Email sending).' };
  return '<div class="seg">' + g.fields.map(function(f){ return '<button type="button" data-tpl="' + f.key + '" class="' + (f.key === sub.key ? 'on' : '') + '">' + esc(f.label) + '</button>'; }).join('') + '</div>' +
    card(esc(sub.label), (desc[sub.key] || '') + ' Leave a field empty to use the default text.',
      '<div class="phs"><span>Placeholders · click to copy</span>' + PH.map(function(p){ return '<button type="button" class="chip mono" data-ph="' + p + '">{{' + p + '}}</button>'; }).join('') + '</div>' +
      fgrid(sub.fields, v[sub.key], 'email_templates.' + sub.key),
      '<button type="button" class="btn sm" data-preview="' + sub.key + '">Preview</button>');
}

/* ---------- AI chat tab ---------- */
function chatTab(){
  var g = fdef('chat'), v = state.settings.chat = state.settings.chat || {};
  var D = S.CHAT_DEFAULTS || {};
  Object.keys(D).forEach(function(k){ if (v[k] === undefined) v[k] = D[k]; });
  function F(k, full){ var f = fdef(k, g.fields); return f ? '<div class="fc' + (full ? ' full' : '') + '">' + field(f, v[k], 'chat.' + k) + '</div>' : ''; }
  return card('Status', 'Live state of the website assistant.', '<div id="chatStatus" class="stat"><div class="muted">Checking…</div></div>') +
    card('DeepSeek API key', 'The assistant answers with DeepSeek. Create a key at <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener" style="color:var(--cyan)">platform.deepseek.com</a>.', keyBox()) +
    card('Chat widget', 'What visitors see.', '<div class="fgrid">' + F('enabled', true) + F('title') + F('subtitle') + F('button') + F('bot_name') + F('greeting', true) + F('suggestions', true) + '</div>') +
    card('Instructions', 'The system prompt: personality, rules and what to recommend. All published pages are appended automatically as knowledge.',
      '<div class="phs"><span>Placeholders · click to copy</span>' + ['bot_name', 'site_name', 'site_url', 'email'].map(function(p){ return '<button type="button" class="chip mono" data-ph="' + p + '">{{' + p + '}}</button>'; }).join('') + '</div>' +
      '<div class="fgrid">' + F('instructions', true) + '</div>',
      '<button type="button" class="btn sm" id="chatResetIns">Reset to default</button>') +
    card('Knowledge', 'Published pages are read automatically. Add what the website does not say.', '<div class="fgrid">' + F('capabilities', true) + F('knowledge', true) + '</div>', '<button type="button" class="btn sm" id="chatResetCaps">Reset tech list</button>') +
    card('Model', '', '<div class="fgrid">' + F('model') + F('temperature') + F('max_tokens') + '</div>') +
    card('Contact capture', 'Ask visitors to leave their name, email and phone in the chat. Each lead is emailed to the addresses in Email sending, with the chat transcript.', '<div class="fgrid">' + F('lead_enabled', true) + F('lead_after') + F('lead_phone') + F('lead_title') + F('lead_text') + F('lead_thanks', true) + '</div>') +
    card('Try the assistant', 'Asks one question using the settings on this screen, even before you save them.',
      '<div class="testrow"><input type="text" id="chatQ" placeholder="e.g. I use Shopify and Zoho CRM. Which product should I choose?" aria-label="Test question"><button type="button" class="btn primary" id="chatAsk">Ask</button></div>' +
      '<div id="chatA" class="help" style="white-space:pre-wrap;line-height:1.55"></div>') +
    card('Recent conversations', 'Grouped by visitor (same browser), newest first · 15 per page.', '<div id="chatLogs" class="muted">Loading…</div>', '<div style="display:flex;gap:8px"><button type="button" class="chip" id="chatOnlyLeads">Only leads</button><button type="button" class="btn sm" id="chatLogsReload">Refresh</button></div>');
}
function keyBox(){
  return '<div class="pwbox"><div class="pw-h"><b>API key</b><span id="ckState" class="badge">Checking…</span></div>' +
    '<div class="pw-row"><input type="password" id="ckIn" autocomplete="new-password" spellcheck="false" placeholder="sk-…" aria-label="DeepSeek API key"><button type="button" class="btn" id="ckEye">Show</button><button type="button" class="btn primary" id="ckSave">Save key</button></div>' +
    '<div class="pw-acts"><button type="button" class="btn sm" id="ckVerify">Test key</button><button type="button" class="btn sm danger" id="ckDel" hidden>Remove saved key</button><span id="ckMsg" class="hint"></span></div>' +
    '<p class="hint">Stored encrypted on the server when you click <b>Save key</b> (separate from “Save settings”). It is never shown again; to change it, paste a new one. If no key is saved here, the Cloudflare secret <code>DEEPSEEK_API_KEY</code> is used.</p></div>';
}
function loadChatStatus(){
  var st = document.getElementById('chatStatus'); if (!st) return;
  api('GET', 'chat/status').then(function(s){
    function ok(t){ return '<span class="okc">✓ ' + t + '</span>'; }
    function bad(t){ return '<span class="badc">✗ ' + t + '</span>'; }
    function row(k, x){ return '<div class="sr"><span>' + k + '</span><div>' + x + '</div></div>'; }
    var src = s.source;
    var key = src === 'admin' ? ok('Key saved here' + (s.hint ? ' (' + esc(s.hint) + ')' : '') + (s.updated_at ? ' · ' + esc(fmt(s.updated_at)) : ''))
      : src === 'secret' ? ok('Using the Cloudflare secret DEEPSEEK_API_KEY' + (s.hint ? ' (' + esc(s.hint) + ')' : '')) + (s.broken ? '<br>' + bad('The key saved here can’t be read any more — paste it again') : '')
      : src === 'broken' ? bad('The saved key can’t be read (the encryption key changed) — paste it again')
      : bad('No API key yet — add one below');
    st.innerHTML = row('Widget', s.enabled ? ok('Shown on the website') : bad('Turned off')) + row('API key', key) + row('Model', esc(s.model || '')) +
      row('Conversations', s.logs ? s.logs.n + ' messages · ' + s.logs.week + ' in the last 7 days' : '<span class="muted">Log table missing — run npm run db:setup</span>') +
      row('Leads', !s.lead_enabled ? '<span class="muted">Contact capture is off</span>' : s.leads ? '<b>' + s.leads.n + '</b> total · ' + s.leads.week + ' in the last 7 days' : '<span class="muted">Leads table missing — run npm run db:setup</span>');
    var b = document.getElementById('ckState'), del = document.getElementById('ckDel');
    if (b) { b.className = 'badge ' + (s.key_set ? 'ok' : 'bad'); b.textContent = src === 'admin' ? 'Saved' : src === 'secret' ? 'Using secret' : src === 'broken' ? 'Enter again' : 'Not set'; }
    if (del) del.hidden = !(src === 'admin' || src === 'broken' || s.broken);
  }).catch(function(e){ st.textContent = e.message; });
}
function pathOnly(u){ try { var x = new URL(u, location.origin); return x.pathname + x.hash; } catch (e) { return String(u); } }
function loadChatLogs(pg){
  var el = document.getElementById('chatLogs'); if (!el) return;
  state.chatPage = pg || state.chatPage || 1;
  el.className = 'muted'; el.textContent = 'Loading…';
  var tg = document.getElementById('chatOnlyLeads'); if (tg) tg.classList.toggle('on', !!state.chatLeads);
  api('GET', 'chat/logs?page=' + state.chatPage + (state.chatLeads ? '&leads=1' : '')).then(function(d){
    if (!d.total) { el.innerHTML = '<div class="muted">' + (d.only_leads ? 'No visitor has left their details yet.' : 'No conversations yet.') + '</div>'; return; }
    el.className = '';
    var list = d.visitors.map(function(v){
      var meta = [v.device, v.country, v.ip].filter(Boolean).map(esc).join(' · ');
      var last = '', body = v.chats.map(function(c){
        var sep = c.session !== last ? '<div class="cl-sep">' + (last ? 'New chat · ' : 'Chat · ') + esc(fmt(c.created_at)) + (c.page ? ' · ' + esc(pathOnly(c.page)) : '') + '</div>' : '';
        last = c.session;
        return sep + '<div class="cl-q">' + esc(c.question) + '</div><div class="cl-a">' + esc(c.answer || '(no answer)').split('**').map(function(t, i){ return i % 2 ? '<b>' + t + '</b>' : t; }).join('') + '</div>';
      }).join('');
      var first = v.chats.length ? v.chats[v.chats.length - 1].question : '';
      var ct = v.contacts && v.contacts[0];
      var leadHtml = (v.contacts || []).map(function(l){
        return '<div class="cl-lead"><b>✉ Left contact details · ' + esc(fmt(l.created_at)) + ' · <a href="#/inbox/' + l.contact_id + '">Open in Inbox →</a></b>' +
          '<div><a href="mailto:' + esc(l.email) + '">' + esc(l.name) + ' &lt;' + esc(l.email) + '&gt;</a>' + (l.phone ? ' · <a href="tel:' + esc(l.phone) + '">' + esc(l.phone) + '</a>' : '') + '</div>' +
          (l.need ? '<div class="cl-need">' + esc(l.need) + '</div>' : '') + '</div>';
      }).join('');
      return '<details class="cl' + (ct ? ' has-lead' : '') + '"><summary><span class="cl-who"><b>' + (ct ? '<span class="cl-badge">Lead</span>' + esc(ct.name) : 'Visitor ' + esc(String(v.id).replace(/^ip:/, 'IP ').slice(-8))) + '</b><span>' + (ct ? esc(ct.email) + (ct.phone ? ' · ' + esc(ct.phone) : '') : meta) + '</span></span>' +
        '<span class="cl-last">' + esc(first.slice(0, 90)) + '</span>' +
        '<span class="cl-n">' + v.messages + ' msg' + (v.messages > 1 ? 's' : '') + (v.sessions > 1 ? ' · ' + v.sessions + ' chats' : '') + '<br>' + esc(fmt(v.last_at)) + '</span></summary>' +
        '<div class="cl-body">' + leadHtml + (ct ? '<p class="hint" style="color:var(--dim);font-size:12px">' + meta + '</p>' : '') + body + '</div></details>';
    }).join('');
    var from = (d.page - 1) * d.per + 1, to = Math.min(d.total, d.page * d.per);
    var pager = '<div class="cl-pager"><button type="button" class="btn sm" data-clpage="' + (d.page - 1) + '"' + (d.page <= 1 ? ' disabled' : '') + '>‹ Prev</button>' +
      '<span>' + from + '–' + to + ' of ' + d.total + ' visitors · page ' + d.page + ' / ' + d.pages + '</span>' +
      '<button type="button" class="btn sm" data-clpage="' + (d.page + 1) + '"' + (d.page >= d.pages ? ' disabled' : '') + '>Next ›</button></div>';
    el.innerHTML = list + pager;
    el.querySelectorAll('[data-clpage]').forEach(function(b){ b.onclick = function(){ loadChatLogs(+b.getAttribute('data-clpage')); el.scrollIntoView({ block: 'start', behavior: 'smooth' }); }; });
  }).catch(function(e){ el.className = 'muted'; el.textContent = e.message; });
}
function bindChatTab(){
  loadChatStatus(); loadChatLogs(state.chatPage || 1);
  var kin = document.getElementById('ckIn'), msg = document.getElementById('ckMsg');
  document.getElementById('ckEye').onclick = function(){ var show = kin.type === 'password'; kin.type = show ? 'text' : 'password'; this.textContent = show ? 'Hide' : 'Show'; };
  kin.onkeydown = function(e){ if (e.key === 'Enter') { e.preventDefault(); document.getElementById('ckSave').click(); } };
  document.getElementById('ckSave').onclick = function(){
    var btn = this, k = kin.value.trim();
    if (!k) { kin.focus(); return toast('Paste the DeepSeek API key first.', true); }
    btn.disabled = true; btn.textContent = 'Saving…';
    api('PUT', 'chat/key', { key: k }).then(function(r){
      kin.value = ''; kin.type = 'password'; document.getElementById('ckEye').textContent = 'Show';
      msg.className = 'hint ' + (r.ok ? 'okc' : 'badc'); msg.textContent = r.ok ? '✓ Saved and working.' : '✗ Saved, but: ' + r.error;
      toast('API key saved'); loadChatStatus();
    }).catch(function(e){ toast(e.message, true); }).then(function(){ btn.disabled = false; btn.textContent = 'Save key'; });
  };
  document.getElementById('ckDel').onclick = function(){
    if (!confirm('Remove the saved API key? The chat stops working unless the DEEPSEEK_API_KEY secret is set in Cloudflare.')) return;
    api('DELETE', 'chat/key').then(function(){ toast('API key removed'); msg.textContent = ''; loadChatStatus(); }).catch(function(e){ toast(e.message, true); });
  };
  document.getElementById('ckVerify').onclick = function(){
    var btn = this, typed = kin.value.trim();
    btn.disabled = true; btn.textContent = 'Testing…'; msg.className = 'hint'; msg.textContent = 'Contacting DeepSeek…';
    api('POST', 'chat/verify', { key: typed }).then(function(){ msg.className = 'hint okc'; msg.textContent = '✓ The key works' + (typed ? ' — now click Save key.' : '.'); })
      .catch(function(e){ msg.className = 'hint badc'; msg.textContent = '✗ ' + e.message; })
      .then(function(){ btn.disabled = false; btn.textContent = 'Test key'; });
  };
  document.getElementById('chatResetCaps').onclick = function(){
    if (!confirm('Replace the technology list with the default one?')) return;
    state.settings.chat.capabilities = (S.CHAT_DEFAULTS || {}).capabilities || '';
    state.dirtyTabs.chat = true; markDirty(true); rerender(); toast('Default list restored. Click Save settings to keep it.');
  };
  document.getElementById('chatResetIns').onclick = function(){
    if (!confirm('Replace the instructions with the default text?')) return;
    state.settings.chat.instructions = (S.CHAT_DEFAULTS || {}).instructions || '';
    state.dirtyTabs.chat = true; markDirty(true); rerender(); toast('Default instructions restored. Click Save settings to keep them.');
  };
  var q = document.getElementById('chatQ');
  q.onkeydown = function(e){ if (e.key === 'Enter') { e.preventDefault(); document.getElementById('chatAsk').click(); } };
  document.getElementById('chatAsk').onclick = function(){
    var btn = this, out = document.getElementById('chatA'), text = q.value.trim();
    if (!text) { q.focus(); return; }
    btn.disabled = true; btn.textContent = 'Thinking…'; out.textContent = '';
    api('POST', 'chat/test', { message: text, settings: state.settings }).then(function(r){
      out.textContent = r.answer;
      if (r.usage) out.insertAdjacentHTML('beforeend', '<p class="hint" style="color:var(--dim);font-size:12px;margin-top:8px">' + (r.ms ? (r.ms / 1000).toFixed(1) + 's · ' : '') + r.usage.prompt_tokens + ' prompt tokens (' + (r.usage.prompt_cache_hit_tokens || 0) + ' cached) · ' + r.usage.completion_tokens + ' answer tokens</p>');
    }).catch(function(e){ out.innerHTML = '<span class="badc">✗ ' + esc(e.message) + '</span>'; })
      .then(function(){ btn.disabled = false; btn.textContent = 'Ask'; });
  };
  document.getElementById('chatLogsReload').onclick = function(){ loadChatLogs(state.chatPage); };
  document.getElementById('chatOnlyLeads').onclick = function(){ state.chatLeads = !state.chatLeads; loadChatLogs(1); };
}

function viewSettings(tab){
  state.view = 'settings'; state.open = {}; state.dirtyTabs = {}; nav('settings');
  state.tab = tab || state.tab || 'general';
  app.innerHTML = '<div class="loading">Loading…</div>';
  api('GET', 'settings').then(function(s){ state.settings = s; state.dirty = false; renderSettings(); }).catch(function(e){ app.innerHTML = '<div class="empty">' + esc(e.message) + '</div>'; });
}
function renderSettings(){
  var tabs = S.SETTINGS_TABS, t = tabs.filter(function(x){ return x.id === state.tab; })[0] || tabs[0];
  state.tab = t.id; state.dirtyTabs = state.dirtyTabs || {};
  var body = t.id === 'email' ? emailTab() : t.id === 'templates' ? templatesTab() : t.id === 'chat' ? chatTab() : genericTab(t);
  app.innerHTML = '<div class="ed-top"><h1 class="st-h1">Settings</h1><span class="grow"></span><span class="dirty" id="dirty"></span>' +
    '<button class="btn sm" id="discard"' + (state.dirty ? '' : ' hidden') + '>Discard</button><button class="btn primary" id="save">Save settings</button></div>' +
    '<div class="st"><nav class="st-nav" aria-label="Settings sections">' + tabs.map(function(x){
      return '<button type="button" data-tab="' + x.id + '" class="' + (x.id === t.id ? 'on' : '') + '"' + (x.id === t.id ? ' aria-current="page"' : '') + '><b>' + esc(x.label) + '</b><span>' + esc(x.desc) + '</span>' + (state.dirtyTabs[x.id] ? '<i class="dot" title="Unsaved changes"></i>' : '') + '</button>';
    }).join('') + '</nav>' +
    '<div class="st-main"><div class="st-title"><h2>' + esc(t.label) + '</h2><p>' + esc(t.desc) + '</p></div>' + body + '</div></div>';
  if (!app._bound) {
    app._bound = true; bindDrop(app); bindSettingsClicks();
    bindForm(app, function(path){
      if (state.view !== 'settings') return;
      var tb = tabOf(String(path).split('.')[0]);
      if (tb && !state.dirtyTabs[tb.id]) { state.dirtyTabs[tb.id] = true; var b = app.querySelector('[data-tab="' + tb.id + '"]'); if (b && !b.querySelector('.dot')) b.insertAdjacentHTML('beforeend', '<i class="dot" title="Unsaved changes"></i>'); }
      markDirty(true); var d = document.getElementById('discard'); if (d) d.hidden = false;
    });
  }
  markDirty(state.dirty);
  document.getElementById('save').onclick = saveSettings;
  document.getElementById('discard').onclick = function(){ if (confirm('Discard all unsaved changes?')) viewSettings(state.tab); };
  if (t.id === 'email') bindEmailTab();
  if (t.id === 'chat') bindChatTab();
}
function saveSettings(){
  var btn = document.getElementById('save'); if (!btn || btn.disabled) return;
  btn.disabled = true; btn.textContent = 'Saving…';
  api('PUT', 'settings', state.settings).then(function(s){ state.settings = s; state.dirty = false; state.dirtyTabs = {}; toast('Settings saved'); rerender(); })
    .catch(function(e){ toast(e.message, true); btn.disabled = false; btn.textContent = 'Save settings'; });
}
function bindSettingsClicks(){
  app.addEventListener('click', function(e){
    if (state.view !== 'settings') return;
    var b;
    if ((b = e.target.closest('[data-tab]'))) { state.tab = b.getAttribute('data-tab'); var h = '#/settings/' + state.tab; history.replaceState(null, '', h); lastHash = h; renderSettings(); window.scrollTo(0, 0); return; }
    if ((b = e.target.closest('[data-preset]'))) {
      var pr = PRESETS[b.getAttribute('data-preset')]; state.settings.email = state.settings.email || {};
      state.settings.email.smtp_host = pr.host; state.settings.email.smtp_port = pr.port; state.dirtyTabs.email = true; markDirty(true); rerender();
      toast(pr.label + ' server filled in. Click Save settings to keep it.'); return;
    }
    if ((b = e.target.closest('[data-tpl]'))) { state.tplTab = b.getAttribute('data-tpl'); rerender(); return; }
    if ((b = e.target.closest('[data-ph]'))) {
      var tx = '{{' + b.getAttribute('data-ph') + '}}';
      (navigator.clipboard ? navigator.clipboard.writeText(tx) : Promise.reject()).then(function(){ toast('Copied ' + tx); }, function(){ toast(tx); }); return;
    }
    if ((b = e.target.closest('[data-preview]'))) { previewEmail(b.getAttribute('data-preview')); return; }
  });
}

/* ---------- contact inbox ---------- */
var IB_LABEL = { new: 'New', read: 'Read', replied: 'Replied', archived: 'Archived', spam: 'Spam' };
function inboxBadge(n){ var b = document.getElementById('nbInbox'); if (!b) return; b.hidden = !n; b.textContent = n > 99 ? '99+' : String(n || ''); }
function refreshInboxBadge(){ api('GET', 'contacts/counts').then(function(c){ inboxBadge(c.new); }).catch(function(){}); }
function viewInbox(openId){
  state.view = 'inbox'; nav('inbox');
  state.ib = state.ib || { status: '', q: '', page: 1 };
  state.ib.sel = {};
  app.innerHTML = '<div class="head"><h1>Inbox</h1><span class="muted" style="font-size:13px">Messages from the contact form and the AI chat</span><button class="btn sm" id="ibReload">Refresh</button><a class="btn sm" id="ibCsv" href="#">⬇ Export CSV</a></div>' +
    '<div class="ib-bar"><div class="ib-tabs" id="ibTabs"></div><input type="text" class="ib-search" id="ibQ" placeholder="Search name, email, company, message…" aria-label="Search messages" value="' + esc(state.ib.q) + '"></div>' +
    '<div class="card" id="ibList"><div class="loading">Loading…</div></div>';
  var qi = document.getElementById('ibQ'), t;
  qi.oninput = function(){ clearTimeout(t); t = setTimeout(function(){ state.ib.q = qi.value.trim(); state.ib.page = 1; loadInbox(); }, 300); };
  document.getElementById('ibReload').onclick = function(){ loadInbox(); };
  document.getElementById('ibCsv').onclick = function(e){ e.preventDefault(); location.href = '/admin/api/contacts/export.csv?status=' + encodeURIComponent(state.ib.status) + '&q=' + encodeURIComponent(state.ib.q); };
  loadInbox();
  if (openId) openContact(+openId);
}
function loadInbox(){
  var el = document.getElementById('ibList'); if (!el) return;
  var ib = state.ib;
  api('GET', 'contacts?status=' + encodeURIComponent(ib.status) + '&q=' + encodeURIComponent(ib.q) + '&page=' + ib.page).then(function(d){
    var c = d.counts; inboxBadge(c.new);
    ib.items = d.items; ib.sel = {};
    var tabs = [['', 'Inbox', c.inbox], ['new', 'New', c.new], ['replied', 'Replied', c.replied], ['archived', 'Archived', c.archived], ['spam', 'Spam', c.spam], ['all', 'All', c.all]];
    document.getElementById('ibTabs').innerHTML = tabs.map(function(x){ return '<button type="button" data-ibs="' + x[0] + '" class="' + (ib.status === x[0] ? 'on' : '') + '">' + x[1] + '<i>' + x[2] + '</i></button>'; }).join('');
    document.querySelectorAll('[data-ibs]').forEach(function(b){ b.onclick = function(){ ib.status = b.getAttribute('data-ibs'); ib.page = 1; loadInbox(); }; });
    if (!d.items.length) { el.innerHTML = '<div class="empty">' + (ib.q ? 'No messages match "' + esc(ib.q) + '".' : c.all ? 'No messages in this view.' : 'No messages yet. Enquiries from the contact form will appear here.') + '</div>'; return; }
    var from = (d.page - 1) * d.per + 1, to = Math.min(d.total, d.page * d.per);
    el.innerHTML = '<div class="ib-bulk"><input type="checkbox" id="ibAll" aria-label="Select all"><span id="ibSelN">Select</span>' +
      '<span id="ibActs" hidden style="display:contents"><button class="btn sm" data-bulk="read">Mark read</button><button class="btn sm" data-bulk="replied">Replied</button><button class="btn sm" data-bulk="archived">Archive</button><button class="btn sm" data-bulk="spam">Spam</button>' + (ib.status === 'archived' || ib.status === 'spam' ? '<button class="btn sm" data-bulk="new">Move to inbox</button>' : '') + '<button class="btn sm danger" data-bulk="delete">Delete</button></span></div>' +
      '<table class="list ib-list"><thead><tr><th class="ck"></th><th>From</th><th class="hide-sm">Message</th><th>Status</th><th class="hide-sm">Received</th></tr></thead><tbody>' +
      d.items.map(function(m, i){
        return '<tr data-i="' + i + '" class="' + (m.status === 'new' ? 'unread' : '') + '"><td class="ck"><input type="checkbox" data-ck="' + m.id + '" aria-label="Select"></td>' +
          '<td class="who"><b>' + esc(m.name) + (m.source === 'chat' ? ' <span class="badge" style="background:rgba(34,211,238,.15);color:var(--cyan)">AI chat</span>' : '') + '</b><span>' + esc(m.email) + (m.phone ? ' · ' + esc(m.phone) : '') + (m.company ? ' · ' + esc(m.company) : '') + '</span></td>' +
          '<td class="msg hide-sm"><small>' + esc([m.service, m.budget].filter(Boolean).join(' · ')) + '</small><div>' + esc(m.message.slice(0, 160)) + '</div></td>' +
          '<td><span class="pill ' + m.status + '">' + IB_LABEL[m.status] + '</span>' + (m.email_status === 'failed' || m.email_status === 'skipped' ? ' <span class="badge bad" title="' + esc(m.email_error || 'Notification email was not sent') + '">email ✗</span>' : '') + '</td>' +
          '<td class="when hide-sm">' + esc(fmt(m.created_at)) + '</td></tr>';
      }).join('') + '</tbody></table>' +
      '<div class="cl-pager" style="padding:12px 14px"><button type="button" class="btn sm" data-ibp="' + (d.page - 1) + '"' + (d.page <= 1 ? ' disabled' : '') + '>‹ Prev</button><span>' + from + '–' + to + ' of ' + d.total + ' · page ' + d.page + ' / ' + d.pages + '</span><button type="button" class="btn sm" data-ibp="' + (d.page + 1) + '"' + (d.page >= d.pages ? ' disabled' : '') + '>Next ›</button></div>';
    function sync(){ var ids = Object.keys(ib.sel); document.getElementById('ibSelN').textContent = ids.length ? ids.length + ' selected' : 'Select'; document.getElementById('ibActs').hidden = !ids.length; document.getElementById('ibAll').checked = ids.length === d.items.length; }
    el.querySelectorAll('[data-ck]').forEach(function(cb){ cb.onchange = function(){ var id = cb.getAttribute('data-ck'); if (cb.checked) ib.sel[id] = 1; else delete ib.sel[id]; sync(); }; });
    document.getElementById('ibAll').onchange = function(){ var on = this.checked; ib.sel = {}; el.querySelectorAll('[data-ck]').forEach(function(cb){ cb.checked = on; if (on) ib.sel[cb.getAttribute('data-ck')] = 1; }); sync(); };
    el.querySelectorAll('tbody tr').forEach(function(tr){ tr.onclick = function(e){ if (e.target.closest('.ck')) return; openContact(ib.items[+tr.getAttribute('data-i')].id); }; });
    el.querySelectorAll('[data-ibp]').forEach(function(b){ b.onclick = function(){ ib.page = +b.getAttribute('data-ibp'); loadInbox(); window.scrollTo(0, 0); }; });
    el.querySelectorAll('[data-bulk]').forEach(function(b){ b.onclick = function(){
      var ids = Object.keys(ib.sel).map(Number), action = b.getAttribute('data-bulk');
      if (action === 'delete' && !confirm('Delete ' + ids.length + ' message(s) permanently? This cannot be undone.')) return;
      api('POST', 'contacts/bulk', { ids: ids, action: action }).then(function(r){ toast(action === 'delete' ? r.count + ' deleted' : r.count + ' updated'); loadInbox(); }).catch(function(e){ toast(e.message, true); });
    }; });
  }).catch(function(e){ el.innerHTML = '<div class="empty">' + esc(e.message) + '</div>'; });
}
function openContact(id){
  modal.innerHTML = '<div class="box wide"><div class="loading">Loading…</div></div>'; modal.hidden = false;
  api('GET', 'contacts/' + id).then(function(m){
    var subj = 'Re: ' + (m.service || 'Your enquiry') + ' — Digital Executive Partner';
    var mail = 'mailto:' + encodeURIComponent(m.email) + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent('Hi ' + (m.name.split(' ')[0] || '') + ',\n\n\n\n---\nOn ' + fmt(m.created_at) + ' you wrote:\n> ' + m.message.replace(/\n/g, '\n> '));
    function row(k, v){ return v ? '<div class="sr"><span>' + k + '</span><div>' + v + '</div></div>' : ''; }
    var es = { sent: '<span class="okc">✓ Sent to the team</span>', failed: '<span class="badc">✗ Failed — ' + esc(m.email_error) + '</span>', skipped: '<span class="badc">✗ Not sent — ' + esc(m.email_error || 'email is not configured') + '</span>', pending: '<span class="muted">Pending</span>' }[m.email_status];
    modal.innerHTML = '<div class="box wide ib-d"><div class="hd"><div style="margin-right:auto"><h2>' + esc(m.name) + '</h2><a href="mailto:' + esc(m.email) + '">' + esc(m.email) + '</a></div><span class="pill ' + m.status + '">' + IB_LABEL[m.status] + '</span><button class="btn sm icon" id="cdX" aria-label="Close">✕</button></div>' +
      '<div>' + row('Phone', m.phone ? '<a href="tel:' + esc(m.phone) + '" style="color:var(--cyan)">' + esc(m.phone) + '</a>' : '') + row('Source', m.source === 'chat' ? 'AI chat widget' : '') + row('Company', esc(m.company)) + row('Service', esc(m.service)) + row('Budget', esc(m.budget)) + row('Received', esc(fmt(m.created_at))) +
        row('Sent from', m.page ? '<a href="' + esc(m.page) + '" target="_blank" rel="noopener" style="color:var(--cyan)">' + esc(pathOnly(m.page)) + '</a>' : '') +
        row('Visitor', esc([m.device, m.country, m.ip].filter(Boolean).join(' · '))) + row('Notification', es) + '</div>' +
      '<div class="msgbox">' + esc(m.message) + '</div>' +
      (m.transcript && m.transcript.length ? '<details class="help"><summary>Chat transcript (' + m.transcript.length + ' messages)</summary><div class="cl-body" style="margin-top:10px">' + m.transcript.map(function(t){ return '<div class="' + (t.role === 'user' ? 'cl-q' : 'cl-a') + '">' + esc(t.content) + '</div>'; }).join('') + '</div></details>' : '') +
      '<label class="f">Internal note <span class="hint">only visible in the admin</span><textarea id="cdNote" rows="3" placeholder="e.g. Called on Monday, sending a quote">' + esc(m.note) + '</textarea></label>' +
      '<div class="acts"><a class="btn primary" id="cdReply" href="' + esc(mail) + '">↩ Reply by email</a>' +
        '<select id="cdSt" style="width:auto" aria-label="Status">' + Object.keys(IB_LABEL).map(function(k){ return '<option value="' + k + '"' + (k === m.status ? ' selected' : '') + '>' + IB_LABEL[k] + '</option>'; }).join('') + '</select>' +
        '<button class="btn" id="cdSave">Save</button><span class="grow"></span><button class="btn danger" id="cdDel">Delete</button></div></div>';
    loadInbox();
    function done(){ modal.hidden = true; loadInbox(); }
    document.getElementById('cdX').onclick = done;
    document.getElementById('cdReply').onclick = function(){ if (m.status !== 'replied') api('PUT', 'contacts/' + m.id, { status: 'replied' }).then(function(){ document.getElementById('cdSt').value = 'replied'; loadInbox(); }).catch(function(){}); };
    document.getElementById('cdSave').onclick = function(){
      api('PUT', 'contacts/' + m.id, { status: document.getElementById('cdSt').value, note: document.getElementById('cdNote').value }).then(function(){ toast('Saved'); done(); }).catch(function(e){ toast(e.message, true); });
    };
    document.getElementById('cdDel').onclick = function(){
      if (!confirm('Delete this message from ' + m.name + ' permanently?')) return;
      api('DELETE', 'contacts/' + m.id).then(function(){ toast('Deleted'); done(); }).catch(function(e){ toast(e.message, true); });
    };
  }).catch(function(e){ modal.hidden = true; toast(e.message, true); });
}

/* ---------- SEO Agent ---------- */
var SEO_ST = { drafted: 'Draft ready', published: 'Published', failed: 'Failed' };
function seoBadge(n){ var b = document.getElementById('nbSeo'); if (!b) return; b.hidden = !n; b.textContent = n > 99 ? '99+' : String(n || ''); }
function refreshSeoBadge(){ api('GET', 'seo/overview').then(function(o){ seoBadge(o.counts.drafted); }).catch(function(){}); }
function viewSeo(tab){
  state.view = 'seo'; nav('seo');
  state.seo = state.seo || { status: 'published' };
  state.seo.tab = tab || 'proposals'; state.seo.sel = {};
  app.innerHTML = '<div class="head"><h1>SEO Agent</h1><span class="muted" style="font-size:13px">Trends → posts, every day at 06:00</span>' +
    '<button class="btn sm primary" id="seoRun" title="Scan trends, write and publish now — the same as the 06:00 run">▶ Run now</button></div>' +
    '<div id="seoStrip" class="seo-strip"></div>' +
    '<div class="ib-bar"><div class="ib-tabs">' + [['proposals', 'Posts'], ['runs', 'History'], ['settings', 'Settings']].map(function(x){ return '<a class="' + (state.seo.tab === x[0] ? 'on' : '') + '" href="#/seo/' + x[0] + '">' + x[1] + '</a>'; }).join('') + '</div></div>' +
    '<div id="seoBody"><div class="card"><div class="loading">Loading…</div></div></div>';
  document.getElementById('seoRun').onclick = function(){ seoRun(this); };
  loadSeo();
}
function seoRun(btn){
  var label = btn.textContent; btn.disabled = true; btn.textContent = 'Running… (≈3–5 min)';
  api('POST', 'seo/run').then(function(s){
    if (s.error) throw new Error(s.error);
    toast((s.written || 0) + ' written · ' + (s.published || 0) + ' published' + (s.backlinks ? ' · ' + s.backlinks + ' backlinks' : '') + (s.meta_refreshed ? ' · ' + s.meta_refreshed + ' titles rewritten' : '') + (s.held && s.held.length ? ' · kept as draft: ' + s.held.join('; ') : ''), !s.written && !s.published);
    state.seo.status = s.published ? 'published' : 'drafted';
    loadSeo();
  }).catch(function(e){ toast(e.message, true); }).then(function(){ btn.disabled = false; btn.textContent = label; });
}
function loadSeo(){
  var body = document.getElementById('seoBody'); if (!body) return;
  api('GET', 'seo/overview').then(function(o){
    state.seo.o = o; seoBadge(o.counts.drafted);
    var c = o.config, src = o.sources;
    document.getElementById('seoStrip').innerHTML =
      (c.autopilot ? '<span class="okc">🚀 Autopilot on · 06:00 daily · ' + c.per_run + ' posts/run · publish if SEO > ' + c.publish_min_seo + '</span>' : '<span class="muted">○ Autopilot off — turn it on in Settings</span>') +
      '<span class="' + (src.deepseek ? 'okc' : 'badc') + '">' + (src.deepseek ? '✓ DeepSeek key' : '✗ No DeepSeek key — add it in Settings → AI chat') + '</span>' +
      '<span class="' + (src.gsc ? 'okc' : 'muted') + '">' + (src.gsc ? '✓ Search Console' : '○ Search Console not connected') + '</span>';
    if (state.seo.tab === 'runs') return seoRuns(body, o.runs);
    if (state.seo.tab === 'settings') return seoSettings(body, o);
    seoProposals(body, o.counts);
  }).catch(function(e){ body.innerHTML = '<div class="card"><div class="empty">' + esc(e.message) + '</div></div>'; });
}
function seoProposals(body, counts){
  var st = state.seo.status;
  var total = Object.keys(counts).reduce(function(a, k){ return a + counts[k]; }, 0);
  var chips = Object.keys(SEO_ST).map(function(k){ return [k, SEO_ST[k], counts[k]]; }).concat([['all', 'All', total]]);
  body.innerHTML = '<div class="ib-bar"><div class="ib-tabs">' + chips.map(function(x){ return '<button type="button" data-sps="' + x[0] + '" class="' + (st === x[0] ? 'on' : '') + '">' + x[1] + '<i>' + x[2] + '</i></button>'; }).join('') + '</div>' +
    '</div><div class="card" id="spList"><div class="loading">Loading…</div></div>';
  body.querySelectorAll('[data-sps]').forEach(function(b){ b.onclick = function(){ state.seo.status = b.getAttribute('data-sps'); loadSeo(); }; });
  api('GET', 'seo/proposals?status=' + encodeURIComponent(st)).then(function(d){
    var el = document.getElementById('spList'); if (!el) return;
    state.seo.items = d.items; state.seo.sel = {};
    if (!d.items.length) { el.innerHTML = '<div class="empty">' + (st === 'drafted' ? 'No drafts waiting. Posts scoring above the threshold are published automatically.' : st === 'published' ? 'Nothing published yet. Click “Run now” (or wait for 06:00).' : 'Nothing here.') + '</div>'; return; }
    el.innerHTML = '<div class="ib-bulk"><input type="checkbox" id="spAll" aria-label="Select all"><span id="spN">Select</span>' +
      '<span id="spActs" hidden style="display:contents"><button class="btn sm danger" data-spb="delete">Delete from list</button></span></div>' +
      '<table class="list ib-list"><thead><tr><th class="ck"></th><th>Post</th><th>SEO</th><th class="hide-sm">Angle</th><th>Status</th></tr></thead><tbody>' +
      d.items.map(function(p){
        var b = p.brief || {};
        var page = p.target_page ? '<a href="#/edit/' + p.target_page + '">' + esc(p.page_title || ('Page #' + p.target_page)) + '</a>' : '';
        return '<tr data-sp="' + p.id + '"><td class="ck"><input type="checkbox" data-spk="' + p.id + '"></td>' +
          '<td class="who"><b>' + esc(p.page_title || p.keyword) + '</b><span>keyword: ' + esc(p.keyword) + (p.intent ? ' · ' + esc(p.intent) : '') + '</span></td>' +
          '<td>' + (b.seo_score != null ? scoreBadge(b.seo_score) : '<span class="muted">—</span>') + '</td>' +
          '<td class="msg hide-sm"><div>' + esc(b.angle || b.h1 || '') + '</div>' + (p.error ? '<small class="badc">⚠ ' + esc(p.error.slice(0, 120)) + '</small>' : page ? '<small>' + page + (b.seo_score != null ? ' · SEO ' + b.seo_score : '') + '</small>' : '') + '</td>' +
          '<td><span class="pill sp-' + p.status + '">' + SEO_ST[p.status] + '</span></td></tr>';
      }).join('') + '</tbody></table>';
    function sync(){ var ids = Object.keys(state.seo.sel).filter(function(k){ return state.seo.sel[k]; }); document.getElementById('spActs').hidden = !ids.length; document.getElementById('spN').textContent = ids.length ? ids.length + ' selected' : 'Select'; return ids; }
    el.querySelectorAll('[data-spk]').forEach(function(c){ c.onclick = function(e){ e.stopPropagation(); state.seo.sel[c.getAttribute('data-spk')] = c.checked; sync(); }; });
    document.getElementById('spAll').onchange = function(){ var on = this.checked; el.querySelectorAll('[data-spk]').forEach(function(c){ c.checked = on; state.seo.sel[c.getAttribute('data-spk')] = on; }); sync(); };
    el.querySelectorAll('[data-spb]').forEach(function(b){ b.onclick = function(){
      var a = b.getAttribute('data-spb'), ids = sync();
      if (a === 'delete' && !confirm('Delete ' + ids.length + ' proposal(s)?')) return;
      api('POST', 'seo/proposals/bulk', { ids: ids, action: a }).then(function(r){ toast(r.count + ' updated'); loadSeo(); }).catch(function(e){ toast(e.message, true); });
    }; });
    el.querySelectorAll('tr[data-sp]').forEach(function(tr){ tr.onclick = function(e){ if (e.target.closest('input,a')) return; openProposal(+tr.getAttribute('data-sp')); }; });
  }).catch(function(e){ var el = document.getElementById('spList'); if (el) el.innerHTML = '<div class="empty">' + esc(e.message) + '</div>'; });
}
function openProposal(id){
  var p = (state.seo.items || []).filter(function(x){ return x.id === id; })[0]; if (!p) return;
  if (p.target_page) return openPost(id);
  modal.innerHTML = '<div class="box wide ib-d"><div class="hd"><div style="margin-right:auto"><h2>' + esc(p.keyword) + '</h2><span class="muted" style="font-size:13px">Writing failed · ' + esc(fmt(p.updated_at)) + '</span></div><button class="btn sm icon" id="spX" aria-label="Close">✕</button></div>' +
    '<div class="msgbox badc">' + esc(p.error || 'Unknown error') + '</div><div class="acts"><span class="grow"></span><button class="btn danger" id="spDel">Delete</button></div></div>';
  modal.hidden = false;
  document.getElementById('spX').onclick = function(){ modal.hidden = true; };
  document.getElementById('spDel').onclick = function(){ api('DELETE', 'seo/proposals/' + p.id).then(function(){ modal.hidden = true; loadSeo(); }).catch(function(e){ toast(e.message, true); }); };
}
function openPost(pid){
  modal.innerHTML = '<div class="box wide"><div class="loading">Loading the post…</div></div>'; modal.hidden = false;
  api('GET', 'seo/draft/' + pid).then(function(d){
    var p = d.proposal, pg = d.page, r = d.report, sn = d.snippet, done = p.status === 'published';
    var fails = r.checks.filter(function(c){ return !c.ok; }).length;
    var locked = r.score <= d.min_score;
    var pubLabel = locked ? '🔒 Publish locked — SEO ' + r.score + ' (needs > ' + d.min_score + ')' : '✓ Publish post';
    modal.innerHTML = '<div class="box wide pr">' +
      '<div class="hd" style="display:flex;align-items:flex-start;gap:12px"><div style="margin-right:auto"><span class="muted" style="font-size:12.5px">' + (done ? 'Published' : 'Blog post · draft') + ' · keyword: <b>' + esc(p.keyword) + '</b></span><h2>' + esc(pg.title) + '</h2></div>' + scoreBadge(r.score) + '<button class="btn sm icon" id="prX" aria-label="Close">✕</button></div>' +
      '<div class="pr-grid"><div class="pr-side">' +
        '<div class="pr-card"><div class="pr-lbl">Google preview</div><div class="serp"><div class="su">' + esc(sn.url) + '</div><div class="st">' + esc(sn.title) + '</div><div class="sd">' + esc(sn.description) + '</div></div></div>' +
        '<div class="pr-card"><div class="pr-lbl">SEO checklist · ' + (fails ? fails + ' to improve' : 'all good') + '</div><ul class="pr-checks">' + r.checks.map(function(c){ return '<li class="' + (c.ok ? 'ok' : 'no') + '">' + (c.ok ? '✓' : '✗') + ' ' + esc(c.t) + '</li>'; }).join('') + '</ul>' +
          '<div class="muted" style="font-size:12px;margin-top:8px">' + r.words + ' words · keywords: ' + esc(pg.seo.keywords || '') + '<br>Structured data: BlogPosting, FAQPage, Breadcrumb (added automatically)</div></div>' +
      '</div><iframe class="pr-frame" title="Post preview" src="/admin/preview/' + pg.id + '"></iframe></div>' +
      '<div class="acts" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">' +
        (done ? '<a class="btn primary" href="' + esc(sn.url) + '" target="_blank" rel="noopener">View live ↗</a>' : '<button class="btn primary" id="prPub"' + (locked ? ' disabled title="Fix the ✗ items in the editor, then reopen this screen"' : '') + '>' + pubLabel + '</button>') +
        '<a class="btn" href="#/edit/' + pg.id + '" id="prEdit">✎ Edit in editor</a><span style="flex:1"></span>' +
        (done ? '' : locked ? '<span class="badc" style="font-size:12.5px">Fix the ✗ items in the editor, then reopen this post — the score updates automatically.</span>' : '<span class="muted" style="font-size:12.5px">Fix anything in the editor, then come back here (or publish there).</span>') + '</div></div>';
    document.getElementById('prX').onclick = function(){ modal.hidden = true; if (state.view === 'seo') loadSeo(); };
    document.getElementById('prEdit').onclick = function(){ modal.hidden = true; };
    var pb = document.getElementById('prPub');
    if (pb && !locked) pb.onclick = function(){
      pb.disabled = true; pb.textContent = 'Publishing…';
      api('POST', 'seo/publish/' + p.id).then(function(res){ toast('Live at ' + res.path); state.seo && (state.seo.status = 'published'); openPost(p.id); })
        .catch(function(e){ toast(e.message, true); pb.disabled = false; pb.textContent = pubLabel; });
    };
  }).catch(function(e){ modal.hidden = true; toast(e.message, true); });
}
function gscCard(){
  var el = document.getElementById('gscCard'); if (!el) return;
  el.innerHTML = '<div class="pr-lbl">Google Search Console</div><div class="loading">Checking…</div>';
  api('GET', 'seo/gsc?sites=1').then(function(g){
    var steps = '<details class="help"><summary>How to get the JSON key (5 min)</summary><ol class="gsc-steps">' +
      '<li>Open <a href="https://console.cloud.google.com/projectcreate" target="_blank" rel="noopener">Google Cloud</a> → create (or pick) a project.</li>' +
      '<li>APIs &amp; Services → Library → enable <b>Google Search Console API</b>.</li>' +
      '<li>IAM &amp; Admin → Service accounts → <b>Create service account</b> (no roles needed).</li>' +
      '<li>Open it → Keys → Add key → Create new key → <b>JSON</b>. A .json file downloads.</li>' +
      '<li>Upload that file here. Then in <a href="https://search.google.com/search-console/users" target="_blank" rel="noopener">Search Console → Settings → Users and permissions</a> add the service-account email (Restricted is enough).</li></ol></details>';
    var upload = '<div class="gsc-up" id="gscDrop"><input type="file" id="gscFile" accept=".json,application/json" hidden>' +
      '<button type="button" class="btn sm primary" id="gscPick">⬆ ' + (g.source === 'admin' ? 'Replace JSON key' : 'Upload JSON key') + '</button><span class="muted" style="font-size:12.5px">or drop the .json file here · stored encrypted, never shown again</span></div>';
    var html = '<div class="pr-lbl">Google Search Console</div>';
    if (g.source === 'none') {
      html += '<p class="muted" style="font-size:13px">Not connected. The agent still runs on autocomplete, Hacker News and RSS, but Search Console gives the best opportunities: keywords you already rank 5–30 for.</p>' + upload + steps;
    } else if (g.source === 'broken') {
      html += '<p class="badc" style="font-size:13px">The saved key can no longer be decrypted (the encryption secret changed). Upload the JSON again.</p>' + upload;
    } else {
      var sites = g.sites || [];
      html += '<div class="sr"><span>Service account</span><div><code id="gscEmail">' + esc(g.client_email) + '</code> <button type="button" class="btn sm" id="gscCopy">Copy</button>' + (g.source === 'secret' ? ' <span class="muted">(from the GSC_SA_JSON secret)</span>' : '') + '</div></div>' +
        '<div class="sr"><span>Property</span><div>' + (sites.length
          ? '<select id="gscSite" style="width:auto;min-width:260px"' + (g.source === 'secret' ? ' disabled' : '') + '>' + (g.site ? '' : '<option value="">— choose —</option>') + sites.map(function(x){ return '<option' + (x.siteUrl === g.site ? ' selected' : '') + ' value="' + esc(x.siteUrl) + '">' + esc(x.siteUrl) + ' · ' + esc(x.permissionLevel.replace('site', '')) + '</option>'; }).join('') + '</select>'
          : '<span class="badc">No property shared with this account yet.</span> <span class="muted">Add the email above as a user in Search Console, then test again.</span>') + '</div></div>' +
        (g.error ? '<p class="badc" style="font-size:13px">' + esc(g.error) + '</p>' : '') +
        '<div class="sr"><span>Status</span><div id="gscStatus">' + (g.connected ? '<span class="okc">● Connected to ' + esc(g.site) + '</span>' : '<span class="muted">Not ready</span>') + (g.updated_at ? ' <span class="muted">· key uploaded ' + esc(fmt(g.updated_at)) + '</span>' : '') + '</div></div>' +
        '<div class="acts" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button type="button" class="btn sm" id="gscTest">Test connection</button>' + (g.source === 'admin' ? upload.replace('class="gsc-up" id="gscDrop"', 'class="gsc-up inline" id="gscDrop"') + '<span style="flex:1"></span><button type="button" class="btn sm danger" id="gscDel">Disconnect</button>' : '') + '</div>';
    }
    el.innerHTML = html;
    var file = document.getElementById('gscFile'), drop = document.getElementById('gscDrop');
    function send(f){
      if (!f) return;
      if (f.size > 20000) return toast('That file is too big to be a service-account key.', true);
      var rd = new FileReader();
      rd.onload = function(){
        toast('Checking the key with Google…');
        api('PUT', 'seo/gsc', { json: String(rd.result) }).then(function(r){
          if (r.warning) toast(r.warning, true); else toast('Connected' + (r.site ? ' to ' + r.site : ''));
          loadSeo();
        }).catch(function(e){ toast(e.message, true); });
      };
      rd.readAsText(f);
    }
    if (file) {
      document.getElementById('gscPick').onclick = function(){ file.click(); };
      file.onchange = function(){ send(file.files[0]); file.value = ''; };
      drop.ondragover = function(e){ e.preventDefault(); drop.classList.add('over'); };
      drop.ondragleave = function(){ drop.classList.remove('over'); };
      drop.ondrop = function(e){ e.preventDefault(); drop.classList.remove('over'); send(e.dataTransfer.files[0]); };
    }
    var cp = document.getElementById('gscCopy');
    if (cp) cp.onclick = function(){ navigator.clipboard.writeText(g.client_email).then(function(){ toast('Email copied — add it in Search Console → Users and permissions'); }); };
    var sel = document.getElementById('gscSite');
    if (sel) sel.onchange = function(){ api('PUT', 'seo/gsc/site', { site: sel.value }).then(function(){ toast("Property saved"); loadSeo(); }).catch(function(e){ toast(e.message, true); }); };
    var t = document.getElementById('gscTest');
    if (t) t.onclick = function(){
      t.disabled = true; t.textContent = 'Testing…';
      api('POST', 'seo/gsc/test').then(function(r){ toast(r.message); document.getElementById('gscStatus').innerHTML = '<span class="okc">✓ ' + esc(r.message) + '</span>'; })
        .catch(function(e){ toast(e.message, true); document.getElementById('gscStatus').innerHTML = '<span class="badc">✗ ' + esc(e.message) + '</span>'; })
        .then(function(){ t.disabled = false; t.textContent = 'Test connection'; });
    };
    var del = document.getElementById('gscDel');
    if (del) del.onclick = function(){ if (confirm('Disconnect Search Console and delete the saved key?')) api('DELETE', 'seo/gsc').then(function(){ toast("Disconnected"); loadSeo(); }).catch(function(e){ toast(e.message, true); }); };
  }).catch(function(e){ el.innerHTML = '<div class="pr-lbl">Google Search Console</div><p class="badc">' + esc(e.message) + '</p>'; });
}
function seoRuns(body, runs){
  var KIND = { daily: 'Run' };
  body.innerHTML = '<div class="card">' + (runs.length ? '<table class="list"><thead><tr><th>Run</th><th>Started</th><th>Result</th><th class="hide-sm">Tokens</th></tr></thead><tbody>' + runs.map(function(r){
    var s = r.stats || {}, u = s.usage || {};
    var out = s.error ? '<span class="badc">✗ ' + esc(s.error) + '</span>' : !r.finished_at ? '<span class="muted">Running…</span>' : s.skipped ? '<span class="muted">Skipped — ' + esc(s.skipped) + '</span>' :
      esc([s.signals != null && s.signals + ' signals', s.proposals != null && s.proposals + ' new ideas', s.written != null && s.written + ' written', s.published != null && s.published + ' published', s.backlinks && s.backlinks + ' backlinks added', s.meta_refreshed && s.meta_refreshed + ' titles rewritten', s.indexnow && s.indexnow + ' URLs sent to IndexNow'].filter(Boolean).join(' · ') || 'Done') +
      (s.held && s.held.length ? '<div class="muted" style="font-size:12px">Kept as draft: ' + esc(s.held.join('; ')) + '</div>' : '') +
      (s.source_errors && s.source_errors.length ? '<div class="muted" style="font-size:12px">⚠ ' + esc(s.source_errors.join(' · ').slice(0, 200)) + '</div>' : '');
    var secs = r.finished_at ? Math.round((new Date(r.finished_at) - new Date(r.started_at)) / 1000) : null;
    return '<tr><td><b>' + (KIND[r.kind] || esc(r.kind)) + '</b><div class="path">' + (s.manual ? 'manual' : 'scheduled') + (secs != null ? ' · ' + secs + 's' : '') + '</div></td><td style="color:var(--muted)">' + fmt(r.started_at) + '</td><td>' + out + '</td><td class="hide-sm" style="color:var(--muted)">' + (u.prompt ? (u.prompt + u.completion).toLocaleString() + (u.cached ? ' <small>(' + Math.round(u.cached / u.prompt * 100) + '% cached)</small>' : '') : '—') + '</td></tr>';
  }).join('') + '</tbody></table>' : '<div class="empty">No runs yet.</div>') + '</div>';
}
function seoSettings(body, o){
  var c = o.config;
  function L(v){ return esc((v || []).join('\n')); }
  body.innerHTML = '<div class="card seo-set ap' + (c.autopilot ? ' on' : '') + '"><div class="ap-h"><div><h3>🚀 Autopilot ' + (c.autopilot ? '<span class="pill sp-published">ON</span>' : '<span class="pill sp-rejected">OFF</span>') + '</h3>' +
      '<p class="muted">Every day at <b>06:00</b> (Vietnam): scan trends → write the ' + c.per_run + ' best new posts → publish every post with SEO score above ' + c.publish_min_seo + '. Lower scores wait in “Draft ready”.</p></div>' +
      '<div class="ap-b"><button type="button" class="btn ' + (c.autopilot ? '' : 'primary') + '" id="apToggle">' + (c.autopilot ? 'Turn off' : 'Turn on') + '</button></div></div></div>' +
    '<div class="card seo-set"><div class="pr-lbl">Included in every run (no extra setup)</div><ul class="gsc-steps" style="margin-top:0">' +
      '<li><b>IndexNow</b> — new and changed posts are sent to Bing / Yandex / AI search right away (key at <a href="/indexnow.txt" target="_blank" rel="noopener">/indexnow.txt</a>).</li>' +
      '<li><b>Backlinks</b> — each new post is linked from up to 3 older related agent posts.</li>' +
      '<li><b>Title rewrite</b> — posts on Google positions 8–20 with CTR under 2 % get a new meta title + description (max 3 per run, once a month each; needs Search Console).</li></ul></div>' +
    '<div class="card seo-set"><div class="pr-lbl">Options</div>' +
    '<div class="seo-3"><label class="f">Posts per run <span class="hint">1–5 · each post costs tokens</span><input type="text" inputmode="numeric" id="ssPer" value="' + c.per_run + '"></label>' +
    '<label class="f">Publish if SEO score is above <span class="hint">0–99</span><input type="text" inputmode="numeric" id="ssPub" value="' + c.publish_min_seo + '"></label>' +
    '<label class="f">Minimum idea score <span class="hint">0–100</span><input type="text" inputmode="numeric" id="ssMin" value="' + c.min_score + '"></label></div>' +
    '<label class="f" style="max-width:340px">Model<select id="ssModel"><option value="deepseek-chat"' + (c.model === 'deepseek-chat' ? ' selected' : '') + '>deepseek-chat (fast, cheap)</option><option value="deepseek-reasoner"' + (c.model === 'deepseek-reasoner' ? ' selected' : '') + '>deepseek-reasoner (slower, better judgement)</option></select></label>' +
    '<label class="f">Seed topics <span class="hint">one per line (max 15) — your services and products, expanded with Google autocomplete</span><textarea id="ssSeeds" rows="5">' + L(c.seeds) + '</textarea></label>' +
    '<label class="f">RSS / Atom feeds <span class="hint">platform changelogs, competitor blogs</span><textarea id="ssFeeds" rows="3" class="mono">' + L(c.feeds) + '</textarea></label>' +
    '<div class="acts"><button class="btn primary" id="ssSave">Save options</button></div></div>' +
    '<div class="card seo-set" id="gscCard"></div>';
  gscCard();
  function values(){ return { autopilot: c.autopilot, per_run: document.getElementById('ssPer').value, publish_min_seo: document.getElementById('ssPub').value, min_score: document.getElementById('ssMin').value,
    model: document.getElementById('ssModel').value, seeds: document.getElementById('ssSeeds').value, feeds: document.getElementById('ssFeeds').value }; }
  document.getElementById('ssSave').onclick = function(){ api('PUT', 'seo/settings', values()).then(function(){ toast('Saved'); loadSeo(); }).catch(function(e){ toast(e.message, true); }); };
  document.getElementById('apToggle').onclick = function(){
    var v = values(); v.autopilot = !c.autopilot; this.disabled = true;
    api('PUT', 'seo/settings', v).then(function(){ toast(v.autopilot ? '🚀 Autopilot on — next run at 06:00' : 'Autopilot off'); loadSeo(); }).catch(function(e){ toast(e.message, true); });
  };
}

/* ---------- router ---------- */
var lastHash = location.hash || '#/pages', skipRoute = false;
function routeTo(){
  if (skipRoute) { skipRoute = false; return; }
  var h = location.hash || '#/pages', m;
  if (state.dirty && !confirm('You have unsaved changes. Leave without saving?')) { skipRoute = true; location.hash = lastHash; return; }
  lastHash = h; state.dirty = false;
  // a fresh container drops listeners from the previous view
  var fresh = app.cloneNode(false); app.parentNode.replaceChild(fresh, app); app = fresh;
  if ((m = h.match(/^#\/edit\/(\d+)/))) return viewEdit(m[1]);
  if (h === '#/posts') return viewList('post');
  if (h.indexOf('#/settings') === 0) return viewSettings(h.split('/')[2]);
  if (h === '#/media') return viewMedia();
  if ((m = h.match(/^#\/inbox(?:\/(\d+))?$/))) return viewInbox(m[1]);
  if ((m = h.match(/^#\/seo(?:\/(\w+))?$/))) return viewSeo(m[1]);
  return viewList('page');
}
window.addEventListener('hashchange', routeTo);
window.addEventListener('beforeunload', function(e){ if (state.dirty) { e.preventDefault(); e.returnValue = ''; } });
document.addEventListener('keydown', function(e){
  if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); var b = document.getElementById('save'); if (b) b.click(); }
  if (e.key === 'Escape' && !modal.hidden) modal.hidden = true;
});
modal.addEventListener('click', function(e){ if (e.target === modal) modal.hidden = true; });
routeTo();
refreshInboxBadge(); setInterval(refreshInboxBadge, 120000);
refreshSeoBadge();
})();
`;

