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
  progress = 0;
  name = "";
  size = "";
  guid: string | null = null;
  data: any;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.guid = params['guid'];
      const response = fetch("https://file-host.azurewebsites.net/Files/Metadata?guid=" + this.guid).then(response => response.json())
        .then(data => {
          this.data = data;
          this.name = data["FileName"];
          this.size = this.calculateSize(data["KiloBytes"])
        })
    })
  }

   downloadClick() {

    const f = this.data;
    var xhr = new XMLHttpRequest(),
      a = document.createElement('a'), file;

    xhr.open('GET', f["URI"]);

    let self = this;
    xhr.onload = function () {
      file = new Blob([xhr.response]);
      a.href = window.URL.createObjectURL(file);
      a.download = f["FileName"];
      a.click();
      self.isDownloading = true;
     };
     xhr.onprogress = (event) => {
       this.progress = Math.round(event.loaded / event.total * 100)
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
