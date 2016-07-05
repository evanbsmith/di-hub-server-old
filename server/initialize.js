// relateIQ settings
var riqAPIKey = '559d863de4b05a62ebc14b93';
var riqAPISecret = 'qT7uIqE0feofdD7mxB0n5D8cvpv';
var riqURL = 'https://api.relateiq.com/v2/lists/';
var riqListID = '54217edee4b050d2ffe12407';
var requestURL = riqURL + riqListID;
var requestOptions = {
	auth: riqAPIKey + ':' + riqAPISecret
};
var riqListItemsURLPiece = '/listitems?_start=';


// Slack settings

SlackOptions = {
	authToken: 'xoxb-7402214758-SFH0x6ApPvGFQsZIVY7pEu5P',
	autoReconnect: true,
	autoMark: true,
	postLocations: ['evan']
};

SlackClient = new Slack(SlackOptions.authToken, SlackOptions.autoReconnect, SlackOptions.autoMark);

// Trello settings
TrelloOptions = {
	appKey: '181c852fd254d395de0673a07967d384',
	boardID: '55c0dad01e1161c0171b7890',
	userToken: 'a4b55f062148d4c3e3eeead072a09909d62f589ffda0a77b94ef7432302e3ac4'
};

DebugToggles = {
	trelloOn: true,
	slackOn: true,
	resetTrello: false,
	relateIQInit: true,
	relateIQRefresh: true
};

// startup code
Meteor.startup(function(){
	
	
	if(DebugToggles.resetTrello){
		// code to reset trello board
		Meteor.call('deleteAllBoardCards',TrelloOptions.boardID);
	}
	
	
	//
	// SlackClient.on('open', function() {
	//   console.log("opened");
	// });
	// SlackClient.on('message', function(message) {
	//   console.log('received message: ', message);
	// });
	//
	//
	
	if(DebugToggles.slackOn){
		SlackClient.login();
	}

	if(DebugToggles.trelloOn){
		Meteor.call('getTrelloBoard',TrelloOptions.boardID);
	}

	if(DebugToggles.relateIQInit){
		Meteor.call('getRIQList',requestURL,requestOptions);
		Meteor.call('getRIQListItems',requestURL+riqListItemsURLPiece,requestOptions);
	}

	if(DebugToggles.relateIQRefresh){
		var intervalID = Meteor.setInterval(function(){
			Meteor.call('getRIQList',requestURL,requestOptions);
			Meteor.call('getRIQListItems',requestURL+riqListItemsURLPiece,requestOptions);
		},300000);
	}
	
	
	
	
	


});