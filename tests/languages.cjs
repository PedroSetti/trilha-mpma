const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const base=process.argv[2]||'server/study',nodes=new Map();let saves=0,toasts=[];
const el=id=>{if(!nodes.has(id))nodes.set(id,{value:'',innerHTML:'',textContent:'',open:false,disabled:false,addEventListener(){},showModal(){this.open=true},insertAdjacentHTML(_,s){this.innerHTML+=s}});return nodes.get(id)};
const context={console,Date,setInterval:()=>1,clearInterval(){},window:{speechSynthesis:{getVoices:()=>[],cancel(){},addEventListener(){}}},state:{videos:{},done:{original:'keep'}},$:el,document:{querySelector:el,querySelectorAll:()=>[]},formValues:{},save(){saves++},today:()=> '2026-11-11',render(){},toast:t=>toasts.push(t),esc:s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])),videoHTML:id=>`<iframe src="${id}"></iframe>`,videoChoicesHTML:()=>'',monitorVideo(){},teachingHTML:t=>`<section>${t.id}</section>`,active:null};
context.FormData=class{get(k){return context.formValues[k]??null}};const c=vm.createContext(context),run=s=>vm.runInContext(s,c);
for(const name of ['program','careers-data','video-catalog','career-videos','learning-data','courses-data','course-labs','languages-data','language-videos','languages','courses'])vm.runInContext(fs.readFileSync(path.join(base,name+'.js'),'utf8'),c);
assert.equal(run('STUDY_COURSES.length'),9);assert.equal(run('courseLessons.length'),177);assert.equal(run('LANGUAGE_COURSES.length'),5);
assert(run('LANGUAGE_COURSES.every(c=>c.lessons.length===24&&[0,1,2].every(s=>c.lessons.filter(l=>l.stage===s).length===8))'));
assert(run('LANGUAGE_COURSES.every(c=>c.lessons.every(l=>l.theory.length>120&&l.phrase&&l.meaning&&l.task&&l.wrong))'));
assert(run('new Set(courseLessons.map(l=>l.id)).size===177'));
assert(run('courseLessons.every(l=>(VIDEO_CATALOG[l.id]||[]).length>0)'));
assert(run('LANGUAGE_COURSES.filter(c=>["japones","chines"].includes(c.id)).every(c=>c.lessons.every(l=>l.reading))'));
for(const course of run('LANGUAGE_COURSES')){
 for(const key of ['0','1','2','final']){
  context.testCourse=course;context.testKey=key;const qs=run('languageExamQuestions(testCourse,testKey)');assert.equal(qs.length,key==='final'?24:16);assert.equal(new Set(qs.map(q=>q.id)).size,qs.length);
  for(const q of qs){assert(q.correct>=0&&q.correct<q.options.length);assert.equal(new Set(q.options).size,q.options.length);assert(q.explanation.length>100)}
  context.testQuestions=qs;context.testAnswers=Object.fromEntries(qs.map(q=>[q.id,q.correct]));assert.equal(run('gradeLanguage(testQuestions,testAnswers).score'),100);assert(run('gradeLanguage(testQuestions,testAnswers).passed'));
  context.testAnswers=Object.fromEntries(qs.map(q=>[q.id,(q.correct+1)%q.options.length]));assert.equal(run('gradeLanguage(testQuestions,testAnswers).score'),0);
 }
}
run('openCourseLesson("course-japones-4")');assert(el('#lesson-content').innerHTML.includes('私は学生です。'));assert(el('#language-speak').disabled);
run('openLanguageLesson("course-ingles-1")');el('#language-activity').onsubmit({preventDefault(){}});assert(toasts.at(-1).includes('duas atividades'));
let qs=run('[languageQuestion(LANGUAGE_COURSES.find(c=>c.id==="ingles"),LANGUAGE_COURSES.find(c=>c.id==="ingles").lessons[0],0),languageQuestion(LANGUAGE_COURSES.find(c=>c.id==="ingles"),LANGUAGE_COURSES.find(c=>c.id==="ingles").lessons[0],1)]');context.formValues=Object.fromEntries(qs.map(q=>[q.id,String(q.correct)]));el('#language-activity').onsubmit({preventDefault(){}});assert.equal(run('state.courses.languageActivities["course-ingles-1"].correct'),2);
el('#language-activity-retry').onclick();assert.equal(run('state.courses.languageBests["course-ingles-1"]'),2);
el('#course-notes').oninput({target:{value:'<script>bad()</script>'}});run('openLanguageLesson("course-ingles-1")');assert(el('#lesson-content').innerHTML.includes('&lt;script&gt;bad()&lt;/script&gt;'));
el('#course-complete').onclick();assert.equal(run('state.courses.done["course-ingles-1"]'),'2026-11-11');assert.equal(run('state.done.original'),'keep');
run('openLanguageExam("chines","0")');const form=el('#language-exam-form');form.onsubmit({preventDefault(){}});assert(toasts.at(-1).includes('todas'));
qs=run('languageExamQuestions(LANGUAGE_COURSES.find(c=>c.id==="chines"),"0")');function change(q){el('#language-exam-form').onchange({target:{matches:()=>true,name:q.id,value:String(q.correct)}})}change(qs[0]);run('openLanguageExam("chines","0")');assert.equal(run('Object.keys(state.courses.languageAttempts["chines:0"].answers).length'),1);
qs.forEach(change);el('#language-exam-form').onsubmit({preventDefault(){}});assert.equal(run('state.courses.languageHistory.at(-1).score'),100);assert.equal(run('state.courses.languageAttempts["chines:0"]'),undefined);assert(el('#lesson-content').innerHTML.includes('Gabarito comentado'));assert.equal(run('state.courses.languageHistory.length'),1);
el('#language-exam-retry').onclick();assert.equal(run('Object.keys(state.courses.languageAttempts["chines:0"].answers).length'),0);assert.equal(run('state.courses.languageHistory.length'),1);
assert(saves>20);console.log('PASS: 5 languages / 120 lessons / 240 activities / 20 exams; script order, video coverage, grading, saved drafts, retry, history, XSS escaping, independent progress and unavailable voice fallback');

