// A schematic location guide, not a precise anatomical or butchery diagram.
const areas={shoulder:[108,91,25,27],back:[155,66,29,14],loin:[208,69,27,14],'inner-loin':[208,89,26,8],rump:[252,84,20,25],round:[261,121,16,30],brisket:[123,117,21,18],belly:[186,125,50,13],tongue:[53,114,13,6],cheek:[65,99,13,13],diaphragm:[160,105,5,25]};
export function beefCutDiagram(w){
 const NS='http://www.w3.org/2000/svg';const el=(tag,attrs={},text)=>{const e=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);if(text)e.textContent=text;return e;};
 const svg=el('svg',{viewBox:'0 0 320 190',role:'img','aria-label':w.jp+'：'+w.cutLabel,'class':'beef-cut-diagram'});
 svg.append(el('rect',{width:320,height:190,rx:18,fill:'#f8efe0'}));
 if(w.cutRegion==='organ'){
  // Organs are identified by name rather than assigning them a misleading surface location.
  svg.append(el('rect',{x:39,y:24,width:242,height:115,rx:22,fill:'#e7cfc0',stroke:'#ae8974','stroke-width':2}));
  svg.append(el('text',{x:160,y:63,'text-anchor':'middle','font-size':17,fill:'#665344'},'牛の内臓'));
  svg.append(el('text',{x:160,y:104,'text-anchor':'middle','font-size':31,'font-weight':700,fill:'#785346'},w.cutLabel));
 }else{
  svg.append(el('path',{d:'M83 66 Q98 48 134 56 L251 55 Q275 60 276 84 L271 132 L263 158 L251 158 L246 124 L123 127 L113 158 L100 158 L100 113 L78 112 Q54 125 39 111 L39 96 L53 69 L66 62 L62 45 L73 54 L83 53 Z',fill:'#d7dac4',stroke:'#798375','stroke-width':3,'stroke-linejoin':'round'}));
  svg.append(el('path',{d:'M271 64 Q289 73 287 115',fill:'none',stroke:'#798375','stroke-width':4,'stroke-linecap':'round'}));
  svg.append(el('ellipse',{cx:63,cy:87,rx:3,ry:3,fill:'#506157'}));
  svg.append(el('path',{d:'M64 61 L47 52 L51 71',fill:'#c4b7a0',stroke:'#798375','stroke-width':2}));
  const a=areas[w.cutRegion];if(a)svg.append(el('ellipse',{cx:a[0],cy:a[1],rx:a[2],ry:a[3],fill:'#d98774','fill-opacity':.8,stroke:'#b05d4d','stroke-width':2}));
 }
 svg.append(el('text',{x:160,y:179,'text-anchor':'middle','font-size':13,fill:'#685e50'},w.cutRegion==='organ'?'部位の名前':w.cutLabel+' · 位置の目安'));
 return svg;
}