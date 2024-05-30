export class ReviewSaveDto {
  ratingValue?: number;
  text?: string;
  bookId?: number;

  constructor(data: Partial<ReviewSaveDto>) {
    this.ratingValue = data.ratingValue;
    this.text = data.text;
    this.bookId = data.bookId;
  }
}