function encode (str) {
  return Buffer.from(str).toString('base64')
}

function decode (str) {
  return Buffer.from(str, 'base64').toString('utf8')
}

module.exports = {encode, decode}
