import * as Yup from 'yup'; // importa todas as funções da extensão Yup
import User from '../models/User';

class UserController {
  async store(req, res) {
    /* Definições das validações de um objeto, onde é passado o formato que o
    objeto precisa ter, neste caso o req.body */
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    /* Valida o objeto req.body conforme o schema, caso seja falso, retorna um
    erro 400 */
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    /* Busca usuário para verificar se já existe na base de dados. */
    const userExists = await User.findOne({ where: { email: req.body.email } });

    /* Caso já exista retorna erro 400. */
    if (userExists) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    /* Se usuário ainda não existir criar um novo com os dados informados, e
    retornar apenas os dados que a view precisa mostrar. */
    const { id, name, email, provider } = await User.create(req.body);

    /* Retorna as informações o usuário criado em formato Json. */
    return res.json({
      id,
      name,
      email,
      provider,
    });
  }

  async update(req, res) {
    /* Definições das validações de um objeto, onde é passado o formato que o
    objeto precisa ter, neste caso o req.body */
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        /* Verifica se foi passado o campo oldPassword, caso sim o campo
        password torna necessário */
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      /* Verifica se o valor do campo confirmPassword é igual ao valor do campo
      password quando o campo password existir */
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    /* Valida o objeto req.body conforme o schema, caso seja falso, retorna um
    erro 400 */
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    /* Desestruturação para obtenção do email e oldPassword do corpo da requisição */
    const { email, oldPassword } = req.body;

    /* Busca usuário com o id informado */
    const user = await User.findByPk(req.userId);

    /* Caso o email seja diferente ele verifica se usuário com este novo email
    já existe */
    if (email !== user.email) {
      const userExists = await User.findOne({ where: { email } });

      /* Caso o usário já existe retorna um erro 400 */
      if (userExists) {
        return res.status(400).json({ error: 'User already exists.' });
      }
    }

    /* Verifica se oldPassword foi informado e se é igual ao password atual do
    user, caso não seja retorna um erro 401 */
    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    /* Altera usuário com os novo dados informadose, e retornar apenas os
    dados que o usuário precisa visualizar */
    const { id, name, provider } = await user.update(req.body);

    /* Retorna as informações atualizadas em formato Json */
    return res.json({
      id,
      name,
      email,
      provider,
    });
  }
}

export default new UserController();
