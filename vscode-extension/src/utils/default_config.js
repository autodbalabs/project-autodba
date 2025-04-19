/**
 * Default configuration for AutoDBA extension
 * Any settings not specified in user's config.yaml will fall back to these values
 */
const defaultConfig = {
    debug_mode: false,
    models: [
        {
            name: 'gpt-4o',
            temperature: 0.7,
            max_tokens: 2000
        }
    ],
    extension: {
        log_level: 'info',
        auto_refresh: true,
        refresh_interval: 30
    }
};

module.exports = defaultConfig;
