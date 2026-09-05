"use strict";
(()=>{
const sprite='/assets/cards/propriedades_sprite_sem_fundo.webp';
// Exibição solicitada: 1000 x 500. Sprite: 2 colunas x 14 linhas.
const cardBySpace={34:0,31:1,33:2,29:3,37:4,35:5,39:6,36:7,1:8,2:9,4:10,3:11,26:12,28:13,25:14,22:15,5:16,9:17,7:18,23:19,12:20,15:21,13:22,14:23,18:24,17:25,19:26,21:27};
const st=document.createElement('style');
st.textContent=`
#modal>div{max-width:900px}
.propertyCardWrap{display:grid;gap:10px}
.cardViewport{width:100%;aspect-ratio:1000/500;background-image:url('${sprite}');background-repeat:no-repeat;background-size:200% 1400%;background-color:transparent}
.propertyCardSprite{border-radius:14px;box-shadow:0 4px 18px #0002}
.propertyCardStatus{padding:10px 12px;background:#f3f6f8;border-radius:10px}
.owned .ownedCard{cursor:pointer;transition:.15s}.owned .ownedCard:hover{transform:translateY(-1px);box-shadow:0 3px 10px #0002}
.cardHint{font-size:11px;color:#617080;margin-top:4px}
.tip{width:390px;max-width:calc(100vw - 20px);padding:10px}
.tipCardSprite{border-radius:10px;margin-bottom:8px;box-shadow:0 2px 10px #0002}
.tipInfo{font-size:12px;line-height:1.35}
@media(max-width:600px){#modal{padding:8px}#modal>div{padding:12px}.propertyCardSprite{border-radius:9px}.tip{width:320px}}
`;
document.head.appendChild(st);
function cardStyle(n){
 const col=n%2,row=Math.floor(n/2);
 const x=col===0?0:100;
 const y=row===0?0:(row/13)*100;
 return `background-position:${x}% ${y.toFixed(8)}%`;
}
function cardHTML(n,cls,label){return `<div class="cardViewport ${cls||''}" style="${cardStyle(n)}" role="img" aria-label="${esc(label||'Título de posse')}"></div>`;}
const oldShow=typeof showCard==='function'?showCard:null;
showCard=function(i){const p=P[i],n=cardBySpace[i];if(!p||n==null){if(oldShow)return oldShow(i);return}const v=state?.titles?.[i]||{};$('mt').textContent=p[0];const own=ownerText(i);const builds=p[3]==='empresa'?(v.h||0)+' investimento(s)':(v.h||0)+' construção(ões)';$('mb').innerHTML=`<div class="propertyCardWrap">${cardHTML(n,'propertyCardSprite','Título de posse de '+p[0])}<div class="propertyCardStatus">${own}<b>Situação no jogo:</b> ${builds}<div class="cardHint">Frente e verso do título de posse.</div></div></div>`;$('modal').style.display='flex';};
tip=function(i,e){const p=P[i],n=cardBySpace[i],t=$('tip');if(!p||n==null)return;const aluguel=p[3]==='empresa'?'Empresa: aluguel calculado pelos dados e investimentos.':'Aluguel base: '+brl(p[2][0]);t.innerHTML=`${cardHTML(n,'tipCardSprite','Título de posse de '+p[0])}<div class="tipInfo"><b>${esc(p[0])}</b><div>Compra: ${brl(p[1])}</div>${ownerText(i)}<div>${aluguel}</div><div class="cardHint">Clique para ampliar o título.</div></div>`;t.style.display='block';moveTip(e);};
moveTip=function(e){const t=$('tip'),pad=10,w=t.offsetWidth||390,h=t.offsetHeight||300;let left=e.clientX+16,top=e.clientY+16;if(left+w>innerWidth-pad)left=e.clientX-w-16;if(top+h>innerHeight-pad)top=e.clientY-h-16;t.style.left=Math.max(pad,left)+'px';t.style.top=Math.max(pad,top)+'px';};
renderOwned=function(){let me=mine();if(!me||!state)return $('owned').textContent='–';let ix=state.players.indexOf(me),arr=Object.entries(state.titles).filter(([k,v])=>v.owner===ix);$('owned').innerHTML=arr.length?arr.map(([k,v])=>'<div class="ownedCard" onclick="showCard('+k+')"><b>'+P[k][0]+'</b> <span class="build">'+(v.h?('🏠'.repeat(Math.min(4,v.h))+(v.h===5?'🏨':'')):'')+'</span><div class="cardHint">Clique para abrir o título</div></div>').join(''):'Nenhum título.';};
})();
