import jwt from 'jsonwebtoken'; // Imporatção do jwt, reponsável por verificar o token
import { promisify } from 'util';

import authConfig from '../../config/auth'; // Importa o arquivo de configurações de autenticação

/**
 * Middleware responsável por autenticar o usuário.
 */
export default async (req, res, next) => {
  /* Obtém o token localizado no header da requisição */
  const authHeader = req.headers.authorization;

  /* Verifica se o token existe. Caso não exista retorna um erro 401. */
  if (!authHeader) {
    return res.status(401).json({ error: 'Token not provider' });
  }

  /* Separa o Bearer do Token */
  const [, token] = authHeader.split(' ');

  try {
    /* Transforma a requisição em uma promissa e aguarda a resposta da verificação
    do token */
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);

    /* Insere o id do user no corpo da requisição */
    req.userId = decoded.id;

    /* Continua... */
    return next();
  } catch (err) {
    /* Caso o token seja inválido retorna um erro 401 */
    return res.status(401).json({ error: 'Token invalid' });
  }
};
