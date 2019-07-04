import File from '../models/File';

class FileController {
  async store(req, res) {
    /* Desestrutura o objeto req.file para pegar originalname e o filename do
    do arquivo que está no corpo da requisição. */
    const { originalname: name, filename: path } = req.file;

    /* Criar o arquivo na base de dados e retorna o arquivo. */
    const file = await File.create({
      name,
      path,
    });

    /* Retorna o arquivo criado no formato json.  */
    return res.json(file);
  }
}

export default new FileController();
