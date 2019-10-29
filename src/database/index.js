import Sequelize from 'sequelize';
import mongoose from 'mongoose';

import User from '../app/models/User';
import Student from '../app/models/Student';
import File from '../app/models/File';
import Plan from '../app/models/Plan';
import Registration from '../app/models/Registration';

import databaseConfig from '../config/database';

const models = [User, Student, File, Plan, Registration];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }

  mongo() {
    this.mongoConnection = mongoose.connect(
      'mongodb://192.168.99.100:27017/gympoint',
      {
        useNewUrlParser: true,
        useFindAndModify: true,
        useUnifiedTopology: true,
      }
    );
  }
}

export default new Database();
