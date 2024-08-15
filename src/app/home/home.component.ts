import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, isDevMode } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CONSTANTS } from '../constants/constants';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  ngOnInit() {
    let theme = localStorage.getItem('theme')!;
    document.body.className = theme;
  }

  constructor(private router: Router) { }

  title = 'Filehost';
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  response: any;
  isUploading = false;
  uploadProgress = 0;
  successfulUpload = false;
  downloadLink = "";
  showDownloadLink = false;
  errorMessage = "";
  fileUrl: string | null = null;
  targetFile: File | null = null;
  xhr: XMLHttpRequest = new XMLHttpRequest();


  async validateKey(): Promise<string> {
    const storedValue = localStorage.getItem("key");
    if (storedValue == null || storedValue == "") {
      return "Access key is not valid.";
    }

    try {
      const response = await fetch(CONSTANTS.API_URL + `Validate?key=${storedValue}`);
      const isValid = await response.text();

      if (isValid !== "true") {
        this.successfulUpload = false;
        this.isUploading = false;
        return "Access key is not valid.";
      }
    } catch (error) {
      console.error('Validation error:', error);
      return "Validation error occurred: " + error;
    }
    return "Success";
  }

  reset() {
    this.fileInput.nativeElement.value = null;
  }

  handleFileChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement.files?.[0];

    if (file && file.size < 1024 * 1000000) {
      const passwordInput = document.getElementById("password") as HTMLInputElement;
      if (passwordInput) {
        passwordInput.value = "";
      }

      this.errorMessage = "";
      this.targetFile = file;
      this.fileUrl = URL.createObjectURL(file);
      this.showDownloadLink = false;
      this.successfulUpload = false;
    } else {
      alert("File exceeds size limit of 1 GB.");
    }
  }

  removeFile(): void {
    if (this.isUploading) {
      this.errorMessage = "Upload canceled by user.";
      this.successfulUpload = false;
      this.xhr.abort();
    } else if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = null;
    }

    this.isUploading = false;
    this.targetFile = null;
    this.fileUrl = null;
  }

  async uploadFile(): Promise<void> {
    this.showDownloadLink = false;
    this.isUploading = true;
    this.errorMessage = "";

    if (!this.targetFile) {
      alert("No file selected.");
      this.isUploading = false;
      return;
    }

    const progressBar = document.getElementById("progressBar") as HTMLProgressElement;
    progressBar.style.width = "0";

    const response = await this.validateKey();
    if (response.startsWith("Validation error occurred:")) {
      this.isUploading = false;
      alert(response)
      return;
    }
    else if (response == "Access key is not valid.") {
      this.isUploading = false;
      this.errorMessage = response;
      return;
    }

    const formData = new FormData();
    formData.append("file", this.targetFile);

    this.xhr = new XMLHttpRequest();
    const passwordInput = document.getElementById("password") as HTMLInputElement;
    const key = passwordInput?.value || "";
    const url = CONSTANTS.API_URL + `Upload?password=${key}`;

    this.xhr.open('POST', url);
    this.xhr.setRequestHeader('Accept', 'text/plain');
    this.xhr.setRequestHeader('Authorization', localStorage.getItem("key") || '');

    this.xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        this.uploadProgress = (event.loaded / event.total) * 100;
      }
    };

    this.xhr.onerror = () => {
      alert('Network error occurred.');
      this.isUploading = false;
      this.successfulUpload = false;
    };

    this.xhr.onload = () => {
      if (this.xhr.status < 200 || this.xhr.status >= 300) {
        if (this.isUploading) {
          this.successfulUpload = false;
          alert(`Request failed: ${this.xhr.status}: ${this.xhr.statusText}`);
        }
        return;
      }

      this.isUploading = false;
      this.response = JSON.parse(this.xhr.responseText);
      this.errorMessage = this.response["Error"];

      if (this.errorMessage) {
        this.successfulUpload = false;
        return;
      }
      this.response["Password"] = key;

      this.saveMetadata();

      this.downloadLink = `${window.location.origin}/d/${this.response["ID"]}`;
      this.successfulUpload = true;
      this.showDownloadLink = true;
      this.shortenDownloadLink();
    };

    this.xhr.send(formData);
  }

  private saveMetadata() {
    let data = localStorage.getItem("filesMetadata");
    let arr = []
    if (data != null && data != undefined) {
      arr = JSON.parse(data);
    }
    arr.push(this.response);
    localStorage.setItem("filesMetadata", JSON.stringify(arr));
  }

  private shortenDownloadLink(): void {
    const xhr = new XMLHttpRequest();
    const data = new URLSearchParams();

    if (isDevMode()) {
      this.downloadLink = this.downloadLink.replace("localhost:4200", CONSTANTS.SITE_URL);
    }

    data.append("url", this.downloadLink);

    xhr.onload = () => {
      this.response = JSON.parse(xhr.responseText);
      if (this.response["short_url"]) {
        this.downloadLink = this.response["short_url"];
      }
    };

    xhr.open('POST', CONSTANTS.LINK_SHORTENER_URL);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.send(data);
  }

  copyDownloadLink(): void {
    navigator.clipboard.writeText(this.downloadLink);
  }
}
