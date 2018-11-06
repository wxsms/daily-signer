export function encode (str) {
  return Buffer.from(str).toString('base64')
}

export function decode (str) {
  return Buffer.from(str, 'base64').toString('utf8')
}
