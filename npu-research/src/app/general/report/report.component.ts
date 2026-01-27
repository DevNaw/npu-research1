import { Component } from '@angular/core';

@Component({
  selector: 'app-report',
  standalone: false,
  templateUrl: './report.component.html',
  styleUrl: './report.component.css'
})
export class ReportComponent {
  topResearchers = [
    {
      name: 'Dr. James Mitchell',
      field: 'Artificial Intelligence & ML',
      publications: 42,
      projects: 8,
      citations: 1247,
      avatar: 'https://i.pravatar.cc/100?img=1',
    },
    {
      name: 'Dr. Sarah Chen',
      field: 'Biotechnology & Genomics',
      publications: 38,
      projects: 6,
      citations: 1089,
      avatar: 'https://i.pravatar.cc/100?img=2',
    },
    {
      name: 'Dr. Marcus Rodriguez',
      field: 'Quantum Computing',
      publications: 35,
      projects: 5,
      citations: 976,
      avatar: 'https://i.pravatar.cc/100?img=3',
    },
  ];

  projects = [
    { title: 'Neural Network Optimization', progress: 78, color: 'bg-blue-500' },
    { title: 'CRISPR Gene Editing Study', progress: 65, color: 'bg-purple-500' },
    { title: 'Quantum Algorithm Development', progress: 42, color: 'bg-green-500' },
    { title: 'Climate Change Modeling', progress: 89, color: 'bg-orange-500' },
  ];

  innovations = [
    {
      title: 'Advanced Neural Architecture',
      desc: 'Deep learning framework achieving 95% accuracy',
      date: 'Jan 2024',
      bg: 'bg-blue-50',
    },
    {
      title: 'Gene Therapy Breakthrough',
      desc: 'Novel CRISPR technique',
      date: 'Dec 2023',
      bg: 'bg-purple-50',
    },
    {
      title: 'Quantum Error Correction',
      desc: 'Improved quantum stability',
      date: 'Nov 2023',
      bg: 'bg-green-50',
    },
  ];
}
