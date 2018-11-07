export default interface User {
  username: string,
  password?: string,
  skipLogin?: boolean,
  skip?: boolean,
  skipJobs?: string[]
}
