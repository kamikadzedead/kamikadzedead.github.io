const fs = require('fs')

const radix = 36
const minute = 60 * 1000

function read(filename) {
  return fs.readFileSync(__dirname + '/..' + filename, { encoding: 'utf8' })
}

module.exports = function generate(type) {
  if (['refill', 'withdraw'].indexOf(type) < 0) {
    throw new Error('Invalid type ' + type)
  }
  const target = __dirname + '/../' + type
  try {
    fs.mkdirSync(target)
  }
  catch (ex) {

  }
  const title = 'refill' === type ? 'Пополнения' : 'Выплаты'
  const data = read(`/data/${type}.txt`)
.split(/\s*\n\s*/)
  const template = read('/build/template.html')
    .replace('{title}', title)
    .replace('{title}', title)
  const systems = [
    '',
    'Payeer',
    'AdvCash',
    'Яндекс.Деньги'
  ]

  const size = 500
  let emptyPage = 0

  function pageNumber(i) {
    return (Math.floor(i / size) + 1) - emptyPage
  }

  function getPages() {
    return pageNumber(data.length - 1);
  }

  function pageFileName(n) {
    const string = 1 === n ? 'index' : ('0000' + n).slice(-5)
    return `${string}.html`
  }

  function pageAnchor(n, condition = true) {
    if (condition && n >= 1 && n <= getPages()) {
      const filename = pageFileName(n)
      return `<a href="${filename}">${n}</a>`
    }
    return ''
  }

  const files = []
  const records = data
    .sort()
  let rows = []
  const last = records.length - 1
  for (let i = 0; i <= last; i++) {
    const record = records[i].replace(/\s+/g, '')
    if (record.length <= 0) {
      continue
    }
    if ((0 === (i + 1) % size) || last === i) {
      // if (rows.length === 0) {
      //   emptyPage++
      //   continue
      // }
      const n = pageNumber(i)
      const left = n - 1
      const right = n + 1
      const firstAnchor = pageAnchor(1, left > 1)
      const lastAnchor = pageAnchor(getPages(), right < getPages())
      const body = rows.join('\n')
      const filename = pageFileName(n)
      fs.writeFileSync(target + '/' + filename,
        template
          .replace('{first}', firstAnchor ? firstAnchor + ' ... ' : '')
          .replace('{left}', pageAnchor(left))
          .replace('{page}', n)
          .replace('{page}', n)
          .replace('{right}', pageAnchor(right))
          .replace('{last}', lastAnchor ? ' ... ' + lastAnchor : '')
          .replace('{body}', `\n${body}\n`))
      rows = []
      files.push(`/${type}/${filename}`)
    }
    else {
      const a = record.split('~')
      // if (undefined === a[4]) {
      //   continue
      // }
      const time = new Date(parseInt(a[0], radix) * minute)
      const timestamp = isFinite(time.getTime()) ? time.toISOString() : 'Неизвестно'
      const o = {
        identifier: parseInt(a[4], radix),
        customer: a[2] || '',
        scheduledPaymentDate: timestamp
          .replace(/20(\d+)-(\d+)-(\d+)T(\d+):(\d+):(\d+).000Z/, '$1.$2.$3 $4:$5'),
        paymentMethod: systems[a[3]] || '',
        totalPaymentDue: (+a[1]).toFixed(2),
        paymentMethodId: a[6] || ''
      }
      const row = []
      for (const key in o) {
        row.push(`<td itemprop="${key}">${o[key]}</td>`)
      }
      const string = row.join('')
      rows.push(`<tr itemscope itemtype="https://schema.org/Invoice">${string}</tr>`)
    }
  }
  return files
}
