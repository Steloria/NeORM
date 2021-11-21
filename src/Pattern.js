function Pattern() {
	this.rel = "";
	this.params = {};
}

Pattern.prototype.addNode = function(labels, params, name) {
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
	this.rel += (`(${name == null ? '' : name}${labels == null ? '' : labels.map(l => ':'+l.charAt(0).toUpperCase() + l.slice(1))} ${p})`);
	return this;
}

Pattern.prototype.addRelation = function(labels, dir, params, name, from, to, between) {
	if (["r", "right", "l", "left", null].indexOf(dir) == -1 & typeof dir != "undefined") throw "Invalid direction";
	let limit = `${typeof from != "undefined" ? from : ''}${(typeof from != "undefined" && typeof to != "undefined") || typeof between != "undefined" ? ".." : ""}${typeof to != "undefined" ? to : ''}`;
	this.rel += (`${["l", "left"].indexOf(dir) != -1 ? "<" : ""}-[${name == null ? '' : name}${labels == null ? '' : labels.map(l => ':'+l.toUpperCase())} ${limit}]-${["r", "right"].indexOf(dir) != -1 ? ">" : ""}`);
	return this;
}

module.exports = Pattern;