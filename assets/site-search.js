(function(){
  if(document.getElementById('siteSearchBtn')) return;

  // ---- Стили ----
  var css = `
  #siteSearchModal{position:fixed;inset:0;z-index:10001;background:rgba(7,21,46,.55);backdrop-filter:blur(6px);display:none;align-items:flex-start;justify-content:center;padding:80px 16px 16px}
  #siteSearchModal.open{display:flex}
  .ss-box{background:#fff;border-radius:20px;width:100%;max-width:600px;max-height:75vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,.3);animation:ssIn .2s}
  @keyframes ssIn{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:none}}
  .ss-head{display:flex;align-items:center;gap:12px;padding:16px 18px;border-bottom:1px solid #eef2f8}
  .ss-head svg{width:20px;height:20px;stroke:#8a9bb5;fill:none;stroke-width:2;flex-shrink:0}
  .ss-input{flex:1;border:none;outline:none;font-size:17px;font-family:inherit;color:#0c1428;background:none}
  .ss-esc{font-size:11px;color:#8a9bb5;border:1px solid #dde8f8;border-radius:6px;padding:3px 7px;font-weight:700;flex-shrink:0}
  .ss-results{overflow-y:auto;padding:8px;flex:1}
  .ss-item{display:flex;align-items:flex-start;gap:12px;padding:12px 14px;border-radius:12px;text-decoration:none;color:inherit;transition:background .12s;cursor:pointer}
  .ss-item:hover,.ss-item.sel{background:#f5f8ff}
  .ss-item__ico{width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,#1a5eff,#5b9fff);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
  .ss-item__body{flex:1;min-width:0}
  .ss-item__title{font-size:15px;font-weight:700;color:#0c1428;margin-bottom:2px}
  .ss-item__desc{font-size:12px;color:#8a9bb5;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .ss-item__cat{font-size:10px;font-weight:700;color:#1a5eff;background:#eff3ff;padding:2px 8px;border-radius:99px;flex-shrink:0;align-self:center}
  .ss-empty{text-align:center;padding:40px 20px;color:#8a9bb5;font-size:14px}
  .ss-hint{padding:10px 16px;border-top:1px solid #eef2f8;font-size:12px;color:#8a9bb5;display:flex;gap:14px;flex-wrap:wrap}
  .ss-hint b{color:#556070}
  mark{background:#fff3a8;color:inherit;border-radius:2px;padding:0 1px}
  /* Кнопка в шапке */
  #siteSearchBtn{display:inline-flex;align-items:center;gap:8px;background:#f5f8ff;border:1.5px solid #dde8f8;border-radius:12px;padding:8px 14px;font-size:14px;color:#8a9bb5;cursor:pointer;font-family:inherit;transition:all .15s}
  #siteSearchBtn:hover{border-color:#1a5eff;color:#1a5eff}
  #siteSearchBtn svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2}
  #siteSearchBtn kbd{font-size:11px;background:#fff;border:1px solid #dde8f8;border-radius:5px;padding:1px 5px;font-family:inherit}
  /* Плавающая кнопка на мобильных */
  #siteSearchFab{position:fixed;bottom:140px;right:20px;z-index:980;width:50px;height:50px;border-radius:50%;background:#fff;border:1.5px solid #dde8f8;box-shadow:0 6px 20px rgba(26,94,255,.15);display:none;align-items:center;justify-content:center;cursor:pointer}
  #siteSearchFab svg{width:22px;height:22px;stroke:#1a5eff;fill:none;stroke-width:2}
  [data-theme="dark"] .ss-box{background:#111d2e}
  [data-theme="dark"] .ss-item__title{color:#e8eef8}
  [data-theme="dark"] .ss-input{color:#e8eef8}
  @media(max-width:760px){#siteSearchBtn kbd{display:none}#siteSearchFab{display:flex}}
  `;
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  // ---- Иконки категорий ----
  var CAT_ICO={'Услуги':'🔧','Районы':'📍','Блог':'📝','Замена':'🔩','AI-инструменты':'🤖','Инструменты':'🧰','Сервис':'⭐'};

  // ---- Модалка ----
  var modal=document.createElement('div');
  modal.id='siteSearchModal';
  modal.innerHTML=`<div class="ss-box">
    <div class="ss-head">
      <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
      <input class="ss-input" id="ssInput" placeholder="Поиск по сайту: iPhone, кофемашина, гарантия..." autocomplete="off">
      <button type="button" class="ss-esc" id="ssClose" aria-label="Закрыть поиск" style="cursor:pointer;border:none;background:#f0f3fa;">ESC</button>
    </div>
    <div class="ss-results" id="ssResults"></div>
    <div class="ss-hint"><span><b>↑↓</b> выбор</span><span><b>Enter</b> открыть</span><span><b>Esc</b> закрыть</span></div>
  </div>`;
  document.body.appendChild(modal);

  // ---- Кнопка в навигации ----
  var btn=document.createElement('button');
  btn.id='siteSearchBtn';
  btn.innerHTML='<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg> Поиск <kbd>Ctrl K</kbd>';
  btn.onclick=openSearch;
  // Пытаемся вставить в навигацию
  var nav=document.querySelector('.nav__actions, .nav-actions, .header__actions, .menu');
  if(nav){ nav.insertBefore(btn, nav.firstChild); }

  // ---- Плавающая кнопка (мобильные) ----
  var fab=document.createElement('button');
  fab.id='siteSearchFab';
  fab.setAttribute('aria-label','Поиск по сайту');
  fab.innerHTML='<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>';
  fab.onclick=openSearch;
  document.body.appendChild(fab);

  var input=document.getElementById('ssInput');
  var results=document.getElementById('ssResults');
  var selIdx=0, current=[];

  function openSearch(){
    modal.classList.add('open');
    input.value='';
    input.focus();
    showDefault();
  }
  function closeSearch(){ modal.classList.remove('open'); }

  function showDefault(){
    var idx=window.SINGA_INDEX||[];
    // Показываем популярные
    var popular=['prays-list.html','calculator.html','remont-iphone.html','kontakty.html','zapis.html','ai-diagnostika.html'];
    var items=popular.map(u=>idx.find(i=>i.u===u)).filter(Boolean);
    current=items; selIdx=0;
    results.innerHTML='<div style="padding:8px 14px;font-size:11px;font-weight:700;color:#8a9bb5;text-transform:uppercase;letter-spacing:.05em">Популярное</div>'+renderItems(items,'');
  }

  function esc(s){return s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));}
  function hl(text,q){
    if(!q) return esc(text);
    try{ return esc(text).replace(new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi'),'<mark>$1</mark>'); }
    catch(e){ return esc(text); }
  }

  function renderItems(items,q){
    return items.map((it,i)=>`<a class="ss-item${i===selIdx?' sel':''}" href="${it.u}" data-i="${i}">
      <span class="ss-item__ico">${CAT_ICO[it.c]||'📄'}</span>
      <span class="ss-item__body">
        <span class="ss-item__title">${hl(it.t,q)}</span>
        <span class="ss-item__desc">${esc(it.d)}</span>
      </span>
      <span class="ss-item__cat">${it.c}</span>
    </a>`).join('');
  }

  function search(q){
    q=q.toLowerCase().trim();
    if(!q){ showDefault(); return; }
    var idx=window.SINGA_INDEX||[];
    var words=q.split(/\s+/);
    var scored=[];
    idx.forEach(it=>{
      var hay=(it.t+' '+it.k).toLowerCase();
      var score=0;
      words.forEach(w=>{
        if(it.t.toLowerCase().includes(w)) score+=10;
        if(hay.includes(w)) score+=3;
      });
      if(score>0) scored.push({it,score});
    });
    scored.sort((a,b)=>b.score-a.score);
    current=scored.slice(0,12).map(s=>s.it);
    selIdx=0;
    results.innerHTML=current.length?renderItems(current,q):'<div class="ss-empty">😕 Ничего не найдено по «'+esc(q)+'»<br><br>Попробуйте: <b>iPhone</b>, <b>экран</b>, <b>кофемашина</b>, <b>цены</b></div>';
  }

  function updateSel(){
    results.querySelectorAll('.ss-item').forEach((el,i)=>el.classList.toggle('sel',i===selIdx));
    var sel=results.querySelector('.ss-item.sel');
    if(sel) sel.scrollIntoView({block:'nearest'});
  }

  input.addEventListener('input',e=>search(e.target.value));
  input.addEventListener('keydown',e=>{
    if(e.key==='ArrowDown'){e.preventDefault();selIdx=Math.min(selIdx+1,current.length-1);updateSel();}
    else if(e.key==='ArrowUp'){e.preventDefault();selIdx=Math.max(selIdx-1,0);updateSel();}
    else if(e.key==='Enter'){e.preventDefault();if(current[selIdx])location.href=current[selIdx].u;}
    else if(e.key==='Escape'){closeSearch();}
  });

  modal.addEventListener('click',e=>{if(e.target===modal)closeSearch();});
  var ssCloseBtn=document.getElementById('ssClose');
  if(ssCloseBtn){ ssCloseBtn.addEventListener('click',closeSearch); }

  // Глобальные горячие клавиши
  document.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();openSearch();}
    else if(e.key==='Escape' && modal.classList.contains('open')){closeSearch();}
  });
})();
