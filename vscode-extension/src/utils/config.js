const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const vscode = require('vscode');
const defaultConfig = require('./default_config');
const logger = require('./logger');

class ConfigManager {
    constructor() {
        this.config = null;
        this.configPath = null;
    }

    /**
     * Deep merge two objects
     * @param {Object} target The target object
     * @param {Object} source The source object
     * @returns {Object} Merged object
     */
    deepMerge(target, source) {
        const output = { ...target };
        
        for (const key in source) {
            if (source[key] instanceof Object && key in target) {
                output[key] = this.deepMerge(target[key], source[key]);
            } else {
                output[key] = source[key];
            }
        }
        
        return output;
    }

    /**
     * Initialize the configuration
     * @param {vscode.ExtensionContext} context
     */
    initialize(context) {
        logger.log('Initializing configuration manager');
        // Start with default configuration
        this.config = { ...defaultConfig };

        const possibleConfigPaths = [
            path.join(context.extensionPath, 'config.yaml'),
            path.join(context.extensionPath, 'config.yml'),
        ];

        this.configPath = possibleConfigPaths.find(p => fs.existsSync(p));

        if (this.configPath) {
            logger.log(`Found configuration file at: ${this.configPath}`);
            this.loadConfig();
        } else {
            logger.log('No user configuration found, using default configuration');
            this.validateConfig();
        }
    }

    /**
     * Load and validate the configuration file
     */
    loadConfig() {
        try {
            logger.log('Loading configuration file');
            const fileContents = fs.readFileSync(this.configPath, 'utf8');
            const userConfig = yaml.load(fileContents);
            
            // Merge user config with default config
            this.config = this.deepMerge(defaultConfig, userConfig);
            
            this.validateConfig();
            logger.log('Configuration loaded successfully');
        } catch (error) {
            logger.log('Failed to load configuration:', error);
            throw new Error(`Failed to load configuration: ${error.message}`);
        }
    }

    /**
     * Validate the configuration structure
     */
    validateConfig() {
        logger.log('Validating configuration structure');
        const requiredSections = ['models', 'extension'];
        for (const section of requiredSections) {
            if (!this.config[section]) {
                const error = `Missing required configuration section: ${section}`;
                logger.log('Error:', error);
                throw new Error(error);
            }
        }

        // Additional validation can be added here
        if (!Array.isArray(this.config.models)) {
            const error = 'Configuration error: models must be an array';
            logger.log('Error:', error);
            throw new Error(error);
        }

        if (this.config.models.length === 0) {
            const error = 'Configuration error: at least one model must be defined';
            logger.log('Error:', error);
            throw new Error(error);
        }

        logger.log('Configuration validation completed successfully');
    }

    /**
     * Get a configuration value
     * @param {string} path Dot-notation path to config value
     * @param {any} defaultValue Default value if path doesn't exist
     * @returns {any} Configuration value
     */
    get(path, defaultValue = undefined) {
        const value = path.split('.').reduce((obj, key) => {
            if (obj && obj[key] !== undefined) {
                return obj[key];
            }
            return undefined;
        }, this.config) ?? defaultValue;
        
        logger.log(`Getting config value for path '${path}':`, value);
        return value;
    }

    /**
     * Get the entire configuration object
     * @returns {Object} The configuration object
     */
    getAll() {
        logger.log('Getting entire configuration object');
        return this.config;
    }
}

module.exports = new ConfigManager();
