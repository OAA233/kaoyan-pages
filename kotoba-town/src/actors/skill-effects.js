// Short, locally rendered character performances. All geometry is owned by one cast and disposed at its end.
import * as T from '../vendor/three.module.min.js';
const clamp = x => Math.min(1, Math.max(0, x));
const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const TAU = Math.PI * 2, Y = new T.Vector3(0, 1, 0), X = new T.Vector3(1, 0, 0);

export function createSkillEffect(id, { scale, yaw, origin, reduced }) {
  const root = new T.Group(), materials = new Set(), geometries = new Set(), textures = new Set();
  root.name = 'character-skill-' + id; root.position.copy(origin); root.rotation.y = yaw; root.scale.setScalar(scale);
  const material = (color, opacity = 1, glow = false) => {
    const m = new T.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, depthTest: false, side: T.DoubleSide, toneMapped: false, blending: glow ? T.AdditiveBlending : T.NormalBlending });
    m.userData.baseOpacity = opacity; materials.add(m); return m;
  };
  const group = (parent = root, pos = [0,0,0]) => { const g = new T.Group(); g.position.set(...pos); parent.add(g); return g; };
  const mesh = (parent, geometry, color, pos = [0,0,0], opacity = 1, glow = false) => {
    geometries.add(geometry); const m = new T.Mesh(geometry, material(color, opacity, glow)); m.position.set(...pos); m.renderOrder = 21; parent.add(m); return m;
  };
  const box = (p, size, color, pos) => mesh(p, new T.BoxGeometry(...size), color, pos);
  const sphere = (p, r, color, pos, opacity = 1) => mesh(p, new T.SphereGeometry(r, 16, 12), color, pos, opacity);
  const ring = (p, r, color, pos, thick = .035, opacity = .8) => mesh(p, new T.TorusGeometry(r, thick, 6, 64), color, pos, opacity);
  const rod = (p, a, b, radius, color) => {
    const start = new T.Vector3(...a), end = new T.Vector3(...b), d = end.clone().sub(start);
    const m = mesh(p, new T.CylinderGeometry(radius, radius, 1, 8), color, start.clone().add(end).multiplyScalar(.5).toArray());
    m.scale.y = d.length(); m.quaternion.setFromUnitVectors(Y, d.normalize()); return m;
  };
  const arc = (p, points, color, radius = .025, opacity = .8) => mesh(p, new T.TubeGeometry(new T.CatmullRomCurve3(points.map(a => new T.Vector3(...a))), 44, radius, 5, false), color, [0,0,0], opacity);
  const glowCanvas = document.createElement('canvas'); glowCanvas.width = glowCanvas.height = 64;
  const ctx = glowCanvas.getContext('2d'), grad = ctx.createRadialGradient(32,32,0,32,32,31);
  grad.addColorStop(0,'rgba(255,255,255,1)'); grad.addColorStop(.18,'rgba(255,255,255,.7)'); grad.addColorStop(.55,'rgba(255,255,255,.2)'); grad.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle = grad; ctx.fillRect(0,0,64,64); const glowMap = new T.CanvasTexture(glowCanvas); textures.add(glowMap);
  function glow(p, r, color, pos = [0,0,0]) {
    const m = new T.SpriteMaterial({ map: glowMap, color, transparent:true, opacity:.38, depthWrite:false, depthTest:false, blending:T.AdditiveBlending, toneMapped:false });
    m.userData.baseOpacity=.38; materials.add(m); const s = new T.Sprite(m); s.scale.set(r,r,1); s.position.set(...pos); s.renderOrder=22; p.add(s); return s;
  }
  function orb(color, at = [0,0,0], radius = .65) {
    const g = group(root,at); sphere(g,radius,color); sphere(g,radius*.42,'#fff7ff',[0,0,.3],.9); glow(g,radius*5,color);
    for (let i=0;i<3;i++) { const r=ring(g,radius*(1.2+i*.24),color,[0,0,0],.025,.65); r.rotation.set(.5+i*.9,i*.8,.2); }
    return g;
  }
  function circle(p, r, color, pos) {
    const g=group(p,pos); ring(g,r,color); ring(g,r*.79,color,[0,0,0],.018); ring(g,r*.25,color,[0,0,0],.026);
    for(let i=0;i<12;i++){const a=i*TAU/12;rod(g,[Math.cos(a)*r*.86,Math.sin(a)*r*.86,0],[Math.cos(a)*r*.98,Math.sin(a)*r*.98,0],.024,color);}
    for(let i=0;i<3;i++){const a=TAU*i/3,b=a+TAU/3;rod(g,[Math.cos(a)*r*.69,Math.sin(a)*r*.69,0],[Math.cos(b)*r*.69,Math.sin(b)*r*.69,0],.02,color);}
    const aura=glow(g,r*2.1,color); aura.material.userData.baseOpacity=.16; return g;
  }
  function sword(parent, color = '#e6edff', ea = false) {
    const g=group(parent); box(g,[.13,.7,.14],ea?'#4f222c':'#274570',[0,-.25,0]);
    box(g,[.78,.12,.22],'#e5bb56',[0,.16,0]); sphere(g,.12,'#f5d87e',[0,-.64,0]);
    if(ea){
      for(let i=0;i<3;i++) {const c=mesh(g,new T.CylinderGeometry(.18,.22,.51,10),'#71373a',[0,.55+i*.54,0]);c.name='ea-drum';for(let j=0;j<3;j++)box(c,[.055,.48,.06],'#f1bd63',[Math.cos(j*TAU/3)*.19,0,Math.sin(j*TAU/3)*.19]);}
      mesh(g,new T.ConeGeometry(.2,.4,8),'#e0b55c',[0,2.04,0]);
    }else{
      const shape=new T.Shape();shape.moveTo(-.14,.24);shape.lineTo(.14,.24);shape.lineTo(.13,1.82);shape.lineTo(0,2.16);shape.lineTo(-.13,1.82);shape.closePath();
      mesh(g,new T.ExtrudeGeometry(shape,{depth:.045,bevelEnabled:false}),color);
      box(g,[.035,1.5,.025],'#fffef0',[0,1.06,.07]);
    }
    return g;
  }
  function staff(parent, fern) {
    const g=group(parent,[.7,.5,.24]); rod(g,[0,-.4,0],[0,2.75,0],.055,fern?'#594157':'#73543d');
    const head=ring(g,.36,fern?'#c0b7d9':'#dbbc64',[0,2.8,0],.065);head.scale.y=1.4;
    sphere(g,.19,fern?'#b274d0':'#c95564',[0,2.84,0]);return g;
  }
  function beam(parent, color, r = .35) {
    const g=group(parent);for(const [radius,c,o]of[[r,color,.35],[r*.43,color,.9],[r*.16,'#fffdef',.95]]){const m=mesh(g,new T.CylinderGeometry(radius,radius,1,12),c,[.5,0,0],o);m.rotation.z=-Math.PI/2;}
    return g;
  }
  function sparks(color, count = 48) {
    count = reduced ? Math.min(18,count) : count;
    const geo=new T.BufferGeometry(), arr=new Float32Array(count*3);geo.setAttribute('position',new T.BufferAttribute(arr,3));geometries.add(geo);
    const mat=new T.PointsMaterial({color,size:2.7,transparent:true,opacity:.85,depthTest:false,depthWrite:false,toneMapped:false});mat.userData.baseOpacity=.85;materials.add(mat);
    const p=new T.Points(geo,mat);p.renderOrder=23;root.add(p);return {p,arr,count,update(fn){for(let i=0;i<count;i++)arr.set(fn(i,i/count),i*3);geo.attributes.position.needsUpdate=true}};
  }
  let tick;
  if (['red','blue','purple'].includes(id)) {
    const color=id==='red'?'#f34268':id==='blue'?'#329dff':'#a15df6';
    const main=orb(color,[1.2,1.9,0],id==='purple'?.83:.63);
    const red=id==='purple'?orb('#fc4d6a',[1,3,0],.43):null, blue=id==='purple'?orb('#41a1ff',[1,.9,0],.43):null;
    const wave=Array.from({length:5},(_,i)=>{const r=ring(root,1,color,[2,1.9,0],.025+i*.003,.6);r.rotation.y=Math.PI/2;return r});
    const rays=Array.from({length:6},(_,i)=>{const a=i*TAU/6;return arc(root,Array.from({length:20},(_,j)=>{const x=j/19*9;return[x,1.9+Math.cos(a+x*.7)*.7,Math.sin(a+x*.7)*.7]}),color,.025,.5)});
    rays.forEach(r=>{r.geometry.translate(0,-1.9,0);r.position.set(1.2,1.9,0)});
    const particles=sparks(color,64);
    tick=t=>{
      const p=t/(id==='purple'?5.6:id==='red'?4.4:4.6), release=clamp((p-.48)/.34), charge=ease(p/.40);
      if(id==='blue'){
        main.position.x=2.2;main.scale.setScalar((.15+charge*.9)*(1-.7*ease((p-.83)/.15)));main.rotation.x=t*.9;main.rotation.z=t*.5;
        wave.forEach((r,i)=>{const q=(t*.38+i/5)%1;r.position.x=2.2;r.scale.setScalar(.5+(1-q)*2.7);r.rotation.set(q*2,.5+i*.65,t*.8);r.visible=p>.12&&p<.9});
        particles.update((i,f)=>{const q=(f+t*.6)%1, radius=(1-q)*3.1;return[2.2+Math.cos(f*TAU*5+t*2)*radius,1.9+Math.sin(f*TAU*5+t*2)*radius*.7,Math.cos(f*TAU*3)*radius*.6]});
        rays.forEach(r=>r.visible=false);
      }else{
        main.visible=id!=='purple'||p>.34;main.position.x=1.2+release*8;main.scale.setScalar((.12+charge*.86)*(1-.8*ease((p-.86)/.13)));main.rotation.x=t;
        if(red){const sep=1.4*(1-ease((p-.13)/.28));red.position.set(1.2,1.9+Math.cos(t*2)*sep,Math.sin(t*2)*sep);blue.position.set(1.2,1.9-Math.cos(t*2)*sep,-Math.sin(t*2)*sep);red.visible=blue.visible=p<.43;}
        wave.forEach((r,i)=>{r.visible=p>.43&&p<.92;const q=clamp((p-.43-i*.03)*2.8);r.position.x=1.3+q*8;r.scale.setScalar(.45+q*(id==='red'?2.5:1.3));});
        rays.forEach((r,i)=>{r.visible=release>0&&p<.89;r.scale.x=Math.max(.01,release);r.rotation.x=t*.45+i;});
        particles.update((i,f)=>p<.48?[1.2+Math.cos(f*TAU*4+t)*2.5*(1-charge),1.9+Math.sin(f*TAU*4+t)*2.5*(1-charge),Math.sin(f*14)*.5]:[1.1+f*release*9,1.9+Math.cos(f*30+t)*(.1+f*.6),Math.sin(f*30+t)*(.1+f*.6)]);
      }
    };
  } else if (id==='gates') {
    const portalCount=reduced?7:11;
    const portals=Array.from({length:portalCount},(_,i)=>{
      const a=Math.PI*.1+i/(portalCount-1)*Math.PI*.8;
      const pos=[Math.cos(a)*3.5-.8,1.4+Math.sin(a)*3.9,-1.4];
      const gate=circle(root,.53,'#ffca59',pos);gate.traverse(o=>{if(o.isMesh||o.isSprite)o.renderOrder=18});
      const blade=sword(root,i%3===0?'#ffe7a1':i%3===1?'#e4f0f7':'#ffcd7a');blade.scale.setScalar(.7+i%3*.12);blade.rotation.z=-Math.PI/2;blade.position.set(...pos);
      const trail=beam(root,'#f5cb68',.09);return{gate,blade,trail,pos};
    });
    tick=t=>portals.forEach(({gate,blade,trail,pos},i)=>{
      const opening=ease((t-.1-i*.045)/.65), flight=clamp((t-1.55-i*.085)/1.22);
      gate.visible=t<4.7;gate.scale.setScalar(opening*(1-ease((t-4.2)/.7)));gate.rotation.z=t*(i%2?-.3:.3);
      blade.visible=opening>.1&&flight<1;blade.position.set(pos[0]+flight*12,pos[1]-flight*1.8,pos[2]+flight*.5);
      trail.visible=flight>0&&flight<1;trail.position.copy(blade.position);trail.scale.set(-1.6,1,1);
    });
  } else if (id==='excalibur'||id==='ea') {
    const ea=id==='ea', weapon=sword(root,'#dbeeff',ea);weapon.position.set(.65,1.8,.3);
    const color=ea?'#ef5762':'#ffe28b', blast=beam(root,color,ea?.9:.65), sigil=circle(root,1.25,ea?'#c74454':'#ebc765',[1.3,1.8,0]);sigil.rotation.y=Math.PI/2;
    const spiral=Array.from({length:3},(_,i)=>arc(root,Array.from({length:48},(_,j)=>{const x=j/47*9,a=x*2+i*TAU/3,r=.35+x*.09;return[x,1.8+Math.cos(a)*r,Math.sin(a)*r]}),ea?'#ec6678':'#fff4c3',.035,.8));
    spiral.forEach(s=>{s.geometry.translate(0,-1.8,0);s.position.set(1.2,1.8,0)});
    const halo=ring(root,1.25,ea?'#d14855':'#fbe2a4',[0,.06,0],.04,.8);halo.rotation.x=-Math.PI/2;
    const particles=sparks(ea?'#ed6671':'#efd382',60);
    tick=t=>{const p=t/(ea?5.5:5.2), slash=ease((p-.37)/.14), power=ease((p-.46)/.1)*(1-ease((p-.81)/.17));
      weapon.rotation.z=-slash*Math.PI/2;weapon.position.y=1.5+Math.sin(p*Math.PI)*.6;
      if(ea)weapon.children.filter(o=>o.name==='ea-drum').forEach((o,i)=>o.rotation.y=t*(i%2?-9:8));
      blast.visible=power>.01;blast.position.set(1.2,1.8,0);blast.scale.set(9*power,.5+power*.7,.5+power*.7);
      spiral.forEach((s,i)=>{s.visible=power>.1;s.scale.x=power;s.rotation.x=ea?t*3+i:t*.4});
      sigil.scale.setScalar(.1+ease(p/.3));sigil.rotation.x=t*.35;sigil.visible=p<.9;halo.scale.setScalar(.6+Math.sin(p*Math.PI)*1.1);
      particles.update((i,f)=>p<.47?[Math.cos(f*TAU*3)*2.2*(1-p),f*4.6+(t*.7)%1,Math.sin(f*TAU*3)*1.2]:[1+f*9,1.8+Math.sin(f*TAU*4+t*3)*f*.65,Math.cos(f*TAU*3+t*3)*f*.65]);
    };
  } else if(id==='frieren-magic'||id==='fern-magic') {
    const fern=id==='fern-magic', wand=staff(root,fern), color=fern?'#c5a4f1':'#a3e9d6';
    const magic=circle(root,1.22,color,[1.7,2.1,0]);magic.rotation.y=Math.PI/3;
    const outer=circle(root,1.85,fern?'#d9c3fc':'#dfc787',[1.75,2.1,0]);outer.rotation.y=Math.PI/3;
    const shots=Array.from({length:fern?5:1},(_,i)=>{const b=beam(root,color,fern?.18:.36);return b});
    const particles=sparks(color,42);
    tick=t=>{const p=t/(fern?4.7:4.8), build=ease(p/.28), release=clamp((p-.42)/.4);
      wand.rotation.z=-ease((p-.26)/.18)*.65;wand.position.y=.5+Math.sin(p*Math.PI)*.3;
      magic.scale.setScalar(.1+build);magic.rotation.x=t*.38;outer.scale.setScalar(.1+build);outer.rotation.x=-t*.25;outer.visible=p<.86;
      shots.forEach((b,i)=>{const q=clamp((p-.43-i*.07)/.27);b.visible=q>0&&q<1;b.position.set(1.8+(fern?q*7:0),2.1+(fern?(i-2)*.16:0),0);b.scale.set(fern?1.9:8*Math.sin(q*Math.PI),1,1);});
      particles.update((i,f)=>[1.6+Math.cos(f*TAU*4+t)*1.4*(1-release),2.1+Math.sin(f*TAU*4+t)*1.4*(1-release),Math.sin(f*TAU*3)*.5]);
    };
  } else if(id==='migi-blade') {
    const chains=Array.from({length:3},(_,i)=>{
      const bones=Array.from({length:15},()=>mesh(root,new T.CylinderGeometry(.1,.12,1,8),'#c9a98d'));
      const bladeShape=new T.Shape();bladeShape.moveTo(0,-.1);bladeShape.quadraticCurveTo(.7,-.15,1.8,.7);bladeShape.quadraticCurveTo(1.1,-.55,0,.18);bladeShape.closePath();
      const blade=mesh(root,new T.ExtrudeGeometry(bladeShape,{depth:.045,bevelEnabled:false}),'#ecf2ef');
      const joint=sphere(root,.17,'#b7977d');return{bones,blade,joint,i};
    });
    const eye=group(root,[.55,2.35,.22]);sphere(eye,.23,'#fffcdf');sphere(eye,.1,'#6c7763',[0,0,.2]);sphere(eye,.055,'#302f2b',[0,0,.27]);
    tick=t=>{const p=t/4.8, extend=ease((p-.08)/.30)*(1-ease((p-.77)/.2));
      chains.forEach(({bones,blade,joint,i})=>{
        const sway=Math.sin(t*3.2+i)*.35*extend, end=new T.Vector3(.6+(3.2+i*.85)*extend,1.5+(i-1)*1.15*extend+sway,(i-1)*.5);
        const curve=new T.CubicBezierCurve3(new T.Vector3(.45,1.8,0),new T.Vector3(.5,2.2+(i-1)*1.4,0),new T.Vector3(1.2+extend*2.8,end.y+1+Math.sin(t*2+i),end.z),end);
        const pts=curve.getPoints(15);bones.forEach((bone,j)=>{const delta=pts[j+1].clone().sub(pts[j]);bone.position.copy(pts[j]).add(pts[j+1]).multiplyScalar(.5);bone.quaternion.setFromUnitVectors(Y,delta.clone().normalize());bone.scale.set(extend,delta.length()+.015,extend)});
        blade.position.copy(end);blade.quaternion.setFromUnitVectors(X,curve.getTangent(1).normalize());blade.scale.setScalar(extend);joint.position.copy(end);joint.scale.setScalar(extend);
      });eye.scale.setScalar(.3+extend*.7);
    };
  } else if(id==='lamp') {
    const pivot=group(root,[.18,1.9,0]), lamp=group(pivot,[1,1.25,0]);
    rod(pivot,[0,0,0],[1,1.25,0],.075,'#b4a88e');
    // A round ceiling-light shade and its pull cord, carried as one prop.
    const shade=mesh(lamp,new T.CylinderGeometry(.7,.87,.24,32),'#f3eee2');
    const rim=ring(lamp,.82,'#d3b395',[0,-.13,0],.065);rim.rotation.x=Math.PI/2;
    const bulb=sphere(lamp,.59,'#fff4bd',[0,-.12,0]);bulb.scale.y=.12;
    rod(lamp,[0,-.14,0],[0,-.9,0],.017,'#8a7773');sphere(lamp,.055,'#bd6674',[0,-.93,0]);
    const trail=arc(root,Array.from({length:50},(_,j)=>{const a=j/49*TAU*.85;return[Math.cos(a)*1.6,3.05+Math.sin(a)*.12,Math.sin(a)*1.6]}),'#eed9a6',.018,.45);
    tick=t=>{const p=t/4.8, amount=ease((p-.08)/.12)*(1-ease((p-.82)/.16));pivot.rotation.y=Math.max(0,t-.55)*6;pivot.rotation.z=Math.sin(t*6)*.2*amount;pivot.scale.setScalar(.4+amount*.6);lamp.rotation.z=-pivot.rotation.z;trail.visible=p>.2&&p<.88;trail.rotation.y=t*6;trail.scale.setScalar(amount);};
  } else throw new Error('Unknown character skill: '+id);

  return { root, update(t,duration) { tick(t); const fade=ease(t/.2)*ease((duration-t)/.55);for(const m of materials)m.opacity=m.userData.baseOpacity*fade; }, dispose() {root.removeFromParent();for(const g of geometries)g.dispose();for(const m of materials)m.dispose();for(const tex of textures)tex.dispose();root.clear();} };
}
