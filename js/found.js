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
