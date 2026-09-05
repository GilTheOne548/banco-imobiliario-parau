"use strict";
const fs=require("fs"),path=require("path");
const file=path.join(__dirname,"index.html");
let html=fs.readFileSync(file,"utf8");
const tag='<script src="/property-cards.js"></script>';
if(!html.includes(tag)){
  if(!html.includes('</body>')) throw new Error('index.html sem </body>');
  html=html.replace('</body>',tag+'</body>');
  fs.writeFileSync(file,html);
  console.log('PROPERTY_CARDS_INJETADO');
}else console.log('PROPERTY_CARDS_JA_PRESENTE');
