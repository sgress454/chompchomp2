module.exports = {
	connections: {
		memory: {
			adapter: 'sails-memory'
		}
	},
	models: {
		migrate: 'drop',
		connection: 'memory'
	},
	csrf: false,
	port: 1440,
  host: 'localhost',
	globals: {
		sails: true
	},
  application: {
    APP_URL_VERBOSE: "http://localhost:1440"
  }
};
