var recApp = {};

// API keys
recApp.LCBOkey = 'MDpmNjkzMDFmMC00MGM4LTExZTctYTA0Ni1mZmVmODcxMzU0YzM6aE1oVHp5cU01V1k0d0xBbXRxaFRIRXA5TUQ2QW9PWUZIb3dF';
recApp.BiblioShareKey = 'eb3hb4el990q9ox7';
recApp.GoodreadsKey = 'unMyyzduiPPhxe3Ymi3fnQ';

// book variables
var usersBook = {};
var BISACcode = {};
recApp.usersISBN = {};
recApp.bookTitle = {};
recApp.bookAuthor = {};
recApp.coverImage = {};
recApp.bookGenre = {};

// alcohol variables
recApp.alcoholCategory = {};
recApp.LCBOresults = {};
recApp.recommendedAlcoholName = {};
recApp.recommendedAlcoholImage = {};

// create an array mapping BISAC subjects to alcohol categories
recApp.pairings = {
	// GENERAL
	'Antiques &amp; Collectibles': 'Cognac',
	'Architecture': 'Vodka',
	'Art': 'Champagne',
	'Bibles': 'Red Wine',
	'Biography &amp; Autobiography': 'Whisky/Whiskey',
	'Body, Mind &amp; Spirit': 'Eau-de-Vie',
	'Business & Economics': 'White Wine',
	'Comics &amp; Graphic Novels': 'Coolers',
	'Computers': 'Cider',
	'Cooking': 'White Wine',
	'Crafts &amp; Hobbies': 'Specialty Wines',
	'Design': 'Vodka',
	'Drama': 'Sparkling Wine',
	'Education': 'Vodka',
	'Family &amp; Relationships': 'White Wine',
	'Fiction': 'Wine',
	'Foreign Language Study': 'Champagne',
	'Games &amp; Activities': 'Ale',
	'Gardening': 'Specialty Wines',
	'Health &amp; Fitness': 'Vodka',
	'History': 'Specialty',
	'House &amp; Home': 'White Wine',
	'Humor': 'Icewine',
	'Juvenile Fiction': 'Coolers',
	'Juvenile Nonfiction': 'Coolers',
	'Language Arts &amp; Discplines': 'Red Wine',
	'Law': 'Gin',
	'Literary Collections': 'Gin',
	'Literary Criticism': 'Gin',
	'Mathematics': 'Cider',
	'Medical': 'Tequila',
	'Music': 'Rum',
	'Nature': 'Cider',
	'Performing Arts': 'Icewine',
	'Pets': 'Cider',
	'Philosophy': 'Gin',
	'Photography': 'Icewine',
	'Poetry': 'Red Wine',
	'Political Science': 'Fortified Wine',
	'Psychology': 'Coolers',
	'Reference': 'Fortified Wines',
	'Religion': 'Red Wine',
	'Science': 'Hybrid',
	'Self-Help': 'Premixed Cocktails',
	'Social Science': 'Coolers',
	'Sports &amp; Recreation': 'Lager',
	'Study Aids': 'Gin',
	'Technology &amp; Engineering': 'Cider',
	'Transportation': 'Ale',
	'Travel': 'Champagne',
	'True Crime': 'Brandy',
	'Young Adult Fiction': 'Coolers',
	'Young Adult Nonfiction': 'Coolers',
}

// initializes the code
recApp.init = function() {
	// store users search query
	$('.formSubmit').submit(function(event) {
		event.preventDefault();
		if ( $('input[type=text]').val() != '') {
			usersBook = $('input').val();
			$('input[type=text]').val('');
		} else {
			alert("Please enter the title of the book you're reading.");
		}
		recApp.searchUsersBook(usersBook);
		recApp.grabCoverImage(usersBook);
	});
}

// grab book cover image from Goodreads
recApp.grabCoverImage = function(query) {
	// search Goodreads API for cover image
	$.ajax({
		url: 'http://proxy.hackeryou.com',
		method: 'GET',
		dataType: 'json',
		data: {
			reqUrl: 'https://www.goodreads.com/search/index.xml',
			params: {
				key: recApp.GoodreadsKey,
				q: query
			},
			xmlToJSON: true
		}
	}).then(function(res) {
		console.log(res.GoodreadsResponse);
		if (Array.isArray(res.GoodreadsResponse.search.results.work)) {
			recApp.coverImage = res.GoodreadsResponse.search.results.work[0].best_book.image_url.replace(/(\d)(m\/)/,"$1l/");
		} else {
			recApp.coverImage = res.GoodreadsResponse.search.results.work.best_book.image_url.replace(/(\d)(m\/)/,"$1l/");
		}
	});
}

// search open library for user's input
recApp.searchUsersBook = function(query) {
	// make AJAX request to get the data
	$.ajax({
		url: 'https://www.googleapis.com/books/v1/volumes',
		method: 'GET',
		dataType: 'json',
		data: {
			q: query
		}
	}).then(function(res) {
		var bookSearchResults = (res);
		console.log(bookSearchResults);
		// store book data to display
		recApp.usersISBN = bookSearchResults.items[0].volumeInfo.industryIdentifiers[0].identifier;
		recApp.bookTitle = bookSearchResults.items[0].volumeInfo.title;
		recApp.bookAuthor = bookSearchResults.items[0].volumeInfo.authors[0];
		recApp.bookGenre = bookSearchResults.items[0].volumeInfo.categories[0];
		BISACcode = recApp.bookGenre;
		// find object in array with object matching the stored BISAC subject
		recApp.alcoholCategory = recApp.pairings[BISACcode];
		recApp.searchLCBO();
	});
}

// search lcbo for alcohol products with selected category
recApp.searchLCBO = function() {
	// make AJAX request to lcbo get the data
	$.ajax({
		url: 'http://lcboapi.com/products',
		method: 'GET',
		dataType: 'jsonp',
		data: {
			key: recApp.LCBOkey,
			where_not: 'is_dead',
			q: recApp.alcoholCategory,
			per_page: 100
		}
	}).then(function(res) {
		recApp.LCBOresults = res.result;
		recApp.randomizeAlcohol(recApp.LCBOresults);
	});
}

// randomize results within the found object and store name and image in variables
recApp.randomizeAlcohol = function(alcohol) {
	if (recApp.LCBOresults === null) {
		return
	} else {
		var index = Math.floor(Math.random() * alcohol.length);
		var alcoholToDisplay = alcohol[index];
		// create variable for alcohol beverage name
		recApp.recommendedAlcoholName = alcoholToDisplay.name;
		// create variable for alcohol beverage image
		recApp.recommendedAlcoholImage = alcoholToDisplay.image_url;
		recApp.displayItems();
	}
}

// append items to page
recApp.displayItems = function() {
	// clear previous results
	$('#results').empty();
	var bookContainer =
	`<div class="book animated fadeIn">
	<h4>${recApp.bookTitle} by ${recApp.bookAuthor}</h4>
	<div class="recImage"><img src="${recApp.coverImage}" alt="Book cover image of ${recApp.bookTitle} by ${recApp.bookAuthor}"></div>
	</div>`
	var alcoholContainer =
	`<div class="alcohol animated fadeIn">
	<h4>${recApp.recommendedAlcoholName}</h4>
	<div class="recImage"><img src="${recApp.recommendedAlcoholImage}" alt="Image of ${recApp.recommendedAlcoholName}"></div>
	</div>`
	$('section#results').append(bookContainer, alcoholContainer);
	$('.quote').addClass('removeQuote');
};

// if result is for YA or juvenile, include a message about drinking responsibly

// doc ready
$(function() {
	recApp.init();
});
