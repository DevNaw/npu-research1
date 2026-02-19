import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Article } from '../models/aticle.model';
import { Major, SubArea } from '../models/subject.model';
import { Researcher } from '../models/researchers.model';
import { ResearchService } from '../services/research.service';


@Component({
  selector: 'app-test',
  standalone: false,
  templateUrl: './test.component.html',
  styleUrl: './test.component.css',
})
export class TestComponent {
 
}
