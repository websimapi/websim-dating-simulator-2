import { createApp, ref, reactive, computed } from 'vue';

const app = createApp({
    setup() {
        // Game states
        const gameState = ref('intro');
        const affection = ref(0);
        const conversationStage = ref(0);
        
        // Character data
        const characters = reactive([
            {
                id: 1,
                name: "Emily",
                age: 28,
                bio: "Creative and spontaneous graphic designer who loves hiking and indie music.",
                seed: 1,
                imageUrl: null
            },
            {
                id: 2,
                name: "Alex",
                age: 30,
                bio: "Software developer with a passion for cooking and astronomy.",
                seed: 2,
                imageUrl: null
            },
            {
                id: 3,
                name: "Jordan",
                age: 26,
                bio: "Free-spirited yoga instructor and part-time DJ who loves to travel.",
                seed: 3,
                imageUrl: null
            }
        ]);
        
        const currentCharacterIndex = ref(0);
        
        // Text content
        const introText = ref("Welcome to Virtual Date! Choose a character and navigate through meaningful conversations. Make choices that might lead to a connection... or not. Are you ready to start dating?");
        const currentDialog = ref("");
        const endingText = ref("");
        
        // Dialogue scenes
        const dialogScenes = [
            // First stage - coffee shop
            {
                setting: "You meet at a cozy coffee shop downtown.",
                dialog: "Hi there! It's nice to finally meet you in person. This place has a great vibe, don't you think?",
                choices: [
                    { 
                        text: "Absolutely! I love the atmosphere here. What's your favorite coffee?", 
                        affectionChange: 2,
                        response: "I'm a big fan of oat milk lattes! Something about that nutty flavor just works perfectly with espresso."
                    },
                    { 
                        text: "It's alright. I usually prefer fancier places, but this works for a first meeting.", 
                        affectionChange: -1,
                        response: "Oh... I see. Well, I think it has its charm, but everyone has different tastes I suppose."
                    },
                    { 
                        text: "To be honest, I was running late and just picked the first place I found on the map.", 
                        affectionChange: 0,
                        response: "Haha, at least you're honest! No worries, sometimes spontaneous choices lead to nice discoveries."
                    }
                ]
            },
            // Second stage - getting to know
            {
                setting: "After some small talk, the conversation shifts to more personal topics.",
                dialog: "So, what are you most passionate about in life?",
                choices: [
                    { 
                        text: "I love creating things - whether it's art, writing, or building something with my hands.", 
                        affectionChange: 2,
                        response: "That's amazing! I can totally relate to that creative drive. There's something so fulfilling about bringing something new into the world."
                    },
                    { 
                        text: "My career is everything to me. I'm focused on climbing the ladder and being successful.", 
                        affectionChange: 1,
                        response: "Ambition is important! I admire people who know what they want. I try to balance work with other aspects of life, though."
                    },
                    { 
                        text: "Just enjoying life, you know? Why stress about big goals when we can focus on being happy day to day?", 
                        affectionChange: 0,
                        response: "That's a valid perspective. Finding joy in the everyday moments is definitely important. I sometimes wonder if I should be more like that."
                    }
                ]
            },
            // Third stage - deeper conversation
            {
                setting: "The conversation has been flowing well, and you're now discussing life philosophies.",
                dialog: "Do you think people can really change, or are we just who we are?",
                choices: [
                    { 
                        text: "I believe people can grow and evolve, but our core remains the same.", 
                        affectionChange: 1,
                        response: "That's a thoughtful perspective. I tend to agree - we can learn and adapt, but there's something authentic at our center that stays consistent."
                    },
                    { 
                        text: "People absolutely can change completely. I'm nothing like who I was five years ago.", 
                        affectionChange: 1,
                        response: "That's fascinating! I'd love to hear more about your journey. Change can be so powerful when we embrace it."
                    },
                    { 
                        text: "Let's be real - people rarely change in meaningful ways. We just get better at hiding our flaws.", 
                        affectionChange: -1,
                        response: "Wow, that's... pretty cynical. I've seen real transformation in people, including myself. But I understand being skeptical."
                    }
                ]
            }
        ];
        
        // Computed properties
        const currentCharacter = computed(() => characters[currentCharacterIndex.value]);
        
        const currentChoices = computed(() => {
            if (gameState.value !== 'conversation') return [];
            return dialogScenes[conversationStage.value].choices;
        });
        
        // Methods
        const startGame = async () => {
            await generateAllCharacterImages();
            gameState.value = 'conversation';
            conversationStage.value = 0;
            affection.value = 0;
            currentDialog.value = `${dialogScenes[0].setting} ${dialogScenes[0].dialog}`;
        };
        
        const makeChoice = (choiceIndex) => {
            const choice = dialogScenes[conversationStage.value].choices[choiceIndex];
            affection.value += choice.affectionChange;
            
            // Show response to the choice
            currentDialog.value = choice.response;
            
            // After a short delay, move to the next stage or conclude
            setTimeout(() => {
                if (conversationStage.value < dialogScenes.length - 1) {
                    conversationStage.value++;
                    currentDialog.value = `${dialogScenes[conversationStage.value].setting} ${dialogScenes[conversationStage.value].dialog}`;
                } else {
                    concludeDate();
                }
            }, 2000);
        };
        
        const concludeDate = () => {
            gameState.value = 'ending';
            
            if (affection.value >= 4) {
                endingText.value = `You and ${currentCharacter.value.name} really hit it off! They seem genuinely interested in seeing you again. Congratulations on making a meaningful connection!`;
            } else if (affection.value >= 1) {
                endingText.value = `Your date with ${currentCharacter.value.name} went okay. There were some nice moments, but the spark wasn't quite there. They mention possibly meeting up again as friends.`;
            } else {
                endingText.value = `Unfortunately, the chemistry just wasn't there with ${currentCharacter.value.name}. The conversation felt forced at times, and you both agree it's best to go your separate ways.`;
            }
        };
        
        const resetGame = () => {
            currentCharacterIndex.value = (currentCharacterIndex.value + 1) % characters.length;
            gameState.value = 'intro';
        };
        
        // Image generation
        const generateCharacterImage = async (character) => {
            try {
                const prompt = `Portrait of ${character.name}, age ${character.age}, ${character.bio} Dating profile picture, friendly smile, modern style, clean background`;
                const result = await websim.imageGen({
                    prompt: prompt,
                    aspect_ratio: "1:1",
                    seed: character.seed
                });
                return result.url;
            } catch (error) {
                console.error("Error generating image:", error);
                return null;
            }
        };
        
        const generateAllCharacterImages = async () => {
            for (const character of characters) {
                if (!character.imageUrl) {
                    character.imageUrl = await generateCharacterImage(character);
                }
            }
        };
        
        const handleImageError = async () => {
            // If image fails to load, regenerate it
            if (currentCharacter.value) {
                currentCharacter.value.imageUrl = await generateCharacterImage(currentCharacter.value);
            }
        };
        
        // Initialize
        generateAllCharacterImages();
        
        return {
            gameState,
            affection,
            conversationStage,
            characters,
            currentCharacterIndex,
            currentCharacter,
            introText,
            currentDialog,
            endingText,
            currentChoices,
            startGame,
            makeChoice,
            resetGame,
            handleImageError
        };
    }
});

app.mount('#app');

