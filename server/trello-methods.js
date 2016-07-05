Meteor.methods({
	postTrelloCard: function(cardData, opportunityID){
		console.log('postTrelloCard called!');
		
		var requestURL = "https://api.trello.com/1/cards/";
		
		var queryString = 'key=' + TrelloOptions.appKey + '&token=' + TrelloOptions.userToken;
		
		_.each(cardData,function(value,key,obj){
			var valueStr = "";
			if (_.isArray(value)){
				_.each(value,function(el,index,array){
					valueStr += (el + (index < (array.length - 1) ? ',': ''));
				});
			}
			else {
				valueStr = value;
			}
			queryString += ('&' + key + '=' + valueStr);
		});
		
		var requestOptions = {
			query: queryString
		};
		
		// console.log('requestOptions');
// 		console.log(requestOptions);

		try {
			var result = HTTP.post(requestURL,requestOptions);
			console.log("Success!");
			// console.log(result);
			
			var trelloCardData = result.data;
			
			var opportunity = Opportunities.find(opportunityID).fetch();
			
			console.log('find opportunity after adding trello card');
			console.log(opportunity);
			
			Opportunities.update(opportunityID,{$set:{trelloCard:trelloCardData}});
			
		} catch (e) {
			return false;
		}
		
	},
	updateTrelloCard: function(cardData,opportunityID){
		console.log('updateTrelloCard called!');

		var cardID = Opportunities.findOne(opportunityID).trelloCard.id;

		var requestURL = "https://api.trello.com/1/cards/" + cardID;

		var queryString = 'key=' + TrelloOptions.appKey + '&token=' + TrelloOptions.userToken;

		_.each(cardData,function(value,key,obj){
			var valueStr = "";
			if (_.isArray(value)){
				_.each(value,function(el,index,array){
					valueStr += (el + (index < (array.length - 1) ? ',': ''));
				});
			}
			else {
				valueStr = value;
			}
			queryString += ('&' + key + '=' + valueStr);
		});

		var requestOptions = {
			query: queryString
		};

		// console.log('requestOptions');
// 		console.log(requestOptions);

		try {
			var result = HTTP.put(requestURL,requestOptions);
			console.log("PUT Success!");
			console.log(result);

			var trelloCardData = result.data;

			Opportunities.update(opportunityID,{$set:{trelloCard:trelloCardData}});

		} catch (e) {
			return false;
		}
	},
	deleteAllBoardCards: function(boardID){
		var requestURL = "https://api.trello.com/1/boards/" + boardID;
		
		var requestOptions = {
			// auth: riqAPIKey + ':' + riqAPISecret,
			query: 'key=' + TrelloOptions.appKey + '&token=' + TrelloOptions.userToken + '&cards=open'
		};
		
		var board;
		try {
			var result = HTTP.get(requestURL,requestOptions);
			board = result.data;
			// console.log("Success!");
// 			console.log(board);
			//return list;
		} catch (e) {
			return false;
		}
		
		_.each(board.cards,function(card,index,array){
			Meteor.call('deleteCard',card.id);
		});
		
	},
	deleteCard: function(cardID){
		var requestURL = "https://api.trello.com/1/cards/" + cardID;
		
		var requestOptions = {
			// auth: riqAPIKey + ':' + riqAPISecret,
			query: 'key=' + TrelloOptions.appKey + '&token=' + TrelloOptions.userToken
		};
		
		try {
			var result = HTTP.del(requestURL,requestOptions);
			console.log("Success!");
			console.log(result);
			//return list;
		} catch (e) {
			return false;
		}
	},
	getTrelloBoard: function(boardID){
		var boardRequestURL = "https://api.trello.com/1/boards/" + TrelloOptions.boardID;
		var boardRequestOptions = {
			// auth: riqAPIKey + ':' + riqAPISecret,
			query: 'key=' + TrelloOptions.appKey + '&token=' + TrelloOptions.userToken + '&lists=open'
		};
		
		// console.log('requestOptions');
// 		console.log(requestOptions);
		
		var board;
		try {
			var result = HTTP.get(boardRequestURL,boardRequestOptions);
			board = result.data;
			// console.log("Success!");
// 			console.log(board);
		} catch (e) {
			return false;
		}
		
		var boardLablesRequestURL = "https://api.trello.com/1/boards/" + TrelloOptions.boardID + '/labels';
		
		var boardLabelsRequestOptions = {
			// auth: riqAPIKey + ':' + riqAPISecret,
			query: 'key=' + TrelloOptions.appKey + '&token=' + TrelloOptions.userToken
		};
		
		try {
			var result = HTTP.get(boardLablesRequestURL,boardLabelsRequestOptions);
			board.labels = result.data;
			// console.log("Success!");
// 			console.log(board.labels);
			TrelloOpportunityBoard.insert(board);
		} catch (e) {
			return false;
		}
		
	}
});