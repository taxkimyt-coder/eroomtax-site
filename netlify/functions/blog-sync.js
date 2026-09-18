// 매일 자동 실행되는 스케줄 함수(netlify.toml에서 스케줄 지정).
// RSS를 읽어 이미 저장된 전체 글 목록과 링크 기준으로 합치고(중복 제거), 다시 저장한다.
// 네이버 RSS는 최근 글만 보여주므로, 이렇게 매일 스냅샷을 누적해야 오래된 글이 사라지지 않는다.
const { getBlogStore } = require('./_shared/blob-store');
const { fetchAndParsePosts } = require('./_shared/parse-rss');

exports.handler = async function () {
  try {
    const freshPosts = await fetchAndParsePosts();
    const store = getBlogStore();
    const existing = (await store.get('all-posts', { type: 'json' })) || [];

    const byLink = new Map(existing.map(p => [p.link, p]));
    freshPosts.forEach(p => byLink.set(p.link, p));

    const merged = [...byLink.values()].sort((a, b) => (b.pubDateMs || 0) - (a.pubDateMs || 0));
    await store.setJSON('all-posts', merged);

    return {
      statusCode: 200,
      body: JSON.stringify({ total: merged.length, seenThisRun: freshPosts.length })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};
