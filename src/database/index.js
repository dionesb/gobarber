import Sequelize from 'sequelize'; // Importação do Sequelize.
import mongoose from 'mongoose';
import User from '../app/models/User'; // Importação do Model User.
import File from '../app/models/File'; // Importação do Model File.
import Appointment from '../app/models/Appointment'; // Importação do Model Appointment.
import databaseConfig from '../config/database'; // Importação das configurações.
// do banco de dados.

const models = [User, File, Appointment]; // Array de models.

/**
 * Classe Database.
 * Esta classe é utilizada para carregar todos os models da aplicação e criar a
 * conexão com o banco de dados.
 */
class Database {
  /**
   * Método construtor da classe Database.
   */
  constructor() {
    this.init();
    this.mongo();
  }

  /**
   * Método responsável por fazer a conexão com a base de dados e carregar os
   * models.
   */
  init() {
    /* Obtém uma conexão com o banco de dados */
    this.connections = new Sequelize(databaseConfig);

    /* Percorre todos os models, chamando os métodos init e o associate caso
    exista, passando a conexão e models respectivamente. */
    models
      .map(model => model.init(this.connections))
      .map(
        model => model.associate && model.associate(this.connections.models)
      );
  }

  /**
   * Método responsável por fazer a conexão com o banco de dados mongodb
   */
  mongo() {
    this.mongoConnection = mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useFindAndModify: true,
    });
  }
}

/* Exporta a classe Database() */
export default new Database();
