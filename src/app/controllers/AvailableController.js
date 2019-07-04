import {
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  setSeconds,
  format,
  isAfter,
} from 'date-fns';
import { Op } from 'sequelize';
import Appointment from '../models/Appointment';
import User from '../models/User';

class AvailableController {
  /**
   * Mátodo que lista os Providers que estão disponíveis.
   * @param {*} req
   * @param {*} res
   */
  async index(req, res) {
    /* Obtém date passado como parâmetro na rota. */
    const { date } = req.query;

    /* Verifica se date existe. Senão retorna um erro 400. */
    if (!date) {
      return res.status(400).json({ error: 'Invalid date' });
    }

    /* Transforma o valor informado em Inteiro. */
    const searchDate = Number(date);

    /* Verifica se o Provider existe */
    const userProvider = await User.findByPk(req.params.providerId);

    /* Se não existir retorna um erro 400. */
    if (!userProvider) {
      return res.status(400).json({ error: 'This provider does not exist.' });
    }

    const appointments = await Appointment.findAll({
      where: {
        provider_id: req.params.providerId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
        },
      },
    });

    /* Todos os horário que um Provider possui. */
    const schedule = [
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
      '18:00',
      '19:00',
    ];

    /* Este objeto conterá as datas disponíveis do Provider. */
    const available = schedule.map(time => {
      const [hour, minute] = time.split(':'); // separa horas de minutos
      const value = setSeconds(
        setMinutes(setHours(searchDate, hour), minute),
        0
      );

      return {
        time,
        value: format(value, "yyyy-MM-dd'T'HH:mm:ssxxx"),
        available:
          isAfter(value, new Date()) &&
          !appointments.find(a => format(a.date, 'HH:mm') === time),
      };
    });

    return res.json(available);
  }
}

export default new AvailableController();
