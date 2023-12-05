import axios from 'axios';
import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import Env from '@fastify/env';
import S from 'fluent-json-schema';

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
			path: `${__dirname}/${
				process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
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

	fastify.get('/data/:obj', async (req: FastifyRequest, rep: FastifyReply) => {
		fastify.log.info('Getting data ...');
		console.log(req.params);
		try {
			const { data } = await axios.get(
				//@ts-ignore
				`http://localhost:5200/${req.params.obj}`
			);
			return rep.code(200).send({
				data,
			});
		} catch (e) {
			fastify.log.error(e);
			return rep.code(500).send({
				error: 'Internal Server Error',
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
