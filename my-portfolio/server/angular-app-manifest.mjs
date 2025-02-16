
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/"
  },
  {
    "renderMode": 2,
    "redirectTo": "/",
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 46732, hash: '147d9526d9b988b498dc407232c30717de6b1166d48058efb273ec3373894d64', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1388, hash: '9c6fc9be4e95b8f5aa9dfcd52adda739f2be20a657435afe8213749beb19f7a0', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 147794, hash: '82ea54e462356d5b62f7d99f75d2b065fe596ee0d345e1c56b4ed2f7ca458b2a', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-NFTADO7E.css': {size: 1266977, hash: 'sglRCavMpR8', text: () => import('./assets-chunks/styles-NFTADO7E_css.mjs').then(m => m.default)}
  },
};
