import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs'; // Importa bcrypt responsável por verificar o password

/**
 * Model User.
 * Utilizado para manipular os dados de Usuário.
 */
class User extends Model {
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
        email: Sequelize.STRING,
        password: Sequelize.VIRTUAL, // Campo que não existe na basse de dados
        password_hash: Sequelize.STRING,
        provider: Sequelize.BOOLEAN,
      },
      {
        sequelize,
      }
    );

    /* "addHook" Instrução sempre executada antes de uma ação no model.
    Sempre antes de criar um novo usuário, será feito o hash do password */
    this.addHook('beforeSave', async user => {
      if (user.password) {
        user.password_hash = await bcrypt.hash(user.password, 8);
      }
    });

    return this;
  }

  /**
   * Associa tabela de Usuários com a tabela Files, onde cada usuário terá um
   * file.
   * @param {*} models
   */
  static associate(models) {
    this.belongsTo(models.File, { foreignKey: 'avatar_id', as: 'avatar' });
  }

  /**
   * Verifica o password informado com o hash.
   * @param {*} password
   */
  checkPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }
}

/* Exporta o Model User */
export default User;
