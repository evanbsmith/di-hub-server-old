Meteor.methods({
	logSlackMessage: function(message){
		check(message,Object);
		//SlackMessages.insert(message);
	},
	listenforMessages: function(slackClient, wrappedOn){

		wrappedOn('message', function(message){
			console.log('wrappedOn!');
			console.log(message);
		});
	},
	testFunction: function(text){
		console.log('testFunction called!');
		console.log(text);
	},
	testSlackAccess: function(){
		console.log('testSlackAccess');
		//SlackClient.connect();
		//console.log(SlackClient);
	}
});