// Run with Playwright installed: node tests/ziprecruiter.browser.cjs
// Set CHROMIUM_PATH when using a system Chromium instead of Playwright's browser.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
(async () => {
  const browser = await chromium.launch({headless:true,
    ...(process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH} : {})});
  try {
    const page = await browser.newPage();
    await page.route('**/*',r=>r.fulfill({contentType:'text/html',body:'<html><body></body></html>'}));
    await page.goto('https://www.ziprecruiter.com/jobs-search');
    await page.evaluate(()=>{
      window.chrome={storage:{local:{get:async d=>d},onChanged:{addListener:f=>window.change=f}},runtime:{onMessage:{addListener:f=>window.statusListener=f}}};
    });
    // Minimal fixtures model the per-job IDs and button titles observed in
    // public ZipRecruiter HTML. The detail panel must stay separate.
    const card=(key,label)=>`<li data-testid="job-card-item-${key}"><article data-testid="job-card-${key}"><h2><button data-testid="job-card-activation">Engineer</button></h2>${label}</article></li>`;
    await page.setContent(`<ul>${card('old','<span>Re-posted<!-- --> <!-- -->9 days ago</span>')}${card('fresh','<p>Posted <span>2 days ago</span></p>')}${card('unknown','<p>9 days paid vacation</p>')}${card('split','<div>Re-posted <span>30+</span> days ago</div>')}</ul><aside id="details"><div data-testid="posted-row">Re-posted 90 days ago</div></aside>`);
    await page.addScriptTag({path:path.join(root,'core.js')});
    await page.addStyleTag({path:path.join(root,'content.css')});
    await page.addScriptTag({path:path.join(root,'content.js')});
    const visible=key=>page.locator(`[data-testid="job-card-item-${key}"]`).isVisible();
    await page.waitForTimeout(250);
    assert.equal(await visible('old'),false);
    assert.equal(await visible('split'),false);
    assert.equal(await visible('fresh'),true);
    assert.equal(await visible('unknown'),true);
    assert.equal(await page.locator('#details').isVisible(),true);
    const status=await page.evaluate(()=>{
      let result; window.statusListener({type:'job-filter-status'},null,r=>result=r);return result;
    });
    assert.equal(status.total,4); // Never count article and li twice.
    assert.equal(status.hidden,2);
    assert.equal(status.unknown,1);
    await page.evaluate(()=>window.change({maxDays:{newValue:14}},'local'));
    await page.waitForTimeout(250);
    assert.equal(await visible('old'),true);
    assert.equal(await visible('split'),false);
    await page.evaluate(html=>document.querySelector('ul').insertAdjacentHTML('beforeend',html),card('dynamic','<p>Posted 20 days ago</p>'));
    await page.waitForTimeout(250);
    assert.equal(await visible('dynamic'),false);
    await page.evaluate(()=>window.change({hideUnknown:{newValue:true}},'local'));
    await page.waitForTimeout(250);
    assert.equal(await visible('unknown'),false);
    await page.evaluate(()=>window.change({enabled:{newValue:false}},'local'));
    await page.waitForTimeout(250);
    assert.equal(await visible('dynamic'),true);
    assert.equal(await visible('split'),true);
    console.log('ZipRecruiter regression checks passed: per-job IDs, repost labels, split labels, cutoff changes, dynamic cards, unknowns, restoring, detail isolation and counts.');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});
