import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="bg-gray-900 text-white">
      <div class="container mx-auto px-4 py-12">
        <div class="grid md:grid-cols-4 gap-8">
          <!-- Company Info -->
          <div class="col-span-1 md:col-span-2">
            <h3 class="text-2xl font-bold mb-4">EcomStore</h3>
            <p class="text-gray-300 mb-4">
              Your trusted online destination for quality clothing for men and women aged 18-35. 
              We offer casual wear with style and comfort at affordable prices.
            </p>
            <div class="text-gray-300">
              <p class="mb-2">📍 Cairo, Egypt</p>
              <p class="mb-2">📞 +20 123 456 789</p>
              <p>✉️ info&#64;ecomstore.com</p>
            </div>
          </div>

          <!-- Quick Links -->
          <div>
            <h4 class="text-lg font-semibold mb-4">Quick Links</h4>
            <ul class="space-y-2 text-gray-300">
              <li><a routerLink="/" class="hover:text-white transition-colors">Home</a></li>
              <li><a routerLink="/products" class="hover:text-white transition-colors">Products</a></li>
              <li><a routerLink="/contact" class="hover:text-white transition-colors">Contact Us</a></li>
              <li><a routerLink="/faq" class="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          <!-- Policies -->
          <div>
            <h4 class="text-lg font-semibold mb-4">Policies</h4>
            <ul class="space-y-2 text-gray-300">
              <li><span class="hover:text-white transition-colors cursor-default">14 Days Return</span></li>
              <li><span class="hover:text-white transition-colors cursor-default">Payment on Delivery</span></li>
              <li><span class="hover:text-white transition-colors cursor-default">Shipping All Over Egypt</span></li>
              <li><span class="hover:text-white transition-colors cursor-default">Local Market</span></li>
            </ul>
          </div>
        </div>

        <div class="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {{ currentYear }} EcomStore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}