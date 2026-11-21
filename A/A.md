### Step 1: Generate the Reference

Use a precise product-shot prompt. Example structure:

A robotic [hammerhead shark] as a precision machine, studio product shot on a near-white background with a soft floor shadow. White glossy shells with clearcoat; green only on tips, rims, edges, and joint rings. Dense dark mechanism visible through cut-outs and clear glass (gears, pistons, hoses, small screws). Eyes as glossy black lenses with a thin green ring. Fins and membranes milky and frosted with thin veins. Front three-quarter view, whole subject in frame.

The image is only a look target. Claude never imports it—it reads it and builds its own geometry. Swap the subject freely (motorcycle engine, camera drone, mechanical watch). Prefer subjects with lots of joints and a dense core; smooth white shells almost always read as toys. For creatures, give them one dominant set of limbs. Multiple competing limb sets create visual noise.

### Step 2: Write the Job Description

Save this as a project file and point Claude at it before every build. Three lines carry most of the weight:

- Grade against the picture (keeps the self-check honest).

- The film waits for my yes (prevents burning tokens on a failed still).

- Every correction goes back into this file (so build 5 doesn’t repeat the mistakes of build 1).

### Step 3: Write a Checklist for This Picture

The job description is universal. The checklist is picture-specific. Write it before any code. Example lines from the tarantula (4 of 12):

- Line 5 deliberately used the word “never” so glass wouldn’t collapse into another white shell (the default).

- Line 7 originally said “thin” without a number; bristles came back as quills. The fix was a concrete measurement: 0.15–0.25 of leg thickness. Almost every lasting improvement has been a sentence that includes a number.

### Step 4: Run the Still Loop, Then Grade It Yourself

Generate the still, then grade it against the actual reference—not your memory of it. Memory is unreliable. On one fly I thought the eyes looked too busy and asked for smaller lenses; the head returned as a disco ball because the reference actually had large ones.

### Step 5: Measure It, Don’t Eyeball It

Several builds graded themselves as “dense enough” yet still read as clean white diagrams. The checklist verifies features (eyes, mouth, silhouette) but not how much mechanism is actually visible. Now Claude measures density and proportions directly from the picture.

Examples:

- Hydra measured 0.57 of its reference density; one targeted round raised it to 0.80.

- Fly reached 0.96 once real gaps were introduced between plates.

- Piranha’s round 2 passed density but looked like a crocodile (jaws at 0.52 of body length vs. 0.37 in the reference). Round 3 measured four numbers off the picture (body height 0.55 of length, head 0.44, jaws 0.36, gape as tall as the jaw is long) and landed at 0.35.

### Step 6: Save Every Correction

Every mistake from the batch went back into the job description:

- Tarantula bristles read as quills → thickness now has a numeric range.

- A “keep the whole octopus in frame” rule pulled the camera too far back and curled the arms → now only the part being opened needs to stay in view.

- Moth read as a diagram → density is now measured, not subjectively graded.

- Piranha read as a crocodile → proportions are measured off the picture before the first line of code.

- Flying octopus and scorpion-squid had two competing limb sets → one main set per creature.

- Camera kept parking on the same side → every beat now gets its own side and aim point.

The file grows by one line per mistake. The next build starts with all of them already encoded.

### Step 7: Film It From One Approved Choreography

My first glass octopus film reused another animal’s choreography plus my own “keep everything in frame” rule. It came back distant, flat, and toy-like. The successful second version reused an earlier octopus film 1:1 with only the head swapped. The piranha borrowed an anglerfish film the same way (same deep body, same jaw that drops off its hinge).

The scarab had no close body precedent, so it borrowed only a camera and built the body from scratch. After four rounds and roughly 450k tokens it was still busy and cheap. Now any subject without a close body analog gets flagged before work begins.

### Step 8: Cut What’s Boring, Then Write the Short Version

The full film is one script file. When the hammerhead’s fin came off crooked and the beat felt dull, deleting one line shortened the film from 24 seconds to 21.2. Object, page, and sound all read the same script, so a new cut is just an edit plus one re-render.

For posting, a simple trim of the busiest moments looked cheap and jump-cut. The short version is now its own script: opening, one part, explode, exit. The tarantula’s 11.3-second scene plays at 1.13× to land exactly on 10 seconds. Each short also gets a unique opening and exit so consecutive videos don’t look the same (wasp dives in and climbs out the top; tarantula jumps in and jumps at the camera; octopus jets away).

Every video shown with the original post is one of these 10-second takes.

### Step 9: Render It

A screen recorder drops frames when the GPU is under load. A seeked, rendered film does not. Render at 4K and downscale to 1080p so thin veins and fine details stay sharp.

### Bonus: Don’t Run Four at Once

Each build gets its own fresh agent with the job description, reference, and checklist. A fresh agent is cheaper than one long chat that carries every previous context into every call. But parallelizing too hard is slower in practice. I ran the moth, hydra, fly, and octopus together and only reviewed after round 6. The moth alone burned ~430k tokens before I threw it out. A still costs roughly 400k tokens and a film another 150–400k, so late reviews are expensive. Two at a time, with a check after round 2, is the current working pace.

### The Whole Method, Free

The job description, checklist template, every prompt, and three finished animals (tarantula, piranha, and wasp) as buildable, take-apart-able code are available as a free Claude Code skill.



必要技能:  

https://github.com/Nyxera0x/cutaway

