/* Read the Room: course content.
   All lesson text is original. Books and videos are linked, never copied. */

const yt = (q) => "https://www.youtube.com/results?search_query=" + encodeURIComponent(q);
const ol = (q) => "https://openlibrary.org/search?q=" + encodeURIComponent(q);

window.COURSE = {
  name: "Read the Room",
  tagline: "A free 12-week course in observation, memory, reading people and mentalism.",

  months: [
    { n: 1, title: "Foundations", weeks: [1, 2, 3, 4], blurb: "Train your eyes, your memory and your understanding of how minds take shortcuts." },
    { n: 2, title: "Reading people", weeks: [5, 6, 7, 8], blurb: "Turn observation into reading emotions, comfort and intent, and learn how cold readers work." },
    { n: 3, title: "Mentalism and performance", weeks: [9, 10, 11, 12], blurb: "Combine everything into real effects, a script and a 10-minute show." }
  ],

  skills: [
    { name: "Observation", text: "Notice the small details other people miss: hands, shoes, posture, objects, change.", milestone: "Recall 20 details of a room after 30 seconds." },
    { name: "Memory", text: "Use a memory palace to hold lists, names and sequences.", milestone: "40 random words in order in 5 minutes." },
    { name: "Psychology", text: "Understand the shortcuts minds take, and how influence works.", milestone: "Explain 20 biases and 6 influence principles." },
    { name: "Reading people", text: "Read baselines, body language and facial expressions of emotion.", milestone: "Beat your week 6 emotion-recognition scores." },
    { name: "Cold reading and rapport", text: "Get people to open up, and understand how readers seem to know things.", milestone: "A 5-minute reading friends rate 7 out of 10." },
    { name: "Performance", text: "Build effects, write a script and hold an audience.", milestone: "A 10-minute show where no one catches a method." }
  ],

  rules: [
    ["Keep a journal.", "Every day, write what you noticed, what you guessed, and whether you were right. The journal page in this course does that for you."],
    ["Do the tests honestly.", "Your week 12 scores compared to week 1 are your proof of progress. A low honest score is more useful than a high fake one."],
    ["Miss a day, don't quit.", "If you fall behind, repeat a week rather than skipping ahead. The skills stack."],
    ["Guesses are hypotheses, not facts.", "Reading people is about probabilities. Patrick Jane is fiction; the real skill is being right more often than average, and checking."],
    ["Use it kindly.", "Tell friends afterwards when you practised on them. Never use these skills to take money, trust or private information from anyone."]
  ],

  routine: [
    ["Observation drill", "10 min, morning", "The week's drill, such as the room scan or describing strangers."],
    ["Memory training", "15 min", "The week's memory exercise, plus a quick review of older material."],
    ["Study", "20 to 30 min", "The week's lesson on this site, then the book chapter or video."],
    ["Real-world practice", "10 to 20 min, during the day", "People-watching, conversations or performing, as the week says."],
    ["Journal", "10 min, night", "Three things you noticed, one guess and whether it was right, one lesson."]
  ],

  weeks: [
    /* ---------------- WEEK 1 ---------------- */
    {
      n: 1, month: 1, title: "Learning to see",
      summary: "Most people look without observing. This week you learn to scan a scene in a fixed order, describe before you interpret, and remember what you saw.",
      intro: { t: "The selective attention test (Simons and Chabris)", v: "vJG698U2Mvo", note: "Before you read on, watch this one-minute video and count how many times the players in white pass the ball. Then read the first lesson." },
      lessons: [
        { h: "Seeing is not observing", body: `
<p>Your eyes take in far more than your brain keeps. Attention acts like a spotlight: whatever sits outside it is easy to miss, even when it is right in front of you. Psychologists call this <em>inattentional blindness</em>. In a famous 1999 experiment by Daniel Simons and Christopher Chabris, about half the people counting basketball passes in a video failed to notice a person in a gorilla suit walking through the middle of the scene.</p>
<p>That is the starting point for everything in this course. Observation is not a talent you are born with. It is a habit of deciding, on purpose, where your spotlight goes.</p>` },
        { h: "The scan: a fixed order", body: `
<p>Untrained eyes jump to whatever is loud, bright or moving. A trained observer uses a fixed order so nothing gets skipped. Use this one for rooms:</p>
<ol><li>Entrances and exits.</li><li>The people: how many, where they are, who is with whom.</li><li>Large objects: furniture, screens, windows.</li><li>Small objects on surfaces.</li><li>What is out of place, broken, new or missing.</li></ol>
<p>And this one for people, from the top down: face and hair, hands, clothes, shoes, what they carry, and how they hold themselves. Hands and shoes are where the most information hides, because people curate their faces and clothes but rarely their nails, calluses, scuffs and wear.</p>` },
        { h: "Describe first, interpret second", body: `
<p>The biggest mistake beginners make is jumping straight to a conclusion: "she's nervous". Instead, write the raw facts first: "she is holding her phone with both hands, her shoulders are raised, she checks the door every few seconds". Only then ask what it might mean, and list more than one possibility.</p>
<p>Keeping facts and interpretations separate is what makes Sherlock Holmes convincing. He reasons from small concrete details, and he is willing to drop a theory when a fact does not fit it.</p>` },
        { h: "Kim's Game", body: `
<p>This week's main drill comes from Rudyard Kipling's 1901 novel <em>Kim</em>, where a boy is trained as a spy by memorising trays of objects. Scouts and military trainers still use it. You study a set of objects for a short time, then recall as many as you can. The trick is to name each object silently and group them, for example "three kitchen things, two tools, something red", rather than staring at the whole set.</p>` }
      ],
      evidence: `<p><strong>Solid:</strong> inattentional blindness is one of the best-replicated findings in attention research. Naming and grouping items (chunking) reliably improves short-term recall.</p><p><strong>Be careful with:</strong> claims that observation training makes you "see everything". Practice improves the specific tasks you practise, so vary your drills.</p>`,
      study: [
        { t: "Mastermind: How to Think Like Sherlock Holmes (Maria Konnikova), chapters 1 to 3", u: ol("Mastermind How to Think Like Sherlock Holmes") },
        { t: "A Scandal in Bohemia, the first story in The Adventures of Sherlock Holmes (read it on this site)", u: "#/read/sherlock" },
        { t: "Crash Course Psychology: series preview", v: "eal4-A89IWY" },
        { t: "Crash Course Psychology, episodes 1 to 5 (full playlist on YouTube)", u: "https://www.youtube.com/playlist?list=PL8dPuuaLjXtOPRKzVLY0jJY-uHOH9KVU6" }
      ],
      tools: ["kims", "changes", "peripheral"],
      tasks: [
        "Room scan: look at a room for 10 seconds, close your eyes and list everything. Check. Use a new room each day.",
        "Describe 3 strangers in your journal with 5 specific details each: shoes, hands, bag, posture, expression.",
        "Build your first memory palace: pick your home and choose 10 fixed spots in walking order. Walk it in your mind."
      ],
      test: {
        intro: "Do this on Sunday. The Kim's Game part is scored automatically.",
        parts: [
          { id: "kims15", label: "Kim's Game: 15 objects, 60 seconds", tool: "kims", config: { count: 15, seconds: 60 }, target: 10 },
          { id: "room", label: "Room recall: details listed after a 30-second look", type: "number", target: 15 }
        ]
      }
    },

    /* ---------------- WEEK 2 ---------------- */
    {
      n: 2, month: 1, title: "The memory palace",
      summary: "Memory champions are not born with special brains. They use an old technique: placing vivid images along a route they already know. This week you build yours.",
      lessons: [
        { h: "Why places work", body: `
<p>Your brain is far better at remembering places and pictures than lists of words. You can probably walk through your childhood home in your mind right now and "see" each room. The memory palace, also called the <em>method of loci</em>, borrows that strength. You attach each thing you want to remember to a spot along a familiar route.</p>
<p>The technique is ancient. Greek and Roman orators used it to memorise speeches, and a story credits the poet Simonides with inventing it. Today nearly every competitive memory athlete uses some version of it.</p>` },
        { h: "How to build a palace", body: `
<ol><li>Choose a place you know well: your home, school or route to work.</li><li>Pick spots in a fixed walking order: front door, shoe rack, sofa, TV, kitchen sink, and so on. Start with 10, then grow to 20 and 40.</li><li>Walk the route in your mind until the order is automatic, forwards and backwards.</li></ol>` },
        { h: "How to place an image", body: `
<p>To remember the word "elephant" at your front door, do not just picture an elephant standing there. Make it strange, exaggerated and active: an elephant jammed in the doorway, trumpeting, the door frame cracking. The more absurd, colourful and physical the image, the better it sticks. Involve your senses: sound, smell, touch.</p>
<p>To recall, walk the route and "look" at each spot. The images will be waiting.</p>` },
        { h: "Remembering names", body: `
<p>Names are forgotten because we never really hear them; we are busy thinking about what to say next. Use this three-step method:</p>
<ol><li><strong>Hear it.</strong> Repeat the name back: "Nice to meet you, Kavya."</li><li><strong>Picture it.</strong> Turn the name into an image: Kavya sounds like "carry a"... a person carrying a giant pencil (kavya also means poetry).</li><li><strong>Pin it.</strong> Link that image to a feature of their face: the giant pencil balanced on her round glasses.</li></ol>
<p>Then use the name once more before you leave.</p>` },
        { h: "Review beats cramming", body: `<p>Memories fade fast at first and slower later. Review what you memorised after an hour, a day and a week. Each review makes the next one easier. This is called spaced repetition.</p>` }
      ],
      evidence: `<p><strong>Solid:</strong> the method of loci is one of the most strongly supported memory techniques. In a 2017 study in the journal <em>Neuron</em> (Dresler and colleagues), ordinary people who trained with it for about six weeks made large gains in word-list recall, and their brain activity patterns shifted toward those of memory champions. Spaced repetition is also very well supported.</p><p><strong>Be careful with:</strong> claims that memory training raises general intelligence. It improves memory for the kinds of material you practise.</p>`,
      study: [
        { t: "Moonwalking with Einstein (Joshua Foer)", u: ol("Moonwalking with Einstein") },
        { t: "Nelson Dellis on the memory palace", u: yt("Nelson Dellis memory palace") },
        { t: "Nelson Dellis on remembering names", u: yt("Nelson Dellis remember names") },
        { t: "Learning How to Learn (free to audit on Coursera)", u: "https://www.coursera.org/search?query=Learning%20How%20to%20Learn" }
      ],
      tools: ["words", "names", "facenames", "major"],
      tasks: [
        "Memorise a 20-word list with your palace using the word drill. Recall it again one hour later.",
        "Learn and use the name of everyone you meet. Link each name to a feature of their face.",
        "Add 10 more spots to your palace, for 20 in total.",
        "Keep the daily room scan going."
      ],
      test: {
        intro: "The word test is scored automatically and counts words in the correct order.",
        parts: [
          { id: "words30", label: "30 random words in 5 minutes, in order", tool: "words", config: { count: 30, seconds: 300 }, target: 25 },
          { id: "names10", label: "Names drill: 10 people, 2 minutes", tool: "names", config: { count: 10, seconds: 120 }, target: 8 }
        ]
      }
    },

    /* ---------------- WEEK 3 ---------------- */
    {
      n: 3, month: 1, title: "How minds take shortcuts",
      summary: "Every mind runs on shortcuts. Knowing them helps you understand people, predict their choices, and see how mentalists steer attention and decisions.",
      lessons: [
        { h: "Two systems", body: `
<p>Psychologist Daniel Kahneman described thinking as two systems. <strong>System 1</strong> is fast, automatic and effortless: recognising a face, finishing "bread and...", feeling that a stranger is unfriendly. <strong>System 2</strong> is slow and effortful: multiplying 17 by 24, checking an argument, choosing a phone plan.</p>
<p>System 1 runs most of your life, and it uses rules of thumb called <em>heuristics</em>. They are usually good enough, but they fail in predictable ways. Those predictable failures are called <em>cognitive biases</em>.</p>` },
        { h: "Ten biases to know first", body: `
<ul>
<li><strong>Confirmation bias:</strong> noticing and remembering what fits what we already believe.</li>
<li><strong>Anchoring:</strong> the first number we hear drags our estimates toward it.</li>
<li><strong>Availability:</strong> judging how likely something is by how easily examples come to mind.</li>
<li><strong>Halo effect:</strong> one good trait (looks, confidence) colours our view of everything else.</li>
<li><strong>Fundamental attribution error:</strong> blaming other people's character, but our own circumstances.</li>
<li><strong>Sunk cost fallacy:</strong> continuing something because of what we already spent.</li>
<li><strong>Framing:</strong> the same facts feel different depending on how they are worded.</li>
<li><strong>Hindsight bias:</strong> "I knew it all along" after the fact.</li>
<li><strong>Loss aversion:</strong> losses hurt more than equal gains please.</li>
<li><strong>Base-rate neglect:</strong> ignoring how common something is when judging a specific case.</li>
</ul>` },
        { h: "Twenty more to recognise", body: `
<p>The bias quiz goes further than the ten above. Learn these too; the quiz explains each one as you meet it.</p>
<ul>
<li><strong>Availability's cousins:</strong> the <em>frequency illusion</em> (noticing something everywhere once you've learned about it) and the <em>spotlight effect</em> (thinking everyone noticed you).</li>
<li><strong>About yourself:</strong> <em>overconfidence</em>, <em>optimism bias</em> (bad things happen to other people), the <em>planning fallacy</em> (projects take longer than planned, every time), the <em>illusion of control</em>, <em>self-serving bias</em> (credit for wins, excuses for losses) and the <em>curse of knowledge</em> (forgetting what it was like not to know).</li>
<li><strong>About others:</strong> <em>in-group bias</em>, the <em>false consensus effect</em> (assuming others think like you), the <em>bandwagon effect</em> and the <em>Barnum effect</em>.</li>
<li><strong>About value:</strong> the <em>endowment effect</em> (what we own feels worth more), <em>status quo bias</em>, the <em>decoy effect</em> and the <em>peak-end rule</em> (we remember an experience by its peak and its end).</li>
<li><strong>About evidence:</strong> <em>survivorship bias</em> (judging only the winners you can still see), the <em>gambler's fallacy</em> (believing a random outcome is "due"), <em>negativity bias</em> and the <em>mere exposure effect</em> (liking things just because they are familiar).</li>
</ul>` },
        { h: "Why mentalists care", body: `
<p>Mentalists use these shortcuts constantly. When a performer asks you to "think of a number between 1 and 10, quickly", the time pressure pushes you into System 1, where answers are far more predictable. When they recall only their hits, the audience's confirmation bias does the rest. Understanding biases is also your best defence: it keeps you honest about your own reads.</p>` },
        { h: "How to practise", body: `<p>Learn two biases a day. For each, write one real example from your own day, ideally one where <em>you</em> were the one fooled. Biases are much easier to spot in other people than in yourself, and that is exactly why the self-examples matter.</p>` }
      ],
      evidence: `<p><strong>Solid:</strong> anchoring, framing, loss aversion and the availability heuristic have been replicated many times.</p><p><strong>Be careful with:</strong> the chapter on "priming" in <em>Thinking, Fast and Slow</em>. Several of the social priming studies it describes failed to replicate, and Kahneman himself later said he had relied too much on them.</p>`,
      study: [
        { t: "Thinking, Fast and Slow (Daniel Kahneman), parts 1 and 2", u: ol("Thinking Fast and Slow Kahneman") },
        { t: "Introduction to Psychology, Yale, Paul Bloom (free to audit)", u: "https://online.yale.edu/courses/introduction-psychology" },
        { t: "Free textbook: Psychology 2e, OpenStax", u: "https://openstax.org/details/books/psychology-2e" }
      ],
      tools: ["quiz:biases"],
      tasks: [
        "Learn 2 cognitive biases a day. Write one real example of each from your day.",
        "Catch yourself in one bias each day and note it in your journal.",
        "Keep the room scan and a 20-word memory drill going."
      ],
      test: {
        intro: "Ten scenarios, pick the bias. Scored automatically.",
        parts: [
          { id: "biases", label: "Bias quiz: 10 scenarios", tool: "quiz", config: { bank: "biases", n: 10 }, target: 8 }
        ]
      }
    },

    /* ---------------- WEEK 4 ---------------- */
    {
      n: 4, month: 1, title: "Deduction",
      summary: "Jane's party trick is reasoning from small clues to a likely story, then checking it. This week you learn to do that properly, with confidence levels.",
      lessons: [
        { h: "What deduction really is", body: `
<p>What Holmes calls deduction is really <em>inference to the best explanation</em>, or abductive reasoning. You notice clues, imagine several stories that could explain them, and pick the one that explains the most with the fewest assumptions. It is never certain, which is why good observers speak in probabilities.</p>` },
        { h: "The chain", body: `
<p>Write every deduction as a chain: <em>I saw X, which usually means Y, so probably Z.</em></p>
<p>Example: "Ink smudge on the side of the left hand, which happens to left-handers who write with pens, so probably left-handed and writes a lot by hand." Writing the middle link forces you to notice when a chain is weak.</p>` },
        { h: "Base rates first", body: `
<p>Before reading clues, ask how common each answer is. A quiet person reading a book is still far more likely to be an engineer or a salesperson than a librarian, because there are many more of them. Start with the common answer, and let strong clues move you away from it.</p>` },
        { h: "Test, then update", body: `
<p>Patrick Jane rarely announces a guess cold. He tests it with a casual remark and watches the reaction. You can do the same: "You look like you've had a long day of meetings." A small smile, a sigh or a correction tells you whether to update. Then write down whether you were right. Your hit rate, not your confidence, tells you how good you are.</p>` }
      ],
      evidence: `<p><strong>Solid:</strong> "thin-slicing" research (Ambady and Rosenthal) shows that people form surprisingly accurate impressions of some traits, such as extraversion, from very brief observations.</p><p><strong>Be careful with:</strong> the accuracy is modest and uneven. Some traits, like honesty, are very hard to judge from appearance. Verify your reads.</p>`,
      study: [
        { t: "Mastermind (Maria Konnikova), remaining chapters", u: ol("Mastermind How to Think Like Sherlock Holmes") },
        { t: "Three more Sherlock Holmes stories (read them on this site)", u: "#/read/sherlock" },
        { t: "Watch 2 episodes of The Mentalist and pause before each reveal", u: yt("The Mentalist Patrick Jane observation scene") }
      ],
      tools: ["kims", "words", "changes"],
      tasks: [
        "Deduction game: guess one person's job, hobby or mood from appearance alone. Verify when you can.",
        "Write each deduction as a chain: I saw X, which usually means Y, so probably Z.",
        "Keep the memory and room scan drills going."
      ],
      test: {
        intro: "Month 1 exam. Two parts are scored automatically; for the other two, a friend checks you.",
        parts: [
          { id: "kims20", label: "Kim's Game: 20 objects, 60 seconds", tool: "kims", config: { count: 20, seconds: 60 }, target: 15 },
          { id: "words40", label: "40 random words in 5 minutes, in order", tool: "words", config: { count: 40, seconds: 300 }, target: 35 },
          { id: "photo", label: "Busy photo, 30-second look: details listed", type: "number", target: 20 },
          { id: "deduce", label: "Deductions correct, from 5 photos with 3 deductions each (out of 15)", type: "number", target: 8 }
        ]
      }
    },

    /* ---------------- WEEK 5 ---------------- */
    {
      n: 5, month: 2, title: "Baselines and body language",
      summary: "Body language is not a dictionary of gestures. It is about comfort and discomfort, and above all about change from a person's normal.",
      lessons: [
        { h: "Baseline first", body: `
<p>Some people always cross their arms. Some always fidget. A single gesture means very little until you know what is normal for that person. That normal is their <em>baseline</em>. Spend the first minutes of any conversation just learning it: how they sit, how often they blink, how they use their hands, how fast they talk.</p>
<p>What matters is <strong>change</strong>. If someone who has been relaxed suddenly goes still, presses their lips together and pulls their feet under the chair when a topic comes up, that topic matters to them.</p>` },
        { h: "Comfort and discomfort", body: `
<p>Former FBI agent Joe Navarro frames most body language as signs of comfort or discomfort. Comfort looks like open posture, relaxed shoulders, leaning in and mirroring. Discomfort looks like:</p>
<ul><li><strong>Distancing:</strong> leaning away, turning the torso or feet toward the exit.</li><li><strong>Blocking:</strong> placing a bag, cup or folded arms between you.</li><li><strong>Freezing:</strong> suddenly becoming very still.</li><li><strong>Self-soothing:</strong> rubbing the neck, touching the face, stroking the arms, playing with hair or jewellery.</li></ul>
<p>Navarro argues the feet are especially honest, because people rarely think to control them. It is a popular idea with little direct research behind it, so treat feet as one more signal in a cluster, never as proof on their own.</p>` },
        { h: "Clusters and context", body: `
<p>Never trust one signal. Look for <em>clusters</em>: three or four signs pointing the same way, at the same moment. And always check context: crossed arms in a cold room mean cold.</p>` },
        { h: "The muted interview drill", body: `<p>Put on a TV interview or a reality show and mute it. Every minute, write the emotion you see and what you based it on. Then rewatch with sound. You will quickly learn which of your reads were real and which were stories you told yourself.</p>` }
      ],
      evidence: `<p><strong>Solid:</strong> body language does carry information about emotion, comfort and engagement.</p><p><strong>Be careful with:</strong> lie detection. A large 2006 review by Bond and DePaulo found that people detect lies only about 54 percent of the time, barely better than a coin flip, and no single gesture reliably signals lying. Treat discomfort as "this matters to them", never as "they are lying".</p>`,
      study: [
        { t: "What Every Body Is Saying (Joe Navarro)", u: ol("What Every Body Is Saying Navarro") },
        { t: "WIRED: Former FBI Agent Explains How to Read Body Language", u: yt("WIRED Former FBI Agent Explains How to Read Body Language Joe Navarro") }
      ],
      tools: ["baseline"],
      tasks: [
        "Pick one person in a conversation and watch for 2 minutes. Note their baseline: posture, blinking, hands, speech.",
        "Notice one change from baseline, such as feet turning away or arms crossing, and guess what caused it.",
        "Watch 5 minutes of an interview on mute. Write the emotion you see every minute, then rewatch with sound."
      ],
      test: {
        intro: "Use three different muted clips of about 3 minutes each.",
        parts: [
          { id: "clips3", label: "Muted clips judged correctly (out of 3)", type: "number", target: 2 }
        ]
      }
    },

    /* ---------------- WEEK 6 ---------------- */
    {
      n: 6, month: 2, title: "Faces and emotions",
      summary: "The face is the most expressive part of the body. Learn the classic muscle patterns for seven emotions, and the honest limits of reading them.",
      lessons: [
        { h: "Seven classic expressions", body: `
<p>Psychologist Paul Ekman described seven emotions with recognisable facial patterns:</p>
<ul>
<li><strong>Happiness:</strong> lip corners pulled up and, in a felt smile, cheeks raised with crinkles at the eye corners.</li>
<li><strong>Sadness:</strong> inner corners of the eyebrows raised, upper eyelids drooping, lip corners pulled down.</li>
<li><strong>Anger:</strong> brows lowered and pulled together, a hard stare, lips pressed tight or squared.</li>
<li><strong>Fear:</strong> brows raised and pulled together, upper eyelids raised high, lips stretched sideways.</li>
<li><strong>Surprise:</strong> brows raised and curved, eyes wide, jaw dropping. It is brief.</li>
<li><strong>Disgust:</strong> nose wrinkled, upper lip raised.</li>
<li><strong>Contempt:</strong> one lip corner tightened and raised on one side only.</li>
</ul>` },
        { h: "Real and social smiles", body: `<p>A smile that only uses the mouth is often polite or social. A felt smile also lifts the cheeks and narrows the eyes. This is called a Duchenne smile, after the 19th-century scientist who studied it. Watch the eyes, not just the mouth.</p>` },
        { h: "Micro-expressions", body: `
<p>Sometimes an expression flashes across the face for a fraction of a second before a person masks it. Ekman called these micro-expressions. They show you that an emotion was felt, but not why. Someone may flash fear because they are afraid of being disbelieved, not because they are lying.</p>` },
        { h: "Mirror practice", body: `<p>Make each of the seven expressions in a mirror and notice which muscles you use. Feeling the patterns from the inside makes them much easier to recognise from the outside.</p>` }
      ],
      evidence: `<p><strong>Solid:</strong> people across many cultures recognise posed versions of these expressions above chance, and felt smiles do differ from polite ones.</p><p><strong>Debated:</strong> a major 2019 review led by Lisa Feldman Barrett argued that in real life, faces do not map onto emotions as neatly as the classic model suggests; people scowl when concentrating and smile when uncomfortable. Evidence that micro-expression training improves lie detection is weak. Always read the face together with context and baseline.</p>`,
      study: [
        { t: "Emotions Revealed (Paul Ekman)", u: ol("Emotions Revealed Paul Ekman") },
        { t: "Paul Ekman talks and interviews", u: yt("Paul Ekman facial expressions talk") },
        { t: "Greater Good Emotional Intelligence Quiz (free)", u: "https://greatergood.berkeley.edu/quizzes/ei_quiz" },
        { t: "Reading the Mind in the Eyes Test (search for a free version)", u: "https://www.google.com/search?q=Reading+the+Mind+in+the+Eyes+Test+online" }
      ],
      tools: ["quiz:emotions", "faces"],
      tasks: [
        "Mirror practice: make the 7 expressions and feel which muscles move.",
        "Spot and name 5 expressions in real people or videos each day.",
        "Keep one memory drill going: names of people you meet."
      ],
      test: {
        intro: "Take the quiz here, then the two free external tests. Your external scores are your baseline for week 12.",
        parts: [
          { id: "emotions", label: "Expression quiz: 10 descriptions", tool: "quiz", config: { bank: "emotions", n: 10 }, target: 7 },
          { id: "eyes", label: "Reading the Mind in the Eyes Test score (record it)", type: "number" },
          { id: "gg", label: "Greater Good quiz score (record it)", type: "number" }
        ]
      }
    },

    /* ---------------- WEEK 7 ---------------- */
    {
      n: 7, month: 2, title: "Cold reading",
      summary: "Cold reading makes a stranger feel deeply understood using general statements, smart questions and their own reactions. Learn it so you can perform it honestly and spot it everywhere.",
      lessons: [
        { h: "The Barnum effect", body: `
<p>In 1949, psychologist Bertram Forer gave his students what he said were personal personality profiles. Every student got the same text, mostly lines from horoscopes. On average they rated it around 4 out of 5 for accuracy. This is the <em>Forer</em> or <em>Barnum effect</em>: we accept vague, flattering descriptions as uniquely about us.</p>` },
        { h: "The core techniques", body: `
<ul>
<li><strong>Barnum statements:</strong> true of almost everyone. "You have a lot of potential you haven't used yet."</li>
<li><strong>The rainbow ruse:</strong> a statement that covers a trait and its opposite. "You can be very social, but sometimes you need time alone." (Ian Rowland coined the name.)</li>
<li><strong>Fishing:</strong> a statement shaped like a question, so the person fills in the detail. "Does the month of June mean something to you?"</li>
<li><strong>Shotgunning:</strong> many quick possibilities to a group, then following whichever one lands.</li>
<li><strong>Warm reading:</strong> using visible clues, such as a ring, a uniform, rough hands or a tan line.</li>
<li><strong>Reframing a miss:</strong> turning a wrong guess into a right one. "Not a brother? Then someone who is like a brother to you."</li>
</ul>` },
        { h: "Three more from Rowland's toolkit", body: `
<ul>
<li><strong>The fuzzy fact:</strong> a statement that sounds factual but is vague enough to be shaped by the reaction. "I'm seeing a connection with Europe, possibly Britain, or somewhere warmer in the south."</li>
<li><strong>The vanishing negative:</strong> a question phrased so either answer is a hit. "You don't work with children, do you?" If no: "No, I didn't think so." If yes: "Yes, I sensed that."</li>
<li><strong>Hot reading:</strong> not reading at all, but information gathered in advance, from social media, overheard conversations or research, then presented as insight. It is how many fake psychics have been caught.</li>
</ul>` },
        { h: "Why it feels so accurate", body: `<p>Listeners do most of the work. They search their own lives for a match, remember the hits and forget the misses, and give away information with their faces. A good reader simply watches for nods and leans further into whatever gets a reaction.</p>` },
        { h: "The honest way to use it", body: `<p>Cold reading has been used by fake psychics to take money from grieving people. Performers like Derren Brown and Suhani Shah are open that their readings are psychology and skill. Follow their example: practise only with people who know you are practising, and always explain afterwards how it worked. That reveal is often the most impressive part.</p>` }
      ],
      evidence: `<p><strong>Solid:</strong> the Barnum effect has been replicated many times, and is stronger when the description is flattering and said to be personal.</p><p><strong>Note:</strong> controlled tests of people claiming real psychic ability have not shown accuracy beyond what cold reading explains.</p>`,
      study: [
        { t: "The Full Facts Book of Cold Reading (Ian Rowland)", u: ol("Full Facts Book of Cold Reading") },
        { t: "Ian Rowland talks on cold reading", u: yt("Ian Rowland cold reading") },
        { t: "Derren Brown on cold reading and psychics", u: yt("Derren Brown cold reading") }
      ],
      tools: ["quiz:cold"],
      tasks: [
        "Learn 2 techniques a day and write your own example of each.",
        "Write a full 3-minute general reading and say it out loud until it flows.",
        "Give a 2-minute reading to a friend who knows you are practising. Note what they reacted to."
      ],
      test: {
        intro: "Take the technique quiz, then give a 5-minute reading to 3 friends who rate it from 1 to 10. Explain how it worked afterwards.",
        parts: [
          { id: "cold", label: "Technique quiz: 10 statements", tool: "quiz", config: { bank: "cold", n: 10 }, target: 8 },
          { id: "rating7", label: "Average friend rating for your reading (1 to 10)", type: "number", target: 6, step: 0.1 }
        ]
      }
    },

    /* ---------------- WEEK 8 ---------------- */
    {
      n: 8, month: 2, title: "Rapport and influence",
      summary: "People open up to people they like and trust. This week you learn the science of rapport and Robert Cialdini's principles of influence.",
      lessons: [
        { h: "Rapport", body: `
<p>Rapport is the feeling of being understood. It is built with simple, learnable behaviours:</p>
<ul><li><strong>Use their name,</strong> early and once more at the end.</li><li><strong>Ask open questions:</strong> "What got you into that?" rather than "Do you like it?"</li><li><strong>Mirror words:</strong> repeat the last few important words they said, with curiosity. They will usually explain more.</li><li><strong>Label emotions:</strong> "It sounds like that was really stressful." Former FBI negotiator Chris Voss calls this tactical empathy.</li><li><strong>Listen more than you talk.</strong> Most of what Jane knows, people simply tell him.</li></ul>` },
        { h: "Six principles of influence", body: `
<p>Psychologist Robert Cialdini identified six principles that make people more likely to say yes:</p>
<ul>
<li><strong>Reciprocity:</strong> we feel obliged to return favours and gifts.</li>
<li><strong>Commitment and consistency:</strong> once we say a small yes, we tend to keep acting consistently with it.</li>
<li><strong>Social proof:</strong> we copy what people like us are doing.</li>
<li><strong>Authority:</strong> we defer to experts and symbols of expertise, such as uniforms and titles.</li>
<li><strong>Liking:</strong> we say yes to people we like, who are similar to us, or who compliment us.</li>
<li><strong>Scarcity:</strong> things seem more valuable when they are rare or running out.</li>
</ul>
<p>He later added a seventh, <strong>unity</strong>: a sense of shared identity, such as family, hometown or team.</p>` },
        { h: "Using it well", body: `<p>Spot one principle being used on you each day, in shops, ads and apps. In your own conversations, use rapport to understand people, not to pressure them. Influence that people would be upset to discover is manipulation.</p>` }
      ],
      evidence: `<p><strong>Solid:</strong> reciprocity, social proof and commitment effects are well supported in field studies, though effect sizes vary by setting.</p><p><strong>Mixed:</strong> studies on mimicry increasing liking (the "chameleon effect") have had mixed replication results. Mirror words sincerely; do not copy gestures mechanically.</p>`,
      study: [
        { t: "Influence (Robert Cialdini)", u: ol("Influence Cialdini") },
        { t: "Never Split the Difference (Chris Voss)", u: ol("Never Split the Difference") },
        { t: "Chris Voss talks on mirroring and labeling", u: yt("Chris Voss mirroring labeling") },
        { t: "Social Psychology, Scott Plous (free to audit on Coursera)", u: "https://www.coursera.org/search?query=Social%20Psychology%20Wesleyan" }
      ],
      tools: ["quiz:influence"],
      tasks: [
        "Start one conversation with someone new. Use their name, mirror their words and label one emotion.",
        "Afterwards, write 5 things you learned about them without asking directly.",
        "Spot one influence principle used on you each day."
      ],
      test: {
        intro: "Month 2 exam.",
        parts: [
          { id: "influence", label: "Influence quiz: 10 scenarios", tool: "quiz", config: { bank: "influence", n: 10 }, target: 8 },
          { id: "clips4", label: "Muted clips judged correctly (out of 4)", type: "number", target: 3 },
          { id: "memories", label: "Friend thinks of happy, sad or annoying memories: rounds guessed (out of 6)", type: "number", target: 4 },
          { id: "reading8", label: "5-minute reading for someone new: their rating (1 to 10)", type: "number", target: 6, step: 0.1 }
        ]
      }
    },

    /* ---------------- WEEK 9 ---------------- */
    {
      n: 9, month: 3, title: "Your first mentalism effects",
      summary: "Mentalism is a performance art: the experience of mind reading, prediction and impossible memory. This week you learn three effects, one of them powered by a real skill you already have.",
      lessons: [
        { h: "What mentalism is", body: `
<p>Mentalism creates the experience of reading minds, predicting choices and influencing thoughts. Most effects combine a hidden method with real psychology and showmanship. The best performers are honest that it is a craft. As Derren Brown often explains, his work mixes magic, suggestion, psychology and showmanship.</p>
<p>Two conventions matter: never perform the same effect twice for the same audience, and do not reveal methods casually. Being honest that it is not supernatural is different from explaining how each effect works.</p>` },
        { h: "Effect 1: the memory demonstration (real skill)", body: `
<p>Ask the audience to call out 20 objects while someone writes them down and numbers them. Place each one in your memory palace. Then recite them all in order, backwards, or by number: "What was number 14?"</p>
<p>There is no trick here. It is the skill you built in month 1, and it is one of the strongest effects you can perform because it is real.</p>` },
        { h: "Effect 2: the 1089 prediction", body: `
<p>Before you start, write "1089" on a card and seal it in an envelope. Ask someone to:</p>
<ol><li>Think of a 3-digit number whose first and last digits differ by at least 2, such as 742.</li><li>Reverse it (247) and subtract the smaller from the larger (742 minus 247 = 495).</li><li>Reverse that result (594) and add it to the result (495 plus 594).</li></ol>
<p>The answer is always 1089. Have them open the envelope. The mathematics does the work; your job is the story. Use a calculator and let them choose freely, which makes it feel more impossible.</p>` },
        { h: "Effect 3: the psychological guess", body: `
<p>Ask someone to answer fast, without thinking. Questions answered in a rush are much more predictable. For example, ask for "a number between 1 and 10", or a two-digit number with two different odd digits; many people choose a small set of answers. Present it as an experiment in reading them, and always have an out ready: if you miss, laugh and say you were reading their second choice, then ask if you were close.</p>
<p>Because this is based on probability, it will sometimes fail. That is fine, and honest framing makes the hits feel earned.</p>` },
        { h: "Practice", body: `<p>Rehearse each effect in front of a mirror or a phone camera until the method is invisible and the words come naturally. Practise the reveal moment most: pause, look at the person, then show the result.</p>` }
      ],
      evidence: `<p><strong>Solid:</strong> the memory demonstration uses the method of loci from week 2. The 1089 effect is a mathematical certainty for any qualifying number.</p><p><strong>Probabilistic:</strong> psychological forces work more often than chance but not every time. Always plan an out.</p>`,
      study: [
        { t: "Tricks of the Mind (Derren Brown), the magic and memory sections", u: ol("Tricks of the Mind Derren Brown") },
        { t: "Mark Wilson's Complete Course in Magic", u: ol("Mark Wilson's Complete Course in Magic") },
        { t: "13 Steps to Mentalism (Tony Corinda), first steps", u: ol("13 Steps to Mentalism Corinda") }
      ],
      tools: ["words", "cards", "major"],
      tasks: [
        "Learn the 3 effects above and rehearse each one for 20 minutes a day on camera.",
        "Run the memory demonstration privately with 20 random words until it is reliable.",
        "Card drill: memorise the order of 10 playing cards with your palace. Add more as it gets easy."
      ],
      test: {
        intro: "Perform for 2 family members or friends, then do the card drill here.",
        parts: [
          { id: "cards10", label: "Card drill: 10 cards in order, 2 minutes", tool: "cards", config: { count: 10, seconds: 120 }, target: 10 },
          { id: "perf9", label: "People who could not explain any method (out of 2)", type: "number", target: 2 }
        ]
      }
    },

    /* ---------------- WEEK 10 ---------------- */
    {
      n: 10, month: 3, title: "Showmanship and scripting",
      summary: "The method is maybe a fifth of an effect. The rest is story, pacing and making the audience feel something. This week you write your script.",
      lessons: [
        { h: "The shape of an effect", body: `
<p>Most strong effects follow the same shape:</p>
<ol><li><strong>Hook:</strong> one line that makes people curious. "I want to try something that doesn't always work."</li><li><strong>Premise:</strong> what you will attempt, stated clearly so they know what impossible looks like.</li><li><strong>Process:</strong> the part where they make free choices. Slow down and make those choices feel truly free.</li><li><strong>Climax:</strong> the reveal. Pause before it.</li><li><strong>Applause cue:</strong> a clear end, such as a smile, a step back or "thank you".</li></ol>` },
        { h: "Make them the star", body: `<p>Suhani Shah's performances work because the participants feel seen, not fooled. Use their names, react to their answers, and make the climax about them: "You chose this, completely freely." People remember how a show made them feel.</p>` },
        { h: "Voice and body", body: `<ul><li>Speak slower than feels natural. Nerves speed you up.</li><li>Pause before and after the reveal.</li><li>Stand still when you say something important.</li><li>Look at the person, not at your props.</li></ul>` },
        { h: "Nerves and outs", body: `<p>Stage fright is normal. Rehearse until the words are automatic, breathe out slowly before you begin, and have an out for every effect so a miss never ends the show. Audiences forgive a miss handled with humour.</p>` }
      ],
      evidence: `<p>This week is craft rather than research. The best evidence is your own recordings: watch them back and fix one thing at a time.</p>`,
      study: [
        { t: "Suhani Shah performances", u: yt("Suhani Shah mentalist performance") },
        { t: "Derren Brown specials and interviews", u: yt("Derren Brown mind control") },
        { t: "Banachek interviews on mentalism", u: yt("Banachek mentalism interview") },
        { t: "Performance mode on this site: script builder, teleprompter and show timer", u: "#/perform" }
      ],
      tools: ["pacing"],
      tasks: [
        "Write a script for each effect: hook, premise, process, climax, applause cue.",
        "Record yourself performing. Watch it back and fix one thing each day: speed, nervous habits, eye contact.",
        "Read aloud or tell a story slowly and confidently for 5 minutes."
      ],
      test: {
        intro: "A 5-minute mini-show for 3 people. Ask each to rate how impressive it felt from 1 to 10.",
        parts: [
          { id: "show5", label: "Average rating for your mini-show (1 to 10)", type: "number", target: 7, step: 0.1 }
        ]
      }
    },

    /* ---------------- WEEK 11 ---------------- */
    {
      n: 11, month: 3, title: "Real reading in performance",
      summary: "Now you put genuine people-reading on stage: games where you read tiny reactions, and the ideomotor effect behind muscle reading.",
      lessons: [
        { h: "The which-hand game", body: `
<p>A friend hides a coin in one hand behind their back, then brings both closed fists forward. You read them to guess which hand holds it. Watch for:</p>
<ul><li>A quick glance toward the hand with the coin.</li><li>One fist held slightly tighter, higher or further back.</li><li>A tiny shoulder shift or lean.</li><li>Changes when you hover over each hand and say "this one?"</li></ul>
<p>Track every round. By pure luck you would get about half right, so you need many rounds to know if you are really reading them.</p>` },
        { h: "How to tell skill from luck", body: `<p>In 20 rounds, getting 13 or more right happens by luck only about 13 percent of the time. Getting 15 or more happens by luck only about 2 percent of the time. Use the tracker to see where you stand.</p>` },
        { h: "The ideomotor effect", body: `
<p>Your body makes tiny movements toward what you are thinking about, without you deciding to. This is the <em>ideomotor effect</em>, described by William Carpenter in 1852. It explains why Ouija board pointers move and why dowsing rods twitch.</p>
<p>Mentalists use it in <strong>muscle reading</strong>: a person hides an object, then holds your wrist and thinks hard about where it is. Walk slowly and feel for tiny pushes and resistance. With practice, you can often find the hidden object. Always ask permission before any touch.</p>` },
        { h: "The think-of-a-person game", body: `<p>A friend thinks of someone you both know. You ask yes or no questions while watching their reactions closely, aiming to guess in fewer questions each time. Their face often answers before their mouth does.</p>` }
      ],
      evidence: `<p><strong>Solid:</strong> the ideomotor effect is well established, including in controlled studies of Ouija-style tasks.</p><p><strong>Honest framing:</strong> reading tells works with some people and not others. Your tracked hit rate is the only real measure.</p>`,
      study: [
        { t: "Re-read your notes on baselines, cold reading and rapport (weeks 5, 7 and 8)", u: "#/week/5" },
        { t: "Muscle reading demonstrations", u: yt("muscle reading mentalism Hellstromism") },
        { t: "The ideomotor effect explained", u: yt("ideomotor effect explained") },
        { t: "Reading tracker in performance mode: log hits and misses honestly", u: "#/perform/readings" }
      ],
      tools: ["whichhand"],
      tasks: [
        "Play the which-hand game with a friend and log every round in the tracker.",
        "Play the think-of-a-person game and count how many questions you needed.",
        "Add one observation or cold reading moment to your mini-show."
      ],
      test: {
        intro: "Play 20 rounds of the which-hand game using the tracker.",
        parts: [
          { id: "hands20", label: "Which-hand game: hits out of 20 rounds", tool: "whichhand", config: { rounds: 20 }, target: 13 }
        ]
      }
    },

    /* ---------------- WEEK 12 ---------------- */
    {
      n: 12, month: 3, title: "Final show and retests",
      summary: "Everything comes together: a 10-minute show for a real audience, and a retest of every skill so you can see exactly how far you have come.",
      lessons: [
        { h: "Building a set", body: `
<p>Order your effects deliberately:</p>
<ol><li><strong>Opener:</strong> short, clear and strong, such as the 1089 prediction. It shows you are worth watching.</li><li><strong>Middle:</strong> the most interactive pieces, such as the which-hand game or a reading, where the audience gets involved.</li><li><strong>Closer:</strong> your strongest and most personal effect. The memory demonstration works well because it is real and builds as it goes.</li></ol>` },
        { h: "Rehearsal plan", body: `<ul><li>Days 1 to 3: run the full show daily, alone.</li><li>Days 4 and 5: two full dress rehearsals on camera, in the clothes you will wear.</li><li>Day 6: one run for a single friend.</li><li>Day 7: the show, then the retests.</li></ul>` },
        { h: "After the show", body: `<p>Ask your audience three questions: what was their favourite moment, what confused them, and what would they want to see more of. Write the answers in your journal. Then retake every test and compare your scores to month 1 in the tracker.</p>` }
      ],
      evidence: `<p>Your tracker is your evidence. Compare week 1, week 6 and week 12. Improvement on measured, honest tests is what separates real skill from feeling skilled.</p>`,
      study: [
        { t: "Your progress tracker", u: "#/tracker" },
        { t: "Performance mode: run your 10-minute show with the show timer", u: "#/perform/timer" },
        { t: "Your journal", u: "#/journal" }
      ],
      tools: ["kims", "words", "names", "facenames", "whichhand", "faces"],
      tasks: [
        "Rehearse a full 10-minute show: 3 to 4 effects plus one observation or reading moment.",
        "Do 2 full dress rehearsals on camera.",
        "Retake every earlier test during the week."
      ],
      test: {
        intro: "The final exam. Take your time across the week.",
        parts: [
          { id: "show10", label: "10-minute show for 5 or more people: average rating (1 to 10)", type: "number", target: 7, step: 0.1 },
          { id: "kimsF", label: "Kim's Game: 20 objects, 60 seconds", tool: "kims", config: { count: 20, seconds: 60 }, target: 18 },
          { id: "wordsF", label: "40 random words in 5 minutes, in order", tool: "words", config: { count: 40, seconds: 300 }, target: 40 },
          { id: "namesF", label: "Names drill: 20 people, 5 minutes", tool: "names", config: { count: 20, seconds: 300 }, target: 18 },
          { id: "eyesF", label: "Reading the Mind in the Eyes Test retake: beat your week 6 score", type: "number", beat: { week: 6, part: "eyes" } },
          { id: "stranger", label: "Stranger described in 30 seconds: specific details", type: "number", target: 15 }
        ]
      }
    }
  ],

  /* Books hosted on this site. Only public-domain or openly licensed books belong here. */
  readable: [
    { id: "sherlock", t: "The Adventures of Sherlock Holmes", a: "Arthur Conan Doyle", file: "assets/books/adventures-of-sherlock-holmes.pdf", size: "1.4 MB", week: "Weeks 1 to 4", note: "Twelve stories, public domain, from Project Gutenberg. Start with A Scandal in Bohemia." }
  ],

  library: {
    books: [
      { t: "Mastermind: How to Think Like Sherlock Holmes", a: "Maria Konnikova", skill: "Observation", week: "1, 4", tier: "Core" },
      { t: "The Adventures of Sherlock Holmes", a: "Arthur Conan Doyle", skill: "Observation", week: "1 to 4", tier: "Core", free: "#/read/sherlock" },
      { t: "Moonwalking with Einstein", a: "Joshua Foer", skill: "Memory", week: "2", tier: "Core" },
      { t: "Thinking, Fast and Slow", a: "Daniel Kahneman", skill: "Psychology", week: "3", tier: "Core" },
      { t: "What Every Body Is Saying", a: "Joe Navarro", skill: "Body language", week: "5", tier: "Core" },
      { t: "The Full Facts Book of Cold Reading", a: "Ian Rowland", skill: "Cold reading", week: "7", tier: "Core" },
      { t: "Influence", a: "Robert Cialdini", skill: "Influence", week: "8", tier: "Core" },
      { t: "Tricks of the Mind", a: "Derren Brown", skill: "Mentalism", week: "9, 10", tier: "Core" },
      { t: "Emotions Revealed", a: "Paul Ekman", skill: "Faces", week: "6", tier: "Extra" },
      { t: "Never Split the Difference", a: "Chris Voss", skill: "Rapport", week: "8", tier: "Extra" },
      { t: "How to Win Friends and Influence People", a: "Dale Carnegie", skill: "Rapport", week: "8", tier: "Extra" },
      { t: "Unlimited Memory", a: "Kevin Horsley", skill: "Memory", week: "2", tier: "Extra" },
      { t: "Mark Wilson's Complete Course in Magic", a: "Mark Wilson", skill: "Magic basics", week: "9", tier: "Extra" },
      { t: "13 Steps to Mentalism", a: "Tony Corinda", skill: "Mentalism", week: "After", tier: "Next" },
      { t: "Practical Mental Magic", a: "Theodore Annemann", skill: "Mentalism", week: "After", tier: "Next" },
      { t: "Psychological Subtleties", a: "Banachek", skill: "Mentalism", week: "After", tier: "Next" },
      { t: "Telling Lies", a: "Paul Ekman", skill: "Deception research", week: "After", tier: "Next" }
    ],
    free: [
      { t: "Psychology 2e", type: "Free textbook", what: "A complete university psychology textbook, free to read and download.", u: "https://openstax.org/details/books/psychology-2e" },
      { t: "Noba Psychology", type: "Free textbook modules", what: "Short, readable chapters on emotion, memory and social psychology.", u: "https://nobaproject.com" },
      { t: "Introduction to Psychology, Yale (Paul Bloom)", type: "Free course", what: "About 15 hours on perception, memory, persuasion and emotion. Free to audit.", u: "https://online.yale.edu/courses/introduction-psychology" },
      { t: "Open Yale Courses", type: "Free lectures", what: "Full lecture series, including introductory psychology, with no sign-up.", u: "https://oyc.yale.edu" },
      { t: "Social Psychology (Wesleyan)", type: "Free course", what: "Persuasion, conformity and how people judge others.", u: "https://www.coursera.org/search?query=Social%20Psychology%20Wesleyan" },
      { t: "Learning How to Learn", type: "Free course", what: "How to study and remember better. Speeds up everything else.", u: "https://www.coursera.org/search?query=Learning%20How%20to%20Learn" },
      { t: "The Adventures of Sherlock Holmes", type: "Free e-book", what: "Public domain. Read it on this site or download the PDF.", u: "#/read/sherlock" },
      { t: "Greater Good Emotional Intelligence Quiz", type: "Free test", what: "Read emotions from photos of faces.", u: "https://greatergood.berkeley.edu/quizzes/ei_quiz" },
      { t: "Open Library", type: "Free book lending", what: "Borrow digital copies of many of the books above, legally.", u: "https://openlibrary.org" }
    ],
    videos: [
      { t: "Crash Course Psychology", what: "40 short episodes covering all of psychology", week: "1 to 4", u: "https://www.youtube.com/playlist?list=PL8dPuuaLjXtOPRKzVLY0jJY-uHOH9KVU6" },
      { t: "The selective attention test (Simons and Chabris)", what: "The one-minute video behind inattentional blindness", week: "1", u: "https://www.youtube.com/watch?v=vJG698U2Mvo" },
      { t: "Paul Bloom's Yale psychology lectures", what: "University-level depth", week: "1 to 4", u: yt("Paul Bloom Yale Introduction to Psychology lecture") },
      { t: "Nelson Dellis", what: "Memory palace, names, numbers and cards", week: "2", u: yt("Nelson Dellis memory") },
      { t: "WIRED: Joe Navarro on body language", what: "Grounded body language", week: "5", u: yt("WIRED Former FBI Agent Explains How to Read Body Language") },
      { t: "Paul Ekman talks", what: "Facial expressions and micro-expressions", week: "6", u: yt("Paul Ekman facial expressions") },
      { t: "Ian Rowland on cold reading", what: "How cold reading really works", week: "7", u: yt("Ian Rowland cold reading") },
      { t: "Chris Voss talks", what: "Rapport, mirroring and labeling", week: "8", u: yt("Chris Voss mirroring labeling") },
      { t: "Suhani Shah", what: "Stage presence and honest framing", week: "9 to 12", u: yt("Suhani Shah mentalist") },
      { t: "Derren Brown", what: "Psychology-based mentalism and showmanship", week: "9 to 12", u: yt("Derren Brown") },
      { t: "Banachek interviews", what: "How a top mentalist thinks about method", week: "10 to 12", u: yt("Banachek interview") }
    ]
  },

  glossary: [
    { t: "Abductive reasoning", w: 4, d: "Reasoning to the best available explanation for a set of clues. What Sherlock Holmes calls deduction is mostly this. It is never certain." },
    { t: "Action unit", w: 6, d: "One visible movement of facial muscles, such as raising the inner brows, in the Facial Action Coding System (FACS) developed by Paul Ekman and Wallace Friesen. Expressions are described as combinations of action units." },
    { t: "Anchoring", w: 3, d: "The first number we hear pulls later estimates toward it, even when it is irrelevant." },
    { t: "Applause cue", w: 10, d: "A clear signal that an effect has ended, such as a pause, a smile or a step back, so the audience knows when to react." },
    { t: "Authority", w: 8, d: "Cialdini's principle that we defer to experts and to symbols of expertise, such as titles and uniforms." },
    { t: "Availability heuristic", w: 3, d: "Judging how likely something is by how easily examples come to mind." },
    { t: "Barnum effect", w: 7, d: "Also called the Forer effect. People rate vague, general descriptions as highly accurate descriptions of themselves." },
    { t: "Base-rate neglect", w: 3, d: "Ignoring how common something is in general when judging a specific case." },
    { t: "Baseline", w: 5, d: "How a particular person normally behaves when relaxed: posture, gestures, blinking, speech. Signals only mean something as changes from it." },
    { t: "Change blindness", w: 1, d: "Failing to notice large changes in a scene when the change happens during a brief interruption, such as a blink or a cut." },
    { t: "Chunking", w: 1, d: "Grouping separate items into meaningful units so more fit in short-term memory." },
    { t: "Cluster", w: 5, d: "Several signals that change together at the same moment. Far more informative than any single gesture." },
    { t: "Cognitive bias", w: 3, d: "A predictable error in judgment that comes from the mental shortcuts we use." },
    { t: "Cold reading", w: 7, d: "Techniques that make a stranger feel deeply understood using general statements, questions and their own reactions." },
    { t: "Commitment and consistency", w: 8, d: "Cialdini's principle that once we say a small yes, we tend to keep acting in line with it." },
    { t: "Confirmation bias", w: 3, d: "Noticing, seeking and remembering information that fits what we already believe." },
    { t: "Contempt", w: 6, d: "The only classic expression that is one-sided: one lip corner tightened and raised." },
    { t: "Door-in-the-face", w: 8, d: "Making a large request that will be refused, then a smaller one. The concession feels like a favour that deserves one back." },
    { t: "Duchenne smile", w: 6, d: "A felt smile that raises the cheeks and crinkles the eye corners, not just the mouth. Named after the 19th-century scientist Guillaume Duchenne." },
    { t: "Endowment effect", w: 3, d: "Valuing something more simply because we own it." },
    { t: "Fishing", w: 7, d: "A cold reading question disguised as a statement, so the other person supplies the details." },
    { t: "Foot-in-the-door", w: 8, d: "Getting agreement to a small request first, which makes a larger request more likely to succeed." },
    { t: "Force", w: 9, d: "A method that makes a person's apparently free choice turn out the way the performer needs. Psychological forces only work some of the time." },
    { t: "Framing effect", w: 3, d: "The same facts lead to different choices depending on how they are worded." },
    { t: "Fundamental attribution error", w: 3, d: "Explaining other people's behaviour by their character while underestimating their situation." },
    { t: "Fuzzy fact", w: 7, d: "Ian Rowland's term for a statement that sounds factual but is vague enough to be shaped by the response." },
    { t: "Halo effect", w: 3, d: "One positive trait, such as looks or confidence, colours our judgment of unrelated traits." },
    { t: "Heuristic", w: 3, d: "A mental rule of thumb that is usually good enough but fails in predictable ways." },
    { t: "Hindsight bias", w: 3, d: "The feeling, after an outcome, that we knew it all along." },
    { t: "Hot reading", w: 7, d: "Information gathered in advance, through research, social media or accomplices, and presented as a reading." },
    { t: "Ideomotor effect", w: 11, d: "Tiny movements the body makes toward what a person is thinking about, without conscious intent. Described by William Carpenter in 1852." },
    { t: "Inattentional blindness", w: 1, d: "Failing to see something in plain view because attention is elsewhere, as in the famous gorilla experiment." },
    { t: "Kim's Game", w: 1, d: "A memory and observation exercise from Kipling's novel Kim: study a set of objects briefly, then recall them." },
    { t: "Labeling", w: 8, d: "Naming the emotion you think someone feels, such as \"It sounds like that was stressful.\" A rapport technique taught by Chris Voss." },
    { t: "Liking", w: 8, d: "Cialdini's principle that we say yes to people we like, who are similar to us or who compliment us." },
    { t: "Loss aversion", w: 3, d: "Losses feel larger than gains of the same size." },
    { t: "Major system", w: 2, d: "A code that turns each digit into a consonant sound (1 is t or d, 2 is n, 3 is m and so on) so numbers can be turned into words and memorised." },
    { t: "Memory palace", w: 2, d: "Also called the method of loci. Remembering items by placing vivid images of them along a route you know well." },
    { t: "Mentalism", w: 9, d: "A performing art that creates the experience of mind reading, prediction and influence, using method, psychology and showmanship." },
    { t: "Micro-expression", w: 6, d: "A facial expression that flashes for a fraction of a second, often before being masked. It shows an emotion was felt, not why." },
    { t: "Mirroring", w: 8, d: "Repeating the last few important words someone said, with curiosity, which invites them to say more." },
    { t: "Muscle reading", w: 11, d: "Finding a hidden object by feeling a person's tiny, unconscious movements through light touch. Also called Hellstromism. Always ask before touching." },
    { t: "Out", w: 9, d: "A prepared way to continue gracefully when an effect misses, so the show never stalls." },
    { t: "Peak-end rule", w: 3, d: "We judge an experience mostly by its most intense moment and its ending, rather than its average." },
    { t: "Rainbow ruse", w: 7, d: "Ian Rowland's term for a statement that credits someone with a trait and its opposite, so it cannot miss." },
    { t: "Rapport", w: 8, d: "The feeling of being understood, built with names, open questions, mirroring, labeling and listening." },
    { t: "Reciprocity", w: 8, d: "Cialdini's principle that we feel obliged to return gifts, favours and concessions." },
    { t: "Reframing a miss", w: 7, d: "Turning a wrong guess into an apparent hit by widening it or pushing it into the future." },
    { t: "Scarcity", w: 8, d: "Cialdini's principle that things seem more valuable when they are rare or running out." },
    { t: "Self-soothing", w: 5, d: "Touching the neck, face, arms or hair when uncomfortable. Navarro calls these pacifying behaviours. A sign that something matters, never proof of lying." },
    { t: "Shotgunning", w: 7, d: "Firing many quick guesses at a group and following whichever one lands." },
    { t: "Social proof", w: 8, d: "Cialdini's principle that we copy what people like us are doing, especially when unsure." },
    { t: "Spaced repetition", w: 2, d: "Reviewing material at growing intervals, such as an hour, a day and a week later. One of the best-supported ways to remember." },
    { t: "Survivorship bias", w: 3, d: "Drawing conclusions only from the cases that survived some process, ignoring the failures we can no longer see." },
    { t: "System 1 and System 2", w: 3, d: "Kahneman's labels for fast, automatic thinking and slow, effortful thinking." },
    { t: "Thin-slicing", w: 4, d: "Forming impressions from very brief observations. Research by Ambady and Rosenthal found such impressions are more accurate than chance for some traits." },
    { t: "Unity", w: 8, d: "Cialdini's seventh principle: a shared identity, such as family, hometown or team, makes us more open to influence." },
    { t: "Useful field of view", w: 1, d: "How wide an area you can take in at a glance while also attending to the centre. The basis of the Wide view drill." },
    { t: "Vanishing negative", w: 7, d: "Ian Rowland's term for a question phrased so that either answer can be claimed as a hit: \"You don't work with children, do you?\"" },
    { t: "Warm reading", w: 7, d: "Using visible clues, such as a ring, a uniform or rough hands, and presenting the deduction as intuition." }
  ],

  challenges: [
    "Count how many people you see wearing a watch today, and on which wrist.",
    "Notice the shoes of the first five people you talk to. What do they suggest?",
    "In your next conversation, learn the other person's baseline in the first minute.",
    "Find three things in your home you have never really looked at. Describe them in detail.",
    "Guess one stranger's job from appearance alone, and write down your reasons.",
    "Watch someone's feet during a conversation. Where do they point when the topic changes?",
    "Memorise the colours of every car parked on your street, in order.",
    "Spot one anchoring trick in a shop or app today.",
    "Use the name of everyone you meet, twice.",
    "Notice which people in a group look at whom when someone tells a joke.",
    "Find one real Duchenne smile and one polite smile today.",
    "Ask one open question and then stay quiet for three seconds longer than feels comfortable.",
    "Describe what changed in a room you know well since yesterday.",
    "Spot one example of social proof in an ad today.",
    "Watch hands during a phone call someone else is having. What do they do when stressed?",
    "Memorise a stranger's outfit in 5 seconds and write it down an hour later.",
    "Count how many times a person you are talking to touches their face.",
    "Notice the first word people use when you ask how they are. Does their face agree?",
    "Catch yourself in one cognitive bias today.",
    "Mirror the last three words someone says, with curiosity, and see what they add.",
    "Look for wear patterns: which part of a stranger's bag or shoes is most worn, and why?",
    "Predict what a friend will order before they do. Check.",
    "Notice one time someone's words and face disagreed.",
    "Walk your memory palace backwards without stopping.",
    "Spot three left-handed people today, and how you could tell."
  ]
};
