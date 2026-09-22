(()=>{
const steps=[
 {tab:'start',title:'시작하기 버튼을 클릭했을 때',text:'시작 탭에서 가져옵니다.'},
 {tab:'hardware',title:'디지털 13번 핀 켜기',text:'하드웨어 탭에서 가져옵니다.'},
 {tab:'flow',title:'계속 반복하기',text:'흐름 탭에서 가져옵니다.'},
 {tab:'hardware',title:'디지털 3번 핀 켜기',text:'하드웨어 탭에서 가져옵니다.'},
 {tab:'flow',title:'0.2초 기다리기',text:'흐름 탭에서 가져옵니다.'},
 {tab:'hardware',title:'디지털 3번 핀 끄기',text:'하드웨어 탭에서 가져옵니다.'},
 {tab:'flow',title:'0.2초 기다리기',text:'흐름 탭에서 가져옵니다.'},
 {tab:'hardware',title:'디지털 3번 핀을 255로 정하기',text:'기존 네 블록을 오른쪽으로 옮기고 같은 의미의 코드를 비교합니다.'},
 {tab:'flow',title:'0.2초 기다리기',text:'흐름 탭에서 가져옵니다.'},
 {tab:'hardware',title:'디지털 3번 핀을 0으로 정하기',text:'하드웨어 탭에서 가져옵니다.'},
 {tab:'flow',title:'0.2초 기다리기',text:'흐름 탭에서 가져옵니다.'}
];
let step=0,pin13ResultShown=false,pin13ResultDone=false,basicResultShown=false,basicResultDone=false,finalResultShown=false;
function render(){document.querySelectorAll('[data-entry-step]').forEach(el=>{const n=+el.dataset.entryStep;el.classList.toggle('entry-show',n<=step);el.classList.toggle('entry-current',n===step&&step>0)});document.querySelectorAll('[data-repeat-body]').forEach(el=>el.classList.toggle('repeat-show',step>=4));const old4=document.querySelector('#entryBasicFour'),new4=document.querySelector('#entryCompareFour');if(old4)old4.classList.toggle('compare-right',step>=8);if(new4)new4.classList.toggle('compare-left',step>=8);document.querySelectorAll('.entry-tab').forEach(el=>el.classList.remove('active-tab'));if(step){const info=steps[step-1];document.querySelector('.entry-tab[data-tab="'+info.tab+'"]').classList.add('active-tab');document.querySelector('#entryGuideTitle').textContent=info.title;document.querySelector('#entryGuideText').textContent=info.text;}else{document.querySelector('#entryGuideTitle').textContent='다음 블록을 눌러 시작하세요.';document.querySelector('#entryGuideText').textContent='블록이 추가될 때 왼쪽에서 해당 블록의 탭이 함께 강조됩니다.';}document.querySelector('#back').disabled=step===0;document.querySelector('#forward').disabled=step===steps.length;document.querySelector('#step').textContent=step+' / '+steps.length;const bc=document.querySelector('#entryBlockCount');if(bc)bc.textContent=step;}
function showPin13Result(){const m=document.querySelector('#pin13Modal'),b=document.querySelector('#runPin13');if(!m)return;m.classList.add('show');m.setAttribute('aria-hidden','false');pin13ResultShown=true;if(b)b.textContent='■ 종료'}
function hidePin13Result(){const m=document.querySelector('#pin13Modal'),b=document.querySelector('#runPin13');if(!m)return;m.classList.remove('show');m.setAttribute('aria-hidden','true');pin13ResultShown=false;if(b)b.textContent='▶ 실행'}
function showFinalResult(){const p=document.querySelector('#entryFinalResult');if(!p)return;p.classList.add('show');p.setAttribute('aria-hidden','false');finalResultShown=true}
function hideFinalResult(){const p=document.querySelector('#entryFinalResult');if(!p)return;p.classList.remove('show');p.setAttribute('aria-hidden','true');finalResultShown=false}
function next(){
 if(step===6&&!basicResultDone&&!basicResultShown){showFinalResult();basicResultShown=true;return;}
 if(step===6&&basicResultShown){hideFinalResult();basicResultShown=false;basicResultDone=true;return;}
 if(step===steps.length&&!finalResultShown){showFinalResult();return;}
 if(step===2&&!pin13ResultDone&&!pin13ResultShown){showPin13Result();return;}
 if(step===2&&pin13ResultShown){hidePin13Result();pin13ResultDone=true;return;}
 step=Math.min(steps.length,step+1);render();
}
function prev(){if(finalResultShown){hideFinalResult();basicResultShown=false;return;}if(pin13ResultShown)hidePin13Result();step=Math.max(0,step-1);if(step<2)pin13ResultDone=false;render()}
window.entryLesson={next,prev,getStep:()=>step,max:steps.length,render,isResultOpen:()=>pin13ResultShown||finalResultShown,showPin13Result,hidePin13Result,showFinalResult,hideFinalResult};
function initRunResult(){
 const run=document.querySelector('#runPin13'),modal=document.querySelector('#pin13Modal'),close=document.querySelector('#pin13Close');
 if(!run||!modal)return;
 run.addEventListener('click',e=>{e.stopPropagation();pin13ResultShown?hidePin13Result():showPin13Result();});
 const hide=()=>hidePin13Result();
 close?.addEventListener('click',hide);
 modal.addEventListener('click',e=>{if(e.target===modal)hide();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('show'))hide();});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{render();initRunResult()});else{render();initRunResult()}
})();