import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';



@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})

export class HomeComponent {
  title = 'Filehost';
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  response: any;
  isUploading = false;
  percent: any
  successfulUpload = false;
  errorMessage = "";
  fileUrl!: string | null;
  uploadFile!: File | null;

  ngOnInit(): void {
    const input = document.getElementById("key") as HTMLInputElement;
    if (input == null) {
      return;
    }
    const key = localStorage.getItem("key")
    if (key != null) {
      input.value = key;
    }
  }

  onChange(event: any) {
    localStorage.setItem("key", event.target.value)
  }


  handleChange(event: any) {
    if (event.target.files[0] != null) {
      if (event.target.files[0].size < 1024 * 1000000) {
        this.errorMessage = "";
        this.uploadFile = event.target.files[0] as File;
        this.fileUrl = URL.createObjectURL(this.uploadFile);
        this.successfulUpload = false;
      }
      else {
        alert("File exceeds size limit of 1.024 GB.");
      }
    }
  }

  handleRemovesFile() {
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = null;
    }
    this.errorMessage = "";
    this.uploadFile = null;
    this.fileUrl = null;
  }

  async handleUploadFile() {
    this.errorMessage = "";
    if (!this.uploadFile) {
      alert("No file selected.")
      return;
    }
    const bar = document.getElementById("progressBar") as HTMLProgressElement;
    bar.style.width = "0";
    this.isUploading = true;

    const formData = new FormData();
    formData.append("file", this.uploadFile);

    const xhr = new XMLHttpRequest();
    const url = "https://file-host.azurewebsites.net/Files/Upload";
    const method = 'POST';
    xhr.open(method, url);

    xhr.setRequestHeader('accept', 'text/plain');
    xhr.setRequestHeader('authorization', localStorage.getItem("key") as string);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        this.percent = (event.loaded / event.total) * 100;
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        this.response = JSON.parse(xhr.responseText); 
        this.isUploading = false;
        this.errorMessage = this.response["Error"];
        this.successfulUpload = (this.errorMessage == null)
      }
      else {
        alert("Request failed: " + xhr.status + ": " +  xhr.statusText);
      }
    };

    xhr.onerror = function () {
      alert('Network error occurred');
    };

    xhr.send(formData);
  }

  copyLink() {
    const uri = this.response["URI"];
    const guid = uri.substring(uri.lastIndexOf("/") + 1);
    navigator.clipboard.writeText(window.location.origin + "/#/d/" + guid);
  }
}
