import {readFileSync,writeFileSync} from 'node:fs';
let html=readFileSync('dist/development.html','utf8');
html=html.replace(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/g,(_,src)=>`<script type="module">${readFileSync('dist/'+src.replace(/^\.\//,''),'utf8').replace(/<\/script/gi,'<\\/script')}</script>`);
html=html.replace(/<link\b[^>]*href="([^"]+\.css)"[^>]*>/g,(_,src)=>`<style>${readFileSync('dist/'+src.replace(/^\.\//,''),'utf8').replace(/@font-face\{[^}]*\}/g,face=>/REACTOR (Open Sans|Roboto Condensed|Default Icon|Global Icon)/.test(face)?face:'')}</style>`);
writeFileSync('dist/index.html',html);
writeFileSync('index.html',html);
