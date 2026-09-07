'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),features=fs.readFileSync(path.join(root,'game-features.js'),'utf8'),css=fs.readFileSync(path.join(root,'bank-enhancements.css'),'utf8');

test('marcadores não exibem texto permanente sobre propriedades',()=>{
  assert.doesNotMatch(features,/createElement\(['"]span['"]\);status\.className=['"]property-status-marker/);
});

test('casas, hotéis e investimentos usam tokens visuais acima do tabuleiro',()=>{
  assert.match(features,/assets\/game\/buildings/);
  assert.match(features,/assets\/game\/investments/);
  assert.match(css,/\.board \.improvement-token/);
});

test('tooltip usa o nível atual para calcular aluguel',()=>{
  assert.match(features,/function currentRentText/);
  assert.match(features,/prop\[2\]\[level\]/);
  assert.match(features,/5\*level/);
});
