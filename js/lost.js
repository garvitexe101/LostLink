function addReportTools() {
  const f=$('#reportForm');
  if(!f)return;
  let privateBox=$('#privateDetail').closest('label');
  privateBox.insertAdjacentHTML('afterend','<label class="image-upload">Attach a photo <span>Optional · stored in this browser only</span><input id="itemImage" type="file" accept="image/*"><img id="imagePreview" hidden alt="Item preview"></label><aside class="form-safety">⚠ For your safety, never arrange a handover in an isolated place. Use Security Office or Student Centre.</aside>');
  let preview='';
  $('#itemImage').onchange=e=> {
    const file=e.target.files[0];
    if(!file)return;
    const r=new FileReader();
    r.onload=()=> {
      preview=r.result;
      let img=$('#imagePreview');
      img.src=preview;
      img.hidden=false
    };
    r.readAsDataURL(file)
  };
  $('#date').value=new Date().toISOString().slice(0,10);
  f.onsubmit=e=> {
    e.preventDefault();
    if(!user()) {
      toast('Please sign in first so your report can appear in My reports.');
      location.href='profile.html';
      return
    }
    if(!f.checkValidity()) {
      f.reportValidity();
      return
    }
    let d= {
      id:Date.now(),type:$('#reportType').value,name:$('#itemName').value,category:$('#category').value,colour:$('#colour').value,zone:$('#zone').value,date:$('#date').value,desc:$('#description').value,privateDetail:$('#privateDetail').value,deposit:$('#deposit')?.value||'Owner report',icon:icon($('#category').value),art:art($('#category').value),visible:true,status:'Open',ownerEmail:user().email,image:preview
    };
    let match=items.some(i=>i.type!==d.type&&i.category===d.category&&i.zone===d.zone);
    if(match)d.status='Possible match';
    items.unshift(d);
    save();
    toast(match?'Report posted — a possible match was found near your location.':'Report posted successfully.');
    setTimeout(()=>location.href='profile.html',900)
  }
}
