function renderAdmin() {
  if(document.body.dataset.page!=='admin')return;
  let u=user();
  if(!u||u.role!=='admin')return;
  let pending=items.filter(i=>i.claim==='pending');
  $('#adminApp').innerHTML=`<div class="admin-dashboard"><div class="admin-head"><div><p class="eyebrow"><span></span> CAMPUSFOUND ADMIN</p><h1>Good morning, Admin.</h1><p>Moderate reports and decide verified ownership claims.</p></div></div><div class="admin-stats"><div class="stat"><span>Visible reports</span><b>${items.filter(i=>i.visible!==false).length}</b></div><div class="stat"><span>Returned items</span><b>${items.filter(i=>i.status==='Returned').length}</b></div><div class="stat"><span>Possible matches</span><b>${items.filter(i=>i.status==='Possible match').length}</b></div><div class="stat"><span>Claims to review</span><b>${pending.length}</b></div></div><section class="moderation"><h2>Claim review</h2>${pending.length?pending.map(i=>`<div class="claim-review"><div><b>$ {
    i.name
  }
  </b><small>Claimant: $ {
    i.claimantEmail||'Student'
  }
  · $ {
    i.zone
  }
  </small><p>Answers: $ {
    i.claimAnswers?.join(' · ')||'Verified'
  }
  </p></div><button class="approve-claim" data-approve="${i.id}">Approve & return</button><button class="reject-claim" data-reject="${i.id}">Reject</button></div>`).join(''):'<p class="empty-map-state">No claims are waiting for review.</p>'}</section><section class="moderation"><h2>Report visibility</h2>${items.map(i=>`<div class="moderation-row"><span class="moderation-icon">$ {
    i.icon||icon(i.category)
  }
  </span><div class="moderation-info"><b>$ {
    i.name
  }
  </b><small>$ {
    i.type.toUpperCase()
  }
  · $ {
    i.status
  }
  </small></div><button class="visibility" data-hide="${i.id}">$ {
    i.visible===false?'Make visible':'Hide report'
  }
