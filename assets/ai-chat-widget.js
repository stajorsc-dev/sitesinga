(function(){
  if(document.getElementById('singaAiBubble')) return;

  var SYSTEM='Ты — мастер-консультант сервисного центра «Синга Сервис» в Ростове-на-Дону. Отвечай кратко (2-4 предложения). Цены: замена экрана телефона от 1500₽, iPhone от 2500₽, стекло iPhone от 999₽, аккумулятор от 1300₽, чистка ноутбука от 2000₽, ремонт кофемашины от 1500₽, ремонт ТВ от 2500₽. 8 точек приёма, диагностика бесплатна при ремонте, цена до начала работ. Телефон 8 928 161-87-89. В конце предлагай записаться или позвонить.';

  var css='#singaAiBubble{position:fixed;bottom:84px;right:20px;z-index:9990;width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#1a5eff,#0f4fd6);border:none;cursor:pointer;box-shadow:0 8px 28px rgba(26,94,255,.4);display:flex;align-items:center;justify-content:center;font-size:26px;transition:transform .2s}'
  +'#singaAiBubble:hover{transform:scale(1.08)}'
  +'#singaAiBubble .badge{position:absolute;top:-2px;right:-2px;width:18px;height:18px;background:#ef4444;border-radius:50%;font-size:11px;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700}'
  +'#singaAiPanel{position:fixed;bottom:84px;right:20px;z-index:9991;width:360px;max-width:calc(100vw - 32px);height:520px;max-height:calc(100vh - 120px);background:#fff;border-radius:20px;box-shadow:0 16px 56px rgba(0,0,0,.22);display:none;flex-direction:column;overflow:hidden}'
  +'#singaAiPanel.open{display:flex}'
  +'.sac-head{background:linear-gradient(135deg,#07152e,#1a3a7a);padding:16px 18px;display:flex;align-items:center;gap:12px}'
  +'.sac-ava{width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#1a5eff,#5b9fff);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}'
  +'.sac-head b{color:#fff;font-size:14px;display:block}.sac-head span{color:rgba(255,255,255,.5);font-size:11px}'
  +'.sac-close{margin-left:auto;background:none;border:none;color:rgba(255,255,255,.6);font-size:20px;cursor:pointer}'
  +'.sac-body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;background:#f7f9fc}'
  +'.sac-msg{max-width:85%;font-size:14px;line-height:1.55;padding:10px 14px;border-radius:14px}'
  +'.sac-msg.bot{background:#fff;border:1px solid #e8eef8;align-self:flex-start;border-bottom-left-radius:4px}'
  +'.sac-msg.user{background:#1a5eff;color:#fff;align-self:flex-end;border-bottom-right-radius:4px}'
  +'.sac-typing{align-self:flex-start;display:flex;gap:4px;padding:12px 14px;background:#fff;border:1px solid #e8eef8;border-radius:14px}'
  +'.sac-dot{width:7px;height:7px;border-radius:50%;background:#aab;animation:sacb 1.4s infinite}.sac-dot:nth-child(2){animation-delay:.2s}.sac-dot:nth-child(3){animation-delay:.4s}'
  +'@keyframes sacb{0%,80%,100%{opacity:.4}40%{opacity:1}}'
  +'.sac-chips{display:flex;gap:6px;flex-wrap:wrap;padding:0 16px 8px;background:#f7f9fc}'
  +'.sac-chip{background:#fff;border:1px solid #dde8f8;border-radius:16px;padding:6px 12px;font-size:12px;font-weight:600;cursor:pointer;color:#1a5eff}'
  +'.sac-foot{display:flex;gap:8px;padding:12px;border-top:1px solid #eef2f8;background:#fff}'
  +'.sac-input{flex:1;padding:10px 14px;border:1.5px solid #dde8f8;border-radius:12px;font-size:16px;outline:none;font-family:inherit}'
  +'.sac-send{width:42px;height:42px;border-radius:12px;background:#1a5eff;border:none;color:#fff;font-size:18px;cursor:pointer;flex-shrink:0}'
  +'@media(max-width:600px){#singaAiPanel{bottom:0;right:0;width:100%;max-width:100%;height:80vh;border-radius:20px 20px 0 0}#singaAiBubble{bottom:78px;right:14px}}';

  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  var bubble=document.createElement('button');
  bubble.id='singaAiBubble';bubble.setAttribute('aria-label','AI-консультант');
  bubble.innerHTML='🤖<span class="badge">1</span>';
  document.body.appendChild(bubble);

  var panel=document.createElement('div');
  panel.id='singaAiPanel';
  panel.innerHTML='<div class="sac-head"><div class="sac-ava">🤖</div><div><b>Мастер-консультант</b><span>Обычно отвечает сразу</span></div><button class="sac-close" aria-label="Закрыть">✕</button></div>'
    +'<div class="sac-body" id="sacBody"><div class="sac-msg bot">Здравствуйте! 👋 Я помогу узнать стоимость ремонта и записаться. Что у вас случилось?</div></div>'
    +'<div class="sac-chips" id="sacChips"><span class="sac-chip">Разбит экран</span><span class="sac-chip">Не заряжается</span><span class="sac-chip">Адреса точек</span></div>'
    +'<div class="sac-foot"><input class="sac-input" id="sacInput" placeholder="Напишите сообщение..."><button class="sac-send" id="sacSend">➤</button></div>';
  document.body.appendChild(panel);

  var hist=[];var loading=false;

  bubble.onclick=function(){panel.classList.add('open');bubble.style.display='none';document.querySelector('.badge').style.display='none';};
  panel.querySelector('.sac-close').onclick=function(){panel.classList.remove('open');bubble.style.display='flex';};

  function add(t,role){var b=document.getElementById('sacBody');var d=document.createElement('div');d.className='sac-msg '+role;d.innerHTML=t.replace(/\n/g,'<br>');b.appendChild(d);b.scrollTop=b.scrollHeight;}
  function typing(on){var b=document.getElementById('sacBody');if(on){var d=document.createElement('div');d.className='sac-typing';d.id='sacTyping';d.innerHTML='<div class="sac-dot"></div><div class="sac-dot"></div><div class="sac-dot"></div>';b.appendChild(d);b.scrollTop=b.scrollHeight;}else{var t=document.getElementById('sacTyping');if(t)t.remove();}}

  async function send(text){
    if(!text||loading)return;
    document.getElementById('sacChips').style.display='none';
    add(text,'user');hist.push({role:'user',content:text});
    loading=true;typing(true);
    try{
      var r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:350,system:SYSTEM,messages:hist})});
      var d=await r.json();typing(false);
      var reply=(d.content&&d.content[0]&&d.content[0].text)||'Позвоните нам: 8 928 161-87-89';
      add(reply,'bot');hist.push({role:'assistant',content:reply});
      if(hist.length>10)hist=hist.slice(-10);
    }catch(e){typing(false);add('Ошибка связи. Позвоните: <a href="tel:+79281618789" style="color:#1a5eff">8 928 161-87-89</a> или <a href="https://t.me/+79281618789" style="color:#1a5eff">Telegram</a>','bot');}
    loading=false;
  }

  document.getElementById('sacSend').onclick=function(){var i=document.getElementById('sacInput');var t=i.value.trim();if(t){i.value='';send(t);}};
  document.getElementById('sacInput').onkeydown=function(e){if(e.key==='Enter'){var t=this.value.trim();if(t){this.value='';send(t);}}};
  document.querySelectorAll('.sac-chip').forEach(function(c){c.onclick=function(){send(this.textContent);};});
})();
