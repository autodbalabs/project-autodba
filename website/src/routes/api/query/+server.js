import { json } from '@sveltejs/kit';
import { PostgresQueryAnalyzer } from '$lib/server/analyzers/postgresql/query_analyzer';

export async function POST({ request }) {
	try {
		const { query, credentials } = await request.json();

		if (!credentials) {
			return json(
				{
					success: false,
					error: 'Database credentials are required'
				},
				{ status: 400 }
			);
		}

		if (!query?.trim()) {
			return json(
				{
					success: false,
					error: 'Query cannot be empty'
				},
				{ status: 400 }
			);
		}

		const analyzer = new PostgresQueryAnalyzer(credentials);
		const analysis = await analyzer.analyzeQuery(query);
		await analyzer.disconnect();

		return json({
			success: true,
			analysis
		});
	} catch (error) {
		console.error('Error analyzing query:', error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error occurred'
			},
			{ status: 500 }
		);
	}
}
