import 'fastify';
import { FastifyRequest } from 'fastify';

declare module 'fastify' {
	interface FastifyInstance {
		config: {
			NODE_ENV: string;
			EXAMPLE: string;
		};
	}
	interface FastifyRequest {
		params: {
			obj: string;
		};
	}
}
