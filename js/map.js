/* Campus-zone selection and map report rendering. */
function renderMap() {
  if(document.body.dataset.page!=='map')return;
  function show(z) {
    let list=items.filter(i=>i.visible!==false&&(!z||i.zone===z));
    $('#zoneTitle').textContent=z?`${z} reports`:'All active campus reports';
    $('#zoneItems').innerHTML=list.map(i=>`<a class="map-report-card" href="item.html?id=${i.id}"><span class="map-report-icon ${i.type}">${i.icon||icon(i.category)}</span><span>${status(i)}<b>${i.name}</b><small>⌖ ${i.zone}</small></span><strong>→</strong></a>`).join('')||'<p class="empty-map-state">No active reports in this zone.</p>'
  }
  $$('.zone-card').forEach(b=>b.onclick=()=>show(b.dataset.zone));
  $('#showAllZones')&&($('#showAllZones').onclick=()=>show());
  show()
}
renderMap();
