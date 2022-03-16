export const blobToFile = (blob: Blob, fileName: string): File => {
  var file: any = blob
  file.lastModifiedDate = new Date()
  file.name = fileName

  return <File>file
}
