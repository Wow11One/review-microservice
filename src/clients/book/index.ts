import httpStatus from 'http-status';

const serverUrl = 'http://book-app:8080/api/books/';

const bookExists = async (id: number): Promise<boolean> => {
  const requestUrl = serverUrl + id;
  const response = await fetch(requestUrl);

  // if book does not exist then 404 not found status is returned
  return response.status === httpStatus.OK;
};

export default bookExists;

