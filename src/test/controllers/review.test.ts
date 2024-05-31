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
  text: 'some review text',
  bookId: 1,
});

const review2 = new Review({
  ratingValue: 3,
  text: 'some review text',
  bookId: 1,
});

const review3 = new Review({
  ratingValue: 3,
  text: 'some review text',
  bookId: 1,
});

const review4 = new Review({
  ratingValue: 3,
  text: 'some review text',
  bookId: 1,
});

const review5 = new Review({
  ratingValue: 3,
  text: 'some review text',
  bookId: 1,
});

//const invalidReview1 = new Review({
//  ratingValue: 6,
//  text: 'some review text',
//  bookId: 1,
//});
//
//const invalidReview2 = new Review({
//  ratingValue: 6,
//  text: null,
//  bookId: 1,
//});

describe('Review controller', () => {

  before(async () => {
    await mongoSetup;

    await review1.save();
    await review2.save();
    await review3.save();
    await review4.save();
    await review5.save();
  });
  afterEach(() => {
    sandbox.restore();
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
    console.log(reviewToBeSaved);

    chai.request(app)
      .post('/api/reviews')
      .send(reviewToBeSaved)
      .end((_, res) => {

        res.should.have.status(httpStatus.CREATED);
        const body = res.body;

        // check whether response value is correct
        expect(body).not.to.be.null;
        expect(body.id).not.to.be.null;
        expect(body.createdAt).not.to.be.null;
        expect(body.ratingValue).equal(reviewToBeSaved.ratingValue);
        expect(body.text).equal(reviewToBeSaved.text);
        expect(body.bookId).equal(reviewToBeSaved.bookId);

        Review.findOne({
          _id: body.id,
        }).then(data => {

          // check whether db record is saved successfully
          expect(data).not.to.be.null;
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

        expect(body).not.to.be.null;
        expect(body.message).not.to.be.null;
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

        expect(body).not.to.be.null;
        expect(body.message).not.to.be.null;
        expect(body.message).equal('review rating value should be between 1 and 5!');

        done();
      });
  },);

});
