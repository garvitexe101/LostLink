const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
const defaults=[ {
  id:1,type:'found',name:'AirPods Pro Case',category:'Electronics',colour:'White',zone:'Central Library',date:'2026-08-17',desc:'White charging case with a small mark near the hinge.',privateDetail:'tiny sticker inside',icon:'◖◗',art:'art-1',visible:true,status:'Open'
}, {
  id:2,type:'found',name:'Black Leather Wallet',category:'Bags',colour:'Black',zone:'Student Centre',date:'2026-08-17',desc:'Slim black wallet found close to the seating area.',privateDetail:'three cards inside',icon:'▣',art:'art-2',visible:true,status:'Returned'
}, {
  id:3,type:'lost',name:'University ID Card',category:'ID / Card',colour:'Blue',zone:'Academic Block',date:'2026-08-16',desc:'Blue lanyard with an engineering student ID card.',privateDetail:'roll number begins 22',icon:'▤',art:'art-3',visible:true,status:'Possible match'
}, {
  id:4,type:'found',name:'Set of Keys',category:'Keys',colour:'Other / Multicolour',zone:'Sports Complex',date:'2026-08-16',desc:'Three keys and a bright yellow key ring.',privateDetail:'yellow rubber duck keychain',icon:'⚿',art:'art-4',visible:true,status:'Open'
}];
let items=JSON.parse(localStorage.getItem('campusfound-items')||'null')||defaults,cat='all',type='all';
const save=()=>localStorage.setItem('campusfound-items',JSON.stringify(items));
const user=()=>JSON.parse(localStorage.getItem('campusfound-user')||'null');
const icon=c=>( {
  'Electronics':'◖◗','ID / Card':'▤','Bags':'▣','Keys':'⚿','Clothing':'◒','Books':'▧','Other':'◉'
})[c]||'◉';
const art=c=>( {
  'Electronics':'art-1','ID / Card':'art-3','Bags':'art-2','Keys':'art-4','Other':'art-2'
})[c]||'art-4';
const date=d=>new Date(d+'T12:00').toLocaleDateString('en-US', {
  month:'short',day:'numeric'
});
function toast(m) {
  const t=$('#toast');
  if(!t)return;
  t.textContent=m;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),3000)
}
function status(i) {
  return `<span class="report-status ${i.status.toLowerCase().replace(' ','-')}">${i.status}</span>`
}
function updateProfile() {
  const u=user(),a=$('#profileInitial'),l=$('#profileLabel');
  if(a) {
    a.textContent=u?u.name[0].toUpperCase():'◉';
    l.textContent=u?'My profile':'Profile'
  }
}
updateProfile();
function card(i) {
  return `<article class="item-card" data-item="${i.id}" tabindex="0"><div class="item-art ${i.art||art(i.category)}">${i.image?`<img src="${i.image}" alt="${i.name}">`:(i.icon||icon(i.category))}</div><div class="item-body"><span class="status ${i.type}">${i.type.toUpperCase()}</span>${status(i)}<div class="item-title">${i.name}</div><div class="item-meta">⌖ ${i.zone}<br>◷ ${date(i.date)}</div><span class="claim-link">${i.type==='found'?'View & claim item →':'View report →'}</span></div></article>`
}
function bindCards() {
  $$('[data-item]').forEach(e=> {
    e.onclick=()=>location.href=`item.html?id=${e.dataset.item}`;
    e.onkeydown=x=>x.key==='Enter'&&e.click()
  })
}
function simpleLogin() {
  const email=prompt('Enter your university email:');
  if(!email)return;
  localStorage.setItem('campusfound-user',JSON.stringify( {
    name:email.split('@')[0],email,role:'student'
  }));
  updateProfile();
  renderProfile();
  toast('Signed in successfully.')
}
$('#adminLogin')&&($('#adminLogin').onclick=()=> {
  let email=prompt('Admin email:'),pass=prompt('Admin password:');
  if(email==='admin@chitkara.edu'&&pass==='admin123') {
    localStorage.setItem('campusfound-user',JSON.stringify( {
      name:'Campus Admin',email,role:'admin'
    }));
    updateProfile();
    renderAdmin();
    toast('Administrator access granted.')
  }
  else toast('Admin credentials did not match.')
});
/* Phase 1 usability refinements */
function footerUpgrade() {
  const f=$('footer');
  if(!f)return;
  f.classList.add('site-footer');
  f.innerHTML=`<div><a class="brand" href="index.html"><span class="brand-mark">C</span><span>campus<span>found</span></span></a><p>A trusted lost and found service for Chitkara University.</p></div><div><b>Explore</b><a href="browse.html">Browse reports</a><a href="map.html">Campus map</a><a href="how-it-works.html">How it works</a></div><div><b>Need help?</b><a href="how-it-works.html#contact">Contact support</a><a href="lost.html">Report lost item</a><a href="found.html">Report found item</a></div><small>© 2026 CampusFound · Chitkara University</small>`
}
footerUpgrade();
function removePublicStatus() {
  document.querySelectorAll('.report-status').forEach(x=>x.remove())
}
removePublicStatus();
function authFix() {
  const b=$('#authButton');
  if(b)b.onclick=()=> {
    if(document.body.dataset.page==='admin') {
      let email=prompt('Admin email:'),pass=prompt('Admin password:');
      if(email==='admin@chitkara.edu'&&pass==='admin123') {
        localStorage.setItem('campusfound-user',JSON.stringify( {
          name:'Campus Admin',email,role:'admin'
        }));
        toast('Admin signed in.');
        location.reload()
      }
      else toast('Use demo admin@chitkara.edu / admin123.')
    }
    else if(user()) {
      location.href='profile.html'
    }
    else simpleLogin()
  };
  $('#adminLogin')&&($('#adminLogin').onclick=()=>$('#authButton').click())
}
authFix();
items=items.map(i=>( {
  ...i,visible:i.visible!==false,status:i.status||'Open'
}));
save();
function openLogin(role='student') {
  const admin=role==='admin';
  $('#appModal').innerHTML=`<div class="modal show"><div class="modal-card auth-card"><button class="close" id="closeLogin">×</button><p class="eyebrow"><span></span> ${admin?'CAMPUSFOUND ADMIN':'WELCOME TO CAMPUSFOUND'}</p><h2>${admin?'Administrator access':'Sign in to CampusFound'}</h2><p>${admin?'Use the administrator demo credentials.':'Use any university email to access your student profile.'}</p><form id="workingLogin"><label>University email<input id="loginEmail" type="email" required placeholder="you@chitkara.edu"><small></small></label><label>Password<input id="loginPassword" type="password" required minlength="4" placeholder="Enter your password"><small></small></label><button class="btn btn-dark">${admin?'Admin sign in':'Sign in'} <b>→</b></button></form>${admin?'<p class="demo-login">Demo: admin@chitkara.edu · admin123</p>':''}</div></div>`;
  $('#closeLogin').onclick=()=>$('#appModal').innerHTML='';
  $('#workingLogin').onsubmit=e=> {
    e.preventDefault();
    let email=$('#loginEmail').value.trim().toLowerCase(),pass=$('#loginPassword').value;
    if(admin&&(email!=='admin@chitkara.edu'||pass!=='admin123')) {
      toast('Use admin@chitkara.edu and admin123.');
      return
    }
    localStorage.setItem('campusfound-user',JSON.stringify( {
      name:admin?'Campus Admin':email.split('@')[0],email,role:admin?'admin':'student'
    }));
    $('#appModal').innerHTML='';
    toast('Signed in successfully.');
    setTimeout(()=>location.href=admin?'admin.html':'profile.html',250)
  }
}
function fixLoginButtons() {
  const top=$('#authButton');
  if(top)top.onclick=()=>openLogin(document.body.dataset.page==='admin'?'admin':'student');
  const admin=$('#adminLogin');
  if(admin)admin.onclick=()=>openLogin('admin');
  const quick=$('#quickSignIn');
  if(quick)quick.onclick=()=>openLogin('student')
}
setTimeout(fixLoginButtons,0);
function notices() {
  return JSON.parse(localStorage.getItem('campusfound-notices')||'[]')
}
function notify(email,message) {
  const all=notices();
  all.unshift( {
    email,message,time:new Date().toISOString()
  });
  localStorage.setItem('campusfound-notices',JSON.stringify(all))
}
function applyLostLinkBrand() {
  document.title=document.title.replace(/CampusFound/gi,'LostLink');
  const icon=document.createElement('link');
  icon.rel='icon';
  icon.type='image/svg+xml';
  icon.href='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="18" fill="#17213a"/><path d="M19 20v25h21" fill="none" stroke="#fd805e" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="43" cy="43" r="7" fill="#f9ca68"/></svg>');
  document.head.append(icon);
  $$('.brand').forEach(b=> {
    const mark=b.querySelector('.brand-mark'),name=b.querySelector('span:last-child');
    if(mark)mark.textContent='L';
    if(name)name.innerHTML='Lost<span>Link</span>'
  });
  const skip=new Set(['SCRIPT','STYLE']);
  const walk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  let n;
  while(n=walk.nextNode()) {
    if(!skip.has(n.parentElement?.tagName))n.nodeValue=n.nodeValue.replace(/CampusFound/g,'LostLink').replace(/campusfound/g,'lostlink')
  }
  if(document.body.dataset.page==='home') {
    const h=$('.hero h1');
    if(h)h.innerHTML='Lost something?<br><em>Find your link.</em>';
    const p=$('.hero-text');
    if(p)p.textContent='LostLink connects students, finders and campus security—so every belonging has a better way back.'
  }
}
setTimeout(applyLostLinkBrand,0);
function polishLostLink() {
  const icon=document.createElement('link');
  icon.rel='icon';
  icon.type='image/svg+xml';
  icon.href='lostlink-logo.svg';
  document.head.append(icon);
  $$('.brand-mark').forEach(m=> {
    m.innerHTML='⌁';
    m.setAttribute('aria-label','LostLink logo')
  });
  if(document.body.dataset.page==='home') {
    const h=$('.hero h1'),p=$('.hero-text');
    if(h)h.innerHTML='Lost something?<br><em>Every lost thing deserves a way back.</em>';
    if(p)p.textContent='LostLink brings students, finders and campus security together—making each return feel simple, safe and human.'
  }
}
setTimeout(polishLostLink,10);
function refreshLostLinkIdentity() {
  const icon=document.createElement('link');
  icon.rel='icon';
  icon.type='image/svg+xml';
  icon.href='lostlink-logo-v2.svg';
  document.head.append(icon);
  $$('.brand-mark').forEach(m=> {
    m.innerHTML='⌖';
    m.setAttribute('aria-label','LostLink location logo')
  });
  if(document.body.dataset.page==='home') {
    const h=$('.hero h1'),p=$('.hero-text');
    if(h)h.innerHTML='Lost something?<br><em>Lost, found, back to you.</em>';
    if(p)p.textContent='LostLink makes it easy for the Chitkara community to report, match and safely return the things that matter.'
  }
}
setTimeout(refreshLostLinkIdentity,20);
function newBeaconLogo() {
  const icon=document.createElement('link');
  icon.rel='icon';
  icon.type='image/svg+xml';
  icon.href='lostlink-logo-v3.svg';
  document.head.append(icon);
  $$('.brand-mark').forEach(m=> {
    m.innerHTML='<i class="beacon-logo"><i></i></i>';
    m.setAttribute('aria-label','LostLink return beacon logo')
  })
}
setTimeout(newBeaconLogo,30);
function pathPeopleLogo() {
  const icon=document.createElement('link');
  icon.rel='icon';
  icon.type='image/svg+xml';
  icon.href='lostlink-logo-v4.svg';
  document.head.append(icon);
  $$('.brand-mark').forEach(m=> {
    m.innerHTML='<i class="path-logo"><i class="person start"></i><i class="route"></i><i class="item-dot">◆</i><i class="person end"></i></i>';
    m.setAttribute('aria-label','LostLink people and item path logo')
  })
}
setTimeout(pathPeopleLogo,40);

