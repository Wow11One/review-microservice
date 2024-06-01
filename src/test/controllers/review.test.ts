import bodyParser from 'body-parser';
import express from 'express';
import sinon from 'sinon';
import chai from 'chai';
import chaiHttp from 'chai-http';
import mongoSetup from '../mongoSetup';
import Review from 'src/model/review';
import reviewRouter from 'src/routers/review';
import * as bookExists from 'src/clients/book';
import httpStatus from 'http-status';
import { mapToReviewDto } from 'src/services/review';

const { expect } = chai;

chai.use(chaiHttp);
chai.should();

const sandbox = sinon.createSandbox();

const app = express();

app.use(bodyParser.json({ limit: '1mb' }));
app.use('/api/reviews', reviewRouter);

//some test data
const review1 = new Review({
  ratingValue: 2,
  text: 'wow!',
  bookId: 1,
});

const review2 = new Review({
  ratingValue: 3,
  text: 'some review text',
  bookId: 1,
});

const review3 = new Review({
  ratingValue: 3,
  text: 'cool',
  bookId: 1,
});

const review4 = new Review({
  ratingValue: 3,
  text: 'great!',
  bookId: 2,
});

const review5 = new Review({
  ratingValue: 3,
  text: 'no way!',
  bookId: 3,
});

const review6 = new Review({
  ratingValue: 2,
  text: 'lets go!',
  bookId: 1,
});

const review7 = new Review({
  ratingValue: 3,
  text: 'some new text',
  bookId: 1,
});

describe('Review controller', () => {

  before(async () => {
    await mongoSetup;

    await review1.save();
    await review2.save();
    await review3.save();
    await review4.save();
    await review5.save();
    await review6.save();
    await review7.save();
  });

  afterEach(async () => {
    sandbox.restore();
    await Review.deleteMany({
      _id: {
        $not: {
          $in: [
            review1._id,
            review2._id,
            review3._id,
            review4._id,
            review5._id,
            review6._id,
            review7._id,
          ],
        },
      },
    });
  });

  it('should save valid review', (done) => {
    const reviewToBeSaved = {
      ratingValue: 4,
      text: 'some review text',
      bookId: 1,
    };
    const bookExistsStub = sandbox.stub(
      bookExists,
      'default',
    );
    bookExistsStub.resolves(true);

    chai.request(app)
      .post('/api/reviews')
      .send(reviewToBeSaved)
      .end((_, res) => {

        res.should.have.status(httpStatus.CREATED);
        const body = res.body;

        // check whether response value is correct
        expect(body).to.not.be.null;
        expect(body.id).to.not.be.null;
        expect(body.createdAt).to.not.be.null;
        expect(body.ratingValue).equal(reviewToBeSaved.ratingValue);
        expect(body.text).equal(reviewToBeSaved.text);
        expect(body.bookId).equal(reviewToBeSaved.bookId);

        Review.findOne({
          _id: body.id,
        }).then(data => {

          // check whether db record is saved successfully
          expect(data).to.not.be.null;
          expect(data?.ratingValue).equal(reviewToBeSaved.ratingValue);
          expect(data?.text).equal(reviewToBeSaved.text);
          expect(data?.bookId).equal(reviewToBeSaved.bookId);

          done();
        }, done);
      });

  },);

  it('should not save review with empty text', (done) => {
    const reviewToBeSaved = {
      ratingValue: 6,
      text: 'f',
      bookId: 1,
    };
    const bookExistsStub = sandbox.stub(
      bookExists,
      'default',
    );
    bookExistsStub.resolves(true);

    chai.request(app)
      .post('/api/reviews')
      .send(reviewToBeSaved)
      .end((_, res) => {

        res.should.have.status(400);
        const body = res.body;

        expect(body).to.not.be.null;
        expect(body.message).to.not.be.null;
        expect(body.message).equal('review text should have at least 3 symbols!');

        done();
      });

  },);

  it('should not save review with invalid ratingValue', (done) => {
    const reviewToBeSaved = {
      ratingValue: 6, // invalid ratingValue
      text: 'some review text',
      bookId: 1,
    };
    const bookExistsStub = sandbox.stub(
      bookExists,
      'default',
    );
    bookExistsStub.resolves(true);

    chai.request(app)
      .post('/api/reviews')
      .send(reviewToBeSaved)
      .end((_, res) => {

        res.should.have.status(400);
        const body = res.body;

        expect(body).to.not.be.null;
        expect(body.message).to.not.be.null;
        expect(body.message).equal('review rating value should be between 1 and 5!');

        done();
      });

  },);

  it('should return correct review list with bookId parameter', async () => {
    const bookId = 1;
    const expectedList = (await Review.find({
      bookId,
    })).map(review => mapToReviewDto(review));

    chai.request(app)
      .get(`/api/reviews?bookId=${bookId}`)
      .end((_, res) => {
        res.should.have.status(200);
        const actualList = res.body;

        expect(actualList).to.not.be.null;
        expect(actualList).to.not.be.empty;
        expect(actualList).to.have.same.length(expectedList.length);
        expect(actualList).to.have.deep.members(expectedList);

      });

  },);

  it('should return correct review list with bookId and size parameters', async () => {
    const bookId = 1;
    const size = 4;
    const fullListSize = await Review.count({
      bookId,
    });

    const expectedList = (await Review.find({
      bookId,
    }).limit(size).sort('-createdAt')
    ).map(review => mapToReviewDto(review));

    chai.request(app)
      .get(`/api/reviews?bookId=${bookId}&size=${size}`)
      .end((_, res) => {
        res.should.have.status(200);
        const actualList = res.body;

        expect(actualList).to.not.be.null;
        expect(actualList).to.not.be.empty;
        expect(actualList.length).to.be.lessThan(fullListSize);
        expect(actualList.length).to.be.equal(size);
        expect(actualList).to.have.same.length(expectedList.length);
        expect(actualList).to.have.deep.members(expectedList);

      });

  },);

  it('should return correct review list with bookId, size and from parameters', async () => {
    const bookId = 1;
    const from = 2;
    const size = 4;
    const fullListSize = await Review.count({
      bookId,
    });

    const expectedList = (await Review.find({
      bookId,
    })
      .limit(size)
      .skip(from)
      .sort('-createdAt')
    ).map(review => mapToReviewDto(review));

    chai.request(app)
      .get(`/api/reviews?bookId=${bookId}&size=${size}&from=${from}`)
      .end((_, res) => {
        res.should.have.status(200);
        const actualList = res.body;

        expect(actualList).to.not.be.null;
        expect(actualList).to.not.be.empty;
        expect(actualList.length).to.be.lessThan(fullListSize);
        expect(actualList.length - 1).to.be.equal(size - from);
        expect(actualList).to.have.same.length(expectedList.length);
        expect(actualList).to.have.deep.members(expectedList);

      });

  },);

  it('should not return review list without bookId', (done) => {

    chai.request(app)
      .get(`/api/reviews`)
      .end((_, res) => {
        res.should.have.status(400);
        done();
      });

  },);

  it('should return correct review count by bookIds',  async () => {
    const bookIds = [0, 1, 2, 3];
    const countQueryResults = (await Review.aggregate([
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
    ]));
    
    const expectedResult: { [key: number]: number } = {};
    bookIds.forEach(bookId => {
      const reviewCountCheck = countQueryResults.find(item => item._id === bookId);
      expectedResult[bookId] = reviewCountCheck ? reviewCountCheck.count : 0;
    });

    chai.request(app)
      .post(`/api/reviews/_counts`)
      .send({ bookIds })
      .end((_, res) => {
        res.should.have.status(200);

        const actualResult = res.body;
        expect(actualResult).to.not.be.null;
        expect(actualResult).to.deep.equal(expectedResult);

      });

  },);

  it('should return bad request status if request body has no data',  async () => {


    chai.request(app)
      .post(`/api/reviews/_counts`)
      .end((_, res) => {
        res.should.have.status(400);
      });

  },);

});
