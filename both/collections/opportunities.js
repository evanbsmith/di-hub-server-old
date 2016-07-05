Opportunities = new Mongo.Collection('opportunities');

Opportunities.before.insert(function(userId, doc){
	// fixing incompatibility in data format between relateIQ and MongoDB 
	doc.linkedItemIds = {};
	doc.changeLog = [];
	
	
	// updating doc to use fields schema 
	var fieldValues = doc.fieldValues;
	var riqList = RelateIQLists.findOne({id:doc.listId});
	var listFields = riqList.fields;
	doc.fields = _.map(listFields,function(field,i,a){
		if(field.dataType === "List"){
			var valueArray = _.map(fieldValues[field.id],function(value,i,a){
				var val = _.find(field.listOptions,function(option){
					return option.id === value.raw
				});
				return val.display;
			});
			field.value = valueArray;
		}
		else if (field.dataType === "Numeric"){
			var arr = [];
			arr = _.map(fieldValues[field.id],function(el,i,a){
				return parseFloat(el.raw);
			});
			field.value = arr;
		}
		else {
			var arr = [];
			arr = _.map(fieldValues[field.id],function(el,i,a){
				return el.raw;
			});
			field.value = arr;
		}
		return field;
	});
	// console.log('inserting: ' + doc.name);

});

Opportunities.after.insert(function(userId, doc){
	
	// console.log('Opportunities after insert hook');
	// console.log(doc);
	// console.log(doc.name);
	var dueDateField = _.find(doc.fields,function(field){return field.name === "Due Date"});
	var dueDate = dueDateField.value.length > 0 ? dueDateField.value[0] : null;
	
	var practiceField = _.find(doc.fields,function(field){return field.name === "Practice Area"});
	var practices = practiceField.value;
	// console.log('practices');
	// console.log(practices);
	
	
	var statusField = _.find(doc.fields,function(field){return field.name === "Status"});
	// console.log('statusField test');
	// console.log(statusField);
	var oppStatus = statusField.value[0];
	// console.log('oppStatus');
	// console.log(oppStatus);
	
	var trelloBoard = TrelloOpportunityBoard.findOne();
	
	// console.log('trelloBoard');
	// console.log(trelloBoard);
	
	var trelloBoardLabels = trelloBoard.labels;
	var trelloBoardLists = trelloBoard.lists;
	
	var trelloStatusList = _.find(trelloBoardLists,function(list){
		// console.log('trelloStatusList find test');
// 		console.log('list');
// 		console.log(list);
// 		console.log('oppStatus');
// 		console.log(oppStatus);
// 		//
		return list.name === oppStatus;
	});
	
	// console.log("trelloStatusList");
	// console.log(trelloStatusList);
	//
	var opportunityLabels = [];
	
	var matches = _.map(practices,function(practice,index,array){
		// console.log('practices find test');
		// console.log(practice);
		var label = _.find(trelloBoardLabels,function(label){
			// console.log('label find test');
			// console.log(label);
			return label.name === practice;
		});
		// console.log('found labels');
		// console.log(label);
		return label;
	});
	
	opportunityLabels = _.pluck(matches,'id');
	// console.log('matches test');
	// console.log(matches);
	
	if (dueDate !== null){
		opportunityLabels.push(_.find(trelloBoardLabels,function(label){return label.name === "Due Date"}).id);
	}
	
	// console.log('Due Date');
// 	console.log(dueDate);
	
	var docName = doc.name;
	if(docName.match('&')){
		console.log('docName & match');
		console.log(docName);
		console.log('escaped version');
		console.log(encodeURIComponent(docName));
		docName = encodeURIComponent(docName);
	}
	
	var trelloCardData = {
		name: docName, // needs to be escaped
	//	desc: "",
		due: dueDate,
		idList: trelloStatusList.id,
		idLabels: opportunityLabels
	};
	
	// console.log('trelloCardData');
// 	console.log(trelloCardData);
//
		Meteor.call('postTrelloCard',trelloCardData, doc._id);
	
	Meteor.call('throwInsertMessage', doc._id);
});

Opportunities.before.update(function(userId, doc, fieldNames, modifier, options){
	// console.log('opportunities before update called');
//
// 	console.log('fieldNames test')
// 	console.log(fieldNames);

	if(_.contains(fieldNames,'trelloCard') && fieldNames.length === 1){
		// this update is part of the insert process adding trello card data to a newly inserted opportunity
		
		// do nothing(?)
		
	}
	else {
		// this update is an actual update to an existing opportunity
	 	// fixing incompatibility in data format between relateIQ and MongoDB
		modifier.linkedItemIds = {};
		modifier.changeLog = doc.changeLog;
		
		// preserving trelloCard data
		if(doc.trelloCard !== undefined){
			modifier.trelloCard = doc.trelloCard;
		}

		// updating modifier doc to use fields schema 
		var fieldValues = modifier.fieldValues;
		var riqList = RelateIQLists.findOne({id:modifier.listId});
		var listFields = riqList.fields;
		modifier.fields = _.map(listFields,function(field,i,a){
			if(field.dataType === "List"){
				var valueArray = _.map(fieldValues[field.id],function(value,i,a){
					var val = _.find(field.listOptions,function(option){
						return option.id === value.raw
					});
					return val.display;
				});
				field.value = valueArray;
			}
			else if (field.dataType === "Numeric"){
				var arr = [];
				arr = _.map(fieldValues[field.id],function(el,i,a){
					return parseFloat(el.raw);
				});
				field.value = arr;
			}
			else {
				var arr = [];
				arr = _.map(fieldValues[field.id],function(el,i,a){
					return el.raw;
				});
				field.value = arr;
			}
			return field;
		});

		// logic to determine whether to update and to log changes for messaging
		if (doc.modifiedDate === modifier.modifiedDate){
			// console.log("No Change, before hook return false: " + modifier.name);
			return false;
		}
		else {
			console.log("Change, before hook return changed doc: " + modifier.name);
			// log schema is array of objects, one for each update. each object will have dateModified and fields attributes - fields is array of objects with name, id, oldValue, newValue attributes.
		
			var changes = [];
		
			_.each(modifier.fields,function(el,i,a){
			
			
				var oldObj = _.find(doc.fields,function(field){return field.id === el.id});

				if (!_.isEqual(el.value,oldObj.value) && (oldObj !== undefined)){
					var obj = {};
					obj.name = el.name;
					obj.id = el.id;
					obj.newValue = el.value;
					obj.oldValue = oldObj.value;
					changes.push(obj)
				}
			});
		
			var changeLogItem = {
				changes: changes,
				modifiedDate: modifier.modifiedDate
			};
		
			var docChangeLog = doc.changeLog;

			modifier.changeLog.push(changeLogItem);
		
		}
	}
	
	// console.log('updating: ' + modifier.name);

 	
});

Opportunities.after.update(function(userId, doc, fieldNames, modifier, options){
	console.log('Opportunities after update hook');
	
	if(_.contains(fieldNames,'trelloCard') && fieldNames.length === 1){
		// this update is part of the insert process adding trello card data to a newly inserted opportunity
		
		// do nothing(?)
		
	}
	else {
		// Update Trello
		// 1. create necessary variables to update trello card (due date, practices, and status)		
		var dueDateField = _.find(doc.fields,function(field){return field.name === "Due Date"});
		var dueDate = dueDateField.value.length > 0 ? dueDateField.value[0] : null;
	
		var practiceField = _.find(doc.fields,function(field){return field.name === "Practice Area"});
		var practices = practiceField.value;
		
		console.log('practices value');
		console.log(practices);
	
		var statusField = _.find(doc.fields,function(field){return field.name === "Status"});
		var oppStatus = statusField.value[0];
	
		// 2. grab trello board, lists, and labels 	
		var trelloBoard = TrelloOpportunityBoard.findOne();
		var trelloBoardLabels = trelloBoard.labels;
		var trelloBoardLists = trelloBoard.lists;
	
		// 3. logic for updating status list
			// get old status, get new status, 
		
		
		var trelloStatusList = _.find(trelloBoardLists,function(list){
			return list.name === oppStatus;
		});
		
		console.log('trelloStatusList test');
		console.log(trelloStatusList);
		
		
		// 4. logic for applying trello board labels
		var opportunityLabels = [];
	
		// 4.a get label IDs for practice labels
		var opportunityLabels = _.map(practices,function(practice,index,array){
			var label = _.find(trelloBoardLabels,function(label){
				return label.name === practice;
			});
			return label;
		});
		
		// 4.b add label id for due data label, if applicable
		if (dueDate !== null){
			opportunityLabels.push(_.find(trelloBoardLabels,function(label){return label.name === "Due Date"}));
		}
	
		// 5. format name and create trello card data object
		var docName = doc.name;
		if(docName.match('&')){
			docName = encodeURIComponent(docName);
		}
	
		opportunityLabelIDs = _.pluck(opportunityLabels,'id');
		opportunityLabelColors = _.pluck(opportunityLabels,'color');
	
		var trelloCardData = {
			name: docName, 
			//	desc: "",
			due: dueDate,
			idList: trelloStatusList.id,
			idLabels: opportunityLabelIDs,
			labels: opportunityLabelColors
		};
		
		console.log('trelloCardData test');
		console.log(trelloCardData);

		// 6. update trello card
		Meteor.call('updateTrelloCard',trelloCardData, doc._id);
	
	
		// 7. Send Slack message
	
		var lastChange = _.max(doc.changeLog,function(changeLogItem){return changeLogItem.modifiedDate});
		Meteor.call('throwUpdateMessage', doc._id, lastChange);
	}
}, {fetchPrevious: true});



	