/* Anubhuti — tarot deck, nakshatra traits, rudraksha and planet remedies. */
(function (G) {
  const D = (G.Disha = G.Disha || {});

  const MAJOR = [
    ['The Fool', 'New beginnings, spontaneity, a leap of faith', 'Recklessness, hesitation, naivety'],
    ['The Magician', 'Willpower, skill, turning ideas into reality', 'Manipulation, untapped talent, scattered energy'],
    ['The High Priestess', 'Intuition, inner knowing, quiet wisdom', 'Hidden motives, ignored intuition, withdrawal'],
    ['The Empress', 'Abundance, nurturing, creativity, fertility', 'Dependence, creative block, smothering'],
    ['The Emperor', 'Authority, structure, stability, protection', 'Rigidity, control, lack of discipline'],
    ['The Hierophant', 'Tradition, a guru or mentor, spiritual guidance', 'Rebellion, unconventional path, empty ritual'],
    ['The Lovers', 'Love, harmony, values-based choices', 'Imbalance, misalignment, indecision in love'],
    ['The Chariot', 'Determination, control, victory', 'Lack of direction, aggression, obstacles'],
    ['Strength', 'Courage, compassion, gentle inner strength', 'Self-doubt, low energy, insecurity'],
    ['The Hermit', 'Soul-searching, solitude, inner guidance', 'Isolation, loneliness, withdrawal'],
    ['Wheel of Fortune', 'Cycles, luck, a turning point, karma', 'Bad luck, resisting change, delays'],
    ['Justice', 'Fairness, truth, cause and effect, legal matters', 'Unfairness, dishonesty, avoiding accountability'],
    ['The Hanged Man', 'Pause, surrender, a new perspective', 'Stalling, resistance, needless sacrifice'],
    ['Death', 'Endings, transformation, making space for the new', 'Resisting change, stagnation, fear of endings'],
    ['Temperance', 'Balance, moderation, patience, healing', 'Excess, imbalance, impatience'],
    ['The Devil', 'Attachment, temptation, material bondage', 'Release, breaking free, new awareness'],
    ['The Tower', 'Sudden upheaval, revelation, awakening', 'Disaster averted, fear of change, delayed shake-up'],
    ['The Star', 'Hope, healing, renewal, faith', 'Despair, lost faith, disconnection'],
    ['The Moon', 'Illusion, intuition, dreams, the unknown', 'Confusion lifting, fears surfacing, misreading'],
    ['The Sun', 'Joy, success, vitality, clarity', 'Temporary sadness, delayed success, overconfidence'],
    ['Judgement', 'Awakening, inner calling, a fresh start', 'Self-doubt, ignoring the call, harsh self-judgement'],
    ['The World', 'Completion, fulfilment, travel, wholeness', 'Unfinished business, lack of closure, delays'],
  ];
  const MAJOR_YN = ['yes', 'yes', 'maybe', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'maybe', 'yes', 'maybe', 'maybe', 'maybe', 'yes', 'no', 'no', 'yes', 'maybe', 'yes', 'yes', 'yes'];
  const SUITS = {
    Wands: { el: 'Fire', theme: 'ambition, energy and action', color: '#e2582c', cards: [
      ['Inspiration, a new venture, raw potential', 'Delays, lack of motivation'], ['Planning, decisions, looking ahead', 'Fear of the unknown, poor planning'],
      ['Expansion, foresight, progress', 'Setbacks, obstacles to growth'], ['Celebration, home, harmony', 'Instability at home, cancelled plans'],
      ['Competition, conflict, rivalry', 'Avoiding conflict, inner tension'], ['Victory, recognition, success', 'Ego, a fall from grace'],
      ['Perseverance, standing your ground', 'Giving up, feeling overwhelmed'], ['Swift action, movement, news', 'Delays, frustration'],
      ['Resilience, persistence, a last stand', 'Exhaustion, paranoia'], ['Burden, responsibility, hard work', 'Release, delegating'],
      ['Enthusiasm, exploration, good news', 'Lack of direction, setbacks'], ['Energy, passion, adventure', 'Haste, impulsiveness'],
      ['Confidence, warmth, determination', 'Jealousy, insecurity'], ['Leadership, vision, enterprise', 'Impulsiveness, high expectations'] ] },
    Cups: { el: 'Water', theme: 'emotions, love and intuition', color: '#2f7ad8', cards: [
      ['New love, compassion, emotional fulfilment', 'Blocked emotions, emptiness'], ['Partnership, unity, attraction', 'Imbalance, a broken bond'],
      ['Friendship, celebration, community', 'Overindulgence, gossip'], ['Apathy, contemplation, missed chances', 'New awareness, acceptance'],
      ['Loss, regret, grief', 'Acceptance, moving on'], ['Nostalgia, innocence, happy memories', 'Living in the past, moving forward'],
      ['Choices, illusions, wishful thinking', 'Clarity, focus'], ['Walking away, seeking deeper meaning', 'Fear of change, staying stuck'],
      ['Contentment, wishes fulfilled', 'Dissatisfaction, materialism'], ['Family harmony, happiness, alignment', 'Broken home, misaligned values'],
      ['Creative opportunity, intuition, a loving message', 'Emotional immaturity, blocks'], ['Romance, charm, following the heart', 'Moodiness, unrealistic plans'],
      ['Compassion, calm, intuition', 'Emotional insecurity, codependence'], ['Emotional balance, diplomacy, generosity', 'Manipulation, moodiness'] ] },
    Swords: { el: 'Air', theme: 'thoughts, truth and conflict', color: '#6b6f8f', cards: [
      ['Clarity, breakthrough, truth', 'Confusion, miscommunication'], ['A difficult decision, stalemate', 'Indecision, information overload'],
      ['Heartbreak, sorrow, grief', 'Healing, forgiveness'], ['Rest, recovery, contemplation', 'Burnout, restlessness'],
      ['Conflict, defeat, winning at a cost', 'Reconciliation, past resentment'], ['Transition, moving on, calmer waters', 'Unresolved issues, resistance'],
      ['Deception, strategy, going it alone', 'Coming clean, conscience'], ['Restriction, feeling trapped', 'Release, a new perspective'],
      ['Anxiety, worry, sleepless nights', 'Hope, reaching out'], ['A painful ending, rock bottom', 'Recovery, regeneration'],
      ['Curiosity, new ideas, vigilance', 'Gossip, all talk'], ['Ambition, action, fast thinking', 'Rashness, burnout'],
      ['Clear boundaries, independence, honesty', 'Coldness, bitterness'], ['Intellect, authority, truth', 'Misuse of power, manipulation'] ] },
    Pentacles: { el: 'Earth', theme: 'money, work and the body', color: '#c99413', cards: [
      ['A new financial opportunity, prosperity', 'A missed chance, poor planning'], ['Balance, adaptability, juggling priorities', 'Overwhelm, disorganisation'],
      ['Teamwork, skill, collaboration', 'Poor teamwork, low quality'], ['Saving, security, control', 'Greed, possessiveness'],
      ['Hardship, insecurity, isolation', 'Recovery, help arrives'], ['Generosity, giving and receiving', 'Debt, strings attached'],
      ['Patience, long-term investment', 'Impatience, poor returns'], ['Diligence, mastery, craftsmanship', 'Perfectionism, lack of focus'],
      ['Independence, comfort, self-reliance', 'Overwork, financial setbacks'], ['Wealth, family legacy, lasting success', 'Financial loss, family disputes'],
      ['Ambition, study, a new opportunity', 'Procrastination, slow progress'], ['Hard work, routine, reliability', 'Boredom, stagnation'],
      ['Nurturing, practical, a good provider', 'Work-home imbalance'], ['Abundance, security, discipline', 'Greed, stubbornness'] ] },
  };
  const RANKS = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King'];
  const NO_MINOR = { Wands: [4, 9], Cups: [4, 7], Swords: [2, 4, 6, 7, 8, 9], Pentacles: [4] };
  const ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];
  const deck = [];
  MAJOR.forEach(([name, up, rev], i) => deck.push({ id: 'M' + i, name, arcana: 'Major', num: ROMAN[i], up, rev, yn: MAJOR_YN[i], color: '#6a2fb0' }));
  Object.entries(SUITS).forEach(([suit, s]) => s.cards.forEach(([up, rev], i) => deck.push({ id: suit[0] + i, name: RANKS[i] + ' of ' + suit, arcana: 'Minor', suit, el: s.el, num: i < 10 ? (i === 0 ? 'A' : String(i + 1)) : RANKS[i][0], up, rev, yn: (NO_MINOR[suit] || []).includes(i) ? 'no' : 'yes', color: s.color, theme: s.theme })));
  D.TAROT = {
    deck,
    spreads: {
      day: { label: 'Card of the Day', sub: '1 card · daily guidance', positions: ['Today’s energy'] },
      ppf: { label: 'Past · Present · Future', sub: '3 cards · classic spread', positions: ['Past', 'Present', 'Future'] },
      yn: { label: 'Yes / No', sub: '1 card · a direct answer', positions: ['The answer'] },
      celtic: { label: 'Celtic Cross', sub: '10 cards · deep reading', positions: ['Present situation', 'The challenge', 'Root / foundation', 'Recent past', 'Best possible outcome', 'Near future', 'Your attitude', 'People and environment', 'Hopes and fears', 'Likely outcome'] },
      rel: { label: 'Relationship', sub: '5 cards · you, them, the bond', positions: ['You', 'The other person', 'The connection', 'The challenge', 'Where it is heading'] },
      career: { label: 'Career & money', sub: '4 cards · work path', positions: ['Where you stand', 'What helps', 'What blocks', 'Advice'] },
    },
  };

  /* Nakshatra traits: symbol, nature, qualities, good for */
  D.NAK_TRAITS = [
    ['Horse’s head', 'Swift (Kshipra)', 'Quick, healing, pioneering, youthful', 'Starting treatment, travel, quick tasks'],
    ['Yoni', 'Fierce (Ugra)', 'Intense, responsible, creative, bearing burdens', 'Bold actions, endings, disciplined work'],
    ['Razor / flame', 'Mixed (Mishra)', 'Sharp, purifying, determined, protective', 'Fire rituals, cooking, cutting away the old'],
    ['Chariot', 'Fixed (Dhruva)', 'Charming, fertile, artistic, steady', 'Marriage, property, farming, foundations'],
    ['Deer’s head', 'Soft (Mridu)', 'Curious, gentle, searching, sociable', 'Learning, travel, research, the arts'],
    ['Teardrop', 'Sharp (Tikshna)', 'Stormy, transformative, intellectual', 'Demolition, research, intense effort'],
    ['Quiver of arrows', 'Movable (Chara)', 'Renewal, optimism, return home', 'Starting again, travel, buying vehicles'],
    ['Cow’s udder / flower', 'Swift (Kshipra)', 'Nourishing, protective, devoted', 'Almost all auspicious work (except marriage)'],
    ['Coiled serpent', 'Sharp (Tikshna)', 'Perceptive, mystical, strategic', 'Strategy, occult study, confronting problems'],
    ['Royal throne', 'Fierce (Ugra)', 'Regal, proud of lineage, generous', 'Honouring ancestors, ceremonies, authority'],
    ['Front legs of a bed', 'Fierce (Ugra)', 'Pleasure-loving, romantic, creative', 'Celebrations, rest, the arts'],
    ['Back legs of a bed', 'Fixed (Dhruva)', 'Generous, dependable, honours agreements', 'Marriage, contracts, long-term commitments'],
    ['Hand', 'Swift (Kshipra)', 'Skilful, witty, resourceful', 'Crafts, trade, healing, quick tasks'],
    ['Bright jewel', 'Soft (Mridu)', 'Artistic, brilliant, design-minded', 'Architecture, design, jewellery, decoration'],
    ['Young shoot in the wind', 'Movable (Chara)', 'Independent, adaptable, business-minded', 'Trade, travel, learning'],
    ['Triumphal arch', 'Mixed (Mishra)', 'Goal-driven, ambitious, focused', 'Setting goals, competition, celebrations'],
    ['Lotus', 'Soft (Mridu)', 'Devoted, friendly, disciplined', 'Friendships, group work, travel, marriage'],
    ['Earring / umbrella', 'Sharp (Tikshna)', 'Protective, senior, resourceful', 'Leadership, protection, bold tasks'],
    ['Bundle of roots', 'Sharp (Tikshna)', 'Investigative, uprooting, philosophical', 'Research, removing obstacles, herbal medicine'],
    ['Winnowing fan', 'Fierce (Ugra)', 'Invincible, persuasive, purifying', 'Debates, water activities, confrontation'],
    ['Elephant tusk', 'Fixed (Dhruva)', 'Principled, patient, lasting victory', 'New projects of lasting value, foundations'],
    ['Ear', 'Movable (Chara)', 'Listening, learning, well connected', 'Study, counselling, ceremonies, travel'],
    ['Drum', 'Movable (Chara)', 'Prosperous, musical, rhythmic', 'Music, buying jewellery, group events'],
    ['Empty circle', 'Movable (Chara)', 'Healing, private, scientific', 'Medical treatment, research, technology'],
    ['Front of a funeral cot', 'Fierce (Ugra)', 'Intense, idealistic, transformative', 'Spiritual practice, bold reforms'],
    ['Back of a funeral cot', 'Fixed (Dhruva)', 'Wise, calm, stable, charitable', 'Long-term plans, charity, foundations'],
    ['Fish / drum', 'Soft (Mridu)', 'Nurturing, compassionate, completing', 'Travel, finishing work, caring for others'],
  ];

  D.RUDRAKSHA = [
    [1, 'Sun', 'Shiva', 'Focus, leadership and spiritual awakening'], [2, 'Moon', 'Ardhanarishvara', 'Harmony in relationships, emotional balance'],
    [3, 'Mars', 'Agni', 'Confidence, energy, freedom from past guilt'], [4, 'Mercury', 'Brahma', 'Learning, memory and communication'],
    [5, 'Jupiter', 'Kalagni Rudra', 'Peace, health and general well-being'], [6, 'Venus', 'Kartikeya', 'Love, charm and willpower'],
    [7, 'Saturn', 'Mahalakshmi', 'Wealth and overcoming delays'], [8, 'Rahu', 'Ganesha', 'Removing obstacles, success in new ventures'],
    [9, 'Ketu', 'Durga', 'Courage, protection and spiritual strength'], [10, 'All grahas', 'Vishnu', 'Protection from negativity, balance'],
    [11, '—', 'Hanuman (Ekadasha Rudra)', 'Courage, adventure and decision-making'], [12, 'Sun', 'Surya', 'Radiance, vitality and administrative ability'],
    [13, 'Venus', 'Kamadeva / Indra', 'Attraction and fulfilment of desires'], [14, 'Saturn', 'Hanuman / Shiva', 'Intuition and protection from Shani’s hardships'],
  ];
  D.REMEDY = {
    Sun: { beej: 'Om Hraam Hreem Hraum Sah Suryaya Namah', count: 7000, daan: 'Wheat, jaggery, copper', rud: 1 },
    Moon: { beej: 'Om Shraam Shreem Shraum Sah Chandraya Namah', count: 11000, daan: 'Rice, milk, white cloth', rud: 2 },
    Mars: { beej: 'Om Kraam Kreem Kraum Sah Bhaumaya Namah', count: 10000, daan: 'Red lentils (masoor), jaggery', rud: 3 },
    Mercury: { beej: 'Om Braam Breem Braum Sah Budhaya Namah', count: 9000, daan: 'Green moong, green cloth', rud: 4 },
    Jupiter: { beej: 'Om Graam Greem Graum Sah Gurave Namah', count: 19000, daan: 'Chana dal, turmeric, yellow cloth', rud: 5 },
    Venus: { beej: 'Om Draam Dreem Draum Sah Shukraya Namah', count: 16000, daan: 'Rice, sugar, curd, white cloth', rud: 6 },
    Saturn: { beej: 'Om Praam Preem Praum Sah Shanaye Namah', count: 23000, daan: 'Black sesame, mustard oil, iron', rud: 7 },
    Rahu: { beej: 'Om Bhraam Bhreem Bhraum Sah Rahave Namah', count: 18000, daan: 'Black urad, a blanket', rud: 8 },
    Ketu: { beej: 'Om Sraam Sreem Sraum Sah Ketave Namah', count: 17000, daan: 'A blanket, sesame, feeding dogs', rud: 9 },
  };
})(typeof window !== 'undefined' ? window : globalThis);
