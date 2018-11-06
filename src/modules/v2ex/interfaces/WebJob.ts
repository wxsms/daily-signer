import Job from '../../../interfaces/Job'
import Auth from '../auth/WebAuth'

export default abstract class WebJob extends Job {
  protected constructor (user) {
    super(user)
    this.auth = new Auth(user)
  }

  protected auth: Auth

  protected getCookies () {
    return this.auth.getSavedCookies()
  }
}
