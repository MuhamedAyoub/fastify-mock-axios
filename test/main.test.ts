import { FastifyApp } from '../main';
import axios, { AxiosResponse } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import tap from 'tap';
/*
Use Json server for testing incoming data from axios 
replacing the env file while changing the node environment 

Check the package.json for more details 

*/
tap.test('Start testing .... ', async (t) => {
	const fastify = await FastifyApp();
	await fastify.listen();

	t.test('Testing Success GET / path', async (t) => {
		try {
			// Testing your endpoints with inject
			const response = await fastify.inject({
				url: '/',
				method: 'GET',
			});
			//! second solution
			/* 
			const response  = await fetch( "http://localhost:" +  fastify.server.address().port)


			
			*/
			t.strictSame(response.statusCode, 200);
			t.strictSame(
				JSON.parse(response.body),
				{
					message: 'Hello World',
				},
				'Should return Hello World'
			);
		} catch (e) {
			fastify.log.error('Error starting server:', e);
		} finally {
			t.end();
		}
	});

	t.test('Testing Success GET /data path', async (t) => {
		try {
			const response = await fastify.inject({
				url: '/data/users',
				method: 'GET',
			});
			t.strictSame(response.statusCode, 200);
			t.strictSame(
				JSON.parse(response.body),
				{
					data: [
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
				},
				'Should return data'
			);
			t.teardown(async () => await fastify.close());
			t.end();
		} catch (e) {
			fastify.log.error('Error starting server:', e);
		} finally {
			t.end();
		}
	});
	t.test('Testing Error GET /data path', async (t) => {
		try {
			const response = await fastify.inject({
				url: '/data/nothing',
				method: 'GET',
			});
			t.strictSame(response.statusCode, 500);
			t.end();
		} catch (e) {
			fastify.log.error('Error starting server:', e);
		} finally {
			t.end();
		}
	});
	t.test('Testing Axios ', async (t) => {
		// Code 200
		const mock = new MockAdapter(axios);
		mock.onGet('/data/users').reply(200, {
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
		const response = await axios.get('/data/users');
		t.strictSame(response.status, 200);
		t.strictSame(response.data, {
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
	t.test('Testing Axios Error', async (t) => {
		// Code 500
		const mock = new MockAdapter(axios);
		mock.onGet('/data/users').reply(500, {
			error: 'Internal Server Error',
		});
		try {
			const response = await axios.get('/data/users');
		} catch (e: unknown) {
			//@ts-ignore
			t.strictSame(e.response.status, 500);
		}
	});
	t.test('Testing Axios not found', async (t) => {
		// Code 404
		const mock = new MockAdapter(axios);
		mock.onGet('/data/users').reply(404, {});
		try {
			const response = await axios.get('/data/users');
		} catch (e) {
			//@ts-ignore
			t.strictSame(e.response.status, 404);
		}
	});
});
