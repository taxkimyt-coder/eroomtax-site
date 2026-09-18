// Netlify Blobs 자동 인증(사이트 컨텍스트)이 이 환경에서 안 잡혀서,
// 대시보드에 등록해둔 BLOBS_SITE_ID / BLOBS_TOKEN으로 명시적으로 인증한다.
const { getStore } = require('@netlify/blobs');

function getBlogStore() {
  return getStore({
    name: 'blog-posts',
    siteID: process.env.BLOBS_SITE_ID,
    token: process.env.BLOBS_TOKEN
  });
}

module.exports = { getBlogStore };
