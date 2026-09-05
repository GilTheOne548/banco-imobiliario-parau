"use strict";
const sharp=require('sharp');
const path=require('path');

(async()=>{
  const src=path.join(__dirname,'assets/cards/propriedades_sprite_sem_fundo.webp');
  const out=path.join(__dirname,'assets/cards/propriedades_sprite_1000x500.webp');
  const cellW=1000, srcCellH=540, outCellH=500;
  const cols=2, rows=14;
  const cropTop=20;
  const layers=[];

  for(let row=0;row<rows;row++){
    for(let col=0;col<cols;col++){
      const input=await sharp(src)
        .extract({left:col*cellW,top:row*srcCellH+cropTop,width:cellW,height:outCellH})
        .png()
        .toBuffer();
      layers.push({input,left:col*cellW,top:row*outCellH});
    }
  }

  await sharp({
    create:{width:cols*cellW,height:rows*outCellH,channels:4,background:{r:0,g:0,b:0,alpha:0}}
  })
    .composite(layers)
    .webp({quality:95,effort:6})
    .toFile(out);

  const meta=await sharp(out).metadata();
  console.log(`CARTAS_GERADAS ${meta.width}x${meta.height} cell=${cellW}x${outCellH}`);
})().catch(err=>{console.error(err);process.exit(1)});
