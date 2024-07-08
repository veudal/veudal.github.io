import { Component } from '@angular/core';

@Component({
  selector: 'app-key',
  standalone: true,
  imports: [],
  templateUrl: './key.component.html',
  styleUrl: './key.component.css'
})
export class KeyComponent {

  ngOnInit(): void {
    const keyInput = document.getElementById("key") as HTMLInputElement;
    if (keyInput) {
      const storedKey = localStorage.getItem("key");
      if (storedKey) {
        keyInput.value = storedKey;
      }
    }
  }

  updateKey(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    localStorage.setItem("key", inputElement.value);
  }
}
