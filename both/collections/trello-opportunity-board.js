TrelloOpportunityBoard = new Mongo.Collection('trello-opportunity-board');

TrelloOpportunityBoard.before.insert(function(userId, doc){
	console.log('inserting TrelloOpportunityBoard!');
	console.log(doc.name);
});

TrelloOpportunityBoard.before.update(function(userId, doc, fieldNames, modifier, options){
	// do a check to see if anything is different. If so, update with new data and keep old data. If not, do nothing.
	// console.log('updating!');
// 	console.log(doc.title);
});