//answer cheat: type state(); in console

//Fetch the questions
let currentPoints = 0;
let priorPoints = 0;
let gameActive = false;
let cluesCount = 0;
let currentClue = 0;
let gamePointer = 0;
//let dataQandA = {}; //used in another version
let arrayQ = [];
let arrayA = [];
let arrayR = [];
let answersShuffled = false;
let categoriesCovered = "";
let bufferArrayQ = [];
let bufferArrayA = [];
let bufferArrayR = [];

//all cards: display = none; (except active card: display = 'block';)
function initCards() {
	const card1 = document.getElementById("card1");
	card1.style.display = 'block';
	const card2 = document.getElementById("card2");
	card2.style.display = 'none';
	const card3 = document.getElementById("card3");
	card3.style.display = 'none';
	const card4 = document.getElementById("card4");
	card4.style.display = 'none';
	const card5 = document.getElementById("card5");
	card5.style.display = 'none';
	const card6 = document.getElementById("card6");
	card6.style.display = 'none';
}
//card1 Home
//card2 Q and A
//card3 ignored for now: use 2
//card4 incorrect answer
//card5 view correct answer
//card6 Credits

//https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
//The de-facto unbiased shuffle algorithm is the Fisher-Yates (aka Knuth) Shuffle.
//https://github.com/coolaj86/knuth-shuffle
function shuffle(array) {
	var currentIndex = array.length, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;
		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [
			array[randomIndex], array[currentIndex]];
	}
	answersShuffled = true; //added RL
	return array;
}
//end https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array

function fetchQandA(category) {
	fetch(`https://jservice.io/api/clues?category=${category}`)
		.then(response => response.json())
		.then(data => {
			cluesCount = data[0].category.clues_count;
			currentClue = 0; //20210816 RL
			for (i = 0; i < data[0].category.clues_count; i += 1) {
				arrayQ[i] = data[i].question;
				if (arrayQ[i].length === 0) {
					arrayQ[i] = "Question is blank: The answer is: " + data[i].answer
					console.log("failure: arrayQ[i].length: " + data[i].question);
				}
				arrayA[i] = data[i].answer;
				arrayR[i] = i;
			}

			//shuffle order of questions and answers, ie, via arrayR and gamePointer 20210816 RL
			for (i = 0; i < arrayR.length; i++) {
				if (arrayR[i] === i) {
					arrayR = shuffle(arrayR);
				}
			}
			gamePointer = parseInt(arrayR[0]); //20210816 RL currentClue = 0
			const tblTwoBlankQuestion = document.getElementById("tblTwoBlankQuestion"); //card2 is for user to type answer
			tblTwoBlankQuestion.value = arrayQ[gamePointer];
			const incorrectAnswerBlankQuestion = document.getElementById("incorrectAnswerBlankQuestion"); //card4
			incorrectAnswerBlankQuestion.value = arrayQ[gamePointer];
			const revealAnswerBlankQuestion = document.getElementById("revealAnswerBlankQuestion"); //card5
			revealAnswerBlankQuestion.value = arrayQ[gamePointer];
			const expectedAnswer = document.getElementById("expectedAnswer"); //card5
			const blankAnswer = document.getElementById("blankAnswer"); //card2
			blankAnswer.value = "";
			expectedAnswer.value = arrayA[gamePointer];
		});
}

//Fetch a random category
let dataCategoryName = "";
function fetchRandomCategory() {
	fetch(`https://jservice.io/api/random`)
		.then(response => response.json())
		.then(data => {
			dataCategoryName = data[0].category.title;
			categoriesCovered = categoriesCovered + dataCategoryName + ", "
			const category1 = document.getElementById("category1"); //card2 user input
			category1.innerText = dataCategoryName;
			const category3 = document.getElementById("category3"); //card4
			category3.innerText = dataCategoryName;
			const category4 = document.getElementById("category4"); //card5
			category4.innerText = dataCategoryName;
			fetchQandA(data[0].category_id);
		});
}

function startGame() {
	const card1 = document.getElementById("card1"); //home
	card1.style.display = 'none';
	const card2 = document.getElementById("card2"); //user answer entry
	card2.style.display = 'block';
	gameActive = true;
}

function cleanAnswer(answer) {
	// "\"The Rules\"" "The Rules"
	//Walt\\'s faults
	//<i> </i>
	//\"
	//cash (or collect) on delivery
	//Uncaught TypeError: Assignment to constant variable.
	//    at submitAnswer (code.js:141)
	//    at HTMLButtonElement.onclick ((index):89)
	return answer
}

//future version: improve check re: gamePointer v arrayR.length use a pre-fetched buffer for next Q&A
function submitAnswer() {
	const answer = arrayA[gamePointer]
	const cleanedAnswer = cleanAnswer(answer);

	const element = document.getElementById("blankAnswer"); //card2 answer from user
	const blankAnswer = element.value;
	if (answer.toLowerCase() === blankAnswer.toLowerCase()) {
		currentClue = currentClue + 1;
		gamePointer = parseInt(arrayR[currentClue]); //20210816 RL
		currentPoints = currentPoints + 1;
		const points1 = document.getElementById("points1"); //card2 user input
		points1.innerText = `Correct, Current Points: ${currentPoints}`
		if (currentClue < cluesCount) {
			const tblTwoBlankQuestion = document.getElementById("tblTwoBlankQuestion"); //card2 is for user to type answer
			tblTwoBlankQuestion.value = arrayQ[gamePointer];
			const incorrectAnswerBlankQuestion = document.getElementById("incorrectAnswerBlankQuestion"); //card4
			incorrectAnswerBlankQuestion.value = arrayQ[gamePointer];
			const revealAnswerBlankQuestion = document.getElementById("revealAnswerBlankQuestion"); //card5
			revealAnswerBlankQuestion.value = arrayQ[gamePointer];
			const expectedAnswer = document.getElementById("expectedAnswer"); //card5
			expectedAnswer.value = arrayA[gamePointer];
			element.value = "";
		} else {
			cluesCount = 0;
			currentClue = 0;
			gamePointer = 0;
			arrayQ = [];
			arrayA = [];
			arrayR = [];
			answersShuffled = false;
			fetchRandomCategory();
		}

	} else {
		priorPoints = currentPoints;
		const points1 = document.getElementById("points1"); //card2 user input
		points1.innerText = `Current Points`
		currentPoints = 0;
		const points4 = document.getElementById("points4"); //card5
		points4.innerText = `Current Points: ${currentPoints}`
		const incorrectAnswerBlankQuestion = document.getElementById("incorrectAnswerBlankQuestion"); //card4
		incorrectAnswerBlankQuestion.value = arrayQ[gamePointer];
		const userAnswered = document.getElementById("userAnswered"); //card4
		userAnswered.value = blankAnswer;
		const card4 = document.getElementById("card4");
		card4.style.display = 'block';
		const card2 = document.getElementById("card2");
		card2.style.display = 'none';
	}
}

//card4 See Correct Answer
//const card4 = document.getElementById("card4");
//card4.style.display = 'none';
//const card5 = document.getElementById("card5");
//card5.style.display = 'block';
function seeCorrectAnswer() {
	const card4 = document.getElementById("card4");
	card4.style.display = 'none';
	const card5 = document.getElementById("card5");
	card5.style.display = 'block';
}
//card4 Start a New Game
//"Start a New Game": startGame();
//See Correct Answer
//seeCorrectAnswer();

//card5 "Exit Game"
function exitGame() {
	const card1 = document.getElementById("card1");
	card1.style.display = 'none';
	const card2 = document.getElementById("card2");
	card2.style.display = 'none';
	const card3 = document.getElementById("card3");
	card3.style.display = 'none';
	const card4 = document.getElementById("card4");
	card4.style.display = 'none';
	const card5 = document.getElementById("card5");
	card5.style.display = 'none';
	const card6 = document.getElementById("card6");
	card6.style.display = 'block';
}

function startNewGame() {
	currentPoints = 0;
	priorPoints = 0;
	gameActive = false;
	cluesCount = 0;
	currentClue = 0;
	gamePointer = 0;
	//let dataQandA = {}; //used in another version
	arrayQ = [];
	arrayA = [];
	arrayR = [];
	answersShuffled = false;
	initCards();
	fetchRandomCategory();
}

function state() {
	console.log("currentClue:" + currentClue);
	console.log("gamePointer:" + gamePointer);
	console.log("arrayQ[gamePointer]:" + arrayQ[gamePointer]);
	console.log("arrayA[gamePointer]:" + arrayA[gamePointer]);
	console.log("arrayR[currentClue]:" + arrayR[currentClue]);
	console.log("arrayR:" + arrayR);
}