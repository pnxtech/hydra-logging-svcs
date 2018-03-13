const Promise = require('bluebird');
const mongoClient = Promise.promisifyAll(require('mongodb')).MongoClient;

/**
* @name MongoDB
* @summary MongoDB helper class
* @return {undefined}
*/
class MongoDB {
  /**
  * @name constructor
  * @summary class constructor
  * @return {undefined}
  */
  constructor() {
    this._db = null;
  }

  /**
  * @name open
  * @summary Connect to MongoDB instance
  * @param {string} connectionString -
  * @return {object} promise
  */
  open(connectionString) {
    return new Promise((resolve, reject)=> {
      mongoClient.connectAsync(connectionString)
        .then((db)=> {
          this._db = db;
          resolve(db);
        })
        .catch((err)=> {
          reject(err);
        });
    });
  }

  /**
  * @name close
  * @summary Close MongoDB client connection
  * @return {undefined}
  */
  close() {
    console.log('closing db');
    this._db.close();
  }

  /**
  * @name getDB
  * @summary get a handle to the database client
  * @return {object} db - handle to db client
  */
  getDB() {
    return this._db;
  }

  /**
  * @name getCollection
  * @summary Return collection
  * @param {string} collectionName - name of collection
  * @return {object} collection
  */
  getCollection(collectionName) {
    if (!this._db) {
      return null;
    }
    return this._db.collection(collectionName);
  }

}
module.exports = new MongoDB();
