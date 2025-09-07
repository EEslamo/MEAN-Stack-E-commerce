import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TestimonialService } from '../../services/testimonial.service';
import { Testimonial, CreateTestimonialRequest } from '../../models';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.css']
})
export class TestimonialsComponent implements OnInit {
  testimonials: Testimonial[] = [];
  userTestimonial: Testimonial | null = null;
  isLoading = false;
  isSubmitting = false;
  error = '';
  message = '';

  testimonialForm: FormGroup;

  constructor(
    private testimonialService: TestimonialService,
    private fb: FormBuilder
  ) {
    this.testimonialForm = this.fb.group({
      content: ['', [Validators.required, Validators.maxLength(1000)]],
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]]
    });
  }

  ngOnInit(): void {
    this.loadTestimonials();
    this.loadUserTestimonial();
  }

  loadTestimonials(): void {
    this.isLoading = true;
    this.error = '';

    this.testimonialService.getTestimonials({ isApproved: true }).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.testimonials = response.data;
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.error?.message || 'Failed to load testimonials';
      }
    });
  }

  loadUserTestimonial(): void {
    this.testimonialService.getUserTestimonial().subscribe({
      next: (response) => {
        this.userTestimonial = response.data;
        if (response.data) {
          this.testimonialForm.patchValue({
            content: response.data.content,
            rating: response.data.rating
          });
        }
      },
      error: (error) => {
        console.error('Error loading user testimonial:', error);
      }
    });
  }

  submitTestimonial(): void {
    if (this.testimonialForm.valid) {
      this.isSubmitting = true;
      this.error = '';
      this.message = '';

      const testimonialData: CreateTestimonialRequest = this.testimonialForm.value;
      
      const operation = this.userTestimonial 
        ? this.testimonialService.updateTestimonial(testimonialData)
        : this.testimonialService.createTestimonial(testimonialData);

      operation.subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.message = this.userTestimonial 
            ? 'Testimonial updated successfully' 
            : 'Testimonial submitted successfully. It will be reviewed before being published.';
          this.loadUserTestimonial();
        },
        error: (error) => {
          this.isSubmitting = false;
          this.error = error.error?.message || 'Failed to submit testimonial';
        }
      });
    }
  }

  deleteTestimonial(): void {
    if (confirm('Are you sure you want to delete your testimonial?')) {
      this.testimonialService.deleteTestimonial().subscribe({
        next: (response) => {
          this.message = 'Testimonial deleted successfully';
          this.userTestimonial = null;
          this.testimonialForm.reset({ rating: 5 });
        },
        error: (error) => {
          this.error = error.error?.message || 'Failed to delete testimonial';
        }
      });
    }
  }

  getStars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  getFieldError(fieldName: string): string {
    const field = this.testimonialForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['maxlength']) return 'Testimonial cannot exceed 1000 characters';
      if (field.errors['min']) return 'Rating must be at least 1';
      if (field.errors['max']) return 'Rating cannot exceed 5';
    }
    return '';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
