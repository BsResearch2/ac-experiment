
(() => {'use strict';const cfg=window.EXPERIMENT_CONFIG||{},url=cfg.supabaseUrl?.replace(/\/$/,'')||'',key=cfg.supabaseAnonKey||'',cloud=!!(url&&key);const $=id=>document.getElementById(id);const suggestions=['#realtalk','#personalgrowth','#behindthescenes','#smallmoments','#journaling','#lifelately','#selfcare','#authenticity','#mondaymotivation','#dailyvlog'];let pid='',tags=[],posts=[],eventIndex=0,phase='practice';const escapeHTML=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));async function save(eventType,detail,personalness=null,outcome=null){if(phase==='practice'||!cloud) return false;const obj={prolific_id:pid,event_type:eventType,detail,personalness_score:personalness,scoring_method:eventType==='Post Published'?window.EXPERIMENT_SCORING.method:null,condition:cfg.condition||'low_process_low_outcome',feedback:outcome};const res=await fetch(url+'/rest/v1/experiment_events',{method:'POST',headers:{apikey:key,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(obj)});if(!res.ok)throw Error('Database could not save your submission ('+res.status+').');return true}
// Per-participant browser history; does not grant access to remote research records.
function readLocalJSON(key,fallback){try{const value=localStorage.getItem(key);return value?JSON.parse(value):fallback}catch{return fallback}}
function variantPrefix(){return cfg.variant&&cfg.variant!=='hh'?encodeURIComponent(cfg.variant)+':':''}
function mainSessionKey(){return 'creator_experiment_session_v1:'+variantPrefix()+encodeURIComponent(pid)}
function progressKey(){return 'creator_experiment_progress_v1:'+variantPrefix()+encodeURIComponent(pid)}
function sessionKey(){return mainSessionKey()+(phase==='practice'?':practice':'')}
function saveProgress(){try{localStorage.setItem(progressKey(),phase)}catch{}}
function persistSession(){if(!pid)return;try{localStorage.setItem(sessionKey(),JSON.stringify({version:1,posts,revisionOf:null,draft:$('body').value,tags,hashtagInput:$('hashtagInput').value}));$('localSaveError').classList.add('hide')}catch{$('localSaveError').textContent='This browser could not save your history. Keep this page open to avoid losing your work.';$('localSaveError').classList.remove('hide')}}
function restoreSession(){const saved=readLocalJSON(sessionKey(),null);posts=[];tags=[];$('body').value='';$('hashtagInput').value='';if(!saved||saved.version!==1)return;
 if(Array.isArray(saved.posts))posts=saved.posts.filter(p=>p&&typeof p.body==='string'&&typeof p.time==='string'&&Array.isArray(p.tags)&&p.tags.every(t=>typeof t==='string'));
 if(typeof saved.draft==='string')$('body').value=saved.draft;if(typeof saved.hashtagInput==='string')$('hashtagInput').value=saved.hashtagInput;
 if(Array.isArray(saved.tags))tags=[...new Set(saved.tags.filter(t=>typeof t==='string'))];eventIndex=posts.length;
}
// Local topic matching expands suggestions without sending participant text anywhere.
const hashtagTopics=[
 ['growth|motivation|goal|learn|journal|authentic|realtalk',['#selfreflection','#growthjourney','#mindset','#progress','#lifelessons','#keepgrowing']],
 ['selfcare|wellness|health|mindful|balance',['#wellbeing','#mindfulmoments','#healthyhabits','#mentalwellness','#slowliving','#findingbalance']],
 ['travel|adventure|explor|trip|nature',['#wanderlust','#outdoorlife','#newexperiences','#exploremore','#travelmoments','#naturelovers']],
 ['food|cook|baking|recipe|coffee',['#foodie','#homecooking','#kitchenstories','#foodinspiration','#coffeetime','#homemade']],
 ['fitness|workout|gym|run|sport',['#fitnessjourney','#stayactive','#movement','#trainingday','#runnerslife','#strongertogether']],
 ['art|creativ|photo|music|design',['#creativeprocess','#creativecommunity','#inspiration','#makingsomething','#artisticjourney','#createeveryday']],
 ['life|moment|vlog|behindthescenes|daily',['#everydaystories','#simplejoys','#dayinmylife','#littlethings','#makingmemories','#lifeunfiltered']]
];
function suggestedTags(){if(!tags.length)return suggestions;const related=tags.flatMap(tag=>{const matches=hashtagTopics.filter(([pattern])=>new RegExp(pattern,'i').test(tag));return matches.length?matches.flatMap(([,options])=>options):[tag+'journey',tag+'stories',tag+'community']});return [...new Set([...suggestions,...related,...hashtagTopics.flatMap(([,options])=>options)])].filter(tag=>!tags.includes(tag)).slice(0,16)}
function renderStage(){const practice=phase==='practice';history.replaceState(null,'',practice?'#practice':'#main-task');document.title=(practice?'Practice':'Main Task')+' | Content Creator Experiment';$('stageStep').textContent=practice?'PAGE 2 OF 3 · PRACTICE':'PAGE 3 OF 3 · MAIN TASK';$('stageTitle').textContent=practice?'Practice run':'Create your post';document.querySelector('#stageIntro .stage-task-reminder').classList.toggle('hide',practice);$('stageInstructions').textContent=practice?'This is a practice run. Please publish at least one post to get familiar with the app. When you are ready, click “Continue to the main task” below the composer.':'Create and publish a post about yourself. Your published post will appear below. Your practice posts are separate from this task.';$('practiceNext').classList.toggle('hide',!practice);$('continueMain').disabled=practice&&posts.length===0;$('practiceNext').classList.toggle('is-ready',practice&&posts.length>0);$('publish').classList.toggle('practice-repeat',practice&&posts.length>0);$('practiceNextText').textContent=posts.length?'Ready for the main task? Use the green button below. You can also publish another practice post if you want more practice.':'Publish a practice post to unlock the main task.';}
$('continueMain').onclick=()=>{if(phase!=='practice'||!posts.length)return;persistSession();phase='main';saveProgress();restoreSession();$('saveStatus').textContent='';renderTags();renderPosts();$('stageIntro').scrollIntoView({block:'start'});$('stageIntro').focus({preventScroll:true})};

function renderTags(){$('suggestions').innerHTML=suggestedTags().map(t=>`<button type="button" class="chip" data-add="${escapeHTML(t)}">${escapeHTML(t)}</button>`).join('');renderStage();$('publish').textContent=phase==='practice'?(posts.length?'↻ Publish another practice post':'➤ Publish practice post'):'➤ Publish post';$('chosen').innerHTML=tags.map(t=>`<button type="button" class="chip active" data-remove="${escapeHTML(t)}">${escapeHTML(t)} ×</button>`).join('');persistSession()}
function renderPosts(animateNew=false){$('feed').innerHTML=posts.length?posts.map((p,i)=>`<article class="post${animateNew&&i===0?' post-enter':''}"><small class="post-time">${escapeHTML(p.time)}</small><p>${escapeHTML(p.body)}</p><div class="posttags">${p.tags.map(escapeHTML).join(' ')}</div></article>`).join(''):'<p class="sub">No posts published yet.</p>'}
function parseHashtags(str){return(str.match(/#?[\p{L}\p{N}_]+/gu)||[]).map(s=>'#'+s.replace(/^#+/,'').toLowerCase())}function addTags(str){tags=[...new Set([...tags,...parseHashtags(str)])];$('hashtagInput').value='';renderTags()}
$('suggestions').addEventListener('click',e=>{const b=e.target.closest('[data-add]');if(b)addTags(b.dataset.add)});
$('chosen').addEventListener('click',e=>{const b=e.target.closest('[data-remove]');if(b){tags=tags.filter(t=>t!==b.dataset.remove);renderTags()}});$('hashtagInput').addEventListener('input',persistSession);$('hashtagInput').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===','){e.preventDefault();addTags(e.target.value)}});$('hashtagInput').addEventListener('blur',e=>{if(e.target.value.trim())addTags(e.target.value)});$('body').addEventListener('input',persistSession);$('clear').addEventListener('click',()=>{$('body').value='';tags=[];renderTags();$('saveStatus').textContent='Draft cleared.'});
$('publish').addEventListener('click',async()=>{
 const body=$('body').value.trim();
 if(!body){$('saveStatus').textContent='Please write something before publishing.';return}
 if($('hashtagInput').value.trim())addTags($('hashtagInput').value);
 const currentTags=[...tags],postId=crypto.randomUUID();
 const detail=JSON.stringify({study_phase:phase,post_id:postId,revision_of:null,body,hashtags:currentTags,});
 $('publish').disabled=true;$('saveStatus').textContent='Publishing…';
 try{
  await save('Post Published',detail,phase==='practice'?null:window.EXPERIMENT_SCORING.personalness(body,currentTags),null);
  posts.unshift({id:postId,revisionOf:null,body,tags:currentTags,time:new Date().toLocaleString(),outcome:null});
  eventIndex++;$('body').value='';tags=[];renderTags();renderPosts(true);
  $('saveStatus').textContent='Thank you! Your post has been published.';if(phase==='practice')$('practiceNext').scrollIntoView({block:'nearest',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 }catch(e){$('saveStatus').textContent=e.message}finally{$('publish').disabled=false}
});
$('priorIds').innerHTML=(readLocalJSON('prolific_ids',[])).map(x=>`<option value="${escapeHTML(x)}"></option>`).join('');try{$('pid').value=localStorage.getItem('last_prolific_id')||''}catch{};$('start').onclick=()=>{const entered=$('pid').value.trim();if(!entered){$('gateError').textContent='Please enter your Prolific ID.';return}pid=entered;try{const savedPhase=localStorage.getItem(progressKey());phase=savedPhase==='main'||(!savedPhase&&readLocalJSON(mainSessionKey(),null))?'main':'practice'}catch{phase='practice'}saveProgress();restoreSession();const ids=[...new Set([entered,...readLocalJSON('prolific_ids',[])])].slice(0,10);try{localStorage.setItem('prolific_ids',JSON.stringify(ids));localStorage.setItem('last_prolific_id',entered)}catch{};$('gate').classList.add('hide');$('app').classList.remove('hide');renderTags();renderPosts()};$('pid').addEventListener('keydown',e=>{if(e.key==='Enter')$('start').click()});
})();
