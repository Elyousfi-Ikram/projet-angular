import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
// import { FaqItem, FaqService } from '../../services/faq.service';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FaqComponent implements OnInit {
  // faqs$: Observable<FaqItem[]>;
  isModalOpen = false;
  activeIndex: number | null = null;

  // constructor(private faqService: FaqService) {
  //   this.faqs$ = this.faqService.getFaqs();
  // }

  ngOnInit(): void {}

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  toggleAccordion(index: number): void {
    this.activeIndex = this.activeIndex === index ? null : index;
  }
}
interface FaqItem {
  question: string;
  answer: string;
}