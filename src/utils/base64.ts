export function encode (str: string): string {
  return Buffer.from(str).toString('base64')
}

export function decode (str: string): string {
  return Buffer.from(str, 'base64').toString('utf8')
}
