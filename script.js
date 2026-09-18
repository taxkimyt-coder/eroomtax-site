/* ============================================================
   이룸세무회계 공용 스크립트
   - goPage(): SPA 방식 대신 실제 페이지(URL) 이동으로 변경 (SEO 대응)
   - postToSheet(): 상담폼 전송 실패를 감지하고 대체 안내를 보여주는 안전장치
   ============================================================ */

// 페이지 id → 실제 파일명 매핑
const PAGE_MAP = {
  home:'index.html', services:'services.html', about:'about.html',
  blog:'blog.html', contact:'contact.html', pricing:'pricing.html',
  'svc-jang':'svc-jang.html', 'svc-tax':'svc-tax.html', 'svc-con':'svc-con.html',
  'svc-report':'svc-report.html'
};

function goPage(id, contactTab){
  let url = PAGE_MAP[id] || 'index.html';
  if(contactTab) url += '?tab=' + encodeURIComponent(contactTab);
  location.href = url;
}

function toggleMenu(){
  const m=document.getElementById('mobile-menu');
  m.style.display=m.style.display==='flex'?'none':'flex';
}
function toggleFaq(el){el.classList.toggle('open');}

// ── 스크롤 하이라이트 ──
(function(){
  let activeCard = null;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      const type = el.dataset.highlight;
      if(entry.isIntersecting) {
        if(activeCard && activeCard !== el) {
          activeCard.style.borderColor = '#e8e8e8';
          activeCard.style.boxShadow = 'none';
        }
        if(type === 'gold' || type === 'purple') {
          el.style.borderColor = '#7C3AED';
          el.style.boxShadow = '0 4px 20px rgba(124,58,237,.2)';
        }
        activeCard = el;
      } else {
        if(activeCard === el) {
          el.style.borderColor = '#e8e8e8';
          el.style.boxShadow = 'none';
          activeCard = null;
        }
      }
    });
  }, { threshold: 0.6, rootMargin: '0px 0px -60px 0px' });

  function initHighlight(){
    document.querySelectorAll('[data-highlight]').forEach(el => observer.observe(el));
  }
  document.addEventListener('click', ()=> setTimeout(initHighlight, 100));
  setTimeout(initHighlight, 300);
})();

function openRtab(name, btn){
  document.querySelectorAll('.rtab, .report-chip').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.report-slide').forEach(s=>s.classList.remove('active'));
  btn.classList.add('active');
  const slide = document.getElementById('rslide-'+name);
  if(slide) slide.classList.add('active');
}
function openStab(name){
  ['양도','상속','증여'].forEach(t=>{
    const btn=document.getElementById('stab-'+t);
    const con=document.getElementById('sc-'+t);
    const active=t===name;
    if(btn){btn.style.borderColor=active?'#E8B923':'var(--border)';btn.style.background=active?'#F3F1EC':'#fff';btn.style.color=active?'#5C5346':'var(--text2)';}
    if(con) con.style.display=active?'block':'none';
  });
}
function openCtab(name){
  ['경정','이의','조세'].forEach(t=>{
    const btn=document.getElementById('ctab-'+t);
    const con=document.getElementById('cc-'+t);
    const active=t===name;
    if(btn){btn.style.borderColor=active?'var(--purple)':'var(--border)';btn.style.background=active?'var(--purple-bg)':'#fff';btn.style.color=active?'var(--purple-text)':'var(--text2)';}
    if(con) con.style.display=active?'block':'none';
  });
}

// ── 후기 마퀴 무한 루프 ──
(function(){
  const track = document.getElementById('revTrack');
  if(!track) return;
  track.innerHTML += track.innerHTML;
})();

const cHeaders = {
  jang: '대표님 정보와<br>상담 내용을 적어주세요',
  yang: '상속·증여·양도 등 세금 관련 문의를<br>남겨주시면 전문 세무사가 직접 연락드립니다.',
  etc:  '궁금하신 내용을 남겨주시면<br>빠르게 연락드리겠습니다.'
};
function switchConsult(type) {
  const box = document.getElementById('c-success-box');
  if(box) box.remove();
  const failBox = document.getElementById('c-fail-box');
  if(failBox) failBox.remove();
  document.querySelector('.cfield')?.style.removeProperty('display');
  document.querySelector('.cdivider')?.style.removeProperty('display');
  ['jang','yang','etc'].forEach(t => {
    document.getElementById('ctab2-'+t)?.classList.remove('active');
    const el = document.getElementById('ctab-'+t);
    if(el){
      el.classList.remove('active');
      el.style.display='';
      el.querySelectorAll('input:not([type=radio])').forEach(i=>i.value='');
      el.querySelectorAll('textarea').forEach(i=>i.value='');
      el.querySelectorAll('select').forEach(i=>i.selectedIndex=0);
      el.querySelectorAll('input[type=radio]').forEach(i=>i.checked=false);
      const cc = document.getElementById('cc-'+t);
      if(cc) cc.textContent='0';
    }
  });
  document.querySelectorAll('input[name="c-method"]').forEach(i=>i.checked=false);
  const agreeReset = document.getElementById('c-agree');
  if(agreeReset) agreeReset.checked = false;
  document.querySelectorAll('.radio-circle2').forEach(c=>{
    c.style.borderColor=''; c.style.background='';
  });
  const sBtn = document.querySelector('.csubmit');
  if(sBtn) sBtn.style.display='';
  const sNote = document.querySelector('.cnote');
  if(sNote) sNote.style.display='';
  const el2 = document.getElementById('ctab2-'+type);
  if(el2) el2.classList.add('active');
  const el = document.getElementById('ctab-'+type);
  if(el) el.classList.add('active');
  const h = document.getElementById('c-header-title');
  if(h) h.innerHTML = cHeaders[type];
}
function cCount(el, ccId) {
  const cc = document.getElementById(ccId);
  if(cc) cc.textContent = el.value.length;
}
function formatTel(el) {
  let v = el.value.replace(/[^0-9]/g,'');
  if(v.startsWith('02')) {
    if(v.length <= 2)        el.value = v;
    else if(v.length <= 5)   el.value = v.slice(0,2) + '-' + v.slice(2);
    else if(v.length <= 9)   el.value = v.slice(0,2) + '-' + v.slice(2,5) + '-' + v.slice(5);
    else                     el.value = v.slice(0,2) + '-' + v.slice(2,6) + '-' + v.slice(6,10);
  } else if(/^0[3-9]/.test(v)) {
    if(v.length <= 3)        el.value = v;
    else if(v.length <= 6)   el.value = v.slice(0,3) + '-' + v.slice(3);
    else if(v.length <= 10)  el.value = v.slice(0,3) + '-' + v.slice(3,6) + '-' + v.slice(6);
    else                     el.value = v.slice(0,3) + '-' + v.slice(3,7) + '-' + v.slice(7,11);
  } else {
    if(v.length <= 3)        el.value = v;
    else if(v.length <= 7)   el.value = v.slice(0,3) + '-' + v.slice(3);
    else                     el.value = v.slice(0,3) + '-' + v.slice(3,7) + '-' + v.slice(7,11);
  }
}

/* ============================================================
   상담폼 전송 안전장치
   - Content-Type을 'text/plain'으로 보내 CORS 사전 확인(preflight)을
     피하고, mode:'no-cors' 없이 정상 요청을 보냅니다.
   - 그 결과 Apps Script의 실제 응답({result:'success'|'error'})을
     읽을 수 있어, 서버 쪽 오류(스크립트 만료, 예외 발생 등)까지
     정확히 감지해서 사용자에게 알릴 수 있습니다.
   - 네트워크 자체 문제(오프라인, 타임아웃)는 catch에서 별도 처리하며,
     실패한 신청 내용은 localStorage에 백업해 완전한 유실을 막습니다.
   ============================================================ */
async function postToSheet(payload){
  const controller = new AbortController();
  const timer = setTimeout(()=>controller.abort(), 8000);
  try {
    // Content-Type을 text/plain으로 보내면 브라우저의 CORS 사전 확인(preflight)이
    // 발생하지 않아서, Apps Script의 실제 응답(성공/실패)을 읽을 수 있습니다.
    // (Apps Script는 Content-Type과 무관하게 e.postData.contents로 원문을 그대로 받습니다)
    const res = await fetch(SCRIPT_URL, {
      method:'POST',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timer);
    const json = await res.json().catch(()=>null);

    if(res.ok && json && json.result === 'success'){
      return { ok:true };
    }
    console.error('[이룸세무회계] 서버 응답 오류:', res.status, json);
    return { ok:false, error: (json && json.message) || ('HTTP '+res.status) };

  } catch(err) {
    clearTimeout(timer);
    console.error('[이룸세무회계] 상담 신청 전송 실패:', err, payload);
    try {
      const failed = JSON.parse(localStorage.getItem('eroom_failed_leads') || '[]');
      failed.push({ payload, time:new Date().toISOString(), error:String(err) });
      localStorage.setItem('eroom_failed_leads', JSON.stringify(failed));
    } catch(e) { /* 저장 실패는 무시 */ }
    return { ok:false, error: String(err) };
  }
}

function renderFailBox(container, retryFn){
  const existing = document.getElementById('c-fail-box') || document.getElementById('f-fail-box');
  if(existing) existing.remove();
  const box = document.createElement('div');
  box.id = container === 'consult' ? 'c-fail-box' : 'f-fail-box';
  box.innerHTML = `
    <div style="margin-top:16px;text-align:center;padding:20px;background:#FBEFEF;border-radius:12px;border:1px solid #f5c6c6;">
      <div style="font-size:14px;font-weight:700;color:#B23A3A;margin-bottom:6px;">전송이 확인되지 않았습니다</div>
      <p style="font-size:13px;color:#666;line-height:1.7;margin-bottom:14px;">인터넷 연결이 불안정하거나 서버 응답이 없었어요.<br>아래 버튼으로 다시 시도하시거나, 카카오톡으로 바로 문의해 주세요.</p>
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
        <button onclick="window.open('http://pf.kakao.com/_GsQcj/chat','_blank')" style="background:#E8B923;color:#14171c;border:none;padding:10px 18px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;"><iconify-icon icon="solar:chat-round-dots-bold"></iconify-icon> 카카오톡으로 문의</button>
        <button id="${container}-retry-btn" style="background:none;border:1.5px solid #e8e8e8;padding:10px 18px;border-radius:8px;font-size:13px;cursor:pointer;color:#666;">다시 시도</button>
      </div>
    </div>`;
  return box;
}

async function submitConsult() {
  const method = document.querySelector('input[name="c-method"]:checked');
  if(!method){alert('상담 방식을 선택해 주세요.');return;}

  const agree = document.getElementById('c-agree');
  if(agree && !agree.checked){alert('개인정보 수집·이용에 동의해 주셔야 상담 신청이 가능합니다.');return;}

  const activeTab = document.querySelector('.ctab-content.active');
  if(!activeTab) return;
  const type = activeTab.id.replace('ctab-','');

  const telEl = document.getElementById('c-tel-'+type);
  if(!telEl||!telEl.value.trim()){alert('연락처를 입력해 주세요.');return;}

  const nameEl    = document.getElementById('c-name-'+type);
  const emailEl   = document.getElementById('c-email-'+type);
  const contentEl = document.getElementById('c-content-'+type);

  const revEl      = type==='jang' ? document.getElementById('c-rev-jang') : null;
  const biztypeEl  = type==='jang' ? document.querySelector('#ctab-jang input[name="c-biztype"]:checked') : null;
  const industryEl = type==='jang' ? document.getElementById('c-biz-jang') : null;
  const yangtypeEl = type==='yang' ? document.getElementById('c-yangtype') : null;

  const btn = document.querySelector('.csubmit');
  btn.textContent='전송 중...'; btn.disabled=true;

  const payload = {
    tabType:  type,
    method:   method.value==='kakao' ? '카카오톡' : '전화',
    name:     nameEl?.value||'',
    tel:      telEl.value,
    email:    emailEl?.value||'',
    biztype:  biztypeEl?.value||'',
    industry: industryEl?.value||'',
    revenue:  revEl?.value||'',
    yangtype: yangtypeEl?.value||'',
    content:  contentEl?.value||''
  };

  const result = await postToSheet(payload);

  document.getElementById('c-success-box')?.remove();
  document.getElementById('c-fail-box')?.remove();

  if(result.ok){
    const activeContent = document.getElementById('ctab-'+type);
    if(activeContent) activeContent.style.display='none';
    document.querySelector('.cfield')?.style.setProperty('display','none');
    document.querySelector('.cdivider')?.style.setProperty('display','none');
    btn.style.display='none';
    const cnote = document.querySelector('.cnote');
    if(cnote) cnote.style.display='none';

    const successEl = document.createElement('div');
    successEl.id = 'c-success-box';
    successEl.innerHTML = `
      <div style="text-align:center;padding:32px 20px;">
        <div style="width:56px;height:56px;background:#EDE9FE;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:24px;color:#6D28D9;"><iconify-icon icon="solar:check-circle-bold"></iconify-icon></div>
        <h3 style="font-size:18px;font-weight:700;margin-bottom:10px;">상담 신청이 완료됐습니다!</h3>
        <p style="font-size:14px;color:#666;line-height:1.75;margin-bottom:20px;">입력하신 연락처로 1영업일 이내 회신드리겠습니다.<br>더 빠른 응대는 카카오톡으로 연락해 주세요.</p>
        <button onclick="resetConsult('${type}')" style="background:none;border:1.5px solid #e8e8e8;padding:10px 20px;border-radius:9px;font-size:13px;cursor:pointer;color:#666;">다른 상담 신청하기</button>
      </div>`;
    document.querySelector('.consult-body').appendChild(successEl);
    btn.textContent='상담 신청하기'; btn.disabled=false;
  } else {
    const box = renderFailBox('consult');
    document.querySelector('.consult-body').appendChild(box);
    document.getElementById('consult-retry-btn')?.addEventListener('click', submitConsult);
    btn.textContent='상담 신청하기'; btn.disabled=false;
  }
}

function resetConsult(type) {
  document.getElementById('c-success-box')?.remove();
  document.getElementById('c-fail-box')?.remove();
  document.querySelector('.cfield')?.style.removeProperty('display');
  document.querySelector('.cdivider')?.style.removeProperty('display');
  const activeContent = document.getElementById('ctab-'+type);
  if(activeContent) activeContent.style.display='block';
  document.querySelectorAll('#ctab-'+type+' input:not([type=radio])').forEach(el=>el.value='');
  document.querySelectorAll('#ctab-'+type+' textarea').forEach(el=>el.value='');
  document.querySelectorAll('#ctab-'+type+' select').forEach(el=>el.selectedIndex=0);
  document.querySelectorAll('#ctab-'+type+' input[type=radio]').forEach(el=>el.checked=false);
  document.querySelectorAll('input[name="c-method"]').forEach(el=>el.checked=false);
  const agreeReset2 = document.getElementById('c-agree');
  if(agreeReset2) agreeReset2.checked = false;
  const cc = document.getElementById('cc-'+type);
  if(cc) cc.textContent='0';
  const submitBtn = document.querySelector('.csubmit');
  if(submitBtn) submitBtn.style.display='';
  const cnote = document.querySelector('.cnote');
  if(cnote) cnote.style.display='';
}

function toggleGuide(el){el.classList.toggle('open');}
function blogFilter(cat,btn){
  document.querySelectorAll('.blog-ftab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.blog-outer').forEach(c=>{
    c.style.display=(cat==='all'||c.dataset.cat===cat)?'block':'none';
  });
}

/* ── 블로그: 네이버 블로그 RSS를 Netlify 함수(blog-feed)로 읽어와 카드 렌더링 ── */
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
async function loadBlogFeed(){
  const grid = document.getElementById('blog-cards');
  if(!grid) return;
  try{
    const res = await fetch('/.netlify/functions/blog-feed');
    if(!res.ok) throw new Error('blog-feed request failed');
    const data = await res.json();
    const posts = data.posts || [];
    if(!posts.length) throw new Error('no posts');
    grid.innerHTML = posts.map((p, i) => `
      <div class="blog-outer" data-cat="${p.category}" onclick="window.open('${p.link}','_blank')"><div class="blog-card">
        <div class="blog-thumb"><iconify-icon icon="${p.icon}"></iconify-icon></div>
        <div class="blog-body">
          <div class="blog-tags"><span class="blog-tag">${escapeHtml(p.categoryLabel)}</span>${i===0?'<span class="blog-tag new">NEW</span>':''}</div>
          <div class="blog-title">${escapeHtml(p.title)}</div>
          <div class="blog-desc">${escapeHtml(p.desc)}</div>
        </div>
        <div class="blog-footer"><span class="blog-date">${p.date}</span><span class="blog-link">읽어보기 →</span></div>
      </div></div>
    `).join('');
  }catch(err){
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px 20px;color:var(--text2);font-size:13px;">
      최신 글을 불러오지 못했습니다.<br>
      <button class="btn-outline-sm" style="margin-top:12px;" onclick="window.open('https://blog.naver.com/eroom-tax','_blank')">네이버 블로그에서 보기 →</button>
    </div>`;
  }
}
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxBeeIfIBc4Sxe2ylazTXkRo-RHRJ2Yd1qUEDYSgm5DIG8nrRM3wzEt2FJiKckQaCar8Q/exec';

function checkFade(){
  document.querySelectorAll('.fade-up').forEach(el=>{
    if(el.getBoundingClientRect().top<window.innerHeight-60)el.classList.add('visible');
  });
}
window.addEventListener('scroll',()=>{
  document.getElementById('main-nav')?.classList.toggle('scrolled',window.scrollY>20);
  checkFade();
});
/* 스크롤로 다시 들어올 때마다 재생: dataset.done 가드 없이 매 진입마다 재시작하되,
   빠르게 들락날락해도 이전 애니메이션 프레임이 새 애니메이션을 덮어쓰지 않도록 토큰으로 무효화 */
const co=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      const token=Symbol();
      e.target._countToken=token;
      const raw=e.target.dataset.count;
      const target=parseFloat(raw);
      const decimals=(raw.split('.')[1]||'').length;
      const suffix=e.target.dataset.suffix||'';
      const dur=1200;const start=performance.now();
      function up(now){
        if(e.target._countToken!==token)return;
        const p=Math.min((now-start)/dur,1);
        const ease=1-Math.pow(1-p,3);
        const val=ease*target;
        const text=decimals?val.toFixed(decimals):Math.round(val).toLocaleString();
        e.target.textContent=text+suffix;
        if(p<1)requestAnimationFrame(up);
      }
      requestAnimationFrame(up);
    }
  });
},{threshold:0.5});
document.querySelectorAll('[data-count]').forEach(el=>co.observe(el));

/* ── 서비스 절차(.process) 원문자 사이 화살표를 실측 중간지점에 배치 ──
   텍스트 길이에 따라 각 단계 높이가 달라 CSS만으로는 두 원 사이 정중앙을
   맞출 수 없어서, 실제 렌더링된 원문자 위치를 읽어 절대배치한다. */
function layoutProcessChevrons(){
  document.querySelectorAll('.process').forEach(proc => {
    proc.querySelectorAll('.ps-chevron').forEach(c => c.remove());
    const nums = proc.querySelectorAll('.ps-num');
    if(nums.length < 2) return;
    const procRect = proc.getBoundingClientRect();
    for(let i = 0; i < nums.length - 1; i++){
      const a = nums[i].getBoundingClientRect();
      const b = nums[i+1].getBoundingClientRect();
      const chev = document.createElement('div');
      chev.className = 'ps-chevron';
      chev.innerHTML = '&rsaquo;';
      chev.style.left = ((a.left + a.right) / 2 - procRect.left) + 'px';
      chev.style.top = ((a.bottom + b.top) / 2 - procRect.top) + 'px';
      proc.appendChild(chev);
    }
  });
}
window.addEventListener('load', layoutProcessChevrons);
window.addEventListener('resize', layoutProcessChevrons);

/* ── 세무서비스 하위 상세페이지 미니탭: 슬라이딩 밑줄 인디케이터 ──
   호버 시 그 탭 위치로 밑줄이 부드럽게 이동(미리보기), 클릭하면 밑줄이 먼저
   슬라이드된 뒤 페이지 이동 — 실제 라우팅은 정적 페이지 이동이라 전환 자체를
   애니메이션할 수는 없지만, 클릭 직후 밑줄이 목적지로 움직이는 걸 보여줘서
   자연스러운 전환처럼 느껴지게 한다. */
function initSvcTabs(){
  const bar = document.querySelector('.svc-tabbar');
  if(!bar) return;
  const underline = bar.querySelector('.svc-tab-underline');
  const items = [...bar.querySelectorAll('.svc-tabitem')];
  function moveTo(el, instant){
    if(!el) return;
    if(instant){
      underline.style.transition = 'none';
      underline.style.width = el.offsetWidth + 'px';
      underline.style.left = el.offsetLeft + 'px';
      underline.offsetHeight; // 강제 리플로우 후 transition 복구 (다음 이동부터는 애니메이션되도록)
      underline.style.transition = '';
    } else {
      underline.style.width = el.offsetWidth + 'px';
      underline.style.left = el.offsetLeft + 'px';
    }
  }
  const activeEl = bar.querySelector('.svc-tabitem.active') || items[0];
  // 밑줄은 기본값(left:0,width:0)에서 시작하므로, 처음 위치를 잡을 때 애니메이션 없이
  // 즉시 이동시켜야 "오른쪽 끝에서 슬라이드해오는" 것처럼 보이는 로드 시 오작동을 막는다.
  const syncActive = (instant)=>moveTo(bar.querySelector('.svc-tabitem.active')||activeEl, instant);
  requestAnimationFrame(()=>syncActive(true));
  // Pretendard 웹폰트가 늦게 로드되면 그 전 폴백 폰트 기준으로 잰 위치/너비가 틀어지므로,
  // 폰트 로드 완료 후(및 안전망으로 load 이벤트 후) 다시 계산한다(이때도 즉시 이동).
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(()=>syncActive(true));
  window.addEventListener('load', ()=>syncActive(true));
  // 페이지 이동(클릭) 직후에는 마우스 포인터가 화면상 같은 위치에 그대로 남아있는데,
  // 브라우저가 그 위치에 놓인 새 페이지의 탭 위로 "가짜" mouseenter를 즉시 발생시켜
  // 밑줄이 활성 탭→그 탭으로 튀었다가 되돌아오는 오작동을 만든다. 실제 마우스가 한 번
  // 움직인 뒤에만 호버 반응을 켜서 이 가짜 이벤트를 무시한다.
  let realMouseMoved = false;
  window.addEventListener('mousemove', ()=>{ realMouseMoved = true; }, {once:true});
  items.forEach(el=>{
    el.addEventListener('mouseenter', ()=>{ if(realMouseMoved) moveTo(el); });
  });
  bar.addEventListener('mouseleave', ()=>{ if(realMouseMoved) syncActive(false); });
  items.forEach(el=>{
    el.addEventListener('click', function(e){
      e.preventDefault();
      moveTo(el);
      const target = el.dataset.page;
      setTimeout(()=>goPage(target), 220);
    });
  });
  window.addEventListener('resize', ()=>syncActive(true));
}

/* ── 상단 메인 네비게이션: svc-tabbar와 동일한 슬라이딩 밑줄 인디케이터 ── */
function navClick(el, target){
  const bar = document.querySelector('.nav-links');
  const underline = bar && bar.querySelector('.nav-underline');
  if(!underline){ goPage(target); return; }
  underline.style.width = el.offsetWidth + 'px';
  underline.style.left = el.offsetLeft + 'px';
  setTimeout(()=>goPage(target), 220);
}
function initNavUnderline(){
  const bar = document.querySelector('.nav-links');
  if(!bar) return;
  const underline = bar.querySelector('.nav-underline');
  if(!underline) return;
  const items = [...bar.querySelectorAll('.nl')];
  function moveTo(el, instant){
    if(!el) return;
    if(instant){
      underline.style.transition = 'none';
      underline.style.width = el.offsetWidth + 'px';
      underline.style.left = el.offsetLeft + 'px';
      underline.offsetHeight;
      underline.style.transition = '';
    } else {
      underline.style.width = el.offsetWidth + 'px';
      underline.style.left = el.offsetLeft + 'px';
    }
  }
  const fallback = items[0];
  const syncActive = (instant)=>moveTo(bar.querySelector('.nl.active')||fallback, instant);
  requestAnimationFrame(()=>syncActive(true));
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(()=>syncActive(true));
  window.addEventListener('load', ()=>syncActive(true));
  let realMouseMoved = false;
  window.addEventListener('mousemove', ()=>{ realMouseMoved = true; }, {once:true});
  items.forEach(el=>{
    el.addEventListener('mouseenter', ()=>{ if(realMouseMoved) moveTo(el); });
  });
  bar.addEventListener('mouseleave', ()=>{ if(realMouseMoved) syncActive(false); });
  window.addEventListener('resize', ()=>syncActive(true));
}

/* ── 페이지 로드 시: 현재 페이지 네비 활성화 + 상담 탭 쿼리스트링 처리 ── */
document.addEventListener('DOMContentLoaded', function(){
  const page = document.body.dataset.page;
  document.querySelectorAll('.nl').forEach(a=>a.classList.remove('active'));
  if(page){
    const navId = page.startsWith('svc-') ? 'nav-services' : 'nav-'+page;
    document.getElementById(navId)?.classList.add('active');
  }
  document.querySelectorAll('.svc-tabitem[data-page]').forEach(el=>{
    el.classList.toggle('active', el.dataset.page === page);
  });
  initSvcTabs();
  initNavUnderline();
  if(page === 'contact'){
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if(tab) switchConsult(tab);
  }
  if(page === 'blog') loadBlogFeed();
  setTimeout(checkFade,300);
});
