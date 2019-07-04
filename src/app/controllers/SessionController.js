import jwt from 'jsonwebtoken'; // Importação do jwt utilizado para gerar o token.
import User from '../models/User'; // Importação do Model User.
import authConfig from '../../config/auth'; // Importação das configuraçõe de
// autenticação.

/**
 * Classe SessionController.
 * Esta classe é responsável por criar uma sessão para o Usuário.
 */
class SessionController {
  /**
   * Este método é responsável pela criação da sessão.
   * @param {*} req
   * @param {*} res
   */
  async store(req, res) {
    /* Desestruturação para obtenção do email e password do corpo da requisição */
    const { email, password } = req.body;

    /* Verifica se existe um usúario com o email passado. Caso não exista retorna
    um erro 401 */
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'User not found' });
    }

    /* Verifica se password passado no corpo da requisição bate com o cadastrado.
    Caso não seja iguais é retornado um erro 401. */
    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    /* Desestrutura o objeto user para obter id e name */
    const { id, name } = user;

    /* Responde com os dados do usuário e o token criado para atutenticação */
    return res.json({
      user: {
        id,
        name,
        email,
      },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
