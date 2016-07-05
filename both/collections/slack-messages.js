SlackMessages = new Mongo.Collection('slack-messages');

SlackMessages.before.insert(function(userId, doc){
	console.log('inserting SlackMessage!');
	
	doc.as_user = true;
	doc.mrkdwn = true;
	
	var listItem = Opportunities.findOne(doc.listItemID);
	if(doc.action === 'insert'){
		doc.text = "*New Opportunity* \n" + "_" + listItem.name + "_";
	}
	else if (doc.action === 'update'){
		doc.text = "*" + doc.field + "* changed to *" + doc.newValue + "* from " + doc.oldValue + "\n" + "_" + listItem.name + "_";
	}
	console.log(doc.text);
});

SlackMessages.after.insert(function(userId, doc){
	if(Meteor.isServer){
		// console.log("testing after SlackMessage insert");
// 		console.log(SlackClient.getDMByName('esmith'));
		
		_.each(SlackOptions.postLocations,function(locationName,index,array){
			console.log('slack posting to: ' + locationName);
			var loc = SlackClient.getChannelGroupOrDMByName(locationName);
			loc.postMessage(doc);
		});
		
		// if (SlackOptions.group !== ''){
// 			var group = SlackClient.getGroupByName(SlackOptions.group);
// 			group.postMessage(doc);
// 		}
//
// 		if (SlackOptions.chat !== ''){
// 			var chat = SlackClient.getDMByName(SlackOptions.chat);
// 			chat.postMessage(doc);
// 		}
//
// 		if (SlackOptions.channel !== ''){
// 			var channel = SlackClient.getChannelByName(SlackOptions.channel);
// 			channel.postMessage(doc);
// 		}
		
	}
});

SlackMessages.before.update(function(userId, doc, fieldNames, modifier, options){
	// console.log('updating!');
	
});

SlackMessages.after.update(function(userId, doc, fieldNames, modifier, options){
	
});