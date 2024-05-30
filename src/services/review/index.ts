import Review, { IReview } from 'src/model/review';
import { ReviewDto } from 'src/dto/review/reviewDto';
import { ReviewSaveDto } from 'src/dto/review/reviewSaveDto';
import { bookExists } from 'src/clients/book';
import { ReviewQueryDto } from '../../dto/review/reviewQueryDto';

export const create = async (reviewSaveDto: ReviewSaveDto): Promise<ReviewDto> => {
  await validateReview(reviewSaveDto);

  const review = await new Review(reviewSaveDto).save();
  return mapToReviewDto(review);
};

export const findAll = async (reviewQueryDto: ReviewQueryDto): Promise<ReviewDto[]> => {
  const bookId = reviewQueryDto.bookId;

  if (!bookId) {
    throw new Error('bookId parameter is required!');
  }
  if (reviewQueryDto.size && reviewQueryDto.size < 1) {
    throw new Error('size parameter should be positive number!');
  }
  if (reviewQueryDto.from && reviewQueryDto.from < 0) {
    throw new Error('from parameter should be greater than 0!');
  }

  const size = reviewQueryDto.size || 5;
  const from = reviewQueryDto.from || 0;
  const result = await Review.find({ ...(bookId && { bookId }) })
    .limit(size)
    .skip(from)
    .sort('-createdAt');

  return result.map(review => mapToReviewDto(review));
};

export const countReviews = async (bookIds: number[]): Promise<{ [key: number]: number }> => {
  if (!bookIds) {
    throw new Error('you need to provide array of bookIds!');
  }

  const countQuery = await Review.aggregate([
    {
      $match: {
        bookId: { $in: bookIds },
      },
    },
    {
      $group: {
        _id: '$bookId',
        count: { $sum: 1 },
      },
    },
  ]);

  const result: { [key: number]: number } = {};
  bookIds.forEach(bookId => {
    const reviewCountCheck = countQuery.find(item => item._id === bookId);
    result[bookId] = reviewCountCheck ? reviewCountCheck.count : 0;
  });

  return result;
};

const mapToReviewDto = (review: IReview): ReviewDto => ({
  id: review._id,
  ratingValue: review.ratingValue,
  text: review.text,
  bookId: review.bookId,
  createdAt: review.createdAt,
});


const validateReview = async (reviewDto: ReviewSaveDto) => {
  const bookId = reviewDto.bookId;
  if (bookId) {
    const bookCheck = await bookExists(bookId);
    if (!bookCheck) {
      throw new Error('no book with such id exists!');
    }
  } else {
    throw new Error('review should have bookId!');
  }

  if (reviewDto.text) {
    if (reviewDto.text.trim().length < 3) {
      throw new Error('review text should have at least 3 symbols!');
    }
  } else {
    throw new Error('review should have text!');
  }

  if (reviewDto.ratingValue) {
    if (reviewDto.ratingValue < 1 || reviewDto.ratingValue > 5) {
      throw new Error('review rating value should be between 1 and 5!');
    }
  } else {
    throw new Error('review should have ratingValue!');
  }
};