import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.argv[2] || 'http://localhost:3100';
const label = process.argv[3] || 'local';
const out = path.resolve('screenshots/repair');
const audit = JSON.parse(fs.readFileSync(path.join(out,'audit-local.json'),'utf8'));
const routes = [{slug:'landing',route:'/',theme:'professional'}, ...audit.projects.map(p=>({slug:p.slug,route:'/projects/'+p.slug,theme:p.theme}))];
fs.mkdirSync(out,{recursive:true});
const browser = await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
const results=[];
try {
  for (const width of [390,1440,360,768,1024]) {
    const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce',deviceScaleFactor:1});
    for (const item of routes) {
      const page=await context.newPage();const errors=[];const consoleErrors=[];const failedResponses=[];
      page.on('pageerror',e=>errors.push(e.message));
      page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});
      page.on('response',r=>{if(r.status()>=400)failedResponses.push({url:r.url(),status:r.status()});});
      const response=await page.goto(base+item.route,{waitUntil:'networkidle'});
      await page.evaluate(()=>document.fonts.ready);
      const screenshotWidth=width===390||width===1440;
      if(screenshotWidth){
        const images=page.locator('img');
        for(let i=0;i<await images.count();i++){
          const img=images.nth(i);if(!await img.isVisible())continue;
          await img.scrollIntoViewIfNeeded();
          await img.evaluate(el=>el.complete?Promise.resolve():new Promise(resolve=>{el.addEventListener('load',resolve,{once:true});el.addEventListener('error',resolve,{once:true});setTimeout(resolve,5000);}));
        }
        await page.evaluate(()=>{document.querySelectorAll('*').forEach(el=>{if(el.scrollLeft)el.scrollLeft=0;});window.scrollTo(0,0);});
      }
      const observed=await page.evaluate(()=>{
        const visible=el=>!!(el.offsetWidth||el.offsetHeight||el.getClientRects().length)&&getComputedStyle(el).visibility!=='hidden';
        const header=document.querySelector('header');
        return {
          theme:document.querySelector('[data-theme]')?.getAttribute('data-theme'),
          heading:document.querySelector('h1')?.innerText,
          headings:[...document.querySelectorAll('h1,h2')].map(e=>e.innerText),
          overflow:document.documentElement.scrollWidth>innerWidth,
          documentWidth:document.documentElement.scrollWidth,
          brokenImages:[...document.images].filter(e=>visible(e)&&e.complete&&e.naturalWidth===0).map(e=>e.currentSrc||e.src),
          header:header?.innerText,
          landingBrandCount:location.pathname==='/' ? ((header?.innerText||'')+' '+(document.querySelector('h1')?.innerText||'')).match(/RNS/g)?.length||0 : null,
          navRight:header?.querySelector('nav')?.getBoundingClientRect().right,
          headerBrandVisible:[...(header?.querySelectorAll('a[href="/"]')||[])].some(visible),
          headerLinks:[...(header?.querySelectorAll('a')||[])].filter(visible).map(e=>({text:e.innerText,href:e.getAttribute('href')})),
          clippedHeadings:[...document.querySelectorAll('h1,h2,header')].filter(visible).filter(e=>{const r=e.getBoundingClientRect();return r.left< -1||r.right>innerWidth+1;}).map(e=>({text:e.innerText,rect:e.getBoundingClientRect().toJSON()})),
          missingAnchors:[...document.querySelectorAll('a[href^="#"]')].map(e=>e.getAttribute('href')).filter(h=>h!=='#'&&!document.getElementById(decodeURIComponent(h.slice(1)))),
        };
      });
      if(screenshotWidth){
        await page.screenshot({path:path.join(out,`${label}-${item.slug}-${width}-hero.png`)});
        await page.screenshot({path:path.join(out,`${label}-${item.slug}-${width}-full.png`),fullPage:true});
      }
      const result={...item,width,status:response.status(),...observed,errors,consoleErrors,failedResponses};results.push(result);
      console.log(JSON.stringify({slug:item.slug,width,status:result.status,theme:result.theme,overflow:result.overflow,brokenImages:result.brokenImages.length,errors:errors.length,missingAnchors:result.missingAnchors}));
      await page.close();
    }
    await context.close();
  }
} finally {await browser.close();fs.writeFileSync(path.join(out,`browser-${label}.json`),JSON.stringify(results,null,2));}
if(results.some(r=>r.status!==200||r.overflow||r.brokenImages.length||r.errors.length||r.missingAnchors.length||(r.slug==='landing' && (r.landingBrandCount!==1||r.headerBrandVisible))))process.exitCode=1;
