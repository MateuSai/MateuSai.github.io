import js.html.ButtonElement;
import js.html.Element;
import js.Browser;

enum Game {
	PLACEHOLDER;
	GAME_0;
	GAME_1;
	/* GAME_2; */
}

class Portfolio {
	static var activeGame = PLACEHOLDER;

	static var featuredGamesSection:Element;
	static var game0Button:Element;
	static var game1Button:Element;
	/* static var game2Button:Element; */

	static function main() {
		featuredGamesSection = Browser.document.getElementById("featured-games-section");

		game0Button = Browser.document.getElementById("game-0-button");
		game1Button = Browser.document.getElementById("game-1-button");
		/* game2Button = Browser.document.getElementById("game-2-button"); */
		game0Button.onclick = function() {switchToGame(GAME_0);};
		game1Button.onclick = function() {switchToGame(GAME_1);};
		/* game2Button.onclick = function() {switchToGame(GAME_2);}; */

		var gamesContainer = Browser.document.getElementById("games-container");
		
		for (previousButton in Browser.document.querySelectorAll(".previous-button")) {
			var p = cast(previousButton, ButtonElement);
			p.onclick = function() {
				gamesContainer.scrollLeft -= gamesContainer.clientWidth;
			}
		}
		for (nextButton in Browser.document.querySelectorAll(".next-button")) {
			var n = cast(nextButton, ButtonElement);
			n.onclick = function() {
				gamesContainer.scrollLeft += gamesContainer.clientWidth;
			}
		}
	}

	static function switchToGame(game: Game) {
		if (game == activeGame)
			return;

		switch (activeGame) {
			case PLACEHOLDER:
				Browser.document.getElementById("game-placeholder").remove();
			case GAME_0, GAME_1/* , GAME_2 */:
				Browser.document.getElementById(activeGame.getName().toLowerCase()).remove();
		}

		switch (game) {
			case PLACEHOLDER:
			case GAME_0:
				addGame("game_0", "https://itch.io/embed-upload/5195154?color=333333", "https://mateu-s.itch.io/godot-roguelike-tutorial", "Play Godot Roguelike Tutorial on itch.io");
			case GAME_1:
				addGame("game_1", "https://itch.io/embed-upload/5810929?color=3489e6", "https://mateu-s.itch.io/diarreo-adventures", "Play Diarreo Adventures on itch.io");
			/* case GAME_2:
				addGame("game_2", "https://itch.io/embed-upload/8429237?color=000000", "https://wekufu-studios.itch.io/a-new-home", "Play A New Home"); */
		}

		activeGame = game;
	}

	static function addGame(id:String, src:String, href:String, text:String) {
		var iframe = Browser.document.createIFrameElement();

		iframe.id = id;
		iframe.src = src;
		iframe.width = "100%";

		var a = Browser.document.createAnchorElement();

		a.href = href;
		a.textContent = text;

		iframe.appendChild(a);
		featuredGamesSection.appendChild(iframe);
	}
}