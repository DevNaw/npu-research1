import { Component, ViewChild } from "@angular/core";
import { MainComponent } from "../shared/layouts/main/main.component";


@Component({
  selector: 'app-test',
  standalone: false,
  templateUrl: './test.component.html',
  styleUrl: './test.component.css',
})
export class TestComponent {
  activeDropdown: string | null = null;

activeMajor: any = null;
activeSub: any = null;
selectedRelated: any = null;

selectedMajor: any = null;
selectedSub: any = null;

subList: any[] = [];
relatedList: any[] = [];
  majors = [
    {
      major_id: 1,
      name_en: 'Computer Science',
      children: [
        {
          sub_id: 11,
          name_en: 'Software Engineering',
          children: [
            { related_id: 111, name_en: 'Web Development' },
            { related_id: 112, name_en: 'Mobile App Development' }
          ]
        },
        {
          sub_id: 12,
          name_en: 'Artificial Intelligence',
          children: [
            { related_id: 121, name_en: 'Machine Learning' },
            { related_id: 122, name_en: 'Computer Vision' }
          ]
        }
      ]
    },
    {
      major_id: 2,
      name_en: 'Business Administration',
      children: [
        {
          sub_id: 21,
          name_en: 'Marketing',
          children: [
            { related_id: 211, name_en: 'Digital Marketing' },
            { related_id: 212, name_en: 'Brand Management' }
          ]
        }
      ]
    }
  ];
  constructor() {}
  

  ngOnInit() {
    MainComponent.showLoading();
    Promise.all([
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]).then(() => MainComponent.hideLoading());
  }

  
  toggleMajor(m: any, event: Event) {
    event.stopPropagation();
    this.activeMajor = m;
    this.activeSub = null; // reset ชั้นล่าง
  }
  
  toggleSub(s: any, event: Event) {
    event.stopPropagation();
    this.activeSub = s;
  }
  

  onSelectMajor(major: any) {
    this.selectedMajor = major;
  
    // reset
    this.selectedSub = null;
    this.selectedRelated = null;
  
    // load sub
    this.subList = major.children || [];
    this.relatedList = [];
  }
  
  onSelectSub(sub: any) {
    this.selectedSub = sub;
  
    // reset
    this.selectedRelated = null;
  
    // load related
    this.relatedList = sub.children || [];
  }
  
  onSelectRelated(related: any) {
    this.selectedRelated = related;
  }

  toggleDropdown(name: string, event: Event) {
    event.stopPropagation();
    this.activeDropdown = this.activeDropdown === name ? null : name;
  }
  
  selectMajor(m: any) {
    this.selectedMajor = m;
  
    this.selectedSub = null;
    this.selectedRelated = null;
  
    this.subList = m.children || [];
    this.relatedList = [];
  
    this.activeDropdown = null;
  }
  
  selectSub(s: any) {
    this.selectedSub = s;
  
    this.selectedRelated = null;
  
    this.relatedList = s.children || [];
  
    this.activeDropdown = null;
  }
  
  selectRelated(r: any) {
    this.selectedRelated = r;
    this.activeDropdown = null;
  }
}
