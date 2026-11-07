import type { Answer, Score } from "../types";

// Original additions to Geography, Nature, and Food prompts. These are factual
// names, with editorial familiarity scores rather than measured popularity.
// Finite lists were checked against IOC host records and ASM Mammal Diversity
// Database v2.5 orders. Grain coverage uses FAO's cereal and millet references.
// https://www.olympics.com/ioc/faq/electing-olympic-hosts/how-many-cities-and-countries-have-hosted-the-olympic-games
// https://www.mammaldiversity.org/order/
// https://www.fao.org/millets-2023/about/
// https://www.fao.org/4/w1808e/w1808e0k.htm
function bank(tiers: Partial<Record<Score, string>>): Answer[] {
  return Object.entries(tiers).flatMap(([score, names]) =>
    names!.split(";").map((entry) => {
      const [name, ...aliases] = entry.split("=").map((part) => part.trim());
      return {
        name,
        score: Number(score) as Score,
        ...(aliases.length ? { aliases } : {}),
      };
    }),
  );
}

export const worldExpandedAnswers: Record<string, Answer[]> = {
  "extra-deserts": bank({
    30: "Great Basin Desert;Colorado Desert;Libyan Desert;Nubian Desert;Eastern Desert",
    60: "Karakum=Kara Kum;Kyzylkum=Kyzyl Kum;Dasht-e Lut=Lut Desert;Dasht-e Kavir=Kavir Desert;Danakil Desert;Chalbi Desert;Sechura Desert;Great Salt Lake Desert;Painted Desert;Black Rock Desert;Alvord Desert;Owyhee Desert",
    85: "Cholistan Desert;Thal Desert;Registan Desert;Dasht-e Margo;Bayuda Desert;Nyiri Desert;Ordos Desert;Mu Us Desert;Tengger Desert;Badain Jaran Desert;Gurbantunggut Desert;Kumtag Desert;Alashan Desert;Ryn Desert",
    100: "Betpak-Dala;Muyunkum Desert;Ulan Buh Desert;La Guajira Desert;Monte Desert;Richtersveld",
  }),
  "extra-rivers": bank({
    10: "Seine;Congo=Congo River",
    30: "Loire;Rhone=Rhône;Po=Po River;Douro;Tagus;Ebro;Elbe;Vistula;Niger;Missouri;Colorado=Colorado River;Columbia=Columbia River;Ohio=Ohio River;Rio Grande;Yukon;Saint Lawrence=St Lawrence River",
    60: "Oder;Dnieper=Dnipro;Don=Don River;Ural=Ural River;Ob=Ob River;Yenisei;Amur;Pearl River=Zhu Jiang;Irrawaddy=Ayeyarwady;Brahmaputra;Godavari;Krishna=Krishna River;Murray=Murray River;Darling=Darling River;Senegal=Senegal River;Orange=Orange River;Limpopo;Snake=Snake River;Tennessee=Tennessee River;Mackenzie=Mackenzie River;Fraser=Fraser River;Parana=Paraná;Paraguay=Paraguay River;Uruguay=Uruguay River",
    85: "Salween=Thanlwin;Narmada;Tocantins;Sao Francisco=São Francisco;Madeira;Negro=Rio Negro;Tapajos=Tapajós;Xingu;Araguaia;Vaal;Okavango;Volta;Ogooue=Ogooué;Rufiji",
    100: "Essequibo;Maroni;Sutlej;Chenab;Jhelum;Yamuna;Teesta;Tungabhadra",
  }),
  "extra-mountain-ranges": bank({
    30: "Alaska Range;Brooks Range;Cascade Range=Cascades;Great Dividing Range;Southern Alps;Sierra Madre Occidental;Sierra Madre Oriental;Western Ghats;Eastern Ghats;Scandinavian Mountains",
    60: "Australian Alps;Flinders Ranges;MacDonnell Ranges;Vindhya Range=Vindhyas;Satpura Range;Aravalli Range;Zagros Mountains=Zagros;Alborz=Elburz;Taurus Mountains=Taurus;Pontic Mountains;Kunlun Mountains=Kunlun;Pamir Mountains=Pamirs;Altai Mountains=Altai;Dinaric Alps;Balkan Mountains;Rhodope Mountains;Pindus;Grampians;Black Forest;Harz;Vosges;Jura Mountains=Jura",
    85: "Sayan Mountains;Verkhoyansk Range;Chersky Range;Stanovoy Range;Massif Central;Tatra Mountains=Tatras;Ore Mountains=Erzgebirge;Sudetes;Cantabrian Mountains;Sierra Morena;Sierra Madre del Sur;Ruwenzori Mountains=Rwenzori Mountains",
    100: "Ahaggar Mountains=Hoggar Mountains;Tibesti Mountains;Ennedi Massif;Nuba Mountains;Simien Mountains;Bale Mountains",
  }),
  "extra-seas": bank({
    30: "North Sea;Norwegian Sea;Barents Sea;Sea of Japan=East Sea;Sea of Okhotsk;East China Sea;South China Sea;Yellow Sea;Philippine Sea;Andaman Sea",
    60: "Greenland Sea;Labrador Sea;Irminger Sea;White Sea;Bothnian Sea;Java Sea;Banda Sea;Arafura Sea;Timor Sea;Bali Sea;Flores Sea;Savu Sea;Celebes Sea=Sulawesi Sea;Sulu Sea;Bohol Sea=Mindanao Sea;Visayan Sea;Sibuyan Sea;Laccadive Sea=Lakshadweep Sea;Ligurian Sea;Tyrrhenian Sea;Ionian Sea;Alboran Sea;Balearic Sea;Libyan Sea;Levantine Sea;Sea of Marmara=Marmara Sea;Sea of Azov=Azov Sea",
    85: "Laptev Sea;Kara Sea;East Siberian Sea;Lincoln Sea;Wandel Sea;Scotia Sea;Bellingshausen Sea;Amundsen Sea;Davis Sea",
    100: "Mawson Sea;Dumont d Urville Sea=Dumont d’Urville Sea;Riiser-Larsen Sea",
  }),
  "extra-mediterranean-islands": bank({
    30: "Gozo;Comino;Capri;Ischia;Procida;Kos;Naxos;Paros;Mykonos;Euboea=Evia;Djerba;Hvar;Brac=Brač;Korcula=Korčula",
    60: "Lampedusa;Pantelleria;Lipari;Vulcano;Stromboli;Salina;Ustica;Favignana;Ponza;Ventotene;Giglio;Capraia;Gorgona;Montecristo;Pianosa;Asinara;La Maddalena;Caprera;San Pietro;Sant Antioco=Sant’Antioco;Thasos;Samothrace;Lemnos;Ikaria;Samos;Patmos;Nisyros;Kalymnos;Leros;Karpathos;Kastellorizo;Tinos;Andros;Syros;Milos;Ios;Amorgos;Skiathos;Skopelos;Alonissos;Lefkada;Kefalonia=Cephalonia;Zakynthos=Zante;Ithaca;Kythira;Paxos",
    85: "Panarea;Filicudi;Alicudi;Levanzo;Marettimo;Folegandros;Krk;Cres;Vis;Pag;Rab;Losinj=Lošinj;Mljet;Lastovo",
    100: "Susak;Silba;Olib;Ist;Molat;Dugi Otok;Kornat;Sipan=Šipan",
  }),
  "extra-waterfalls": bank({
    30: "Havasu Falls;Bridalveil Fall=Bridalveil Fall Yosemite;Dudhsagar Falls;Huangguoshu Waterfall=Huangguoshu Falls;Murchison Falls;Ouzoud Falls",
    60: "Khone Phapheng Falls;Ban Gioc-Detian Falls=Ban Gioc Falls=Detian Falls;Krimml Waterfalls=Krimml Falls;Staubbach Falls;Trummelbach Falls=Trümmelbach Falls;Giessbach Falls;Reichenbach Falls;Gocta Cataracts=Gocta Falls;La Fortuna Waterfall;Nauyaca Falls;Agua Azul;Basaseachi Falls=Cascada de Basaseachi;Voringfossen=Vøringsfossen;Langfossen;Latefossen=Låtefossen;Hukou Waterfall;Athirappilly Falls;Courtallam Falls",
    85: "Mardalsfossen;Seven Sisters Waterfall=Seven Sisters Geiranger;Kalambo Falls;Lumangwe Falls;Epupa Falls;Catarata del Toro;Cuquenan Falls=Kukenan Falls;Hanakapiai Falls=Hanakāpīʻai Falls;Akaka Falls=ʻAkaka Falls;Wailua Falls;Takakkaw Falls;Helmcken Falls;Della Falls;Montmorency Falls;Kakabeka Falls",
    100: "Nohkalikai Falls;Nohsngithiang Falls;Langshiang Falls;Shiraito Falls;Kegon Falls;Nachi Falls;Fukuroda Falls;Barron Falls",
  }),
  "extra-star-flags": bank({
    30: "Algeria;Azerbaijan;Burkina Faso;Burundi;Cameroon;Cabo Verde=Cape Verde;Central African Republic;Comoros;Democratic Republic of the Congo=DR Congo=DRC;Djibouti;Ethiopia;Honduras;Israel;Jordan;Liberia;Libya;Malaysia;North Korea;Philippines;Tunisia;Venezuela",
    60: "Dominica;Grenada;Guinea-Bissau;Marshall Islands;Mauritania;Micronesia=Federated States of Micronesia;Mozambique;Nauru;Papua New Guinea;Samoa;Sao Tome and Principe=São Tomé and Príncipe;Solomon Islands;South Sudan;Tajikistan;Togo;Turkmenistan;Tuvalu;Uzbekistan;Saint Kitts and Nevis=St Kitts and Nevis;Timor-Leste=East Timor;Suriname",
    85: "Bosnia and Herzegovina;Croatia;Slovenia;Equatorial Guinea",
  }),
  "extra-summer-host-cities": bank({
    30: "Berlin;Rio de Janeiro=Rio",
    60: "Stockholm;Amsterdam;Helsinki",
    85: "Antwerp=Antwerpen;Saint Louis=St Louis",
  }),
  "extra-volcanoes": bank({
    30: "Mount Kilimanjaro=Kilimanjaro;Mount Kenya;Mount Elbrus=Elbrus;Mount Ararat=Ararat;Mount Teide=Teide;Mount Damavand=Damavand;Mayon;Taal;Mount Merapi=Merapi;Mount Agung=Agung;Mount Bromo=Bromo",
    60: "Mount Kazbek=Kazbek;Mount Pico=Pico;Mont Pelee=Mont Pelée;Soufriere Hills=Soufrière Hills;Iztaccihuatl=Iztaccíhuatl;Nevado del Ruiz;Galeras;Tungurahua;Chimborazo;Sangay;Villarrica;Osorno;Lanin=Lanín;Licancabur;Ojos del Salado;Lascar;Llaima;Puyehue;Calbuco;Pacaya;Fuego;Acatenango;Santa Maria=Santa María;Kanlaon;Semeru;Rinjani;Sinabung;Mount Toba=Toba;Erta Ale;Ol Doinyo Lengai;Nyamuragira",
    85: "Kelud;Shiveluch;Klyuchevskoy=Klyuchevskaya Sopka;Karymsky;Avachinsky;Koryaksky;Bezymianny;Tolbachik;Askja;Bardarbunga=Bárðarbunga;Grimsvotn=Grímsvötn;Katla;Surtsey;Fagradalsfjall",
    100: "Ardoukoba;Dabbahu;Aluto;Ol Doinyo Eburru;Mount Longonot;Suswa",
  }),

  "extra-garden-flowers": bank({
    10: "Lily;Orchid;Poppy;Lavender;Iris",
    30: "Carnation;Chrysanthemum;Begonia;Impatiens;Pansy;Viola;Verbena;Snapdragon;Stock;Sweet Pea;Sweet William;Cornflower;Calendula;Lobelia;Nasturtium;Alyssum;Daylily;Gladiolus;Freesia;Crocus;Snowdrop;Hyacinth;Anemone;Hellebore;Camellia;Gardenia;Azalea;Rhododendron;Wisteria;Bougainvillea;Hibiscus;Fuchsia;Lantana",
    60: "Salvia;Penstemon;Geum;Coreopsis;Echinacea=Coneflower;Rudbeckia=Black-Eyed Susan;Gaillardia=Blanket Flower;Achillea=Yarrow;Pelargonium;Verbascum=Mullein;Scabiosa=Pincushion Flower;Agapanthus;Alstroemeria;Astrantia;Campanula=Bellflower;Nigella=Love-in-a-Mist",
    85: "Aquilegia=Columbine;Helenium;Kniphofia=Red Hot Poker;Crocosmia;Monarda=Bee Balm;Heuchera=Coral Bells",
    100: "Eryngium=Sea Holly;Echinops=Globe Thistle;Ammi;Cerinthe",
  }),
  "extra-dinosaur-genera": bank({
    30: "Apatosaurus;Brontosaurus;Argentinosaurus;Camarasaurus;Edmontosaurus;Protoceratops;Styracosaurus;Coelophysis;Compsognathus;Dilophosaurus;Ceratosaurus;Megalosaurus;Giganotosaurus;Baryonyx;Oviraptor;Gallimimus;Ornithomimus;Utahraptor;Kentrosaurus",
    60: "Supersaurus;Patagotitan;Dreadnoughtus;Saltasaurus;Alamosaurus;Mamenchisaurus;Shunosaurus;Amargasaurus;Nigersaurus;Ouranosaurus;Maiasaura;Corythosaurus;Lambeosaurus;Tsintaosaurus;Saurolophus;Olorotitan;Shantungosaurus;Centrosaurus;Pachyrhinosaurus;Chasmosaurus;Pentaceratops;Dromaeosaurus;Citipati;Anzu;Gigantoraptor;Struthiomimus;Deinocheirus;Torvosaurus;Carcharodontosaurus;Acrocanthosaurus;Tarbosaurus;Albertosaurus;Gorgosaurus;Daspletosaurus;Yutyrannus;Guanlong;Irritator;Suchomimus;Sinosauropteryx;Sinornithosaurus",
    85: "Kosmoceratops;Diabloceratops;Nasutoceratops;Austroraptor;Bambiraptor;Segnosaurus;Nothronychus;Alxasaurus;Chungkingosaurus;Huayangosaurus;Tuojiangosaurus;Euoplocephalus;Saichania;Tarchia;Borealopelta;Sauropelta;Gastonia;Nodosaurus;Minmi;Scelidosaurus",
    100: "Hypsilophodon;Lesothosaurus;Heterodontosaurus;Psittacosaurus;Eoraptor;Herrerasaurus;Plateosaurus;Massospondylus",
  }),
  "extra-cetaceans": bank({
    30: "Common Dolphin=Short-Beaked Common Dolphin;Harbour Porpoise=Harbor Porpoise;Rissos Dolphin=Risso’s Dolphin;False Killer Whale;Long-Finned Pilot Whale;Short-Finned Pilot Whale",
    60: "Antarctic Minke Whale;Sei Whale;Brydes Whale=Bryde’s Whale;Omuras Whale=Omura’s Whale;Pygmy Right Whale;Southern Right Whale;North Pacific Right Whale;Hectors Dolphin=Hector’s Dolphin;Commersons Dolphin=Commerson’s Dolphin;Heavisides Dolphin=Heaviside’s Dolphin;Peales Dolphin=Peale’s Dolphin;Chilean Dolphin;Australian Snubfin Dolphin;Irrawaddy Dolphin;Pygmy Killer Whale;Melon-Headed Whale;Rough-Toothed Dolphin;Striped Dolphin;Pantropical Spotted Dolphin;Atlantic Spotted Dolphin;Frasers Dolphin=Fraser’s Dolphin;Clymene Dolphin;Atlantic White-Sided Dolphin;Pacific White-Sided Dolphin;White-Beaked Dolphin;Tucuxi;Guiana Dolphin;Ganges River Dolphin;Indus River Dolphin;La Plata Dolphin=Franciscana",
    85: "Northern Right Whale Dolphin;Southern Right Whale Dolphin;Dalls Porpoise=Dall’s Porpoise;Burmeisters Porpoise=Burmeister’s Porpoise;Spectacled Porpoise;Indo-Pacific Finless Porpoise;Yangtze Finless Porpoise=Neophocaena asiaeorientalis;East Asian Finless Porpoise=Neophocaena sunameri;Cuviers Beaked Whale=Cuvier’s Beaked Whale;Blainvilles Beaked Whale=Blainville’s Beaked Whale;Gervais Beaked Whale=Gervais’ Beaked Whale=Gervais’s Beaked Whale=Mesoplodon europaeus;Trues Beaked Whale=True’s Beaked Whale;Bairds Beaked Whale=Baird’s Beaked Whale;Arnouxs Beaked Whale=Arnoux’s Beaked Whale",
    100: "Rices Whale=Rice’s Whale;Sowerbys Beaked Whale=Sowerby’s Beaked Whale;Longmans Beaked Whale=Longman’s Beaked Whale;Shepherds Beaked Whale=Shepherd’s Beaked Whale;Pygmy Beaked Whale;Spade-Toothed Whale",
  }),
  "extra-marine-invertebrates": bank({
    10: "Crab;Lobster;Shrimp;Prawn",
    30: "Krill;Scallop;Limpet;Abalone;Barnacle;Sand Dollar;Sea Slug;Sea Hare;Conch;Cockle;Whelk;Periwinkle;Cowrie",
    60: "Copepod;Amphipod;Isopod;Tunicate=Sea Squirt;Salp;Comb Jelly=Ctenophore;Sea Gooseberry;Sea Butterfly=Pteropod;Sea Angel;Nudibranch;Chiton;Geoduck;Razor Clam;Cone Snail;Horseshoe Crab;Peanut Worm;Christmas Tree Worm;Bobbit Worm;Ribbon Worm;Arrow Worm;Acorn Worm;Feather Star;Basket Star;Sea Biscuit",
    85: "Bryozoan;Sea Pen;Sea Pansy;Sea Whip;Fire Coral;Portuguese Man o War=Portuguese Man-of-War;Blue Dragon=Glaucus atlanticus;Squat Lobster;Mantis Shrimp;Pistol Shrimp",
    100: "Venus Flower Basket=Venus’ Flower Basket;Glass Sponge;Brachiopod;Lingula;Spoon Worm",
  }),
  "extra-freshwater-fish": bank({
    30: "Atlantic Salmon;Sockeye Salmon;Chinook Salmon=King Salmon;Coho Salmon=Silver Salmon;Chum Salmon;Pink Salmon;Cutthroat Trout;Lake Trout;Smallmouth Bass;Yellow Perch;Walleye;Black Crappie;White Crappie;Blue Catfish;Flathead Catfish;American Eel;European Eel",
    60: "Bull Trout;Arctic Grayling;European Grayling;Dolly Varden;White Sturgeon;Green Sturgeon;Atlantic Sturgeon;Lake Sturgeon;American Paddlefish=Paddlefish;Alligator Gar;Longnose Gar;Shortnose Gar;Bowfin;Spotted Bass;White Bass;Striped Bass;Yellow Bass;Sauger;Pumpkinseed;Redear Sunfish;Green Sunfish;Warmouth;Yellow Bullhead;Brown Bullhead;Black Bullhead;Common Roach;Common Rudd=Rudd;Common Bream;Silver Bream;European Chub;Common Barbel=Barbel;Common Dace=Dace;Ide=Orfe;European Bitterling",
    85: "Nile Tilapia;Mozambique Tilapia;Blue Tilapia;Siamese Fighting Fish=Betta;Guppy;Neon Tetra;Discus;Common Angelfish=Freshwater Angelfish;Oscar;Arapaima;Pacu;Piranha;Electric Eel",
    100: "Ropefish;African Butterflyfish;Clown Loach;Kuhli Loach;Zebra Danio;Celestial Pearl Danio;Cherry Barb;Giant Gourami",
  }),
  "extra-farm-animals": bank({
    30: "Rabbit;Pigeon=Rock Dove;Japanese Quail=Quail;Helmeted Guineafowl=Guineafowl;Common Pheasant=Pheasant;Common Ostrich=Ostrich;Emu;Dromedary Camel=Dromedary;Bactrian Camel;Reindeer;American Bison=Bison;Guinea Pig",
    60: "Greater Rhea=Rhea;Fallow Deer;Red Deer;Common Carp=Carp;Rainbow Trout;Atlantic Salmon;Nile Tilapia=Tilapia;Channel Catfish;Pacific White Shrimp=Whiteleg Shrimp;Giant Tiger Prawn;Pacific Oyster;Blue Mussel;Red Swamp Crayfish",
    85: "Black Soldier Fly;Mealworm;House Cricket;Giant African Land Snail;Tench;European Sea Bass;Gilthead Seabream;Milkfish;Cobia",
    100: "Abalone;Sea Cucumber;Giant Freshwater Prawn;Yabbie=Yabby;Mithun=Gayal",
  }),
  "extra-mammal-orders": bank({
    // FWS also recognizes Cetacea as an order: https://www.fws.gov/species/cetaceans-cetacea
    30: "Artiodactyla;Didelphimorphia;Cetacea=Cetaceans=Whales",
    60: "Diprotodontia;Dasyuromorphia;Peramelemorphia;Eulipotyphla",
    85: "Paucituberculata;Microbiotheria;Notoryctemorphia",
    100: "Macroscelidea=Sengis=Elephant Shrews;Afrosoricida",
  }),
  "extra-natural-habitats": bank({
    30: "Swamp;Freshwater Pond;Freshwater Lake;River;Rocky Shore;Sandy Beach;Open Ocean;Salt Flat;Coastal Dune",
    60: "Alpine Meadow;Temperate Rainforest;Tropical Rainforest;Temperate Deciduous Forest;Mediterranean Scrub;Chaparral;Heathland;Moorland;Peat Bog;Fen;Riparian Woodland;Floodplain;Marsh;Intertidal Mudflat;Tide Pool=Rock Pool;Cloud Forest;Montane Forest;Subalpine Forest;Alpine Tundra;Steppe;Prairie;Pampas;Veld;Brackish Lagoon;Oxbow Lake;Vernal Pool",
    85: "Deep-Sea Hydrothermal Vent=Hydrothermal Vent;Cold Seep;Abyssal Plain;Pelagic Zone;Neritic Zone;Puna;Paramo=Páramo;Miombo Woodland;Fynbos;Garrigue;Matorral;Seamount;Submarine Canyon",
    100: "Coralline Algal Reef;Seasonally Flooded Forest=Flooded Forest;Coastal Salt Meadow",
  }),
  "extra-rock-types": bank({
    30: "Diorite;Granodiorite;Andesite;Tuff;Scoria;Coal;Chalk;Flint;Mudstone;Siltstone",
    60: "Peridotite;Dacite;Pegmatite;Kimberlite;Syenite;Monzonite;Tonalite;Dunite;Norite;Trachyte;Phonolite;Arkose;Graywacke=Greywacke;Ironstone;Diatomite;Marl;Chert;Phyllite;Hornfels;Amphibolite;Eclogite;Serpentinite;Blueschist;Greenschist;Dolostone",
    85: "Nepheline Syenite;Anorthosite;Harzburgite;Lherzolite;Pyroxenite;Komatiite;Carbonatite;Ignimbrite;Rhyodacite;Monzogranite;Syenogranite;Syenodiorite;Quartz Diorite;Quartz Monzonite;Travertine;Coquina;Oolite;Novaculite",
    100: "Larvikite;Charnockite;Migmatite;Itacolumite;Tachylite;Foidolite",
  }),

  "extra-italian-dishes": bank({
    30: "Spaghetti Carbonara=Carbonara;Fettuccine Alfredo;Pasta al Pomodoro;Pasta alla Norma;Pasta Puttanesca=Pasta alla Puttanesca;Pasta Arrabbiata=Penne all Arrabbiata;Cacio e Pepe;Spaghetti alle Vongole;Tagliatelle al Ragu=Tagliatelle al Ragù;Risotto alla Milanese;Risotto ai Funghi;Pasta e Fagioli;Parmigiana di Melanzane=Eggplant Parmigiana;Frittata;Calzone;Insalata Caprese=Caprese Salad;Carpaccio;Polpette",
    60: "Trofie al Pesto;Orecchiette con Cime di Rapa;Risi e Bisi;Pasta e Ceci;Pasta e Patate;Cotoletta alla Milanese;Scaloppine;Involtini;Panzerotti;Farinata;Suppli=Supplì;Crocche=Crocchè;Insalata di Riso;Insalata di Mare;Porchetta;Abbacchio;Trippa alla Romana;Bistecca alla Fiorentina;Bollito Misto;Pizzoccheri",
    85: "Coda alla Vaccinara;Baccala alla Vicentina=Baccalà alla Vicentina;Sarde in Saor;Fregola con Arselle;Fegato alla Veneziana;Seppie in Nero;Acquacotta;Buridda;Zuppa Pavese;Timballo",
    100: "Frico;Fave e Cicoria;Ciaudedda;Pecora alla Callara;Pasta alla Gricia;Stracciatella alla Romana",
  }),
  "extra-japanese-dishes": bank({
    30: "Katsu Curry;Karaage;Gyoza;Gyudon;Oyakodon;Katsudon;Yakisoba;Yaki Udon;Omurice;Tamagoyaki;Agedashi Tofu;Tsukemono",
    60: "Nikujaga;Tendon;Tekka Don;Kaisendon;Unadon;Hitsumabushi;Hiyashi Chuka;Nabeyaki Udon;Kitsune Udon;Takikomi Gohan;Ochazuke=Chazuke;Chirashizushi=Chirashi Sushi;Inarizushi=Inari Sushi;Yudofu;Hiyayakko;Goma Dofu;Kenchinjiru;Tonjiru;Champon;Monjayaki;Kushikatsu;Menchi Katsu;Shogayaki;Negimaki;Motsunabe;Chankonabe;Mizutaki;Ozoni=Zoni;Sekihan",
    85: "Kiritanpo;Hoto=Hōtō;Hittsumi;Jibuni;Kakuni;Miso Katsu;Chicken Nanban;Tai Meshi;Kakiage;Kabayaki;Tatsuta Age;Sanma Shioyaki;Nasu Dengaku",
    100: "Fukagawa Meshi;Imoni;Kiritanpo Nabe;Akashiyaki;Zuke Don;Tori Meshi",
  }),
  "extra-indian-dishes": bank({
    30: "Chicken Tikka;Chicken Korma;Chicken Jalfrezi;Chicken Vindaloo;Saag Paneer;Mattar Paneer=Matar Paneer;Shahi Paneer;Paneer Tikka;Paneer Butter Masala;Chole Bhature;Pongal;Upma;Uttapam;Appam;Puttu;Sambar;Dal Makhani;Dal Tadka;Khichdi;Rajma;Aloo Tikki;Aloo Paratha;Aloo Matar;Baingan Bharta;Bhindi Masala;Dum Aloo;Pakora;Pani Puri=Golgappa=Puchka;Bhel Puri",
    60: "Kadai Paneer;Kadai Chicken;Chicken Chettinad;Malabar Fish Curry;Goan Fish Curry;Prawn Balchao;Puri Bhaji;Avial;Thoran;Kootu;Kadhi;Navratan Korma;Vegetable Jalfrezi;Dabeli;Sev Puri;Dahi Puri;Dahi Vada;Medu Vada;Khandvi;Handvo;Thepla;Undhiyu;Gatte ki Sabzi;Dal Baati Churma;Laal Maas;Litti Chokha",
    85: "Ker Sangri;Methi Thepla;Sarson ka Saag;Makki di Roti;Kashmiri Dum Aloo;Yakhni;Gushtaba;Tabak Maaz;Nihari;Haleem;Keema Matar;Pesarattu;Pulihora;Bisi Bele Bath;Neer Dosa;Rava Idli;Kuzhi Paniyaram",
    100: "Patra;Fara;Chhena Poda;Dalma;Santula;Pithla;Zunka",
  }),
  "extra-mexican-dishes": bank({
    30: "Nachos;Taquito=Taquitos=Flauta=Flautas;Carnitas;Barbacoa;Carne Asada;Torta;Sopa de Tortilla=Tortilla Soup;Caldo de Res;Menudo;Huevos Rancheros;Elote;Esquites;Frijoles Charros;Frijoles Refritos;Chiles Rellenos;Ceviche",
    60: "Tacos al Pastor;Tacos de Carnitas;Tacos de Barbacoa;Carne Adobada;Chile Verde;Pambazo;Caldo de Pollo;Caldo de Camaron=Caldo de Camarón;Mole Negro;Mole Verde;Pipian Rojo=Pipián Rojo;Pipian Verde=Pipián Verde;Enfrijoladas;Entomatadas;Enmoladas;Huevos a la Mexicana;Huevos Divorciados;Machaca;Chilorio;Quesabirria;Arroz Rojo;Arroz Verde;Ensalada de Nopales;Tamal de Elote;Sopa de Lima;Tlacoyo;Memela;Chalupa;Mollete;Pescado a la Veracruzana;Aguachile",
    85: "Arroz a la Tumbada;Zacahuil;Corunda;Uchepo;Papadzules;Sopa Tarasca;Pescado Zarandeado;Chilpachole de Jaiba;Carne en su Jugo;Discada;Birria de Chivo;Pollo Pibil;Pollo en Mole",
    100: "Cabrito al Pastor;Mixiote;Tikin Xic;Tortitas de Camaron=Tortitas de Camarón;Romeritos;Huachinango a la Talla",
  }),
  "extra-desserts": bank({
    10: "Chocolate Cake;Apple Pie;Rice Pudding",
    30: "Pumpkin Pie;Pecan Pie;Key Lime Pie;Banoffee Pie;Lemon Meringue Pie;Chocolate Mousse;Bread Pudding;Christmas Pudding;Eton Mess;Apple Crumble;Peach Cobbler;Creme Caramel=Crème Caramel=Flan;Macaron;Macaroon;Madeleine;Black Forest Gateau=Black Forest Cake;Strudel;Tres Leches Cake;Churros",
    60: "Baked Alaska;Crepes Suzette=Crêpes Suzette;Summer Pudding;Custard Tart;Pastel de Nata=Portuguese Custard Tart;Financier;Opera Cake;Sachertorte;Linzer Torte;Kaiserschmarrn;Syrniki;Medovik;Spotted Dick;Treacle Tart;Jam Roly Poly;Malva Pudding;Koeksister;Kulfi;Rasmalai;Rasgulla;Jalebi;Kheer;Halva;Basbousa;Kunafa=Knafeh;Kataifi;Maamoul;Turkish Delight=Lokum;Muhallebi;Brigadeiro;Beijinho;Quindim",
    85: "Tangyuan;Black Sesame Soup;Kakigori;Bingsu;Kulolo;Haupia;Tanghulu;Mooncake;Pineapple Tart;Kue Lapis;Klepon;Halo-Halo;Dacquoise;Paris-Brest;Mille-Feuille;Bostock;Sfogliatella;Cannoli;Cassata;Zuccotto",
    100: "Serradura;Tocino de Cielo;Tarta de Santiago;Tavuk Gogsu=Tavuk Göğsü;Kazandibi;Zerde;Sholeh Zard;Faloodeh",
  }),
  "extra-edible-nuts-seeds": bank({
    30: "Chestnut;Poppy Seed;Fennel Seed;Coriander Seed;Cumin Seed;Mustard Seed;Caraway Seed;Aniseed=Anise Seed;Dill Seed;Fenugreek Seed",
    60: "Acorn;Beech Nut=Beechnut;Ginkgo Nut;Fox Nut=Makhana;Lotus Seed;Watermelon Seed;Melon Seed;Nigella Seed=Black Seed;Cardamom Seed;Pili Nut;Sacha Inchi",
    85: "Wattleseed;Breadnut;Chilean Hazelnut;Kola Nut;Candlenut;Egusi Seed;Njangsa Seed",
    100: "Mongongo Nut;Sapucaia Nut",
  }),
  "extra-grains": bank({
    30: "Pearl Millet;Proso Millet;Foxtail Millet;Finger Millet;Wild Rice;Durum Wheat;Emmer;Khorasan Wheat=Kamut",
    60: "Little Millet;Kodo Millet;Browntop Millet;Guinea Millet;Japanese Barnyard Millet;Indian Barnyard Millet;Jobs Tears=Job’s Tears;Black Fonio;African Rice",
    85: "Canary Seed=Canary Grass Seed;Tartary Buckwheat;Canihua=Cañihua",
    100: "Kernza=Intermediate Wheatgrass Grain",
  }),
  "extra-cooking-methods": bank({
    30: "Deep-Frying=Deep Frying;Shallow-Frying=Shallow Frying;Pan-Frying=Pan Frying;Air-Frying=Air Frying;Pressure Cooking;Slow Cooking;Microwaving;Toasting;Simmering;Searing;Caramelizing=Caramelising;Pot-Roasting=Pot Roasting",
    60: "Double Boiling;Bain-Marie=Water Bath Cooking;En Papillote;Spit-Roasting=Spit Roasting=Rotisserie Cooking;Tandoori Cooking;Oven Drying;Scalding;Parboiling;Sweating;Stoving;Flash-Frying=Flash Frying;Velveting;Reverse Searing;Blackening;Griddling;Pan-Broiling=Pan Broiling;Salt Baking;Clay Baking;Flambeing=Flambéing;Deglazing",
    85: "Plancha Cooking;Charbroiling;Stone Boiling;Sand Roasting;Earth Oven Cooking;Pressure-Steaming=Pressure Steaming;Tempering Spices=Tadka;Reduction=Reducing",
    100: "Broasting;Haybox Cooking",
  }),
  "extra-sauces-condiments": bank({
    10: "Gravy;Salsa;Guacamole;Hummus;Barbecue Sauce=BBQ Sauce",
    30: "Aioli=Aïoli;Tartar Sauce=Tartare Sauce;Cocktail Sauce;Hot Sauce;Worcestershire Sauce;Fish Sauce;Oyster Sauce;Hoisin Sauce;Teriyaki Sauce;Peanut Sauce=Satay Sauce;Honey Mustard;Sweet Chili Sauce=Sweet Chilli Sauce;Sweet and Sour Sauce;Marinara;Bolognese;Alfredo;Relish;Chutney;Dijon Mustard;Wholegrain Mustard;Wasabi;Horseradish Sauce;Mint Sauce;Apple Sauce=Applesauce;Cranberry Sauce",
    60: "Ponzu;Tsuyu;Tonkatsu Sauce;Unagi Sauce=Eel Sauce;Duck Sauce;Mole;Mole Poblano;Salsa Verde;Pico de Gallo;Baba Ganoush=Baba Ghanoush;Skordalia;Toum;Muhammara;Ajvar;Amba;Piccalilli;Tamarind Chutney;Mango Chutney;Demi-Glace;Espagnole;Veloute=Velouté;Arrabbiata;Mornay;Beurre Blanc;Choron;Soubise",
    85: "Lutenitsa=Ljutenica;Pindjur;Nantua;Sauce Robert;Foyot;Sauce Supreme=Sauce Suprême;Normande;Beurre Noir;Beurre Noisette;Sabayon=Zabaglione;Bagna Cauda;Charmoula=Chermoula;Zhoug=Zhug=Schug;Peri-Peri Sauce=Piri-Piri Sauce",
    100: "Gribiche;Ravigote;Sauce Chasseur;Sauce Diable;Sauce Bercy;Sauce Albufera;Nam Chim;Nuoc Cham=Nước Chấm",
  }),
};
