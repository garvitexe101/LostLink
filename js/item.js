/* Item details, ownership validation, student claims, and administrator review. */
function renderItem() {
  if(document.body.dataset.page!=='item')return;
  let i=items.find(x=>x.id===+new URLSearchParams(location.search).get('id'));
  if(!i) {
    $('#itemPage').innerHTML='<p class="not-found">Report not found.</p>';
    return
  }
  let claim=i.type==='found'&&i.status!=='Returned'?`<section class="claim-box"><p class="eyebrow"><span></span> OWNERSHIP VALIDATION</p><h2>Think it may be yours?</h2><p>Answer all questions accurately; correct claims are sent to campus admins for review.</p><form id="fullClaimForm"><label>What colour is it?<input required id="q1"><small></small></label><label>Where was it found?<input required id="q2"><small></small></label><label>Name one private feature<input required id="q3"><small></small></label><label>What public-description word matches?<input required id="q4"><small></small></label><button class="btn btn-dark">Submit verification <b>→</b></button></form></section>`:'<section class="claim-box"><h2>This report is closed.</h2><p>The item has been returned or is not available for a claim.</p></section>';
  $('#itemPage').innerHTML=`<a class="back-link" href="browse.html">← Back to browse</a><div class="item-detail"><div class="detail-art ${i.art||art(i.category)}">${i.image?`<img src="${i.image}" alt="${i.name}">`:(i.icon||icon(i.category))}</div><section class="detail-main"><span class="status ${i.type}">${i.type.toUpperCase()}</span>${status(i)}<h1>${i.name}</h1><p class="detail-description">${i.desc}</p><div class="detail-grid"><div><small>LOCATION</small><b>⌖ ${i.zone}</b></div><div><small>DATE REPORTED</small><b>◷ ${date(i.date)}</b></div><div><small>CATEGORY</small><b>${i.category}</b></div></div></section></div>${claim}`;
  $('#fullClaimForm')&&($('#fullClaimForm').onsubmit=e=> {
    e.preventDefault();
    if(!user()) {
      toast('Sign in before submitting a claim.');
      location.href='profile.html';
      return
    }
    let a=[$('#q1').value,$('#q2').value,$('#q3').value,$('#q4').value].map(x=>x.trim().toLowerCase()),ok=a[0]===i.colour.toLowerCase()&&a[1]===i.zone.toLowerCase()&&a[2]===i.privateDetail.toLowerCase()&&i.desc.toLowerCase().includes(a[3]);
    if(!ok) {
      toast('Answers did not match. No claim was submitted.');
      return
    }
    i.claim='pending';
    i.status='Claim pending';
    i.claimantEmail=user().email;
    i.claimAnswers=a;
    save();
    toast('Verified claim submitted for admin review.');
    renderItem()
  })
}
renderItem();
function adminItemStatus() {
  if(document.body.dataset.page!=='item'||!user()||user().role!=='admin')return;
  const i=items.find(x=>x.id===+new URLSearchParams(location.search).get('id'));
  if(!i)return;
  const detail=$('.detail-main');
  if(detail)detail.insertAdjacentHTML('afterbegin',`<div class="admin-item-status">ADMIN VIEW · ${i.status==='Returned'?'RETURNED':'NOT RETURNED'}${i.claim==='pending'?' · CLAIM PENDING':''}</div>`)
}
setTimeout(adminItemStatus,0);
function fixLostReportState() {
  if(document.body.dataset.page!=='item')return;
  const i=items.find(x=>x.id===+new URLSearchParams(location.search).get('id'));
  if(!i||i.type!=='lost'||i.status==='Returned')return;
  const box=$('.claim-box');
  if(box)box.innerHTML=`<p class="eyebrow"><span></span> ACTIVE LOST REPORT</p><h2>This report is open.</h2><p>Your lost-item report is active and visible to the campus community. If someone finds it, they can submit a found-item report and CampusFound will suggest the match.</p><a class="btn btn-dark" href="found.html">I found this item <b>→</b></a>`
}
setTimeout(fixLostReportState,0);
function improveClaimSubmission() {
  if(document.body.dataset.page!=='item'||user()?.role==='admin')return;
  const form=$('#fullClaimForm'),i=items.find(x=>x.id===+new URLSearchParams(location.search).get('id'));
  if(!form||!i)return;
  form.onsubmit=e=> {
    e.preventDefault();
    if(!user()) {
      toast('Please sign in before submitting a claim.');
      location.href='profile.html';
      return
    }
    const a=[$('#q1').value,$('#q2').value,$('#q3').value,$('#q4').value].map(x=>x.trim().toLowerCase()),ok=a[0]===i.colour.toLowerCase()&&a[1]===i.zone.toLowerCase()&&a[2]===i.privateDetail.toLowerCase()&&i.desc.toLowerCase().includes(a[3]);
    if(!ok) {
      toast('Answers did not match. No claim was submitted.');
      return
    }
    i.claims=i.claims||[];
    if(i.claims.some(c=>c.email===user().email)) {
      toast('You already have a claim waiting for review.');
      return
    }
    i.claims.push( {
      email:user().email,name:user().name,answers:a,status:'pending',submittedAt:new Date().toISOString()
    });
    save();
    toast('Claim submitted to the admin for review.');
    form.reset()
  }
}
setTimeout(improveClaimSubmission,0);
function adminItemView() {
  if(document.body.dataset.page!=='item'||user()?.role!=='admin')return;
  const i=items.find(x=>x.id===+new URLSearchParams(location.search).get('id'));
  if(!i)return;
  const legacy=i.claim==='pending'?[ {
    email:i.claimantEmail||'Student',name:i.claimantEmail||'Student',answers:i.claimAnswers||[],status:'pending'
  }]:[];
  i.claims=i.claims||legacy;
  const pending=i.claims.filter(c=>c.status==='pending');
  $('#itemPage').innerHTML=`<a class="back-link" href="admin.html">← Back to admin dashboard</a><section class="admin-item-page"><div class="admin-item-overview"><span class="moderation-icon">${i.icon||icon(i.category)}</span><div><p class="eyebrow"><span></span> ADMIN ITEM REVIEW</p><h1>${i.name}</h1><p>${i.type.toUpperCase()} · ${i.zone} · Reported ${date(i.date)}</p><div class="admin-item-status">${i.status==='Returned'?'RETURNED':'ACTIVE'}${pending.length?` · $ {
    pending.length
  }
  CLAIM$ {
    pending.length>1?'S':''
  }
  PENDING`:''}</div></div><button class="visibility" id="removeAdminItem">Remove item</button></div><section class="admin-claims"><h2>Claims submitted by students</h2><p class="admin-intro">Compare each student’s answers with the item’s verified details before making a decision.</p>${pending.length?pending.map((c,n)=>`<article class="admin-claim-card"><div><span class="claim-number">$ {
    String(n+1).padStart(2,'0')
  }
  </span><h3>$ {
    c.name||'Student claimant'
  }
  </h3><p>$ {
    c.email
  }
  </p></div><div class="claim-answer-grid"><span><small>Colour</small>$ {
    c.answers[0]||'—'
  }
  </span><span><small>Location</small>$ {
    c.answers[1]||'—'
  }
  </span><span><small>Private feature</small>$ {
    c.answers[2]||'—'
  }
  </span><span><small>Description clue</small>$ {
    c.answers[3]||'—'
  }
  </span></div><div class="claim-actions"><button class="approve-claim" data-claim-accept="${n}">Accept claim</button><button class="reject-claim" data-claim-reject="${n}">Reject</button></div></article>`).join(''):'<p class="empty-map-state">There are no pending claims for this item.</p>'}</section></section>`;
  $('#removeAdminItem').onclick=()=> {
    if(confirm('Remove this report permanently?')) {
      items=items.filter(x=>x.id!==i.id);
      save();
      location.href='admin.html'
    }
  };
  $$('[data-claim-accept]').forEach(b=>b.onclick=()=> {
    const c=pending[+b.dataset.claimAccept];
    c.status='accepted';
    i.claims.forEach(x=> {
      if(x!==c&&x.status==='pending')x.status='rejected'
    });
    i.status='Returned';
    i.claim='approved';
    notify(c.email,`Your claim for “${i.name}” was accepted. Your item has been found—please collect it from the Security Office.`);
    save();
    toast('Claim accepted. The student has been notified.');
    adminItemView()
  });
  $$('[data-claim-reject]').forEach(b=>b.onclick=()=> {
    const c=pending[+b.dataset.claimReject];
    c.status='rejected';
    save();
    toast('Claim rejected.');
    adminItemView()
  })
}
setTimeout(adminItemView,0);
