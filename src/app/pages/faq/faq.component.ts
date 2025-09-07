import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent implements OnInit {
  faqs: FAQItem[] = [
    {
      question: 'How do I place an order?',
      answer: 'To place an order, simply browse our products, add items to your cart, and proceed to checkout. You\'ll need to provide your shipping information and payment details.',
      category: 'Ordering'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We currently accept all major credit cards, PayPal, and bank transfers. All payments are processed securely through our encrypted payment gateway.',
      category: 'Payment'
    },
    {
      question: 'How long does shipping take?',
      answer: 'Standard shipping typically takes 3-5 business days within the country. Express shipping options are available for faster delivery. International shipping may take 7-14 business days.',
      category: 'Shipping'
    },
    {
      question: 'Can I track my order?',
      answer: 'Yes! Once your order is shipped, you\'ll receive a tracking number via email. You can also track your order status in your account dashboard.',
      category: 'Shipping'
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for most items. Items must be in original condition with tags attached. Some items like electronics may have different return terms.',
      category: 'Returns'
    },
    {
      question: 'How do I return an item?',
      answer: 'To return an item, log into your account, go to your order history, and click "Return Item" next to the order. Follow the instructions to print a return label and send the item back.',
      category: 'Returns'
    },
    {
      question: 'Do you offer international shipping?',
      answer: 'Yes, we ship to most countries worldwide. International shipping rates and delivery times vary by destination. Check our shipping calculator during checkout for specific rates.',
      category: 'Shipping'
    },
    {
      question: 'How can I contact customer service?',
      answer: 'You can contact our customer service team through our contact form, email, or phone. We typically respond within 24 hours during business days.',
      category: 'Support'
    },
    {
      question: 'Is my personal information secure?',
      answer: 'Absolutely! We use industry-standard encryption to protect your personal and payment information. We never share your data with third parties without your consent.',
      category: 'Security'
    },
    {
      question: 'Can I modify or cancel my order?',
      answer: 'You can modify or cancel your order within 1 hour of placing it, as long as it hasn\'t been processed for shipping. After that, you\'ll need to contact customer service.',
      category: 'Ordering'
    },
    {
      question: 'Do you have a mobile app?',
      answer: 'Yes! Our mobile app is available for both iOS and Android devices. You can download it from the App Store or Google Play Store.',
      category: 'App'
    },
    {
      question: 'What if I receive a damaged item?',
      answer: 'If you receive a damaged item, please contact us immediately with photos of the damage. We\'ll arrange for a replacement or full refund at no cost to you.',
      category: 'Returns'
    }
  ];

  selectedCategory = 'All';
  categories = ['All', 'Ordering', 'Payment', 'Shipping', 'Returns', 'Support', 'Security', 'App'];

  constructor() {}

  ngOnInit(): void {}

  getFilteredFAQs(): FAQItem[] {
    if (this.selectedCategory === 'All') {
      return this.faqs;
    }
    return this.faqs.filter(faq => faq.category === this.selectedCategory);
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
  }
}
