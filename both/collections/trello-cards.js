TrelloCards = new Mongo.Collection('trello-cards');

TrelloCards.before.insert(function(userId, doc){
	console.log('inserting TrelloCard!');
	
// 	console.log(doc.text);
});

TrelloCards.after.insert(function(userId, doc){
	if(Meteor.isServer){
		// console.log("testing after SlackMessage insert");

	}
});

TrelloCards.before.update(function(userId, doc, fieldNames, modifier, options){
	// console.log('updating!');
	
});

TrelloCards.after.update(function(userId, doc, fieldNames, modifier, options){
	
});