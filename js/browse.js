/* Browse search, filters, counts, and report-card rendering. */
function renderBrowse() {
  if(!$('#itemGrid'))return;
  let q=$('#searchInput').value.toLowerCase(),list=items.filter(i=>i.visible!==false&&(cat==='all'||i.category===cat)&&(type==='all'||i.type===type)&&(`${i.name} ${i.zone} ${i.colour}`).toLowerCase().includes(q));
  $('#itemGrid').innerHTML=list.map(card).join('');
  $('#emptyState').hidden=!!list.length;
  bindCards();
  $('#resultsHeading')&&($('#resultsHeading').textContent=`${cat==='all'?'All':cat} ${type==='all'?'active reports':type+' reports'}`);
  let v=items.filter(i=>i.visible!==false),counts= {
    all:v.length,electronics:v.filter(i=>i.category==='Electronics').length,id:v.filter(i=>i.category==='ID / Card').length,bags:v.filter(i=>i.category==='Bags').length,keys:v.filter(i=>i.category==='Keys').length,other:v.filter(i=>!['Electronics','ID / Card','Bags','Keys'].includes(i.category)).length
  };
  Object.entries(counts).forEach(([k,n])=> {
    let e=$('#count-'+k);
    if(e)e.textContent=n
  })
}
if($('#itemGrid')) {
  $('#searchInput').oninput=renderBrowse;
  $('#searchButton').onclick=renderBrowse;
  $$('.category-tab,.filter').forEach(b=>b.onclick=()=> {
    cat=b.dataset.filter;
    $$('.category-tab,.filter').forEach(x=>x.classList.toggle('active',x===b));
    renderBrowse()
  });
  $$('.type-filter').forEach(b=>b.onclick=()=> {
    type=b.dataset.type;
    $$('.type-filter').forEach(x=>x.classList.toggle('active',x===b));
    renderBrowse()
  });
  renderBrowse()
}
