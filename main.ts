import axios from 'axios';
import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import Env from '@fastify/env';
import S from 'fluent-json-schema';
const environmentsFolder = 'environments';
export async function FastifyApp() {
	const fastify = Fastify({
		logger: {
			transport: {
				target: 'pino-pretty',
			},
		},
	});

	await fastify.register(Env, {
		dotenv: {
			path: `${__dirname}/${environmentsFolder}/${
				process.env.NODE_ENV === 'test'
					? '.env.test'
					: process.env.NODE_ENV === 'stage'
					? '.env.stage'
					: process.env.NODE_ENV === 'production'
					? '.env.prod'
					: '.env'
			}`,
		},
		schema: S.object()
			.prop('NODE_ENV', S.string().required())
			.prop('EXAMPLE', S.string().required())
			.valueOf(),
	});

	fastify.get('/', async function (req: FastifyRequest, rep: FastifyReply) {
		return rep.code(200).send({
			message: 'Hello World',
			// env: ,
		});
	});

	fastify.get('/data', async (req: FastifyRequest, rep: FastifyReply) => {
		fastify.log.info('Getting data ...');
		try {
			const response = await axios.get('http://localhost:5200/users');
			return rep.code(response.status).send(response.data);
		} catch (e) {
			//@ts-ignore
			return rep.code(e.response.status).send({
				//@ts-ignore
				error: e.message,
			});
		}
	});

	return fastify;
}

if (require.main === module) {
	const main = async () => {
		const PORT = 7000;
		const fastify = await FastifyApp();
		['SIGINT', 'SIGTERM'].forEach((signal) => {
			process.on(signal, async () => {
				await fastify.close();
				process.exit(0);
			});
		});
		try {
			await fastify.listen({
				port: PORT,
			});
		} catch (e) {
			fastify.log.error('Error starting server:', e);
			process.exit(1);
		}
	};
	main();
}
