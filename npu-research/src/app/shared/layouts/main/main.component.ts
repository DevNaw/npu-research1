import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main',
  standalone: false,
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent {
  isLoading = true;

  static instance: MainComponent;

  constructor(private router: Router, private cdr: ChangeDetectorRef) {
    MainComponent.instance = this;
  }

  static showLoading() {
    MainComponent.instance.isLoading = true;
    MainComponent.instance.cdr.detectChanges();
  }

  static hideLoading() {
    MainComponent.instance.isLoading = false;
  }
}
