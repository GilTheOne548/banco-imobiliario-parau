"use strict";
const fs=require("fs"),path=require("path"),sharp=require("sharp");
const source=path.join(__dirname,"assets","board","converted_image.jpeg");
const out=path.join(__dirname,"assets","board","tabuleiro.webp");
if(!fs.existsSync(source))throw new Error("Tabuleiro nativo não encontrado: "+source);
(async()=>{
  const meta=await sharp(source).metadata();
  console.log(`TABULEIRO_FONTE_NATIVA ${meta.width}x${meta.height} format=${meta.format} bytes=${fs.statSync(source).size}`);
  const info=await sharp(source).webp({quality:92,effort:5}).toFile(out);
  console.log(`TABULEIRO_RECONSTRUIDO_NATIVO ${info.width}x${info.height} bytes=${info.size}`);
})().catch(e=>{console.error(e);process.exit(1)});
