// 일회성 보충 함수: 네이버 RSS 창(최근 ~50개) 밖으로 이미 밀려난 과거 글들을
// 누적 저장소에 한 번 채워 넣기 위한 함수. ?key=<SEED_KEY> 로만 실행 가능하다.
// 실행 후에는 이 파일을 삭제해도 된다 (blog-sync가 앞으로의 동기화를 계속 담당).
const { getBlogStore } = require('./_shared/blob-store');

const SEED_KEY = 'eroom-seed-2026-09';

const OLD_POSTS = [
  {
    "title": "기준경비율 단순경비율 차이, 기장의무 기준",
    "link": "https://blog.naver.com/eroom-tax/224344954092",
    "date": "2026.07.13",
    "pubDateMs": 1783910811271,
    "category": "sole",
    "categoryLabel": "개인사업자",
    "desc": "안녕하세요. 이룸세무회계 김용태 세무사입니다. 종합소득세 신고 시즌이 되면 상담 중에 가장 많이 받는 ...",
    "icon": "solar:lightbulb-linear"
  },
  {
    "title": "창업중소기업세액감면 2026년 개정세법 핵심 정리",
    "link": "https://blog.naver.com/eroom-tax/224345050579",
    "date": "2026.07.14",
    "pubDateMs": 1783989000000,
    "category": "startup",
    "categoryLabel": "스타트업 청년창업",
    "desc": "안녕하세요. 이룸세무회계 김용태 세무사입니다 . 최근 예비 창업자분들과 상담하다 보면 빠지지 않고 나오...",
    "icon": "solar:rocket-linear"
  },
  {
    "title": "간이과세자 일반과세자 전환 기준과 시기",
    "link": "https://blog.naver.com/eroom-tax/224346166423",
    "date": "2026.07.14",
    "pubDateMs": 1784001030938,
    "category": "vat",
    "categoryLabel": "부가가치세",
    "desc": "안녕하세요. 이룸세무회계 김용태 세무사입니다. 매년 6월이 되면 \"저 이번에 간이과세자에서 일반과...",
    "icon": "solar:chart-2-linear"
  },
  {
    "title": "부가가치세 확정신고 기한과 가산세, 2026년 총정리",
    "link": "https://blog.naver.com/eroom-tax/224347166669",
    "date": "2026.07.15",
    "pubDateMs": 1784079754015,
    "category": "vat",
    "categoryLabel": "부가가치세",
    "desc": "안녕하세요. 이룸세무회계 김용태 세무사입니다. 이맘때가 되면 \"부가가치세 확정신고, 이번엔 언제까...",
    "icon": "solar:chart-2-linear"
  },
  {
    "title": "개인사업자 폐업 시 세무 정리, 신고 기한부터 챙기세요",
    "link": "https://blog.naver.com/eroom-tax/224349269538",
    "date": "2026.07.17",
    "pubDateMs": 1784252804620,
    "category": "sole",
    "categoryLabel": "개인사업자",
    "desc": "안녕하세요. 이룸세무회계 김용태 세무사입니다. 이 글은 개인사업자 폐업을 앞두고 있거나, 이미 폐업했지...",
    "icon": "solar:lightbulb-linear"
  },
  {
    "title": "7월 재산세 고지서 왜 올랐나 — 확인 방법과 이의신청",
    "link": "https://blog.naver.com/eroom-tax/224349277737",
    "date": "2026.07.17",
    "pubDateMs": 1784268000000,
    "category": "story",
    "categoryLabel": "세금이야기",
    "desc": "안녕하세요. 이룸세무회계 김용태 세무사입니다. 오늘은 2026년 7월분 재산세가 오른 이유와, 고지서를 직...",
    "icon": "solar:book-linear"
  },
  {
    "title": "1세대 1주택 비과세 요건, 2026년 기준 총정리",
    "link": "https://blog.naver.com/eroom-tax/224345140728",
    "date": "2026.07.20",
    "pubDateMs": 1784507400000,
    "category": "transfer",
    "categoryLabel": "양도소득세",
    "desc": "안녕하세요. 이룸세무회계 김용태 세무사입니다. 상담을 하다 보면 \"집 한 채인데 왜 세금이 나오나요...",
    "icon": "solar:home-2-linear"
  },
  {
    "title": "고배당 주식 배당소득 과세특례 제도",
    "link": "https://blog.naver.com/eroom-tax/224349431942",
    "date": "2026.07.20",
    "pubDateMs": 1784509200000,
    "category": "story",
    "categoryLabel": "세금이야기",
    "desc": "안녕하세요. 이룸세무회계 김용태 세무사입니다. 2026년 1월 1일부터 배당소득 과세 체계에 새로운 특례 하...",
    "icon": "solar:book-linear"
  },
  {
    "title": "업무용승용차 경비처리 한도, 2026년 기준 정리",
    "link": "https://blog.naver.com/eroom-tax/224350164757",
    "date": "2026.07.21",
    "pubDateMs": 1784597400000,
    "category": "sole",
    "categoryLabel": "개인사업자",
    "desc": "안녕하세요. 이룸세무회계 김용태 세무사입니다. 많은 분들이 '업무용으로 타는 차인데 왜 기름값도, ...",
    "icon": "solar:lightbulb-linear"
  },
  {
    "title": "납부지연가산세 개편 2026.7.1 시행, 달라지는 부분 정리",
    "link": "https://blog.naver.com/eroom-tax/224351783668",
    "date": "2026.07.22",
    "pubDateMs": 1784683200000,
    "category": "story",
    "categoryLabel": "세금이야기",
    "desc": "안녕하세요. 이룸세무회계 김용태 세무사입니다. 최근 납부지연가산세가 개편됐다는 소식에, 계산 방식 전...",
    "icon": "solar:book-linear"
  },
  {
    "title": "2026 연말정산 환급 많이 받는 법｜놓치기 쉬운 공제 총정리",
    "link": "https://blog.naver.com/eroom-tax/224354041558",
    "date": "2026.07.24",
    "pubDateMs": 1784853000000,
    "category": "story",
    "categoryLabel": "세금이야기",
    "desc": "안녕하세요. 이룸세무회계 김용태 세무사입니다. 오늘은 연말정산 환급을 많이 받는 방법을 정리해보려고 ...",
    "icon": "solar:book-linear"
  },
  {
    "title": "복식부기의무자 추계신고 불이익, 경정청구도 안 될까?",
    "link": "https://blog.naver.com/eroom-tax/224355977324",
    "date": "2026.07.25",
    "pubDateMs": 1784937600000,
    "category": "sole",
    "categoryLabel": "개인사업자",
    "desc": "안녕하세요. 이룸세무회계 김용태 세무사입니다. 많은 분들이 \"일단 신고부터 해두고, 나중에 장부를 ...",
    "icon": "solar:lightbulb-linear"
  },
  {
    "title": "2026 법인세 중간예납 신고기한, 계산방법, 가결산 총정리",
    "link": "https://blog.naver.com/eroom-tax/224356397034",
    "date": "2026.07.27",
    "pubDateMs": 1785108600000,
    "category": "corp",
    "categoryLabel": "법인 사업자",
    "desc": "안녕하세요. 이룸세무회계 김용태 세무사입니다. 8월은 법인세 중간예납 신고의 달입니다. 많은 법인들이 함께 준비해야 할 내용을 정리했습니다.",
    "icon": "solar:clipboard-list-linear"
  },
  {
    "title": "2027년 최저임금 10,700원 확정, 사업장 대응방안",
    "link": "https://blog.naver.com/eroom-tax/224350521543",
    "date": "2026.07.23",
    "pubDateMs": 1784766600000,
    "category": "hr",
    "categoryLabel": "인사·노무",
    "desc": "안녕하세요. 이룸세무회계 김용태 세무사입니다. 최근 최저임금위원회가 2027년 적용 최저임금을 새로 의결...",
    "icon": "solar:users-group-rounded-linear"
  }
];

exports.handler = async function (event) {
  const key = event.queryStringParameters && event.queryStringParameters.key;
  if (key !== SEED_KEY) {
    return { statusCode: 403, body: 'forbidden' };
  }

  try {
    const store = getBlogStore();
    const existing = (await store.get('all-posts', { type: 'json' })) || [];

    const byLink = new Map(existing.map(p => [p.link, p]));
    OLD_POSTS.forEach(p => byLink.set(p.link, p));

    const merged = [...byLink.values()].sort((a, b) => (b.pubDateMs || 0) - (a.pubDateMs || 0));
    await store.setJSON('all-posts', merged);

    return {
      statusCode: 200,
      body: JSON.stringify({ total: merged.length, added: OLD_POSTS.length })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};
