import { Component } from '@angular/core';
import { Manual } from '../../models/manual.model';
import { ManualService } from '../../services/manual.service';
import { MainComponent } from '../../shared/layouts/main/main.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manual',
  standalone: false,
  templateUrl: './manual.component.html',
  styleUrl: './manual.component.css',
})
export class ManualComponent {
  documents: Manual[] = [];

  constructor(private service: ManualService){}

  ngOnInit() {
    MainComponent.showLoading();
    Promise.all([
      this.loadDocuments(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]).then(() => MainComponent.hideLoading());
  }

  loadDocuments() {
    this.service.getDocumentsPublic().subscribe({
      next: (res) => {
        this.documents = res.data.manuals;
      },
      error: (err) => console.error(err),
    });
  }

  downloadFile(id: number, url: string) {
    this.service.downloadDocument(id).subscribe({
      next: () => {
        window.open(url, '_blank');
        this.loadDocuments();
      },
      error: (err) => console.error(err),
    });
  }
}
