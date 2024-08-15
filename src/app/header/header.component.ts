import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {

  src: string = "assets/dark-logo.png"
  theme = "";

  ngOnInit() {
    if (localStorage.getItem('theme') == null) {
      localStorage.setItem("theme", "dark")
    }

    this.theme = localStorage.getItem('theme')!;
    this.src = "assets/" + this.theme + "-logo.png";
    document.body.className = this.theme;
    this.updateThemeSymbol();
  }

  public themeToggle() {

    const body = document.body;
    body.classList.toggle("dark");
    body.classList.toggle("light");
    localStorage.setItem('theme', body.classList[0])
    this.src = "assets/" + body.classList[0] + "-logo.png";
    this.updateThemeSymbol();
  }

  private updateThemeSymbol() {

    const sunElement = document.getElementById('sun')!;
    const moonElement = document.getElementById('moon')!;
    if (document.body.classList.contains('light')) {
      sunElement.style.display = 'block';
      moonElement.style.display = 'none';
    } else {
      sunElement.style.display = 'none';
      moonElement.style.display = 'block';
    }
  }
}
