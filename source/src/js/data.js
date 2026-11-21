/* Anubhuti — reference data. Traditional associations; schools differ. */
(function (G) {
  const D = (G.Disha = G.Disha || {});

  D.SIGNS = [
    { en: 'Aries', sa: 'Mesha', lord: 'Mars', el: 'Fire' },
    { en: 'Taurus', sa: 'Vrishabha', lord: 'Venus', el: 'Earth' },
    { en: 'Gemini', sa: 'Mithuna', lord: 'Mercury', el: 'Air' },
    { en: 'Cancer', sa: 'Karka', lord: 'Moon', el: 'Water' },
    { en: 'Leo', sa: 'Simha', lord: 'Sun', el: 'Fire' },
    { en: 'Virgo', sa: 'Kanya', lord: 'Mercury', el: 'Earth' },
    { en: 'Libra', sa: 'Tula', lord: 'Venus', el: 'Air' },
    { en: 'Scorpio', sa: 'Vrishchika', lord: 'Mars', el: 'Water' },
    { en: 'Sagittarius', sa: 'Dhanu', lord: 'Jupiter', el: 'Fire' },
    { en: 'Capricorn', sa: 'Makara', lord: 'Saturn', el: 'Earth' },
    { en: 'Aquarius', sa: 'Kumbha', lord: 'Saturn', el: 'Air' },
    { en: 'Pisces', sa: 'Meena', lord: 'Jupiter', el: 'Water' },
  ];

  D.NAKSHATRAS = [
    ['Ashwini', 'Ketu', 'Ashwini Kumaras'], ['Bharani', 'Venus', 'Yama'], ['Krittika', 'Sun', 'Agni'],
    ['Rohini', 'Moon', 'Brahma'], ['Mrigashira', 'Mars', 'Soma'], ['Ardra', 'Rahu', 'Rudra'],
    ['Punarvasu', 'Jupiter', 'Aditi'], ['Pushya', 'Saturn', 'Brihaspati'], ['Ashlesha', 'Mercury', 'Nagas'],
    ['Magha', 'Ketu', 'Pitris'], ['Purva Phalguni', 'Venus', 'Bhaga'], ['Uttara Phalguni', 'Sun', 'Aryaman'],
    ['Hasta', 'Moon', 'Savitar'], ['Chitra', 'Mars', 'Vishvakarma'], ['Swati', 'Rahu', 'Vayu'],
    ['Vishakha', 'Jupiter', 'Indra-Agni'], ['Anuradha', 'Saturn', 'Mitra'], ['Jyeshtha', 'Mercury', 'Indra'],
    ['Mula', 'Ketu', 'Nirriti'], ['Purva Ashadha', 'Venus', 'Apas'], ['Uttara Ashadha', 'Sun', 'Vishvedevas'],
    ['Shravana', 'Moon', 'Vishnu'], ['Dhanishta', 'Mars', 'Vasus'], ['Shatabhisha', 'Rahu', 'Varuna'],
    ['Purva Bhadrapada', 'Jupiter', 'Aja Ekapada'], ['Uttara Bhadrapada', 'Saturn', 'Ahir Budhnya'], ['Revati', 'Mercury', 'Pushan'],
  ].map(([name, lord, deity]) => ({ name, lord, deity }));

  D.PLANETS = {
    Sun: { sa: 'Surya', abbr: 'Su', day: 'Sunday', gem: 'Ruby (Manik)', metal: 'Copper', color: 'Red, saffron', mantra: 'Om Suryaya Namah', deity: 'Surya', number: 1, exalt: 0, own: [4], friends: ['Moon', 'Mars', 'Jupiter'], enemies: ['Venus', 'Saturn'] },
    Moon: { sa: 'Chandra', abbr: 'Mo', day: 'Monday', gem: 'Pearl (Moti)', metal: 'Silver', color: 'White, cream', mantra: 'Om Chandraya Namah', deity: 'Shiva / Parvati', number: 2, exalt: 1, own: [3], friends: ['Sun', 'Mercury'], enemies: [] },
    Mars: { sa: 'Mangal', abbr: 'Ma', day: 'Tuesday', gem: 'Red Coral (Moonga)', metal: 'Copper', color: 'Red', mantra: 'Om Mangalaya Namah', deity: 'Hanuman / Kartikeya', number: 9, exalt: 9, own: [0, 7], friends: ['Sun', 'Moon', 'Jupiter'], enemies: ['Mercury'] },
    Mercury: { sa: 'Budha', abbr: 'Me', day: 'Wednesday', gem: 'Emerald (Panna)', metal: 'Bronze', color: 'Green', mantra: 'Om Budhaya Namah', deity: 'Vishnu / Ganesha', number: 5, exalt: 5, own: [2, 5], friends: ['Sun', 'Venus'], enemies: ['Moon'] },
    Jupiter: { sa: 'Guru', abbr: 'Ju', day: 'Thursday', gem: 'Yellow Sapphire (Pukhraj)', metal: 'Gold', color: 'Yellow', mantra: 'Om Gurave Namah', deity: 'Brihaspati / Vishnu', number: 3, exalt: 3, own: [8, 11], friends: ['Sun', 'Moon', 'Mars'], enemies: ['Mercury', 'Venus'] },
    Venus: { sa: 'Shukra', abbr: 'Ve', day: 'Friday', gem: 'Diamond / White Sapphire', metal: 'Silver', color: 'White, pink', mantra: 'Om Shukraya Namah', deity: 'Lakshmi', number: 6, exalt: 11, own: [1, 6], friends: ['Mercury', 'Saturn'], enemies: ['Sun', 'Moon'] },
    Saturn: { sa: 'Shani', abbr: 'Sa', day: 'Saturday', gem: 'Blue Sapphire (Neelam)', metal: 'Iron', color: 'Black, dark blue', mantra: 'Om Shanaye Namah', deity: 'Shani / Hanuman', number: 8, exalt: 6, own: [9, 10], friends: ['Mercury', 'Venus'], enemies: ['Sun', 'Moon', 'Mars'] },
    Rahu: { sa: 'Rahu', abbr: 'Ra', day: 'Saturday', gem: 'Hessonite (Gomed)', metal: 'Lead', color: 'Smoky, dark blue', mantra: 'Om Rahave Namah', deity: 'Durga', number: 4, exalt: 1, own: [10], friends: ['Mercury', 'Venus', 'Saturn'], enemies: ['Sun', 'Moon', 'Mars'] },
    Ketu: { sa: 'Ketu', abbr: 'Ke', day: 'Tuesday', gem: "Cat's Eye (Lehsunia)", metal: 'Iron', color: 'Grey, multi-colour', mantra: 'Om Ketave Namah', deity: 'Ganesha', number: 7, exalt: 7, own: [7], friends: ['Mars', 'Venus', 'Saturn'], enemies: ['Sun', 'Moon'] },
  };
  D.PLANET_ORDER = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

  /* 16 zones, clockwise from North. Themes follow the popular 16-zone school. */
  D.ZONES = [
    { id: 'N', name: 'North', sa: 'Uttara', el: 'Water', planet: 'Mercury', deity: 'Kubera', theme: 'Money and new opportunities', good: 'Entrance, living room, cash locker facing north, water features, open space', avoid: 'Toilets, kitchen, heavy storage, red colours', colors: 'Blue, light green' },
    { id: 'NNE', name: 'North-Northeast', sa: 'Uttara-Ishanya', el: 'Water', planet: 'Mercury / Jupiter', deity: 'Aditi / Diti', theme: 'Health and immunity', good: 'Medicines, drinking water, open windows, light furniture', avoid: 'Toilets, dustbins, kitchen, clutter', colors: 'Light blue, white' },
    { id: 'NE', name: 'Northeast', sa: 'Ishanya', el: 'Water', planet: 'Jupiter', deity: 'Ishana (Shiva)', theme: 'Clarity of mind, spirituality, wisdom', good: 'Puja, meditation, underground water, open and light space', avoid: 'Toilets, kitchen, staircase, heavy furniture, cuts in the plot', colors: 'White, light yellow, light blue' },
    { id: 'ENE', name: 'East-Northeast', sa: 'Purva-Ishanya', el: 'Air', planet: 'Jupiter / Sun', deity: 'Parjanya / Jayanta', theme: 'Recreation, fun and freshness', good: 'Family lounge, play area, music, garden', avoid: 'Toilets, store of junk, heavy walls', colors: 'Light green' },
    { id: 'E', name: 'East', sa: 'Purva', el: 'Air', planet: 'Sun', deity: 'Indra', theme: 'Social connections and recognition', good: 'Entrance, living room, windows, study', avoid: 'Toilets, high boundary walls, heavy storage', colors: 'Green' },
    { id: 'ESE', name: 'East-Southeast', sa: 'Purva-Agneya', el: 'Air', planet: 'Sun / Venus', deity: 'Satya / Bhrisha', theme: 'Analysis and churning of thought (anxiety when disturbed)', good: 'Toilet, washing machine, mixer, churning activities', avoid: 'Bedroom, study, puja', colors: 'Light green, soft orange' },
    { id: 'SE', name: 'Southeast', sa: 'Agneya', el: 'Fire', planet: 'Venus', deity: 'Agni', theme: 'Cash flow, energy and fire', good: 'Kitchen, electrical panel, inverter, generator', avoid: 'Water tanks, borewell, blue colours, master bedroom', colors: 'Red, orange, pink' },
    { id: 'SSE', name: 'South-Southeast', sa: 'Dakshina-Agneya', el: 'Fire', planet: 'Venus / Mars', deity: 'Vitatha / Grihakshat', theme: 'Power, strength and confidence', good: 'Kitchen, gym, electrical equipment', avoid: 'Water bodies, toilets', colors: 'Red, orange' },
    { id: 'S', name: 'South', sa: 'Dakshina', el: 'Fire', planet: 'Mars', deity: 'Yama', theme: 'Fame, reputation and relaxation', good: 'Bedroom, heavy storage, staircase, high walls', avoid: 'Main entrance in most padas, water tanks, open space', colors: 'Red, maroon' },
    { id: 'SSW', name: 'South-Southwest', sa: 'Dakshina-Nairutya', el: 'Earth', planet: 'Mars / Rahu', deity: 'Bhringraj / Mriga', theme: 'Disposal and letting go of the useless', good: 'Toilet, dustbin, store of unused items', avoid: 'Puja, cash locker, entrance, study', colors: 'Yellow, cream' },
    { id: 'SW', name: 'Southwest', sa: 'Nairutya', el: 'Earth', planet: 'Rahu', deity: 'Nirriti / Pitru', theme: 'Relationships, stability and skills', good: 'Master bedroom, heavy storage, overhead tank, family photos', avoid: 'Toilets, entrance, cuts, underground water, open space', colors: 'Yellow, brown, earthy tones' },
    { id: 'WSW', name: 'West-Southwest', sa: 'Paschima-Nairutya', el: 'Space', planet: 'Rahu / Saturn', deity: 'Dauvarika / Sugriva', theme: 'Education, knowledge and savings', good: 'Study room, children’s bedroom, library, locker', avoid: 'Toilets, kitchen', colors: 'White, grey' },
    { id: 'W', name: 'West', sa: 'Paschima', el: 'Space', planet: 'Saturn', deity: 'Varuna', theme: 'Gains and profits', good: 'Dining, children’s room, study, overhead tank', avoid: 'Kitchen with large fire, cuts', colors: 'White, grey, metallic' },
    { id: 'WNW', name: 'West-Northwest', sa: 'Paschima-Vayavya', el: 'Space', planet: 'Saturn / Moon', deity: 'Shosha / Papayakshma', theme: 'Detox and release (depression when disturbed)', good: 'Toilet, septic tank, store', avoid: 'Bedroom, puja, office desk', colors: 'White, grey' },
    { id: 'NW', name: 'Northwest', sa: 'Vayavya', el: 'Air', planet: 'Moon', deity: 'Vayu', theme: 'Support, banking and movement', good: 'Guest room, garage, store of finished goods, daughter’s room', avoid: 'Master bedroom (restlessness), heavy fire', colors: 'White, silver, light grey' },
    { id: 'NNW', name: 'North-Northwest', sa: 'Uttara-Vayavya', el: 'Water', planet: 'Moon / Mercury', deity: 'Naga / Mukhya', theme: 'Attraction, intimacy and pleasure', good: 'Bedroom for couples, lounge', avoid: 'Toilets, kitchen, store', colors: 'Light blue, cream' },
  ];
  D.ELEMENT_COLORS = { Water: '#3a7bd5', Air: '#3aa776', Fire: '#e2583e', Earth: '#c9962b', Space: '#8a8fa3' };

  /* 32 entrance padas: index 0 = N1 at 315°–326.25°, clockwise. */
  D.PADAS = [
    ['N1', 'Roga', 'avoid', 'Illness and enmity'], ['N2', 'Naga', 'avoid', 'Envy and emotional strain'],
    ['N3', 'Mukhya', 'good', 'Prosperity and success'], ['N4', 'Bhallat', 'good', 'Abundance and opportunities'],
    ['N5', 'Soma', 'good', 'Wealth and devotion (Kubera)'], ['N6', 'Bhujag', 'avoid', 'Friction with children'],
    ['N7', 'Aditi', 'avoid', 'Strain for women in the family'], ['N8', 'Diti', 'avoid', 'Loss of wealth'],
    ['E1', 'Shikhi', 'avoid', 'Fire hazards and losses'], ['E2', 'Parjanya', 'avoid', 'Rising expenses'],
    ['E3', 'Jayant', 'good', 'Victory and wealth'], ['E4', 'Mahendra', 'good', 'Authority and government favour'],
    ['E5', 'Surya', 'neutral', 'Fame, but anger and ego'], ['E6', 'Satya', 'avoid', 'Untruth and broken promises'],
    ['E7', 'Bhrisha', 'avoid', 'Harshness and losses'], ['E8', 'Antariksha', 'avoid', 'Theft and losses'],
    ['S1', 'Anil', 'avoid', 'Weakness and struggle'], ['S2', 'Pusha', 'avoid', 'Servitude and dependence'],
    ['S3', 'Vitatha', 'good', 'Prosperity'], ['S4', 'Grihakshat', 'good', 'Wealth and reputation'],
    ['S5', 'Yama', 'avoid', 'Heavy expenses and fear'], ['S6', 'Gandharva', 'avoid', 'Poverty and ingratitude'],
    ['S7', 'Bhringraj', 'avoid', 'Failure and poverty'], ['S8', 'Mriga', 'avoid', 'Loss of strength and effort'],
    ['W1', 'Pitra', 'avoid', 'Short life, trouble for elders'], ['W2', 'Dauvarik', 'avoid', 'Stagnation'],
    ['W3', 'Sugreev', 'good', 'Growth and wealth'], ['W4', 'Pushpdant', 'good', 'Progeny and prosperity'],
    ['W5', 'Varun', 'good', 'Gains and fame'], ['W6', 'Asur', 'avoid', 'Trouble with authorities'],
    ['W7', 'Shosh', 'avoid', 'Sorrow and losses'], ['W8', 'Papyakshma', 'avoid', 'Illness and addictions'],
  ].map(([code, name, q, effect]) => ({ code, name, q, effect }));

  /* 45 devtas: short meanings (popular 45-devta school). */
  D.DEVTAS = {
    Brahma: 'Creator; the open, light centre (Brahmasthan)', Aryama: 'Relationships and social bonds', Vivasvan: 'Radiance and sustained effort',
    Mitra: 'Friendship and agreements', Bhudhar: 'Earth-holder; stability and resources', Apa: 'Water; cleansing and flow',
    Apavatsa: 'Child of water; immunity and nourishment', Savitra: 'Bringing forth new ideas', Savitri: 'Blessings and sustenance',
    Indra: 'Winning ability (inner southwest)', Jaya: 'Victory and accomplishment', Rudra: 'Removes sorrow; release',
    Rajayakshma: 'Attachment and lingering illness', Shikhi: 'Spark of ideas; fire of intellect', Parjanya: 'Rain; growth and fertility',
    Jayant: 'Victory and freshness', Mahendra: 'Authority and governance', Surya: 'Fame and visibility', Satya: 'Truth and goodwill',
    Bhrisha: 'Desire and rashness', Antariksha: 'Space; churning and thinking', Anil: 'Agni-Vayu; fire and motion of cash',
    Pusha: 'Nourishment and support', Vitatha: 'Pretence and appearances', Grihakshat: 'Guards boundaries of the home',
    Yama: 'Dharma, laws and endings', Gandharva: 'Music, arts and refinement', Bhringraj: 'Extracts the essence; disposal',
    Mriga: 'Seeking and pursuit', Pitra: 'Ancestors and lineage', Dauvarik: 'Gatekeeper; discipline', Sugreev: 'Receiving knowledge and support',
    Pushpdant: 'Blossoming; growth and blessings', Varun: 'Waters of abundance; gains', Asur: 'Raw strength and confidence',
    Shosh: 'Drying up; depression when disturbed', Papyakshma: 'Addictions and chronic illness', Roga: 'Disease; also support when balanced',
    Naga: 'Emotions and envy', Mukhya: 'The chief; prosperity', Bhallat: 'Abundance', Soma: 'Wealth and nectar (Kubera)',
    Bhujag: 'Healing and care', Aditi: 'Protection and security', Diti: 'Vision and broad thinking',
  };

  /* Room rules by zone id. good / ok / avoid; anything else is neutral. */
  D.ROOMS = {
    entrance: { label: 'Main entrance', icon: 'door', rule: 'pada' },
    kitchen: { label: 'Kitchen', icon: 'flame', good: ['SE'], ok: ['SSE', 'NW', 'E', 'S'], avoid: ['NE', 'NNE', 'N', 'SW', 'ENE', 'C'] },
    master: { label: 'Master bedroom', icon: 'bed', good: ['SW'], ok: ['S', 'W', 'WSW', 'SSW'], avoid: ['NE', 'SE', 'NNE', 'C'] },
    bedroom: { label: 'Bedroom', icon: 'bed', good: ['W', 'S', 'WSW', 'NNW'], ok: ['NW', 'E', 'SW', 'N'], avoid: ['SE', 'NE', 'C'] },
    toilet: { label: 'Toilet / bath', icon: 'drop', good: ['WNW', 'SSW', 'ESE'], ok: ['NW', 'S', 'W'], avoid: ['NE', 'NNE', 'N', 'ENE', 'E', 'SW', 'C'] },
    puja: { label: 'Puja / meditation', icon: 'lamp', good: ['NE', 'NNE', 'E', 'N'], ok: ['ENE', 'W'], avoid: ['S', 'SW', 'SSW', 'SE', 'WNW', 'C'] },
    living: { label: 'Living room', icon: 'sofa', good: ['N', 'E', 'NE', 'NW', 'ENE'], ok: ['W', 'NNW'], avoid: ['SW'] },
    dining: { label: 'Dining', icon: 'plate', good: ['W', 'E', 'WSW'], ok: ['S', 'N', 'NW'], avoid: ['SW', 'NE'] },
    study: { label: 'Study / work desk', icon: 'book', good: ['WSW', 'E', 'N', 'NE'], ok: ['W', 'ENE'], avoid: ['SSW', 'WNW', 'SE'] },
    stairs: { label: 'Staircase', icon: 'stairs', good: ['S', 'SW', 'W', 'SSW'], ok: ['WSW', 'NW', 'SE'], avoid: ['NE', 'N', 'NNE', 'E', 'C'] },
    store: { label: 'Heavy storage', icon: 'box', good: ['SW', 'S', 'W'], ok: ['SSW', 'WSW', 'NW'], avoid: ['NE', 'N', 'E', 'C'] },
    sump: { label: 'Underground water / borewell', icon: 'well', good: ['NE', 'N', 'E', 'NNE'], ok: ['ENE', 'W'], avoid: ['SE', 'SW', 'S', 'SSW', 'C'] },
    ohtank: { label: 'Overhead tank', icon: 'tank', good: ['SW', 'W'], ok: ['S', 'WSW', 'NW'], avoid: ['NE', 'SE', 'C'] },
    septic: { label: 'Septic tank', icon: 'drop', good: ['WNW', 'NW'], ok: ['SSW', 'W'], avoid: ['NE', 'SW', 'SE', 'E', 'C'] },
    locker: { label: 'Cash locker', icon: 'safe', good: ['N', 'SW'], ok: ['WSW', 'W'], avoid: ['SE', 'NE', 'SSW', 'ESE'] },
    garage: { label: 'Parking / garage', icon: 'car', good: ['NW', 'SE'], ok: ['N', 'E', 'W'], avoid: ['SW', 'NE'] },
    balcony: { label: 'Balcony / open area', icon: 'sun', good: ['N', 'E', 'NE'], ok: ['NW', 'ENE'], avoid: ['SW', 'S'] },
    electric: { label: 'Electrical panel / inverter', icon: 'bolt', good: ['SE', 'SSE'], ok: ['S', 'NW'], avoid: ['NE', 'N', 'SW'] },
    /* objects */
    mirror: { group: 'object', label: 'Mirror', icon: 'image', good: ['N', 'E', 'NE', 'NNE'], ok: ['NW', 'ENE'], avoid: ['S', 'SW', 'W', 'SE', 'SSW'] },
    aquarium: { group: 'object', label: 'Aquarium / fountain', icon: 'drop', good: ['N', 'NE', 'E', 'NNE'], ok: ['ENE', 'NNW'], avoid: ['S', 'SE', 'SW', 'SSE', 'C'] },
    tv: { group: 'object', label: 'TV / electronics', icon: 'bolt', good: ['SE', 'SSE', 'E'], ok: ['S', 'NW', 'N'], avoid: ['NE', 'SW', 'C'] },
    dustbin: { group: 'object', label: 'Dustbin', icon: 'trash', good: ['SSW', 'WNW'], ok: ['ESE', 'W', 'S'], avoid: ['NE', 'N', 'E', 'NNE', 'SW', 'C'] },
    shoes: { group: 'object', label: 'Shoe rack', icon: 'box', good: ['WNW', 'SSW', 'W', 'S'], ok: ['NW', 'ESE'], avoid: ['NE', 'N', 'E', 'NNE', 'SE', 'C'] },
    plants: { group: 'object', label: 'Indoor plants', icon: 'sun', good: ['N', 'E', 'NE', 'ENE'], ok: ['NNE', 'SE', 'NW'], avoid: ['SW', 'C'] },
    ancestors: { group: 'object', label: 'Ancestors’ photos', icon: 'people', good: ['SW', 'S', 'SSW'], ok: ['W', 'WSW'], avoid: ['NE', 'N', 'E', 'SE'] },
    deities: { group: 'object', label: 'Deity idols / photos', icon: 'lamp', good: ['NE', 'E', 'N'], ok: ['NNE', 'ENE', 'W'], avoid: ['S', 'SW', 'SSW', 'WNW'] },
    medicines: { group: 'object', label: 'Medicines', icon: 'plus', good: ['NNE', 'NE'], ok: ['N', 'E'], avoid: ['SSW', 'S', 'WNW'] },
    washing: { group: 'object', label: 'Washing machine', icon: 'refresh', good: ['ESE', 'NW', 'WNW'], ok: ['SE', 'W'], avoid: ['NE', 'N', 'SW'] },
    clock: { group: 'object', label: 'Wall clock', icon: 'today', good: ['N', 'E', 'NE'], ok: ['W', 'NW'], avoid: ['S', 'SW'] },
    heavy: { group: 'object', label: 'Heavy furniture / almirah', icon: 'box', good: ['SW', 'S', 'W'], ok: ['SSW', 'WSW', 'NW'], avoid: ['NE', 'N', 'E', 'C'] },
    bedhead: { group: 'object', label: 'Bed head (pillow side)', icon: 'bed', good: ['S', 'E', 'SSW', 'SW'], ok: ['W', 'WSW', 'SE'], avoid: ['N', 'NNE', 'NNW'] },
    desk: { group: 'object', label: 'Work desk (you sit here)', icon: 'book', good: ['WSW', 'SW', 'W', 'S'], ok: ['E', 'N'], avoid: ['NE', 'SE', 'WNW'] },
    painting: { group: 'object', label: 'Water / mountain painting', icon: 'image', good: ['N', 'NE', 'SW'], ok: ['E', 'S'], avoid: ['SE'] },
  };

  /* Lal Kitab: permanent houses (pakka ghar) and simple traditional remedies */
  D.LALKITAB = {
    Sun: { pakka: [1], remedy: 'Offer water to the rising Sun; respect father; keep a copper coin; avoid accepting free gifts.' },
    Moon: { pakka: [4], remedy: 'Keep silver; serve your mother and take her blessings; keep a pot of water near the bed at night and pour it on a plant.' },
    Mars: { pakka: [3, 8], remedy: 'Feed sweets to others on Tuesday; keep good relations with brothers; recite Hanuman Chalisa.' },
    Mercury: { pakka: [7], remedy: 'Feed green fodder to cows; respect sisters and daughters; keep a clean, unbroken pot of green items.' },
    Jupiter: { pakka: [2, 5, 9, 12], remedy: 'Apply saffron tilak; respect teachers and elders; donate turmeric or chana dal on Thursday.' },
    Venus: { pakka: [7], remedy: 'Respect your spouse; keep personal hygiene; donate curd or ghee; feed cows.' },
    Saturn: { pakka: [8, 10, 11], remedy: 'Serve workers and the elderly; donate mustard oil on Saturday; avoid alcohol and non-veg.' },
    Rahu: { pakka: [12], remedy: 'Keep a solid silver ball; float coconut in flowing water; avoid blue clothes when afflicted.' },
    Ketu: { pakka: [6], remedy: 'Feed dogs; respect maternal uncles; wear gold in the ear or keep saffron.' },
  };

  /* Aayadi (Vastu measurement auspiciousness) — one common set of rules; texts differ. */
  D.AAYADI = {
    yoni: ['Dhwaja (flag)', 'Dhooma (smoke)', 'Simha (lion)', 'Shwana (dog)', 'Vrishabha (bull)', 'Khara (donkey)', 'Gaja (elephant)', 'Kaka (crow)'],
    goodYoni: [0, 2, 4, 6],
    aaya: ['Dhwaja', 'Dhooma', 'Simha', 'Shwana', 'Vrishabha', 'Khara', 'Gaja', 'Kaka', 'Dhanam', 'Runam', 'Shubham', 'Nidhi'],
  };

  D.NUMBER_PLANET = { 1: 'Sun', 2: 'Moon', 3: 'Jupiter', 4: 'Rahu', 5: 'Mercury', 6: 'Venus', 7: 'Ketu', 8: 'Saturn', 9: 'Mars' };
  D.NUMBER_TRAITS = {
    1: { kw: 'Leadership, independence, drive', plus: 'Original, confident, self-starting', minus: 'Stubborn, dominating, impatient', colors: 'Gold, orange, yellow', days: 'Sunday', dir: 'East' },
    2: { kw: 'Sensitivity, diplomacy, imagination', plus: 'Caring, intuitive, cooperative', minus: 'Moody, indecisive, over-sensitive', colors: 'White, cream, light green', days: 'Monday', dir: 'Northwest' },
    3: { kw: 'Wisdom, expression, growth', plus: 'Optimistic, learned, generous', minus: 'Scattered, preachy, extravagant', colors: 'Yellow, purple', days: 'Thursday', dir: 'Northeast' },
    4: { kw: 'Unconventional, hard-working, sudden change', plus: 'Practical, systematic, inventive', minus: 'Rebellious, unlucky streaks, rigid', colors: 'Blue, grey, khaki', days: 'Saturday, Sunday', dir: 'Southwest' },
    5: { kw: 'Communication, business, freedom', plus: 'Quick, versatile, witty', minus: 'Restless, nervous, inconsistent', colors: 'Green, light grey', days: 'Wednesday', dir: 'North' },
    6: { kw: 'Love, beauty, comfort, family', plus: 'Artistic, responsible, charming', minus: 'Indulgent, possessive, vain', colors: 'White, pink, light blue', days: 'Friday', dir: 'Southeast' },
    7: { kw: 'Introspection, research, spirituality', plus: 'Analytical, intuitive, detached', minus: 'Secretive, isolated, sceptical', colors: 'Light green, white, multi-colour', days: 'Monday', dir: 'Northeast' },
    8: { kw: 'Discipline, karma, delayed success', plus: 'Patient, resilient, organised', minus: 'Pessimistic, slow, lonely', colors: 'Dark blue, black, purple', days: 'Saturday', dir: 'West' },
    9: { kw: 'Courage, energy, humanitarian', plus: 'Brave, passionate, compassionate', minus: 'Aggressive, impulsive, accident-prone', colors: 'Red, maroon, pink', days: 'Tuesday', dir: 'South' },
  };
  D.MISSING_REMEDY = {
    1: 'Use more red/orange at home; practise self-expression; offer water to the rising Sun.',
    2: 'Wear or keep silver; drink water from a silver or copper vessel; build patience in relationships.',
    3: 'Keep a yellow element in the northeast; respect teachers; read and write daily.',
    4: 'Keep an indoor plant in the southeast; organise your schedule; avoid shortcuts.',
    5: 'Keep green plants and an open centre; exercise for balance; keep promises small.',
    6: 'Add white/pink décor and fresh flowers; nurture family time; keep the home tidy.',
    7: 'Spend quiet time daily; meditate; keep a small water feature in the north.',
    8: 'Serve elders and workers; keep the southwest heavy and clean; be consistent.',
    9: 'Use a little red in the south; do physical activity; channel anger into action.',
  };

  D.CHALDEAN = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 8, G: 3, H: 5, I: 1, J: 1, K: 2, L: 3, M: 4, N: 5, O: 7, P: 8, Q: 1, R: 2, S: 3, T: 4, U: 6, V: 6, W: 6, X: 5, Y: 1, Z: 7 };

  D.TITHIS = ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima'];
  D.YOGAS = ['Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyana', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'];
  D.BAD_YOGAS = [0, 5, 8, 9, 12, 14, 16, 18, 26];
  D.KARANAS_MOV = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti (Bhadra)'];
  D.VARAS = [['Sunday', 'Ravivar', 'Sun'], ['Monday', 'Somvar', 'Moon'], ['Tuesday', 'Mangalvar', 'Mars'], ['Wednesday', 'Budhvar', 'Mercury'], ['Thursday', 'Guruvar', 'Jupiter'], ['Friday', 'Shukravar', 'Venus'], ['Saturday', 'Shanivar', 'Saturn']];
  D.MONTHS = ['Chaitra', 'Vaishakha', 'Jyeshtha', 'Ashadha', 'Shravana', 'Bhadrapada', 'Ashwin', 'Kartika', 'Margashirsha', 'Pausha', 'Magha', 'Phalguna'];
  D.TARA = [
    ['Janma', 'mixed', 'Birth star: be careful, avoid big starts'], ['Sampat', 'good', 'Wealth and gains'], ['Vipat', 'bad', 'Obstacles and danger'],
    ['Kshema', 'good', 'Well-being and comfort'], ['Pratyari', 'bad', 'Opposition and friction'], ['Sadhana', 'good', 'Achievement; good for effort'],
    ['Naidhana', 'bad', 'Destructive; avoid new work'], ['Mitra', 'good', 'Friendly and supportive'], ['Param Mitra', 'good', 'Very favourable'],
  ];

  D.MUHURAT = {
    griha: { label: 'Griha pravesh (house warming)', nak: [3, 4, 11, 13, 16, 20, 21, 22, 23, 25, 26], days: [1, 3, 4, 5] },
    vehicle: { label: 'Buying a vehicle', nak: [0, 4, 6, 7, 12, 13, 14, 16, 21, 22, 23, 26], days: [1, 3, 4, 5] },
    business: { label: 'Starting a business', nak: [0, 3, 7, 11, 12, 13, 16, 20, 21, 25, 26], days: [1, 3, 4, 5] },
    travel: { label: 'Travel', nak: [0, 4, 6, 7, 12, 16, 21, 22, 26], days: [1, 3, 4, 5] },
    property: { label: 'Buying property / land', nak: [3, 4, 6, 7, 11, 16, 20, 25, 26], days: [3, 4, 5, 6] },
    gold: { label: 'Buying gold / jewellery', nak: [0, 3, 7, 12, 13, 21, 22, 26], days: [0, 3, 4, 5] },
    learning: { label: 'Starting studies / Vidyarambha', nak: [0, 4, 6, 7, 12, 13, 14, 21, 22, 23, 26], days: [3, 4, 5] },
  };

  /* Kua (Feng Shui / Eight Mansions) favourable directions in order: success, health, love, growth. */
  D.KUA_DIRS = { 1: ['SE', 'E', 'S', 'N'], 2: ['NE', 'W', 'NW', 'SW'], 3: ['S', 'N', 'SE', 'E'], 4: ['N', 'S', 'E', 'SE'], 6: ['W', 'NE', 'SW', 'NW'], 7: ['NW', 'SW', 'NE', 'W'], 8: ['SW', 'NW', 'W', 'NE'], 9: ['E', 'SE', 'N', 'S'] };
  D.KUA_LABELS = ['Success (Sheng Chi)', 'Health (Tien Yi)', 'Love (Nien Yen)', 'Growth (Fu Wei)'];

  /* Places: name, lat, lon, tz (hours, standard time). */
  const IN = [
    ['New Delhi', 28.61, 77.21], ['Mumbai', 19.08, 72.88], ['Kolkata', 22.57, 88.36], ['Chennai', 13.08, 80.27], ['Bengaluru', 12.97, 77.59], ['Hyderabad', 17.39, 78.49],
    ['Ahmedabad', 23.02, 72.57], ['Pune', 18.52, 73.86], ['Jaipur', 26.91, 75.79], ['Lucknow', 26.85, 80.95], ['Kanpur', 26.45, 80.33], ['Nagpur', 21.15, 79.09],
    ['Indore', 22.72, 75.86], ['Bhopal', 23.26, 77.41], ['Patna', 25.59, 85.14], ['Vadodara', 22.31, 73.18], ['Surat', 21.17, 72.83], ['Ludhiana', 30.90, 75.85],
    ['Agra', 27.18, 78.01], ['Nashik', 20.00, 73.79], ['Faridabad', 28.41, 77.32], ['Meerut', 28.98, 77.71], ['Rajkot', 22.30, 70.80], ['Varanasi', 25.32, 82.97],
    ['Srinagar', 34.08, 74.80], ['Chhatrapati Sambhajinagar (Aurangabad)', 19.88, 75.34], ['Dhanbad', 23.80, 86.43], ['Amritsar', 31.63, 74.87], ['Prayagraj', 25.44, 81.85],
    ['Ranchi', 23.34, 85.31], ['Howrah', 22.59, 88.31], ['Coimbatore', 11.02, 76.96], ['Jabalpur', 23.18, 79.99], ['Gwalior', 26.22, 78.18], ['Vijayawada', 16.51, 80.65],
    ['Jodhpur', 26.24, 73.02], ['Madurai', 9.93, 78.12], ['Raipur', 21.25, 81.63], ['Kota', 25.21, 75.86], ['Guwahati', 26.14, 91.74], ['Chandigarh', 30.73, 76.78],
    ['Solapur', 17.66, 75.91], ['Mysuru', 12.30, 76.64], ['Bareilly', 28.37, 79.43], ['Gurugram', 28.46, 77.03], ['Noida', 28.54, 77.39], ['Ghaziabad', 28.67, 77.45],
    ['Aligarh', 27.88, 78.08], ['Moradabad', 28.84, 78.77], ['Thiruvananthapuram', 8.52, 76.94], ['Kochi', 9.93, 76.27], ['Kozhikode', 11.26, 75.78],
    ['Bhubaneswar', 20.30, 85.82], ['Cuttack', 20.46, 85.88], ['Dehradun', 30.32, 78.03], ['Haridwar', 29.95, 78.16], ['Rishikesh', 30.09, 78.27], ['Shimla', 31.10, 77.17],
    ['Jammu', 32.73, 74.86], ['Udaipur', 24.59, 73.71], ['Ajmer', 26.45, 74.64], ['Bikaner', 28.02, 73.31], ['Jalandhar', 31.33, 75.58], ['Patiala', 30.34, 76.39],
    ['Visakhapatnam', 17.69, 83.22], ['Tirupati', 13.63, 79.42], ['Warangal', 17.97, 79.59], ['Mangaluru', 12.91, 74.86], ['Hubballi', 15.36, 75.12], ['Belagavi', 15.85, 74.50],
    ['Panaji (Goa)', 15.49, 73.83], ['Kolhapur', 16.70, 74.24], ['Thane', 19.22, 72.98], ['Navi Mumbai', 19.03, 73.03], ['Ujjain', 23.18, 75.78], ['Mathura', 27.49, 77.67],
    ['Vrindavan', 27.58, 77.70], ['Ayodhya', 26.80, 82.20], ['Gorakhpur', 26.76, 83.37], ['Jhansi', 25.45, 78.57], ['Siliguri', 26.73, 88.40], ['Durgapur', 23.52, 87.31],
    ['Asansol', 23.68, 86.98], ['Jamshedpur', 22.80, 86.20], ['Gaya', 24.79, 85.00], ['Bhagalpur', 25.24, 86.97], ['Muzaffarpur', 26.12, 85.39], ['Salem', 11.66, 78.15],
    ['Tiruchirappalli', 10.79, 78.70], ['Puducherry', 11.94, 79.81], ['Vellore', 12.92, 79.13], ['Nellore', 14.44, 79.99], ['Guntur', 16.31, 80.44], ['Kurnool', 15.83, 78.04],
    ['Bilaspur', 22.08, 82.15], ['Imphal', 24.82, 93.94], ['Shillong', 25.58, 91.89], ['Agartala', 23.83, 91.29], ['Gangtok', 27.33, 88.61], ['Itanagar', 27.08, 93.61],
    ['Aizawl', 23.73, 92.72], ['Kohima', 25.67, 94.11], ['Port Blair', 11.62, 92.73], ['Rohtak', 28.90, 76.61], ['Panipat', 29.39, 76.97], ['Karnal', 29.69, 76.99],
    ['Hisar', 29.15, 75.72], ['Sonipat', 28.99, 77.02], ['Bhilai', 21.21, 81.38], ['Akola', 20.70, 77.00], ['Amravati', 20.93, 77.75], ['Jalgaon', 21.01, 75.56],
    ['Latur', 18.41, 76.56], ['Nanded', 19.14, 77.32], ['Sangli', 16.85, 74.58], ['Satara', 17.68, 74.02], ['Bhavnagar', 21.76, 72.15], ['Jamnagar', 22.47, 70.06],
    ['Junagadh', 21.52, 70.46], ['Gandhinagar', 23.22, 72.65], ['Anand', 22.56, 72.95], ['Ratlam', 23.33, 75.04], ['Sagar', 23.84, 78.74], ['Rewa', 24.53, 81.30],
    ['Satna', 24.60, 80.83], ['Alwar', 27.55, 76.60], ['Bharatpur', 27.22, 77.49], ['Sikar', 27.61, 75.14], ['Bathinda', 30.21, 74.95], ['Mohali', 30.70, 76.72],
  ].map(([n, la, lo]) => ({ name: n + ', India', lat: la, lon: lo, tz: 5.5 }));
  const WORLD = [
    ['Kathmandu, Nepal', 27.72, 85.32, 5.75], ['Dhaka, Bangladesh', 23.81, 90.41, 6], ['Karachi, Pakistan', 24.86, 67.01, 5], ['Lahore, Pakistan', 31.55, 74.34, 5],
    ['Colombo, Sri Lanka', 6.93, 79.86, 5.5], ['Dubai, UAE', 25.20, 55.27, 4], ['Abu Dhabi, UAE', 24.45, 54.38, 4], ['Doha, Qatar', 25.29, 51.53, 3],
    ['Riyadh, Saudi Arabia', 24.71, 46.68, 3], ['Muscat, Oman', 23.59, 58.41, 4], ['Kuwait City, Kuwait', 29.38, 47.99, 3], ['Singapore', 1.35, 103.82, 8],
    ['Kuala Lumpur, Malaysia', 3.14, 101.69, 8], ['Bangkok, Thailand', 13.76, 100.50, 7], ['Hong Kong', 22.32, 114.17, 8], ['Tokyo, Japan', 35.68, 139.69, 9],
    ['Sydney, Australia', -33.87, 151.21, 10], ['Melbourne, Australia', -37.81, 144.96, 10], ['Auckland, New Zealand', -36.85, 174.76, 12],
    ['London, UK', 51.51, -0.13, 0], ['Paris, France', 48.86, 2.35, 1], ['Berlin, Germany', 52.52, 13.40, 1], ['Amsterdam, Netherlands', 52.37, 4.90, 1],
    ['Zurich, Switzerland', 47.38, 8.54, 1], ['Moscow, Russia', 55.76, 37.62, 3], ['Nairobi, Kenya', -1.29, 36.82, 3], ['Johannesburg, South Africa', -26.20, 28.05, 2],
    ['Toronto, Canada', 43.65, -79.38, -5], ['New York, USA', 40.71, -74.01, -5], ['Chicago, USA', 41.88, -87.63, -6], ['Houston, USA', 29.76, -95.37, -6],
    ['San Francisco, USA', 37.77, -122.42, -8], ['Los Angeles, USA', 34.05, -118.24, -8], ['Vancouver, Canada', 49.28, -123.12, -8], ['Seattle, USA', 47.61, -122.33, -8],
  ].map(([n, la, lo, tz]) => ({ name: n, lat: la, lon: lo, tz }));
  D.PLACES = IN.concat(WORLD);
})(typeof window !== 'undefined' ? window : globalThis);
