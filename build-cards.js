"use strict";
const sharp=require('sharp');
const path=require('path');

(async()=>{
  const src=path.join(__dirname,'assets/cards/propriedades_sprite_sem_fundo.webp');
  const out=path.join(__dirname,'assets/cards/propriedades_sprite_1000x500.webp');
  const cellW=1000, srcCellH=540, outCellH=500;
  const cols=2, rows=14, cropTop=20;
  const srcW=cols*cellW, srcH=rows*srcCellH;
  const outW=srcW, outH=rows*outCellH;

  const {data,info}=await sharp(src).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  if(info.width!==srcW||info.height!==srcH||info.channels!==4){
    throw new Error(`Sprite inesperado: ${info.width}x${info.height} canais=${info.channels}`);
  }

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

  const meta=await sharp(out).metadata();
  console.log(`CARTAS_GERADAS ${meta.width}x${meta.height} cell=${cellW}x${outCellH}`);
})().catch(err=>{console.error(err);process.exit(1)});
