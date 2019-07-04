import User from '../models/User'; // Importa o Model User.
import File from '../models/File'; // Importa o Model File.

class ProviderController {
  /**
   * Mátodo Index utilizado para listagem dos Providers.
   * @param {*} req
   * @param {*} res
   */
  async index(req, res) {
    const providers = await User.findAll({
      where: { provider: true },
      attributes: ['id', 'name', 'email', 'avatar_id'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return res.json(providers);
  }
}

export default new ProviderController();
