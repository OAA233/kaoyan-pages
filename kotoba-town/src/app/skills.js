import { $, app, node, state, toast } from './context.js';
import { skillsFor } from '../actors/skill-catalog.js';
let signature = '';
export function refreshSkills() {
  const w=app.world, list=skillsFor(state.character), active=w?.skill;
  const pending=!!w?.skillLoading, unavailable=!!(app.busy||w?.characterChanging||w?.player?.userData.character.id!==state.character);
  const key=[state.character,active?.definition.id||'',pending,unavailable].join(':');
  if(key===signature)return;signature=key;
  const bar=$('skill-bar');bar.hidden=!list.length;
  $('skill-buttons').replaceChildren(...list.map((s,i)=>{
    const button=node('button','skill-button');button.dataset.skill=String(i);button.style.setProperty('--skill-color',s.color);
    button.title=s.zh+' · '+(i+1);button.setAttribute('aria-label',s.name+'（'+(i+1)+'）');
    button.append(node('kbd','',String(i+1)),node('strong','',s.short));button.disabled=!!active||pending||unavailable;
    button.onclick=()=>castSkill(i);return button;
  }));
  $('skill-cancel').hidden=!active&&!pending;
  $('skill-status').textContent=active?active.definition.name:pending?'準備しています…':'';
  $('skill-status').hidden=!active&&!pending;
  document.body.classList.toggle('casting-skill',!!active);
  if(active)$('skill-status').style.setProperty('--skill-color',active.definition.color);
  else bar.style.setProperty('--cast-progress','0');
}
export async function castSkill(index) {
  if(app.busy||app.panelKind||app.selected||app.world.disabled)return;
  await app.world.playSkill(index);
}
export function initSkills() {
  app.world.onSkillChange=refreshSkills;
  app.world.onSkillFrame=p=>$('skill-bar').style.setProperty('--cast-progress',String(p));
  app.world.onSkillError=()=>toast('アニメーションを読み込めませんでした。もう一度お試しください。');
  $('skill-cancel').onclick=()=>app.world.cancelSkill();
  window.addEventListener('keydown',e=>{
    if(e.repeat||e.isComposing||e.ctrlKey||e.metaKey||e.altKey||app.panelKind||app.selected||app.busy)return;
    if(e.target.closest?.('input,textarea,select,[contenteditable="true"]'))return;
    const i=['Digit1','Digit2','Digit3','Numpad1','Numpad2','Numpad3'].indexOf(e.code);
    if(i<0||!skillsFor(state.character)[i%3])return;
    e.preventDefault();castSkill(i%3);
  });
  window.addEventListener('blur',()=>app.world.cancelSkill());
  document.addEventListener('visibilitychange',()=>{if(document.hidden)app.world.cancelSkill()});
  $('chat-input').addEventListener('focus',()=>app.world.cancelSkill());
  refreshSkills();
}

