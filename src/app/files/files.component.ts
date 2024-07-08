import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, ElementRef, TemplateRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CONSTANTS } from '../constants/constants';

@Component({
  selector: 'app-files',
  standalone: true,
  imports: [HttpClientModule],
  templateUrl: './files.component.html',
  styleUrl: './files.component.css',
})
export class FilesComponent {

  constructor(private http: HttpClient, private elementRef: ElementRef) { }


  ngOnInit() {

    let deletionIndexes = [];

    const template = document.getElementById('itemTemplate') as HTMLTemplateElement;
    const container = document.getElementById('main');
    if (template && container) {
      const meta = localStorage.getItem("filesMetadata")
      let arr = JSON.parse(meta ?? '[]');
      for (let i = arr.length - 1; i >= 0; i--) {
        const item = document.importNode(template.content, true);
        let fileName = item.getElementById("fileName")
        let fileSize = item.getElementById("fileSize")
        let fileCreation = item.getElementById("fileCreation")
        let fileExpiration = item.getElementById("fileExpiration")

        if (fileName && fileSize && fileCreation && fileExpiration) {

          const creationDate = new Date(arr[i]["Date"]);
          const expirationDate = new Date();
          expirationDate.setDate(creationDate.getDate() + arr[i]["Expiration"]);

          fileName.innerHTML += arr[i]["FileName"]
          fileSize.innerHTML += this.calculateSize(arr[i]["KiloBytes"])
          fileCreation.innerHTML += creationDate.toLocaleDateString()
          fileExpiration.innerHTML += expirationDate.toLocaleDateString();

          if (Date.now() > expirationDate.getTime()) {
            deletionIndexes.push(i);
            continue;
          }
        }

        const downloadBtn = item.getElementById("downloadBtn")
        const deleteBtn = item.getElementById("deleteBtn")
        const tag = document.createElement('span');
        if (tag && downloadBtn && deleteBtn) {
          tag.textContent = JSON.stringify(arr[i])
          tag.style.display = "None"
          downloadBtn.addEventListener('click', (e) => { this.downloadClick(e) });
          deleteBtn.addEventListener('click', (e) => { this.deleteClick(e) });
          downloadBtn.appendChild(tag.cloneNode(true))
          deleteBtn.appendChild(tag.cloneNode(true))
        }
        container.appendChild(item);
      }
      if (deletionIndexes.length > 0) {
        for (var i = 0; i < deletionIndexes.length; i++) {
          arr.splice(i, 1);
        }
        localStorage.setItem("filesMetadata", JSON.stringify(arr))
      }
    }
  }

  downloadClick(e: MouseEvent) {
    const button = e.target as HTMLButtonElement;
    const span = button.lastElementChild as HTMLSpanElement;
    const json = JSON.parse(span.innerText);
    window.open(window.location.origin + "/d/" + json["ID"] + "?password=" + json["Password"]);

  }

  async deleteClick(e: MouseEvent) {
    const button = e.target as HTMLButtonElement;
    const span = button.lastElementChild as HTMLSpanElement;
    const json = JSON.parse(span.innerText);
    this.http.delete(CONSTANTS.API_URL + "Delete?guid=" + json["ID"] + "&secretKey=" + json["SecretKey"] + "&password=" + json["Password"])
      .subscribe(
        response => {
          if (!response) {
            alert("File could not be deleted.")
            return;
          }
          const meta = localStorage.getItem("filesMetadata")
          let arr = JSON.parse(meta ?? '[]');
          arr = arr.filter((item: { ID: any; }) => item.ID != json["ID"]);
          localStorage.setItem("filesMetadata", JSON.stringify(arr))

          const container = document.getElementById('main');
          if (container) {
            for (var i = 0; i < container.childElementCount; i++) {
              const button = container.children[i].querySelector("button")?.lastElementChild as HTMLSpanElement;
              const span = JSON.parse(button.innerHTML);
              if (span["ID"] == json["ID"]) {
                container.children[i].remove();
                break;
              }
            }
          }
        })
  }

  calculateSize(size: string) {

    let num = parseFloat(size);
    const table = ["KB", "MB", "GB", "TB"]
    if (num == 0) {
      return "1 KB";
    }
    let i = 0;
    while (num >= 1000) {
      num /= 1000;
      i++;
    }
    return (num.toFixed(2) + " " + table[i]).replace(".00", "");
  }
}
