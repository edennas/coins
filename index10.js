var coinsLoadTime = {};
var chosenCoins = [];

$(document).ready(() => {

	localStorage.clear();
	sessionStorage.clear();
	
	var chosenCoinsInJson = { coins: [] };
	var chosenCoinsInJsonAsString = sessionStorage.getItem("chosenCoins");;
	if (chosenCoinsInJsonAsString != null) {
		chosenCoinsInJson = JSON.parse(chosenCoinsInJsonAsString);
		if (chosenCoinsInJson != null) {
			chosenCoins = chosenCoinsInJson["coins"];
		}
	}
	$('#loadingmessage').show();

	$.ajax({
	

		url: `https://api.coingecko.com/api/v3/coins/list`,
		type: "GET",

		complete: function (result) {
			
			for (let i = 0; i < 1000; i++) {
				let symbol = result.responseJSON[i].symbol.toUpperCase();
				let name = result.responseJSON[i].name
				let id = result.responseJSON[i].id
				$('#loadingmessage').hide();

				$("#container").append
					(`<div class ="card" cardSymbol="${symbol}">
						${symbol + '<br />' + name}
						</br></br> 
						<div id ="togbut">
							<label class="switch">
							<input type="checkbox" class="myToggle" 
							coinId="${id}" val="${symbol}" coinName="${name}" data-toggle="toggle" data-size="mini" 
							data-onstyle="danger" data-style="quick">
							<span class="slider round"></span></label>
							</br></br></div>
                            <button type="button" id="${id}" class="btn moreinfo btn-warning btn-xs" 
							data-toggle="collapse" data-target="#card-${id}" >More info</button>
                            <div id="card-${id}" class="collapse"></div>
					  </div>`)

			}

			// MORE INFORMATION-clicking on "moreinfo" sends ajax request & 
			// creates a collapser with a picture of a coin and value in usd,nis,eur

			$('.moreinfo').click(function () {

				var id = $(this).attr('id');
				handleMoreInfoButtonClick(id);
			});

			$('.myToggle').click(function (event) {

				var countCheckedToggles = 0;
				$('.myToggle').each(function (i, toggleElement) {
					if ($(toggleElement).prop('checked') == true) {
						countCheckedToggles++;
					}
				});

				if ($(this).prop('checked') == true) {
					var coinIdNotToDisplayInModal = $(this).attr('coinId');
					if (countCheckedToggles > 5) {
						event.preventDefault();
						showModal(coinIdNotToDisplayInModal);
						return;
					}
				}

				var coinSymbol = $(this).attr('val');
				//alert("toggle val:" + coinSymbol + "checked?:" + $(this).prop("checked") );

				//If the toggle button is checked the adding the coin to chosenCoins otherwise 
				//removes the coin from chosenCoins
				if ($(this).prop("checked")) {
					if ($.inArray(coinSymbol, chosenCoins) < 0) {
						chosenCoins.push(coinSymbol);
					};
				}
				else {
					if ($.inArray(coinSymbol, chosenCoins) >= 0) {
						chosenCoins.splice($.inArray(coinSymbol, chosenCoins), 1);  //Removes the coin from the chosenCoins array
					};
				}

				var chosenCoinsInJson = { "coins": chosenCoins };
				sessionStorage.setItem("chosenCoins", JSON.stringify(chosenCoinsInJson));
			});

			$('.myToggle').each(function (i, toggleElement) {
				$.each(chosenCoins, function (j, coinSymbol) {
					if ($(toggleElement).attr('val') === coinSymbol) {
						$(toggleElement).prop('checked', true);
					}
				});
			});

		},
		error: function (result) {
			alert(`Problem type ${result}`)
		}
	});


	$("#searchButton").on("click", function () {

		var searchedSymbol = $("#search").val().toLowerCase();

		if (searchedSymbol.trim().length > 0) {
			event.preventDefault();
		}

		$("#container .card").each(function () {
			//$(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
			//console.log("in filter: " + $(this).attr('cardSymbol'));
			//result = $(this).attr('cardSymbol').toLowerCase() === value;
			//return result;
			//if ($(this).attr('cardSymbol').toLowerCase() === searchedSymbol) {
			//		alert("equals: " + searchedSymbol);
			//  }

			if ($(this).attr('cardSymbol').toLowerCase() != searchedSymbol) {

				//if ($(this).attr('cardSymbol').toLowerCase()==="zcn") {
				//	alert("removing!!!: " + searchedSymbol);
				//}


				$(this).remove();
			}
		});
	});


//end of document ready
});

//more info
function loadAjaxAndSaveInLocalStorage(id) {
	$('#loadingmessage').show();

	$.ajax({
		url: `https://api.coingecko.com/api/v3/coins/${id}`,
		type: "GET",

		success: function (data) {
			var img1 = "<img src=\"" + data.image.thumb + "\"/> <br><br>";
			var usd = data.market_data.current_price.usd.toFixed(4);
			var eur = data.market_data.current_price.eur.toFixed(4);
			var ils = data.market_data.current_price.ils.toFixed(4);
			$('#card-' + id).html(img1).append(usd + " $").append("<br/>")
				.append(eur + " €").append("<br/>").append(ils + " ₪");
			coinsLoadTime[id] = new Date();
			var coin = { "img": img1, "usd": usd, "eur": eur, "ils": ils };
			localStorage.setItem(id, JSON.stringify(coin));
			// alert("savedCoin: id=" + id + " details=" + localStorage.getItem (id) );
			$('#loadingmessage').hide();

		}
	});
}
//pressing more info
function handleMoreInfoButtonClick(idAttributeInButton) {


	var id = idAttributeInButton; //$(this).attr('id');
	var isTimePassed = false;

	var startTime = coinsLoadTime[id];
	var endTime = new Date();
	var timeDiff = endTime - startTime; //in ms
	// strip the ms

	var passedSeconds = timeDiff / 1000;
	isTimePassed = passedSeconds > 2;


	var coinInLocalStorage = localStorage.getItem(id);
	if (isTimePassed) {
		// alert("time passed");
		loadAjaxAndSaveInLocalStorage(id);
	}
	else {
		if (coinInLocalStorage === null) {
			loadAjaxAndSaveInLocalStorage(id);

		}
		else {
			// alert("from local storage: "+ localStorage.getItem(id));
			var coinAsJsonObj = JSON.parse(localStorage.getItem(id));
			var img1 = "<img src='" + coinAsJsonObj["img"] + "' <br><br>";
			var usd = coinAsJsonObj["usd"];
			// alert("usd=" + usd);
			var eur = coinAsJsonObj["eur"];
			var ils = coinAsJsonObj["ils"];
			$('#card-' + id).html(img1).append(usd + " $").append("<br/>")
				.append(eur + " €").append("<br/>").append(ils + " ₪");
		}

	}
	// console.log(id);

}

function showModal(coinIdNotToDisplayInModal) {

	$("#modalBody").html("");

	$('.myToggle').each(function (i, toggleElement) {

		if ($(this).attr("coinId") == coinIdNotToDisplayInModal) {
			return;
		}

		if ($(toggleElement).prop('checked') == true) {
			let symbol = $(toggleElement).attr('val');
			let name = $(toggleElement).attr('coinName');
			let id = $(toggleElement).attr('coinId');

			$("#modalBody").append
				(`<div class ="card" cardSymbol="${symbol}">
					${symbol + '<br />' + name}
					</br></br> 
					<div id ="togbutInModal">
						<label class="switch"><input type="checkbox" checked="true" class="ToggleInModal" 
						coinId="${id}" val="${symbol}" coinName="${name}" data-toggle="toggle" data-size="mini" 
						data-onstyle="danger" data-style="quick">
						<span class="slider round"></span></label>
				  	</div>`)
		}
	});

	$(".ToggleInModal").on("click", function () {
		let coinId = $(this).attr('coinId');
		$('.myToggle').each(function (i, toggleElement) {
			if ($(this).attr("coinId") == coinId) {
				$(this).prop('checked', false);
			}
		});
		$('#myModal').modal('hide');
	});

	$('#myModal').modal('show');

}

