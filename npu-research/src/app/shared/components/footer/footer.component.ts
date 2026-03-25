import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: false,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {

  constructor(private router: Router) {}

  openLink() {
    window.open('https://www.npu.ac.th/view_news_pr.php?news_id=1682745233', '_blank');
  }


  openCookie() {
    this.router.navigate(['/privacy-policy']);
  }
}
