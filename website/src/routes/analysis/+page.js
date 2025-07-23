import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
	if (!browser) {
		return {
			analysis: null
		};
	}

	const credentialsJson = sessionStorage.getItem('dbCredentials');
	if (!credentialsJson) {
		throw redirect(303, '/');
	}

	const credentials = JSON.parse(credentialsJson);

	// Run analysis
	try {
		const response = await fetch('/api/connect', {
			method: 'POST',
			body: JSON.stringify({ credentials }),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const result = await response.json();
		if (!result.success) {
			throw new Error(result.error || 'Failed to analyze database');
		}

		return {
			analysis: result.analysis,
			credentials
		};
	} catch (error) {
		console.error('Failed to analyze database:', error);
		return {
			analysis: null,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
			credentials
		};
	}
}
