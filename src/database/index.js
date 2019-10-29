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
    this.connection = new Sequelize(databaseConfig);

    const mongoURI = 'mongodb://192.168.99.100:27017/gympoint';

    this.mongoConnection = mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: true,
    });

    this.init();
    this.associate();
  }

  init() {
    models.forEach(model => model.init(this.connection));
  }

  associate() {
    models.forEach(model => {
      if (model.associate) {
        model.associate(this.connection.models);
      }
    });
  }
}

export default new Database();
