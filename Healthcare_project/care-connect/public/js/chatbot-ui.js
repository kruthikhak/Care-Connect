// Chatbot UI Implementation

// Initialize chatbot once DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Make sure the chatbot script has loaded before initializing
    if (typeof window.chatbot !== 'undefined' || typeof chatbot !== 'undefined') {
        initChatbot();
    } else {
        console.error('Chatbot object not found. Make sure chatbot.js is loaded first.');
        // Try again after a short delay
        setTimeout(() => {
            if (typeof window.chatbot !== 'undefined' || typeof chatbot !== 'undefined') {
                initChatbot();
            } else {
                console.error('Could not initialize chatbot. The chatbot.js script may not be loaded properly.');
            }
        }, 1000);
    }
});

function initChatbot() {
    // Create chatbot elements
    createChatbotElements();
    
    // Initialize event listeners
    initChatbotEvents();
    
    // Show welcome message
    setTimeout(() => {
        try {
            // Use window.chatbot as a fallback if chatbot is not directly accessible
            const bot = (typeof chatbot !== 'undefined') ? chatbot : window.chatbot;
            if (bot) {
                addBotMessage(bot.getRandomResponse('greetings'));
                showSuggestions();
            } else {
                console.error('Chatbot not available for welcome message');
            }
        } catch (error) {
            console.error('Error showing welcome message:', error);
        }
    }, 500);
}

function createChatbotElements() {
    // Create toggle button
    const toggleButton = document.createElement('button');
    toggleButton.className = 'chatbot-toggle';
    toggleButton.innerHTML = '<i class="bi bi-chat-dots-fill"></i>';
    toggleButton.id = 'chatbotToggle';
    
    // Create chatbot container
    const chatbotContainer = document.createElement('div');
    chatbotContainer.className = 'chatbot-container chatbot-hidden';
    chatbotContainer.id = 'chatbotContainer';
    
    // Create chatbot header
    const chatbotHeader = document.createElement('div');
    chatbotHeader.className = 'chatbot-header';
    chatbotHeader.innerHTML = `
        <h3><i class="bi bi-robot me-2"></i>Care Connect Assistant</h3>
        <div class="chatbot-header-icons">
            <button id="chatbotMinimize"><i class="bi bi-dash-lg"></i></button>
            <button id="chatbotMaximize"><i class="bi bi-arrows-angle-expand"></i></button>
            <button id="chatbotClose"><i class="bi bi-x-lg"></i></button>
        </div>
    `;
    
    // Create chatbot body
    const chatbotBody = document.createElement('div');
    chatbotBody.className = 'chatbot-body';
    chatbotBody.id = 'chatbotBody';
    
    // Create chatbot footer
    const chatbotFooter = document.createElement('div');
    chatbotFooter.className = 'chatbot-footer';
    chatbotFooter.innerHTML = `
        <input type="text" class="chatbot-input" id="chatbotInput" placeholder="Type your message here...">
        <button class="chatbot-send" id="chatbotSend"><i class="bi bi-send"></i></button>
    `;
    
    // Create suggestions container
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'chatbot-suggestions';
    suggestionsContainer.id = 'chatbotSuggestions';
    
    // Assemble chatbot
    chatbotContainer.appendChild(chatbotHeader);
    chatbotContainer.appendChild(chatbotBody);
    chatbotBody.appendChild(suggestionsContainer);
    chatbotContainer.appendChild(chatbotFooter);
    
    // Add to document
    document.body.appendChild(toggleButton);
    document.body.appendChild(chatbotContainer);
    
    // Add external stylesheets if not already present
    if (!document.querySelector('link[href="/css/chatbot.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = './css/chatbot.css';
        document.head.appendChild(link);
    }
    
    if (!document.querySelector('link[href*="bootstrap-icons"]')) {
        const iconLink = document.createElement('link');
        iconLink.rel = 'stylesheet';
        iconLink.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css';
        document.head.appendChild(iconLink);
    }
}

function initChatbotEvents() {
    // Toggle chatbot visibility
    document.getElementById('chatbotToggle').addEventListener('click', () => {
        const container = document.getElementById('chatbotContainer');
        container.classList.toggle('chatbot-hidden');
        if (!container.classList.contains('chatbot-hidden')) {
            document.getElementById('chatbotInput').focus();
        }
    });
    
    // Close chatbot
    document.getElementById('chatbotClose').addEventListener('click', () => {
        document.getElementById('chatbotContainer').classList.add('chatbot-hidden');
    });
    
    // Minimize chatbot
    document.getElementById('chatbotMinimize').addEventListener('click', () => {
        document.getElementById('chatbotContainer').classList.add('chatbot-hidden');
    });
    
    // Maximize/normalize chatbot
    document.getElementById('chatbotMaximize').addEventListener('click', () => {
        document.getElementById('chatbotContainer').classList.toggle('chatbot-maximized');
    });
    
    // Send message on button click
    document.getElementById('chatbotSend').addEventListener('click', sendMessage);
    
    // Send message on Enter key
    document.getElementById('chatbotInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

function sendMessage() {
    const inputElement = document.getElementById('chatbotInput');
    const message = inputElement.value.trim();
    
    if (message) {
        // Add user message to chat
        addUserMessage(message);
        
        // Clear input field
        inputElement.value = '';
        
        // Show typing indicator
        showTypingIndicator();
        
        // Process message and get response
        setTimeout(async () => {
            try {
                // Use window.chatbot as a fallback if chatbot is not directly accessible
                const bot = (typeof chatbot !== 'undefined') ? chatbot : window.chatbot;
                if (bot) {
                    const response = await bot.processMessage(message);
                    hideTypingIndicator();
                    
                    // Check if response is from server and includes suggestions
                    if (typeof response === 'object' && response.response && response.suggestions) {
                        addBotMessage(response.response);
                        showSuggestions(response.suggestions);
                    } else {
                        addBotMessage(response);
                        showSuggestions();
                    }
                } else {
                    console.error('Chatbot not available for processing message');
                    hideTypingIndicator();
                    addBotMessage("I'm sorry, I encountered an error. Please try again.");
                }
            } catch (error) {
                console.error('Error processing message:', error);
                hideTypingIndicator();
                addBotMessage("I'm sorry, I encountered an error. Please try again.");
            }
        }, 500);
    }
}

function addUserMessage(message) {
    const chatbotBody = document.getElementById('chatbotBody');
    const messageElement = document.createElement('div');
    messageElement.className = 'chatbot-message user';
    messageElement.textContent = message;
    chatbotBody.appendChild(messageElement);
    scrollToBottom();
}

function addBotMessage(message) {
    const chatbotBody = document.getElementById('chatbotBody');
    const messageElement = document.createElement('div');
    messageElement.className = 'chatbot-message bot';
    
    // Apply special styling based on content
    if (typeof message === 'string') {
        // Check for math results
        if (message.match(/^The result of .* is .*$/)) {
            messageElement.className += ' math-result';
        }
        // Check for time/date
        else if (message.includes('current time') || message.includes('Today is')) {
            messageElement.className += ' time-result';
        }
        // Check for jokes
        else if (message.length < 100 && 
                (message.includes('?') && message.includes('!')) || 
                message.includes('scarecrow') || 
                message.includes('atoms') || 
                message.includes('doctor')) {
            messageElement.className += ' joke';
        }
    }
    
    messageElement.textContent = message;
    chatbotBody.appendChild(messageElement);
    scrollToBottom();
}

function scrollToBottom() {
    const chatbotBody = document.getElementById('chatbotBody');
    chatbotBody.scrollTop = chatbotBody.scrollHeight;
}

function showSuggestions(customSuggestions) {
    const suggestionsContainer = document.getElementById('chatbotSuggestions');
    suggestionsContainer.innerHTML = '';
    
    try {
        // Use window.chatbot as a fallback if chatbot is not directly accessible
        const bot = (typeof chatbot !== 'undefined') ? chatbot : window.chatbot;
        if (bot) {
            // Use custom suggestions if provided, otherwise get default suggestions
            const suggestions = customSuggestions || bot.getSuggestedQuestions();
            suggestions.forEach(suggestion => {
                const suggestionElement = document.createElement('div');
                suggestionElement.className = 'chatbot-suggestion';
                suggestionElement.textContent = suggestion;
                suggestionElement.addEventListener('click', () => {
                    document.getElementById('chatbotInput').value = suggestion;
                    sendMessage();
                });
                suggestionsContainer.appendChild(suggestionElement);
            });
        } else {
            console.error('Chatbot not available for suggestions');
        }
    } catch (error) {
        console.error('Error showing suggestions:', error);
    }
}

function showTypingIndicator() {
    const chatbotBody = document.getElementById('chatbotBody');
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'chatbot-message bot chatbot-typing';
    typingIndicator.id = 'typingIndicator';
    typingIndicator.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
    chatbotBody.appendChild(typingIndicator);
    scrollToBottom();
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
} 