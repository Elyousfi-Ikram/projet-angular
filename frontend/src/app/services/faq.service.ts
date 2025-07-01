import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

export interface FaqItem {
  question: string;
  answer: string;
}

@Injectable({
  providedIn: 'root'
})
export class FaqService {
  private faqDataUrl = 'assets/data/faq.json';
  private faqs$: Observable<FaqItem[]> | undefined;

  constructor(private http: HttpClient) {}

  getFaqs(): Observable<FaqItem[]> {
    if (!this.faqs$) {
      this.faqs$ = this.http.get<FaqItem[]>(this.faqDataUrl).pipe(
        shareReplay(1) // Cache the result and replay for subsequent subscribers
      );
    }
    return this.faqs$;
  }
}