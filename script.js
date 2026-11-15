(function(){var u=(window.SUPABASE_URL||'').trim();if(u&&!/^https?:\/\//.test(u))u='https://'+u;if(u&&!/\./.test(u.replace(/^https?:\/\//,'')))u+='.supabase.co';window.SUPABASE_URL=u.replace(/\/+$/,'')})();
const cfgOk=/^https?:\/\//.test(window.SUPABASE_URL||'')&&!/PASTE/i.test(window.SUPABASE_ANON_KEY||'')&&!!window.SUPABASE_ANON_KEY;
let sb=null;try{if(cfgOk&&window.supabase)sb=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY)}catch(e){console.warn('Supabase init failed:',e)}
if(!sb)console.warn('Supabase not configured: showing starter content. Edit config.js.');
const FALLBACK = window.DEFAULT_CONTENT;
let data = structuredClone(FALLBACK);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const safeUrl=u=>/^(https?:|mailto:|tel:|\/|#|assets\/)/i.test(u||'')?esc(u):'#';
function merge(a,b){for(const k in b){if(b[k]&&typeof b[k]==='object'&&!Array.isArray(b[k])&&a[k])a[k]=merge(a[k],b[k]);else a[k]=b[k]}return a}
async function load(live){if(!sb){render(live);return}try{const {data:row,error}=await Promise.race([sb.from('portfolio').select('content').eq('id',1).maybeSingle(),new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),8000))]);if(error)throw error;if(row?.content)data=merge(structuredClone(FALLBACK),row.content)}catch(e){console.warn('Cloud read failed, showing starter content:',e)}render(live)}
// Realtime: any change published from /admin/ appears here instantly.
if(sb)try{sb.channel('portfolio-live').on('postgres_changes',{event:'*',schema:'public',table:'portfolio'},()=>{load(true);toast('Site updated ✨')}).subscribe()}catch(e){console.warn('Realtime unavailable',e)}
function toast(t){const e=document.getElementById('toast');e.textContent=t;e.classList.add('toast-show');setTimeout(()=>e.classList.remove('toast-show'),2200)}
function bgStyle(s){if(!s.background)return '';const bright=Math.min(100,Math.max(5,Number(s.bgBright??(s.bgDim!=null?100-s.bgDim:50))));const d=100-bright;const a=(d/100*.85).toFixed(2),b=Math.min(.95,d/100*1.15).toFixed(2);const op=(1-Math.min(90,Math.max(0,Number(s.bgTransp??0)))/100).toFixed(2);return `opacity:${op};background-image:linear-gradient(135deg,rgba(251,246,239,${a}),rgba(251,246,239,${b})),url('${esc(s.background)}')`}
const heading=s=>`<div class="section-heading"><h2>${esc(s.title)}</h2><p>${esc(s.subtitle)}</p></div>`;
const card=x=>`<article class="project-card">${x.image?`<img class="card-image" src="${esc(x.image)}" alt="" loading="lazy">`:''}<div><div class="project-icon">${esc(x.icon||'✦')}</div><h3>${esc(x.title||'Untitled')}</h3><p>${esc(x.description||'')}</p>${x.meta?`<div class="role">${esc(x.meta)}</div>`:''}</div><div>${(x.tags||[]).map(t=>`<span class="tag">${esc(t)}</span>`).join('')}${x.link?`<a class="inline-link" href="${safeUrl(x.link)}" target="_blank" rel="noopener">Open ↗</a>`:''}</div></article>`;
function section(s){if(!s.visible)return '';let body;const it=s.items||[];
 if(s.type==='skills')body=`<div class="skills-wrap">${it.map(x=>`<div class="skill-pill">✦ ${esc(x.title)}</div>`).join('')}</div>`;
 else if(s.type==='timeline')body=`<div class="timeline">${it.map(x=>`<article class="edu-card"><div class="edu-year">${esc(x.meta||x.icon||'')}</div><h3>${esc(x.title)}</h3><p>${esc(x.description||'')}</p>${x.link?`<a class="inline-link" href="${safeUrl(x.link)}" target="_blank" rel="noopener">View ↗</a>`:''}</article>`).join('')}</div>`;
 else if(s.type==='links')body=`<div class="contact-links">${it.map(x=>`<a class="contact-link" href="${safeUrl(x.link)}" target="_blank" rel="noopener"><strong>${esc(x.icon||'↗')}</strong><div><b>${esc(x.title)}</b><span>${esc(x.description||'')}</span></div><em>↗</em></a>`).join('')}</div>`;
 else body=`<div class="project-grid">${it.map(card).join('')}</div>`;
 return `<section id="${esc(s.id)}" class="section ${['timeline','links'].includes(s.type)?'alt':''}"><div class="section-bg" style="${bgStyle(s)}"></div><div class="container reveal">${heading(s)}${body}</div></section>`}
function build(){const b=data.branding||{};const first=(data.sections||[]).find(s=>s.visible)?.id||'home';
 const nm=esc(data.title).replace(/(Bristy)/i,'<span>$1</span>');
 let out=`<section id="home" class="section hero"><div class="section-bg" style="${data.homeBackground?`background-image:url('${esc(data.homeBackground)}')`:''}"></div><div class="rain"></div><div class="hero-content reveal"><div class="hero-copy"><span class="eyebrow">${esc(data.eyebrow)}</span><h1>${nm}</h1><p class="full-name">${esc(data.fullName||'')}</p><p>${esc(data.intro)}</p><div class="hero-actions"><a class="btn primary" href="#${esc(first)}">Explore my work ↗</a>${data.cv?`<a class="btn ghost" href="${safeUrl(data.cv)}" target="_blank" rel="noopener">Download CV</a>`:''}</div><div class="quick-meta"><span>${esc(data.tagline||'')}</span></div></div><div class="hero-photo-wrap"><div class="hero-photo"><img src="${esc(data.photo||'assets/profile-placeholder.svg')}" alt="Profile photo"></div><div class="floating-card card-one">☔ <b>Bristy</b><small>means “rain”</small></div></div></div></section>`;
 for(const s of data.sections||[])out+=section(s);
 out+=`<footer class="site-footer"><div><b>${esc(data.fullName||b.name)}</b><span>${esc(data.tagline||'')}</span></div><small>© ${new Date().getFullYear()} ${esc(b.name||'BRISTY')}</small></footer>`;return out}
function render(live){const b=data.branding||{};const mark=document.getElementById('brandMark');mark.innerHTML=b.logo?`<img src="${esc(b.logo)}" alt="Logo">`:esc(b.mark||'B');document.getElementById('navName').textContent=b.name||'BRISTY';
 const nav=document.getElementById('mainNav');nav.innerHTML=(data.sections||[]).filter(s=>s.visible).map(s=>`<a href="#${esc(s.id)}">${esc(s.title)}</a>`).join('');
 document.getElementById('publicSite').innerHTML=build();nav.querySelectorAll('a').forEach(a=>a.onclick=()=>nav.classList.remove('open'));document.getElementById('menuBtn').onclick=()=>nav.classList.toggle('open');document.title=(b.name||'Bristy')+' — Portfolio';
 const els=document.querySelectorAll('.reveal');if(live){els.forEach(x=>x.classList.add('visible'))}else{const o=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});els.forEach(x=>o.observe(x))}}
addEventListener('scroll',()=>{const h=document.documentElement;document.getElementById('progress').style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight||1)*100)+'%'},{passive:true});
render();load(true);
