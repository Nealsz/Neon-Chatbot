<script lang="ts">
    export let title = "Neon Chatbot";
</script>

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background-color: #0a0a1a;
        background-image: 
            linear-gradient(
                rgba(16, 24, 48, 0.9), 
                rgba(10, 14, 28, 0.9)
            ), 
            radial-gradient(
                circle at top right, 
                rgba(93, 63, 211, 0.2), 
                transparent 50%
            );
        background-size: cover;
        background-attachment: fixed;
        font-family: 'Inter', 'Arial', sans-serif;
        margin: 0;
        padding: 0;
        color: #d0d0d0;
    }

    .chat-wrapper {
        width: 100%;
        max-width: 500px;
        background-color: #0f0f1f;
        border-radius: 15px;
        box-shadow: 
            0 15px 35px rgba(0,0,0,0.4), 
            0 5px 15px rgba(0,0,0,0.3);
        overflow: hidden;
    }

    .header {
        background: linear-gradient(
            to right, 
            rgba(93, 63, 211, 0.9), 
            rgba(106, 90, 205, 0.9)
        );
        color: #e0e0e0;
        text-align: center;
        padding: 15px;
        font-size: 1.2em;
        font-weight: bold;
    }
</style>

<div class="container">
    <div class="chat-wrapper">
        <div class="header">{title}</div>
        <slot />
    </div>
</div>