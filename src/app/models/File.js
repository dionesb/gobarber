import Sequelize, { Model } from 'sequelize';

/**
 * Model File.
 * Utilizado para manipular os dados do File.
 */
class File extends Model {
  /**
   * Método init.
   * Este método é chamada automaticamente pelo Sequelize
   * @param {*} sequelize
   */
  static init(sequelize) {
    /**
     * Método init da classe Model.
     * Este método recebe como parâmetro as colunas da tabela do banco de dados,
     * referente a este model. Caso a coluna não exista na base de dados, ela
     * pode ser definida como VIRTUAL.
     */
    super.init(
      {
        name: Sequelize.STRING,
        path: Sequelize.STRING,
        url: {
          type: Sequelize.VIRTUAL,
          get() {
            return `${process.env.APP_URL}/files/${this.path}`;
          },
        },
      },
      {
        sequelize,
      }
    );

    return this;
  }
}

/* Exporta o Model User */
export default File;
