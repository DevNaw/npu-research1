import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment.prod';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  openDropdown: string | null = null;

  constructor(private router: Router) {}

  goToLogin() {
    this.router.navigate(['/login']);
  }

  majors = ['คอมพิวเตอร์', 'เทคโนโลยีสารสนเทศ', 'วิศวกรรม', 'ปัญญาประดิษฐ์'];

  selectedMajors: string[] = [];
  searchMajor = '';

  toggle(name: string, event: MouseEvent) {
    event.stopPropagation();
    this.openDropdown = this.openDropdown === name ? null : name;
  }

  isOpen(name: string) {
    return this.openDropdown === name;
  }

  @HostListener('document:click')
  closeAll() {
    this.openDropdown = null;
  }

  selectMajor(m: string) {
    if (!this.selectedMajors.includes(m)) {
      this.selectedMajors.push(m);
    }
    this.searchMajor = '';
  }

  filteredMajors() {
    return this.majors.filter(
      (m) =>
        m.toLowerCase().includes(this.searchMajor.toLowerCase()) &&
        !this.selectedMajors.includes(m)
    );
  }

  removeMajor(i: number) {
    this.selectedMajors.splice(i, 1);
  }
}
