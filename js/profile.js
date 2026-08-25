/* Student profile, reports, alerts, and notification rendering. */
function renderProfile() {
  if(document.body.dataset.page!=='profile')return;
  const u=user();
  if(!u) {
    $('#profilePage').innerHTML='<section class="profile-card"><p class="eyebrow"><span></span> YOUR CAMPUSFOUND PROFILE</p><span class="large-avatar">◉</span><h1>Welcome to<br>CampusFound.</h1><p>Sign in to create reports, see match updates and follow your claims.</p><div class="profile-actions"><button class="btn btn-dark" id="quickSignIn">Sign in <b>→</b></button><a class="btn btn-light" href="admin.html">Admin sign in</a></div></section>';
    $('#quickSignIn').onclick=()=>simpleLogin();
    return
  }
  let mine=items.filter(i=>i.ownerEmail===u.email),alerts=mine.filter(i=>i.status!=='Open').map(i=>`${i.name}: ${i.status}`).concat(items.filter(i=>i.claim==='pending').map(i=>`A claim is pending for ${i.name}`));
  $('#profilePage').innerHTML=`<section class="profile-card profile-top"><p class="eyebrow"><span></span> ${u.role==='admin'?'ADMINISTRATOR':'STUDENT'} ACCOUNT</p><span class="large-avatar">${u.name[0].toUpperCase()}</span><h1>${u.name}</h1><p>${u.email}</p><div class="profile-actions">${u.role==='admin'?'<a class="btn btn-dark" href="admin.html">Admin dashboard <b>→</b></a>':'<a class="btn btn-dark" href="lost.html">Report an item <b>→</b></a>'}<button class="btn btn-light" id="signOut">Sign out</button></div></section><section class="notification-centre"><p class="eyebrow"><span></span> NOTIFICATION CENTRE</p><h2>Recent updates</h2>${alerts.length?alerts.map(a=>`<p class="alert-row">✦ $ {
    a
  }
  </p>`).join(''):'<p class="alert-row">✓ You’re all caught up. New matches and claim updates will appear here.</p>'}</section><section class="my-reports"><div><p class="eyebrow"><span></span> MY REPORTS</p><h2>Your lost &amp; found activity</h2></div><div class="my-report-grid">${mine.length?mine.map(card).join(''):'<p class="empty-map-state">You have not posted a report yet.</p>'}</div></section>`;
  bindCards();
  $('#signOut').onclick=()=> {
    localStorage.removeItem('campusfound-user');
    renderProfile();
    updateProfile()
  }
}
renderProfile();
function profileNotices() {
  if(document.body.dataset.page!=='profile'||!user())return;
  const mine=notices().filter(n=>n.email===user().email);
  if(!mine.length)return;
  const target=$('.notification-centre');
  if(target)target.insertAdjacentHTML('afterbegin',mine.map(n=>`<p class="alert-row accepted-alert">✓ ${n.message}</p>`).join(''))
}
setTimeout(profileNotices,0);
