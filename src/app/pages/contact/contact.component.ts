import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../services/contact.service';
import { CreateContactRequest } from '../../models';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  contactForm = {
    name: '',
    email: '',
    phone: '',
    category: 'question',
    subject: '',
    message: ''
  };

  categories = [
    { value: 'question', label: 'Question' },
    { value: 'complaint', label: 'Complaint' },
    { value: 'suggestion', label: 'Suggestion' },
    { value: 'other', label: 'Other' }
  ];

  isSubmitting = false;
  submitSuccess = false;

  constructor(private contactService: ContactService) {}

  onSubmit() {
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    this.submitSuccess = false;

    const contactData: CreateContactRequest = {
      name: this.contactForm.name,
      email: this.contactForm.email,
      phone: this.contactForm.phone,
      category: this.contactForm.category,
      subject: this.contactForm.subject,
      message: this.contactForm.message
    };

    this.contactService.createContact(contactData).subscribe({
      next: (response) => {
        this.submitSuccess = true;
        this.resetForm();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error submitting contact form:', error);
        this.isSubmitting = false;
      }
    });
  }

  private resetForm() {
    this.contactForm = {
      name: '',
      email: '',
      phone: '',
      category: 'question',
      subject: '',
      message: ''
    };
  }
}
