# review-microservice
This is the review microservice developed for a profITsoft academy project. 
The review entity has such fields: ratingValue (should be between 1 and 5),
text and bookId (foreign key for book entity from java microservice).

# Endpoints
* `POST /api/review` - creates a new review entity.
* `GET /api/review` - returns a list of reviews. Has required parameter - bookId.
Also, there are 2 optional params: from and size. They are needed for pagination.
* `POST /api/_counts` - counts the occurrences of review with certain bookId. 
Takes array of bookId's as a request body and return an object, where the key is
the bookId and value is the count.


# How to run

Execute `docker-compose up`

It will run all services in containers (review-service, db and consul).
Once consul and db are running, review-service will be started.
All consul kv's and mongoDB data will be stored in docker/data/...
Thus, when the containers are restarted, data will not be lost.

Additionally, it is important to run [book-microservice](https://github.com/Wow11One/book-rest-api),
as they communicate with each other and have one common network in docker. Otherwise, review-microservice 
won't work. Anyway, you can run tests

# How to run tests

```
npm run test
```

If everything is fine, you should see the list of passed tests

# Configuration

If for some reason consul kv's were not added, and you need to add it manually:

Open consul ui (by default `localhost:8501`)
Add to consul these key-values:

for "prod" version

`config/nodejs-sample/prod/address` : `0.0.0.0`

`config/nodejs-sample/prod/port` : `8888`

`config/nodejs-sample/prod/mongo.address` : `mongodb://db:27017`


for "dev" version

`config/nodejs-sample/dev/address` : `localhost`

`config/nodejs-sample/dev/port` : `8888`

`config/nodejs-sample/dev/mongo.address` : `mongodb://127.0.0.1:27018`
