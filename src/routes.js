import { Router } from 'express';
import multer from 'multer'; // Importação do multer, responsável por fazer uploads de arquivos.
import multerConfig from './config/multer'; // Importação das configurações do multer.

/* Importação dos controllers */
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import ProviderController from './app/controllers/ProviderController';
import AppointmentController from './app/controllers/AppointmentController';
import ScheduleController from './app/controllers/ScheduleController';
import NotificationController from './app/controllers/NotificationController';
import AvailableController from './app/controllers/AvailableController';
import FileController from './app/controllers/FileController';

/* Importação do Middleware responsável por fazer a autenticação */
import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

/**
 * Rota que cria um novo usuário.
 */
routes.post('/users', UserController.store);

/**
 * Rota que cria uma sessão para o usuário.
 */
routes.post('/sessions', SessionController.store);

/**
 * A partir deste ponto todas as requisições serão autenticadas.
 */
routes.use(authMiddleware);

/**
 * Rota responsável por autualizar um usuário.
 */
routes.put('/users', UserController.update);

/**
 * Rota responsável por listar todos os prestadores de serviços.
 */
routes.get('/providers', ProviderController.index);

/**
 * Rota responsável por listar todos os prestadores de serviços.
 */
routes.get('/providers/:providerId/available', AvailableController.index);

/**
 * Rota responsável por listar todos os appointments (agendamentos) do usuário.
 */
routes.get('/appointments', AppointmentController.index);

/**
 * Rota que cria um agendamento para o usuário.
 */
routes.post('/appointments', AppointmentController.store);

/**
 * Rota que que cancela um Appointment.
 */
routes.delete('/appointments/:id', AppointmentController.delete);

/**
 * Rota responsável por listar todos os appointments (agendamentos) do provider.
 */
routes.get('/schedule', ScheduleController.index);

/**
 * Rota responsável por listar todos as Notifications.
 */
routes.get('/notifications', NotificationController.index);

/**
 * Rota responsável por atualizar as Notifications.
 */
routes.put('/notifications/:id', NotificationController.update);

/**
 * Rota responsável por fazer uploads de arquivos
 */
routes.post('/files', upload.single('file'), FileController.store);

/* Exporta routes */
export default routes;
