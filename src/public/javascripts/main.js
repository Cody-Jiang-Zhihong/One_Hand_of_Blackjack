document.addEventListener('DOMContentLoaded', () => {
    // Global variables to store the state of the game
    const playerHand = [];
    const computerHand = [];

    function shuffle(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    function generateDeck() {
        const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
        const faces = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        const deck = [];

        suits.forEach(suit => {
            faces.forEach(face => {
                deck.push({ face, suit });
            });
        });

        return shuffle(deck);
    }

    const deck = generateDeck();

    function setStartValues(deck, startValues) {
        const startCards = startValues.split(',').map(face => ({ face, suit: 'Diamonds' }));
        return [...startCards, ...deck];
    }

    function dealCards(deck) {
        const playerHand = [];
        const computerHand = [];
    
        // Deal cards in alternating fashion
        for (let i = 0; i < 2; i++) {
            computerHand.push(deck.shift());
            playerHand.push(deck.shift());
        }
    
        return { playerHand, computerHand };
    }

    function calculateHandTotal(hand) {
        let total = 0;
        let aces = 0;
    
        hand.forEach(card => {
            if (card.face === 'A') {
                aces += 1;
            } else if (['J', 'Q', 'K'].includes(card.face)) {
                total += 10;
            } else {
                total += parseInt(card.face);
            }
        });
    
        // Add aces as 11 or 1 depending on the current total
        for (let i = 0; i < aces; i++) {
            if (total + 11 > 21) {
                total += 1;
            } else {
                total += 11;
            }
        }
    
        return total;
    }

    function displayHand(hand, owner) {
        let handElement = document.querySelector(`.${owner}-hand`);
        if (!handElement) {
            handElement = document.createElement('div');
            handElement.classList.add(`${owner}-hand`, 'hand');
            document.querySelector('.game').appendChild(handElement);
        } else {
            // This clears only the inside of the hand element, preserving other hands.
            handElement.innerHTML = ''; 
        }

        hand.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card');
            
            const cardValue = document.createElement('div');
            cardValue.classList.add('value'); // Add class for styling
            cardValue.textContent = card.face;
            
            const cardSuit = document.createElement('div');
            cardSuit.classList.add('suit'); // Add class for styling
            cardSuit.textContent = card.suit;
    
            cardElement.appendChild(cardValue);
            cardElement.appendChild(cardSuit);
            
            handElement.appendChild(cardElement);
        });

        // Update the total display
        let totalElement = document.querySelector(`.${owner}-hand-total`);
        if (!totalElement) {
            totalElement = document.createElement('div');
            totalElement.classList.add(`${owner}-hand-total`);
            handElement.parentNode.insertBefore(totalElement, handElement.nextSibling); // Insert after the hand element
        }
        totalElement.textContent = `Total: ${calculateHandTotal(hand)}`;
    }

    

    function playerHit() {
        if (deck.length > 0) {
            const card = deck.shift(); // Take the next card from the deck
            playerHand.push(card); // Add the card to the player's hand
            displayHand(playerHand, 'player'); // Redisplay the player's hand

            if (calculateHandTotal(playerHand) > 21) {
                endGame(); // End the game if the player busts
            }
        } else {
            alert('No more cards in the deck.');
        }
    }

    function determineWinner() {
        const playerTotal = calculateHandTotal(playerHand);
        const computerTotal = calculateHandTotal(computerHand);
        
        // Player busts
        if (playerTotal > 21) {
            return 'Computer wins';
        }
        
        // Computer busts
        if (computerTotal > 21) {
            return 'Player wins';
        }
        
        // Compare totals
        if (playerTotal > computerTotal) {
            return 'Player wins';
        } else if (playerTotal < computerTotal) {
            return 'Computer wins';
        } else {
            return 'It\'s a tie';
        }
    }

    function saveGameResult(userInitials, computerScore, userScore) {
        fetch('/save-game', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userInitials, computerScore, userScore }),
        });
      }
      
      function displayGameHistory() {
        fetch('/game-history')
          .then(response => response.json())
          .then(history => {
            document.body.innerHTML = '<div id="history"></div>'; // Clear the page and add a div for history
            const historyDiv = document.getElementById('history');
      
            history.forEach(game => {
              const gameDiv = document.createElement('div');
              gameDiv.textContent = `Initials: ${game.userInitials}, Computer Score: ${game.computerScore}, User Score: ${game.userScore}`;
              historyDiv.appendChild(gameDiv);
            });
          });
      }
      
      function showHistoryButton() {
        const historyButton = document.createElement('button');
        historyButton.textContent = 'Show Game History';
        historyButton.addEventListener('click', displayGameHistory);
        document.body.appendChild(historyButton);
      }
    
    function endGame() {
        // Hide the hit and stand buttons as the game is over
        document.querySelector('.controls').style.display = 'none';
        
        // Determine the winner and display the result
        const result = determineWinner();
        const resultElement = document.createElement('div');
        resultElement.textContent = result;
        document.querySelector('.game').appendChild(resultElement);
        
        // Show the computer's hand total
        const computerHandElement = document.querySelector('.computer-hand');
        const computerTotalDiv = document.createElement('div');
        computerHandElement.appendChild(computerTotalDiv);

        // Add a form for user initials
        const form = document.createElement('form');
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Your initials';
        const submitButton = document.createElement('input');
        submitButton.type = 'submit';
        submitButton.value = 'Save';

        form.appendChild(input);
        form.appendChild(submitButton);
        document.body.appendChild(form);

        form.onsubmit = (e) => {
            e.preventDefault();
            saveGameResult(input.value, calculateHandTotal(computerHand), calculateHandTotal(playerHand));
            form.style.display = 'none'; // Hide the form after submitting
            showHistoryButton(); // Show the button to display game history
        };
    }

    function computerPlay() {
        while (calculateHandTotal(computerHand) < 17) {
            const card = deck.shift(); // Take the next card from the deck
            computerHand.push(card); // Add the card to the computer's hand
            // Optionally display the computer's hand after each hit
            displayHand(computerHand, 'computer');
        }
        // After the computer stands or busts, you would then call a function to end the game
        endGame();
    }

    function playerStand() {
        // Player decides to stand
        computerPlay(); // Let the computer take its turn
        endGame(); // After both have stood, determine the winner
    }

    function addGameControls() {
        const hitButton = document.createElement('button');
        hitButton.textContent = 'Hit';
        hitButton.addEventListener('click', playerHit);
    
        const standButton = document.createElement('button');
        standButton.textContent = 'Stand';
        standButton.addEventListener('click', playerStand);
    
        const controls = document.createElement('div');
        controls.classList.add('controls'); // Ensure this class is added for styling
        controls.appendChild(hitButton);
        controls.appendChild(standButton);

    
        document.querySelector('.game').appendChild(controls);
    }

    // Main function that sets up the game
    function main() {
        const form = document.querySelector('form');
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            this.classList.add('hidden'); // Hide the form

            // Clear previous game before setting up a new one
            const gameDiv = document.querySelector('.game');
            gameDiv.innerHTML = '';

            let deck = generateDeck();
            const startValues = document.getElementById('startValues').value;

            if (startValues) {
                deck = setStartValues(deck, startValues);
            }

            const { playerHand, computerHand } = dealCards(deck);
            displayHand(computerHand, 'computer');
            displayHand(playerHand, 'player');
            addGameControls(); // Add buttons for game actions
        });
    }

    // Start the main function to set up the game
    main();
});

document.addEventListener('DOMContentLoaded', main);