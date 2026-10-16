import {lots,streets} from './town-layout.js';
export function districtMap(catalog,world,onEnter){
 const ns='http://www.w3.org/2000/svg',wrap=document.createElement('div');wrap.className='district-map';
 const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','-89 -91 180 184');svg.setAttribute('role','group');svg.setAttribute('aria-label','町の地図。建物を選ぶと入れます。');
 const add=(tag,attrs,text,parent=svg)=>{const el=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))el.setAttribute(k,String(v));if(text!==undefined)el.textContent=text;parent.append(el);return el;};
 add('rect',{x:-89,y:-91,width:180,height:184,rx:6,fill:'#dce6c9'});
 add('path',{d:'M44 -92 Q40 -50 44 -20 T44 30 T49 92',fill:'none',stroke:'#a4cdd0','stroke-width':8});
 for(const r of streets){const pts=r.points.map(p=>p.join(',')).join(' ');add('polyline',{points:pts,fill:'none',stroke:'#f8f0d8','stroke-width':r.width+2,'stroke-linejoin':'round','stroke-linecap':'round'});add('polyline',{points:pts,fill:'none',stroke:'#a5ada1','stroke-width':r.width*.65,'stroke-linejoin':'round','stroke-linecap':'round'});}
 const colors=['#8fabb0','#c4956e','#ba938e','#93a782','#a7a19a','#a7ae8d'];
 catalog.forEach((c,index)=>{const[x,z,angle]=lots[c.id],g=add('g',{class:'map-building',tabindex:0,role:'button','aria-label':c.jp+'に入る'});add('rect',{x:x-5,y:z-4,width:10,height:8,rx:1.2,fill:colors[c.district]||colors[3],stroke:'#fff8e6','stroke-width':.45,transform:'rotate('+(-angle*180/Math.PI)+' '+x+' '+z+')'},undefined,g);add('text',{x,y:z+.9,'text-anchor':'middle','font-size':2.7,fill:'#fffef3','font-weight':700},String(index+1),g);add('title',{},c.jp,g);g.addEventListener('click',()=>onEnter(c.id));g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onEnter(c.id);}});});
 for(const [x,z,t]of[[-32,83,'駅前'],[-70,3,'住宅街'],[-7,-7,'飲食店街'],[17,-50,'商店街'],[-58,-75,'寺社・庭園'],[73,47,'川沿いのスポーツ広場'],[72,-82,'レジャーエリア']]){add('text',{x,y:z,'font-size':2.8,'text-anchor':'middle',fill:'#526853','font-weight':700,stroke:'#e9edda','stroke-width':.5,'paint-order':'stroke'},t);}
 const pos=world.worldMode==='town'?world.playerPos:null;if(pos){add('circle',{cx:pos.x,cy:pos.z,r:2.2,fill:'#e2ac6a',stroke:'white','stroke-width':.7});add('text',{x:pos.x,y:pos.z-3.2,'font-size':2.6,'text-anchor':'middle',fill:'#77542e'},'現在地');}
 add('text',{x:81,y:84,'font-size':3,'text-anchor':'middle',fill:'#58695c'},'北 ↑');
 wrap.append(svg);const caption=document.createElement('p');caption.textContent='地図の建物を選ぶと入れます。下の一覧からも探せます。';wrap.append(caption);return wrap;
}
