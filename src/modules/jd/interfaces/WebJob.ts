import Job from '../../../interfaces/Job'
import * as auth from '../auth/web'

export default abstract class WebJob extends Job {
  protected getCookies = auth.getSavedCookies
}
