t=open('template.html').read()
for k,f in [('CORE','core.js'),('ADV','adv.js'),('PSDA','psda.js'),('GEO','geo.js'),('UI','ui.js')]:
    t=t.replace('/*'+k+'*/',open(f).read())
open('index.html','w').write(t)
