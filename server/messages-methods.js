Meteor.methods({
	throwInsertMessage: function(listItemID){
		
		SlackMessages.insert({
			listItemID: listItemID,
			action: 'insert'
		});
	},
	throwUpdateMessage: function(listItemID, lastChangeLogItem){
		var changedFields = _.pluck(lastChangeLogItem.changes,'name');
		
		_.each(lastChangeLogItem.changes,function(el,i,a){
			if(el.name === "Status" || el.name === "Priority"){
				SlackMessages.insert({
					listItemID: listItemID,
					action: 'update',
					field: el.name,
					oldValue: el.oldValue,
					newValue: el.newValue
				});
			}
		});
		
		
		
	}
});