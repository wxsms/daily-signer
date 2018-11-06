import * as crypto from 'crypto'

export default function (str) {
  return crypto.createHash('md5').update(str).digest('hex')
}
