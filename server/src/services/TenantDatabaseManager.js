const mongoose = require('mongoose');

// We will load schemas here
const tenantSchemas = require('../models/tenant');

class TenantDatabaseManager {
  constructor() {
    this.connections = new Map();
  }

  /**
   * Get or create a connection to a specific tenant database
   * @param {string} databaseName 
   * @returns {mongoose.Connection}
   */
  async getConnection(databaseName) {
    if (this.connections.has(databaseName)) {
      const conn = this.connections.get(databaseName);
      if (conn.readyState === 1) { // 1 = connected
        return conn;
      }
    }

    // Parse the base URI and swap out the database name
    const baseUri = process.env.MONGO_URI || 'mongodb://localhost:27017/';
    // Handle cases where the base URI already has a db name or query params
    const uriObj = new URL(baseUri);
    uriObj.pathname = `/${databaseName}`;
    const tenantUri = uriObj.toString();

    console.log(`[TenantDB] Connecting to tenant database: ${databaseName}`);
    
    // Create new connection
    const connection = mongoose.createConnection(tenantUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000
    });

    // Register all tenant schemas on this connection
    for (const [modelName, schema] of Object.entries(tenantSchemas)) {
      connection.model(modelName, schema);
    }

    this.connections.set(databaseName, connection);

    return connection;
  }

  /**
   * Closes a connection (useful for cleanup or suspension)
   */
  async releaseConnection(databaseName) {
    if (this.connections.has(databaseName)) {
      await this.connections.get(databaseName).close();
      this.connections.delete(databaseName);
    }
  }
}

module.exports = new TenantDatabaseManager();
