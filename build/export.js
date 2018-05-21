const fs = require('fs')

const radix = 36
const minute = 60 * 1000

const systems = [
  null,
  'payeer',
  'advcash',
  'perfect',
  'advcash'
]

const user_ids = {}
const wallets = {}
const payments = {}
const withdrawals = {}
const transfers = []
const user_wallets = {}

function read(type) {
  const records = fs.readFileSync(__dirname + `/../data/${type}.txt`, {encoding: 'utf8'})
    .split(/\s*\n\s*/)
  // .sort()
  for (const record of records) {
    const a = record.split('~')
    let user_id = +a[5]
    const nick = a[2]
    if (user_id > 0) {
      user_ids[nick] = user_id
    }
    else {
      user_id = user_ids[nick]
    }
    const time = parseInt(a[0], radix) * minute || Date.now()
    const t = {
      id: parseInt(a[4], radix),
      created: new Date(time).toISOString()
        .replace(/([\d\-])T([\d:]+).000Z/, '$1 $2'),
      amount: a[1] * 100,
      system: systems[a[3]] || null,
      wallet: a[6] ? a[6].trim().replace(/\s+/g, '') : null,
      currency: 'USD',
      status: 'success'
    }
    t.type = t.wallet ? 'withdraw' : 'payment'
    if (t.wallet) {
      t.from = user_id
      t.vars = {from_nick: nick}
      wallets[t.wallet] = wallets[t.wallet] ? wallets[t.wallet] + t.amount / 100 : t.amount / 100
      withdrawals[nick] = withdrawals[nick] ? withdrawals[nick] + t.amount / 100 : t.amount / 100
      const w = user_wallets[nick]
      if (w) {
        w.push(t.wallet)
      }
      else {
        user_wallets[nick] = [t.wallet]
      }
    }
    else {
      t.to = user_id
      t.vars = {to_nick: nick}
      payments[nick] = payments[nick] ? payments[nick] + t.amount / 100 : t.amount / 100
    }
    transfers.push(t)
  }
}

function sort(o) {
  const a = []
  for (const key in o) {
    a.push([key, o[key]])
  }
  return a.sort((a, b) => b[1] - a[1])
}

function write(name, o) {
  fs.writeFileSync(`./${name}.json`, JSON.stringify(o))
}

read('refill')
read('withdraw')

const valuable = sort(payments)

write('transfer', transfers.sort((a, b) => b.id - a.id))
write('wallets', sort(wallets))
write('payments', valuable)
write('withdrawals', sort(withdrawals))

const users = []
for (const nick in user_ids) {
  users.push({
    id: user_ids[nick],
    nick,
    email: nick + '@yopmail.com',
    secret: '$2a$10$Qxw7atHRbskYVrVtdtAvMeGd1cbx9Imapmw7Z.1yLr2EvamUdSDXi'
  })
}

write('user', users)

const records = []
for (const [nick, amount] of valuable) {
  let wallets = user_wallets[nick] || []
  wallets = wallets.filter((w, i) => wallets.indexOf(w) === i).sort()
  records.push([Math.floor(amount), nick, wallets.join(' ')].join('\t'))
}
fs.writeFileSync('./user.txt', records.join('\n'))
