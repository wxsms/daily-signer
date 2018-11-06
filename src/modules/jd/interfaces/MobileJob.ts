import Job from '../../../interfaces/Job'
import * as auth from '../auth/mobile'

export default abstract class MobileJob extends Job {
  protected getCookies = auth.getSavedCookies
}
