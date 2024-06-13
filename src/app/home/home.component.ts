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
  uploadFinished = false;
  fileUrl!: string | null;
  uploadFile!: File | null;

  handleChange(event: any) {
    this.uploadFile = event.target.files[0] as File;
    this.fileUrl = URL.createObjectURL(this.uploadFile);
    this.uploadFinished = false;
  }

  handleRemovesFile() {
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = null;
    }

    this.uploadFile = null;
    this.fileUrl = null;
  }

  async handleUploadFile() {
    if (!this.uploadFile) {
      alert("No file selected.")
      return;
    }
    this.isUploading = true;

    const formData = new FormData();
    formData.append("file", this.uploadFile);
    this.response = await (await fetch("https://file-host.azurewebsites.net/Files/Upload", {
      method: 'POST',
      body: formData,
      headers: { 'accept': 'text/plain'}
    })).json();
    this.uploadFinished = true;
    this.isUploading = false;
  }

  copyLink() {
    const uri = this.response["URI"];
    const guid = uri.substring(uri.lastIndexOf("/") + 1);
    navigator.clipboard.writeText(window.location.origin + "/d/" + guid);
  }
}
