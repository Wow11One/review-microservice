import log4js from 'log4js';
import { Request, Response } from 'express';
import { ReviewSaveDto } from 'src/dto/review/reviewSaveDto';
import { InternalError } from '../../system/internalError';
import {
  create as createApi,
  findAll as findAllApi,
  countReviews as countReviewsApi,
} from 'src/services/review';
import httpStatus from 'http-status';
import { ReviewQueryDto } from '../../dto/review/reviewQueryDto';

export const create = async (req: Request, res: Response) => {
  try {
    const review = new ReviewSaveDto(req.body);
    const result = await createApi({
      ...review,
    });

    res.status(httpStatus.CREATED).send({
      result,
    });
  } catch (err) {
    const { message, status } = new InternalError(err);
    log4js.getLogger().error('Error in creating review.', err);
    res.status(status).send({ message });
  }
};

export const findAll = async (req: Request, res: Response) => {
  try {
    const review = new ReviewQueryDto(req.query);
    const result = await findAllApi(review);

    res.send({
      result,
    });
  } catch (err) {
    const { message, status } = new InternalError(err);
    log4js.getLogger().error('Error in reading reviews.', err);
    res.status(status).send({ message });
  }
};

export const countReviews = async (req: Request, res: Response) => {
  try {
    const bookIds = req.body?.bookIds as number[];
    const result = await countReviewsApi(bookIds);

    res.send(result);
  } catch (err) {
    const { message, status } = new InternalError(err);
    log4js.getLogger().error('Error in counting reviews.', err);
    res.status(status).send({ message });
  }
};