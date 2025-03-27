import { json, type RequestHandler } from '@sveltejs/kit';
import { Ollama } from "ollama";

const ollama = new Ollama({ host: "http://localhost:11434/" });

const personalinfoofMasterUser = {
    name: "Neon John Quiroz",
    age: "20",
    generalLocation: "Subic, Zambales",
    favoriteColor: "Green",
    favoriteFoods: ["Sinigang sa Miso", "Chop Suey", "Burger"],
    occupation: "Student"
}

const educationofMasterUser = {
    college: "Gordon College",
    course: "Computer Science",
    year: "third",
}

const hobbiesofMasterUser = {
    games: ["Playing Zenless Zone Zero", "Playing Valorant"],
    reading: "manga",
}

const petsofMasterUser = {
    numberofDogs: "4",
    nameofDogs: ["Chinchin, Chu-chu, Art, Cheese"]
}   

const dataofMasterUser = {
    personalinfo: personalinfoofMasterUser, 
    education: educationofMasterUser,
    hobbies: hobbiesofMasterUser,
    pets: petsofMasterUser,

};

function filterData(request: string) {
    const lowerRequest = request.toLowerCase();

    const keywords = {
        name: ["name", "who", "identity"],
        age: ["age", "old"],
        location: ["location", "place", "address", "live"],
        favoriteColor: ["color", "favorite color"],
        favoriteFoods: ["food", "eat", "favorite food"],
        college: ["college", "school", "university"],
        course: ["course", "study", "degree", "major"],
        year: ["year", "level", "year level"],
        occupation: ["occupation", "job", "work", "profession", "career"],
        hobbies: ["hobbies", "hobby", "interests", "pastime"],
        games: ["games", "gaming", "play"],
        reading: ["reading", "read", "books", "manga"],
        pets: ["pets", "dogs", "animals"],
        generalInfo: ["info", "details", "anything"]
    };

    if (keywords.name.some(k => lowerRequest.includes(k))) {
        return {
            response: `Master's name is ${dataofMasterUser.personalinfo.name}.`,
            thinkingDetails: "Retrieving name from user profile data"
        };
    }
    if (keywords.age.some(k => lowerRequest.includes(k))) {
        return {
            response: `Master is ${dataofMasterUser.personalinfo.age} years old.`,
            thinkingDetails: "Retrieving age from user profile data"
        };
    }
    if (keywords.location.some(k => lowerRequest.includes(k))) {
        return {
            response: `Master is located in ${dataofMasterUser.personalinfo.generalLocation}.`,
            thinkingDetails: "Fetching general location from user profile data"
        };
    }
    if (keywords.favoriteColor.some(k => lowerRequest.includes(k))) {
        return {
            response: `Master's favorite color is ${dataofMasterUser.personalinfo.favoriteColor}.`,
            thinkingDetails: "Retrieving favorite color from user profile data"
        };
    }
    if (keywords.favoriteFoods.some(k => lowerRequest.includes(k))) {
        return {
            response: `Master's favorite foods are: ${dataofMasterUser.personalinfo.favoriteFoods.join(", ")}.`,
            thinkingDetails: "Fetching favorite foods from user profile data"
        };
    }
    if (keywords.college.some(k => lowerRequest.includes(k))) {
        return {
            response: `Master studies at ${dataofMasterUser.education.college}.`,
            thinkingDetails: "Retrieving college information from user profile data"
        };
    }
    if (keywords.course.some(k => lowerRequest.includes(k))) {
        return {
            response: `Master's course is ${dataofMasterUser.education.course}.`,
            thinkingDetails: "Fetching field of study from educational data"
        };
    }
    if (keywords.year.some(k => lowerRequest.includes(k))) {
        return {
            response: `Master is in ${dataofMasterUser.education.year} year.`,
            thinkingDetails: "Retrieving current academic year from educational data"
        };
    }
    if (keywords.occupation.some(k => lowerRequest.includes(k))) {
        return {
            response: `Master's occupation is ${dataofMasterUser.personalinfo.occupation}.`,
            thinkingDetails: "Retrieving occupation from user profile data"
        };
    }
    if (keywords.hobbies.some(k => lowerRequest.includes(k))) {
        return {
            response: `Master's hobbies include: ${dataofMasterUser.hobbies.games.join(", ")} and reading ${dataofMasterUser.hobbies.reading}.`,
            thinkingDetails: "Compiling list of recreational activities from user profile"
        };
    }
    if (keywords.games.some(k => lowerRequest.includes(k))) {
        return {
            response: `Master enjoys playing: ${dataofMasterUser.hobbies.games.join(", ")}.`,
            thinkingDetails: "Retrieving gaming preferences from user profile data"
        };
    }
    if (keywords.reading.some(k => lowerRequest.includes(k))) {
        return {
            response: `Master enjoys reading ${dataofMasterUser.hobbies.reading}.`,
            thinkingDetails: "Fetching reading preferences from user profile"
        };
    }
    if (keywords.pets.some(k => lowerRequest.includes(k))) {
        return {
            response: `Master has ${dataofMasterUser.pets.numberofDogs} dogs named: ${dataofMasterUser.pets.nameofDogs.join(", ")}.`,
            thinkingDetails: "Retrieving pet details from user profile"
        };
    }
    if (keywords.generalInfo.some(k => lowerRequest.includes(k))) {
        return {
            response: `Here are some details about Master:  
            - Name: ${personalinfoofMasterUser.name}  
            - Age: ${personalinfoofMasterUser.age}   
            - Location: ${personalinfoofMasterUser.generalLocation}  
            - Favorite Color: ${personalinfoofMasterUser.favoriteColor}  
            - Favorite Foods: ${personalinfoofMasterUser.favoriteFoods}  
            - Occupation: ${dataofMasterUser.personalinfo.occupation}`,  
            thinkingDetails: "Compiling general personal information from user profile"
        };
    }
    

    return null; // If no direct match, let Ollama handle it
}

export const POST: RequestHandler = async ({ request }) => {
    const { userMessage, chatHistory } = await request.json();

    // Check if we can directly return filtered data
    const filteredResponse = filterData(userMessage);
    if (filteredResponse) {
        return json({ 
            response: filteredResponse.response, 
            thinkingDetails: filteredResponse.thinkingDetails,
            chatHistory: [...chatHistory, { role: "assistant", content: filteredResponse.response }] 
        });
    }

    // Otherwise, pass to AI model
    const chat = await ollama.chat({
        model: "deepseek-r1:1.5b", 
        messages: [
            {
                role: "system", 
                content: `This is the master user's data: ${JSON.stringify(dataofMasterUser)}. Only respond based on the data.`,
            },
            ...chatHistory,  
            {
                role: "user", 
                content: userMessage,
            },
        ],
    });

    return json({ 
        response: chat.message.content, 
        thinkingDetails: "Analyzing query using AI model with context from previous messages",
        chatHistory: [...chatHistory, { role: "assistant", content: chat.message.content }] 
    });
};