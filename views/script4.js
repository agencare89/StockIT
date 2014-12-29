// this is the javascript file! 
var NYSE = [ "XOM", "IBM", "CVX", "GE", "PG", "T", "JNJ", "PFE", "WFC", "PM", "JPM", "KO", "MRK", "VZ", "SLB", "WMT", "MCD", "PEP", "COP", "C", "ABT", "OXY", "BAC", "BRKB", "HD", "DIS", "CAT", "UTX", "MO", "MDLZ", "V", "UNH", "CVS", "MMM", "UPS", "EMC", "BMY", "USB", "AXP", "UNP", "HPQ", "BA", "GS", "DD", "F", "MA", "APC", "APA", "MON", "HON", "CL", "FCX", "MDT", "NKE", "SPG", "DOW", "LLY", "ACN", "SO", "EMR", "TWX", "NOV", "HAL", "DE", "LOW", "TGT", "PX", "BAX", "EOG","PNC", "MET", "YUM", "DHR", "NEM", "WAG", "DVN", "PRU", "D", "KMB", "DUK", "AGN", "BK", "FDX", "COV", "EXC", "MHSE", "MS", "TRV", "ITW", "GIS", "LMT", "WLP","BHI", "GD", "GLW", "LVS", "BEN", "GM", "AIG", "SCCO"];   

// right off the start, load all the stocks ---- IMPLEMENT UPDATING FUNCTION LATER!!

$(document).ready( function() { 

	// initially clear all the stocks from the mongolab db, they will then be loaded via post
	$.ajax({ 
		url: '/stocks', 
		type: 'DELETE', 
		success: function() { 
			console.log('all stocks removed!'); 
		}
	});

	// this is for the bootstrap background on the jumbotron 
	var jumboHeight = $('.jumbotron').outerHeight();
	function parallax() {
		var scrolled = $(window).scrollTop();
		$('.bg').css('height', (jumboHeight-scrolled)+ 'px');
	}

	$(window).scroll(function(e) {
		parallax();
	});

	// update every 5 seconds!!!
	setInterval(startAll, 5000);

	// url of the API that I query to get all the information on the database
	var url = "https://query.yahooapis.com/v1/public/yql";
	
	// the following goes through all the NYSE top 100 stocks and gets all the data for them by querying the yahoo finance API!
	for (var i = 0; i < NYSE.length; i++) {
		var send = encodeURIComponent("select * from yahoo.finance.quotes where symbol in ('" + NYSE[i] + "')");
		$.getJSON(url, "q=" + send + "&format=json&diagnostics=true&env=http://datatables.org/alltables.env", 
			function(data) { 
				doAjax(data); 
			});
	}
	
	// ajax post request for each unique stock with the data obtained from the api
	function doAjax(data) { 
		$.ajax( { 
			url: '/stocks', 
			type: 'POST', 
			dataType: 'json', 
			data: { 
				symbol: data.query.results.quote.symbol, 
				compName: data.query.results.quote.Name, 
				price: data.query.results.quote.LastTradePriceOnly,
				volume: data.query.results.quote.Volume, 
				netChange: data.query.results.quote.Change,
				percentChange: data.query.results.quote.ChangeinPercent
			}
		});
	}
});

function ajaxGetSpecificLetter(letter) { 
	function numberWithCommas(x) {
	    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	// ajax request to get the stocks of a specific letter, this is for sorting the stocks by letter
	$.ajax( { 
		url: '/stocks', 
		type: 'GET', 
		dataType: 'json', 
		async: false,
		cache: false,
		success: function(data) { 
			$('#body').empty();
			for (var i = 0; i < data.length; i++) { 

				var tempSymbol = data[i].symbol;
				if (tempSymbol.charAt(0) != letter) continue;

				var symbol = data[i].symbol;
				var name = data[i].compName; 
				var price = data[i].price; 
				var percentChange = data[i].percentChange; 
				var netChange = data[i].netChange;
				var volume = data[i].volume;
				volume = numberWithCommas(volume);	 // make the volume be printed like xxx,xxx,xxx instead of xxxxxxxxx

				// for formating purposes... prints a green colored background on netchange and percentchange if they are positive
				if (netChange > 0) {
					$("#body").append("<tr><th><center>"+ symbol + "</center></th><th><center>" + name + "</center></th><th><center>" + volume 
						+ "</center></th><th><center>" + price + "</center></th><th class = 'success'><center>" 
						+ netChange + "</center></th><th class = 'success'><center>" + percentChange + "</center></th></tr>");  
				} 

				// prints a red colored background on netchange and percentchange if they are negative
				else if (netChange < 0) { 
					$("#body").append("<tr><th><center>"+ symbol + "</center></th><th><center>" + name + "</center></th><th><center>" + volume 
						+ "</center></th><th><center>" + price + "</center></th><th class = 'danger'><center>" 
						+ netChange + "</center></th><th class = 'danger'><center>" + percentChange + "</center></th></tr>");  
				}

				else 				
					$("#body").append("<tr><th><center>"+ symbol + "</center></th><th><center>" + name + "</center></th><th><center>" + volume 
						+ "</center></th><th><center>" + price + "</center></th><th><center>" 
						+ netChange + "</center></th><th><center>" + percentChange + "</center></th></tr>"); 
				
			} 
		}
	}); // end ajax request
}

function allStocks() { 
	function numberWithCommas(x) {
	    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
	$("#header").empty();
	$("#header").append("<tr><th><center>SYMBOL</center></th><th><center>COMPANY NAME</center></th><th><center>VOLUME</center>"
		+ "</th><th><center>PRICE</center></th><th><center>NET CHANGE</center></th><th><center>PERCENT CHANGE</center></th></tr>");

	// get all the stocks; called when user selects "All" in the NYSE Stocks option
	$('button#ALL').click(function() { 
		// ajax request to get all the stocks in the system and display them all
		$.ajax( { 
			url: '/stocks', 
			type: 'GET', 
			dataType: 'json', 
			async: false,
			cache: false,
			success: function(data) { 
				$('#body').empty();
				for (var i = 0; i < data.length; i++) { 
					var symbol = data[i].symbol;
					var name = data[i].compName; 
					var price = data[i].price; 
					var percentChange = data[i].percentChange; 
					var netChange = data[i].netChange;
					var volume = data[i].volume;
					volume = numberWithCommas(volume);	

					// for formating purposes... prints a green colored background on netchange and percentchange if they are positive
					if (netChange > 0) {
						$("#body").append("<tr><th><center>"+ symbol + "</center></th><th><center>" + name + "</center></th><th><center>" + volume 
							+ "</center></th><th><center>" + price + "</center></th><th class = 'success'><center>" 
							+ netChange + "</center></th><th class = 'success'><center>" + percentChange + "</center></th></tr>");  
					} 

					// prints a red colored background on netchange and percentchange if they are negative
					else if (netChange < 0) { 
						$("#body").append("<tr><th><center>"+ symbol + "</center></th><th><center>" + name + "</center></th><th><center>" + volume 
							+ "</center></th><th><center>" + price + "</center></th><th class = 'danger'><center>" 
							+ netChange + "</center></th><th class = 'danger'><center>" + percentChange + "</center></th></tr>");  
					}

					else 				
						$("#body").append("<tr><th><center>"+ symbol + "</center></th><th><center>" + name + "</center></th><th><center>" + volume 
							+ "</center></th><th><center>" + price + "</center></th><th><center>" 
							+ netChange + "</center></th><th><center>" + percentChange + "</center></th></tr>"); 
					
				} 
			}
		});
	});

	// sort stocks of letter A
	$('button#A').click(function() {  ajaxGetSpecificLetter("A") });

	// sort stocks of letter B
	$('button#B').click(function() {  ajaxGetSpecificLetter("B") });

	// sort stocks of letter C
	$('button#C').click(function() {  ajaxGetSpecificLetter("C") });

	// sort stocks of letter D
	$('button#D').click(function() {  ajaxGetSpecificLetter("D") });

	// sort stocks of letter E
	$('button#E').click(function() {  ajaxGetSpecificLetter("E") });

	// sort stocks of letter F
	$('button#F').click(function() {  ajaxGetSpecificLetter("F") });	

	// sort stocks of letter G
	$('button#G').click(function() {  ajaxGetSpecificLetter("G") });

	// sort stocks of letter H
	$('button#H').click(function() {  ajaxGetSpecificLetter("H") });

	// sort stocks of letter I
	$('button#I').click(function() {  ajaxGetSpecificLetter("I") });

	// sort stocks of letter J
	$('button#J').click(function() {  ajaxGetSpecificLetter("J") });

	// sort stocks of letter K
	$('button#K').click(function() {  ajaxGetSpecificLetter("K") });

	// sort stocks of letter L
	$('button#L').click(function() {  ajaxGetSpecificLetter("L") });

	// sort stocks of letter M
	$('button#M').click(function() {  ajaxGetSpecificLetter("M") });

	// sort stocks of letter N
	$('button#N').click(function() {  ajaxGetSpecificLetter("N") });

	// sort stocks of letter O
	$('button#O').click(function() {  ajaxGetSpecificLetter("O") });;

	// sort stocks of letter P
	$('button#P').click(function() {  ajaxGetSpecificLetter("P") });

	// sort stocks of letter Q
	$('button#Q').click(function() {  ajaxGetSpecificLetter("Q") });

	// sort stocks of letter R
	$('button#R').click(function() {  ajaxGetSpecificLetter("R") });

	// sort stocks of letter S
	$('button#S').click(function() {  ajaxGetSpecificLetter("S") });

	// sort stocks of letter T
	$('button#T').click(function() {  ajaxGetSpecificLetter("T") });

	// sort stocks of letter U
	$('button#U').click(function() {  ajaxGetSpecificLetter("U") });

	// sort stocks of letter V
	$('button#V').click(function() {  ajaxGetSpecificLetter("V") });

	// sort stocks of letter W
	$('button#W').click(function() {  ajaxGetSpecificLetter("W") });;

	// sort stocks of letter X
	$('button#X').click(function() {  ajaxGetSpecificLetter("X") });

	// sort stocks of letter Y
	$('button#Y').click(function() {  ajaxGetSpecificLetter("Y") });

	// sort stocks of letter R
	$('button#Z').click(function() {  ajaxGetSpecificLetter("Z") });

	// this is going to get the input from the search box and reprint the table 
	$('button#search').click(function() {
		$('#body').empty();

		var input = $('input#srch').val();
		
		var flag = 0; 
		var getID; 
		$.ajax( { 
			url:'/stocks',
			type: 'GET', 
			dataType: 'json', 
			async: false,
			cache: false,
			success: function (data) { 
				// find the correct symbol to search for 
				for (var i = 0; i < data.length; i++) { 
					if (data[i].symbol == input) { flag = 1; getID = data[i]._id; }
				}
			}
		}); 

		// we set a flag in the above ajax call that determines that there was indeed a search result for the user
		if (flag == 1) {
			$.ajax( { 
				// demonstrate how it is possible to get a stock by its only its ID, print it
				url: '/stocks/'+getID, 
				type: 'GET', 
				dataType: 'json', 
				async: false,
				cache: false,
				success: function(data) { 
					$('#body').empty();
					
					var symbol = data.symbol;
					var name = data.compName; 
					var price = data.price; 
					var percentChange = data.percentChange; 
					var netChange = data.netChange;
					var volume = data.volume;	
					volume = numberWithCommas(volume);

					// for formating purposes... prints a green colored background on netchange and percentchange if they are positive
					if (netChange > 0) {
						$("#body").append("<tr><th><center>"+ symbol + "</center></th><th><center>" + name + "</center></th><th><center>" + volume 
							+ "</center></th><th><center>" + price + "</center></th><th class = 'success'><center>" 
							+ netChange + "</center></th><th class = 'success'><center>" + percentChange + "</center></th></tr>");  
					} 

					// prints a red colored background on netchange and percentchange if they are negative
					else if (netChange < 0) { 
						$("#body").append("<tr><th><center>"+ symbol + "</center></th><th><center>" + name + "</center></th><th><center>" + volume 
							+ "</center></th><th><center>" + price + "</center></th><th class = 'danger'><center>" 
							+ netChange + "</center></th><th class = 'danger'><center>" + percentChange + "</center></th></tr>");  
					}

					else 				
						$("#body").append("<tr><th><center>"+ symbol + "</center></th><th><center>" + name + "</center></th><th><center>" + volume 
							+ "</center></th><th><center>" + price + "</center></th><th><center>" 
							+ netChange + "</center></th><th><center>" + percentChange + "</center></th></tr>"); 
				}
			});
		}

		// if there was no search results for the user, we have to let them know that
		else $("#body").append("<tr><th colspan = '7'><div class='alert alert-warning' role='alert'><center><b>Sorry!</b> No results matched!</center></div></th></tr"); 
	});
}

function hotStocks() { 
	function numberWithCommas(x) {
	    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
	//first, get the header for the table
	$("#hotStocksheader").empty();
	$("#hotStocksheader").append("<tr><th><center>SYMBOL</center></th><th><center>COMPANY NAME</center></th><th><center>VOLUME</center>"
		+ "</th><th><center>PRICE</center></th><th><center>NET CHANGE</center></th><th><center>PERCENT CHANGE</center></th></tr>");
	
	// if the user chooses to view the hottest stocks sorted by their net price
	$('button#net').click(function() { 
		$('#hotStocksbody').empty(); 
		
		$.ajax( {
			url:'/stocks', 
			type: 'GET', 
			dataType: 'json', 
			async: false, 
			cache: false, 
			success: function (data) {
				// sort all the stocks based on their net change
				data.sort(function (a, b) { 
					var keyA = parseFloat(a.netChange); 
					var keyB = parseFloat(b.netChange); 

					if (keyA < keyB) return -1; 
					if (keyA > keyB) return 1;
					else return 0;
				});
				
				// print only the top 10 stocks based on their net change
				for (var i = (data.length-1); i >= (data.length-10); i--) { 
					if (i < 0) break;
					var symbol = data[i].symbol;
					var name = data[i].compName; 
					var price = data[i].price; 
					var percentChange = data[i].percentChange; 
					var netChange = data[i].netChange;
					var volume = data[i].volume;
					volume = numberWithCommas(volume);	

  					// for formating purposes... prints a green colored background on netchange and percentchange if they are positive
					if (netChange > 0) {
						$("#hotStocksbody").append("<tr><th><center>"+ symbol + "</center></th><th><center>" + name + "</center></th><th><center>" + volume 
							+ "</center></th><th><center>" + price + "</center></th><th class = 'success'><center>" 
							+ netChange + "</center></th><th class = 'success'><center>" + percentChange + "</th></tr>");  
					} 

					// prints a red colored background on netchange and percentchange if they are negative
					else if (netChange < 0) { 
						$("#hotStocksbody").append("<tr><th><center>"+ symbol + "</center></th><th><center>" + name + "</center></th><th><center>" + volume 
							+ "</center></th><th><center>" + price + "</center></th><th class = 'danger'><center>" 
							+ netChange + "</center></th><th class = 'danger'><center>" + percentChange + "</th></tr>");  
					}

					else 				
						$("#hotStocksbody").append("<tr><th><center>"+ symbol + "</center></th><th><center>" + name + "</center></th><th><center>" + volume 
							+ "</center></th><th><center>" + price + "</center></th><th><center>" 
							+ netChange + "</center></th><th><center>" + percentChange + "</th></tr>"); 
					
				}

			}

		});
	}); 

	// if the user selects that they want to show the hot stocks sorted by their percent change
	$('button#percent').click(function() { 
		$('#hotStocksbody').empty(); 
		
		$.ajax( {
			url:'/stocks', 
			type: 'GET', 
			dataType: 'json', 
			async: false, 
			cache: false, 
			success: function (data) {
				// sort all the stocks based on their percent change
				data.sort(function (a, b) { 
					var keyA = parseFloat(a.percentChange); 
					var keyB = parseFloat(b.percentChange); 

					if (keyA < keyB) return -1; 
					if (keyA > keyB) return 1;
					else return 0;
				});
				
				// only print the top 10 stocks
				for (var i = (data.length-1); i >= (data.length-10); i--) { 
					if (i < 0) break;
					var symbol = data[i].symbol;
					var name = data[i].compName; 
					var price = data[i].price; 
					var percentChange = data[i].percentChange; 
					var netChange = data[i].netChange;
					var volume = data[i].volume;	
					volume = numberWithCommas(volume);

					// for formating purposes... prints a green colored background on netchange and percentchange if they are positive
					if (netChange > 0) {
						$("#hotStocksbody").append("<tr><th><center>"+ symbol + "</center></th><th><center>" + name + "</center></th><th><center>" + volume 
							+ "</center></th><th><center>" + price + "</center></th><th class = 'success'><center>" 
							+ netChange + "</center></th><th class = 'success'><center>" + percentChange + "</th></tr>");  
					} 

					// prints a red colored background on netchange and percentchange if they are negative
					else if (netChange < 0) { 
						$("#hotStocksbody").append("<tr><th><center>"+ symbol + "</center></th><th><center>" + name + "</center></th><th><center>" + volume 
							+ "</center></th><th><center>" + price + "</center></th><th class = 'danger'><center>" 
							+ netChange + "</center></th><th class = 'danger'><center>" + percentChange + "</th></tr>");  
					}

					else 				
						$("#hotStocksbody").append("<tr><th><center>"+ symbol + "</center></th><th><center>" + name + "</center></th><th><center>" + volume 
							+ "</center></th><th><center>" + price + "</center></th><th><center>" 
							+ netChange + "</center></th><th><center>" + percentChange + "</th></tr>"); 
					
				}
			}
		});
	}); 

	// if the user selects that they want to show the hot stocks sorted by their total volume
	$('button#volume').click(function() { 
		$('#hotStocksbody').empty(); 
		
		$.ajax( {
			url:'/stocks', 
			type: 'GET', 
			dataType: 'json', 
			async: false, 
			cache: false, 
			success: function (data) {
				// sort the data from lowest to highest
				data.sort(function (a, b) { 
					var keyA = parseFloat(a.volume);
					var keyB = parseFloat(b.volume);

					if (keyA < keyB) return -1; 
					if (keyA > keyB) return 1;
					else return 0;
				});
				
				// then print the list with the highest first 
				for (var i = (data.length-1); i >= (data.length-10); i--) { 
					if (i < 0) break;
					var symbol = data[i].symbol;
					var name = data[i].compName; 
					var price = data[i].price; 
					var percentChange = data[i].percentChange; 
					var netChange = data[i].netChange;
					var volume = data[i].volume;	
					volume = numberWithCommas(volume);

					// show a positive effect if the net change is positive (green shade)
					if (netChange > 0) {
						$("#hotStocksbody").append("<tr><th><center>"+ symbol + "</center></th><th><center>" + name + "</center></th><th><center>" + volume 
							+ "</center></th><th><center>" + price + "</center></th><th class = 'success'><center>" 
							+ netChange + "</center></th><th class = 'success'><center>" + percentChange + "</th></tr>");  
					} 

					// show a negative effect if the net change is negative (red shade)
					else if (netChange < 0) { 
						$("#hotStocksbody").append("<tr><th><center>"+ symbol + "</center></th><th><center>" + name + "</center></th><th><center>" + volume 
							+ "</center></th><th><center>" + price + "</center></th><th class = 'danger'><center>" 
							+ netChange + "</center></th><th class = 'danger'><center>" + percentChange + "</th></tr>");  
					}

					else 				
						$("#hotStocksbody").append("<tr><th><center>"+ symbol + "</center></th><th><center>" + name + "</center></th><th><center>" + volume 
							+ "</center></th><th><center>" + price + "</center></th><th><center>" 
							+ netChange + "</center></th><th><center>" + percentChange + "</th></tr>"); 
					
				}
			}
		});
	}); 
}

function stockPortfolio() { 
	
	// this should always be showing the data, so implement a GET request outside of everything that is going to 
	// return all the values for the logged in user 
	function numberWithCommas(x) {
	    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	$("#portfolioHeader").empty();
	$("#portfolioHeader").append("<tr><th><center>SYMBOL</center></th><th><center>COMPANY NAME</center></th><th><center>VOLUME</center>"
		+ "</th><th><center>PRICE</center></th><th><center>NET CHANGE</center></th><th><center>PERCENT CHANGE</center></th></tr>");

	// ajax request that gets all the portfolio type object, but on the server side it only returns the values that are specific for the user
	// that is logged in
	$.ajax( { 
		url: '/portfolio', 
		type: 'GET', 
		dataType: 'json', 
		async: false, 
		cache: false,
		success: function(data) {
			// if i have done this right, data should only contain the portfolio stocks of the logged in user
			// yes, i did it right! so now i have all the correct data per person!
			
			$('#portfolioBody').empty();

			// if there is data to be shown, we can continue
			if (data) { 
				for (var i = 0; i < data.length; i++) { 
					var symbol = data[i].symbol; 
					var name = data[i].compName; 
					var price = data[i].price; 
					var percentChange = data[i].percentChange; 
					var netChange = data[i].netChange;
					var volume = data[i].volume; 
					volume = numberWithCommas(volume);

					// show a positive effect if the net change is positive (green shade)
					if (netChange > 0) {
						$("#portfolioBody").append("<tr><th><center>"+ symbol + "</center></th><th><center>" + name + "</center></th><th><center>" + volume 
							+ "</center></th><th><center>" + price + "</center></th><th class = 'success'><center>" 
							+ netChange + "</center></th><th class = 'success'><center>" + percentChange + "</center></th></tr>");  
					} 

					// show a negative effect if the net change is negative (red shade)
					else if (netChange < 0) { 
						$("#portfolioBody").append("<tr><th><center>"+ symbol + "</center></th><th><center>" + name + "</center></th><th><center>" + volume 
							+ "</center></th><th><center>" + price + "</center></th><th class = 'danger'><center>" 
							+ netChange + "</center></th><th class = 'danger'><center>" + percentChange + "</center></th></tr>");  
					}

					else 				
						$("#portfolioBody").append("<tr><th><center>"+ symbol + "</center></th><th><center>" + name + "</center></th><th><center>" + volume 
							+ "</center></th><th><center>" + price + "</center></th><th><center>" 
							+ netChange + "</center></th><th><center>" + percentChange + "</center></th></tr>"); 
					
				} 
			}
			
		}
	});

	// this is for adding a new stock to a user's portfolio 
	$("button#addNew").click(function() { 
		var newStock = $("#addNewSymbol").val();		// get the value they wish to add
		$("#addNewSymbol").val(""); 					// set the box back to nothing (it will show the placeholder text)

		// do an ajax request that will get ALL stocks, we need to search through all stocks to find the one we want to add!
		$.ajax ({
			url: '/stocks', 
			type: 'GET',
			dataType: 'json', 
			async: false, 
			cache: false, 
			success: function(data) { 
				if (data.length == 0) alert("Sorry, no stocks match your reqest!");
				else {
					for (var i = 0; i < data.length; i++) { 
						// if we find the symbol we wish to add, submit another ajax request (a post) to the portfolios collection
						if (data[i].symbol == newStock) { 	
							
							$.ajax( { 
								url: '/portfolio', 
								type: 'POST', 
								dataType: 'json', 
								data: { 
									symbol: data[i].symbol, 
									compName: data[i].compName,
									volume: data[i].volume, 
									percentChange: data[i].percentChange,
									netChange: data[i].netChange,
									price: data[i].price
								}

								// note: on the server end we will also add the user id into the post to uniquely identify this entry
							});
						}
					}	
				}
			}
		});
	});
	
	// this is used for removing ONE stock from a user's portfolio
	$("button#delete").click(function() { 

		var deleteStock = $("#addNewSymbol").val(); 	// get the stock they wish to delete
		$("#addNewSymbol").val("");						// set the text back to "" (placeholder will be shown)

		// submit an ajax request that gets all the portfolio stocks; on the server side we will filter the ones specific to the
		// current user
		$.ajax( { 
			url: '/portfolio', 
			type: 'GET', 
			dataType: 'json', 
			async: false,
			cache: false, 
			success: function(data) {

				for (var i = 0; i < data.length; i++) { 
					// if the stock currently exists in that users portfolio, delete it
					if (data[i].symbol == deleteStock) {
						// show that it is possible to delete a single stock using its id in the database
						$.ajax( { 
							url: '/portfolio/'+data[i]._id,
							type: 'DELETE'
						});
					}
				}
			}
		});
	}); 

	// deletes allllll the user's portfolio, completely clears it, never to get it back
	$("button#deleteAll").click(function() { 
		$.ajax( {
			url: '/portfolio', 
			type: 'DELETE', 
			success: function() { 
				alert("deleting all stocks in your portfolio");
			}
		});
	});
}

// this is right, dont touch this
// this is to load all the data for all three sections at the beginning 
function startAll() { 
	allStocks(); 
	hotStocks();
	stockPortfolio();
}

window.onload = startAll; 
