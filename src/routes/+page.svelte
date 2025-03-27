<script lang="ts">
    import { onMount } from "svelte";
    import MarkdownIt from "markdown-it";

    let userMessage = "";
    let chatHistory = [];
    let loading = false;
    let botThinking = false;
    let thinkingDetails = "";
    let isThinkingExpanded = false;
    const md = MarkdownIt();

    // Function to filter out <think> tags and their content
    function filterThinkTags(content: string): string {
        // Regular expression to remove <think> tags and their content
        return content.replace(/<think>.*?<\/think>/gs, '').trim();
    }

    async function sendMessage() {
        if (!userMessage.trim()) return;
        
        const userEntry = { role: "user", content: userMessage };
        chatHistory = [...chatHistory, userEntry]; 

        botThinking = true; 
        loading = true;
        isThinkingExpanded = false;
        thinkingDetails = "";

        const request = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userMessage, chatHistory }),
        });

        const apiResponse = await request.json();
        
        // Filter thinking details as well
        thinkingDetails = filterThinkTags(apiResponse.thinkingDetails || "Analyzing the query...");
        
        // Filter the main response content
        const filteredResponse = filterThinkTags(apiResponse.response);
        
        chatHistory = [...chatHistory, { role: "assistant", content: filteredResponse }];
        
        botThinking = false; 
        userMessage = ""; // Ensure message is cleared
        loading = false;
    }

    function handleKeyPress(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent default enter key behavior
            sendMessage();
            userMessage = ""; // Explicitly clear the input
        }
    }

    $: if (chatHistory.length) {
        setTimeout(() => {
            const messageContainer = document.querySelector('.message-container');
            if (messageContainer) {
                messageContainer.scrollTop = messageContainer.scrollHeight;
            }
        }, 50);
    }

    function toggleThinkingDetails() {
        isThinkingExpanded = !isThinkingExpanded;
    }
</script>

<style>
    .message-container {
        height: 400px;
        overflow-y: auto;
        padding: 15px;
        background-color: #0a0a1a;
        display: flex;
        flex-direction: column;
        scrollbar-width: thin;
        scrollbar-color: rgba(93, 63, 211, 0.3) transparent;
    }

    .message-container::-webkit-scrollbar {
        width: 8px;
    }

    .message-container::-webkit-scrollbar-thumb {
        background-color: rgba(93, 63, 211, 0.3);
        border-radius: 4px;
    }

    .message {
        max-width: 80%;
        padding: 15px;
        border-radius: 12px;
        word-wrap: break-word;
        line-height: 1.5;
    }

    .user-message {
        background: linear-gradient(
            to right, 
            rgba(93, 63, 211, 0.8), 
            rgba(106, 90, 205, 0.8)
        );
        color: #e0e0e0;
        align-self: flex-end;
        margin-left: auto;
    }

    .bot-message {
        background-color: rgba(15, 24, 48, 0.7);
        color: #d0d0d0;
        align-self: flex-start;
    }

    .thinking-section {
        background-color: rgba(37, 54, 84, 0.6);
        color: #a0aec0;
        padding: 12px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .thinking-section:hover {
        background-color: rgba(45, 55, 72, 0.7);
    }

    .thinking {
        font-style: italic;
        color: #a0aec0;
        text-align: left;
    }

    .thinking-details {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
    }

    .thinking-details.expanded {
        max-height: 200px;
        overflow-y: auto;
    }

    .input-container {
        display: flex;
        padding: 15px;
        background-color: #0f0f1f;
    }

    input {
        flex-grow: 1;
        padding: 12px;
        background-color: #0a0a1a;
        color: #d0d0d0;
        border: none;
        border-radius: 8px;
        margin-right: 10px;
        transition: background-color 0.3s ease;
    }

    input:focus {
        outline: 2px solid rgba(93, 63, 211, 0.6);
    }

    button {
        padding: 12px 20px;
        background: linear-gradient(
            to right, 
            rgba(93, 63, 211, 0.9), 
            rgba(106, 90, 205, 0.9)
        );
        color: #e0e0e0;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: opacity 0.3s ease, transform 0.2s ease;
    }

    button:hover {
        opacity: 0.9;
        transform: scale(1.02);
    }

    button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }
</style>

<div class="message-container">
    {#if botThinking && thinkingDetails}
    <button 
        on:click={() => isThinkingExpanded = !isThinkingExpanded}
        on:keydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                isThinkingExpanded = !isThinkingExpanded;
            }
        }}
        aria-expanded={isThinkingExpanded}
    >
        {isThinkingExpanded ? 'Hide' : 'Show'} Thinking Process
    </button>

    {#if isThinkingExpanded}
        <div class="thinking-details">
            {@html md.render(thinkingDetails)}
        </div>
    {/if}
{/if}

    {#each chatHistory as message (message.content)}
        <div class="message {message.role === 'user' ? 'user-message' : 'bot-message'}">
            {@html md.render(message.content)}
        </div>
    {/each}

    {#if botThinking}
        <div class="message bot-message thinking">Thinking...</div>
    {/if}
</div>

<div class="input-container">
    <input 
        type="text" 
        bind:value={userMessage} 
        placeholder="Type your message..."
        on:keydown={handleKeyPress}
    />
    <button on:click={sendMessage} disabled={loading}>Send</button>
</div>