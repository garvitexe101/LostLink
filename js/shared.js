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
