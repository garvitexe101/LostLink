function homeExtras() {
  if(document.body.dataset.page!=='home')return;
  let hero=$('.hero');
  hero?.insertAdjacentHTML('afterend','<aside class="safety-banner"><span>⚠</span><p><b>Campus safety reminder</b> Arrange handovers only in busy, well-lit places such as the Security Office or Student Centre.</p><a href="how-it-works.html#contact">Get support →</a></aside>');
  let target=$('.map-promo');
  target?.insertAdjacentHTML('beforebegin','<section class="returned-section"><div><p class="eyebrow"><span></span> SUCCESS STORIES</p><h2>Recently returned</h2><p>Honesty makes a difference on campus.</p></div><div id="returnedItems" class="returned-list"></div></section>');
  let r=items.filter(i=>i.status==='Returned');
  $('#returnedItems').innerHTML=r.length?r.map(i=>`<a href="item.html?id=${i.id}"><span>${i.icon||icon(i.category)}</span><b>${i.name}</b><small>Returned safely ✓</small></a>`).join(''):'<p>No returned items yet.</p>'
}
homeExtras();
function moveSafety() {
  const s=$('.safety-banner'),f=$('footer');
  if(s&&f)f.before(s)
}
moveSafety();
setTimeout(moveSafety,0);
