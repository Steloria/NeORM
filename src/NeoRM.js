var neo4j = require("neo4j-driver");
var QueryBuilder = require('./QueryBuilder');
var Model = require('./Model');
var Relationship = require('./Relationship');

function NeoRM(host, username, pass) {
	this.host = host;
	this.username = username;
	this.pass = pass;

	this.driver = neo4j.driver(host, neo4j.auth.basic(username, pass));
}

NeoRM.prototype.createSession = function() {
	return this.driver.session();
}

NeoRM.prototype.queryBuilder = function() {
	return new QueryBuilder();
}

NeoRM.prototype.runQuery = function(query, properties) {
	const session = this.createSession();
	return session.run(query, properties)
		.then((res) => {
			session.close();
			return res;
		})
		.catch((err) => {
			session.close();
			return err;
		})
}

NeoRM.prototype.executeQuery = function(query) {
	const session = this.createSession();
	return session.run(query.getQuery(), query.params)
		.then((res) => {
			session.close();
			if (res.records) {
				const results = [];
				res.records.forEach(record => {
					const fields = [];
					record._fields.forEach(field => {
						switch(field.constructor.name) {
							case "Node":
								const model = new Model(
									field.identity.low,
									field.labels,
									field.properties
								);
								fields.push(model);
								break;
							case "Path":
								fields.push(new Model(
									field.start.identity.low,
									field.start.labels,
									field.start.properties
								));
								for (const i of field.segments) {
									fields.push(new Relationship(
										i.relationship.identity.low,
										i.relationship.type,
										i.relationship.properties
									));
									fields.push(new Model(
										i.end.identity.low,
										i.end.labels,
										i.end.properties
									));
								}
							default:
								break;
						}
					});
					results.push(fields);
				})
				return results;
			} else {
				return [];
			}
		})
		.catch((err) => {
			session.close();
			return err;
		})
}

NeoRM.prototype.persist = function(model) {
	if (model.constructor.name != "Model") throw "Invalid item to be persisted";
	return this.runQuery("MATCH (n) WHERE ID(n) = $id SET n = $properties", {
		id: neo4j.int(model._id),
		properties: model.properties
	});
}


module.exports = NeoRM;