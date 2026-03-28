---
name: blog-writing
description: Use when writing or editing blog articles for DataToRAG. Ensures content reads as genuinely human-written by avoiding AI patterns and enforcing natural voice, specific detail, and clear opinion.
---

# Blog Writing — Human Voice Guide

Write like a specific person explaining something they know well to a smart colleague. Not like a language model producing content.

## Banned Words and Phrases

Search-and-destroy these in every draft. They are statistically the strongest AI signals.

**Verbs:** delve, leverage, utilize, harness, streamline, facilitate, bolster, foster, elucidate, navigate (metaphorical), embark, unleash, unlock, elevate, optimize, empower, showcase, reimagine

**Adjectives/Nouns:** pivotal, robust, seamless, cutting-edge, innovative, transformative, comprehensive, unprecedented, nuanced, dynamic, landscape, realm, tapestry, journey, beacon, synergy, testament, underpinnings, intersection, facet, roadmap, toolkit, game-changer, revolutionize

**Hedging:** "It's important to note that", "It's worth considering", "Generally speaking", "From a broader perspective", "This can potentially"

**Openers:** "In today's fast-paced world", "In the world of", "In today's digital age", "In an era of"

**Transitions (in sequence):** Furthermore, Moreover, Additionally, Consequently, Nevertheless, Notably, Indeed

**Closers:** "In conclusion", "By embracing", "Overall", "In summary", "As we look to the future"

**Stock phrases (100x+ more frequent in AI than human text):** "provide valuable insights", "gain valuable insights", "plays a crucial role in shaping", "a rich tapestry", "opens new avenues", "adds a layer of complexity", "paving the way", "shed light on", "left an indelible mark"

## Structural Rules

**Vary paragraph length.** Some paragraphs should be one sentence. Others can be six. Never let three consecutive paragraphs be the same length.

**Vary sentence length.** Follow a 25-word sentence with a 6-word one. Then maybe a fragment. AI writes in a narrow 15-20 word band. Humans don't.

**Don't start every paragraph with a topic sentence.** Start with an example, a number, a question, an aside. Let the point emerge.

**Kill formulaic transitions.** Instead of "Furthermore" or "Moreover", just start the next point. Or bridge concretely: "That problem gets worse when you look at pricing."

**No mechanical parallelism.** If you have three points, don't format them identically. Let some be longer, some shorter, some have examples, some not.

**Vary your lists.** Don't make every section a bullet list. Use inline enumeration, narrative flow, or just prose.

## Voice Rules

**Have an opinion.** Say "I think X" or "X is wrong" or "Most people get this backwards." AI hedges. Humans commit. If you're writing about a product you built, you believe in it — that should come through.

**Use first person.** "We built this because..." or "I've watched teams waste hours on..." One sentence of real experience beats three of generic claims.

**Use contractions.** "You'll" not "you will." "Don't" not "do not." "It's" not "it is." This single change shifts register from robotic to human.

**Write things you'd actually say.** Read every sentence aloud. If nobody would say it in conversation, rewrite it. "One might argue that the paradigm is shifting" — nobody says this.

**Allow imperfection.** A casual aside. A parenthetical. A sentence fragment for emphasis. These signal a human mind. Perfect polish is itself a tell.

**Be specific, not abstract.** Replace "significant improvements" with "23% faster." Replace "many companies" with "Stripe, Linear, and Vercel." Replace "studies show" with "a 2024 Stanford study found."

## Tone for DataToRAG

The audience is technical decision-makers at mid-size companies — VPs of Engineering, Heads of Ops, senior ICs. They're smart, busy, and skeptical of marketing fluff.

**Do:** Write with earned confidence. Reference specific tools, numbers, real scenarios. Acknowledge tradeoffs honestly. Use technical terms where appropriate but explain them if they're niche.

**Don't:** Write like a press release. Don't use superlatives without evidence. Don't be breathlessly enthusiastic about your own product. Don't hedge every claim into meaninglessness.

**The bar:** Would this get upvoted on Hacker News, or would the top comment be "this reads like AI slop"?

## Pre-Publish Checklist

1. Ctrl+F for every word in the banned list
2. Check paragraph lengths — are three in a row the same size?
3. Check sentence lengths — is there real variation?
4. Count em dashes — if more than 3-4 per article, cut some
5. Find one place you stated an opinion and one place you used a specific number or name
6. Read the first and last paragraphs — do they sound like a person or a press release?
7. Read the whole thing aloud — mark anything you'd never say in conversation
