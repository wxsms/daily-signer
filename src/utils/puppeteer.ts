export async function abortUselessRequests (page) {
  await page.setRequestInterception(true)
  page.on('request', request => {
    const type = request.resourceType()
    const useless = type === 'media' || type === 'image' || type === 'font' || type === 'stylesheet'
    useless ? request.abort() : request.continue()
  })
}
