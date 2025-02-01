let selectedCharacter = "robot";

function setCharacter(character) {
    selectedCharacter = character;
    if (!selectedCharacter) {
        return;
    }

    // Send selected character to the backend to persist it in the session
    fetch("/set_character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ character: character })
    })
    .then(response => response.json())
    .then(data => alert(data.message))
    .catch(error => console.error("Error:", error));
}

function setApiKey() {
    let apiKey = document.getElementById("api-key").value;
    if (!apiKey) {
        alert("Please enter an API key.");
        return;
    }

    fetch("/set_api_key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: apiKey })
    })
    .then(response => response.json())
    .then(data => alert(data.message))
    .catch(error => console.error("Error:", error));
}

function sendMessage() {
    let userInput = document.getElementById("user-input").value;
    if (!userInput.trim()) return;

    let chatBox = document.getElementById("chat-box");

    let userMessage = document.createElement("p");
    userMessage.className = "user";
    userMessage.innerText = userInput;
    chatBox.appendChild(userMessage);

    document.getElementById("user-input").value = "";

    fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput }) // No need to send character here, it's managed by session
    })
    .then(response => response.json())
    .then(data => {
        let botMessage = document.createElement("p");
        botMessage.className = `bot ${selectedCharacter}`; // Add character-specific styling
        botMessage.innerText = data.reply;
        chatBox.appendChild(botMessage);

        // Generate character-specific challenges if message includes 'challenge'
        if (userInput.toLowerCase().includes("challenge")) {
            let challengeMessage = document.createElement("p");
            challengeMessage.className = "bot challenge";

            let challenges = {
                "robot": "🤖 [Robot] Challenge: Write a Python function that checks if a number is even or odd!",
                "cat": "🐱 [Cat] Challenge: Write a Python script that prints 'Meow' 5 times!",
                "wizard": "🧙‍♂️ [Wizard] Challenge: Use Python to create a magical name generator!",
                "default": "🤖 [Robot] Challenge: Write a Python function that checks if a number is even or odd!"
            };

            challengeMessage.innerText = challenges[selectedCharacter];
            chatBox.appendChild(challengeMessage);
        }

        chatBox.scrollTop = chatBox.scrollHeight;
    })
    .catch(error => console.error("Error:", error));
}
