import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting community seed...");

  // Seed Community Posts - natural, casual discussions
  const communityPosts = [
    // Show & Tell
    {
      title: "finally got my pitch deck done after procrastinating for 2 weeks",
      content: `ok so i've been putting off this investor pitch forever and finally sat down to do it last night. used the dark theme (forgot the name, the one with the gradient) and honestly it came out way better than expected.

the AI suggested some layouts i never would have thought of. like instead of just bullet points for our traction slide, it made these little boxes with icons? looks way more legit now.

anyone else find themselves procrastinating on presentations until the last minute? just me? 😅`,
      category: "show-tell",
      authorName: "jake_m",
      likes: 89,
      views: 1240,
      isPinned: false,
      isApproved: true,
    },
    {
      title: "made a presentation for my kid's science fair lol",
      content: `my daughter needed help with her volcano project presentation and i figured why not try this out. she's 10 so we went with something colorful.

she was SO excited when she saw the slides. kept saying "dad this looks like a real scientist made it" which honestly made my day.

the teacher actually asked her what software she used haha. proud dad moment right there.

anyone else using this for non-work stuff?`,
      category: "show-tell",
      authorName: "DadOfThree",
      likes: 234,
      views: 2890,
      isPinned: true,
      isApproved: true,
    },
    {
      title: "quarterly review went surprisingly well",
      content: `just wanted to share a small win. my quarterly business review usually takes me like 4 hours to put together and i always dread it.

this time i just dumped my notes in and let it generate something. spent maybe 45 mins total tweaking things. my manager actually complimented the design which has literally never happened before.

nothing groundbreaking but felt good to not stress about it for once`,
      category: "show-tell",
      authorName: "sarah_k",
      likes: 156,
      views: 1890,
      isPinned: false,
      isApproved: true,
    },
    {
      title: "used the hacker theme for a dev meetup talk",
      content: `gave a talk at our local JS meetup about async patterns. used that terminal/hacker looking theme and people were asking about it during the break.

the green on black aesthetic just hits different for tech talks you know? felt very on brand.

only complaint is i wish i could customize the font more but whatever, still looked cool`,
      category: "show-tell",
      authorName: "codeMonkey42",
      likes: 178,
      views: 2340,
      isPinned: false,
      isApproved: true,
    },

    // Tips & Tricks
    {
      title: "tip: you can edit multiple slides at once with the chat thing",
      content: `not sure if everyone knows this but if you open that side panel and type something like "make all the bullet points shorter" it actually does it across your whole deck

saved me so much time when my boss said everything was "too wordy" (his favorite feedback lol)

also works for stuff like "add more visuals" or "make it more casual"`,
      category: "tips",
      authorName: "productivity_nerd",
      likes: 312,
      views: 4560,
      isPinned: true,
      isApproved: true,
    },
    {
      title: "keyboard shortcuts i found by accident",
      content: `been using this for a few weeks and just discovered some shortcuts:

- arrow keys move between slides (obvious but i was clicking like a dummy)
- escape saves your text edits (was losing changes before i figured this out)
- double click to edit text

probably obvious to most people but sharing in case anyone else was struggling like me`,
      category: "tips",
      authorName: "newbie_here",
      likes: 145,
      views: 1890,
      isPinned: false,
      isApproved: true,
    },
    {
      title: "for anyone doing data heavy presentations",
      content: `figured out that if you describe your data in plain english it generates better charts than if you try to be super specific

like instead of "create a bar chart with Q1 at 45%, Q2 at 52%..." just say "show quarterly growth trending upward" and then edit the numbers after

the AI seems to pick better chart types this way too`,
      category: "tips",
      authorName: "DataDan",
      likes: 198,
      views: 2670,
      isPinned: false,
      isApproved: true,
    },
    {
      title: "export tip for anyone presenting on old projectors",
      content: `learned this the hard way - if you're presenting somewhere with an old projector, export to PDF instead of using the web version

the colors render more consistently and you don't have to worry about wifi issues

also test your slides on a white wall if you can, some of the darker themes don't show up great on cheap projectors`,
      category: "tips",
      authorName: "conference_veteran",
      likes: 87,
      views: 1230,
      isPinned: false,
      isApproved: true,
    },

    // General Discussion
    {
      title: "what theme do you use for client presentations?",
      content: `curious what everyone uses for client-facing stuff. i've been defaulting to the corporate one but it feels a bit boring?

my clients are mostly in finance so i don't want anything too wild but also don't want to put them to sleep

what's your go-to?`,
      category: "discussion",
      authorName: "freelancer_life",
      likes: 67,
      views: 1450,
      isPinned: false,
      isApproved: true,
    },
    {
      title: "how long do your presentations usually take to make?",
      content: `trying to figure out if i'm slow or what. a typical 15 slide deck takes me about an hour including writing the content and tweaking the design.

is that normal? faster? slower?

before i was spending like 3-4 hours in powerpoint so this is already way better but curious what others experience`,
      category: "discussion",
      authorName: "time_tracker",
      likes: 134,
      views: 2340,
      isPinned: false,
      isApproved: true,
    },
    {
      title: "anyone else get anxious before presenting?",
      content: `this might be off topic but figured this community might relate. i get super nervous before any presentation even when my slides look good.

having nice looking slides helps a bit because at least i'm not embarrassed by the design but the nerves are still there.

any tips for the actual presenting part? how do you calm down before going on?`,
      category: "discussion",
      authorName: "anxious_presenter",
      likes: 289,
      views: 3450,
      isPinned: true,
      isApproved: true,
    },
    {
      title: "do you show your slides to anyone before presenting?",
      content: `wondering if people do practice runs or get feedback before important presentations

i usually just wing it but thinking maybe i should be more careful for bigger stuff

do you have a review process or just trust yourself?`,
      category: "discussion",
      authorName: "solo_worker",
      likes: 78,
      views: 1120,
      isPinned: false,
      isApproved: true,
    },
    {
      title: "presentations for remote meetings vs in person",
      content: `noticed my slides need to be different for zoom calls vs presenting in a room

for zoom i make text bigger and use more contrast since people are on small screens

anyone else adjust their approach based on how they're presenting?`,
      category: "discussion",
      authorName: "remote_worker",
      likes: 156,
      views: 1890,
      isPinned: false,
      isApproved: true,
    },

    // Feature Requests
    {
      title: "would love real-time collaboration",
      content: `working on a deck with my coworker and we have to take turns which is annoying. would be cool if we could both edit at the same time like google docs

not sure how hard that is to build but putting it out there`,
      category: "feature-request",
      authorName: "team_player",
      likes: 345,
      views: 4230,
      isPinned: true,
      isApproved: true,
    },
    {
      title: "more chart options please",
      content: `the basic charts are fine but i really need waterfall charts for financial presentations. also gantt charts would be amazing for project updates.

anyone else need more chart variety?`,
      category: "feature-request",
      authorName: "finance_guy",
      likes: 234,
      views: 2890,
      isPinned: false,
      isApproved: true,
    },
    {
      title: "presenter mode with timer?",
      content: `would be super helpful to have a timer visible while presenting. i always go over my allotted time and having a countdown would help me pace myself.

also seeing my notes without the audience seeing them would be clutch`,
      category: "feature-request",
      authorName: "over_talker",
      likes: 189,
      views: 2340,
      isPinned: false,
      isApproved: true,
    },
    {
      title: "custom fonts would be nice",
      content: `my company has a brand font we're supposed to use for everything. would be great if i could upload it or at least have more font options.

not a dealbreaker but would make my brand team happy`,
      category: "feature-request",
      authorName: "brand_police",
      likes: 123,
      views: 1560,
      isPinned: false,
      isApproved: true,
    },

    // More casual posts
    {
      title: "just venting: my boss keeps changing requirements",
      content: `made a deck, boss said make it shorter. made it shorter, now it's "missing context". added context, now it's "too long" again.

at least i can iterate quickly now but man... anyone else deal with this?`,
      category: "discussion",
      authorName: "frustrated_employee",
      likes: 456,
      views: 5670,
      isPinned: false,
      isApproved: true,
    },
    {
      title: "wedding speech presentation was a hit",
      content: `best man at my buddy's wedding last weekend. made a slideshow of embarrassing photos with captions. everyone loved it, bride was crying laughing.

never thought i'd use a presentation tool for something like this but here we are`,
      category: "show-tell",
      authorName: "best_man_dan",
      likes: 567,
      views: 6780,
      isPinned: false,
      isApproved: true,
    },
    {
      title: "teacher here - students actually paying attention now",
      content: `high school history teacher. my old powerpoints were basically walls of text and the kids would zone out immediately.

started using this and the visual variety keeps them more engaged. or at least they're better at pretending to pay attention lol

any other teachers here?`,
      category: "show-tell",
      authorName: "history_teacher",
      likes: 234,
      views: 3120,
      isPinned: false,
      isApproved: true,
    },
    {
      title: "how do you handle last minute changes?",
      content: `got asked to add 3 slides 20 minutes before a meeting today. used to be a nightmare but the AI thing actually made it manageable.

still stressful but at least the new slides matched the existing ones

what's your worst last minute change story?`,
      category: "discussion",
      authorName: "always_rushed",
      likes: 178,
      views: 2340,
      isPinned: false,
      isApproved: true,
    },

    // 22 MORE POSTS

    // Show & Tell
    {
      title: "nonprofit board presentation - they actually approved our budget",
      content: `volunteer for a local animal shelter and had to present our annual budget to the board. usually these meetings are painful and they nitpick everything.

this time the slides looked so professional they barely questioned anything. one board member said "you really stepped up the presentation quality"

little do they know i spent like 30 mins on it lol`,
      category: "show-tell",
      authorName: "shelter_volunteer",
      likes: 145,
      views: 1890,
      isPinned: false,
      isApproved: true,
    },
    {
      title: "my thesis defense slides are done!!",
      content: `PhD student here. just finished my dissertation defense slides after months of procrastinating. 47 slides covering 5 years of research.

the hardest part was making complex data visualizations look clean. ended up describing what i wanted and the AI figured out decent layouts.

defense is next week. wish me luck 🤞`,
      category: "show-tell",
      authorName: "phd_survivor",
      likes: 312,
      views: 4120,
      isPinned: false,
      isApproved: true,
    },
    {
      title: "sales deck that actually closed a deal",
      content: `been in sales for 8 years and honestly never cared much about slide design. figured the pitch mattered more than how it looked.

tried making a nicer deck for a big prospect and... we closed. obviously can't say it was just the slides but the client specifically mentioned our "polished presentation"

maybe design does matter after all`,
      category: "show-tell",
      authorName: "sales_convert",
      likes: 234,
      views: 3450,
      isPinned: false,
      isApproved: true,
    },
    {
      title: "made slides for my grandma's 80th birthday party",
      content: `put together a photo slideshow for my grandma's birthday. old family photos, memories, that kind of thing.

she doesn't understand technology at all but kept saying how "fancy" it looked. my mom cried. worth every minute.

sometimes it's not about work presentations you know?`,
      category: "show-tell",
      authorName: "family_first",
      likes: 456,
      views: 5670,
      isPinned: false,
      isApproved: true,
    },
    {
      title: "startup demo day went better than expected",
      content: `just did our accelerator demo day. 3 minutes to pitch to a room of investors.

practiced like crazy but the slides really helped tell the story. got 4 follow-up meeting requests which is apparently good for our batch.

the visual flow from problem → solution → traction → ask felt natural. investors could follow along without getting lost`,
      category: "show-tell",
      authorName: "founder_grind",
      likes: 289,
      views: 3890,
      isPinned: false,
      isApproved: true,
    },

    // Tips & Tricks
    {
      title: "the 3 second rule for slides",
      content: `something i learned from a speaking coach: if someone can't understand your slide in 3 seconds, it's too complicated.

been applying this to everything i make now. one main point per slide, minimal text, clear visual.

the AI actually helps with this because it doesn't let you cram too much onto one slide`,
      category: "tips",
      authorName: "speaking_coach_fan",
      likes: 267,
      views: 3560,
      isPinned: false,
      isApproved: true,
    },
    {
      title: "how i organize my presentation workflow",
      content: `my process that works pretty well:

1. brain dump all my points in a doc first
2. group them into logical sections
3. paste into the generator
4. review and tweak
5. practice once out loud

step 5 is where i catch most issues. things that look good on screen sometimes sound weird when you say them`,
      category: "tips",
      authorName: "process_person",
      likes: 189,
      views: 2340,
      isPinned: false,
      isApproved: true,
    },
    {
      title: "dark mode themes work better for evening presentations",
      content: `random observation: when presenting after 5pm or in dimly lit rooms, the darker themes are way easier on everyone's eyes.

bright white backgrounds at 7pm in a conference room = everyone squinting

switched to using darker themes for any late day meetings and people seem more engaged`,
      category: "tips",
      authorName: "night_owl_presenter",
      likes: 134,
      views: 1780,
      isPinned: false,
      isApproved: true,
    },
    {
      title: "backup your presentations people",
      content: `learned this the hard way. was about to present and my laptop decided to update. couldn't access anything for 20 minutes.

now i always:
- export a PDF backup
- email it to myself
- have it on my phone just in case

paranoid? maybe. but never getting caught like that again`,
      category: "tips",
      authorName: "backup_believer",
      likes: 345,
      views: 4230,
      isPinned: false,
      isApproved: true,
    },
    {
      title: "use the image search for placeholder images then replace later",
      content: `quick tip: when drafting, just use the built-in image search to get something close to what you want. don't spend forever finding the perfect image.

once the structure is done, then go back and swap in better images if needed.

perfectionism early on kills productivity`,
      category: "tips",
      authorName: "efficiency_expert",
      likes: 156,
      views: 2120,
      isPinned: false,
      isApproved: true,
    },

    // General Discussion
    {
      title: "how many slides is too many?",
      content: `got feedback that my 25 slide deck was "too long" but i felt like i needed all of them to tell the story.

is there a rule of thumb? i've heard 1 slide per minute of talking but that seems arbitrary.

what do you all aim for?`,
      category: "discussion",
      authorName: "slide_counter",
      likes: 123,
      views: 1890,
      isPinned: false,
      isApproved: true,
    },
    {
      title: "do you memorize your presentations or use notes?",
      content: `always wondered how other people handle this. i used to try memorizing everything but would freeze if i forgot a line.

now i use bullet point notes and just talk naturally. feels less polished but more authentic?

what's your approach?`,
      category: "discussion",
      authorName: "memory_struggles",
      likes: 198,
      views: 2670,
      isPinned: false,
      isApproved: true,
    },
    {
      title: "presenting to executives vs regular teams",
      content: `noticed i need completely different approaches for C-suite vs my regular team meetings.

executives want: bottom line first, minimal detail, clear asks
teams want: context, process, discussion

anyone else adjust their style based on audience level?`,
      category: "discussion",
      authorName: "corporate_chameleon",
      likes: 234,
      views: 3120,
      isPinned: false,
      isApproved: true,
    },
    {
      title: "what do you do when someone interrupts your presentation?",
      content: `had a meeting yesterday where someone kept asking questions mid-slide. totally threw off my flow.

do you:
a) answer immediately and risk going off track
b) say "let's hold questions till the end"
c) something else?

still figuring out how to handle this gracefully`,
      category: "discussion",
      authorName: "interrupted_presenter",
      likes: 167,
      views: 2340,
      isPinned: false,
      isApproved: true,
    },
    {
      title: "imposter syndrome when presenting",
      content: `does anyone else feel like a fraud when presenting? like everyone in the room knows more than you and they're just waiting for you to mess up?

logically i know this isn't true but the feeling is real. especially with senior people in the room.

how do you deal with this?`,
      category: "discussion",
      authorName: "imposter_feelings",
      likes: 389,
      views: 4890,
      isPinned: true,
      isApproved: true,
    },

    // Feature Requests
    {
      title: "version history would be amazing",
      content: `made a bunch of changes to a deck and then realized the original was better. had to start over.

would love to be able to see previous versions and restore them. like how google docs does it.

anyone else want this?`,
      category: "feature-request",
      authorName: "version_wanter",
      likes: 278,
      views: 3450,
      isPinned: false,
      isApproved: true,
    },
    {
      title: "mobile app for quick edits?",
      content: `sometimes i need to fix a typo or small thing when i'm not at my computer. would be nice to have a mobile app for quick edits.

doesn't need full functionality, just basic text editing and maybe reordering slides`,
      category: "feature-request",
      authorName: "mobile_user",
      likes: 198,
      views: 2670,
      isPinned: false,
      isApproved: true,
    },
    {
      title: "templates for specific industries",
      content: `would be cool to have starting templates for different industries. like a "healthcare presentation" or "real estate pitch" template.

not just themes but actual slide structures that make sense for those use cases.

would save a lot of time figuring out what slides to include`,
      category: "feature-request",
      authorName: "template_wisher",
      likes: 156,
      views: 2120,
      isPinned: false,
      isApproved: true,
    },

    // More casual/relatable posts
    {
      title: "accidentally shared the wrong version to a client",
      content: `sent a client the draft version with all my notes like "ADD BETTER STATS HERE" and "FIX THIS UGLY SLIDE"

they were... confused. had to quickly send the real version and pretend it was a "technical glitch"

please tell me i'm not the only one who's done something like this`,
      category: "discussion",
      authorName: "embarrassed_sender",
      likes: 567,
      views: 7890,
      isPinned: false,
      isApproved: true,
    },
    {
      title: "the wifi always dies right before presenting",
      content: `is it just me or does wifi have a sixth sense for when you're about to present? works fine all day then the moment you share your screen... nothing.

now i always download/export before important meetings. trust no wifi.`,
      category: "discussion",
      authorName: "wifi_victim",
      likes: 423,
      views: 5670,
      isPinned: false,
      isApproved: true,
    },
    {
      title: "coworker keeps using comic sans in presentations",
      content: `not sure if this is the right place to vent but my coworker insists on using comic sans for "personality"

i've tried suggesting other fonts but they're committed. our team presentations look... interesting.

how do you handle design disagreements with colleagues?`,
      category: "discussion",
      authorName: "font_snob",
      likes: 345,
      views: 4560,
      isPinned: false,
      isApproved: true,
    },
    {
      title: "finally understand why design matters",
      content: `used to think spending time on presentation design was a waste. content is king right?

but after seeing the difference in how people respond to well-designed vs ugly slides... i get it now.

people literally pay more attention when things look good. who knew.`,
      category: "discussion",
      authorName: "design_convert",
      likes: 234,
      views: 3120,
      isPinned: false,
      isApproved: true,
    },
  ];

  // Create posts
  const createdPosts: { id: string; title: string }[] = [];

  for (const post of communityPosts) {
    const createdPost = await prisma.communityPost.create({
      data: {
        ...post,
        createdAt: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ),
      },
    });
    createdPosts.push({ id: createdPost.id, title: createdPost.title });
  }

  console.log(`Created ${createdPosts.length} community posts`);

  // Natural, casual comments
  const commentTemplates = [
    { content: "same here, thought i was the only one", authorName: "lurker99" },
    { content: "this helped a lot thanks", authorName: "grateful_user" },
    { content: "lol relatable", authorName: "been_there" },
    { content: "saving this for later", authorName: "bookmark_queen" },
    {
      content: "tried this and it actually works",
      authorName: "skeptic_converted",
    },
    { content: "wish i knew this earlier", authorName: "late_learner" },
    { content: "great tip!", authorName: "simple_simon" },
    {
      content: "my experience exactly",
      authorName: "kindred_spirit",
    },
    {
      content: "following this thread",
      authorName: "curious_cat",
    },
    {
      content: "can confirm this works",
      authorName: "verified_user",
    },
    {
      content: "needed to hear this today",
      authorName: "rough_day",
    },
    { content: "underrated tip right here", authorName: "tip_collector" },
    { content: "this community is so helpful", authorName: "newbie_2024" },
    { content: "adding my +1 for this feature", authorName: "feature_voter" },
    { content: "yes please!", authorName: "enthusiastic_one" },
    {
      content: "been asking for this forever",
      authorName: "patient_waiter",
    },
    { content: "would use this daily", authorName: "power_user" },
    { content: "take my upvote", authorName: "upvote_giver" },
    {
      content: "this is the way",
      authorName: "mando_fan",
    },
    { content: "facts", authorName: "truth_teller" },
    {
      content: "i do the same thing lol",
      authorName: "twin_behavior",
    },
    {
      content: "wait this is genius",
      authorName: "mind_blown",
    },
    {
      content: "why didnt i think of this",
      authorName: "facepalm_moment",
    },
    { content: "sharing with my team", authorName: "team_sharer" },
    {
      content: "this should be pinned",
      authorName: "pin_suggester",
    },
    {
      content: "came here to say this",
      authorName: "great_minds",
    },
    { content: "100%", authorName: "agreeable_andy" },
    {
      content: "finally someone said it",
      authorName: "relieved_reader",
    },
    {
      content: "bookmarked",
      authorName: "organized_olivia",
    },
    { content: "thanks for sharing!", authorName: "polite_pete" },
  ];

  // Add 2-4 comments to each post
  let totalComments = 0;
  for (const post of createdPosts) {
    const numComments = Math.floor(Math.random() * 3) + 2;
    const shuffledComments = [...commentTemplates].sort(
      () => Math.random() - 0.5
    );

    for (let i = 0; i < numComments; i++) {
      const comment = shuffledComments[i];
      if (comment) {
        await prisma.communityComment.create({
          data: {
            postId: post.id,
            content: comment.content,
            authorName: comment.authorName,
            likes: Math.floor(Math.random() * 30),
            isApproved: true,
            createdAt: new Date(
              Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000
            ),
          },
        });
        totalComments++;
      }
    }
  }

  console.log(`Created ${totalComments} community comments`);
  console.log("Community seed completed!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
