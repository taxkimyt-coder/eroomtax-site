// blog.html이 호출하는 읽기 전용 엔드포인트.
// 누적 저장소(Netlify Blobs)에 쌓인 전체 글 목록을 반환한다.
// 아직 blog-sync가 한 번도 안 돈 상태(저장소가 비어있음)라면, 그때만 RSS를 직접 읽어 즉시 응답한다.
const { getStore } = require('@netlify/blobs');
const { fetchAndParsePosts } = require('./_shared/parse-rss');

exports.handler = async function () {
  try {
    let posts = null;
    try {
      const store = getStore('blog-posts');
      posts = await store.get('all-posts', { type: 'json' });
    } catch (storeErr) {
      posts = null; // Blobs가 아직 준비 안 됐거나 문제가 있으면 아래에서 실시간 RSS로 대체
    }

    if (!posts || !posts.length) {
      posts = await fetchAndParsePosts();
    }

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
