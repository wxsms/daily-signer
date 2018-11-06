import Job from '../../../interfaces/Job'
import Auth from '../auth/MobileAuth'

export default abstract class MobileJob extends Job {
  protected constructor (user) {
    super(user)
    this.auth = new Auth(user)
  }

  protected auth: Auth

  protected getCookies () {
    return this.auth.getSavedCookies()
  }
}
