let selectedCharacter = "default";

function setCharacter(character) {
    // Remove active class from all characters
    document.querySelectorAll('.character-card').forEach(card => {
        card.classList.remove('active');
    });
    
    // Add active class to selected character
    const selectedCard = document.querySelector(`.character-card[onclick*="${character}"]`);
    if (selectedCard) {
        selectedCard.classList.add('active');
    }

    selectedCharacter = character;
    
    // Update the initial bot message based on character
    const initialMessages = {
        'default': ': Write a Python function that checks if a number is even or odd!',
        'robot': ' : Write a Python function that checks if a number is even or odd!',
        'cat': ' : Write a Python script that prints \'Meow\' 5 times!',
        'wizard': '🧙 : Use Python to create a magical name generator!'
    };

    fetch("/set_character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ character: character })
    })
    .then(response => response.json())
    .then(data => {
        showToast(data.message);
        
        // Update the initial message
        const chatBox = document.getElementById('chat-box');
        const firstMessage = chatBox.querySelector('.message.bot');
        if (firstMessage) {
            firstMessage.innerHTML = `<i class="fas fa-${character === 'default' ? 'robot' : character}"></i> ${initialMessages[character]}`;
        }
    })
    .catch(error => console.error("Error:", error));
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 2000);
    }, 100);
}

// Add event listener for Enter key in input field
document.getElementById('user-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

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

function formatResponse(text) {
    // Format code blocks
    text = text.replace(/```python([\s\S]*?)```/g, function(match, code) {
        return `<pre><code>${code.trim()}</code></pre>`;
    });
    
    // Format bullet points
    text = text.replace(/\* (.*?)(\n|$)/g, '<li>$1</li>');
    if (text.includes('<li>')) {
        text = '<ul>' + text + '</ul>';
    }
    
    return text;
}

function sendMessage() {
    let userInput = document.getElementById("user-input").value;
    if (!userInput.trim()) return;

    let chatBox = document.getElementById("chat-box");

    // Create user message
    let userMessage = document.createElement("div");
    userMessage.className = "message user";
    userMessage.innerHTML = userInput;
    chatBox.appendChild(userMessage);

    document.getElementById("user-input").value = "";

    fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput })
    })
    .then(response => response.json())
    .then(data => {
        // Create bot message with formatted response
        let botMessage = document.createElement("div");
        botMessage.className = `message bot ${selectedCharacter}`;
        botMessage.innerHTML = `
            <i class="fas fa-${selectedCharacter === 'default' ? 'robot' : selectedCharacter}"></i>
            ${formatResponse(data.reply)}
        `;
        chatBox.appendChild(botMessage);

        // Update challenge message styling if needed
        if (userInput.toLowerCase().includes("challenge")) {
            let challengeMessage = document.createElement("div");
            challengeMessage.className = "message bot challenge";
            let challenges = {
                "robot": "🤖 [Robot] Challenge: Write a Python function that checks if a number is even or odd!",
                "cat": "🐱 [Cat] Challenge: Write a Python script that prints 'Meow' 5 times!",
                "wizard": "🧙‍♂️ [Wizard] Challenge: Use Python to create a magical name generator!",
                "default": "🤖 [Robot] Challenge: Write a Python function that checks if a number is even or odd!"
            };

            challengeMessage.innerHTML = `<i class="fas fa-${selectedCharacter === 'default' ? 'robot' : selectedCharacter}"></i>${challenges[selectedCharacter]}`;
            chatBox.appendChild(challengeMessage);
        }

        chatBox.scrollTop = chatBox.scrollHeight;
    })
    .catch(error => console.error("Error:", error));
}
