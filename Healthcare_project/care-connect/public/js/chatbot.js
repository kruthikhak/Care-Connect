// Chatbot for Care Connect
// Enhanced chatbot with conversation, greetings, and math capabilities

class Chatbot {
    constructor() {
        this.responses = {
            greetings: [
                "Hello! Welcome to Care Connect. How can I help you today?",
                "Hi there! I'm your Care Connect assistant. What can I do for you?",
                "Welcome to Care Connect! I'm here to help with your healthcare needs."
            ],
            hospitals: [
                "You can find hospitals by using our search filters on the hospitals page. Would you like me to navigate you there?",
                "Our hospital directory lets you search by location, rating, and more. Should I show you how?",
                "We have information on many hospitals. You can filter by state, city or use the nearby option."
            ],
            appointments: [
                "While we don't currently offer direct appointment booking, you can contact hospitals through their information page.",
                "You can view a hospital's contact details on their page to schedule an appointment.",
                "Appointment scheduling will be available soon. For now, you can find hospital contact information on their details page."
            ],
            emergencies: [
                "If this is a medical emergency, please call 911 immediately.",
                "For emergencies, please call 911 or visit your nearest emergency room.",
                "Please call 911 for any medical emergency. Your health is our priority."
            ],
            insurance: [
                "Many hospitals list their accepted insurance plans on their details page.",
                "You can find insurance information on individual hospital pages.",
                "Insurance acceptance varies by hospital. Check the hospital details for more information."
            ],
            fallback: [
                "I'm not sure I understand. Could you rephrase your question?",
                "I don't have information on that yet. Can I help you with finding hospitals instead?",
                "I'm still learning! Could you ask me about hospitals, appointments, or insurance?"
            ],
            // Adding conversation responses
            thanks: [
                "You're welcome! Is there anything else I can help you with?",
                "Happy to help! Let me know if you need anything else.",
                "My pleasure! Anything else you'd like to know about our services?"
            ],
            goodbye: [
                "Goodbye! Have a great day!",
                "Take care! Feel free to come back if you have more questions.",
                "Farewell! Stay healthy and remember we're here when you need us."
            ],
            howAreYou: [
                "I'm doing well, thank you for asking! How can I assist you with your healthcare needs?",
                "I'm great! Ready to help you find the right healthcare services. What are you looking for?",
                "I'm operational and ready to assist! What healthcare information do you need today?"
            ],
            aboutBot: [
                "I'm a virtual assistant for Care Connect, designed to help you find hospitals and healthcare information.",
                "I'm Care Connect's AI assistant. I can help you find hospitals, learn about our services, and even do some basic math!",
                "I was created to make healthcare navigation easier. I can find hospitals, answer questions, and help with basic calculations."
            ],
            joke: [
                "Why don't scientists trust atoms? Because they make up everything!",
                "I asked the doctor for something for my cold, and they gave me a receipt.",
                "What did one wall say to the other wall? I'll meet you at the corner!",
                "Why did the scarecrow win an award? Because he was outstanding in his field!"
            ]
        };

        this.keywords = {
            greetings: ['hello', 'hi', 'hey', 'greetings', 'howdy', 'morning', 'afternoon', 'evening'],
            hospitals: ['hospital', 'hospitals', 'clinic', 'medical center', 'healthcare', 'facility', 'find', 'search', 'locate'],
            appointments: ['appointment', 'schedule', 'book', 'visit', 'meet', 'consultation'],
            emergencies: ['emergency', 'urgent', 'critical', 'ambulance', 'immediate', 'help'],
            insurance: ['insurance', 'coverage', 'plan', 'accept', 'payment', 'cost', 'billing'],
            // Adding conversation keywords
            thanks: ['thank', 'thanks', 'appreciate', 'grateful', 'helpful'],
            goodbye: ['bye', 'goodbye', 'see you', 'later', 'farewell', 'exit', 'quit'],
            howAreYou: ['how are you', 'how you doing', 'how is it going', 'how are things', 'what\'s up'],
            aboutBot: ['who are you', 'what are you', 'about you', 'your purpose', 'your function', 'your job'],
            joke: ['joke', 'funny', 'laugh', 'humor', 'entertain me']
        };
        
        // Flag to use server API for advanced responses - set to false initially for debugging
        this.useServerApi = true;
        
        // Memory for conversation context
        this.context = {};
        
        // Math operators for basic calculations
        this.mathOperators = ['+', '-', '*', '/', '×', '÷'];
    }

    // Process user message and return appropriate response
    async processMessage(message) {
        // If using server API for more advanced responses
        if (this.useServerApi && message.length > 10) {
            try {
                const response = await this.getServerResponse(message);
                return response;
            } catch (error) {
                console.error('Error getting response from server:', error);
                // Fall back to local processing
            }
        }
        
        // Check for math operations
        const mathResult = this.processMath(message);
        if (mathResult) {
            return mathResult;
        }
        
        // Handle basic conversation
        return this.getConversationResponse(message);
    }
    
    // Process mathematical expressions
    processMath(message) {
        // Check if this message looks like a math query
        const containsMathOperator = this.mathOperators.some(op => message.includes(op));
        
        if (containsMathOperator || /calculate|compute|math|sum|add|subtract|multiply|divide/i.test(message)) {
            try {
                // Extract the mathematical expression
                let expression = message.replace(/[^\d+\-*/().×÷]/g, ' ').trim();
                
                // Replace symbols with JavaScript operators
                expression = expression.replace(/×/g, '*').replace(/÷/g, '/');
                
                // Handle natural language math
                if (!containsMathOperator) {
                    // Try to parse natural language math
                    const numbers = message.match(/\d+/g);
                    if (numbers && numbers.length >= 2) {
                        if (/add|sum|plus/i.test(message)) {
                            expression = `${numbers[0]} + ${numbers[1]}`;
                        } else if (/subtract|minus|difference/i.test(message)) {
                            expression = `${numbers[0]} - ${numbers[1]}`;
                        } else if (/multiply|times|product/i.test(message)) {
                            expression = `${numbers[0]} * ${numbers[1]}`;
                        } else if (/divide|quotient/i.test(message)) {
                            expression = `${numbers[0]} / ${numbers[1]}`;
                        }
                    }
                }
                
                // Evaluate the expression
                // Only evaluate if it looks like a valid math expression
                if (/^[\d\s+\-*/().]+$/.test(expression)) {
                    const result = Function('"use strict"; return (' + expression + ')')();
                    return `The result of ${expression} is ${result}`;
                }
            } catch (error) {
                return "I couldn't process that calculation. Please check your expression and try again.";
            }
        }
        return null;
    }
    
    // Get response from server API
    async getServerResponse(message) {
        try {
            const response = await fetch('/api/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    userId: 'demo-user'
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to get response from server');
            }
            
            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Error in server response:', error);
            return this.getConversationResponse(message);
        }
    }
    
    // Get local response based on keywords and conversation context
    getConversationResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Check if message matches any keywords
        for (const category in this.keywords) {
            if (this.keywords[category].some(keyword => lowerMessage.includes(keyword))) {
                return this.getRandomResponse(category);
            }
        }
        
        // Check for time or date questions
        if (/(what time is it|what is the time|current time)/i.test(lowerMessage)) {
            return `The current time is ${new Date().toLocaleTimeString()}`;
        }
        
        if (/(what (is the |)date|today('s date| is)|current date)/i.test(lowerMessage)) {
            return `Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
        }
        
        // If no match found, return fallback response
        return this.getRandomResponse('fallback');
    }
    
    // Get random response from a category
    getRandomResponse(category) {
        const responses = this.responses[category];
        const randomIndex = Math.floor(Math.random() * responses.length);
        return responses[randomIndex];
    }
    
    // Get suggested questions
    getSuggestedQuestions() {
        return [
            "How do I find hospitals near me?",
            "Can you do 125 + 375?",
            "Tell me a joke",
            "What time is it?"
        ];
    }
}

// Initialize and export chatbot
const chatbot = new Chatbot();

// Make sure chatbot is accessible globally
window.chatbot = chatbot; 