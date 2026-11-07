import type { Answer, Score } from "../types";

// Independent additions to the existing prompts. Scores are curated familiarity
// estimates. Existing canonical names/aliases and their scores take priority.
function a(tiers: Partial<Record<Score, string>>): Answer[] {
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

export const extraExpandedAnswers: Record<string, Answer[]> = {
  // Organ terminology: https://openstax.org/books/anatomy-and-physiology-2e
  // Sensory organs: https://www.ncbi.nlm.nih.gov/sites/books/NBK562237/
  // https://www.ncbi.nlm.nih.gov/mesh/?term=Organ+of+Corti
  "extra-human-organs": a({
    10: "Skin;Eye;Ear;Tongue;Bladder=Urinary Bladder",
    15: "Esophagus=Oesophagus;Trachea=Windpipe;Larynx=Voice Box;Pharynx;Appendix",
    30: "Ovary=Ovaries;Testis=Testicle=Testes;Uterus=Womb;Prostate=Prostate Gland;Breast=Mammary Gland;Tonsil=Tonsils;Placenta;Penis;Vagina;Clitoris",
    60: "Parathyroid Gland=Parathyroid;Fallopian Tube=Uterine Tube=Oviduct;Cervix;Ureter;Urethra;Rectum;Epididymis;Seminal Vesicle;Vas Deferens=Ductus Deferens",
    85: "Parotid Gland=Parotid;Submandibular Gland;Sublingual Gland;Lacrimal Gland=Tear Gland;Bulbourethral Gland=Cowper's Gland;Bartholin Gland=Greater Vestibular Gland",
    100: "Carotid Body;Organ of Corti=Spiral Organ",
  }),
  // NASA mission histories: https://science.nasa.gov/moon/missions/
  // https://science.nasa.gov/deep-space-exploration/
  "extra-robotic-spacecraft": a({
    15: "Curiosity=Mars Science Laboratory;Perseverance=Mars 2020;Spirit;Opportunity;Mars Pathfinder=Pathfinder",
    30: "Sojourner;InSight;Mars Express;Mars Odyssey=2001 Mars Odyssey;Mars Reconnaissance Orbiter=MRO;MAVEN;MESSENGER;Hayabusa;Hayabusa2=Hayabusa 2;OSIRIS-REx;Deep Impact;Stardust;Parker Solar Probe;Solar Orbiter",
    60: "Venus Express;Akatsuki;Mariner 5;Mariner 6;Mariner 7;Mariner 9;Mariner 10;Surveyor 1;Surveyor 3;Surveyor 5;Surveyor 6;Surveyor 7;Luna 2;Luna 3;Luna 9;Luna 10;Luna 16;Luna 17;Luna 20;Luna 21;Luna 24",
    85: "Chang'e 1=Chang'e-1;Chang'e 2=Chang'e-2;Chang'e 3=Chang'e-3;Chang'e 4=Chang'e-4;Chang'e 5=Chang'e-5;Chandrayaan-1=Chandrayaan 1;Chandrayaan-2=Chandrayaan 2;Chandrayaan-3=Chandrayaan 3;BepiColombo;Tianwen-1=Tianwen 1;Hope Orbiter=Emirates Mars Mission;Venera 7;Venera 9;Venera 13;Venera 14",
    100: "ISEE-3=International Cometary Explorer=ICE;IKAROS;Sakigake;Suisei;Giotto;Deep Space 1;SMART-1;Clementine;Lunar Prospector;Lunar Reconnaissance Orbiter=LRO;SELENE=Kaguya;SLIM=Smart Lander for Investigating Moon",
  }),
  // NIST Dictionary of Algorithms and Data Structures: https://xlinux.nist.gov/dads/
  "extra-data-structures": a({
    10: "Dictionary=Associative Array=Map;Record=Struct;Tuple;String",
    15: "Dynamic Array;Doubly Linked List;Circular Linked List;Binary Tree;Priority Queue;Deque=Double-Ended Queue;Hash Set;Multiset=Bag;Multimap",
    30: "B-Tree=B Tree;Splay Tree;Treap;Suffix Tree;Suffix Array;Radix Tree=Compressed Trie;Segment Tree;Interval Tree;Adjacency List;Adjacency Matrix;Bit Array=Bit Vector;Circular Buffer=Ring Buffer;Sparse Array;Sparse Matrix",
    60: "Quadtree;Octree;K-d Tree=KD Tree;R-Tree;Merkle Tree;Patricia Trie=Patricia Tree;Fenwick Tree=Binary Indexed Tree;Binomial Heap;Fibonacci Heap;Pairing Heap;Disjoint-Set Structure=Union-Find=Disjoint Set;Rope;Unrolled Linked List",
    85: "Hash Array Mapped Trie=HAMT;Log-Structured Merge-Tree=LSM Tree;Finger Tree;Brodal Queue;Min-Max Heap;Leftist Heap;Skew Heap;Cuckoo Filter;Count-Min Sketch;Sparse Table",
    100: "Van Emde Boas Tree;BK-Tree=Burkhard-Keller Tree;Zipper;Soft Heap;Cartesian Tree",
  }),
  "extra-measuring-instruments": a({
    10: "Ruler;Tape Measure;Clock;Stopwatch;Weighing Scale=Scale=Balance;Speedometer",
    15: "Micrometer;Caliper=Calliper=Vernier Caliper;Multimeter;Oscilloscope;Rain Gauge;Compass;Protractor;Odometer;Flowmeter=Flow Meter",
    30: "Ohmmeter;Wattmeter;Frequency Counter;Accelerometer;Gyroscope;Magnetometer;Dynamometer;Spring Scale;Sound Level Meter;Geiger Counter;Dosimeter;Sphygmomanometer;Pulse Oximeter;Spirometer",
    60: "Galvanometer;Electrometer;Potentiometer;Gravimeter;Tiltmeter;Clinometer=Inclinometer;Densitometer;Viscometer;Polarimeter;Interferometer;Spherometer;Planimeter;Radiometer;Salinometer;Conductivity Meter;pH Meter",
    85: "Pyranometer;Pyrheliometer;Actinometer;Nephelometer;Turbidimeter;Bolometer;Gaussmeter;Fluxmeter;Scintillation Counter;Ionization Chamber=Ionisation Chamber;Ceilometer;Disdrometer;Snow Gauge",
    100: "Atmometer=Evaporimeter;Psychrometer;Sling Psychrometer;Aethalometer;Scintillometer",
  }),
  // Fields follow the AMS Mathematics Subject Classification families.
  // https://mathscinet.ams.org/mathscinet/msc/msc2020.html
  "extra-mathematics-fields": a({
    10: "Arithmetic;Applied Mathematics;Discrete Mathematics;Linear Algebra",
    15: "Abstract Algebra;Group Theory;Numerical Analysis;Differential Equations;Game Theory;Optimization=Mathematical Optimization=Optimisation",
    30: "Algebraic Geometry;Algebraic Topology;Functional Analysis;Harmonic Analysis;Fourier Analysis;Analytic Number Theory;Algebraic Number Theory;Category Theory;Representation Theory;Ring Theory;Field Theory;Galois Theory;Order Theory;Lattice Theory",
    60: "Commutative Algebra;Homological Algebra;Universal Algebra;Boolean Algebra;Differential Topology;Convex Analysis;Model Theory;Proof Theory;Computability Theory=Recursion Theory;Complexity Theory;Ergodic Theory;Dynamical Systems;Stochastic Processes;Calculus of Variations=Variational Calculus",
    85: "Arithmetic Geometry;Nonstandard Analysis;Geometric Measure Theory;Operator Theory;Spectral Theory;Knot Theory;Geometric Topology;Enumerative Combinatorics;Extremal Combinatorics;Design Theory;Information Theory;Coding Theory;Cryptography;Mathematical Physics;Mathematical Biology;Financial Mathematics;Actuarial Mathematics;Operations Research",
    100: "Tropical Geometry;Noncommutative Geometry;Symplectic Geometry;Contact Geometry;Homotopy Theory;Homology Theory;Model Category Theory;Proof Complexity;Ramsey Theory;Descriptive Set Theory",
  }),
  // WMO official species, varieties, accessory and supplementary formations:
  // https://cloudatlas.wmo.int/en/home.html
  "extra-cloud-formations": a({
    30: "Funnel Cloud=Tuba;Shelf Cloud;Roll Cloud=Volutus;Contrail=Condensation Trail;Pileus=Cap Cloud;Virga;Anvil Cloud=Incus",
    60: "Castellanus;Floccus;Stratiformis;Nebulosus;Fractus;Humilis;Mediocris;Congestus;Calvus;Capillatus;Fibratus;Uncinus;Spissatus",
    85: "Intortus;Vertebratus;Undulatus;Radiatus;Lacunosus;Duplicatus;Translucidus;Perlucidus;Opacus;Velum;Pannus;Flumen;Asperitas;Cavum=Fallstreak Hole;Fluctus=Kelvin-Helmholtz Cloud;Cauda=Tail Cloud;Praecipitatio;Arcus",
    100: "Cataractagenitus;Homogenitus;Homomutatus;Silvagenitus;Pyrocumulonimbus;Banner Cloud;Morning Glory Cloud",
  }),
  // Six missing formal Precambrian periods complete the 22-period chart.
  // https://stratigraphy.org/gssps/
  "extra-geological-periods": a({
    85: "Siderian;Rhyacian;Orosirian;Statherian;Calymmian;Ectasian",
  }),
  // Apparatus names cross-checked against DWK's laboratory-glassware catalog.
  // https://www.dwk.com/life-sciences/laboratory-glassware
  "extra-laboratory-glassware": a({
    15: "Stirring Rod=Glass Rod;Reagent Bottle;Dropper=Pasteur Pipette;Boiling Tube;Culture Tube;Centrifuge Tube",
    30: "Volumetric Pipette;Graduated Pipette;Capillary Tube;Thistle Tube=Thistle Funnel;Addition Funnel=Dropping Funnel;Powder Funnel;Sintered Glass Funnel=Fritted Glass Funnel;Crystallizing Dish=Crystallising Dish;Cuvette;Gas Syringe",
    60: "Distillation Flask=Distilling Flask;Florence Flask=Boiling Flask;Buchner Flask=Filtering Flask=Kitasato Flask;Schlenk Flask;Schlenk Tube;Pear-Shaped Flask;Three-Neck Flask;Gas-Washing Bottle=Drechsel Bottle;Woulff Bottle;Pycnometer=Specific Gravity Bottle;NMR Tube;Thiele Tube",
    85: "Soxhlet Extractor;Dean-Stark Trap;Kipp's Apparatus=Kipp Apparatus;Eudiometer;Liebig Condenser;Allihn Condenser;Graham Condenser;Dimroth Condenser;Claisen Adapter;Vacuum Adapter;Thermometer Adapter;U-Tube;Ostwald Viscometer;Ubbelohde Viscometer",
    100: "Air Condenser;Cold Finger;BOD Bottle;Dropping Bottle;Wash Bottle",
  }),

  "extra-board-games": a({
    10: "Backgammon;Ludo;Snakes and Ladders=Chutes and Ladders;Battleship;Connect Four=Connect 4;Candy Land;The Game of Life=Game of Life;Sorry!;Trouble;Trivial Pursuit;Pictionary",
    15: "Parcheesi;Chinese Checkers;Mahjong=Mahjongg;Dominoes;Reversi=Othello;Stratego;Sequence;Cranium;Blokus;Qwirkle",
    30: "Dixit;Splendor;King of Tokyo;Small World;Power Grid;Puerto Rico;Scythe;Root;Everdell;Viticulture;Concordia;Patchwork;Kingdomino;Alhambra;Takenoko;Mysterium",
    60: "Gloomhaven;Frosthaven;Spirit Island;Betrayal at House on the Hill;Arkham Horror;Eldritch Horror;Dead of Winter;Terra Mystica;Gaia Project;Brass Birmingham;Great Western Trail;Le Havre;Caverna;A Feast for Odin;The Castles of Burgundy;Stone Age;Five Tribes;Santorini;Tsuro",
    85: "Through the Ages;Twilight Struggle;Twilight Imperium;Diplomacy;Hansa Teutonica;Clans of Caledonia;Food Chain Magnate;Orléans=Orleans;Tzolk'in The Mayan Calendar=Tzolkin;El Grande;Tigris and Euphrates;Tikal;Mexica;Inis;Kemet;Cyclades;Blood Rage",
    100: "Barrage;Pax Pamir;Pax Renaissance;Lisboa;Kanban EV;The Gallerist;On Mars;Trickerion;Anachrony",
  }),
  // First-publication dates checked against original-book/library catalogs;
  // works here predate 1900, rather than merely being set in the nineteenth century.
  "extra-nineteenth-century-novels": a({
    15: "Little Women;The Adventures of Tom Sawyer=Tom Sawyer;Adventures of Huckleberry Finn=Huckleberry Finn;Treasure Island;Robinson Crusoe;Gulliver's Travels;A Tale of Two Cities;David Copperfield;The War of the Worlds;The Invisible Man",
    30: "Sense and Sensibility;Emma;Mansfield Park;Northanger Abbey;Persuasion;Bleak House;The Pickwick Papers;Nicholas Nickleby;Hard Times;Little Dorrit;Our Mutual Friend;The Old Curiosity Shop;The Scarlet Letter;The Last of the Mohicans;Uncle Tom's Cabin;Anna Karenina;The Brothers Karamazov;Madame Bovary;The Hunchback of Notre-Dame=Notre-Dame de Paris;Twenty Thousand Leagues Under the Seas=Twenty Thousand Leagues Under the Sea=20000 Leagues Under the Sea;Journey to the Centre of the Earth=Journey to the Center of the Earth;Around the World in Eighty Days=Around the World in 80 Days",
    60: "Barnaby Rudge;Martin Chuzzlewit;Dombey and Son;The Mystery of Edwin Drood;The Prince and the Pauper;A Connecticut Yankee in King Arthur's Court;The Red Badge of Courage;The House of the Seven Gables;Moll Flanders;The Woman in White;The Moonstone;Kidnapped;The Portrait of a Lady;Washington Square;The Awakening;The Mill on the Floss;Silas Marner;Daniel Deronda;Adam Bede;The Mayor of Casterbridge;Tess of the d'Urbervilles;Far from the Madding Crowd;Jude the Obscure;The Return of the Native;Vanity Fair;The Way We Live Now;Barchester Towers;The Warden;The Idiot;Demons=The Devils=The Possessed;Fathers and Sons;Oblomov;Dead Souls",
    85: "Tristram Shandy;Tom Jones;Pamela;Clarissa;Evelina;Cecilia;Camilla;The Castle of Otranto;The Mysteries of Udolpho;The Monk;Vathek;Melmoth the Wanderer;The Bostonians;The American;Sentimental Education;The Red and the Black;The Charterhouse of Parma;Lost Illusions;Père Goriot=Pere Goriot=Old Goriot;Dangerous Liaisons=Les Liaisons Dangereuses;The Mysterious Island;The Island of Doctor Moreau;Captains Courageous;The Light That Failed",
    100: "The Princess of Clèves=La Princesse de Cleves;The Tale of Genji=Genji Monogatari;Dream of the Red Chamber=The Story of the Stone;Journey to the West;Water Margin=Outlaws of the Marsh;Romance of the Three Kingdoms",
  }),
  // Academy's official ceremony archive, through the completed 2026 ceremony.
  // https://www.oscars.org/oscars/ceremonies
  "extra-best-picture-films": a({
    10: "The Silence of the Lambs;Schindler's List;The Sound of Music;Oppenheimer;Everything Everywhere All at Once",
    15: "Braveheart;Dances with Wolves;Rain Man;Platoon;The Departed;No Country for Old Men;Slumdog Millionaire;12 Years a Slave;Green Book;CODA;Nomadland;Anora;One Battle After Another",
    30: "Wings;Gone with the Wind;Casablanca;Rebecca;Hamlet;An American in Paris;From Here to Eternity;On the Waterfront;The Bridge on the River Kwai;Gigi;Ben-Hur;The Apartment;West Side Story;Lawrence of Arabia;Tom Jones;My Fair Lady;A Man for All Seasons;In the Heat of the Night;Oliver!;Midnight Cowboy;Patton;The French Connection;The Godfather Part II=The Godfather Part 2;One Flew Over the Cuckoo's Nest;Annie Hall;The Deer Hunter;Kramer vs. Kramer;Ordinary People;Chariots of Fire;Gandhi;Terms of Endearment;Out of Africa;The Last Emperor;Driving Miss Daisy;Unforgiven;The English Patient;Shakespeare in Love;American Beauty;A Beautiful Mind;Chicago;Million Dollar Baby;Crash;The Hurt Locker",
    60: "All Quiet on the Western Front;The Broadway Melody;Cimarron;Grand Hotel;Cavalcade;It Happened One Night;Mutiny on the Bounty;The Great Ziegfeld;The Life of Emile Zola;You Can't Take It with You;How Green Was My Valley;Mrs. Miniver;Going My Way;The Lost Weekend;The Best Years of Our Lives;Gentleman's Agreement;All the King's Men;All About Eve;The Greatest Show on Earth;Marty;Around the World in 80 Days",
  }),
  // IOC Olympic Studies Centre, Olympic Programme history and completed disciplines.
  // https://library.olympics.com/Default/olympic-games.aspx
  "extra-summer-olympic-sports": a({
    10: "Football=Soccer;Basketball;Tennis;Boxing;Sailing=Yachting;Shooting;Golf",
    15: "Handball;Hockey=Field Hockey;Baseball;Softball;Taekwondo;Triathlon;Modern Pentathlon;Diving;Beach Volleyball",
    30: "Rugby Sevens;Rugby Union;Skateboarding;Surfing;Sport Climbing;Karate;Breaking=Breakdancing;Artistic Swimming=Synchronized Swimming=Synchronised Swimming;Marathon Swimming;Artistic Gymnastics;Rhythmic Gymnastics;Trampoline Gymnastics=Trampolining",
    60: "BMX Racing;BMX Freestyle;Mountain Biking=Mountain Bike;Road Cycling;Track Cycling;Canoe Slalom;Canoe Sprint;Dressage;Eventing;Show Jumping=Equestrian Jumping;Freestyle Wrestling;Greco-Roman Wrestling;Basketball 3x3=3x3 Basketball",
    85: "Cricket;Lacrosse;Polo;Croquet;Tug of War;Basque Pelota;Jeu de Paume=Real Tennis;Rackets=Racquets;Roque;Motorboating=Water Motorsports;Figure Skating;Ice Hockey",
  }),
  // Official Amblin directed-by filmography. Not producer-only credits or shorts.
  // https://amblin.com/movie/spielberg/ ; Disclosure Day verified released in 2026.
  "extra-spielberg-films": a({
    15: "Indiana Jones and the Temple of Doom=Temple of Doom;Indiana Jones and the Last Crusade=Last Crusade;Hook;The Lost World Jurassic Park=The Lost World;War of the Worlds;West Side Story;Ready Player One",
    30: "The Terminal;The Adventures of Tintin=The Adventures of Tintin The Secret of the Unicorn;The BFG;The Post;Empire of the Sun;Indiana Jones and the Kingdom of the Crystal Skull=Kingdom of the Crystal Skull;Disclosure Day",
    60: "Duel;The Sugarland Express=Sugarland Express;1941;Always;Amistad",
    85: "Twilight Zone The Movie",
    100: "Firelight",
  }),
  // Archaeological cultures are not restricted to state-level civilizations.
  // References include original museum collection catalogs: https://www.metmuseum.org/art/collection
  "extra-early-civilizations": a({
    30: "Akkadian Empire=Akkadian Civilization;Elam=Elamite Civilization;Carthage=Carthaginian Civilization;Etruscans=Etruscan Civilization;Achaemenid Empire=Ancient Persia=Persian Civilization;Medes=Median Civilization;Scythians=Scythian Civilization;Celts=Celtic Civilization;Zapotec=Zapotec Civilization;Teotihuacan=Teotihuacan Civilization",
    60: "Urartu=Urartian Civilization;Mitanni;Hurrians;Hattians;Luwians;Lydians;Phrygians;Carians;Nabataeans=Nabataean Civilization;Parthians=Parthian Empire;Sarmatians;Thracians;Dacians;Hallstatt Culture=Hallstatt;La Tène Culture=La Tene Culture=La Tene;Vinča Culture=Vinca Culture=Vinca;Cucuteni-Trypillia Culture=Cucuteni Trypillia;Linear Pottery Culture=LBK;Corded Ware Culture;Bell Beaker Culture;Funnelbeaker Culture",
    85: "Yamnaya Culture;Andronovo Culture;Sintashta Culture;Afanasievo Culture;Bactria-Margiana Archaeological Complex=BMAC=Oxus Civilization;Mehrgarh;Yangshao Culture;Longshan Culture;Hongshan Culture;Liangzhu Culture;Hemudu Culture;Dawenkou Culture;Majiayao Culture;Qijia Culture;Sanxingdui=Sanxingdui Culture;Dong Son Culture=Đông Sơn Culture;Sa Huynh Culture;Dian Culture;Lapita Culture;Yayoi Culture",
    100: "Norte Chico Civilization=Caral-Supe Civilization;Cupisnique Culture;Paracas Culture;Nazca Culture;Tlatilco Culture;Capacha Culture;Adena Culture;Hopewell Tradition=Hopewell Culture;Poverty Point Culture;Dorset Culture;Saqqaq Culture;Tichitt Culture;Kerma Culture;Kingdom of Kush=Kushite Civilization",
  }),
  // Museum artist catalogs: https://www.metmuseum.org/art/collection and
  // https://www.nationalgallery.org.uk/artists
  "extra-renaissance-painters": a({
    30: "Jan van Eyck=Van Eyck;Hieronymus Bosch=Bosch;El Greco=Doménikos Theotokópoulos;Giovanni Bellini;Giotto=Giotto di Bondone;Perugino=Pietro Perugino=Pietro Vannucci;Domenico Ghirlandaio=Ghirlandaio;Filippo Lippi;Filippino Lippi;Correggio=Antonio Allegri;Bronzino=Agnolo Bronzino",
    60: "Andrea del Sarto;Fra Bartolomeo;Pontormo=Jacopo Carucci;Rosso Fiorentino;Parmigianino=Girolamo Francesco Maria Mazzola;Lorenzo Lotto;Sebastiano del Piombo;Vittore Carpaccio=Carpaccio;Antonello da Messina;Gentile Bellini;Jacopo Bellini;Carlo Crivelli;Cosimo Tura;Francesco del Cossa;Ercole de' Roberti;Domenico Veneziano;Benozzo Gozzoli=Gozzoli;Pinturicchio=Bernardino di Betto;Luca Signorelli=Signorelli;Piero di Cosimo",
    85: "Rogier van der Weyden;Hans Memling=Memling;Hugo van der Goes;Robert Campin=Master of Flémalle;Petrus Christus;Dieric Bouts;Gerard David;Joachim Patinir;Quentin Matsys=Quinten Massys;Lucas Cranach the Elder=Cranach;Hans Baldung=Hans Baldung Grien;Albrecht Altdorfer=Altdorfer;Matthias Grünewald=Matthias Grunewald=Grunewald;Lucas van Leyden;Joos van Cleve;Jan Gossaert;Bernard van Orley",
    100: "Sofonisba Anguissola=Anguissola;Lavinia Fontana;Fede Galizia;Catharina van Hemessen;Marietta Robusti;Giovanni Antonio Boltraffio=Boltraffio;Lorenzo di Credi;Andrea del Verrocchio=Verrocchio;Giulio Romano;Giovanni Antonio Bazzi=Il Sodoma;Baldassare Peruzzi=Peruzzi",
  }),
  // Original stage-production records: https://www.ibdb.com/
  "extra-stage-musicals": a({
    10: "The Sound of Music;The Book of Mormon;Annie;Hairspray;Grease;Mamma Mia!;Jesus Christ Superstar",
    15: "Oklahoma!;Carousel;South Pacific;The King and I;My Fair Lady;Guys and Dolls;Oliver!;Peter Pan;Hello Dolly!=Hello Dolly;Funny Girl;The Music Man;Evita;Joseph and the Amazing Technicolor Dreamcoat;Jersey Boys;Matilda the Musical=Matilda;Billy Elliot the Musical=Billy Elliot;The Producers",
    30: "Company;Follies;Sunday in the Park with George;A Little Night Music;Merrily We Roll Along;Kiss Me Kate;Anything Goes;Show Boat;Sunset Boulevard;Starlight Express;Little Shop of Horrors;Avenue Q;Spamalot=Monty Python's Spamalot;The Drowsy Chaperone;Urinetown;The Wiz;In the Heights;Newsies;Waitress;Six;Dear Evan Hansen;Spring Awakening;Next to Normal;Kinky Boots;Beetlejuice",
    60: "She Loves Me;Promises Promises;A Funny Thing Happened on the Way to the Forum;Assassins;Passion;Pacific Overtures;Anyone Can Whistle;Once on This Island;Once;The 25th Annual Putnam County Spelling Bee=Spelling Bee;Falsettos;Parade;Ragtime;The Secret Garden;The Scarlet Pimpernel;Chess;The Band's Visit;A Strange Loop;Beautiful The Carole King Musical=Beautiful;School of Rock",
    85: "Kiss of the Spider Woman;Titanic;42nd Street;Crazy for You;On the Town;On Your Toes;Damn Yankees;Sweet Charity;Applause;Barnum;Nine;The Will Rogers Follies;City of Angels;Grand Hotel;The Light in the Piazza;Fun Home;Kimberly Akimbo;A Gentleman's Guide to Love and Murder",
  }),
  "extra-fictional-detectives": a({
    10: "Batman=Bruce Wayne;Scooby-Doo;Columbo=Lieutenant Columbo;Inspector Gadget;Benoit Blanc",
    15: "Velma Dinkley;Fred Jones;Daphne Blake;Shaggy Rogers;Frank Hardy;Joe Hardy;Encyclopedia Brown=Leroy Brown;Tintin;Dick Tracy;Thomas Magnum=Magnum;Jim Rockford;Jessica Jones",
    30: "Father Brown;Brother Cadfael=Cadfael;Endeavour Morse=Inspector Morse;Robert Lewis=Inspector Lewis;John Rebus=Rebus;Adam Dalgliesh;Roderick Alleyn;Albert Campion;Shawn Spencer;Burton Guster=Gus;Richard Castle;Kate Beckett;Patrick Jane;Teresa Lisbon;Dana Scully;Fox Mulder;Dale Cooper;Perry Mason",
    60: "Cormoran Strike;Robin Ellacott;Jack Reacher;Alex Cross;Lincoln Rhyme;Amelia Sachs;Kay Scarpetta;Temperance Brennan;Vera Stanhope;Jimmy Perez;Lisbeth Salander;Mikael Blomkvist;Nick Charles;Nora Charles;Ellery Queen;Philo Vance;Maud Silver=Miss Silver;John Thorndyke=Dr Thorndyke;Remington Steele;Laura Holt",
    85: "Travis McGee;Lew Archer;Spenser;V. I. Warshawski=VI Warshawski;Easy Rawlins;Charlie Chan;Nero Wolfe;Archie Goodwin;Gideon Fell;Sir Henry Merrivale=Henry Merrivale;Flavia de Luce;Precious Ramotswe=Mma Ramotswe",
  }),

  "extra-texture-adjectives": a({
    10: "Shiny;Glossy;Dull;Wet;Dry;Fluffy;Hairy;Prickly;Spiky;Oily;Greasy",
    15: "Matte=Matt;Satiny;Leathery;Rubbery;Spongy;Waxy;Dusty;Sandy;Powdery;Chalky;Crumbly;Crisp;Crunchy;Squishy;Springy;Stretchy;Rigid;Supple",
    30: "Downy;Woolly=Wooly;Bristly;Knobbly;Knobby;Crinkly;Wrinkled;Scaly;Flaky=Flakey;Brittle;Taut;Elastic;Soapy;Gooey;Tacky;Abrasive;Granular;Pitted;Pebbled;Porous;Serrated;Woven;Knitted;Quilted;Plush;Tufted",
    60: "Filmy;Gossamer;Feathery;Gelatinous;Glutinous;Corrugated;Ridged;Grooved;Dimpled;Furrowed;Striated;Puckered;Crumpled;Cracked;Crazed;Faceted;Nubby;Corded;Felted;Flocked",
    85: "Lustrous;Satin-smooth;Rugose;Scabrous;Verrucose;Papery;Coriaceous;Tessellated;Reticulated;Laminated",
  }),
  "extra-movement-verbs": a({
    10: "Hop;Skip;Leap;Jog;Roll;Turn;Bend;Stretch;Stand;Sit;Kick;Punch;Wave;Nod;Shake;Clap",
    15: "Bound;Trot;Gallop;Limp;March;Stroll;Stride;Pace;Wander;Sneak;Tiptoe;Stumble;Tumble;Spin;Twirl;Squat;Kneel;Crouch;Lean;Reach;Shrug;Stamp;Stomp;Dive;Wade;Paddle;Skate;Ski;Surf;Float",
    30: "Amble;Meander;Ramble;Roam;Scamper;Scurry;Scuttle;Scramble;Trudge;Plod;Stagger;Totter;Teeter;Lurch;Reel;Whirl;Pivot;Rotate;Cartwheel;Backflip;Flip;Recline;Flex;Sway;Rock;Bob;Soar;Hover;Flutter;Flap;Hurtle;Dash;Dart;Zip;Zoom;Whiz=Whizz;Wriggle;Wiggle;Squirm;Writhe",
    60: "Undulate;Slump;Slouch;Sidle;Slink;Skulk;Canter;Lope;Prance;Gambol;Caper;Vault;Hurdle;Abseil;Rappel;Rove;Mosey;Prowl;Lumber;Clamber;Haul;Heave;Lunge;Thrust;Duck;Dodge;Weave;Fidget;Flinch;Recoil",
    85: "Perambulate;Ambulate;Circumambulate;Sashay;Chassé=Chasse;Pirouette;Gesticulate;Genuflect;Prostrate;Oscillate;Flounce;Scud;Traipse;Frolic",
  }),
  "extra-emotion-words": a({
    10: "Excitement;Delight;Worry;Boredom;Loneliness;Hate;Relief;Hope;Regret",
    15: "Contentment;Satisfaction;Amusement;Elation;Bliss;Calm;Peace;Gratitude;Affection;Fondness;Desire;Longing;Nostalgia;Homesickness;Sorrow;Grief;Despair;Disappointment;Embarrassment;Frustration;Irritation;Annoyance;Rage;Panic;Terror;Nervousness",
    30: "Ecstasy;Euphoria;Serenity;Tranquility=Tranquillity;Optimism;Appreciation;Awe;Wonder;Admiration;Yearning;Melancholy;Dejection;Remorse;Humiliation;Resentment;Bitterness;Fury;Wrath;Outrage;Hatred;Loathing;Revulsion;Contempt;Disdain;Horror;Dread;Alarm;Apprehension;Unease;Distress;Anguish;Desolation;Alienation;Emptiness;Apathy;Indifference",
    60: "Curiosity;Interest;Anticipation;Trust;Distrust;Suspicion;Doubt;Insecurity;Confidence;Vulnerability;Determination;Exasperation;Disquiet;Trepidation;Discomfiture;Chagrin;Mortification;Disillusionment;Amazement;Bewilderment;Disorientation;Incredulity;Tenderness;Compassion;Empathy;Pity;Sympathy",
    85: "Weltschmerz;Saudade;Limerence;Angst;Spleen;Rapture;Jubilation;Exultation;Beatitude;Dysphoria;Disconsolation",
  }),
  "extra-two-dimensional-shapes": a({
    15: "Semicircle;Star;Heart=Heart Shape;Arrow=Arrow Shape;Cross=Cross Shape;Quarter Circle=Quadrant;Quadrilateral;Heptagon=Septagon;Nonagon=Enneagon;Decagon;Dodecagon;Disk=Disc",
    30: "Equilateral Triangle;Isosceles Triangle;Scalene Triangle;Right Triangle=Right-Angled Triangle;Acute Triangle;Obtuse Triangle;Isosceles Trapezoid;Right Trapezoid;Trapezium;Hendecagon=Undecagon;Hexadecagon;Icosagon;Circular Sector=Sector;Circular Segment;Lens;Lune;Pentagram;Hexagram;Cardioid",
    60: "Tridecagon;Tetradecagon;Pentadecagon;Heptadecagon;Octadecagon;Enneadecagon;Triacontagon;Hectogon;Chiliagon;Myriagon;Heptagram;Octagram;Nonagram;Decagram;Dodecagram;Vesica Piscis;Lemniscate;Astroid;Deltoid;Nephroid;Rose Curve=Rhodonea Curve",
    85: "Epicycloid;Hypocycloid;Epitrochoid;Hypotrochoid;Reuleaux Pentagon;Reuleaux Heptagon;Rounded Rectangle;Squircle;Superellipse;Salinon;Arbelos",
  }),
  // English dictionary editorial list of traditional collectives:
  // https://www.collinsdictionary.com/us/word-lists/animal-collective-nouns
  "extra-animal-collectives": a({
    15: "Drove=Drove of Cattle;Shoal=Shoal of Fish;Troop=Troop of Monkeys;Brood=Brood of Chicks;Litter=Litter of Puppies;Team=Team of Oxen;Nest=Nest of Rabbits;Flight=Flight of Birds;Cloud=Cloud of Gnats",
    30: "Covey=Covey of Partridges;Bevy=Bevy of Quail;Charm=Charm of Goldfinches;Murmuration=Murmuration of Starlings;Skein=Skein of Geese;Stud=Stud of Mares;Yoke=Yoke of Oxen;String=String of Racehorses;Field=Field of Racehorses;Host=Host of Sparrows;Tribe=Tribe of Goats;Gang=Gang of Elk",
    60: "Cete=Cete of Badgers;Sounder=Sounder of Boars;Kindle=Kindle of Kittens;Cast=Cast of Hawks;Exaltation=Exaltation of Larks;Watch=Watch of Nightingales;Leap=Leap of Leopards;Sloth=Sloth of Bears;Unkindness=Unkindness of Ravens;Chattering=Chattering of Choughs;Sedge=Sedge of Cranes;Siege=Siege of Herons;Husk=Husk of Hares;Gam=Gam of Whales;Rout=Rout of Wolves",
    85: "Dule=Dule of Doves;Grist=Grist of Bees;Volery=Volery of Birds;Brace=Brace of Bucks;Lease=Lease of Bucks;Richesse=Richesse of Martens;Labour=Labour of Moles;Muster=Muster of Peacocks;Nide=Nide of Pheasants;Wisp=Wisp of Snipe;Fall=Fall of Woodcocks;Paddling=Paddling of Ducks;Building=Building of Rooks;Clamour=Clamour of Rooks",
  }),
  "extra-building-types": a({
    10: "Hotel;Restaurant;Shop=Store;Bank;Prison;Garage;Barn;Hut;Tower;Theatre=Theater;Cinema;Town Hall;Police Station;Fire Station;Post Office",
    15: "Cottage;Cabin;Mansion;Apartment Building=Apartment Block;Townhouse;Terraced House=Row House;Detached House;Semi-detached House;Duplex;Villa;Chalet;Inn;Motel;Hostel;Cafe=Café;Supermarket;Shopping Mall=Mall;Gymnasium;Arena;Stadium;Courthouse;Chapel;Shrine;Lighthouse;Watchtower;Gatehouse;Fort;Fortress",
    30: "Manor House;Tenement;Triplex;Shack;Hovel;Yurt;Igloo;Tipi=Teepee;Wigwam;Longhouse;Stilt House;Treehouse;Windmill;Watermill;Stable;Cowshed;Pigsty;Chicken Coop;Silo;Granary;Hangar;Shed;Greenhouse;Conservatory;Orangery;Pagoda;Monastery;Convent;Abbey;Basilica;Mausoleum;Concert Hall;Opera House;Auditorium;Bakery;Brewery;Distillery;Mill;Power Station=Power Plant;Jail;Barracks;Armory=Armoury;Citadel;Keep;Guardhouse;Clock Tower;Bell Tower",
    85: "Byre;Bothy;Roundhouse;Rotunda;Ziggurat;Stepwell;Caravanserai;Pavilion;Belvedere;Gazebo;Folly;Dovecote;Icehouse;Smokehouse;Bathhouse;Boathouse;Blockhouse",
  }),
  // Meteorological terms: https://www.weather.gov/bgm/glossary
  "extra-weather-words": a({
    10: "Thunderstorm;Rainbow;Heat Wave;Cold Snap=Cold Wave;Drought;Snowstorm;Rainstorm;Dust Storm;Sandstorm;Cyclone",
    15: "Freezing Rain;Freezing Drizzle;Snow Shower;Rain Shower;Snow Squall;Squall;Whiteout;Black Ice;Hoarfrost;Rime=Rime Ice;Funnel Cloud;Waterspout;Dust Devil;Monsoon;Sea Breeze;Land Breeze;Haze;Cloudburst;Sunshower",
    30: "Snow Grains;Ice Crystals;Diamond Dust;Thundersnow;Haboob;Landspout;Derecho;Downburst;Microburst;Macroburst;Radiation Fog;Advection Fog;Upslope Fog;Ice Fog;Freezing Fog;Sea Smoke=Steam Fog=Frost Smoke;Virga;Moonbow;Fogbow;Halo=Solar Halo;Sun Dog=Parhelion;Light Pillar;Mirage;Fata Morgana",
    60: "Katabatic Wind;Anabatic Wind;Foehn=Föhn;Chinook;Mistral;Bora;Sirocco;Harmattan;Santa Ana Wind;Trade Wind;Jet Stream;Polar Vortex;Tropical Storm;Tropical Depression;Extratropical Cyclone;Supercell;Gust Front;Gustnado;Ball Lightning;St Elmo's Fire=Saint Elmo's Fire",
    85: "Circumhorizontal Arc;Circumzenithal Arc;Glory;Brocken Spectre=Brocken Specter;Green Flash;Crepuscular Rays;Anticrepuscular Rays",
  }),
  "extra-beauty-adjectives": a({
    10: "Cute;Adorable;Good-looking;Glamorous;Dazzling;Radiant;Appealing;Charming;Delightful;Graceful",
    15: "Alluring;Fetching;Enchanting;Captivating;Beguiling;Bewitching;Winsome;Pleasing;Picturesque;Scenic;Idyllic;Sublime;Splendid;Magnificent;Glorious;Superb;Divine;Angelic;Heavenly;Dainty;Breathtaking;Striking;Eye-catching;Becoming;Flattering;Dreamy;Shapely",
    60: "Prepossessing;Sightly;Splendiferous;Junoesque;Dapper;Classy;Chic;Stylish;Fabulous;Marvellous=Marvelous;Sensational;Svelte;Lissome=Lissom;Aesthetic=Esthetic",
    85: "Seraphic",
  }),
  // CSS named blues are standardized by W3C; additional established pigment,
  // institutional and traditional color names are common named blue shades.
  // https://www.w3.org/TR/css-color-4/#named-colors
  "extra-blue-shades": a({
    10: "Light Blue;Dark Blue;Royal Blue;Baby Blue;Cyan=Aqua;Blue-Green;Blue-Violet",
    15: "Powder Blue;Midnight Blue;Ice Blue;Denim;Robin's Egg Blue;Duck Egg Blue;Tiffany Blue;Cadet Blue;Slate Blue;Blue-Gray=Blue-Grey",
    30: "Alice Blue;Light Sky Blue;Deep Sky Blue;Dodger Blue;Medium Blue;Light Steel Blue;Medium Slate Blue;Dark Slate Blue;Light Cyan;Dark Cyan;Dark Turquoise;Medium Turquoise;Pale Turquoise;Medium Aquamarine;Light Sea Green;Columbia Blue;Air Force Blue;Oxford Blue;Yale Blue;Delft Blue",
    60: "Egyptian Blue;Han Blue;Maya Blue;Persian Blue;Marian Blue;International Klein Blue=Klein Blue;Pacific Blue;Bondi Blue;Lapis Blue;Phthalo Blue=Phthalocyanine Blue;Indanthrone Blue;French Blue;True Blue;Celestial Blue;Cerulean Frost;Carolina Blue;Bleu de France;Glaucous",
    85: "Air Superiority Blue;Brandeis Blue;Byzantine Blue;Cerulean Blue;Duke Blue;Federal Blue;Honolulu Blue;Resolution Blue;Savoy Blue;St Patrick's Blue;Tufts Blue;UCLA Blue;YInMn Blue=Mas Blue;Zaffre;Bice Blue;Smalt",
  }),
};
