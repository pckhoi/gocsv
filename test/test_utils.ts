export const bytes = (str: string) => {
  const b = new Uint8Array(str.length)
  for (let i = 0; i < str.length; i++) {
    b[i] = str.charCodeAt(i)
  }
  return b
}
