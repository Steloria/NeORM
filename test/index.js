var NeoRM = require('../src/NeoRM');

const neo = new NeoRM("bolt://localhost:7687", "neo4j", "test");

neo.runQuery("MATCH (n) RETURN n").then(res => {
	var medru = res[0][0];
	medru.properties.name = "Medru";
	neo.persist(medru);
});

const queryBuilder = neo.queryBuilder();
const pattern = queryBuilder.createPattern();
pattern
	.addNode(["Movie"], null, "m")
	.addRelation(["Directed"], "left")
	.addNode(["Person"])
	.addRelation(["Directed"], "r")
	.addNode(["Movie"], {title: 'The Matrix Reloaded'});

queryBuilder
	.addMatchPattern(pattern)
	.addReturn("m")
	.addDistinct();

var q = queryBuilder.getQuery();
console.log(q);
neo.executeQuery(queryBuilder).then(res => {
	console.log(res);
});