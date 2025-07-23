import postgres from 'postgres';

/** @typedef {Object} DatabaseCredentials
 * @property {string} host
 * @property {string} port
 * @property {string} database
 * @property {string} username
 * @property {string} password
 */

/** @typedef {Object} DatabaseSize
 * @property {string} database_name
 * @property {string} size_pretty
 * @property {number} size_bytes
 */

/** @typedef {Object} MemoryConfig
 * @property {string} name
 * @property {string} setting
 * @property {string} unit
 * @property {string} description
 */

/** @typedef {Object} ParallelConfig
 * @property {string} name
 * @property {string} setting
 * @property {string} description
 */

/** @typedef {Object} SystemInfo
 * @property {number} max_connections
 * @property {string} version
 * @property {string} server_encoding
 * @property {string} data_directory
 * @property {number} cpu_count
 * @property {string} total_memory
 */

/** @typedef {Object} TableStats
 * @property {string} table_name
 * @property {number} total_size_bytes
 * @property {string} total_size_pretty
 * @property {number} row_count
 * @property {number} dead_rows
 * @property {Date} last_vacuum
 * @property {Date} last_analyze
 */

export class PostgresSystemAnalyzer {
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
			// ssl: process.env.NODE_ENV === 'production',
			ssl: {
				rejectUnauthorized: false
			},
			max: 1
		});
	}

	async disconnect() {
		await this.#sql.end();
	}

	/** @returns {Promise<DatabaseSize>} */
	async getDatabaseSize() {
		const [result] = await this.#sql`
            SELECT
                current_database() as database_name,
                pg_size_pretty(pg_database_size(current_database())) as size_pretty,
                pg_database_size(current_database()) as size_bytes
            FROM pg_database
            WHERE datname = current_database()
        `;
		return result;
	}

	/** @returns {Promise<MemoryConfig[]>} */
	async getMemoryConfiguration() {
		return this.#sql`
            SELECT name, setting, unit, short_desc as description
            FROM pg_settings
            WHERE name IN (
                'work_mem',
                'maintenance_work_mem',
                'effective_cache_size',
                'shared_buffers',
                'temp_buffers',
                'wal_buffers'
            )
        `;
	}

	/** @returns {Promise<ParallelConfig[]>} */
	async getParallelConfiguration() {
		return this.#sql`
            SELECT name, setting, short_desc as description
            FROM pg_settings
            WHERE name IN (
                'max_parallel_workers_per_gather',
                'max_parallel_workers',
                'max_parallel_maintenance_workers',
                'parallel_leader_participation',
                'min_parallel_table_scan_size',
                'min_parallel_index_scan_size'
            )
        `;
	}

	/** @returns {Promise<SystemInfo>} */
	async getSystemInformation() {
		const [result] = await this.#sql`
            SELECT 
                (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections,
                version() as version,
                (SELECT setting FROM pg_settings WHERE name = 'server_encoding') as server_encoding,
                (SELECT setting FROM pg_settings WHERE name = 'data_directory') as data_directory,
                (
                    SELECT setting::int 
                    FROM pg_settings 
                    WHERE name = 'max_parallel_workers'
                ) as cpu_count,
                (
                    SELECT pg_size_pretty(setting::bigint * 8192) 
                    FROM pg_settings 
                    WHERE name = 'shared_buffers'
                ) as total_memory
        `;
		return result;
	}

	/** @returns {Promise<TableStats[]>} */
	async getTableStatistics() {
		return this.#sql`
            SELECT
                s.relname as table_name,
                pg_total_relation_size(c.oid) as total_size_bytes,
                pg_size_pretty(pg_total_relation_size(c.oid)) as total_size_pretty,
                n_live_tup as row_count,
                n_dead_tup as dead_rows,
                last_vacuum,
                last_analyze
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            JOIN pg_stat_user_tables s ON s.relid = c.oid
            WHERE n.nspname = 'public'
            AND c.relkind = 'r'
            ORDER BY pg_total_relation_size(c.oid) DESC
        `;
	}

	/** @returns {Promise<Object>} */
	async analyzeAll() {
		const [databaseSize, memoryConfig, parallelConfig, systemInfo, tableStats] = await Promise.all([
			this.getDatabaseSize(),
			this.getMemoryConfiguration(),
			this.getParallelConfiguration(),
			this.getSystemInformation(),
			this.getTableStatistics()
		]);

		return {
			databaseSize,
			memoryConfig,
			parallelConfig,
			systemInfo,
			tableStats,
			recommendations: this.generateRecommendations({
				databaseSize,
				memoryConfig,
				parallelConfig,
				systemInfo,
				tableStats
			})
		};
	}

	/**
	 * Generate optimization recommendations based on collected metrics
	 * @param {Object} metrics
	 * @returns {string[]}
	 */
	generateRecommendations(metrics) {
		const recommendations = [];
		const workMem = parseInt(
			metrics.memoryConfig.find((c) => c.name === 'work_mem')?.setting || '0'
		);
		const maintenanceWorkMem = parseInt(
			metrics.memoryConfig.find((c) => c.name === 'maintenance_work_mem')?.setting || '0'
		);
		const maxParallelWorkers = parseInt(
			metrics.parallelConfig.find((c) => c.name === 'max_parallel_workers')?.setting || '0'
		);

		// Database size recommendations
		if (metrics.databaseSize.size_bytes > 1024 * 1024 * 1024 * 100) {
			// 100GB
			recommendations.push('Consider partitioning large tables for better query performance');
		}

		// Memory recommendations
		if (workMem < 4096) {
			recommendations.push(
				'Consider increasing work_mem for better query performance (current: ' + workMem + 'kB)'
			);
		}
		if (maintenanceWorkMem < 64000) {
			recommendations.push(
				'Consider increasing maintenance_work_mem for faster vacuum and index creation'
			);
		}

		// Parallel processing recommendations
		if (maxParallelWorkers < metrics.systemInfo.cpu_count) {
			recommendations.push('max_parallel_workers could be increased to match available CPU cores');
		}

		// Table-specific recommendations
		for (const table of metrics.tableStats) {
			if (table.dead_rows > table.row_count * 0.2) {
				recommendations.push(
					`Table ${table.table_name} has high dead tuple ratio (${Math.round((table.dead_rows / table.row_count) * 100)}%). Consider running VACUUM`
				);
			}
			if (
				!table.last_analyze ||
				new Date(table.last_analyze).getTime() < Date.now() - 7 * 24 * 60 * 60 * 1000
			) {
				recommendations.push(
					`Table ${table.table_name} hasn't been analyzed in over a week. Consider running ANALYZE`
				);
			}
		}

		return recommendations;
	}
}
