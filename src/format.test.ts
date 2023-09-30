import { describe, expect, test } from 'vitest'
import { formatSync } from './format';

describe('Test JS code formatting', () => {
  test('should format code', () => {
    const originalCode = `
      import { initDb } from '../../../lambda/handlerSequelizeMiddleware';
      import { PersonRepository } from '../../../repositories/Person';
      export const handler = async event => {
        let db;
        try {
          console.log('Post Person endpoint event: ', event);
          const parsedBody = event.body && JSON.parse(event.body);
          db = await initDb();
          const personService = new PersonService(db);
          const data = await personService.save(parsedBody);
          if (!data) {
            return {
              statusCode: 404,
            };
          }
          return {
            statusCode: 200,
            body: JSON.stringify({
              data,
            }),
          };
        } catch (error) {
          console.log('Error at post Person request: ', error);
          return {
            statusCode: 500,
            body: JSON.stringify({
              ...error,
              message: 'Something went wrong: ' + error.message,
            }),
          };
        } finally {
          if (db) {
            await db.connectionManager.close();
          }
        }
      };
      class PersonService {
        someProperty = 'value';
        someOtherProperty = 0;
        constructor(db) {
          this.db = db;
        }
        async save(person) {
          const personRepository = new PersonRepository(this.db);
          return await personRepository.save(person);
        }
      }
      `;

    const formattedCode = formatSync(originalCode);

    const expectedCode = `import { initDb } from "../../../lambda/handlerSequelizeMiddleware";
import { PersonRepository } from "../../../repositories/Person";

export const handler = async (event) => {
  let db;
  try {
    console.log("Post Person endpoint event: ", event);

    const parsedBody = event.body && JSON.parse(event.body);
    db = await initDb();
    const personService = new PersonService(db);
    const data = await personService.save(parsedBody);

    if (!data) {
      return {
        statusCode: 404,
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        data,
      }),
    };
  } catch (error) {
    console.log("Error at post Person request: ", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        ...error,
        message: "Something went wrong: " + error.message,
      }),
    };
  } finally {
    if (db) {
      await db.connectionManager.close();
    }
  }
};

class PersonService {
  someProperty = "value";
  someOtherProperty = 0;

  constructor(db) {
    this.db = db;
  }

  async save(person) {
    const personRepository = new PersonRepository(this.db);

    return await personRepository.save(person);
  }
}
`;

    expect(formattedCode).toEqual(expectedCode);
  });
});
