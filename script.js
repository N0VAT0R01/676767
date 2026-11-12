const game = document.getElementById("game");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const streakEl = document.getElementById("streak");

const state = {
  score: 0, lives: 3, streak: 0, step: 0, correct: 0,
  best: Number(localStorage.getItem("knaguBest") || 0)
};

const levels = [
  {type:"quiz", title:"🏫 Найди аудиторию", text:"Тебе пора на первую пару. Какая аудитория подходит для занятия?", q:"Выбери вариант, который логично подходит для большой лекции.", options:["Большая лекционная аудитория","Буфет","Спортивная площадка","Гардероб"], answer:0},
  {type:"logic", title:"🧠 Логическая разминка", text:"Немного математики перед парой.", q:"Продолжи последовательность: 2, 4, 8, 16, ?", answer:32},
  {type:"memory", title:"🧩 Запомни маршрут", text:"Открой пары одинаковых символов. Тренируем память и внимание."},
  {type:"quiz", title:"📚 Учебный выбор", text:"Что поможет эффективнее подготовиться к экзамену?", q:"Выбери наиболее полезную стратегию.", options:["Регулярно повторять материал","Начать учить всё ночью перед экзаменом","Игнорировать непонятные темы","Полагаться только на удачу"], answer:0},
  {type:"reaction", title:"⚡ Быстрая реакция", text:"Проверим внимательность. Нажми кнопку, когда появится сигнал.",},
  {type:"sequence", title:"🔢 Код студента", text:"Запомни последовательность чисел и введи её.",},
  {type:"quiz", title:"💻 Цифровая грамотность", text:"Мини-вопрос про безопасную работу в интернете.", q:"Какой пароль лучше?", options:["12345678","qwerty","Имя + дата рождения","Длинная уникальная фраза с разными символами"], answer:3},
  {type:"logic", title:"🎯 Финальная задача", text:"Последняя разминка перед финалом.", q:"У тебя 3 пары по 90 минут. Сколько минут занятий всего?", answer:270}
];

function updateStats(){
  scoreEl.textContent=state.score; livesEl.textContent=state.lives; streakEl.textContent=state.streak;
}
function shell(inner){game.innerHTML=`<section class="card">${inner}</section>`;updateStats()}
function start(){
  state.score=0;state.lives=3;state.streak=0;state.step=0;state.correct=0;
  renderLevel();
}
function intro(){
  shell(`<div class="hero"><div>
    <div class="emoji">🎓</div><h1>День первокурсника</h1>
    <p class="lead">Небольшой игровой квест в атмосфере студенческой жизни КнАГУ. Пройди учебный день, решай задачи, тренируй память и заработай звание.</p>
    <div class="buttons"><button class="btn" onclick="start()">Начать квест</button><button class="btn secondary" onclick="showRules()">Как играть</button></div>
  </div></div>`);
}
function showRules(){
  shell(`<div class="hero"><div><div class="emoji">📖</div><h2>Как играть</h2>
  <p class="lead">Тебя ждут разные мини-игры: вопросы, логика, память, реакция и запоминание последовательности. За правильные ответы получаешь ⭐, а серия правильных ответов увеличивает награду.</p>
  <p class="lead">У тебя 3 ❤️. Ошибка снимает жизнь. Постарайся пройти весь учебный день!</p>
  <button class="btn" onclick="start()">Поехали!</button></div></div>`);
}
function header(title,text){
  const pct=Math.round(state.step/levels.length*100);
  return `<div class="meta"><span>Задание ${state.step+1} из ${levels.length}</span><span>${pct}% дня</span></div>
  <div class="progress"><i style="width:${pct}%"></i></div><h2>${title}</h2><p class="lead" style="margin-left:0">${text}</p>`;
}
function renderLevel(){
  if(state.lives<=0){finish(false);return}
  if(state.step>=levels.length){finish(true);return}
  const l=levels[state.step];
  if(l.type==="quiz") renderQuiz(l);
  if(l.type==="logic") renderLogic(l);
  if(l.type==="memory") renderMemory(l);
  if(l.type==="reaction") renderReaction(l);
  if(l.type==="sequence") renderSequence(l);
}
function correct(points=100){
  const bonus=state.streak>=2?50:0;
  state.score+=points+bonus;state.correct++;state.streak++;updateStats();
}
function wrong(){
  state.lives--;state.streak=0;updateStats();
}
function next(msg=""){
  state.step++;renderLevel();
}
function renderQuiz(l){
  shell(`${header(l.title,l.text)}<h3>${l.q}</h3><div class="choices">${l.options.map((x,i)=>`<button class="choice" onclick="answerQuiz(${i},${l.answer})">${x}</button>`).join("")}</div><div id="feedback"></div>`);
}
function answerQuiz(i,a){
  const buttons=[...document.querySelectorAll(".choice")];buttons.forEach(b=>b.disabled=true);
  buttons[i].classList.add(i===a?"correct":"wrong");
  const fb=document.getElementById("feedback");
  if(i===a){correct();fb.innerHTML=`<div class="feedback">🎉 Верно! +${state.streak>=2?150:100} ⭐</div>`}
  else{wrong();buttons[a].classList.add("correct");fb.innerHTML=`<div class="feedback">❌ Не совсем. Правильный вариант подсвечен. Осталось ❤️ ${state.lives}</div>`}
  setTimeout(next,900);
}
function renderLogic(l){
  shell(`${header(l.title,l.text)}<h3 style="text-align:center">${l.q}</h3><div class="input-row"><input id="answer" class="input" type="number" placeholder="?"><button class="btn" onclick="answerLogic(${l.answer})">Проверить</button></div>`);
  document.getElementById("answer").focus();
}
function answerLogic(a){
  const val=Number(document.getElementById("answer").value);
  if(val===a){correct(120);alertBox("🎉 Верно! Отличная логика.");}
  else{wrong();alertBox(`❌ Правильный ответ: ${a}.`)}
  setTimeout(next,800);
}
function alertBox(t){game.querySelector(".card").insertAdjacentHTML("beforeend",`<div class="feedback">${t}</div>`);}

let mem={};
function renderMemory(){
  const symbols=["🚀","📚","🎓","💡","🚀","📚","🎓","💡"].sort(()=>Math.random()-.5);
  mem={symbols,open:[],matched:[],busy:false};
  shell(`${header("🧩 Память","Найди все одинаковые пары. Это мини-тренировка внимания.")}<div class="memory-grid">${symbols.map((s,i)=>`<button class="tile" id="t${i}" onclick="flip(${i})">?</button>`).join("")}</div><p class="lead">Найдено пар: <b id="pairs">0</b>/4</p>`);
}
function flip(i){
  if(mem.busy||mem.open.includes(i)||mem.matched.includes(i))return;
  mem.open.push(i);document.getElementById("t"+i).textContent=mem.symbols[i];document.getElementById("t"+i).classList.add("open");
  if(mem.open.length===2){
    mem.busy=true;const [a,b]=mem.open;
    if(mem.symbols[a]===mem.symbols[b]){
      mem.matched.push(a,b);document.getElementById("t"+a).classList.add("done");document.getElementById("t"+b).classList.add("done");
      mem.open=[];mem.busy=false;document.getElementById("pairs").textContent=mem.matched.length/2;
      if(mem.matched.length===8){correct(180);setTimeout(next,700)}
    }else{
      setTimeout(()=>{[a,b].forEach(x=>{document.getElementById("t"+x).textContent="?";document.getElementById("t"+x).classList.remove("open")});mem.open=[];mem.busy=false;wrong()},650)
    }
  }
}
function renderReaction(){
  shell(`${header("⚡ Быстрая реакция","Кнопка пока не активна. Жди сигнал...")}<div class="timer" id="reactionText">Готовься</div><div class="buttons"><button id="reactionBtn" class="btn secondary" disabled>ЖДАТЬ...</button></div>`);
  const delay=1200+Math.random()*2800;setTimeout(()=>{const b=document.getElementById("reactionBtn");if(!b)return;b.disabled=false;b.textContent="НАЖМИ!";b.classList.remove("secondary");document.getElementById("reactionText").textContent="⚡ СЕЙЧАС!";mem.start=performance.now();b.onclick=()=>{const ms=Math.round(performance.now()-mem.start);correct(ms<600?220:150);alertBox(`⚡ ${ms} мс! Отличная реакция.`);b.disabled=true;setTimeout(next,900)}},delay)
}
function renderSequence(){
  const nums=Array.from({length:5},()=>Math.floor(Math.random()*9)+1);mem.seq=nums.join("");
  shell(`${header("🔢 Код студента","Запомни числа. Через пару секунд они исчезнут.")}<div class="sequence">${nums.map(n=>`<div class="seq-item">${n}</div>`).join("")}</div><p class="lead" id="seqHint">Запоминай...</p>`);
  setTimeout(()=>{const seq=document.querySelector(".sequence");if(seq)seq.innerHTML="";const hint=document.getElementById("seqHint");if(hint)hint.textContent="Введи последовательность без пробелов.";game.querySelector(".card").insertAdjacentHTML("beforeend",`<div class="input-row"><input id="seqInput" class="input" maxlength="5" inputmode="numeric"><button class="btn" onclick="answerSeq()">Проверить</button></div>`)},1700)
}
function answerSeq(){
  const v=document.getElementById("seqInput").value;
  if(v===mem.seq){correct(200);alertBox("🧠 Идеально! Память на высоте.");}
  else{wrong();alertBox(`❌ Было: ${mem.seq}`)}
  setTimeout(next,900);
}
function finish(completed){
  const rank=state.score>=1300?"🏆 Легенда КнАГУ":state.score>=900?"🥇 Отличник":state.score>=550?"🥈 Студент":"🎒 Новичок";
  if(state.score>state.best){state.best=state.score;localStorage.setItem("knaguBest",state.best)}
  shell(`<div class="hero"><div><div class="emoji">${completed?"🏆":"💔"}</div><h1>${completed?"День завершён!":"Попытка окончена"}</h1>
  <div class="rank">${rank}</div><p class="lead">${completed?"Ты прошёл все испытания учебного дня. Отличный результат!":"Жизни закончились, но теперь ты знаешь, где ошибся. Попробуй ещё раз!"}</p>
  <div class="result-grid"><div class="result-box"><b>${state.score}</b><span>ОЧКОВ</span></div><div class="result-box"><b>${state.correct}/${levels.length}</b><span>ПРАВИЛЬНО</span></div><div class="result-box"><b>${state.best}</b><span>ЛУЧШИЙ РЕЗУЛЬТАТ</span></div></div>
  <div class="buttons"><button class="btn" onclick="start()">Играть снова</button><button class="btn secondary" onclick="intro()">В меню</button></div>
  </div></div>`);
}
intro();
