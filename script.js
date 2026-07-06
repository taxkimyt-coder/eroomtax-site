/* ============================================================
   이룸세무회계 공용 스크립트
   - goPage(): SPA 방식 대신 실제 페이지(URL) 이동으로 변경 (SEO 대응)
   - postToSheet(): 상담폼 전송 실패를 감지하고 대체 안내를 보여주는 안전장치
   ============================================================ */

// 페이지 id → 실제 파일명 매핑
const PAGE_MAP = {
  home:'index.html', services:'services.html', about:'about.html',
  blog:'blog.html', contact:'contact.html', pricing:'pricing.html',
  'svc-jang':'svc-jang.html', 'svc-tax':'svc-tax.html', 'svc-con':'svc-con.html'
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
        if(type === 'gold') {
          el.style.borderColor = '#F5C200';
          el.style.boxShadow = '0 4px 20px rgba(245,194,0,.2)';
        } else if(type === 'purple') {
          el.style.borderColor = 'var(--purple)';
          el.style.boxShadow = '0 4px 20px rgba(139,107,177,.2)';
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

function toggleMobileSvc(){
  const sub = document.getElementById('mobile-svc-sub');
  const arrow = document.getElementById('mobile-svc-arrow');
  if(!sub) return;
  const isOpen = sub.style.display === 'block';
  sub.style.display = isOpen ? 'none' : 'block';
  if(arrow) arrow.style.transform = isOpen ? '' : 'rotate(180deg)';
}
function openRtab(name, btn){
  document.querySelectorAll('.rtab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.report-slide').forEach(s=>s.classList.remove('active'));
  btn.classList.add('active');
  const slide = document.getElementById('rslide-'+name);
  if(slide) slide.classList.add('active');
}

function toggleDropdown(e){
  e.stopPropagation();
  const dd = document.getElementById('nav-services');
  dd.classList.toggle('open');
}
document.addEventListener('click', function(e){
  const dd = document.getElementById('nav-services');
  if(dd && !dd.contains(e.target)){
    dd.classList.remove('open');
  }
});
function goSvc(id){
  document.getElementById('nav-services').classList.remove('open');
  goPage(id);
}
function openStab(name){
  ['양도','상속','증여'].forEach(t=>{
    const btn=document.getElementById('stab-'+t);
    const con=document.getElementById('sc-'+t);
    const active=t===name;
    if(btn){btn.style.borderColor=active?'#F5C200':'var(--border)';btn.style.background=active?'#FFF8E0':'#fff';btn.style.color=active?'#B8900A':'var(--text2)';}
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
    <div style="margin-top:16px;text-align:center;padding:20px;background:#FFF0F0;border-radius:12px;border:1px solid #f5c6c6;">
      <div style="font-size:14px;font-weight:700;color:#c41a1a;margin-bottom:6px;">전송이 확인되지 않았습니다</div>
      <p style="font-size:13px;color:#666;line-height:1.7;margin-bottom:14px;">인터넷 연결이 불안정하거나 서버 응답이 없었어요.<br>아래 버튼으로 다시 시도하시거나, 카카오톡으로 바로 문의해 주세요.</p>
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
        <button onclick="window.open('http://pf.kakao.com/_GsQcj/chat','_blank')" style="background:#F5C200;color:#1a1a2e;border:none;padding:10px 18px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;">💬 카카오톡으로 문의</button>
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
        <div style="width:56px;height:56px;background:#E0F7F4;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:24px;color:#0D8A76;">✓</div>
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
  document.querySelectorAll('.blog-card').forEach(c=>{
    c.style.display=(cat==='all'||c.dataset.cat===cat)?'flex':'none';
  });
}
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxBeeIfIBc4Sxe2ylazTXkRo-RHRJ2Yd1qUEDYSgm5DIG8nrRM3wzEt2FJiKckQaCar8Q/exec';

async function submitForm(){
  const n  = document.getElementById('f-name').value.trim();
  const t  = document.getElementById('f-tel').value.trim();
  const tp = document.getElementById('f-type').value;
  const em = document.getElementById('f-email').value.trim();
  const rv = document.querySelector('#page-contact select:nth-of-type(2)')?.value || '';
  const ct = document.getElementById('f-content').value.trim();

  if(!n||!t||!tp){alert('성함, 연락처, 사업 유형은 필수입니다.');return;}

  const btn = document.querySelector('.submit-btn');
  btn.textContent = '전송 중...';
  btn.disabled = true;

  const result = await postToSheet({ name: n, tel: t, email: em, bizType: tp, revenue: rv, content: ct });

  document.getElementById('f-fail-box')?.remove();

  if(result.ok){
    document.getElementById('form-wrap').style.display='none';
    document.getElementById('success-msg').style.display='block';
  } else {
    const box = renderFailBox('f');
    document.getElementById('form-wrap').appendChild(box);
    document.getElementById('f-retry-btn')?.addEventListener('click', submitForm);
    btn.textContent = '상담 신청하기';
    btn.disabled = false;
  }
}

function checkFade(){
  document.querySelectorAll('.fade-up').forEach(el=>{
    if(el.getBoundingClientRect().top<window.innerHeight-60)el.classList.add('visible');
  });
}
window.addEventListener('scroll',()=>{
  document.getElementById('main-nav')?.classList.toggle('scrolled',window.scrollY>20);
  checkFade();
});
const co=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting&&!e.target.dataset.done){
      e.target.dataset.done='1';
      const target=parseInt(e.target.dataset.count);
      const suffix=e.target.dataset.suffix||'';
      const dur=1200;const start=performance.now();
      function up(now){
        const p=Math.min((now-start)/dur,1);
        const ease=1-Math.pow(1-p,3);
        e.target.textContent=Math.round(ease*target)+suffix;
        if(p<1)requestAnimationFrame(up);
      }
      requestAnimationFrame(up);
    }
  });
},{threshold:0.5});
document.querySelectorAll('[data-count]').forEach(el=>co.observe(el));

/* ── 페이지 로드 시: 현재 페이지 네비 활성화 + 상담 탭 쿼리스트링 처리 ── */
document.addEventListener('DOMContentLoaded', function(){
  const page = document.body.dataset.page;
  document.querySelectorAll('.nl').forEach(a=>a.classList.remove('active'));
  if(page){
    const navId = page.startsWith('svc-') ? 'nav-services' : 'nav-'+page;
    document.getElementById(navId)?.classList.add('active');
  }
  if(page === 'contact'){
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if(tab) switchConsult(tab);
  }
  setTimeout(checkFade,300);
});
