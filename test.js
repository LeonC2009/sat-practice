const fs=require('fs'); const vm=require('vm');
const ctx={console}; vm.createContext(ctx);
const src=['core.js','adv.js','psda.js','geo.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n').replace(/if \(typeof module[^\n]*/,'');
vm.runInContext(src+'\n;this.C={GEN,SKILLS,DIFFS,generate,checkSPR,acceptedForms,F,fStr};',ctx);
const C=ctx.C; let errs=0,n=0; const only=process.argv[2];
for(const s of C.SKILLS.filter(s=>!only||s.id.startsWith(only))) for(const d of C.DIFFS) for(let i=0;i<3000;i++){ n++; let q;
  try{q=C.generate(s.id,d)}catch(e){errs++; if(errs<20)console.log('THROW',s.id,d,e.message); continue;}
  const bad=m=>{errs++; if(errs<30) console.log(m,s.id,d,JSON.stringify(q).slice(0,300));};
  const all=(q.stem+q.explain+(q.choices||[]).join()).replace(/<svg[\s\S]*?<\/svg>/g,'');
  if(/NaN|undefined|Infinity|\[object|\d\.\d{5,}/.test(all)) bad('BADTEXT');
  if(q.type==='mcq'){ if(q.choices.length!==4) bad('LEN'); if(new Set(q.choices).size!==4) bad('DUP'); if(!(q.answer>=0&&q.answer<4)) bad('ANS'); }
  else { if(!Number.isInteger(q.value.n)||!Number.isInteger(q.value.d)) bad('NONINT'); const f=C.acceptedForms(q.value); if(!f.length) bad('NOFIT'); f.forEach(x=>{ if(!C.checkSPR(x,q.value).ok) bad('REJ '+x) }); }
}
console.log('generated',n,'errors',errs);
