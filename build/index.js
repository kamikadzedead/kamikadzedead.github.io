const generate = require('./generate')
const fs = require('fs')
const site = require('./site.json')

for (const type of ['refill', 'withdraw']) {
  for (const path of generate(type)) {
    site[path] = 0.5
  }
}

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
]
for (const path in site) {
  const priority = site[path]
  sitemap.push(`<url><loc>https://kamikadzedead.github.io${path}</loc><lastmod>2018-05-15</lastmod>`
    + `<changefreq>weekly</changefreq><priority>${priority}</priority></url>`)
}
sitemap.push('</urlset>')
fs.writeFileSync(__dirname + '/../sitemap.xml', sitemap.join('\n'))
