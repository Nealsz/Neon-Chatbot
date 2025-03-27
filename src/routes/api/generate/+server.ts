import { json, type RequestHandler } from '@sveltejs/kit';
import { Ollama } from "ollama";

const ollama = new Ollama({ host: "http://localhost:11434/" });

// Master User Data
const personalinfoofMasterUser = {
    name: "Neon",
    age: "20",
    generalLocation: "Subic, Zambales",
    favoriteColor: "Green",
    favoriteFoods: ["Sinigang sa Miso", "Chop Suey", "Burger"],
    occupation: "Student"
};

const educationofMasterUser = {
    college: "Gordon College",
    course: "Computer Science",
    year: "third"
};

const hobbiesofMasterUser = {
    games: ["Playing Zenless Zone Zero", "Playing Valorant"],
    reading: "manga"
};

const petsofMasterUser = {
    numberofDogs: "4",
    nameofDogs: ["Chinchin", "Chu-chu", "Art", "Cheese"]
};

const dataofMasterUser = {
    personalinfo: personalinfoofMasterUser, 
    education: educationofMasterUser,
    hobbies: hobbiesofMasterUser,
    pets: petsofMasterUser
};

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { userMessage, chatHistory } = await request.json();

        // AI System Prompt to ensure responses are based on data
        const systemPrompt = `
        You are a chatbot answering ONLY based on the provided user data.
        DO NOT make up any information that is not explicitly in the data.
        If you do not have an answer, respond with: "I don't know."
        Here is the user's data: ${JSON.stringify(dataofMasterUser)}
        `;

        // Process with AI
        const chat = await ollama.chat({
            model: "deepseek-r1:1.5b", 
            messages: [
                { role: "system", content: systemPrompt },
                ...chatHistory,  
                { role: "user", content: userMessage }
            ]
        });

        // Ensure AI response follows JSON format if relevant
        let aiResponse = chat.message?.content ?? "I don't know.";

        try {
            const parsedResponse = JSON.parse(aiResponse);
            return json({ 
                response: parsedResponse, 
                chatHistory: [...chatHistory, { role: "assistant", content: JSON.stringify(parsedResponse, null, 2) }] 
            });
        } catch {
            return json({ 
                response: aiResponse, 
                chatHistory: [...chatHistory, { role: "assistant", content: aiResponse }] 
            });
        }
    } catch (error) {
        console.error("Error processing request:", error);
        return json({ error: "Internal server error." }, { status: 500 });
    }
};
