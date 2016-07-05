Meteor.methods({
	getRIQList: function(riqURL,urlOptions){
		check(riqURL, String);
		check(urlOptions, Object);
		var list;
		try {
			var result = HTTP.get(riqURL,urlOptions);
			list = result.data;
			//return list;
		} catch (e) {
			return false;
		}
		
		var listID = list.id;
		var matches = RelateIQLists.find({id:listID}).count();
		switch (matches){
			case 0:
				// this list is not yet in the collection, add it
				// console.log("RIQ LIST HANDLER: list added to collection.");
// 				console.log(list);
				RelateIQLists.insert(list);
				break;
			case 1:
				// this list is already in the collection, update it
				RelateIQLists.update({id:listID},list);
				break;
			default:
				// more than one match means something is wrong...
				console.log("ERROR: multiple RIQ lists matched");
		}
	},
	getRIQListItems: function(riqURL,urlOptions){
		// console.log('getRIQListItems called!')
		check(riqURL, String);
		check(urlOptions, Object);
		var listItems = [];
		
		var itemCount = 0;
		var newItemCount = 0;
		
		do {
			try {
				var URL = 'https://api.relateiq.com/v2/lists/54217edee4b050d2ffe12407/listitems?_start=' + itemCount;
				var result = HTTP.get(riqURL + itemCount,urlOptions);
				var newItems = result.data.objects;
				newItemCount = newItems.length;
				itemCount += newItemCount;
				listItems = listItems.concat(newItems);
				console.log('newItemCount = ' + newItemCount);
				console.log("itemCount = " + itemCount);
				//return listItems;
			} catch (e) {
				return false;
			}
		} while (newItemCount === 50);
		
		_.each(listItems,function(el,i,a){
			var itemID = el.id;
			var matches = Opportunities.find({id:itemID}).count();
			
			switch (matches){
				case 0:
					//console.log("RIQ LIST ITEM HANDLER: list item added to collection.")
					Opportunities.insert(el);
					break;
				case 1:
					//console.log("RIQ LIST ITEM HANDLER: list item updated.")
					Opportunities.update({id:itemID},el);
					break;
				default:
					console.log("ERROR: multiple RIQ list items matched");
			}
		});
	}
});