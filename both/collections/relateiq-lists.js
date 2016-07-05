RelateIQLists = new Mongo.Collection('relate-iq-lists');

RelateIQLists.before.insert(function(userId, doc){
	// console.log('inserting!');
// 	console.log(doc.title);
});

RelateIQLists.before.update(function(userId, doc, fieldNames, modifier, options){
	// do a check to see if anything is different. If so, update with new data and keep old data. If not, do nothing.
	// console.log('updating!');
// 	console.log(doc.title);
});

