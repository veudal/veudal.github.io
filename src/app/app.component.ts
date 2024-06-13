import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  title = 'Filehost';
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  isUploading = false;
  fileUrl!: string | null;
  uploadFile!: File | null;

  handleChange(event: any) {
    this.uploadFile = event.target.files[0] as File;
    this.fileUrl = URL.createObjectURL(this.uploadFile);
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
      console.error("No file selected for upload.");
      return;
    }

    this.isUploading = true;

    const formData = new FormData();
    formData.append("file", this.uploadFile);
    const response = await (await fetch("https://file-host.azurewebsites.net/Files/Upload", {
      method: 'POST',
      body: formData,
      headers: { 'accept': 'text/plain' }
    })).json();
  }
}
