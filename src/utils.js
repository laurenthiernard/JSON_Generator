export function getUniqID(pLength) {
  let random = () => window.btoa(Math.random()*(new Date().getTime())*1).substring(4, 9)
  return `${random()}-${random()}`.substring(0, pLength).toLocaleLowerCase()
}