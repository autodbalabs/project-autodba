import postgres from 'postgres';

/** @typedef {Object} DatabaseCredentials
 * @property {string} host
 * @property {string} port
 * @property {string} database
 * @property {string} username
 * @property {string} password
 */

/** @typedef {Object} PgPlanNode
 * @property {string} NodeType
 * @property {string} RelationName
 * @property {number} PlanRows
 * @property {PgPlanNode[]} Plans
 * @property {string} IndexName
 * @property {boolean} ParallelAware
 * @property {string} JoinType
 * @property {number} TotalCost
 * @property {string[]} Filter
 */

/** @typedef {Object} QueryPlan
 * @property {PgPlanNode} plan_json
 * @property {number} planning_time_ms
 * @property {number} estimated_cost
 * @property {boolean} uses_parallel
 * @property {string[]} indexes_used
 */

/** @typedef {Object} QueryStats
 * @property {number} rows_affected
 * @property {number} sequential_scans
 * @property {number} index_scans
 * @property {string[]} indexes_used
 * @property {number} temp_files_created
 * @property {number} temp_bytes_written
 * @property {number} shared_hit_blocks
 * @property {number} shared_read_blocks
 * @property {number} shared_dirtied_blocks
 * @property {number} shared_written_blocks
 */

/** @typedef {Object} TableImpact
 * @property {string} table_name
 * @property {string} operation
 * @property {number} estimated_rows
 * @property {number} estimated_cost
 * @property {string[]} filters
 */

/** @typedef {Object} QueryAnalysis
 * @property {QueryPlan} queryPlan
 * @property {QueryStats} queryStats
 * @property {TableImpact[]} tableImpact
 * @property {string[]} recommendations
 */

export class PostgresQueryAnalyzer {
	/** @type {postgres.Sql<{}>} */
	#sql;

	/**
	 * @param {DatabaseCredentials} credentials
	 */
	constructor(credentials) {
		this.#sql = postgres({
			host: credentials.host,
			port: parseInt(credentials.port),
			database: credentials.database,
			username: credentials.username,
			password: credentials.password,
			ssl: {
				rejectUnauthorized: false
			},
			max: 1
		});
	}

	async disconnect() {
		await this.#sql.end();
	}

	/**
	 * Get the execution plan for a query without running it
	 * @param {string} query
	 * @returns {Promise<QueryPlan>}
	 */
	async getQueryPlan(query) {
		const [result] = await this.#sql.unsafe(`
            EXPLAIN (FORMAT JSON, COSTS TRUE)
            ${query}
        `);

		const planNode = result?.['QUERY PLAN']?.[0]?.Plan ?? {};
		const indexes = [];
		const isParallel = this.#checkParallel(planNode);

		this.#collectIndexes(planNode, indexes);

		return {
			plan_json: planNode,
			planning_time_ms: result[0]?.['Planning Time'] ?? 0,
			estimated_cost: planNode?.['Total Cost'] ?? 0,
			uses_parallel: isParallel,
			indexes_used: indexes
		};
	}

	/**
	 * Recursively check if the plan uses parallel processing
	 * @param {PgPlanNode} node
	 * @returns {boolean}
	 */
	#checkParallel(node) {
		if (!node) return false;
		if (node['Parallel Aware']) return true;
		if (node.Plans) {
			return node.Plans.some((plan) => this.#checkParallel(plan));
		}
		return false;
	}

	/**
	 * Recursively collect all indexes used in the plan
	 * @param {PgPlanNode} node
	 * @param {string[]} indexes
	 */
	#collectIndexes(node, indexes) {
		if (!node) return;
		if (node['Node Type']?.includes('Index') && node['Index Name']) {
			indexes.push(node['Index Name']);
		}
		if (node.Plans) {
			node.Plans.forEach((plan) => this.#collectIndexes(plan, indexes));
		}
	}

	/**
	 * Identify tables impacted by the query
	 * @param {PgPlanNode} planNode
	 * @returns {TableImpact[]}
	 */
	#analyzeTableImpact(planNode) {
		const impacts = [];

		const traversePlan = (node) => {
			if (node['Relation Name']) {
				impacts.push({
					table_name: node['Relation Name'],
					operation: node['Node Type'],
					estimated_rows: node['Plan Rows'] || 0,
					estimated_cost: node['Total Cost'] || 0,
					filters: node['Filter'] || []
				});
			}

			if (node.Plans) {
				node.Plans.forEach(traversePlan);
			}
		};

		traversePlan(planNode);
		return impacts;
	}

	/**
	 * Analyze a query and provide recommendations
	 * @param {string} query
	 * @returns {Promise<QueryAnalysis>}
	 */
	async analyzeQuery(query) {
		const queryPlan = await this.getQueryPlan(query);
		const tableImpact = this.#analyzeTableImpact(queryPlan.plan_json);

		return {
			queryPlan,
			tableImpact,
			recommendations: this.#generateRecommendations(queryPlan, tableImpact)
		};
	}

	/**
	 * Generate optimization recommendations based on query analysis
	 * @param {QueryPlan} queryPlan
	 * @param {TableImpact[]} tableImpact
	 * @returns {string[]}
	 */
	#generateRecommendations(queryPlan, tableImpact) {
		const recommendations = [];

		// Check for sequential scans on large tables
		for (const impact of tableImpact) {
			if (impact.operation === 'Seq Scan' && impact.estimated_rows > 1000) {
				recommendations.push(
					`Consider adding an index for table ${impact.table_name} as it performs a sequential scan on ${impact.estimated_rows} rows`
				);
			}
		}

		// Check for high cost operations
		for (const impact of tableImpact) {
			if (impact.estimated_cost > 1000) {
				recommendations.push(
					`High-cost operation (${impact.estimated_cost}) on table ${impact.table_name}. Consider optimizing the query or adding indexes.`
				);
			}
		}

		// Check if parallel processing could help
		if (!queryPlan.uses_parallel && tableImpact.some((t) => t.estimated_rows > 10000)) {
			recommendations.push(
				'Query might benefit from parallel processing. Consider enabling parallel query execution.'
			);
		}

		// Check for unused indexes
		if (queryPlan.indexes_used.length === 0) {
			recommendations.push(
				'No indexes are used in this query. Consider adding appropriate indexes for frequently filtered columns.'
			);
		}

		return recommendations;
	}
}
