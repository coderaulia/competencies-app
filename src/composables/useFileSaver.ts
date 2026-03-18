export default function useFileSaver(blobFile: Blob, filename: string) {
  if ((window.navigator as any).msSaveOrOpenBlob) {
    (window.navigator as any).msSaveOrOpenBlob(blobFile, filename);
  } else {
    console.log(blobFile);
    const url = URL.createObjectURL(
      new Blob([blobFile as Blob], {
        type: "application/vnd.ms-excel",
      })
    );
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
  }
}
