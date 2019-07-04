import Notification from '../schemas/Notification';
import User from '../models/User';

class NotificationController {
  async index(req, res) {
    /* Verifica se o usuário passado como provider realmente é um provider. */
    const checkIsProvider = await User.findOne({
      where: { id: req.userId, provider: true },
    });

    /* Se caso não for um provider retorna um erro 401. */
    if (!checkIsProvider) {
      return res
        .status(401)
        .json({ error: 'Only providers can load notifications' });
    }

    /* Pega a lista de Notifications em ordem decrescente com limite de 20 notificações. */
    const notifications = await Notification.find({
      user: req.userId,
    })
      .sort({ createdAt: 'desc' })
      .limit(20);

    /* Retorna a lista de Notifications em formato Json. */
    return res.json(notifications);
  }

  /**
   * Método responsável por atualizar uma Notification.
   * @param {*} req
   * @param {*} res
   */
  async update(req, res) {
    // const notification = await Notification.findById(req.params.id);

    /* Procura a Notification informada por parâmetro na rota e atualiza a propriedade
    read para true. Passando como terceiro parâmetro o objeto { new: true } a função
    retorna o registro alterado. */
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    return res.json(notification);
  }
}

export default new NotificationController();
