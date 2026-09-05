"use strict";
(()=>{
const sprite='/assets/cards/propriedades_sprite_sem_fundo.webp';
// Ordem dos 28 títulos no sprite: 2 colunas x 14 linhas.
const cardBySpace={34:0,31:1,33:2,29:3,37:4,35:5,39:6,36:7,1:8,2:9,4:10,3:11,26:12,28:13,25:14,22:15,5:16,9:17,7:18,23:19,12:20,15:21,13:22,14:23,18:24,17:25,19:26,21:27};
const st=document.createElement('style');
st.textContent=`
#modal>div{max-width:900px}.propertyCardWrap{display:grid;gap:10px}.propertyCardSprite{width:100%;aspect-ratio:2/0.499;background-image:url('${sprite}');background-repeat:no-repeat;background-size:200% 1400%;border-radius:14px;box-shadow:0 4px 18px #0002}.propertyCardStatus{padding:10px 12px;background:#f3f6f8;border-radius:10px}.owned .ownedCard{cursor:pointer;transition:.15s}.owned .ownedCard:hover{transform:translateY(-1px);box-shadow:0 3px 10px #0002}.cardHint{font-size:11px;color:#617080;margin-top:4px}@media(max-width:600px){#modal{padding:8px}#modal>div{padding:12px}.propertyCardSprite{border-radius:9px}}
`;
document.head.appendChild(st);
function cardStyle(n){const col=n%2,row=Math.floor(n/2);return `background-position:${col?100:0}% ${(row/13*100).toFixed(6)}%`}
const oldShow=typeof showCard==='function'?showCard:null;
showCard=function(i){
 const p=P[i],n=cardBySpace[i];
 if(!p||n==null){if(oldShow)return oldShow(i);return}
 const v=state?.titles?.[i]||{};
 $('mt').textContent=p[0];
 const own=ownerText(i);
 const builds=p[3]==='empresa'?(v.h||0)+' investimento(s)':(v.h||0)+' construção(ões)';
 $('mb').innerHTML=`<div class="propertyCardWrap"><div class="propertyCardSprite" style="${cardStyle(n)}" role="img" aria-label="Título de posse de ${esc(p[0])}"></div><div class="propertyCardStatus">${own}<b>Situação no jogo:</b> ${builds}<div class="cardHint">Frente e verso do título de posse original.</div></div></div>`;
 $('modal').style.display='flex';
};
renderOwned=function(){
 let me=mine();if(!me||!state)return $('owned').textContent='–';
 let ix=state.players.indexOf(me),arr=Object.entries(state.titles).filter(([k,v])=>v.owner===ix);
 $('owned').innerHTML=arr.length?arr.map(([k,v])=>'<div class="ownedCard" onclick="showCard('+k+')"><b>'+P[k][0]+'</b> <span class="build">'+(v.h?('🏠'.repeat(Math.min(4,v.h))+(v.h===5?'🏨':'')):'')+'</span><div class="cardHint">Clique para abrir o título</div></div>').join(''):'Nenhum título.';
};
})();
