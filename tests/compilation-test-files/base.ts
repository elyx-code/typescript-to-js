import { v4 as uuidv4 } from 'uuid';
// @ts-ignore
import { QueryTypes, Sequelize } from 'sequelize';
// @ts-ignore
import { DefaultPayloadType } from './utils';

export abstract class BaseService<T extends DefaultPayloadType> {
  db: Sequelize;
  abstract tableName: string;

  constructor(sequelize: Sequelize) {
    this.db = sequelize;
  }

  abstract getSingle(id: string): Promise<any>;

  async getMany(filters: Object): Promise<any> {
    const results = await this.db.query(`SELECT * FROM "${this.tableName}";`, {
      type: QueryTypes.SELECT,
    });

    return results;
  }

  dataToInsertQuery(data: T, tableName: string): string {
    const now = Date.now();

    const overwrittenData: T = {
      ...data,
      createdAt: now,
      updatedAt: now,
      version: 1,
      id: uuidv4(),
    };

    const columnNamesStringToInsewrt = Object.keys(overwrittenData).map(
      key => `"${key}"`,
    );

    const valuesToInsert = Object.keys(overwrittenData).map(key => {
      const value = overwrittenData[key];

      if (key === 'createdAt' || key === 'updatedAt') {
        return `to_timestamp(${overwrittenData[key]} / 1000.0)`;
      }

      switch (typeof value) {
        case 'boolean':
        case 'number':
          return `${overwrittenData[key]}`;
        default:
          return `'${overwrittenData[key]}'`;
      }
    });

    return `INSERT INTO "${this.tableName}" (${columnNamesStringToInsewrt.join(
      ', ',
    )})
        VALUES (${valuesToInsert.join(', ')})
        RETURNING *;`;
  }

  async save(data: T): Promise<any> {
    const results = (
      await this.db.query(this.dataToInsertQuery(data, this.tableName), {
        type: QueryTypes.INSERT,
      })
    )[0];

    // @ts-ignore For some reason it thinks this value is a number, but it is actually an object
    return results[0];
  }

  dataToUpdateQuery(id: string, data: T): string {
    const now = Date.now();

    const overwrittenData: T = {
      ...data,
      updatedAt: now,
    };

    const listOfColumnsToUpdate = Object.keys(overwrittenData).map(key => {
      const value = overwrittenData[key];

      if (key === 'updatedAt') {
        return `"${key}" = to_timestamp(${overwrittenData[key]} / 1000.0)`;
      }

      switch (typeof value) {
        case 'boolean':
        case 'number':
          return `"${key}" = ${overwrittenData[key]}`;
        default:
          return `"${key}" = '${overwrittenData[key]}'`;
      }
    });

    const queryString = listOfColumnsToUpdate.join(', ');

    return `UPDATE "${this.tableName}"
        SET ${queryString}
        WHERE id = '${id}'
        RETURNING *;`;
  }

  async update(id: string, data: T) {
    if (!Object.keys(data)) {
      return this.getSingle(id);
    }

    const results = (
      await this.db.query(this.dataToUpdateQuery(id, data), {
        type: QueryTypes.UPDATE,
      })
    )[0];

    // @ts-ignore For some reason it thinks this value is a number, but it is actually an object
    return results[0];
  }
}
