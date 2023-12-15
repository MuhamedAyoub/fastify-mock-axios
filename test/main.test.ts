import axios from 'axios';
import { FastifyApp } from '../main';
import MockAdapter from 'axios-mock-adapter';
import { FastifyInstance } from 'fastify';

describe('fastify should start', () => {
	const axiosUrl = 'http://localhost:5200/users';
	let fastify: FastifyInstance;
	beforeAll(async () => {
		fastify = await FastifyApp();

		fastify.ready();
	});

	const MockAxios = new MockAdapter(axios);
	it('GET /data should return user data with status 200', async () => {
		// Mock axios response
		MockAxios.onGet(axiosUrl).reply(200, {
			users: [
				{
					id: 1,
					name: 'John',
				},
				{
					id: 2,
					name: 'Jane2',
				},
				{
					id: 3,
					name: 'Jane3',
				},
			],
		});
		const response = await fastify.inject({
			method: 'GET',
			url: '/data',
		});

		// Assertions
		expect(response.statusCode).toBe(200);
		expect(JSON.parse(response.body)).toEqual({
			users: [
				{
					id: 1,
					name: 'John',
				},
				{
					id: 2,
					name: 'Jane2',
				},
				{
					id: 3,
					name: 'Jane3',
				},
			],
		});
	});
	it('GET /data should handle API error with status 404', async () => {
		MockAxios.onGet(axiosUrl).reply(404, {
			status: 404,
			data: {
				message: 'User not found',
			},
		});
		// Make the request
		const response = await fastify.inject({
			method: 'GET',
			url: '/data',
		});

		expect(response.statusCode).toBe(404);
	});
	it('GET /data should handle network error', async () => {
		// Mock axios network error
		MockAxios.onGet(axiosUrl).reply(500, {
			message: 'Network error',
		});
		// Make the request
		const response = await fastify.inject({
			method: 'GET',
			url: '/data',
		});
		// Assertions
		expect(response.statusCode).toBeGreaterThanOrEqual(500);
	});

	afterAll(async () => {
		await fastify.close();
	});
});
