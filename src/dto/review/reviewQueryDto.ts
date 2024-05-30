export class ReviewQueryDto {
  bookId?: number;
  size?: number;
  from?: number;

  constructor(data: Partial<ReviewQueryDto>) {
    this.bookId = data.bookId;
    this.size = data.size;
    this.from = data.from;
  }
}