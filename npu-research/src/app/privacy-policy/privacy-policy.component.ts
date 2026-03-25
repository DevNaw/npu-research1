import { Component } from '@angular/core';
import { MainComponent } from '../shared/layouts/main/main.component';

@Component({
  selector: 'app-privacy-policy',
  standalone: false,
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.css'
})
export class PrivacyPolicyComponent {

  ngOnInit() {
    MainComponent.showLoading();
    Promise.all([
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]).then(() => MainComponent.hideLoading());
  }
  openCookieSettings() {
    localStorage.removeItem('cookieConsent');
    window.location.reload(); // เปิด popup cookies ใหม่
  }
}
