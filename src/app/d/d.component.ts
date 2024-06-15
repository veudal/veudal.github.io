import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-d',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './d.component.html',
  styleUrl: './d.component.css'
})

export class DComponent {
  isDownloading = false;
  percent: any;
  progress = "";
  name = "";
  size = ""
  guid: string | null = null;
  data: any;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const btn = document.getElementById("downloadBtn") as HTMLButtonElement
      btn.disabled = false;
      this.guid = params['guid'];
      const response = fetch("https://file-host.azurewebsites.net/Files/Metadata?guid=" + this.guid).then(response => response.json())
        .then(data => {
          this.data = data;
          if (data["FileName"] == null) {
            btn.disabled = true
            data["FileName"] = "Not found (Error 404)"
          }
          this.name = data["FileName"];
          this.size = this.calculateSize(data["KiloBytes"]);
          this.progress = this.size;
        })
    })
  }

  downloadClick() {
    const f = this.data;
    const xhr = new XMLHttpRequest();
    const a = document.createElement('a');
    this.isDownloading = true;
    xhr.open('GET', f["URI"]);
    xhr.responseType = 'blob';

    xhr.onload = () => {
      const file = new Blob([xhr.response]);
      const url = window.URL.createObjectURL(file);
      a.href = url;
      a.download = f["FileName"];
      a.click();
      window.URL.revokeObjectURL(url);
      this.percent = "100";
    };

    xhr.onprogress = (event) => {
      if (event.lengthComputable) {
        this.percent = ((event.loaded / event.total) * 100)
        this.progress = this.calculateSize(Math.round(event.loaded / 1024).toString()) + " / " + this.size;
      }
    };
    xhr.onerror = () => {
      alert("Download failed. Please try again in a minute.")
    }
    xhr.send();
  }


  calculateSize(size: string) {

    let num = parseFloat(size);
    const table =  ["KB", "MB", "GB", "TB"]
    if (num == 0) {
      return "1 KB";
    }
    let i = 0;
    while (num >= 1000) {
      num /= 1000;
      i++;
    }
    return num.toFixed(2) + " " + table[i];
  }
}
