const {test} = require('node:test');
const assert = require('node:assert/strict');
const {parseAge,reason,defaults} = require('../core.js');
test('relative ages and exact date parsing',()=>{
  for(const [text,expected] of [['Just posted',0],['Yesterday',1],['Posted 3 days ago',3],['30+ days ago',30],['2 weeks ago',14],['Reposted 1 month ago',30],['2 hours ago',2/24],['',null],['Active',null],['Senior engineer 30 years experience',10950]]) assert.equal(parseAge(text),expected);
  assert.equal(parseAge('2026-11-01',Date.parse('2026-11-11')),10);
  assert.equal(parseAge('November 1'),null);
});
test('filter priorities, boundary, unknowns, disabled and unlimited age',()=>{
  assert.equal(reason({promoted:true,age:0},defaults),'promoted');
  assert.equal(reason({promoted:false,age:7},defaults),'');
  assert.equal(reason({promoted:false,age:8},defaults),'old');
  assert.equal(reason({promoted:false,age:null},defaults),'');
  assert.equal(reason({promoted:false,age:null},{...defaults,hideUnknown:true}),'unknown date');
  assert.equal(reason({promoted:true,age:99},{...defaults,enabled:false}),'');
  assert.equal(reason({promoted:false,age:99},{...defaults,maxDays:0}),'');
});

test('posting labels support reposted dates and reject unrelated text',()=>{
  const {parsePostingLabel} = require('../core.js');
  for (const text of ['Re-posted 9 days ago', 'Reposted 9 days ago', 'Posted: 9 days ago', '9 days ago']) assert.equal(parsePostingLabel(text),9);
  assert.equal(parsePostingLabel('Re-posted\n 30+ days ago'),30);
  assert.equal(parsePostingLabel('Posted today'),0);
  assert.equal(parsePostingLabel('Posted 2 hrs ago'),2/24);
  for(const text of ['Employer active 9 days ago','9 days paid vacation','Senior Engineer 9 years experience','', 'Date posted']) assert.equal(parsePostingLabel(text),null);
});
