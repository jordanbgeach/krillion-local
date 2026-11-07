import type { Answer, Category, Prompt, Score } from "../types";

// Independently curated familiarity estimates, not measured usage statistics.
// Each semicolon-delimited entry is a display name followed by optional =aliases.
function bank(tiers: Partial<Record<Score, string>>): Answer[] {
  return Object.entries(tiers).flatMap(([score, values]) =>
    values!.split(";").map((value) => {
      const [name, ...aliases] = value
        .trim()
        .split("=")
        .map((part) => part.trim());
      return {
        name,
        score: Number(score) as Score,
        ...(aliases.length ? { aliases } : {}),
      };
    }),
  );
}
function question(
  id: string,
  category: Category,
  prompt: string,
  note: string,
  tiers: Partial<Record<Score, string>>,
  source?: string,
): Prompt {
  return {
    id: `culture-${id}`,
    category,
    prompt,
    note,
    answers: bank(tiers),
    ...(source ? { source } : {}),
  };
}

export const culturePrompts: Prompt[] = [
  question(
    "constellations",
    "Science",
    "Name an official constellation.",
    "Use the Latin name or an established English name of one of the 88 IAU constellations. Asterisms such as the Big Dipper do not qualify.",
    {
      10: "Orion;Ursa Major=Great Bear;Ursa Minor=Little Bear;Leo;Scorpius=Scorpio",
      15: "Cassiopeia;Andromeda;Gemini;Aries;Taurus;Aquarius;Cancer;Libra;Virgo;Sagittarius;Capricornus=Capricorn;Pisces",
      30: "Draco;Cygnus;Pegasus;Canis Major;Canis Minor;Crux=Southern Cross;Lyra;Aquila;Hercules;Perseus",
      60: "Auriga;Boötes=Bootes;Carina;Centaurus;Cepheus;Cetus;Corvus;Delphinus;Eridanus;Hydra;Lepus;Lupus;Lynx;Monoceros;Ophiuchus;Phoenix;Serpens;Triangulum;Vela",
      85: "Antlia;Apus;Ara;Caelum;Camelopardalis;Canes Venatici;Chamaeleon;Circinus;Columba;Coma Berenices;Corona Australis;Corona Borealis;Crater;Dorado;Equuleus;Fornax;Grus;Hydrus;Indus;Lacerta;Leo Minor;Mensa;Microscopium;Musca;Norma;Octans;Pavo;Pictor;Piscis Austrinus;Puppis;Pyxis;Reticulum;Sagitta;Sculptor;Scutum;Sextans;Telescopium;Triangulum Australe;Tucana;Volans;Vulpecula",
      100: "Horologium",
    },
    "https://starchild.gsfc.nasa.gov/docs/StarChild/questions/88constellations.html",
  ),

  question(
    "moons",
    "Science",
    "Name a natural moon in our Solar System.",
    "Named natural satellites of planets or dwarf planets qualify, including Earth’s Moon. Common or official names count; planets and spacecraft do not qualify.",
    {
      10: "Moon=Luna;Titan;Europa",
      15: "Io;Ganymede;Callisto;Phobos;Deimos",
      30: "Enceladus;Triton;Charon;Rhea;Titania;Oberon",
      60: "Mimas;Iapetus;Dione;Tethys;Miranda;Ariel;Umbriel;Hyperion;Amalthea;Nereid",
      85: "Phoebe;Janus;Epimetheus;Pan;Atlas;Pandora;Prometheus;Himalia;Elara;Pasiphae;Sinope;Proteus;Larissa;Nix;Hydra",
      100: "Dysnomia;Styx;Kerberos;Daphnis;Telesto;Calypso",
    },
    "https://science.nasa.gov/solar-system/moons/",
  ),

  question(
    "si-prefixes",
    "Science",
    "Name an official SI metric prefix.",
    "Use the written name of an official SI prefix, including the four introduced in 2022. A prefix symbol or a prefixed unit does not qualify.",
    {
      10: "Kilo;Milli;Centi;Mega",
      15: "Nano;Giga;Micro",
      30: "Tera;Deci;Hecto;Deca=Deka",
      60: "Pico;Femto;Atto;Peta;Exa",
      85: "Zetta;Yotta;Zepto;Yocto",
      100: "Ronna;Quetta;Ronto;Quecto",
    },
    "https://www.bipm.org/en/measurement-units/si-prefixes",
  ),

  question(
    "si-units",
    "Science",
    "Name an SI base unit or a specially named SI derived unit.",
    "SI base units and the 22 derived units with special names qualify. Common or official unit names count; bare symbols and non-SI units such as litre and mile do not.",
    {
      10: "Metre=Meter;Second;Kilogram;Watt;Volt",
      15: "Ampere=Amp;Kelvin;Joule;Newton;Hertz",
      30: "Mole;Candela;Pascal;Ohm;Degree Celsius=Celsius",
      60: "Coulomb;Farad;Tesla;Lumen;Lux;Radian",
      85: "Henry;Weber;Siemens;Becquerel;Gray;Sievert;Steradian",
      100: "Katal",
    },
    "https://www.bipm.org/en/measurement-units/",
  ),

  question(
    "bones",
    "Science",
    "Name a bone in the adult human skeleton.",
    "Specific bones and conventional named bone groups, such as ribs or metacarpals, qualify. Standard anatomical names and common names such as kneecap are accepted.",
    {
      10: "Femur;Rib=Ribs;Skull=Cranium;Patella=Kneecap",
      15: "Tibia;Fibula;Humerus;Clavicle=Collarbone;Spine=Vertebral column",
      30: "Radius;Ulna;Scapula=Shoulder blade;Sternum=Breastbone;Mandible=Jawbone;Pelvis",
      60: "Sacrum;Coccyx=Tailbone;Calcaneus=Heel bone;Talus;Maxilla;Frontal bone;Parietal bone;Temporal bone;Occipital bone;Metacarpal=Metacarpals;Metatarsal=Metatarsals;Phalanx=Phalanges",
      85: "Sphenoid;Ethmoid;Zygomatic bone=Cheekbone;Nasal bone;Lacrimal bone;Vomer;Palatine bone;Hyoid;Scaphoid;Lunate;Triquetrum;Pisiform;Trapezium;Trapezoid;Capitate;Hamate",
      100: "Malleus;Incus;Stapes",
    },
  ),

  question(
    "sciences",
    "Science",
    "Name a field of science ending in “ology”.",
    "Use a recognized science or scientific specialty whose English name ends in the letters ology. Standard spelling variants qualify; nonscientific beliefs do not.",
    {
      10: "Biology;Geology;Psychology;Zoology",
      15: "Ecology;Archaeology=Archeology;Paleontology=Palaeontology;Sociology",
      30: "Anthropology;Meteorology;Neurology;Microbiology;Physiology;Immunology;Cardiology",
      60: "Entomology;Ornithology;Herpetology;Mycology;Seismology;Volcanology=Vulcanology;Hydrology;Limnology;Embryology;Endocrinology;Epidemiology;Virology",
      85: "Ichthyology;Bryology;Dendrology;Palynology;Glaciology;Speleology;Primatology;Malacology;Nematology;Histology;Cytology;Ethology",
      100: "Acarology;Odonatology;Lichenology;Trichology",
    },
  ),

  question(
    "minerals",
    "Science",
    "Name a naturally occurring mineral.",
    "Naturally occurring mineral species, mineral varieties, and recognized mineral groups qualify. Rocks such as granite and manufactured materials do not qualify.",
    {
      10: "Quartz;Diamond;Gold;Salt=Halite",
      15: "Ruby;Sapphire;Emerald;Amethyst;Talc;Graphite",
      30: "Calcite;Gypsum;Fluorite;Topaz;Corundum;Pyrite;Hematite;Magnetite",
      60: "Olivine;Garnet;Beryl;Tourmaline;Malachite;Azurite;Galena;Sphalerite;Dolomite;Kaolinite;Muscovite;Biotite",
      85: "Apatite;Orthoclase;Albite;Anorthite;Augite;Hornblende;Rutile;Zircon;Chalcopyrite;Cinnabar;Stibnite;Bornite;Celestine=Celestite",
      100: "Rhodochrosite;Wollastonite;Prehnite;Kyanite;Sillimanite",
    },
  ),

  question(
    "scientists",
    "Science",
    "Name a scientist born before 1900.",
    "Researchers in natural science, mathematics, or computing who were born before 1900 qualify. Common surnames, familiar names, and full names are accepted.",
    {
      10: "Albert Einstein=Einstein;Isaac Newton=Newton;Charles Darwin=Darwin;Marie Curie=Curie",
      15: "Galileo Galilei=Galileo;Nikola Tesla=Tesla",
      30: "Archimedes;Pythagoras;Euclid;Nicolaus Copernicus=Copernicus;Johannes Kepler=Kepler;Louis Pasteur=Pasteur;Ada Lovelace=Lovelace;Gregor Mendel=Mendel",
      60: "Michael Faraday=Faraday;James Clerk Maxwell=Maxwell;Dmitri Mendeleev=Mendeleev;Antoine Lavoisier=Lavoisier;Robert Hooke=Hooke;Carl Linnaeus=Linnaeus;Leonhard Euler=Euler;Carl Friedrich Gauss=Gauss;Niels Bohr=Bohr;Ernest Rutherford=Rutherford",
      85: "Hypatia;Srinivasa Ramanujan=Ramanujan;Emmy Noether=Noether;Henrietta Leavitt=Leavitt;Lise Meitner=Meitner;Sophie Germain=Germain;Mary Anning=Anning;Alfred Russel Wallace=Wallace;Maria Sibylla Merian=Merian",
      100: "Ibn al-Haytham=Alhazen;Al-Biruni=Biruni;Émilie du Châtelet=Emilie du Chatelet;Caroline Herschel;Janaki Ammal=Ammal",
    },
  ),

  question(
    "muscles",
    "Science",
    "Name a human muscle.",
    "Named human muscles, familiar muscle groups, and named cardiac or smooth muscles qualify. The prompt does not restrict answers to skeletal muscle. Anatomical and common names such as biceps, abs, or the heart's cardiac muscle are accepted.",
    {
      10: "Biceps brachii=Biceps=Bicep;Triceps brachii=Triceps=Tricep;Rectus abdominis=Abs;Heart=Cardiac muscle=Myocardium",
      15: "Deltoid=Deltoids;Pectoralis major=Pecs;Gluteus maximus=Glutes;Quadriceps=Quadriceps femoris=Quads",
      30: "Gastrocnemius=Calf;Soleus;Trapezius=Traps;Latissimus dorsi=Lats;Masseter;Diaphragm",
      60: "Sartorius;Rectus femoris;Vastus lateralis;Vastus medialis;Biceps femoris;Semitendinosus;Semimembranosus;Tibialis anterior;Brachialis;Brachioradialis;Pectoralis minor",
      85: "Sternocleidomastoid;Temporalis;Orbicularis oculi;Orbicularis oris;Buccinator;Supraspinatus;Infraspinatus;Subscapularis;Teres minor;Teres major;Piriformis;Gracilis",
      100: "Popliteus;Palmaris longus;Plantaris;Anconeus;Coracobrachialis",
    },
  ),

  question(
    "instruments",
    "Culture",
    "Name a musical instrument.",
    "Named acoustic, electric, or electronic musical instruments qualify. Generic ensemble sections such as strings do not identify an instrument.",
    {
      10: "Piano;Guitar;Violin;Drum=Drums;Flute",
      15: "Trumpet;Saxophone;Ukulele;Harp;Bagpipes;Didgeridoo",
      30: "Cello;Viola;Clarinet;Trombone;Tuba;Oboe;Bassoon;Accordion;Harmonica;Banjo;Mandolin;Double bass=Upright bass;Keyboard;Synthesizer=Synth",
      60: "Sitar;Tabla;Marimba;Xylophone;Vibraphone;Ocarina;Theremin;Bass guitar;Organ;Recorder;French horn=Horn;Timpani;Dulcimer",
      85: "Oud;Kora;Balalaika;Erhu;Shamisen;Koto;Shakuhachi;Saz=Bağlama=Baglama;Guzheng;Guqin;Santoor;Mbira=Kalimba;Cajón=Cajon",
      100: "Nyckelharpa;Hurdy-gurdy=Hurdy gurdy;Glass harmonica;Serpent;Crumhorn",
    },
  ),

  question(
    "greek-deities",
    "Culture",
    "Name a deity from Greek mythology.",
    "Established gods, goddesses, Titans, and divine personifications from Greek mythology qualify. Solely Roman figures and solely mortal heroes do not qualify.",
    {
      10: "Zeus;Poseidon;Hades;Athena;Aphrodite",
      15: "Apollo;Artemis;Ares;Hermes;Hera;Dionysus",
      30: "Demeter;Hephaestus;Hestia;Persephone;Eros;Gaia=Gaea;Cronus=Kronos",
      60: "Nyx;Hecate;Pan;Helios;Selene;Eos;Nike;Iris;Nemesis;Hypnos;Thanatos;Uranus=Ouranos;Rhea",
      85: "Hebe;Asclepius=Asklepios;Tyche;Eris;Harmonia;Themis;Mnemosyne;Oceanus=Okeanos;Tethys;Hyperion;Iapetus;Coeus=Koios;Phoebe",
      100: "Astraeus;Asteria;Metis;Bia;Zelus=Zelos;Kratos=Cratos",
    },
  ),

  question(
    "shakespeare",
    "Culture",
    "Name a surviving play by William Shakespeare.",
    "Surviving plays attributed wholly or jointly to William Shakespeare qualify. Full titles and customary short titles are accepted; lost plays and poems do not qualify.",
    {
      10: "Hamlet;Macbeth;Romeo and Juliet=Romeo & Juliet",
      15: "Othello;King Lear;A Midsummer Night’s Dream=A Midsummer Nights Dream=Midsummer Nights Dream",
      30: "The Tempest=Tempest;Julius Caesar;The Merchant of Venice=Merchant of Venice;Twelfth Night;Much Ado About Nothing;The Taming of the Shrew=Taming of the Shrew;Richard III=Richard 3;Henry V=Henry 5",
      60: "As You Like It;The Comedy of Errors=Comedy of Errors;Antony and Cleopatra;Titus Andronicus;The Winter’s Tale=The Winters Tale=Winters Tale;Measure for Measure;Cymbeline;Coriolanus;Richard II=Richard 2",
      85: "All’s Well That Ends Well=Alls Well That Ends Well;Love’s Labor’s Lost=Loves Labors Lost=Loves Labours Lost;The Merry Wives of Windsor=Merry Wives of Windsor;The Two Gentlemen of Verona=Two Gentlemen of Verona;Troilus and Cressida;Pericles=Pericles Prince of Tyre;King John;Henry VIII=Henry 8;Henry IV Part 1=Henry IV 1=Henry 4 Part 1;Henry IV Part 2=Henry IV 2=Henry 4 Part 2",
      100: "Timon of Athens;The Two Noble Kinsmen=Two Noble Kinsmen;Henry VI Part 1=Henry VI 1=Henry 6 Part 1;Henry VI Part 2=Henry VI 2=Henry 6 Part 2;Henry VI Part 3=Henry VI 3=Henry 6 Part 3",
    },
    "https://folgerpedia.folger.edu/William_Shakespeare%27s_plays",
  ),

  question(
    "composers",
    "Culture",
    "Name a classical composer born before 1900.",
    "Composers in the Western classical tradition who were born before 1900 qualify. Common surnames, familiar names, and full names are accepted.",
    {
      10: "Ludwig van Beethoven=Beethoven;Wolfgang Amadeus Mozart=Mozart;Johann Sebastian Bach=Bach;Pyotr Ilyich Tchaikovsky=Tchaikovsky",
      15: "Frédéric Chopin=Frederic Chopin=Chopin;Antonio Vivaldi=Vivaldi;Johann Pachelbel=Pachelbel;Claude Debussy=Debussy",
      30: "George Frideric Handel=Handel;Johannes Brahms=Brahms;Franz Schubert=Schubert;Richard Wagner=Wagner;Franz Liszt=Liszt;Joseph Haydn=Haydn;Sergei Rachmaninoff=Rachmaninoff;Igor Stravinsky=Stravinsky",
      60: "Gustav Mahler=Mahler;Maurice Ravel=Ravel;Antonín Dvořák=Antonin Dvorak=Dvorak;Edvard Grieg=Grieg;Felix Mendelssohn=Mendelssohn;Camille Saint-Saëns=Camille Saint-Saens=Saint-Saens;Georges Bizet=Bizet;Giacomo Puccini=Puccini;Giuseppe Verdi=Verdi;Hector Berlioz=Berlioz;Nikolai Rimsky-Korsakov=Rimsky-Korsakov",
      85: "Clara Schumann;Robert Schumann=Schumann;Fanny Mendelssohn=Fanny Hensel;Lili Boulanger;Nadia Boulanger;Hildegard of Bingen=Hildegard;Élisabeth Jacquet de La Guerre=Elisabeth Jacquet de La Guerre;Florence Price;Amy Beach;Scott Joplin=Joplin;Samuel Coleridge-Taylor;Erik Satie=Satie",
      100: "Barbara Strozzi=Strozzi;Francesca Caccini;Louise Farrenc=Farrenc;Mel Bonis=Mélanie Bonis=Melanie Bonis;Joseph Bologne=Chevalier de Saint-Georges",
    },
  ),

  question(
    "art-movements",
    "Culture",
    "Name a visual art movement or style.",
    "Established movements and styles in painting, sculpture, or related visual arts qualify, including historical periods and modern movements. Individual artworks or artists do not qualify.",
    {
      10: "Impressionism;Surrealism;Cubism;Realism",
      15: "Renaissance;Baroque;Pop art;Abstract art=Abstraction",
      30: "Expressionism;Romanticism;Art Nouveau;Art Deco;Dada=Dadaism;Minimalism;Pointillism",
      60: "Post-Impressionism;Fauvism;Futurism;Symbolism;Neoclassicism;Rococo;Abstract Expressionism;Bauhaus;Constructivism;Conceptual art",
      85: "Suprematism;De Stijl;Vorticism;Precisionism;Orphism;Luminism;Tonalism;Photorealism;Op art;Arte Povera;CoBrA",
      100: "Rayonism;Cloisonnism;Synthetism;Metaphysical painting;Stuckism",
    },
  ),

  question(
    "poetic-forms",
    "Culture",
    "Name a poetic form or verse form.",
    "Named poem forms, stanza patterns, and established verse structures qualify. Individual poem titles and literary devices such as simile do not qualify.",
    {
      10: "Haiku;Sonnet;Limerick;Free verse",
      15: "Ballad;Ode;Epic;Acrostic",
      30: "Elegy;Blank verse;Couplet;Quatrain;Villanelle;Tanka",
      60: "Sestina;Ghazal;Pantoum;Cinquain;Rondeau;Triolet;Terza rima;Heroic couplet;Prose poem;Spenserian stanza",
      85: "Rondel;Ballade;Ottava rima;Rime royal=Rhyme royal;Kyrielle;Clerihew;Dramatic monologue;Eclogue",
      100: "Gogyohka;Sijo;Rubai=Ruba’i",
    },
  ),

  question(
    "literary-genres",
    "Culture",
    "Name a literary genre or recognized subgenre.",
    "Recognized genres, subgenres, and forms of fiction, drama, or nonfiction qualify. Individual book or play titles do not qualify.",
    {
      10: "Fantasy;Science fiction=Sci-fi=Scifi;Romance;Horror;Mystery",
      15: "Thriller;Historical fiction;Comedy;Tragedy;Biography;Autobiography",
      30: "Adventure;Crime fiction=Crime;Detective fiction;Dystopia=Dystopian fiction;Satire;Memoir;Western;Fairy tale;Fable",
      60: "Magical realism;Gothic fiction=Gothic;Cyberpunk;Steampunk;Space opera;Epic fantasy;Urban fantasy;Picaresque;Pastoral;Travelogue=Travel writing;Epistolary novel=Epistolary fiction",
      85: "Bildungsroman;Künstlerroman=Kunstlerroman;Cli-fi=Climate fiction;Solarpunk;Weird fiction;Sword and sorcery;Utopia=Utopian fiction;Absurdist fiction;Noir;Cozy mystery=Cosy mystery",
      100: "Isekai;Dying Earth;Bangsian fantasy;Biopunk;Slipstream;Menippean satire",
    },
  ),

  question(
    "dances",
    "Culture",
    "Name a dance style.",
    "Recognized social, folk, ballroom, or theatrical dance forms qualify. Broad styles and individual named dances both count.",
    {
      10: "Ballet;Salsa;Tango;Waltz;Tap=Tap dance",
      15: "Hip-hop=Hip hop;Breakdance=Breaking=Breakdancing;Disco;Belly dance=Belly dancing;Flamenco",
      30: "Foxtrot;Quickstep;Cha-cha=Cha cha=Cha cha cha;Rumba;Samba;Swing;Polka;Charleston;Jive;Jazz dance",
      60: "Bachata;Merengue;Lindy hop;Bolero;Mambo;Paso doble;Viennese waltz;Irish stepdance=Irish step dance;Hula;Kathak;Bharatanatyam;Odissi",
      85: "Kuchipudi;Kathakali;Mohiniyattam;Manipuri;Sattriya;Bhangra;Garba;Fandango;Cumbia;Kizomba;Zouk;Tarantella;Mazurka",
      100: "Schottische;Csárdás=Csardas;Hambo;Gumboot dance;Tinikling;Hopak",
    },
  ),

  question(
    "norse-deities",
    "Culture",
    "Name a deity from Norse mythology.",
    "Established gods, goddesses, and divine figures in Norse mythology qualify, including the Aesir and Vanir. Mortal heroes and modern fictional additions do not qualify.",
    {
      10: "Odin;Thor;Loki",
      15: "Freya=Freyja;Heimdall;Balder=Baldr",
      30: "Frigg;Tyr;Hel;Freyr=Frey;Njord=Njörðr=Njordr;Sif",
      60: "Idunn=Iðunn=Idun;Bragi;Hod=Hodr=Höðr;Vidar=Víðarr;Vali=Váli;Ullr=Ull;Skadi=Skaði",
      85: "Forseti;Eir;Gefjon;Fulla;Gna=Gná;Hlin=Hlín;Lofn;Snotra;Var=Vár;Vor=Vör",
      100: "Syn;Sjofn=Sjöfn;Sága=Saga;Sól=Sol;Máni=Mani",
    },
  ),

  question(
    "palindromes",
    "Words",
    "Name a single English word that is a palindrome.",
    "Use a single English word whose letters read identically forward and backward. Ignore capitalization; multiword phrases do not qualify. Standard inflected or derived words count if they remain palindromes.",
    {
      10: "Racecar;Level;Madam;Mom;Dad;A;I",
      15: "Kayak;Radar;Civic;Noon;Pop",
      30: "Refer;Rotor;Deed;Peep;Toot;Tenet;Stats;Solos;Wow",
      60: "Redder;Repaper;Reviver;Rotator;Rotavator;Releveler;Sagas;Sexes;Sees;Nun;Ewe;Eye",
      85: "Deified;Reifier;Minim;Tattarrattat",
      100: "Detartrated",
    },
  ),

  question(
    "silent-initials",
    "Words",
    "Name an English word with a silent first letter.",
    "Use an English dictionary word whose first written letter is unpronounced in a standard English pronunciation. Standard regional pronunciations may differ; inflected and derived words qualify if the first letter remains silent.",
    {
      10: "Knife;Knee;Knight;Know;Write;Wrong",
      15: "Gnome;Knot;Knock;Wrist;Psychology",
      30: "Knowledge;Knuckle;Kneel;Knob;Wrap;Wreck;Wren;Wrinkle;Wrestle;Honest;Hour;Heir;Honor=Honour",
      60: "Gnaw;Gnat;Gnu;Gnash;Gnarled;Knack;Knapsack;Knave;Knit;Knell;Wreath;Writhe;Wry;Pneumonia;Pseudonym",
      85: "Mnemonic;Pterodactyl;Pterosaur;Psalter;Psalm;Psychiatry;Psychic;Pneumatic;Ptarmigan",
      100: "Cnidarian;Ctenophore",
    },
  ),

  question(
    "double-o",
    "Words",
    "Name an English word containing “oo”.",
    "Use a single English dictionary word containing adjacent letters oo. Standard inflected and derived words qualify when they retain those adjacent letters.",
    {
      10: "Book;Moon;Food;Good;Zoo;Cool",
      15: "Pool;School;Spoon;Room;Door;Floor;Foot;Boot;Wood",
      30: "Blood;Flood;Goose;Moose;Roof;Root;Tooth;Proof;Loose;Choose;Soon;Noon;Balloon;Mushroom",
      60: "Brooch;Brook;Brood;Crook;Croon;Swoop;Stoop;Stool;Soot;Swoon;Groom;Bloom;Doom;Gloom;Bamboo",
      85: "Raccoon;Monsoon;Bassoon;Buffoon;Baboon;Lagoon;Maroon;Harpoon;Cocoon;Spittoon;Pontoon;Poodle;Hoodwink",
      100: "Spoonbill;Snood;Boodie;Goosander;Schooner",
    },
  ),

  question(
    "qu-words",
    "Words",
    "Name an English word beginning with “qu”.",
    "Use a single English dictionary word starting with the letters qu. Standard inflected and derived words qualify when they still start with qu.",
    {
      10: "Queen;Quick;Question;Quiet;Quiz",
      15: "Quack;Quilt;Quit;Quite;Quote;Quality",
      30: "Quest;Queue;Quarter;Quake;Quail;Quartz;Quarrel;Quantity;Quiver;Quirky;Quench;Quintet;Quota",
      60: "Quagmire;Quandary;Quibble;Quip;Quash;Quaver;Quorum;Quadrant;Quicksand;Quotient;Quixotic;Quiescent",
      85: "Quiddity;Quincunx;Quotidian;Quisling;Quokka;Quetzal;Quoll;Quahog;Quern;Quinine;Quatrain",
      100: "Quittance;Quillon;Quire;Quipu;Quinquereme",
    },
  ),

  question(
    "z-words",
    "Words",
    "Name an English word beginning with “z”.",
    "Use a single English dictionary word starting with z. Proper names do not qualify; standard inflected and derived words count when they still start with z.",
    {
      10: "Zebra;Zoo;Zero;Zombie;Zoom",
      15: "Zip;Zipper;Zone;Zigzag;Zinc;Zodiac",
      30: "Zest;Zeal;Zany;Zenith;Zeppelin;Zucchini;Zygote;Zoology;Zookeeper;Zillion",
      60: "Zephyr;Zither;Zinnia;Zircon;Zebu;Zygomatic;Zooplankton;Zonal;Zestful;Zealous;Ziggurat;Zeitgeist",
      85: "Zymurgy;Zoetrope;Zoster;Zoisite;Zabaglione;Zygospore;Zander;Zorilla;Zoonosis;Zygodactyl",
      100: "Zarf;Zax;Zyzzyva;Zydeco;Zamindar",
    },
  ),

  question(
    "ph-words",
    "Words",
    "Name an English word containing “ph”.",
    "Use a single English dictionary word containing adjacent letters ph anywhere. Proper names do not qualify; standard inflected and derived words count when they retain ph.",
    {
      10: "Phone;Photo;Elephant;Alphabet;Dolphin",
      15: "Phantom;Physics;Philosophy;Photography;Sphere;Trophy",
      30: "Phase;Phrase;Pharaoh;Graph;Graphite;Paragraph;Triumph;Phoenix;Symphony;Atmosphere;Pharmacy;Phobia",
      60: "Phosphorescence;Phoneme;Phonetic;Phylum;Phalanx;Sphinx;Amphibian;Ephemeral;Euphoria;Sapphire;Siphon;Nephew;Cipher",
      85: "Phlegm;Phloem;Phatic;Phenotype;Phototropism;Cephalopod;Xylophone;Lithograph;Apostrophe;Catastrophe;Metamorphosis",
      100: "Phylactery;Phyllotaxis;Apophasis;Epiphyte",
    },
  ),

  question(
    "less-words",
    "Words",
    "Name an English word ending in “less”.",
    "Use a single English dictionary word ending with the letters less. Standard inflected and derived words count only when the complete word still ends in less.",
    {
      10: "Hopeless;Useless;Careless;Endless;Fearless",
      15: "Harmless;Helpless;Homeless;Jobless;Speechless;Worthless;Restless",
      30: "Selfless;Sleepless;Flawless;Painless;Tasteless;Nameless;Faceless;Heartless;Mindless;Timeless;Spotless;Breathless;Countless",
      60: "Tireless;Dauntless;Reckless;Ruthless;Guileless;Listless;Peerless;Matchless;Priceless;Soundless;Seamless;Boundless;Limitless",
      85: "Feckless;Gormless;Fathomless;Trackless;Rudderless;Artless;Chinless;Scentless;Shoeless;Stainless;Pitiless;Joyless",
      100: "Causeless;Quenchless;Ireless;Cureless;Sinewless",
    },
  ),

  question(
    "double-e",
    "Words",
    "Name an English word containing “ee”.",
    "Use a single English dictionary word containing adjacent letters ee. Proper names do not qualify; standard inflected and derived words count when they retain those adjacent letters.",
    {
      10: "Tree;Bee;See;Free;Green;Three",
      15: "Cheese;Feet;Knee;Queen;Sheep;Sleep;Sweet;Street",
      30: "Deep;Keep;Meet;Need;Seed;Speed;Steel;Wheel;Week;Teeth;Screen;Coffee;Agree;Between",
      60: "Breeze;Freeze;Sneeze;Squeeze;Tweezers;Beetle;Deer;Reef;Reel;Peer;Jeep;Sleeve;Sleek;Weep;Veer",
      85: "Filigree;Pedigree;Referee;Employee;Committee;Beseech;Peevish;Sleepless;Sheer;Careen;Preen",
      100: "Peewee;Reemerge;Freewheeling;Beekeeping;Leeward",
    },
  ),

  question(
    "five-letter-animals",
    "Words",
    "Name an animal whose English name has five letters.",
    "Use a single English animal name with exactly five letters. Singular names, ordinary plural names, species names, and broader animal-group names qualify when the complete submitted word has five letters.",
    {
      10: "Tiger;Horse;Zebra;Shark;Whale",
      15: "Mouse;Sheep;Camel;Panda;Koala;Otter;Lions;Bears;Geese;Frogs;Crabs;Worms",
      30: "Eagle;Goose;Raven;Robin;Bison;Hyena;Lemur;Sloth;Skunk;Moose;Gecko;Snake;Dingo;Stoat;Sable;Heron;Crane;Grebe;Clams;Slugs;Swans",
      60: "Okapi;Tapir;Coati;Shrew;Viper;Skink;Cobra;Trout;Perch;Guppy;Prawn;Squid;Snail;Leech",
      85: "Quoll;Quail;Snipe;Egret;Stork;Swift;Finch;Macaw;Pewee;Tench;Roach;Bream;Loach;Krill",
      100: "Saiga;Oribi;Addax;Dhole;Loris;Ratel;Hyrax;Civet;Genet;Fossa;Indri",
    },
  ),
];
