/* Read the Room: quiz banks and drill data (all original). */

window.BANKS = {
  biases: {
    title: "Bias quiz",
    prompt: "Which bias is this?",
    pool: ["Anchoring", "Confirmation bias", "Availability heuristic", "Halo effect", "Fundamental attribution error", "Sunk cost fallacy", "Framing effect", "Hindsight bias", "Overconfidence", "Bandwagon effect", "Loss aversion", "Spotlight effect", "Base-rate neglect", "Barnum effect", "Frequency illusion", "Status quo bias"],
    items: [
      { q: "A shop shows an original price of ₹9,999 crossed out, now ₹4,999, and it feels like a bargain.", a: "Anchoring", e: "The first number sets a reference point that makes the second look cheap." },
      { q: "Arjun is sure his coworker is lazy. He remembers every late arrival but none of the weekends she worked.", a: "Confirmation bias", e: "He notices and remembers only what fits his belief." },
      { q: "After a week of news about plane crashes, Meera feels flying is more dangerous than driving.", a: "Availability heuristic", e: "Vivid, recent examples feel more common than they are. Driving is far riskier per kilometre." },
      { q: "The new manager is tall and well dressed, so the team assumes he must also be good at his job.", a: "Halo effect", e: "One positive trait spills over onto unrelated judgments." },
      { q: "A driver cuts you off and you think he is selfish, not that he might be rushing to a hospital.", a: "Fundamental attribution error", e: "We blame other people's character but excuse our own behaviour by circumstance." },
      { q: "You keep watching a boring film because you already paid for the ticket.", a: "Sunk cost fallacy", e: "Money already spent is gone either way; it should not decide what you do next." },
      { q: "Patients prefer a surgery with a 90 percent survival rate over one with a 10 percent death rate.", a: "Framing effect", e: "The numbers are identical; only the wording changed." },
      { q: "After the match, Rahul says he knew they would lose, though yesterday he predicted a win.", a: "Hindsight bias", e: "Outcomes feel predictable once we know them." },
      { q: "Most drivers rate themselves as better than the average driver.", a: "Overconfidence", e: "Most people cannot be above average. We overrate our own skill." },
      { q: "You pick the restaurant with a long queue over the empty one next door.", a: "Bandwagon effect", e: "We treat what others do as evidence of what is good." },
      { q: "Losing ₹500 ruins your day, but finding ₹500 only makes you mildly happy.", a: "Loss aversion", e: "Losses weigh more heavily than equal gains." },
      { q: "You spill tea on your shirt and feel that everyone at the party noticed. Few did.", a: "Spotlight effect", e: "We overestimate how much others pay attention to us." },
      { q: "Told someone is quiet and loves books, people guess librarian rather than salesperson.", a: "Base-rate neglect", e: "There are far more salespeople than librarians, so salesperson is still the better bet." },
      { q: "A horoscope says you can be outgoing but sometimes need time alone, and it feels written just for you.", a: "Barnum effect", e: "Vague statements that fit almost everyone feel personal." },
      { q: "After buying a red car, Priya suddenly sees red cars everywhere.", a: "Frequency illusion", e: "There are not more red cars; she simply notices them now." },
      { q: "Most people keep the default phone plan even when a cheaper one exists.", a: "Status quo bias", e: "Sticking with the current option feels safer than switching." }
    ]
  },

  influence: {
    title: "Influence quiz",
    prompt: "Which principle of influence is at work?",
    pool: ["Reciprocity", "Commitment and consistency", "Social proof", "Authority", "Liking", "Scarcity"],
    items: [
      { q: "A supermarket gives you a free sample of cheese, and you feel you should buy some.", a: "Reciprocity", e: "A gift creates a feeling of obligation." },
      { q: "Diners tip more when the waiter brings a mint with the bill.", a: "Reciprocity", e: "Even a small unexpected gift triggers the urge to give back." },
      { q: "A charity first asks you to sign a petition, then a week later asks for a donation.", a: "Commitment and consistency", e: "A small yes makes a bigger yes feel consistent." },
      { q: "You tell all your friends you are running a marathon, and now you feel you can't quit training.", a: "Commitment and consistency", e: "Public commitments are powerful because we want to act consistently." },
      { q: "A hotel card says most guests in this room reuse their towels.", a: "Social proof", e: "We follow what people like us do." },
      { q: "A comedy show plays recorded laughter after each joke.", a: "Social proof", e: "Others' laughter signals that something is funny." },
      { q: "A toothpaste ad features a person in a white lab coat.", a: "Authority", e: "Symbols of expertise make claims feel more credible." },
      { q: "You follow the instructions of someone in a security uniform without checking who they are.", a: "Authority", e: "Uniforms and titles trigger deference." },
      { q: "A salesperson discovers you grew up in the same town and compliments your taste.", a: "Liking", e: "Similarity and compliments make us like, and agree with, people." },
      { q: "You buy kitchenware at a party hosted by your friend.", a: "Liking", e: "The friendship does the selling." },
      { q: "A booking site shows only 2 rooms left at this price.", a: "Scarcity", e: "Things feel more valuable when they might run out." },
      { q: "A sale ends at midnight tonight, and you buy something you hadn't planned to.", a: "Scarcity", e: "Time limits create urgency and the fear of missing out." }
    ]
  },

  emotions: {
    title: "Expression quiz",
    prompt: "What does this most likely show?",
    pool: ["Happiness", "Sadness", "Anger", "Fear", "Surprise", "Disgust", "Contempt"],
    items: [
      { q: "Cheeks raised, crinkles at the outer corners of the eyes, lip corners pulled up.", a: "Happiness", e: "A felt (Duchenne) smile involves the eyes as well as the mouth." },
      { q: "Inner corners of the eyebrows raised, upper eyelids drooping, lip corners pulled down.", a: "Sadness", e: "The raised inner brows are one of the hardest movements to fake." },
      { q: "Brows lowered and pulled together, hard stare, lips pressed tightly together.", a: "Anger", e: "Lowered, drawn-together brows with pressed lips are the classic anger pattern." },
      { q: "Brows raised and pulled together, upper eyelids raised high, lips stretched sideways.", a: "Fear", e: "Unlike surprise, fear pulls the brows together and stretches the lips." },
      { q: "Brows raised and curved, eyes wide, jaw dropped, lasting only a moment.", a: "Surprise", e: "Surprise is the briefest emotion, and the brows curve rather than pinch." },
      { q: "Nose wrinkled and upper lip raised.", a: "Disgust", e: "The nose wrinkle is the signature of disgust." },
      { q: "One lip corner tightened and raised, on one side of the face only.", a: "Contempt", e: "Contempt is the only classic expression that is one-sided." },
      { q: "Lip corners pulled up, but the cheeks and eyes do not change at all.", a: "Polite or social smile", options: ["Polite or social smile", "Happiness", "Contempt", "Surprise"], e: "Without the eyes involved, a smile is more likely polite than felt." },
      { q: "A frown flashes for a fraction of a second, then is replaced by a smile.", a: "A brief, masked negative emotion", options: ["A brief, masked negative emotion", "Proof they are lying", "Happiness", "Surprise"], e: "A micro-expression shows an emotion was felt, not why, and never proves a lie." },
      { q: "During a hard question, the person presses their lips together until they almost disappear.", a: "Stress or holding something back", options: ["Stress or holding something back", "Happiness", "Boredom", "Surprise"], e: "Lip compression is a common sign of stress or restraint." },
      { q: "While answering, someone rubs their neck and touches their face more than their baseline.", a: "Discomfort or self-soothing", options: ["Discomfort or self-soothing", "Proof they are lying", "Happiness", "Disgust"], e: "Self-soothing signals discomfort. It may be about the topic, the setting or you." },
      { q: "The person's torso still faces you, but their feet have turned toward the door.", a: "Wanting to leave", options: ["Wanting to leave", "Deep interest", "Anger", "Fear"], e: "Feet often point where people want to go." },
      { q: "A quick raise of both eyebrows on seeing a friend across the room.", a: "Recognition and greeting", options: ["Recognition and greeting", "Fear", "Anger", "Disgust"], e: "The eyebrow flash is a widespread greeting signal." },
      { q: "Brows lowered and drawn together while someone reads a difficult document.", a: "Concentration, not necessarily anger", options: ["Concentration, not necessarily anger", "Anger", "Disgust", "Sadness"], e: "Context matters: the same brow movement often signals effort or confusion." }
    ]
  },

  cold: {
    title: "Cold reading quiz",
    prompt: "Which cold reading technique is this?",
    pool: ["Barnum statement", "Rainbow ruse", "Fishing", "Shotgunning", "Warm reading", "Reframing a miss"],
    items: [
      { q: "\"You have a great deal of potential that you haven't fully used yet.\"", a: "Barnum statement", e: "True of nearly everyone, and flattering." },
      { q: "\"Sometimes you wonder whether you made the right choice in an important decision.\"", a: "Barnum statement", e: "Everyone has doubted a big decision." },
      { q: "\"You can be very sociable, but there are times you'd rather be alone.\"", a: "Rainbow ruse", e: "It covers a trait and its opposite, so it can't miss." },
      { q: "\"You're generous with others, yet you've learned to protect yourself.\"", a: "Rainbow ruse", e: "Both sides are covered at once." },
      { q: "\"Does the number 3 mean something to you?\"", a: "Fishing", e: "A question disguised as a statement. The person fills in the meaning." },
      { q: "\"I'm sensing a connection with a month, maybe a birthday in summer?\"", a: "Fishing", e: "Vague, then shaped by the person's reaction." },
      { q: "To a room: \"Someone here lost a person close to them, an older man, or maybe a woman, with an M or a J in the name...\"", a: "Shotgunning", e: "Many options at once, so something is likely to land with someone." },
      { q: "\"I'm getting an R, or perhaps an S... Ravi? Sunita? Someone older?\"", a: "Shotgunning", e: "Rapid guesses, then following whichever gets a reaction." },
      { q: "Noticing a new engagement ring, the reader says, \"I see a big decision about a partnership in your life.\"", a: "Warm reading", e: "Using a visible clue and presenting it as insight." },
      { q: "Seeing rough, calloused hands: \"You're no stranger to hard work.\"", a: "Warm reading", e: "The hands told the reader." },
      { q: "\"No brother? Then it's someone who has been like a brother to you.\"", a: "Reframing a miss", e: "A wrong guess is stretched until it fits." },
      { q: "\"It may not make sense now, but remember it. It will become clear later.\"", a: "Reframing a miss", e: "A miss is pushed into the future, where the listener will find a fit." }
    ]
  }
};

window.DRILL_DATA = {
  objects: ["🔑","📎","🕶️","⌚","📱","🖊️","📒","🧸","🎲","🪙","🧲","🔦","🧯","🪥","🧴","🧦","🎧","🎒","☂️","🧤","🧣","👟","🎩","💍","🪞","🕯️","🧩","♟️","🎸","🥁","📷","🔭","🧪","🪴","🌵","🍎","🍋","🍌","🥕","🌶️","🍞","🧀","🥚","🍩","☕","🍵","🥄","🍴","🔨","🪛","🔧","🪚","🧵","🪡","✂️","📏","📐","🗝️","🧭","⏰","💡","🔋","🧷","📌","🎈","🎁","🏀","⚽","🎳","🪁","🛼","🚲"],

  words: ["anchor","apple","arrow","axe","badge","balloon","banana","barrel","basket","bell","bench","bicycle","blanket","bottle","bracelet","bridge","broom","bucket","butter","button","cactus","cake","camel","camera","candle","canoe","carpet","carrot","castle","chain","chair","cheese","cherry","chimney","clock","cloud","coconut","coin","comb","compass","cookie","crown","crystal","cup","curtain","cushion","diamond","dice","dolphin","donkey","door","dragon","drum","duck","eagle","elephant","engine","envelope","feather","fence","flag","flute","fork","fountain","frog","garden","ghost","giraffe","glove","goat","guitar","hammer","harp","helmet","honey","horse","iceberg","igloo","island","jacket","jar","jelly","kettle","key","kite","ladder","lamp","lemon","lion","lizard","lock","magnet","mango","map","mask","mirror","monkey","moon","mountain","mushroom","needle","nest","net","octopus","onion","orange","owl","paddle","palace","parrot","peacock","pencil","penguin","piano","pillow","pineapple","pirate","pizza","planet","pocket","pot","pumpkin","puppet","pyramid","rabbit","radio","rainbow","rocket","rope","rose","ruler","saddle","sail","sandal","saxophone","scarf","scissors","shark","shell","shield","ship","shovel","skull","snail","snake","snowman","sock","spider","spoon","stamp","statue","stool","strawberry","submarine","suitcase","sword","table","teapot","telescope","tent","tiger","tomato","tooth","torch","tower","tractor","trumpet","tulip","turtle","umbrella","unicorn","vase","violin","volcano","wagon","wallet","walrus","watermelon","whale","wheel","whistle","window","wizard","wolf","yacht","zebra","zipper"],

  names: ["Aarav","Ananya","Rohan","Priya","Kabir","Meera","Vikram","Isha","Arjun","Kavya","Dev","Sana","Rahul","Nisha","Aditya","Tara","Neha","Imran","Zoya","Farhan","Lakshmi","Suresh","Divya","Karan","Pooja","Ravi","Sunita","Omar","Leila","Daniel","Sofia","Lucas","Emma","Noah","Maya","Ethan","Chloe","Liam","Grace","Mateo","Hana","Kenji","Yuki","Chen","Mei","Amara","Kofi","Zara","Elena","Marco","Ines","Hugo","Freya","Oscar","Nadia","Felix","Ruby","Tomas","Alina"],

  features: [
    "red glasses","a silver nose ring","curly grey hair","a green scarf","a loud laugh","a gap in their front teeth","a leather jacket","a yellow raincoat","a tiny anchor tattoo","bright orange shoes",
    "a bushy moustache","a shaved head","a denim cap","freckles","a long braid","a bow tie","a cast on one arm","a guitar case","a gold watch","paint on their hands",
    "a camera around their neck","a striped shirt","very tall","a dimple when smiling","a deep voice","a bandana","a tennis racket","purple hair","round earrings","a beard with a streak of white",
    "a dog leash in hand","a chef's apron","a backpack full of books","hiking boots","a sling bag","a pink hoodie","a stethoscope","a cricket bat","headphones on their neck","a sunflower pin"
  ],

  suits: [ { s: "♠", red: false }, { s: "♥", red: true }, { s: "♦", red: true }, { s: "♣", red: false } ],
  ranks: ["A","2","3","4","5","6","7","8","9","10","J","Q","K"]
};
