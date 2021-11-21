var Pattern = require('./Pattern.js');

function QueryBuilder() {
	this.match = [];
	this.matchRel = [];
	this.returnNodes = [];
	this.where = [];
	this.params = {};
	this.distinct = false;
}

QueryBuilder.prototype.addMatchNode = function(labels, params, name) {
	let p = "";
	let rand = (Math.random() + 1).toString(36).substring(7);
	if (params != null) {
		p = "{";
		for (const i in params) {
			this.params[i + rand] = params[i];
			p += `${i}: $${i + rand},`;
		}
		p = p.slice(0, -1);
		p += "}";
	}
	this.match.push(`(${name == null ? '' : name}${labels == null ? '' : labels.map(l => ':'+l.charAt(0).toUpperCase() + l.slice(1))} ${p})`);
	return this;
}

QueryBuilder.prototype.addMatchPattern = function(pattern) {
	this.params = Object.assign(this.params, pattern.params);
	this.match.push(pattern.rel);
	return this;
}

QueryBuilder.prototype.addWhere = function(closure, params) {
	this.params = Object.assign(this.params, params);
	this.where.push(closure);
	return this;
}

QueryBuilder.prototype.addWherePattern = function(pattern, not) {
	this.params = Object.assign(this.params, pattern.params);
	this.where.push(`${(typeof not != "undefined" && not != null) ? "NOT " : ""}${pattern.rel}`);
	return this;
}

QueryBuilder.prototype.addReturn = function(name) {
	this.returnNodes.push(name);
	return this;
}

QueryBuilder.prototype.addDistinct = function(name) {
	this.distinct = true;
	return this;
}

QueryBuilder.prototype.shortestPath = function(pattern, name) {
	this.params = Object.assign(this.params, pattern.params);
	this.match.push(`${name == null ? '' : `${name} = `}shortestPath(${pattern.rel})`);
	return this;
}

QueryBuilder.prototype.createPattern = function(name) {
	return new Pattern();
}

QueryBuilder.prototype.getQuery = function() {
	let query = "";

	if (this.match.length > 0 || this.matchRel.length > 0) query = "MATCH";
	this.match.concat(this.matchRel).forEach(m => { query += ` ${m},`; });
	query = query.slice(0, -1);

	for (var i in this.where) { query += `${i == 0 ? " WHERE" : " AND"} ${this.where[i]}`; }

	if (this.returnNodes.length > 0) query += ` RETURN ${this.distinct ? "DISTINCT " : ''}`;
	this.returnNodes.forEach(r => { query += r; });

	return query;
}

QueryBuilder.prototype.getRunnableQuery = function() {
	let q = this.getQuery();
	for (const i in this.params) {
		const isStr = typeof this.params[i] == "string";
		q = q.replace("$"+i, `${isStr ? '"' : ""}${this.params[i]}${isStr ? '"' : ""}`);
	}

	return q;
}

module.exports = QueryBuilder;