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
addReportTools();
function refineReportControls() {
  const f=$('#reportForm');
  if(!f)return;
  const locations=['Square One','Tesla Block','Turing Block','Hostel Area','Martin Luther','Rockfellar','Alpha Zone','Omega Zone','Sportorium','Explotorium'],zone=$('#zone');
  if(zone) {
    zone.innerHTML='<option value="">Choose campus location</option>'+locations.map(x=>`<option>${x}</option>`).join('');
    zone.classList.add('modern-select')
  }
  $$('select').forEach(s=>s.classList.add('modern-select'));
  const time=$('#time');
  if(time) {
    time.outerHTML=`<select id="time" class="modern-select"><option value="">Choose a time</option>${['8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM','9:00 PM'].map(x=>`<option>$ {
      x
    }
    </option>`).join('')}</select>`
  }
  else {
    const date=$('#date');
    if(date&&date.parentElement?.parentElement) {
      date.parentElement.parentElement.insertAdjacentHTML('beforeend',`<label>Approximate time<select id="time" class="modern-select"><option value="">Choose a time</option>${['8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM','9:00 PM'].map(x=>`<option>$ {
        x
      }
      </option>`).join('')}</select></label>`)
    }
  }
}
setTimeout(refineReportControls,0);
function modernTimeInput() {
  const t=$('#time');
  if(!t||!t.parentElement)return;
  const holder=t.parentElement;
  holder.querySelector('#timePeriod')?.remove();
  t.outerHTML='<span class="time-combo"><input id="time" inputmode="numeric" autocomplete="off" placeholder="e.g. 4:30" pattern="^(0?[1-9]|1[0-2]):[0-5][0-9]$" title="Use a time such as 4:30"><select id="timePeriod" class="modern-select" aria-label="AM or PM"><option>AM</option><option selected>PM</option></select></span>'
}
setTimeout(modernTimeInput,20);

