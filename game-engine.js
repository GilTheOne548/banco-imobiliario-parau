'use strict';
const {randomInt,randomUUID}=require('crypto');
const {properties:P,groups,names}=require('./game-data.json');
const cardNames=['Bolsa Família','Recebendo o Aluguel','Habeas Corpus','Investindo Alto','Seguro','Loteria da Sorte','Casa Nova','Corte de Gastos','Veto','Cabeçario — bônus','Investimento Preciso','Mim Dê','Delação Premiada','Cabeçario — isenção','Sinistro Estrutural','Cabeçario — pagamento','Banco Faliu','Auditoria Fiscal','Crise de Reputação','Manutenção Emergencial','Pagando o que Deve','Inadimplência Geral','Desastre Ambiental','Obra Embargada','Bolha Imobiliária','Taxa aos Ricos','Reajuste da Inflação','Estatização','Quebra da Bolsa','Reforma Agrária Urbana'];
const assert=(v,m)=>{if(!v)throw new Error(m)};
const owned=(s,i)=>Object.keys(s.titles).map(Number).filter(k=>s.titles[k].owner===i);
const log=(s,t)=>{s.logs.unshift(t);s.logs=s.logs.slice(0,80)};
const cost=k=>P[k][3]==='empresa'?(P[k][1]===300000?250000:200000):P[k][1]>=300000?200000:P[k][1]>=220000?150000:P[k][1]>=140000?100000:50000;
function buildable(s,i,k){const t=s.titles[k];return !!(t&&t.owner===i&&!t.mortgaged&&(t.h||0)<5&&!s.players[i].bankrupt&&(P[k][3]==='empresa'||groups[P[k][3]]?.every(x=>s.titles[x]?.owner===i&&!s.titles[x].mortgaged)))}
function transfer(s,from,to,n,reason,insured=false){n=Math.max(0,Math.round(n));if(from!==null)n=Math.min(n,s.players[from].money);if(from!==null)s.players[from].money-=n;if(to!==null)s.players[to].money+=n;s.bankFlow=(s.bankFlow||0)+(to===null?n:0)-(from===null?n:0);s.moneyEvents||=[];s.moneyEvents.push({id:randomUUID(),from,to,amount:n,reason});s.moneyEvents=s.moneyEvents.slice(-20);log(s,`${from===null?'Banco':s.players[from].name} → ${to===null?'Banco':s.players[to].name}: R$ ${n.toLocaleString('pt-BR')} (${reason}).`);if(insured&&from!==null&&s.players[from].insurance){s.players[from].insurance=false;transfer(s,null,from,n/2,'Seguro')}}
function fresh(room){return {engineVersion:2,started:true,current:0,rolled:false,lastDice:[0,0],players:room.players.map((p,i)=>({onlineId:p.id,name:p.name,money:1500000,pos:0,skip:0,jail:false,jailTurns:0,bankrupt:false,color:i})),titles:{},deck:[],deckPos:0,logs:['Partida iniciada.'],turnNumber:1,choices:[],trades:[],moneyEvents:[],bankFlow:-1500000*room.players.length}}
function init(s){s.choices||=[];s.trades||=[];s.turnNumber||=1;s.logs||=[];s.moneyEvents||=[];if(s.engineVersion!==2){s.deck=[];s.deckPos=0;s.engineVersion=2}}
function choice(s,i,kind,options){if(!options.length){log(s,'Sem títulos elegíveis para este efeito.');return} s.choices.push({id:randomUUID(),player:i,kind,options})}
const options=ks=>ks.map(k=>({value:String(k),label:P[k][0]}));
function draw(s,i,forced){if(s.deckPos>=s.deck.length){s.deck=Array.from({length:30},(_,k)=>k);for(let j=29;j>0;j--){const k=randomInt(j+1);[s.deck[j],s.deck[k]]=[s.deck[k],s.deck[j]]}s.deckPos=0}const c=forced??s.deck[s.deckPos++];s.lastCard={id:randomUUID(),index:c,player:i,name:cardNames[c]};log(s,`${s.players[i].name} tirou ${cardNames[c]}.`);const p=s.players[i],ks=owned(s,i),homes=ks.filter(k=>P[k][3]!=='empresa'&&s.titles[k].h>0),units=homes.reduce((a,k)=>a+(s.titles[k].h===5?125000:s.titles[k].h*50000),0);const each=fn=>s.players.forEach((q,j)=>{if(j!==i&&!q.bankrupt)fn(j)});
 switch(c){
 case 0:transfer(s,null,i,ks.filter(k=>!s.titles[k].h).length*75000,'Bolsa Família');break;
 case 1:each(j=>transfer(s,j,i,75000,'Recebendo o Aluguel'));break;
 case 2:p.habeas=(p.habeas||0)+1;break;
 case 3:choice(s,i,'double',options(ks));break;
 case 4:p.insurance=true;break;
 case 5:transfer(s,null,i,275000,'Loteria da Sorte');break;
 case 6:choice(s,i,'house',options(homes.filter(k=>s.titles[k].h<4&&!s.titles[k].mortgaged)));break;
 case 7:choice(s,i,'half',options(Object.keys(s.titles).map(Number)));break;
 case 8:p.veto=true;break;
 case 9:choice(s,i,'bonus',[{value:'cash',label:'Receber R$ 125.000'},...(ks.some(k=>buildable(s,i,k)&&P[k][3]!=='empresa'&&s.titles[k].h<4)?[{value:'houses',label:'Construir até 3 casas gratuitamente'}]:[])]);break;
 case 10:transfer(s,null,i,150000,'Dividendos');break;
 case 11:{const pairs=[];ks.forEach(a=>Object.keys(s.titles).forEach(b=>{if(s.titles[b].owner!==i&&P[a][1]===P[b][1]&&!s.players[s.titles[b].owner].bankrupt)pairs.push({value:a+':'+b,label:P[a][0]+' ↔ '+P[b][0]})}));choice(s,i,'swap',pairs);break}
 case 12:choice(s,i,'bail',[...(p.money>=175000?[{value:'pay',label:'Pagar R$ 175.000'}]:[]),{value:'jail',label:'Ir para a Delegacia'}]);break;
 case 13:choice(s,i,'noRent',options(ks));break;
 case 14:choice(s,i,'removeHouse',options(homes));break;
 case 15:choice(s,i,'payment',[{value:'bank',label:'Pagar R$ 150.000 ao banco'},{value:'players',label:'Pagar R$ 50.000 a cada jogador'}]);break;
 case 16:choice(s,i,'mortgageFree',options(ks.filter(k=>!s.titles[k].mortgaged)));break;
 case 17:transfer(s,i,null,units,'Auditoria Fiscal',true);break;
 case 18:p.skipSalary=true;break;
 case 19:{const n=homes.reduce((a,k)=>a+(s.titles[k].h===5?30000:s.titles[k].h*10000),0);each(j=>transfer(s,i,j,n,'Manutenção Emergencial',true));break}
 case 20:each(j=>transfer(s,i,j,75000,'Pagando o que Deve',true));break;
 case 21:transfer(s,i,null,100000,'Inadimplência Geral',true);break;
 case 22:transfer(s,i,null,200000,'Desastre Ambiental',true);break;
 case 23:transfer(s,i,null,homes.length*60000,'Obra Embargada',true);break;
 case 24:s.players.forEach((q,j)=>{if(!q.bankrupt)choice(s,j,'mortgagePaid',options(owned(s,j).filter(k=>!s.titles[k].h&&!s.titles[k].mortgaged)))});break;
 case 25:{const alive=s.players.map((p,j)=>j).filter(j=>!s.players[j].bankrupt).sort((a,b)=>s.players[b].money-s.players[a].money);if(alive.length>1)transfer(s,alive[0],alive.at(-1),100000,'Taxa aos Ricos');break}
 case 26:s.inflationUntil=s.turnNumber+s.players.filter(p=>!p.bankrupt).length;break;
 case 27:s.players.forEach((q,j)=>{const k=owned(s,j).sort((a,b)=>P[a][1]-P[b][1]||a-b)[0];if(k!==undefined){transfer(s,null,j,P[k][1],'Estatização de '+P[k][0]);delete s.titles[k]}});break;
 case 28:s.players.forEach((q,j)=>{if(!q.bankrupt)choice(s,j,'crash',[{value:'pay',label:'Pagar R$ 200.000 ao banco'},...options(owned(s,j).filter(k=>!s.titles[k].mortgaged))])});break;
 case 29:{const a=s.players.map((p,j)=>j).filter(j=>!s.players[j].bankrupt).sort((a,b)=>owned(s,b).length-owned(s,a).length||a-b);if(a.length>1&&owned(s,a[0]).length>owned(s,a.at(-1)).length){const k=owned(s,a[0]).filter(k=>!s.titles[k].h);choice(s,a[0],'reform:'+a.at(-1),options(k))}break}
 }
}
function resolve(s,i,id,value){const c=s.choices.find(c=>c.id===id);assert(c&&c.player===i,'Esta escolha pertence a outro jogador.');assert(c.options.some(o=>o.value===String(value)),'Opção inválida.');const k=Number(value),p=s.players[i],t=s.titles[k];
 switch(c.kind){case 'double':t.rentFactor=(t.rentFactor??1)*2;break;case 'half':t.rentFactor=(t.rentFactor??1)*.5;break;case 'noRent':t.noRent=true;break;case 'house':t.h++;break;case 'removeHouse':t.h=Math.max(0,t.h-1);break;case 'mortgageFree':t.mortgaged=true;break;case 'mortgagePaid':t.mortgaged=true;transfer(s,null,i,P[k][3]==='empresa'?P[k][1]:P[k][1]/2,'Hipoteca');break;case 'swap':{const [a,b]=value.split(':').map(Number);[s.titles[a].owner,s.titles[b].owner]=[s.titles[b].owner,s.titles[a].owner];break}case 'bail':if(value==='pay')transfer(s,i,null,175000,'Fiança');else{p.pos=10;p.jail=true;p.jailTurns=0}break;case 'payment':if(value==='bank')transfer(s,i,null,150000,'Carta',true);else s.players.forEach((p,j)=>{if(j!==i&&!p.bankrupt)transfer(s,i,j,50000,'Carta',true)});break;case 'crash':if(value==='pay')transfer(s,i,null,200000,'Quebra da Bolsa',true);else{t.mortgaged=true;transfer(s,null,i,P[k][3]==='empresa'?P[k][1]:P[k][1]/2,'Hipoteca')}break;case 'bonus':if(value==='cash')transfer(s,null,i,125000,'Cabeçario');else{p.freeHouses=3;choice(s,i,'freeHouse',options(owned(s,i).filter(k=>P[k][3]!=='empresa'&&buildable(s,i,k)&&s.titles[k].h<4)))}break;case 'freeHouse':t.h++;p.freeHouses--;if(p.freeHouses>0)choice(s,i,'freeHouse',options(owned(s,i).filter(k=>P[k][3]!=='empresa'&&buildable(s,i,k)&&s.titles[k].h<4)));break;default:if(c.kind.startsWith('reform:'))t.owner=Number(c.kind.split(':')[1]);else throw Error('Efeito inválido')}
 log(s,p.name+' escolheu: '+c.options.find(o=>o.value===String(value)).label+'.');s.choices=s.choices.filter(q=>q!==c)
}
function rent(s,k,total){const t=s.titles[k];if(!t||t.mortgaged||t.noRent)return 0;return Math.round((P[k][3]==='empresa'?total*((P[k][1]===300000?40:30)+5*(t.h||0))*1000:P[k][2][t.h||0])*(t.rentFactor??1)*(s.inflationUntil>s.turnNumber?3:1))}
function action(s,i,b){init(s);assert(s.players[i]&&!s.players[i].bankrupt,'Jogador indisponível.');
 if(b.action==='choice'){resolve(s,i,b.choiceId,String(b.value));return}
 assert(!s.choices.length,'Resolva as escolhas da carta antes de continuar.');
 if(b.action==='offer'){assert(s.trades.filter(t=>t.status==='pending'&&t.from===i).length<5,'Você já tem 5 propostas pendentes.');const to=Number(b.to);assert(Number.isInteger(to)&&s.players[to]&&to!==i&&!s.players[to].bankrupt,'Destinatário inválido.');const give=[...new Set(b.give||[])].map(Number),take=[...new Set(b.take||[])].map(Number);assert(give.length+take.length>0,'Selecione ao menos um título.');const cash=Number(b.cash||0);assert(Number.isSafeInteger(cash)&&Math.abs(cash)<=1e9,'Valor inválido.');assert(give.every(k=>s.titles[k]?.owner===i)&&take.every(k=>s.titles[k]?.owner===to),'A posse dos títulos mudou.');assert(s.players[cash>=0?i:to].money>=Math.abs(cash),'Saldo insuficiente.');s.trades.push({id:randomUUID(),from:i,to,give,take,cash,status:'pending'});s.trades=s.trades.slice(-40);log(s,s.players[i].name+' enviou uma proposta para '+s.players[to].name+'.');return}
 if(['accept','reject','cancel'].includes(b.action)){const t=s.trades.find(t=>t.id===b.tradeId);assert(t&&t.status==='pending','Proposta encerrada.');assert(b.action==='cancel'?t.from===i:t.to===i,'Você não pode responder a esta proposta.');if(b.action==='accept'){assert(t.give.every(k=>s.titles[k]?.owner===t.from)&&t.take.every(k=>s.titles[k]?.owner===t.to),'Títulos não estão mais disponíveis. Cancele a proposta.');assert(s.players[t.cash>=0?t.from:t.to].money>=Math.abs(t.cash),'Saldo insuficiente para concluir.');t.give.forEach(k=>s.titles[k].owner=t.to);t.take.forEach(k=>s.titles[k].owner=t.from);if(t.cash)transfer(s,t.cash>0?t.from:t.to,t.cash>0?t.to:t.from,Math.abs(t.cash),'Negociação');log(s,'Negociação aceita por '+s.players[i].name+'.')}t.status=b.action;return}
 assert(s.current===i,'Aguarde a sua vez.');const p=s.players[i];
 if(b.action==='build'){const k=Number(b.space);assert(buildable(s,i,k),'Construção ou investimento indisponível.');assert(p.money>=cost(k),'Saldo insuficiente.');transfer(s,i,null,cost(k),P[k][3]==='empresa'?'Investimento':'Construção');s.titles[k].h=(s.titles[k].h||0)+1;return}
 if(b.action==='redeem'){const k=Number(b.space),t=s.titles[k],n=P[k]?.[3]==='empresa'?P[k][1]:P[k]?.[1]/2;assert(t?.owner===i&&t.mortgaged&&p.money>=n,'Resgate indisponível.');transfer(s,i,null,n,'Resgate de hipoteca');t.mortgaged=false;return}
 if(b.action==='habeas'){assert(p.habeas>0&&p.jail,'Você não tem uma carta para usar agora.');p.habeas--;p.jail=false;p.jailTurns=0;return}
 if(b.action==='buy'){const k=p.pos;assert(s.rolled&&P[k]&&!s.titles[k]&&p.money>=P[k][1],'Compra indisponível.');transfer(s,i,null,P[k][1],'Compra de '+P[k][0]);s.titles[k]={owner:i,h:0};return}
 if(b.action==='roll'){assert(!s.rolled,'Você já jogou os dados.');s.rolled=true;if(p.skip){p.skip--;log(s,p.name+' perdeu o turno.');return}const d=[randomInt(1,7),randomInt(1,7)];s.lastDice=d;if(p.jail){p.jailTurns=(p.jailTurns||0)+1;if(d[0]===d[1]||p.jailTurns>=3){p.jail=false;p.jailTurns=0}else{log(s,p.name+' permanece na Delegacia.');return}}const old=p.pos;p.pos=(old+d[0]+d[1])%40;if(p.pos<old){if(p.skipSalary){p.skipSalary=false;log(s,p.name+' não recebeu a mixaria (Crise de Reputação).')}else transfer(s,null,i,200000,'Passagem pelo início')}log(s,p.name+' caiu em '+names[p.pos]+'.');const k=p.pos,t=s.titles[k];if(P[k]){if(t&&t.owner!==i){if(p.veto){p.veto=false;log(s,'Veto: aluguel dispensado.')}else transfer(s,i,t.owner,rent(s,k,d[0]+d[1]),'Aluguel de '+P[k][0],true)}}else if([6,11,24,27,32,38].includes(k))draw(s,i);else if(k===8||k===16)transfer(s,null,i,200000,'Bingo');else if(k===20)p.skip++;else if(k===30){p.pos=10;p.jail=true;p.jailTurns=0}return}
 if(b.action==='end'){assert(s.rolled,'Jogue os dados primeiro.');let j=i;do{j=(j+1)%s.players.length}while(s.players[j].bankrupt&&j!==i);s.current=j;s.rolled=false;s.lastDice=[0,0];s.turnNumber++;log(s,'Agora é a vez de '+s.players[j].name+'.');return}
 throw Error('Ação desconhecida.');
}
module.exports={fresh,action,draw,init,resolve,buildable,cost,rent,cardNames};
