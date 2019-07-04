import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import User from '../models/User';
import File from '../models/File';
import Appointment from '../models/Appointment';
import Notification from '../schemas/Notification';

import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';

/**
 * Controller AppointmentController.
 * Este controller é responsável por agendar um serviço para o usuário.
 */
class AppointmentController {
  /**
   * Lista os appointments do user.
   * @param {*} req
   * @param {*} res
   */
  async index(req, res) {
    const { page = 1 } = req.query;

    /* Lista os appointments de acordo com o req.userId e canceled_at = null */
    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date', 'past', 'cancelable'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });

    /* Responde coma a lista dos Appointments no formato json. */
    return res.json(appointments);
  }

  /**
   * Método responável por criar um Appointment.
   * @param {*} req
   * @param {*} res
   */
  async store(req, res) {
    /* Definições das validações de entrada, onde é passado o formato que os
    parâmetros de entrada precisam ter. */
    const schema = Yup.object().shape({
      date: Yup.date().required(),
      provider_id: Yup.number().required(),
    });

    /* Valida o objeto req.body conforme o schema, caso seja falso, retorna um
    erro 400. */
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    /* Desestrutura o objeto req.body para pegar provider_id e date. */
    const { provider_id, date } = req.body;

    /* Verifica se o user é o mesmo que o provider. Para evitar que um user
    agende com ele memso. Se for igual retorna um erro 401 */
    if (provider_id === req.userId) {
      return res
        .status(401)
        .json({ error: 'You can not create appointments with yourself' });
    }

    /* Verifica se o usuário passado como provider realmente é um provider. */
    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    /* Se caso não for um provider retorna um erro 401. */
    if (!isProvider) {
      return res
        .status(401)
        .json({ error: 'You can only create appointments with providers' });
    }

    /* Transforma a string de data em um objeto do tipo Date do Javascript, e
    tranforma as horas em horas cheias (de hora em hora), zerando o valores de
    minutos e segundos. */
    const hourStart = startOfHour(parseISO(date));

    /* Verifica se hourStart está antes da data atual. Caso sim retorna um erro
    400. */
    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    /* Verifica se o Provider já não tem um Appointment(Agendamento) para o
    mesmo horário. */
    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    /* Caso já exista um Appointment para este horário retorna um erro 400. */
    if (checkAvailability) {
      return res
        .status(400)
        .json({ error: 'Appointment date is not available' });
    }

    /* Cria o appointment. */
    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date,
    });

    /* Pega o usuário passando o userId */
    const user = await User.findByPk(req.userId);
    /* Formata a data */
    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM', às' H:mm'h'",
      { locale: pt }
    );

    /* Notifica o Provider(Prestador de serviço) do Appointment(Agendamento) realizado */
    await Notification.create({
      content: `Novo agendamento de ${user.name} para ${formattedDate}`,
      user: provider_id,
    });

    /* Responde o Appointment criado no formato json. */
    return res.json(appointment);
  }

  /**
   * Método responsável por cancelar um Appoiontment.
   * @param {*} req
   * @param {*} res
   */
  async delete(req, res) {
    /* Busca o Appointment conforme o id passado por parâmetro. */
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });

    /* Verifica se o User é o dono do Appointment. Se não for retorna um erro
    401. */
    if (appointment.user_id !== req.userId) {
      return res.status(401).json({
        error: "You don't have permission to cancel this appointment.",
      });
    }

    /* Remove 2 horas da data do agendamento. */
    const dateWithSub = subHours(appointment.date, 2);

    /* Verifica o limite de 2 horas para cancelamento do Appointment. */
    if (isBefore(dateWithSub, new Date())) {
      return res.status(401).json({
        error: 'You can olny cancel appointments 2 hours in advance.',
      });
    }

    /* Atribui a data momento de cancelamento. */
    appointment.canceled_at = new Date();

    /* Sava o Appointment no banco */
    await appointment.save();

    await Queue.add(CancellationMail.key, {
      appointment,
    });

    return res.json(appointment);
  }
}

export default new AppointmentController();
