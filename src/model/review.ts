import mongoose, {Document, Schema} from 'mongoose';

export interface IReview extends Document {
  ratingValue: number;
  text: string;
  createdAt: Date;
  updatedAt: Date;
  bookId: number;

  // TODO : the id of the user that creates the review
}

const reviewSchema = new Schema({
  ratingValue: {
    required: true,
    type: Number,
    min: [1, 'review rating value should be at least 1'],
    max: [5, 'review rating value should be less than 5'],
    validate: {
      validator: Number.isInteger,
      message: 'ratingValue is not an integer value',
    },
  },
  text: {
    required: true,
    type: String,
  },
  bookId: {
    required: true,
    type: Number,
  },
},
{
  timestamps: true,
  timezone: 'UTC',
},
);

const Review = mongoose.model<IReview>('Review', reviewSchema);

export default Review;