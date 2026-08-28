let selectedFile = null

export function setSelectedLocalFile(file) {
  selectedFile = file
}

export function takeSelectedLocalFile() {
  const result = selectedFile
  selectedFile = null
  return result
}
