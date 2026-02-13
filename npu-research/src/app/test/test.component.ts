import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Route, Router } from '@angular/router';
import { RegisterData } from '../models/profile.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-test',
  standalone: false,
  templateUrl: './test.component.html',
  styleUrl: './test.component.css',
})
export class TestComponent {
  
}
