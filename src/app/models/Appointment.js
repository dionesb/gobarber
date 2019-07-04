import Sequelize, { Model } from 'sequelize';
import { isBefore, subHours } from 'date-fns';

/**
 * Model Appointments.
 * Utilizado para manipular os dados do Appointments.
 */
class Appointment extends Model {
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
        date: Sequelize.DATE,
        canceled_at: Sequelize.DATE,
        past: {
          type: Sequelize.VIRTUAL,
          get() {
            return isBefore(this.date, new Date());
          },
        },
        cancelable: {
          type: Sequelize.VIRTUAL,
          get() {
            return isBefore(new Date(), subHours(this.date, 2));
          },
        },
      },
      {
        sequelize,
      }
    );

    return this;
  }

  /**
   * Associa tabela de Appointments com a tabela User, onde cada appointment
   * pertence a um user.
   * @param {*} models
   */
  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    this.belongsTo(models.User, { foreignKey: 'provider_id', as: 'provider' });
  }
}

/* Exporta o Model User */
export default Appointment;
