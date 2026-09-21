(()=>{
const steps=[
 {tab:'start',title:'시작하기 버튼을 클릭했을 때',text:'시작 탭에서 가져옵니다.'},
 {tab:'hardware',title:'디지털 13번 핀 켜기',text:'하드웨어 탭에서 가져옵니다.'},
 {tab:'flow',title:'계속 반복하기',text:'흐름 탭에서 가져옵니다.'},
 {tab:'hardware',title:'디지털 3번 핀 켜기',text:'하드웨어 탭에서 가져옵니다.'},
 {tab:'flow',title:'0.2초 기다리기',text:'흐름 탭에서 가져옵니다.'},
 {tab:'hardware',title:'디지털 3번 핀 끄기',text:'하드웨어 탭에서 가져옵니다.'},
 {tab:'flow',title:'0.2초 기다리기',text:'흐름 탭에서 가져옵니다.'}
];
let step=0;
function render(){document.querySelectorAll('[data-entry-step]').forEach(el=>el.classList.toggle('entry-show',+el.dataset.entryStep<=step));document.querySelectorAll('[data-repeat-body]').forEach(el=>el.classList.toggle('repeat-show',step>=3));document.querySelectorAll('.entry-tab').forEach(el=>el.classList.remove('active-tab'));if(step){const info=steps[step-1];document.querySelector('.entry-tab[data-tab="'+info.tab+'"]').classList.add('active-tab');document.querySelector('#entryGuideTitle').textContent=info.title;document.querySelector('#entryGuideText').textContent=info.text;}else{document.querySelector('#entryGuideTitle').textContent='다음 블록을 눌러 시작하세요.';document.querySelector('#entryGuideText').textContent='블록이 추가될 때 왼쪽에서 해당 블록의 탭이 함께 강조됩니다.';}document.querySelector('#back').disabled=step===0;document.querySelector('#forward').disabled=step===steps.length;document.querySelector('#step').textContent=step+' / '+steps.length;}
function next(){step=Math.min(steps.length,step+1);render()}function prev(){step=Math.max(0,step-1);render()}
window.entryLesson={next,prev,getStep:()=>step,max:steps.length,render};
function initRunResult(){
 const run=document.querySelector('#runPin13'),modal=document.querySelector('#pin13Modal'),close=document.querySelector('#pin13Close');
 if(!run||!modal)return;
 run.addEventListener('click',e=>{e.stopPropagation();modal.classList.add('show');modal.setAttribute('aria-hidden','false');});
 const hide=()=>{modal.classList.remove('show');modal.setAttribute('aria-hidden','true');};
 close?.addEventListener('click',hide);
 modal.addEventListener('click',e=>{if(e.target===modal)hide();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('show'))hide();});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{render();initRunResult()});else{render();initRunResult()}
})();