"use strict";
const sharp=require('sharp');
const path=require('path');

(async()=>{
  const dir=path.join(__dirname,'assets/cards');
  const src=path.join(dir,'propriedades_sprite_sem_fundo.webp');
  const out=path.join(dir,'propriedades_sprite_1000x500.webp');
  const cellW=1000, srcCellH=540, outCellH=500;
  const cols=2, rows=14, cropTop=20;
  const srcW=cols*cellW, srcH=rows*srcCellH;
  const outW=srcW, outH=rows*outCellH;

  const {data,info}=await sharp(src).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  if(info.width!==srcW||info.height!==srcH||info.channels!==4){
    throw new Error(`Sprite inesperado: ${info.width}x${info.height} canais=${info.channels}`);
  }

  // Mantém os outros 23 títulos exatamente como estavam.
  const outBuf=Buffer.alloc(outW*outH*4);
  const rowBytes=outW*4;
  for(let row=0;row<rows;row++){
    const srcStart=((row*srcCellH+cropTop)*outW)*4;
    const srcEnd=srcStart+outCellH*rowBytes;
    const dstStart=(row*outCellH*outW)*4;
    data.copy(outBuf,dstStart,srcStart,srcEnd);
  }

  await sharp(outBuf,{raw:{width:outW,height:outH,channels:4}})
    .webp({quality:95,effort:4})
    .toFile(out);

  // Somente estes cinco usam a célula COMPLETA 1000x540.
  // A transparência externa é aparada e a arte inteira é encaixada em 1000x500,
  // sem cortar topo, base ou laterais e sem deformar a proporção.
  const individuais={
    4:'igreja-catolica',
    5:'praca-central',
    6:'mercado-publico',
    7:'burguer-e-brasa',
    23:'pastelaria-ff'
  };

  for(const [key,name] of Object.entries(individuais)){
    const n=Number(key), col=n%2, row=Math.floor(n/2);
    const left=col*cellW;
    const top=row*srcCellH;
    const file=path.join(dir,`titulo-${name}-1000x500.webp`);

    const fullCell=await sharp(src)
      .extract({left,top,width:cellW,height:srcCellH})
      .ensureAlpha()
      .trim({background:{r:0,g:0,b:0,alpha:0}})
      .png()
      .toBuffer();

    await sharp(fullCell)
      .resize({
        width:cellW,
        height:outCellH,
        fit:'contain',
        position:'centre',
        background:{r:0,g:0,b:0,alpha:0}
      })
      .webp({quality:95,effort:4})
      .toFile(file);

    const m=await sharp(file).metadata();
    console.log(`CARTA_INDIVIDUAL_SEM_CORTE ${name} ${m.width}x${m.height}`);
  }

  const meta=await sharp(out).metadata();
  console.log(`CARTAS_GERADAS ${meta.width}x${meta.height} cell=${cellW}x${outCellH}`);
})().catch(err=>{console.error(err);process.exit(1)});
