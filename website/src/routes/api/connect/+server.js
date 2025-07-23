import { PostgresSystemAnalyzer } from '$lib/server/analyzers/postgresql/system_analyzer';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	try {
		const { credentials } = await request.json();
		const analyzer = new PostgresSystemAnalyzer(credentials);
		const analysis = await analyzer.analyzeAll();
		await analyzer.disconnect();

		return json({
			success: true,
			analysis
		});
	} catch (error) {
		console.error('Error refreshing analysis:', error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error occurred'
			},
			{ status: 400 }
		);
	}
}
