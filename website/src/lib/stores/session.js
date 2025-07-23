import { writable } from 'svelte/store';

/** @typedef {Object} DatabaseCredentials
 * @property {string} host
 * @property {string} port
 * @property {string} database
 * @property {string} username
 * @property {string} password
 */

/** @type {DatabaseCredentials} */
const DEFAULT_CREDENTIALS = {
	host: 'localhost',
	port: '5432',
	database: '',
	username: '',
	password: ''
};

/**
 * Creates a store that syncs with sessionStorage
 * @template T
 * @param {string} key - The sessionStorage key
 * @param {T} initialValue - The initial value if nothing in storage
 * @returns {import('svelte/store').Writable<T>}
 */
function createSessionStore(key, initialValue) {
	try {
		const stored = sessionStorage.getItem(key);
		const initial = stored ? JSON.parse(stored) : initialValue;
		const store = writable(initial);

		store.subscribe((value) => {
			sessionStorage.setItem(key, JSON.stringify(value));
		});

		return store;
	} catch (error) {
		console.error(`Error creating session store for key ${key}:`, error);
		return writable(initialValue);
	}
}

/**
 * Store for database credentials that syncs with sessionStorage
 * @type {import('svelte/store').Writable<DatabaseCredentials>}
 */
export const dbCredentials = createSessionStore('dbCredentials', DEFAULT_CREDENTIALS);

/**
 * Updates database credentials in the store
 * @param {Partial<DatabaseCredentials>} newCredentials
 */
export function updateCredentials(newCredentials) {
	dbCredentials.update((current) => ({
		...current,
		...newCredentials
	}));
}

/**
 * Clears database credentials from both store and sessionStorage
 */
export function clearCredentials() {
	dbCredentials.set(DEFAULT_CREDENTIALS);
	sessionStorage.removeItem('dbCredentials');
}

/**
 * Validates database credentials
 * @param {DatabaseCredentials} credentials
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateCredentials(credentials) {
	if (
		!credentials.host ||
		!credentials.database ||
		!credentials.username ||
		!credentials.password
	) {
		return { isValid: false, error: 'All fields are required' };
	}

	if (!/^\d+$/.test(credentials.port)) {
		return { isValid: false, error: 'Port must be a number' };
	}

	return { isValid: true };
}
