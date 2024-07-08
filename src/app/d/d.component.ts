import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { CONSTANTS } from '../constants/constants';

@Component({
  selector: 'app-d',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './d.component.html',
  styleUrl: './d.component.css'
})

export class DComponent {

  xhr = new XMLHttpRequest();
  isDownloading = false;
  password = "";
  shake = false;
  hidePasswordArea = true;
  previewAvailable = false;
  success = true;
  percent: any;
  error = "";
  progress = "";
  name = "";
  size = "";
  guid: string | null = null;
  data: any;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['password'] != null) {
        this.password = params['password'];
      }
    })
    this.route.params.subscribe(params => {
      this.guid = params['guid'];
      this.getMetadata(true).then(success => {
        this.success = success;
      })
    })
  }

  downloadClick() {
    if (this.data["Error"] != null) {
      return;
    }
    this.xhr = new XMLHttpRequest();
    this.percent = 0;
    const f = this.data;
    const a = document.createElement('a');
    this.isDownloading = true;
    this.xhr.open('GET', f["URI"]);
    this.xhr.responseType = 'blob';

    this.xhr.onload = () => {
      this.isDownloading = false;
      const file = new Blob([this.xhr.response]);
      const url = window.URL.createObjectURL(file);
      a.href = url;
      a.download = f["FileName"];
      a.click();
      window.URL.revokeObjectURL(url);
      this.percent = "100";
    };

    this.xhr.onprogress = (event) => {
      if (event.lengthComputable) {
        this.percent = ((event.loaded / event.total) * 100)
        this.progress = this.calculateSize(Math.round(event.loaded / 1024).toString()) + " / " + this.size;

        console.log(this.progress)
      }
    };
    this.xhr.onerror = () => {
      this.isDownloading = false;
      alert("Download failed. Please try again in a minute.")
    }
    this.xhr.send();
  }

  cancelClick() {
    this.isDownloading = false;
    const btn = document.getElementById("downloadBtn") as HTMLButtonElement
    btn.disabled = false;
    this.xhr.abort();
    this.progress = this.size;
  }

  async confirmClick() {
    this.success = await this.getMetadata(false)
    if (!this.success) {
      this.shakeButton();
    }
  }

  private shakeButton() {
    this.shake = true;
    setTimeout(() => {
      this.shake = false;
    }, 600);
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
    return num.toFixed(2) + " " + table[i];
  }

  async getMetadata(initialAttempt: boolean) {
    const btn = document.getElementById("downloadBtn") as HTMLButtonElement
    const password = document.getElementById("key") as HTMLInputElement
    if (password && !initialAttempt) {
      this.password = password.value;
    }
    const response = await fetch(CONSTANTS.API_URL + "Metadata?guid=" + this.guid + "&password=" + this.password);
    const data = await response.json();

    this.data = data;
    if (data["FileName"] == null) {
      btn.disabled = true;
      this.error = data["Error"];
      if (this.error != "Not a valid guid.") {
        this.hidePasswordArea = false;
      }
      this.name = "Not found (Error 404)"
    }
    else {
      this.hidePasswordArea = true;
      btn.disabled = false;
      this.name = data["FileName"];
      this.size = this.calculateSize(data["KiloBytes"]);
      this.progress = this.size;
      const type = data["FileContentType"]
      if (type.startsWith("image/") || type.startsWith("video/") || type.startsWith("audio/") || type.startsWith("application/pdf") || type.startsWith("text/html")) {
        const iframe = document.getElementById("iframe") as HTMLIFrameElement;
        iframe.hidden = false;
        iframe.src = data["URI"];
        this.previewAvailable = true;
      }
    }
    return (this.data["FileName"] != null)
  }
}
