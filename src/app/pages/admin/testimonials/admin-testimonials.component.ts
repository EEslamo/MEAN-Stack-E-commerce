import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TestimonialService } from '../../../services/testimonial.service';
import { Testimonial } from '../../../models';

@Component({
  selector: 'app-admin-testimonials',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-testimonials.component.html',
  styleUrls: ['./admin-testimonials.component.css']
})
export class AdminTestimonialsComponent implements OnInit {
  testimonials: Testimonial[] = [];
  loading = true;
  error: string | null = null;

  constructor(private testimonialService: TestimonialService) {}

  ngOnInit() {
    this.loadTestimonials();
  }

  loadTestimonials() {
    this.loading = true;
    this.error = null;

    this.testimonialService.getUserTestimonial().subscribe({
      next: (response) => {
        this.testimonials = response.data.testimonials;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading testimonials:', error);
        this.error = 'Failed to load testimonials';
        this.loading = false;
      }
    });
  }
}
