import { unstable_dev } from 'wrangler';
import type { UnstableDevWorker } from 'wrangler';
import { describe, expect, it, beforeAll, afterAll } from 'vitest';

describe('Worker', () => {
	let worker: UnstableDevWorker;

	beforeAll(async () => {
		worker = await unstable_dev('src/index.ts', {
			experimental: { disableExperimentalWarning: true },
		});
	});

	afterAll(async () => {
		await worker.stop();
	});

	it('should return healthcheck message', async () => {
		const res = await worker.fetch('/healthcheck', { method: 'POST' });
		const json = await res.json();
		expect(res.status).toBe(200);
		expect(json).toEqual({ message: 'worker is running' });
	});

	it('should return embeddings', async () => {
		const requestPayload = { text: 'test text' };
		const res = await worker.fetch('/embedding', {
			method: 'POST',
			body: JSON.stringify(requestPayload),
			headers: {
				'Content-Type': 'application/json',
			},
		});
		const json: any = await res.json();
		expect(res.status).toBe(200);
		expect(json.vectors.length).toBe(768);
	});

});
