// 네이버 블로그(blog.naver.com/eroom-tax) RSS를 서버사이드에서 읽어와 JSON으로 반환.
// 클라이언트에서 직접 fetch하면 CORS로 막히기 때문에 이 함수를 통해 우회한다.
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
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
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

exports.handler = async function () {
  try {
    const res = await fetch(RSS_URL);
    if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);
    const xml = await res.text();

    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => m[1]);
    const posts = items.map(block => {
      const title = decodeEntities(extractTag(block, 'title'));
      const link = extractTag(block, 'link').split('?')[0];
      const pubDateRaw = extractTag(block, 'pubDate');
      const rawCat = extractTag(block, 'category');
      const category = CATEGORY_MAP[rawCat] || 'story';
      const desc = stripHtml(extractTag(block, 'description')).slice(0, 90);
      return {
        title,
        link,
        date: formatDate(pubDateRaw),
        category,
        categoryLabel: LABEL_MAP[category] || rawCat,
        desc,
        icon: ICON_MAP[category] || 'solar:book-linear'
      };
    }).filter(p => p.title && p.link);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=1800'
      },
      body: JSON.stringify({ posts })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: String(err) })
    };
  }
};
