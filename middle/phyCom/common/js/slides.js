const fullscreenBtn=document.querySelector('#fullscreenBtn');
let mobilePresentation=window.navigator.standalone===true||window.matchMedia('(display-mode: standalone)').matches;
const iosInstallTip=document.querySelector('#iosInstallTip');
const isIphone=()=>/iPhone|iPod/.test(navigator.userAgent);
document.querySelector('#iosInstallTipClose')?.addEventListener('click',()=>{iosInstallTip.hidden=true;});
const mobileHint=document.querySelector('#mobileOrientationHint');
function isMobileLayout(){return window.innerWidth<=900||(navigator.maxTouchPoints>0&&window.innerWidth<=1024);}
function fitMobileLesson(){
  const mobile=isMobileLayout();
  document.body.classList.toggle('mobile-layout',mobile);
  if(!mobile){
    document.body.classList.remove('mobile-landscape','mobile-fullscreen');
    document.documentElement.style.removeProperty('--mobile-sidebar-width');
    document.documentElement.style.removeProperty('--lesson-scale');
    return;
  }
  const viewport=window.visualViewport;
  const width=viewport?.width||window.innerWidth;
  const height=viewport?.height||window.innerHeight;
  const edge=mobilePresentation||document.fullscreenElement?0:12;
  const landscape=width>height;
  const full=mobilePresentation||!!document.fullscreenElement;
  const sidebarWidth=landscape&&!full?Math.min(148,Math.max(112,Math.round(width*.17))):0;
  document.body.classList.toggle('mobile-landscape',landscape);
  document.body.classList.toggle('mobile-fullscreen',full);
  document.documentElement.style.setProperty('--mobile-sidebar-width',sidebarWidth+'px');
  const scale=Math.min((width-sidebarWidth-edge*2)/1280,(height-edge*2)/720);
  document.documentElement.style.setProperty('--lesson-scale',String(scale));
  mobileHint.hidden=width>=height;
  window.lessonCircuit?.refresh?.();
}
function syncFullscreenButton(){
  const on=!!document.fullscreenElement||mobilePresentation;
  fullscreenBtn.textContent=on?'×':'⛶';
  fullscreenBtn.setAttribute('aria-label',on?'전체화면 종료':'전체화면으로 보기');
  fullscreenBtn.title=on?'전체화면 종료':'전체화면';
  fullscreenBtn.setAttribute('aria-pressed',String(on));
  document.body.classList.toggle('mobile-presentation',mobilePresentation);
  fitMobileLesson();
}
fullscreenBtn.addEventListener('click',async()=>{
  if(mobilePresentation){
    mobilePresentation=false;
    iosInstallTip.hidden=true;
    syncFullscreenButton();
    return;
  }
  if(document.fullscreenElement){
    await document.exitFullscreen();
    return;
  }
  try{
    if(!document.documentElement.requestFullscreen)throw new Error('unsupported');
    await document.documentElement.requestFullscreen();
  }catch(e){
    // Safari on iPhone does not expose document fullscreen for normal pages.
    // Keep the slide edge-to-edge without claiming browser chrome disappears.
    if(isMobileLayout()){
      mobilePresentation=true;
      syncFullscreenButton();
      if(isIphone()&&!navigator.standalone&&!window.matchMedia('(display-mode: standalone)').matches){
        iosInstallTip.hidden=false;
      }
    }
  }
});
document.addEventListener('fullscreenchange',syncFullscreenButton);
window.addEventListener('resize',fitMobileLesson);
window.visualViewport?.addEventListener('resize',fitMobileLesson);
window.visualViewport?.addEventListener('scroll',fitMobileLesson);
window.addEventListener('orientationchange',()=>{
  requestAnimationFrame(()=>requestAnimationFrame(fitMobileLesson));
  setTimeout(fitMobileLesson,350);
});
syncFullscreenButton();

const lessonDialogs=[...document.querySelectorAll('.lesson-dialog')];
document.querySelectorAll('[data-open-dialog]').forEach(trigger=>{
  trigger.addEventListener('click',()=>{
    const dialog=document.getElementById(trigger.dataset.openDialog);
    if(dialog&&!dialog.open)dialog.showModal();
  });
});
lessonDialogs.forEach(dialog=>{
  dialog.querySelector('[data-close-dialog]')?.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
});

const ss=[...document.querySelectorAll('.slide')];
let si=0;
const pv=document.querySelector('#prev'),nx=document.querySelector('#next');
const mobilePrev=document.querySelector('#mobilePrev'),mobileNext=document.querySelector('#mobileNext');
mobilePrev?.addEventListener('click',()=>pv.click());
mobileNext?.addEventListener('click',()=>nx.click());
function syncMobileNav(){
 if(mobilePrev)mobilePrev.disabled=pv.disabled;
 if(mobileNext){mobileNext.disabled=nx.disabled;mobileNext.setAttribute('aria-label',nx.getAttribute('aria-label'));}
}
const sidebarList=document.querySelector('#slideSidebarList');
if(sidebarList){
 const names=['1. LED 알아보기','2. 회로 연결','3. LED 코드 만들기','4. 디지털 출력 블록 비교','5. PWM','6. 코딩 전 설정','7. PWM 코드 작성'];
 ss.forEach((slide,i)=>{
   const b=document.createElement('button');
   b.type='button';b.className='slide-sidebar-item';
   b.innerHTML='<span class="sidebar-page-no">'+(i+1)+'</span><span>'+(names[i]||slide.querySelector('h2')?.textContent||('페이지 '+(i+1)))+'</span>';
   b.addEventListener('click',()=>{
     document.querySelector('#pwmPinBoardPopup')?.classList.remove('show');
     comparePopupShown=false;
     show(i);
   });
   sidebarList.appendChild(b);
 });
}
let circuitStep=0;
let comparePopupShown=false;
let sceneStep=0;
let manualSetupDialog=null;
let chosenLed=1;
function updateScene(){
 const slide=document.querySelector('.entry-setup-slide');if(!slide)return;
 const second=slide.querySelector('[data-scene="2"]');
 const step=sceneStep;
 second.hidden=step<1;
 second.classList.toggle('active',step>=1);
 slide.querySelector('[data-scene="1"]').classList.toggle('active',step<1);
 slide.querySelector('.entry-setup-layout').dataset.setupStep=String(step);
 const objectDialog=slide.querySelector('#objectChooser');
 const variableDialog=slide.querySelector('#variableChooser');
 objectDialog.hidden=!(manualSetupDialog==='object'||(!manualSetupDialog&&step>=2&&step<=4));
 variableDialog.hidden=!(manualSetupDialog==='variable'||(!manualSetupDialog&&step===6));
 const search=slide.querySelector('#objectSearch');
 if(!manualSetupDialog)search.value=step>=3?'LED':'';
 slide.querySelectorAll('[data-led-option]').forEach(button=>{
   button.classList.toggle('selected',Number(button.dataset.ledOption)===chosenLed&&step>=4);
   button.hidden=!search.value.trim().toUpperCase().includes('LED');
 });
 slide.querySelector('#setupVariable').hidden=step<7;
 slide.querySelector('.entry-setup-led').dataset.led=String(chosenLed);
 const variableName=slide.querySelector('#variableName').value.trim()||'밝기';
 slide.querySelector('#setupVariable b').textContent=variableName;
 document.querySelector('#codeVariableName').textContent=variableName;
 const captions=[
   '장면 1 옆의 +를 눌러 새 장면을 만듭니다.',
   '장면 2가 추가되었습니다. 오브젝트를 추가해 봅시다.',
   '오브젝트 추가하기 화면을 엽니다.',
   '검색창에 LED를 입력해 네 가지 오브젝트를 찾습니다.',
   'LED 오브젝트 하나를 선택합니다.',
   '추가하기를 눌러 LED 오브젝트를 장면 2에 넣었습니다.',
   '속성에서 새 변수를 만듭니다.',
   '변수가 추가되었습니다. 다음 페이지에서 코드를 작성합니다.'
 ];
 slide.querySelector('#sceneGuide').textContent=captions[step];
}
function advanceSetup(){
 if(manualSetupDialog)manualSetupDialog=null;
 if(sceneStep<7){sceneStep++;updateScene();}
 else show(6);
}
function previousSetup(){
 if(manualSetupDialog){manualSetupDialog=null;updateScene();return;}
 if(sceneStep>0){sceneStep--;updateScene();}
 else show(4);
}
document.querySelector('#sceneAdd')?.addEventListener('click',()=>{sceneStep=Math.max(1,sceneStep);manualSetupDialog=null;updateScene();});
document.querySelector('#openObjectChooser')?.addEventListener('click',()=>{manualSetupDialog='object';updateScene();});
document.querySelector('#openVariableChooser')?.addEventListener('click',()=>{manualSetupDialog='variable';updateScene();});
document.querySelectorAll('.entry-setup-slide [data-setup-close]').forEach(button=>button.addEventListener('click',()=>{manualSetupDialog=null;updateScene();}));
document.querySelector('#objectSearch')?.addEventListener('input',event=>{
 document.querySelectorAll('[data-led-option]').forEach(button=>button.hidden=!event.target.value.trim().toUpperCase().includes('LED'));
});
document.querySelectorAll('[data-led-option]').forEach(button=>button.addEventListener('click',()=>{
 chosenLed=Number(button.dataset.ledOption);
 sceneStep=Math.max(4,sceneStep);updateScene();
}));
document.querySelector('#confirmObject')?.addEventListener('click',()=>{sceneStep=Math.max(5,sceneStep);manualSetupDialog=null;updateScene();});
document.querySelector('#confirmVariable')?.addEventListener('click',()=>{sceneStep=7;manualSetupDialog=null;updateScene();});
function show(n){const from=si;const target=Math.max(0,Math.min(ss.length-1,n));
 lessonDialogs.forEach(dialog=>{if(dialog.open)dialog.close();});
const pwmPopup=document.querySelector('#pwmPinBoardPopup');
/* Returning from PWM (5) to comparison (4): show the board popup again.
   It is transient; the next backward signal closes it and reveals page 4. */
const returnToCompare=from===4&&target===3;
if(!returnToCompare){pwmPopup?.classList.remove('show');pwmPopup?.setAttribute('aria-hidden','true');}
si=target;
ss.forEach((s,i)=>s.classList.toggle('active',i===si));
pv.disabled=si===0;
nx.disabled=false;
nx.setAttribute('aria-label',si===5?'설정 다음 단계':'다음 슬라이드');
document.querySelector('#slides').textContent=(si+1)+' / '+ss.length;
document.body.classList.toggle('after-intro',si>0);
  document.body.classList.toggle('entry-page',si===2||si===3||si===5||si===6);
document.querySelectorAll('.slide-sidebar-item').forEach((b,i)=>b.classList.toggle('active',i===si));
const subtitle=document.querySelector('#slideSubtitle');
if(subtitle){let t=si>0?(ss[si].querySelector('h2')?.textContent||''):'';if(si===1)t='2. 회로 연결';subtitle.textContent=t;}
if(returnToCompare){
 pwmPopup?.classList.add('show');pwmPopup?.setAttribute('aria-hidden','false');
 comparePopupShown=true;
}else if(si===3){
 comparePopupShown=false;
}
if(si===5){sceneStep=from===6?7:0;manualSetupDialog=null;updateScene();}
if(si===2&&from!==2&&window.entryLesson?.isFinished?.()){
 requestAnimationFrame(()=>window.entryLesson.showCompleted());
}
if(si===1&&window.lessonCircuit){
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
   window.lessonCircuit.refresh();
   if(from===2)window.lessonCircuit.setStep(3);
 }));
}
 syncMobileNav();
}pv.onclick=()=>{if(si===6){show(5);}else if(si===5){previousSetup();}else if(si===1){show(0);}else if(si===2&&window.entryLesson?.isFinished?.()){show(1);}
    else if(si===2&&window.entryLesson&&window.entryLesson.getStep()>0){window.entryLesson.prev();}
    else if(si===2){show(1);}else show(si-1)};
function advancePwm(){
 const lesson=window.pwmLesson;
 if(!lesson)return;
 if(lesson.isPlaying())return;
 if(lesson.hasCompleted()){show(5);return;}
 if(lesson.canNext())lesson.next();
 else lesson.play();
}
nx.onclick=()=>{
 if(si===5){advanceSetup();return;}
 if(si===4){advancePwm();return;}
 if(si===3&&!comparePopupShown){const p=document.querySelector('#pwmPinBoardPopup');p?.classList.add('show');p?.setAttribute('aria-hidden','false');comparePopupShown=true;return;}
 if(si===3&&comparePopupShown){document.querySelector('#pwmPinBoardPopup')?.classList.remove('show');show(4);return;}
 if(si===1&&window.lessonCircuit&&window.lessonCircuit.getStep()<3){window.lessonCircuit.next();}else if(si===2&&window.entryLesson){if(window.entryLesson.isFinished?.())show(si+1);else window.entryLesson.next();}else show(si+1)};

// 키보드/프리젠터 조작
// 일반적인 프리젠터는 PageUp/PageDown 또는 좌/우 방향키 신호를 보내므로 함께 지원합니다.
// F5는 브라우저 기본 새로고침 키라 웹페이지가 직접 가로챌 수 없습니다.
// 대신 F 키로 전체화면을 전환하고, 브라우저 자체 F11 전체화면도 사용할 수 있습니다.
document.addEventListener('keydown', async (e)=>{
  if(lessonDialogs.some(dialog=>dialog.open))return;
  const tag=(e.target.tagName||'').toLowerCase();
  if(tag==='input'||tag==='textarea'||e.target.isContentEditable) return;
  if(['ArrowRight','PageDown',' '].includes(e.key)){
    e.preventDefault();
    if(si===3&&!comparePopupShown){const p=document.querySelector('#pwmPinBoardPopup');p?.classList.add('show');p?.setAttribute('aria-hidden','false');comparePopupShown=true;return;}
    if(si===3&&comparePopupShown){document.querySelector('#pwmPinBoardPopup')?.classList.remove('show');show(4);return;}
    if(si===1&&window.lessonCircuit&&window.lessonCircuit.getStep()<3){window.lessonCircuit.next();}
    else if(si===2&&window.entryLesson){if(window.entryLesson.isFinished?.())show(si+1);else window.entryLesson.next();}
    else if(si===4){advancePwm();}
    else if(si===5){advanceSetup();}
    else show(si+1);
    return;
  }
  if(['ArrowLeft','PageUp'].includes(e.key)){
    e.preventDefault();
    if(si===6){show(5);}
    else if(si===5){previousSetup();}
    else if(si===1){show(0);}
    else if(si===2&&window.entryLesson?.isFinished?.()){show(1);}
    else if(si===2&&window.entryLesson&&window.entryLesson.getStep()>0){window.entryLesson.prev();}
    else if(si===2){show(1);}
    else if(si===4){show(3);}
    else if(si===3&&comparePopupShown){
      document.querySelector('#pwmPinBoardPopup')?.classList.remove('show');
      document.querySelector('#pwmPinBoardPopup')?.setAttribute('aria-hidden','true');
      comparePopupShown=false;
    }
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
