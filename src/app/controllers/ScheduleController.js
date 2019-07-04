import { startOfDay, endOfDay, parseISO } from 'date-fns'; // Inporta funções responsáveis por realizar operações com as datas.
import { Op } from 'sequelize'; // Importa os operadores do sequelize;
import Appointment from '../models/Appointment';
import User from '../models/User';

class ScheduleCotroller {
  /**
   * Método index.
   * Este método lista os Appointments do Provider.
   * @param {*} req
   * @param {*} res
   */
  async index(req, res) {
    /* Lista os appointments de acordo com o req.userId e canceled_at = null */
    const checkUserProvider = await User.findOne({
      where: { id: req.userId, provider: true },
    });

    /* Verifica se retorno um provider, caso não retorna um erro 401 */
    if (!checkUserProvider) {
      return res.status(401).json({ error: 'User is not a provider' });
    }

    /* Desestrutura a informação da data caso tenha sido enviada como parâmetro,
    caso não tenha sido informada é considerada o dia atual. */
    const { date = new Date() } = req.query;
    const parseDate = parseISO(date);

    /* Retorna o registro do banco de dados onde provider_id=req.userId,
    canceled_at=null e date between [startOfDay,endOfDay]. */
    const appointments = await Appointment.findAll({
      where: {
        provider_id: req.userId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(parseDate), endOfDay(parseDate)],
        },
      },
      order: ['date'],
    });

    return res.json(appointments);
  }
}

export default new ScheduleCotroller();
