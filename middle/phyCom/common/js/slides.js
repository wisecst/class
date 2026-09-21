
const fullscreenBtn=document.querySelector('#fullscreenBtn');
function syncFullscreenButton(){
  const on=!!document.fullscreenElement;
  fullscreenBtn.textContent=on?'×':'⛶';
  fullscreenBtn.setAttribute('aria-label',on?'전체화면 종료':'전체화면으로 보기');
  fullscreenBtn.title=on?'전체화면 종료 (Esc)':'전체화면';
}
fullscreenBtn.addEventListener('click',async()=>{
  try{
    if(!document.fullscreenElement){await document.documentElement.requestFullscreen();}
    else{await document.exitFullscreen();}
  }catch(e){alert('이 브라우저에서는 전체화면 전환을 사용할 수 없습니다.');}
});
document.addEventListener('fullscreenchange',syncFullscreenButton);
syncFullscreenButton();

const ss=[...document.querySelectorAll('.slide')];
let si=0;
const pv=document.querySelector('#prev'),nx=document.querySelector('#next');
let circuitStep=0;
function show(n){si=Math.max(0,Math.min(ss.length-1,n));
ss.forEach((s,i)=>s.classList.toggle('active',i===si));
pv.disabled=si===0;
nx.disabled=si===ss.length-1;
document.querySelector('#slides').textContent=(si+1)+' / '+ss.length;
document.body.classList.toggle('after-intro',si>0);
const subtitle=document.querySelector('#slideSubtitle');
if(subtitle) subtitle.textContent=si>0?(ss[si].querySelector('h2')?.textContent.replace(/^\d+\.\s*/,'')||''):'';
if(si===1&&window.lessonCircuit) requestAnimationFrame(()=>requestAnimationFrame(()=>window.lessonCircuit.refresh()));
}pv.onclick=()=>{if(si===1&&window.lessonCircuit&&window.lessonCircuit.getStep()>0){window.lessonCircuit.prev();}else if(si===2&&window.entryLesson&&window.entryLesson.getStep()>0){window.entryLesson.prev();}else show(si-1)};
nx.onclick=()=>{if(si===1&&window.lessonCircuit&&window.lessonCircuit.getStep()<3){window.lessonCircuit.next();}else if(si===2&&window.entryLesson&&window.entryLesson.getStep()<window.entryLesson.max){window.entryLesson.next();}else show(si+1)};

// 키보드/프리젠터 조작
// 일반적인 프리젠터는 PageUp/PageDown 또는 좌/우 방향키 신호를 보내므로 함께 지원합니다.
// F5는 브라우저 기본 새로고침 키라 웹페이지가 직접 가로챌 수 없습니다.
// 대신 F 키로 전체화면을 전환하고, 브라우저 자체 F11 전체화면도 사용할 수 있습니다.
document.addEventListener('keydown', async (e)=>{
  const tag=(e.target.tagName||'').toLowerCase();
  if(tag==='input'||tag==='textarea'||e.target.isContentEditable) return;
  if(['ArrowRight','PageDown',' '].includes(e.key)){
    e.preventDefault();
    if(si===1&&window.lessonCircuit&&window.lessonCircuit.getStep()<3){window.lessonCircuit.next();}
    else if(si===2&&window.entryLesson&&window.entryLesson.getStep()<window.entryLesson.max){window.entryLesson.next();}
    else if(si===4&&window.pwmLesson&&window.pwmLesson.canNext()){window.pwmLesson.next();}
    else show(si+1);
    return;
  }
  if(['ArrowLeft','PageUp'].includes(e.key)){
    e.preventDefault();
    if(si===1&&window.lessonCircuit&&window.lessonCircuit.getStep()>0){window.lessonCircuit.prev();}
    else if(si===2&&window.entryLesson&&window.entryLesson.getStep()>0){window.entryLesson.prev();}
    else if(si===4&&window.pwmLesson&&window.pwmLesson.canPrev()){window.pwmLesson.prev();}
    else show(si-1);
    return;
  }
  if(e.key==='Home'){e.preventDefault(); show(0); return;}
  if(e.key==='End'){e.preventDefault(); show(ss.length-1); return;}
  if(e.key==='f'||e.key==='F'){
    e.preventDefault();
    try{
      if(!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    }catch(err){}
  }
});
// 편집 모드: 주소 뒤에 ?edit=1을 붙이면 표시됩니다.
const editMode = new URLSearchParams(location.search).get('edit') === '1';
if (editMode) {
  const panel = document.createElement('aside');
  panel.className = 'edit-panel';
  panel.innerHTML = `
    <h3>LED 페이지 편집 모드</h3>
    <label>글자 배경색</label>
    <input id="editLeadBg" type="color" value="#fff3c4">
    <label>LED 글자색</label>
    <input id="editLedColor" type="color" value="#e63946">
    <label>다이오드 글자색</label>
    <input id="editDiodeColor" type="color" value="#6a4c93">
    <label>말풍선 배경색</label>
    <input id="editBubbleBg" type="color" value="#6a4c93">
    <label>말풍선 위치(위·아래)</label>
    <input id="editBubbleY" type="range" min="-20" max="30" value="0">
    <label>이미지 크기</label>
    <input id="editImageWidth" type="range" min="300" max="900" value="700">
    <label>이미지 가로 위치</label>
    <input id="editImageX" type="range" min="-180" max="180" value="0">
    <div class="edit-actions">
      <button id="editSave">브라우저에 저장</button>
      <button id="editExport">HTML 다운로드</button>
      <button id="editReset">초기화</button>
    </div>
    <p class="hint">수정 내용은 우선 이 브라우저에 저장됩니다. HTML 다운로드 후 GitHub에 올리면 다른 기기에서도 사용할 수 있습니다.</p>
  `;
  document.body.append(panel);
  const lead = document.querySelector('.lead');
  const led = document.querySelector('.led-name');
  const diode = document.querySelector('.diode-word');
  const bubble = document.querySelector('.diode-bubble');
  const image = document.querySelector('.module-photo');
  const controls = {
    leadBg: document.querySelector('#editLeadBg'),
    ledColor: document.querySelector('#editLedColor'),
    diodeColor: document.querySelector('#editDiodeColor'),
    bubbleBg: document.querySelector('#editBubbleBg'),
    bubbleY: document.querySelector('#editBubbleY'),
    imageWidth: document.querySelector('#editImageWidth'),
    imageX: document.querySelector('#editImageX')
  };
  const apply = () => {
    lead.style.backgroundColor = controls.leadBg.value;
    led.style.color = controls.ledColor.value;
    diode.style.color = controls.diodeColor.value;
    bubble.style.backgroundColor = controls.bubbleBg.value;
    bubble.style.transform = `translateY(${controls.bubbleY.value}px)`;
    image.style.width = `${controls.imageWidth.value}px`;
    image.style.transform = `translateX(${controls.imageX.value}px)`;
  };
  const key = 'led-lesson-edit-settings';
  const saved = JSON.parse(localStorage.getItem(key) || 'null');
  if (saved) Object.keys(controls).forEach(k => { if (saved[k] !== undefined) controls[k].value = saved[k]; });
  Object.values(controls).forEach(input => input.addEventListener('input', apply));
  apply();
  document.querySelector('#editSave').onclick = () => {
    const data = Object.fromEntries(Object.entries(controls).map(([k, v]) => [k, v.value]));
    localStorage.setItem(key, JSON.stringify(data));
    alert('이 브라우저에 저장했습니다.');
  };
  document.querySelector('#editReset').onclick = () => {
    localStorage.removeItem(key);
    location.reload();
  };
  document.querySelector('#editExport').onclick = () => {
    panel.remove();
    const html = '<!doctype html>\\n' + document.documentElement.outerHTML;
    const blob = new Blob([html], {type:'text/html;charset=utf-8'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'led-lesson-edited.html';
    a.click();
  };
}
