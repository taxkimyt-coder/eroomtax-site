// 네이버 블로그(blog.naver.com/eroom-tax) RSS를 읽어와 파싱하는 공용 로직.
// blog-feed.js(읽기)와 blog-sync.js(누적 저장) 양쪽에서 같이 쓴다.
const RSS_URL = 'https://rss.blog.naver.com/eroom-tax.xml';

// blog.html의 필터 탭(blogFilter 호출값)과 1:1로 맞춘 카테고리 슬러그.
const CATEGORY_MAP = {
  '개인사업자': 'sole',
  '법인 사업자': 'corp',
  '병의원 세금': 'clinic',
  '부가가치세': 'vat',
  '상속 증여세': 'inherit',
  '상속·증여세금': 'inherit',
  '양도소득세': 'transfer',
  '세금이야기': 'story',
  '세무회계': 'story',
  '스타트업 청년창업': 'startup',
  '인사·노무': 'hr',
  '인사 노무이야기': 'hr',
  '정책자금 등': 'policy'
};

const LABEL_MAP = {
  sole: '개인사업자',
  corp: '법인 사업자',
  clinic: '병의원 세금',
  vat: '부가가치세',
  inherit: '상속·증여세금',
  transfer: '양도소득세',
  story: '세금이야기',
  startup: '스타트업 청년창업',
  hr: '인사·노무',
  policy: '정책자금 등'
};

const ICON_MAP = {
  sole: 'solar:lightbulb-linear',
  corp: 'solar:clipboard-list-linear',
  clinic: 'solar:health-linear',
  vat: 'solar:chart-2-linear',
  inherit: 'solar:scale-linear',
  transfer: 'solar:home-2-linear',
  story: 'solar:book-linear',
  startup: 'solar:rocket-linear',
  hr: 'solar:users-group-rounded-linear',
  policy: 'solar:wallet-money-linear'
};

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&nbsp;/g, ' ');
}

function stripHtml(html) {
  return decodeEntities(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function extractTag(block, tag) {
  const m = block.match(new RegExp(`<${tag}>\\s*(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([\\s\\S]*?))\\s*</${tag}>`));
  if (!m) return '';
  return (m[1] !== undefined ? m[1] : m[2] || '').trim();
}

function formatDate(pubDateRaw) {
  const d = new Date(pubDateRaw);
  if (isNaN(d)) return '';
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}.${mm}.${dd}`;
}

// RSS를 fetch해서 파싱된 글 배열을 반환. 각 글은 정렬용 원본 날짜(pubDateMs)를 포함한다.
async function fetchAndParsePosts() {
  const res = await fetch(RSS_URL);
  if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);
  const xml = await res.text();

  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => m[1]);
  return items.map(block => {
    const title = decodeEntities(extractTag(block, 'title'));
    const link = extractTag(block, 'link').split('?')[0];
    const pubDateRaw = extractTag(block, 'pubDate');
    const pubDateMs = new Date(pubDateRaw).getTime() || 0;
    const rawCat = extractTag(block, 'category');
    const category = CATEGORY_MAP[rawCat] || 'story';
    const desc = stripHtml(extractTag(block, 'description')).slice(0, 90);
    return {
      title,
      link,
      date: formatDate(pubDateRaw),
      pubDateMs,
      category,
      categoryLabel: LABEL_MAP[category] || rawCat,
      desc,
      icon: ICON_MAP[category] || 'solar:book-linear'
    };
  }).filter(p => p.title && p.link);
}

module.exports = { fetchAndParsePosts, RSS_URL };
