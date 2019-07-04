import multer from 'multer';
import crypto from 'crypto';
import { extname, resolve } from 'path';

/**
 * Exporta o objeto de configuração
 */
export default {
  /* storage configura como o multer irá guardar os arquivos */
  storage: multer.diskStorage({
    destination: resolve(__dirname, '..', '..', 'tmp', 'uploads'),
    filename: (req, file, cb) => {
      /* Gera um valor randomico de 16 bytes */
      crypto.randomBytes(16, (err, res) => {
        if (err) return cb(err);
        /* Se ocorreu tudo bem retorna o nome do arquivo composto do valor da
        da resposta em hex e sua extenção original */
        return cb(null, res.toString('hex') + extname(file.originalname));
      });
    },
  }),
};
