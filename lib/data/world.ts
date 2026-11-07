import type { Prompt } from "../types";

// Original practice bank. Scores are manually estimated familiarity tiers,
// not official Krillion rankings or measured player frequencies.
export const worldPrompts: Prompt[] = [
  {
    id: "world-single-word-states",
    category: "Geography",
    prompt: "Name a U.S. state with a one-word name.",
    note: "Use the full name of a U.S. state written as one word. States whose full names contain spaces do not qualify.",
    answers: [
      {
        name: "California",
        score: 10,
      },
      {
        name: "Texas",
        score: 10,
      },
      {
        name: "Florida",
        score: 10,
      },
      {
        name: "Alaska",
        score: 10,
      },
      {
        name: "Hawaii",
        score: 10,
      },
      {
        name: "Ohio",
        score: 15,
      },
      {
        name: "Utah",
        score: 15,
      },
      {
        name: "Maine",
        score: 15,
      },
      {
        name: "Iowa",
        score: 15,
      },
      {
        name: "Alabama",
        score: 30,
      },
      {
        name: "Arizona",
        score: 30,
      },
      {
        name: "Colorado",
        score: 30,
      },
      {
        name: "Georgia",
        score: 30,
      },
      {
        name: "Illinois",
        score: 30,
      },
      {
        name: "Indiana",
        score: 30,
      },
      {
        name: "Kansas",
        score: 30,
      },
      {
        name: "Kentucky",
        score: 30,
      },
      {
        name: "Louisiana",
        score: 30,
      },
      {
        name: "Maryland",
        score: 30,
      },
      {
        name: "Michigan",
        score: 30,
      },
      {
        name: "Nevada",
        score: 30,
      },
      {
        name: "Oregon",
        score: 30,
      },
      {
        name: "Pennsylvania",
        score: 30,
      },
      {
        name: "Tennessee",
        score: 30,
      },
      {
        name: "Virginia",
        score: 30,
      },
      {
        name: "Washington",
        score: 30,
      },
      {
        name: "Wisconsin",
        score: 30,
      },
      {
        name: "Arkansas",
        score: 60,
      },
      {
        name: "Connecticut",
        score: 60,
      },
      {
        name: "Massachusetts",
        score: 60,
      },
      {
        name: "Minnesota",
        score: 60,
      },
      {
        name: "Mississippi",
        score: 60,
      },
      {
        name: "Missouri",
        score: 60,
      },
      {
        name: "Oklahoma",
        score: 60,
      },
      {
        name: "Delaware",
        score: 85,
      },
      {
        name: "Montana",
        score: 85,
      },
      {
        name: "Nebraska",
        score: 85,
      },
      {
        name: "Wyoming",
        score: 85,
      },
      {
        name: "Idaho",
        score: 100,
      },
      {
        name: "Vermont",
        score: 100,
      },
    ],
    source: "https://www.census.gov/library/reference/code-lists/ansi.html",
  },
  {
    id: "world-one-word-state-capitals",
    category: "Geography",
    prompt: "Name a U.S. state capital with a one-word name.",
    note: "Use the usual English city name as one word, without the state name. Multiword capitals such as Salt Lake City and Santa Fe do not qualify.",
    answers: [
      {
        name: "Austin",
        score: 10,
      },
      {
        name: "Boston",
        score: 10,
      },
      {
        name: "Denver",
        score: 10,
      },
      {
        name: "Atlanta",
        score: 10,
      },
      {
        name: "Honolulu",
        score: 10,
      },
      {
        name: "Phoenix",
        score: 15,
      },
      {
        name: "Sacramento",
        score: 15,
      },
      {
        name: "Nashville",
        score: 15,
      },
      {
        name: "Albany",
        score: 30,
      },
      {
        name: "Annapolis",
        score: 30,
      },
      {
        name: "Columbus",
        score: 30,
      },
      {
        name: "Hartford",
        score: 30,
      },
      {
        name: "Indianapolis",
        score: 30,
      },
      {
        name: "Jackson",
        score: 30,
      },
      {
        name: "Lansing",
        score: 30,
      },
      {
        name: "Lincoln",
        score: 30,
      },
      {
        name: "Madison",
        score: 30,
      },
      {
        name: "Montgomery",
        score: 30,
      },
      {
        name: "Olympia",
        score: 30,
      },
      {
        name: "Richmond",
        score: 30,
      },
      {
        name: "Salem",
        score: 30,
      },
      {
        name: "Tallahassee",
        score: 30,
      },
      {
        name: "Topeka",
        score: 30,
      },
      {
        name: "Augusta",
        score: 60,
      },
      {
        name: "Boise",
        score: 60,
      },
      {
        name: "Concord",
        score: 60,
      },
      {
        name: "Dover",
        score: 60,
      },
      {
        name: "Harrisburg",
        score: 60,
      },
      {
        name: "Helena",
        score: 60,
      },
      {
        name: "Raleigh",
        score: 60,
      },
      {
        name: "Springfield",
        score: 60,
      },
      {
        name: "Trenton",
        score: 60,
      },
      {
        name: "Bismarck",
        score: 85,
      },
      {
        name: "Charleston",
        score: 85,
      },
      {
        name: "Cheyenne",
        score: 85,
      },
      {
        name: "Frankfort",
        score: 85,
      },
      {
        name: "Providence",
        score: 85,
      },
      {
        name: "Juneau",
        score: 100,
      },
      {
        name: "Montpelier",
        score: 100,
      },
      {
        name: "Pierre",
        score: 100,
      },
      {
        name: "Columbia",
        score: 60,
      },
    ],
  },
  {
    id: "world-african-countries",
    category: "Geography",
    prompt: "Name a UN member country in Africa.",
    note: "UN member countries in Africa qualify, including African island countries. Common English names and official country names are accepted; territories are excluded.",
    answers: [
      {
        name: "Egypt",
        score: 10,
      },
      {
        name: "South Africa",
        score: 10,
      },
      {
        name: "Kenya",
        score: 10,
      },
      {
        name: "Nigeria",
        score: 10,
      },
      {
        name: "Morocco",
        score: 10,
      },
      {
        name: "Madagascar",
        score: 15,
      },
      {
        name: "Zimbabwe",
        score: 15,
      },
      {
        name: "Ghana",
        score: 15,
      },
      {
        name: "Algeria",
        score: 30,
      },
      {
        name: "Angola",
        score: 30,
      },
      {
        name: "Cameroon",
        score: 30,
      },
      {
        name: "Ethiopia",
        score: 30,
      },
      {
        name: "Libya",
        score: 30,
      },
      {
        name: "Senegal",
        score: 30,
      },
      {
        name: "Sudan",
        score: 30,
      },
      {
        name: "Tanzania",
        score: 30,
      },
      {
        name: "Tunisia",
        score: 30,
      },
      {
        name: "Uganda",
        score: 30,
      },
      {
        name: "Zambia",
        score: 30,
      },
      {
        name: "Botswana",
        score: 60,
      },
      {
        name: "Burkina Faso",
        score: 60,
      },
      {
        name: "Chad",
        score: 60,
      },
      {
        name: "Democratic Republic of the Congo",
        score: 60,
        aliases: ["DR Congo", "DRC"],
      },
      {
        name: "Gabon",
        score: 60,
      },
      {
        name: "Mali",
        score: 60,
      },
      {
        name: "Mozambique",
        score: 60,
      },
      {
        name: "Namibia",
        score: 60,
      },
      {
        name: "Rwanda",
        score: 60,
      },
      {
        name: "Benin",
        score: 85,
      },
      {
        name: "Burundi",
        score: 85,
      },
      {
        name: "Djibouti",
        score: 85,
      },
      {
        name: "Eritrea",
        score: 85,
      },
      {
        name: "Lesotho",
        score: 85,
      },
      {
        name: "Mauritania",
        score: 85,
      },
      {
        name: "Mauritius",
        score: 85,
      },
      {
        name: "Niger",
        score: 85,
      },
      {
        name: "Cabo Verde",
        score: 100,
        aliases: ["Cape Verde"],
      },
      {
        name: "Comoros",
        score: 100,
      },
      {
        name: "Eswatini",
        score: 100,
        aliases: ["Swaziland"],
      },
      {
        name: "Sao Tome and Principe",
        score: 100,
        aliases: ["São Tomé and Príncipe"],
      },
    ],
    source: "https://www.un.org/en/about-us/member-states",
  },
  {
    id: "world-americas-countries",
    category: "Geography",
    prompt: "Name a UN member country in the Americas.",
    note: "UN member countries in North America, Central America, South America, or the Caribbean qualify. Common English and official country names count; territories are excluded.",
    answers: [
      {
        name: "United States",
        score: 10,
        aliases: ["USA", "US", "United States of America"],
      },
      {
        name: "Canada",
        score: 10,
      },
      {
        name: "Mexico",
        score: 10,
      },
      {
        name: "Brazil",
        score: 10,
      },
      {
        name: "Argentina",
        score: 10,
      },
      {
        name: "Cuba",
        score: 15,
      },
      {
        name: "Jamaica",
        score: 15,
      },
      {
        name: "Chile",
        score: 15,
      },
      {
        name: "Colombia",
        score: 30,
      },
      {
        name: "Peru",
        score: 30,
      },
      {
        name: "Venezuela",
        score: 30,
      },
      {
        name: "Ecuador",
        score: 30,
      },
      {
        name: "Bolivia",
        score: 30,
      },
      {
        name: "Uruguay",
        score: 30,
      },
      {
        name: "Paraguay",
        score: 30,
      },
      {
        name: "Costa Rica",
        score: 30,
      },
      {
        name: "Panama",
        score: 30,
      },
      {
        name: "Guatemala",
        score: 30,
      },
      {
        name: "Haiti",
        score: 30,
      },
      {
        name: "Dominican Republic",
        score: 30,
      },
      {
        name: "Belize",
        score: 60,
      },
      {
        name: "El Salvador",
        score: 60,
      },
      {
        name: "Honduras",
        score: 60,
      },
      {
        name: "Nicaragua",
        score: 60,
      },
      {
        name: "Bahamas",
        score: 60,
        aliases: ["The Bahamas"],
      },
      {
        name: "Barbados",
        score: 60,
      },
      {
        name: "Trinidad and Tobago",
        score: 60,
      },
      {
        name: "Guyana",
        score: 85,
      },
      {
        name: "Suriname",
        score: 85,
      },
      {
        name: "Saint Lucia",
        score: 85,
        aliases: ["St Lucia"],
      },
      {
        name: "Grenada",
        score: 85,
      },
      {
        name: "Antigua and Barbuda",
        score: 100,
      },
      {
        name: "Dominica",
        score: 100,
      },
      {
        name: "Saint Kitts and Nevis",
        score: 100,
        aliases: ["St Kitts and Nevis"],
      },
      {
        name: "Saint Vincent and the Grenadines",
        score: 100,
        aliases: ["St Vincent and the Grenadines"],
      },
    ],
    source: "https://www.un.org/en/about-us/member-states",
  },
  {
    id: "world-landlocked-countries",
    category: "Geography",
    prompt: "Name a landlocked UN member country.",
    note: "A UN member country with no coastline on an ocean-connected sea qualifies. A shore on the inland Caspian Sea does not make a country ocean-connected.",
    answers: [
      {
        name: "Switzerland",
        score: 10,
      },
      {
        name: "Austria",
        score: 10,
      },
      {
        name: "Nepal",
        score: 10,
      },
      {
        name: "Mongolia",
        score: 10,
      },
      {
        name: "Bolivia",
        score: 10,
      },
      {
        name: "Luxembourg",
        score: 15,
      },
      {
        name: "Hungary",
        score: 15,
      },
      {
        name: "Paraguay",
        score: 15,
      },
      {
        name: "Afghanistan",
        score: 30,
      },
      {
        name: "Armenia",
        score: 30,
      },
      {
        name: "Belarus",
        score: 30,
      },
      {
        name: "Bhutan",
        score: 30,
      },
      {
        name: "Botswana",
        score: 30,
      },
      {
        name: "Chad",
        score: 30,
      },
      {
        name: "Czechia",
        score: 30,
        aliases: ["Czech Republic"],
      },
      {
        name: "Ethiopia",
        score: 30,
      },
      {
        name: "Kazakhstan",
        score: 30,
      },
      {
        name: "Laos",
        score: 30,
        aliases: ["Lao PDR"],
      },
      {
        name: "Mali",
        score: 30,
      },
      {
        name: "Niger",
        score: 30,
      },
      {
        name: "Rwanda",
        score: 30,
      },
      {
        name: "Serbia",
        score: 30,
      },
      {
        name: "Slovakia",
        score: 30,
      },
      {
        name: "Uganda",
        score: 30,
      },
      {
        name: "Zambia",
        score: 30,
      },
      {
        name: "Zimbabwe",
        score: 30,
      },
      {
        name: "Andorra",
        score: 60,
      },
      {
        name: "Azerbaijan",
        score: 60,
      },
      {
        name: "Burkina Faso",
        score: 60,
      },
      {
        name: "Burundi",
        score: 60,
      },
      {
        name: "Lesotho",
        score: 60,
      },
      {
        name: "Malawi",
        score: 60,
      },
      {
        name: "Moldova",
        score: 60,
      },
      {
        name: "North Macedonia",
        score: 60,
        aliases: ["Macedonia"],
      },
      {
        name: "Uzbekistan",
        score: 60,
      },
      {
        name: "Central African Republic",
        score: 85,
        aliases: ["CAR"],
      },
      {
        name: "Eswatini",
        score: 85,
        aliases: ["Swaziland"],
      },
      {
        name: "Kyrgyzstan",
        score: 85,
      },
      {
        name: "South Sudan",
        score: 85,
      },
      {
        name: "Tajikistan",
        score: 85,
      },
      {
        name: "Turkmenistan",
        score: 85,
      },
      {
        name: "Liechtenstein",
        score: 100,
      },
      {
        name: "San Marino",
        score: 100,
      },
    ],
    source: "https://www.un.org/ohrlls/content/list-lldcs",
  },
  {
    id: "world-european-capitals",
    category: "Geography",
    prompt: "Name a national capital city in Europe.",
    note: "Use the common or official name of a national capital city geographically in Europe. European capitals of transcontinental countries qualify; give the city rather than its country.",
    answers: [
      {
        name: "London",
        score: 10,
      },
      {
        name: "Paris",
        score: 10,
      },
      {
        name: "Rome",
        score: 10,
      },
      {
        name: "Berlin",
        score: 10,
      },
      {
        name: "Madrid",
        score: 10,
      },
      {
        name: "Dublin",
        score: 15,
      },
      {
        name: "Amsterdam",
        score: 15,
      },
      {
        name: "Athens",
        score: 15,
      },
      {
        name: "Vienna",
        score: 30,
      },
      {
        name: "Brussels",
        score: 30,
      },
      {
        name: "Lisbon",
        score: 30,
      },
      {
        name: "Prague",
        score: 30,
      },
      {
        name: "Warsaw",
        score: 30,
      },
      {
        name: "Stockholm",
        score: 30,
      },
      {
        name: "Oslo",
        score: 30,
      },
      {
        name: "Helsinki",
        score: 30,
      },
      {
        name: "Copenhagen",
        score: 30,
      },
      {
        name: "Budapest",
        score: 30,
      },
      {
        name: "Reykjavik",
        score: 60,
        aliases: ["Reykjavík"],
      },
      {
        name: "Bucharest",
        score: 60,
      },
      {
        name: "Sofia",
        score: 60,
      },
      {
        name: "Zagreb",
        score: 60,
      },
      {
        name: "Belgrade",
        score: 60,
      },
      {
        name: "Kyiv",
        score: 60,
        aliases: ["Kiev"],
      },
      {
        name: "Tallinn",
        score: 60,
      },
      {
        name: "Riga",
        score: 60,
      },
      {
        name: "Vilnius",
        score: 60,
      },
      {
        name: "Bratislava",
        score: 85,
      },
      {
        name: "Ljubljana",
        score: 85,
      },
      {
        name: "Sarajevo",
        score: 85,
      },
      {
        name: "Tirana",
        score: 85,
      },
      {
        name: "Skopje",
        score: 85,
      },
      {
        name: "Chisinau",
        score: 85,
        aliases: ["Chișinău"],
      },
      {
        name: "Podgorica",
        score: 100,
      },
      {
        name: "Vaduz",
        score: 100,
      },
      {
        name: "Valletta",
        score: 100,
      },
    ],
  },
  {
    id: "world-asian-capitals",
    category: "Geography",
    prompt: "Name a national capital city in Asia.",
    note: "Use the common or official name of a city currently serving as a national capital in Asia. A country may have more than one capital or seat of government.",
    answers: [
      {
        name: "Tokyo",
        score: 10,
      },
      {
        name: "Beijing",
        score: 10,
        aliases: ["Peking"],
      },
      {
        name: "New Delhi",
        score: 10,
        aliases: ["Delhi"],
      },
      {
        name: "Bangkok",
        score: 10,
      },
      {
        name: "Seoul",
        score: 10,
      },
      {
        name: "Singapore",
        score: 15,
      },
      {
        name: "Manila",
        score: 15,
      },
      {
        name: "Hanoi",
        score: 15,
      },
      {
        name: "Kuala Lumpur",
        score: 30,
      },
      {
        name: "Kathmandu",
        score: 30,
      },
      {
        name: "Dhaka",
        score: 30,
        aliases: ["Dacca"],
      },
      {
        name: "Islamabad",
        score: 30,
      },
      {
        name: "Kabul",
        score: 30,
      },
      {
        name: "Baghdad",
        score: 30,
      },
      {
        name: "Tehran",
        score: 30,
      },
      {
        name: "Ankara",
        score: 30,
      },
      {
        name: "Riyadh",
        score: 30,
      },
      {
        name: "Abu Dhabi",
        score: 30,
      },
      {
        name: "Doha",
        score: 30,
      },
      {
        name: "Kuwait City",
        score: 30,
        aliases: ["Kuwait"],
      },
      {
        name: "Damascus",
        score: 30,
      },
      {
        name: "Amman",
        score: 30,
      },
      {
        name: "Beirut",
        score: 30,
      },
      {
        name: "Phnom Penh",
        score: 60,
      },
      {
        name: "Vientiane",
        score: 60,
      },
      {
        name: "Ulaanbaatar",
        score: 60,
        aliases: ["Ulan Bator"],
      },
      {
        name: "Astana",
        score: 60,
      },
      {
        name: "Tashkent",
        score: 60,
      },
      {
        name: "Baku",
        score: 60,
      },
      {
        name: "Tbilisi",
        score: 60,
      },
      {
        name: "Yerevan",
        score: 60,
      },
      {
        name: "Thimphu",
        score: 85,
      },
      {
        name: "Dushanbe",
        score: 85,
      },
      {
        name: "Ashgabat",
        score: 85,
      },
      {
        name: "Bishkek",
        score: 85,
      },
      {
        name: "Muscat",
        score: 85,
      },
      {
        name: "Bandar Seri Begawan",
        score: 100,
      },
      {
        name: "Dili",
        score: 100,
      },
      {
        name: "Manama",
        score: 100,
      },
      {
        name: "Naypyidaw",
        score: 100,
        aliases: ["Nay Pyi Taw"],
      },
    ],
  },
  {
    id: "world-us-national-parks",
    category: "Geography",
    prompt: "Name a U.S. national park.",
    note: "A place formally designated a U.S. National Park qualifies, including parks in U.S. territories. The words National Park are optional; national monuments and state parks do not qualify.",
    answers: [
      {
        name: "Yellowstone",
        score: 10,
        aliases: ["Yellowstone National Park"],
      },
      {
        name: "Yosemite",
        score: 10,
        aliases: ["Yosemite National Park"],
      },
      {
        name: "Grand Canyon",
        score: 10,
        aliases: ["Grand Canyon National Park"],
      },
      {
        name: "Zion",
        score: 10,
        aliases: ["Zion National Park"],
      },
      {
        name: "Everglades",
        score: 10,
        aliases: ["Everglades National Park"],
      },
      {
        name: "Death Valley",
        score: 15,
        aliases: ["Death Valley National Park"],
      },
      {
        name: "Joshua Tree",
        score: 15,
        aliases: ["Joshua Tree National Park"],
      },
      {
        name: "Acadia",
        score: 15,
        aliases: ["Acadia National Park"],
      },
      {
        name: "Arches",
        score: 30,
        aliases: ["Arches National Park"],
      },
      {
        name: "Badlands",
        score: 30,
        aliases: ["Badlands National Park"],
      },
      {
        name: "Bryce Canyon",
        score: 30,
        aliases: ["Bryce Canyon National Park"],
      },
      {
        name: "Canyonlands",
        score: 30,
        aliases: ["Canyonlands National Park"],
      },
      {
        name: "Crater Lake",
        score: 30,
        aliases: ["Crater Lake National Park"],
      },
      {
        name: "Denali",
        score: 30,
        aliases: ["Denali National Park", "Denali National Park and Preserve"],
      },
      {
        name: "Glacier",
        score: 30,
        aliases: ["Glacier National Park"],
      },
      {
        name: "Grand Teton",
        score: 30,
        aliases: ["Grand Teton National Park"],
      },
      {
        name: "Great Smoky Mountains",
        score: 30,
        aliases: ["Great Smoky Mountains National Park"],
      },
      {
        name: "Olympic",
        score: 30,
        aliases: ["Olympic National Park"],
      },
      {
        name: "Petrified Forest",
        score: 30,
        aliases: ["Petrified Forest National Park"],
      },
      {
        name: "Redwood",
        score: 30,
        aliases: [
          "Redwood National Park",
          "Redwoods",
          "Redwood National and State Parks",
        ],
      },
      {
        name: "Rocky Mountain",
        score: 30,
        aliases: ["Rocky Mountain National Park"],
      },
      {
        name: "Sequoia",
        score: 30,
        aliases: ["Sequoia National Park"],
      },
      {
        name: "Shenandoah",
        score: 30,
        aliases: ["Shenandoah National Park"],
      },
      {
        name: "Big Bend",
        score: 60,
        aliases: ["Big Bend National Park"],
      },
      {
        name: "Biscayne",
        score: 60,
        aliases: ["Biscayne National Park"],
      },
      {
        name: "Capitol Reef",
        score: 60,
        aliases: ["Capitol Reef National Park"],
      },
      {
        name: "Carlsbad Caverns",
        score: 60,
        aliases: ["Carlsbad Caverns National Park"],
      },
      {
        name: "Congaree",
        score: 60,
        aliases: ["Congaree National Park"],
      },
      {
        name: "Dry Tortugas",
        score: 60,
        aliases: ["Dry Tortugas National Park"],
      },
      {
        name: "Haleakala",
        score: 60,
        aliases: [
          "Haleakalā",
          "Haleakala National Park",
          "Haleakalā National Park",
        ],
      },
      {
        name: "Hawaii Volcanoes",
        score: 60,
        aliases: [
          "Hawaiʻi Volcanoes",
          "Hawaii Volcanoes National Park",
          "Hawaiʻi Volcanoes National Park",
        ],
      },
      {
        name: "Hot Springs",
        score: 60,
        aliases: ["Hot Springs National Park"],
      },
      {
        name: "Isle Royale",
        score: 60,
        aliases: ["Isle Royale National Park"],
      },
      {
        name: "Great Basin",
        score: 85,
        aliases: ["Great Basin National Park"],
      },
      {
        name: "Guadalupe Mountains",
        score: 85,
        aliases: ["Guadalupe Mountains National Park"],
      },
      {
        name: "Lassen Volcanic",
        score: 85,
        aliases: ["Lassen Volcanic National Park"],
      },
      {
        name: "Pinnacles",
        score: 85,
        aliases: ["Pinnacles National Park"],
      },
      {
        name: "Voyageurs",
        score: 85,
        aliases: ["Voyageurs National Park"],
      },
      {
        name: "Gates of the Arctic",
        score: 100,
        aliases: [
          "Gates of the Arctic National Park",
          "Gates of the Arctic National Park and Preserve",
        ],
      },
      {
        name: "Kobuk Valley",
        score: 100,
        aliases: ["Kobuk Valley National Park"],
      },
      {
        name: "Lake Clark",
        score: 100,
        aliases: [
          "Lake Clark National Park",
          "Lake Clark National Park and Preserve",
        ],
      },
    ],
    source: "https://www.nps.gov/aboutus/national-park-system.htm",
  },
  {
    id: "world-dog-breeds",
    category: "Nature",
    prompt: "Name a recognized dog breed.",
    note: "Use a common or official name of an established dog breed recognized by a major registry such as AKC, UKC, FCI, or The Kennel Club. Recognition need not be American; informal designer crossbreed names do not qualify.",
    answers: [
      {
        name: "Labrador Retriever",
        score: 10,
        aliases: ["Labrador"],
      },
      {
        name: "Golden Retriever",
        score: 10,
      },
      {
        name: "German Shepherd Dog",
        score: 10,
        aliases: ["German Shepherd"],
      },
      {
        name: "Bulldog",
        score: 10,
        aliases: ["English Bulldog"],
      },
      {
        name: "Poodle",
        score: 10,
      },
      {
        name: "Chihuahua",
        score: 15,
      },
      {
        name: "Siberian Husky",
        score: 15,
        aliases: ["Husky"],
      },
      {
        name: "Dalmatian",
        score: 15,
      },
      {
        name: "Beagle",
        score: 30,
      },
      {
        name: "Boxer",
        score: 30,
      },
      {
        name: "Dachshund",
        score: 30,
      },
      {
        name: "Doberman Pinscher",
        score: 30,
        aliases: ["Doberman"],
      },
      {
        name: "French Bulldog",
        score: 30,
      },
      {
        name: "Great Dane",
        score: 30,
      },
      {
        name: "Pomeranian",
        score: 30,
      },
      {
        name: "Rottweiler",
        score: 30,
      },
      {
        name: "Shih Tzu",
        score: 30,
      },
      {
        name: "Yorkshire Terrier",
        score: 30,
        aliases: ["Yorkie"],
      },
      {
        name: "Akita",
        score: 60,
      },
      {
        name: "Australian Shepherd",
        score: 60,
      },
      {
        name: "Basset Hound",
        score: 60,
      },
      {
        name: "Border Collie",
        score: 60,
      },
      {
        name: "Boston Terrier",
        score: 60,
      },
      {
        name: "Cavalier King Charles Spaniel",
        score: 60,
      },
      {
        name: "Chow Chow",
        score: 60,
      },
      {
        name: "Cocker Spaniel",
        score: 60,
      },
      {
        name: "Shetland Sheepdog",
        score: 60,
        aliases: ["Sheltie"],
      },
      {
        name: "Basenji",
        score: 85,
      },
      {
        name: "Borzoi",
        score: 85,
      },
      {
        name: "Keeshond",
        score: 85,
      },
      {
        name: "Leonberger",
        score: 85,
      },
      {
        name: "Samoyed",
        score: 85,
      },
      {
        name: "Azawakh",
        score: 100,
      },
      {
        name: "Lagotto Romagnolo",
        score: 100,
      },
      {
        name: "Xoloitzcuintli",
        score: 100,
        aliases: ["Xolo"],
      },
      { name: "Aidi", score: 85, aliases: ["Atlas Mountain Dog"] },
      { name: "Akbash Dog", score: 85, aliases: ["Akbash"] },
      { name: "Kangal Dog", score: 60, aliases: ["Kangal"] },
    ],
    source: "https://www.akc.org/dog-breeds/",
  },
  {
    id: "world-cat-breeds",
    category: "Nature",
    prompt: "Name a pedigree cat breed.",
    note: "Use a common or official name of a pedigree breed recognized by a major cat registry. Coat patterns or colors such as tabby and calico are not breeds.",
    answers: [
      {
        name: "Persian",
        score: 10,
      },
      {
        name: "Siamese",
        score: 10,
      },
      {
        name: "Maine Coon",
        score: 10,
      },
      {
        name: "Sphynx",
        score: 10,
      },
      {
        name: "Bengal",
        score: 10,
      },
      {
        name: "Ragdoll",
        score: 15,
      },
      {
        name: "British Shorthair",
        score: 15,
      },
      {
        name: "Scottish Fold",
        score: 15,
      },
      {
        name: "Abyssinian",
        score: 30,
      },
      {
        name: "American Shorthair",
        score: 30,
      },
      {
        name: "Birman",
        score: 30,
      },
      {
        name: "Burmese",
        score: 30,
      },
      {
        name: "Devon Rex",
        score: 30,
      },
      {
        name: "Exotic Shorthair",
        score: 30,
        aliases: ["Exotic"],
      },
      {
        name: "Norwegian Forest Cat",
        score: 30,
      },
      {
        name: "Oriental Shorthair",
        score: 30,
      },
      {
        name: "Russian Blue",
        score: 30,
      },
      {
        name: "Turkish Angora",
        score: 30,
      },
      {
        name: "American Curl",
        score: 60,
      },
      {
        name: "Balinese",
        score: 60,
      },
      {
        name: "Cornish Rex",
        score: 60,
      },
      {
        name: "Egyptian Mau",
        score: 60,
      },
      {
        name: "Japanese Bobtail",
        score: 60,
      },
      {
        name: "Manx",
        score: 60,
      },
      {
        name: "Ocicat",
        score: 60,
      },
      {
        name: "Siberian",
        score: 60,
      },
      {
        name: "Somali",
        score: 60,
      },
      {
        name: "Tonkinese",
        score: 60,
      },
      {
        name: "Chartreux",
        score: 85,
      },
      {
        name: "Havana Brown",
        score: 85,
      },
      {
        name: "Korat",
        score: 85,
      },
      {
        name: "Selkirk Rex",
        score: 85,
      },
      {
        name: "LaPerm",
        score: 100,
      },
      {
        name: "Lykoi",
        score: 100,
      },
      {
        name: "Singapura",
        score: 100,
      },
    ],
    source: "https://cfa.org/breeds/",
  },
  {
    id: "world-shark-species",
    category: "Nature",
    prompt: "Name a living species of shark.",
    note: "Name a living shark species by its common or scientific name. Broad groups such as hammerhead, and extinct species, do not qualify.",
    answers: [
      {
        name: "Great White Shark",
        score: 10,
        aliases: ["Great White"],
      },
      {
        name: "Tiger Shark",
        score: 10,
      },
      {
        name: "Whale Shark",
        score: 10,
      },
      {
        name: "Bull Shark",
        score: 10,
      },
      {
        name: "Nurse Shark",
        score: 10,
      },
      {
        name: "Goblin Shark",
        score: 15,
      },
      {
        name: "Basking Shark",
        score: 15,
      },
      {
        name: "Greenland Shark",
        score: 15,
      },
      {
        name: "Blue Shark",
        score: 30,
      },
      {
        name: "Lemon Shark",
        score: 30,
      },
      {
        name: "Sand Tiger Shark",
        score: 30,
      },
      {
        name: "Oceanic Whitetip Shark",
        score: 30,
        aliases: ["Oceanic Whitetip"],
      },
      {
        name: "Blacktip Reef Shark",
        score: 30,
        aliases: ["Blacktip Reef"],
      },
      {
        name: "Whitetip Reef Shark",
        score: 30,
        aliases: ["Whitetip Reef"],
      },
      {
        name: "Great Hammerhead",
        score: 30,
        aliases: ["Great Hammerhead Shark"],
      },
      {
        name: "Shortfin Mako",
        score: 30,
        aliases: ["Shortfin Mako Shark"],
      },
      {
        name: "Zebra Shark",
        score: 60,
      },
      {
        name: "Leopard Shark",
        score: 60,
      },
      {
        name: "Bonnethead",
        score: 60,
        aliases: ["Bonnethead Shark"],
      },
      {
        name: "Silky Shark",
        score: 60,
      },
      {
        name: "Sandbar Shark",
        score: 60,
      },
      {
        name: "Copper Shark",
        score: 60,
        aliases: ["Bronze Whaler"],
      },
      {
        name: "Port Jackson Shark",
        score: 60,
      },
      {
        name: "Epaulette Shark",
        score: 85,
      },
      {
        name: "Frilled Shark",
        score: 85,
      },
      {
        name: "Megamouth Shark",
        score: 85,
      },
      {
        name: "Spiny Dogfish",
        score: 85,
        aliases: ["Spiny Dogfish Shark"],
      },
      {
        name: "Cookiecutter Shark",
        score: 100,
      },
      {
        name: "Draughtsboard Shark",
        score: 100,
      },
      {
        name: "Pyjama Shark",
        score: 100,
      },
    ],
    source: "https://www.floridamuseum.ufl.edu/discover-fish/species-profiles/",
  },
  {
    id: "world-snake-species",
    category: "Nature",
    prompt: "Name a living species of snake.",
    note: "Name a living snake species by its common or scientific name. Broad groups such as cobra or python alone do not qualify.",
    answers: [
      {
        name: "King Cobra",
        score: 10,
      },
      {
        name: "Boa Constrictor",
        score: 10,
      },
      {
        name: "Corn Snake",
        score: 10,
      },
      {
        name: "Ball Python",
        score: 10,
        aliases: ["Royal Python"],
      },
      {
        name: "Green Anaconda",
        score: 10,
      },
      {
        name: "Black Mamba",
        score: 15,
      },
      {
        name: "Inland Taipan",
        score: 15,
      },
      {
        name: "Burmese Python",
        score: 15,
      },
      {
        name: "Reticulated Python",
        score: 30,
      },
      {
        name: "Eastern Kingsnake",
        score: 30,
        aliases: ["Eastern King Snake"],
      },
      {
        name: "Milk Snake",
        score: 30,
      },
      {
        name: "Gopher Snake",
        score: 30,
      },
      {
        name: "Western Diamondback Rattlesnake",
        score: 30,
      },
      {
        name: "Eastern Diamondback Rattlesnake",
        score: 30,
      },
      {
        name: "Common Garter Snake",
        score: 30,
      },
      {
        name: "Copperhead",
        score: 30,
        aliases: ["Eastern Copperhead"],
      },
      {
        name: "Cottonmouth",
        score: 30,
        aliases: ["Northern Cottonmouth"],
      },
      {
        name: "Indian Cobra",
        score: 30,
      },
      {
        name: "Gaboon Viper",
        score: 60,
      },
      {
        name: "Puff Adder",
        score: 60,
      },
      {
        name: "Boomslang",
        score: 60,
      },
      {
        name: "Emerald Tree Boa",
        score: 60,
      },
      {
        name: "Green Tree Python",
        score: 60,
      },
      {
        name: "Tiger Snake",
        score: 60,
      },
      {
        name: "Eastern Brown Snake",
        score: 60,
      },
      {
        name: "Rhinoceros Viper",
        score: 85,
      },
      {
        name: "Bushmaster",
        score: 85,
        aliases: ["South American Bushmaster"],
      },
      {
        name: "Tentacled Snake",
        score: 85,
      },
      {
        name: "Golden Lancehead",
        score: 85,
      },
      {
        name: "Barbados Threadsnake",
        score: 100,
      },
      {
        name: "Spider-Tailed Horned Viper",
        score: 100,
      },
      {
        name: "Sunbeam Snake",
        score: 100,
      },
    ],
  },
  {
    id: "world-bird-species",
    category: "Nature",
    prompt: "Name a living species of bird.",
    note: "Name a living bird species by its common or scientific name. Broad groups such as eagle or penguin alone do not qualify.",
    answers: [
      {
        name: "Bald Eagle",
        score: 10,
      },
      {
        name: "Emperor Penguin",
        score: 10,
      },
      {
        name: "American Robin",
        score: 10,
      },
      {
        name: "Barn Owl",
        score: 10,
      },
      {
        name: "Common Ostrich",
        score: 10,
      },
      {
        name: "Atlantic Puffin",
        score: 15,
      },
      {
        name: "Peregrine Falcon",
        score: 15,
      },
      {
        name: "Mallard",
        score: 15,
      },
      {
        name: "African Grey Parrot",
        score: 30,
        aliases: ["African Gray Parrot"],
      },
      {
        name: "Barn Swallow",
        score: 30,
      },
      {
        name: "Black Swan",
        score: 30,
      },
      {
        name: "Blue Jay",
        score: 30,
      },
      {
        name: "Canada Goose",
        score: 30,
      },
      {
        name: "Common Kingfisher",
        score: 30,
      },
      {
        name: "European Robin",
        score: 30,
      },
      {
        name: "Great Blue Heron",
        score: 30,
      },
      {
        name: "Great Horned Owl",
        score: 30,
      },
      {
        name: "House Sparrow",
        score: 30,
      },
      {
        name: "Mute Swan",
        score: 30,
      },
      {
        name: "Northern Cardinal",
        score: 30,
      },
      {
        name: "Indian Peafowl",
        score: 30,
        aliases: ["Indian Peacock", "Blue Peacock"],
      },
      {
        name: "Red-Tailed Hawk",
        score: 30,
      },
      {
        name: "Cedar Waxwing",
        score: 60,
      },
      {
        name: "Eurasian Hoopoe",
        score: 60,
        aliases: ["Hoopoe"],
      },
      {
        name: "Greater Flamingo",
        score: 60,
      },
      {
        name: "Laughing Kookaburra",
        score: 60,
      },
      {
        name: "Red Kite",
        score: 60,
      },
      {
        name: "Roseate Spoonbill",
        score: 60,
      },
      {
        name: "Secretarybird",
        score: 60,
        aliases: ["Secretary Bird"],
      },
      {
        name: "Kakapo",
        score: 85,
        aliases: ["Kākāpō"],
      },
      {
        name: "Shoebill",
        score: 85,
      },
      {
        name: "Superb Lyrebird",
        score: 85,
      },
      {
        name: "Resplendent Quetzal",
        score: 85,
      },
      {
        name: "Oilbird",
        score: 100,
      },
      {
        name: "Sword-Billed Hummingbird",
        score: 100,
      },
      {
        name: "Vulturine Guineafowl",
        score: 100,
      },
    ],
    source: "https://www.birds.cornell.edu/home/",
  },
  {
    id: "world-tree-species",
    category: "Nature",
    prompt: "Name a species of tree.",
    note: "Common or scientific names of tree species qualify. Broad groups such as oak, pine, or maple alone do not identify a species.",
    answers: [
      {
        name: "English Oak",
        score: 10,
      },
      {
        name: "Silver Birch",
        score: 10,
      },
      {
        name: "Giant Sequoia",
        score: 10,
      },
      {
        name: "Coast Redwood",
        score: 10,
      },
      {
        name: "Sugar Maple",
        score: 10,
      },
      {
        name: "Weeping Willow",
        score: 15,
      },
      {
        name: "Coconut Palm",
        score: 15,
      },
      {
        name: "Scots Pine",
        score: 15,
      },
      {
        name: "American Beech",
        score: 30,
      },
      {
        name: "American Elm",
        score: 30,
      },
      {
        name: "Black Walnut",
        score: 30,
      },
      {
        name: "Blue Spruce",
        score: 30,
        aliases: ["Colorado Blue Spruce"],
      },
      {
        name: "Douglas Fir",
        score: 30,
      },
      {
        name: "European Beech",
        score: 30,
      },
      {
        name: "European Larch",
        score: 30,
      },
      {
        name: "Horse Chestnut",
        score: 30,
      },
      {
        name: "Japanese Maple",
        score: 30,
      },
      {
        name: "Norway Spruce",
        score: 30,
      },
      {
        name: "Red Maple",
        score: 30,
      },
      {
        name: "White Oak",
        score: 30,
      },
      {
        name: "Bald Cypress",
        score: 60,
      },
      {
        name: "Common Yew",
        score: 60,
        aliases: ["English Yew"],
      },
      {
        name: "Eastern Hemlock",
        score: 60,
      },
      {
        name: "Ginkgo",
        score: 60,
        aliases: ["Ginkgo Biloba", "Maidenhair Tree"],
      },
      {
        name: "London Plane",
        score: 60,
      },
      {
        name: "Quaking Aspen",
        score: 60,
      },
      {
        name: "Sweetgum",
        score: 60,
        aliases: ["American Sweetgum"],
      },
      {
        name: "Tulip Tree",
        score: 60,
      },
      {
        name: "Dawn Redwood",
        score: 85,
      },
      {
        name: "European Hornbeam",
        score: 85,
      },
      {
        name: "Monkey Puzzle",
        score: 85,
        aliases: ["Monkey Puzzle Tree"],
      },
      {
        name: "Sourwood",
        score: 85,
      },
      {
        name: "Wollemi Pine",
        score: 85,
      },
      {
        name: "Great Basin Bristlecone Pine",
        score: 100,
        aliases: ["Pinus longaeva"],
      },
      {
        name: "Dragon Blood Tree",
        score: 100,
        aliases: ["Socotra Dragon Tree"],
      },
      {
        name: "New Zealand Kauri",
        score: 100,
        aliases: ["Agathis australis"],
      },
    ],
  },
  {
    id: "world-butterfly-species",
    category: "Nature",
    prompt: "Name a species of butterfly.",
    note: "Common or scientific names of butterfly species qualify. Moths and broad butterfly families do not qualify.",
    answers: [
      {
        name: "Monarch",
        score: 10,
        aliases: ["Monarch Butterfly"],
      },
      {
        name: "Painted Lady",
        score: 10,
      },
      {
        name: "Red Admiral",
        score: 10,
      },
      {
        name: "Cabbage White",
        score: 10,
        aliases: ["Small White"],
      },
      {
        name: "Menelaus Blue Morpho",
        score: 15,
        aliases: ["Menelaus Morpho"],
      },
      {
        name: "European Peacock",
        score: 15,
        aliases: ["Peacock Butterfly"],
      },
      {
        name: "Common Blue",
        score: 30,
      },
      {
        name: "Orange Tip",
        score: 30,
      },
      {
        name: "Small Tortoiseshell",
        score: 30,
      },
      {
        name: "Comma",
        score: 30,
      },
      {
        name: "Brimstone",
        score: 30,
        aliases: ["Common Brimstone"],
      },
      {
        name: "Mourning Cloak",
        score: 30,
        aliases: ["Camberwell Beauty"],
      },
      {
        name: "Clouded Yellow",
        score: 30,
      },
      {
        name: "Giant Swallowtail",
        score: 60,
      },
      {
        name: "Eastern Tiger Swallowtail",
        score: 60,
      },
      {
        name: "Zebra Longwing",
        score: 60,
      },
      {
        name: "Common Buckeye",
        score: 60,
      },
      {
        name: "Viceroy",
        score: 60,
      },
      {
        name: "Malachite",
        score: 60,
        aliases: ["Malachite Butterfly"],
      },
      {
        name: "Purple Emperor",
        score: 85,
      },
      {
        name: "Speckled Wood",
        score: 85,
      },
      {
        name: "Queen",
        score: 85,
        aliases: ["Queen Butterfly"],
      },
      {
        name: "Glasswing",
        score: 85,
        aliases: ["Glasswing Butterfly"],
      },
      {
        name: "Queen Alexandra's Birdwing",
        score: 100,
      },
      {
        name: "Apollo",
        score: 100,
        aliases: ["Apollo Butterfly"],
      },
      {
        name: "Rajah Brooke's Birdwing",
        score: 100,
      },
    ],
  },
  {
    id: "world-marsupial-species",
    category: "Nature",
    prompt: "Name a species of marsupial.",
    note: "Name a living or extinct marsupial species by its common or scientific name. The prompt does not restrict answers to living species. Broad groups such as kangaroo or opossum alone do not identify a species.",
    answers: [
      {
        name: "Koala",
        score: 10,
      },
      {
        name: "Red Kangaroo",
        score: 10,
      },
      {
        name: "Tasmanian Devil",
        score: 10,
      },
      {
        name: "Quokka",
        score: 10,
      },
      {
        name: "Common Wombat",
        score: 10,
      },
      {
        name: "Sugar Glider",
        score: 15,
      },
      {
        name: "Virginia Opossum",
        score: 15,
      },
      {
        name: "Eastern Grey Kangaroo",
        score: 30,
        aliases: ["Eastern Gray Kangaroo"],
      },
      {
        name: "Western Grey Kangaroo",
        score: 30,
        aliases: ["Western Gray Kangaroo"],
      },
      {
        name: "Red-Necked Wallaby",
        score: 30,
      },
      {
        name: "Numbat",
        score: 30,
      },
      {
        name: "Greater Bilby",
        score: 30,
        aliases: ["Bilby"],
      },
      {
        name: "Southern Hairy-Nosed Wombat",
        score: 30,
      },
      {
        name: "Northern Hairy-Nosed Wombat",
        score: 30,
      },
      {
        name: "Common Brushtail Possum",
        score: 60,
      },
      {
        name: "Common Ringtail Possum",
        score: 60,
      },
      {
        name: "Tiger Quoll",
        score: 60,
        aliases: ["Spotted-Tailed Quoll"],
      },
      {
        name: "Eastern Quoll",
        score: 60,
      },
      {
        name: "Yellow-Footed Rock-Wallaby",
        score: 60,
      },
      {
        name: "Lumholtz Tree-Kangaroo",
        score: 60,
        aliases: ["Lumholtz's Tree-Kangaroo"],
      },
      {
        name: "Honey Possum",
        score: 85,
      },
      {
        name: "Water Opossum",
        score: 85,
        aliases: ["Yapok"],
      },
      {
        name: "Western Barred Bandicoot",
        score: 85,
      },
      {
        name: "Mountain Pygmy Possum",
        score: 100,
      },
      {
        name: "Striped Possum",
        score: 100,
      },
      {
        name: "Northern Bettong",
        score: 100,
      },
      {
        name: "Thylacine",
        score: 60,
        aliases: [
          "Tasmanian Tiger",
          "Tasmanian Wolf",
          "Thylacinus cynocephalus",
        ],
      },
    ],
  },
  {
    id: "world-pasta-shapes",
    category: "Food",
    prompt: "Name an Italian pasta shape.",
    note: "Named Italian pasta shapes qualify, including dried, fresh, and filled pasta. Common Italian or English shape names are accepted; sauces and complete dishes do not qualify.",
    answers: [
      {
        name: "Spaghetti",
        score: 10,
      },
      {
        name: "Penne",
        score: 10,
      },
      {
        name: "Macaroni",
        score: 10,
      },
      {
        name: "Fusilli",
        score: 10,
      },
      {
        name: "Ravioli",
        score: 10,
      },
      {
        name: "Farfalle",
        score: 15,
        aliases: ["Bow Tie Pasta"],
      },
      {
        name: "Lasagne",
        score: 15,
        aliases: ["Lasagna"],
      },
      {
        name: "Linguine",
        score: 15,
      },
      {
        name: "Fettuccine",
        score: 30,
      },
      {
        name: "Tagliatelle",
        score: 30,
      },
      {
        name: "Rigatoni",
        score: 30,
      },
      {
        name: "Tortellini",
        score: 30,
      },
      {
        name: "Cannelloni",
        score: 30,
      },
      {
        name: "Conchiglie",
        score: 30,
      },
      {
        name: "Orzo",
        score: 30,
      },
      {
        name: "Vermicelli",
        score: 30,
      },
      {
        name: "Orecchiette",
        score: 30,
      },
      {
        name: "Pappardelle",
        score: 30,
      },
      {
        name: "Bucatini",
        score: 30,
      },
      {
        name: "Cavatappi",
        score: 60,
      },
      {
        name: "Capellini",
        score: 60,
        aliases: ["Angel Hair"],
      },
      {
        name: "Ditalini",
        score: 60,
      },
      {
        name: "Gemelli",
        score: 60,
      },
      {
        name: "Paccheri",
        score: 60,
      },
      {
        name: "Rotini",
        score: 60,
      },
      {
        name: "Stelline",
        score: 60,
      },
      {
        name: "Ziti",
        score: 60,
      },
      {
        name: "Agnolotti",
        score: 85,
      },
      {
        name: "Casarecce",
        score: 85,
      },
      {
        name: "Garganelli",
        score: 85,
      },
      {
        name: "Mafaldine",
        score: 85,
      },
      {
        name: "Trofie",
        score: 85,
      },
      {
        name: "Campanelle",
        score: 100,
      },
      {
        name: "Cencioni",
        score: 100,
      },
      {
        name: "Corzetti",
        score: 100,
      },
      {
        name: "Radiatori",
        score: 100,
      },
    ],
  },
  {
    id: "world-cheeses",
    category: "Food",
    prompt: "Name a cheese variety.",
    note: "Named cheese varieties and established cheese styles qualify, made from cow milk or another milk. Familiar styles such as blue cheese and cream cheese count; dishes and dressings containing cheese do not.",
    answers: [
      {
        name: "Cheddar",
        score: 10,
      },
      {
        name: "Mozzarella",
        score: 10,
      },
      {
        name: "Brie",
        score: 10,
      },
      {
        name: "Parmesan",
        score: 10,
        aliases: ["Parmigiano Reggiano"],
      },
      {
        name: "Feta",
        score: 10,
      },
      {
        name: "Gouda",
        score: 15,
      },
      {
        name: "Camembert",
        score: 15,
      },
      {
        name: "Halloumi",
        score: 15,
      },
      {
        name: "Edam",
        score: 30,
      },
      {
        name: "Emmental",
        score: 30,
        aliases: ["Emmentaler"],
      },
      {
        name: "Gorgonzola",
        score: 30,
      },
      {
        name: "Gruyere",
        score: 30,
        aliases: ["Gruyère"],
      },
      {
        name: "Manchego",
        score: 30,
      },
      {
        name: "Mascarpone",
        score: 30,
      },
      {
        name: "Monterey Jack",
        score: 30,
      },
      {
        name: "Paneer",
        score: 30,
      },
      {
        name: "Ricotta",
        score: 30,
      },
      {
        name: "Roquefort",
        score: 30,
      },
      {
        name: "Stilton",
        score: 30,
      },
      {
        name: "Asiago",
        score: 60,
      },
      {
        name: "Burrata",
        score: 60,
      },
      {
        name: "Cotija",
        score: 60,
      },
      {
        name: "Havarti",
        score: 60,
      },
      {
        name: "Mimolette",
        score: 60,
      },
      {
        name: "Pecorino Romano",
        score: 60,
      },
      {
        name: "Provolone",
        score: 60,
      },
      {
        name: "Reblochon",
        score: 60,
      },
      {
        name: "Taleggio",
        score: 60,
      },
      {
        name: "Cabrales",
        score: 85,
      },
      {
        name: "Comte",
        score: 85,
        aliases: ["Comté"],
      },
      {
        name: "Limburger",
        score: 85,
      },
      {
        name: "Ossau-Iraty",
        score: 85,
      },
      {
        name: "Raclette",
        score: 85,
      },
      {
        name: "Caciocavallo",
        score: 100,
      },
      {
        name: "Morbier",
        score: 100,
      },
      {
        name: "Munster",
        score: 100,
      },
      {
        name: "Tete de Moine",
        score: 100,
        aliases: ["Tête de Moine"],
      },
      { name: "Blue Cheese", score: 15, aliases: ["Bleu Cheese"] },
      { name: "Cream Cheese", score: 10 },
    ],
  },
  {
    id: "world-culinary-fruits",
    category: "Food",
    prompt: "Name a fruit commonly eaten as fruit.",
    note: "Use a fruit type commonly served sweet or tart, whether fresh, cooked, or dried. Botanical fruits usually treated as vegetables, such as tomato, do not qualify.",
    answers: [
      {
        name: "Apple",
        score: 10,
      },
      {
        name: "Banana",
        score: 10,
      },
      {
        name: "Orange",
        score: 10,
      },
      {
        name: "Strawberry",
        score: 10,
      },
      {
        name: "Grape",
        score: 10,
      },
      {
        name: "Mango",
        score: 15,
      },
      {
        name: "Pineapple",
        score: 15,
      },
      {
        name: "Watermelon",
        score: 15,
      },
      {
        name: "Apricot",
        score: 30,
      },
      {
        name: "Blackberry",
        score: 30,
      },
      {
        name: "Blueberry",
        score: 30,
      },
      {
        name: "Cherry",
        score: 30,
      },
      {
        name: "Coconut",
        score: 30,
      },
      {
        name: "Cranberry",
        score: 30,
      },
      {
        name: "Date",
        score: 30,
      },
      {
        name: "Fig",
        score: 30,
      },
      {
        name: "Grapefruit",
        score: 30,
      },
      {
        name: "Kiwi",
        score: 30,
        aliases: ["Kiwifruit"],
      },
      {
        name: "Lemon",
        score: 30,
      },
      {
        name: "Lime",
        score: 30,
      },
      {
        name: "Peach",
        score: 30,
      },
      {
        name: "Pear",
        score: 30,
      },
      {
        name: "Plum",
        score: 30,
      },
      {
        name: "Raspberry",
        score: 30,
      },
      {
        name: "Guava",
        score: 60,
      },
      {
        name: "Lychee",
        score: 60,
      },
      {
        name: "Passion Fruit",
        score: 60,
      },
      {
        name: "Persimmon",
        score: 60,
      },
      {
        name: "Pomegranate",
        score: 60,
      },
      {
        name: "Quince",
        score: 60,
      },
      {
        name: "Starfruit",
        score: 60,
        aliases: ["Carambola"],
      },
      {
        name: "Cherimoya",
        score: 85,
      },
      {
        name: "Durian",
        score: 85,
      },
      {
        name: "Jackfruit",
        score: 85,
      },
      {
        name: "Mangosteen",
        score: 85,
      },
      {
        name: "Rambutan",
        score: 85,
      },
      {
        name: "Jabuticaba",
        score: 100,
      },
      {
        name: "Salak",
        score: 100,
        aliases: ["Snake Fruit"],
      },
      {
        name: "Soursop",
        score: 100,
      },
    ],
  },
  {
    id: "world-vegetables",
    category: "Food",
    prompt: "Name a culinary vegetable.",
    note: "Foods generally served as culinary vegetables qualify, including roots, leaves, stems, botanical fruits, edible mushrooms, fresh peas, beans, and sweetcorn. Culinary usage matters rather than botanical classification; dry cereal grains and herbs used only as seasonings do not qualify.",
    answers: [
      {
        name: "Carrot",
        score: 10,
      },
      {
        name: "Potato",
        score: 10,
      },
      {
        name: "Onion",
        score: 10,
      },
      {
        name: "Broccoli",
        score: 10,
      },
      {
        name: "Tomato",
        score: 10,
      },
      {
        name: "Cucumber",
        score: 15,
      },
      {
        name: "Lettuce",
        score: 15,
      },
      {
        name: "Spinach",
        score: 15,
      },
      {
        name: "Artichoke",
        score: 30,
      },
      {
        name: "Asparagus",
        score: 30,
      },
      {
        name: "Aubergine",
        score: 30,
        aliases: ["Eggplant"],
      },
      {
        name: "Beetroot",
        score: 30,
        aliases: ["Beet"],
      },
      {
        name: "Bell Pepper",
        score: 30,
        aliases: ["Sweet Pepper"],
      },
      {
        name: "Brussels Sprouts",
        score: 30,
      },
      {
        name: "Cabbage",
        score: 30,
      },
      {
        name: "Cauliflower",
        score: 30,
      },
      {
        name: "Celery",
        score: 30,
      },
      {
        name: "Courgette",
        score: 30,
        aliases: ["Zucchini"],
      },
      {
        name: "Garlic",
        score: 30,
      },
      {
        name: "Leek",
        score: 30,
      },
      {
        name: "Parsnip",
        score: 30,
      },
      {
        name: "Radish",
        score: 30,
      },
      {
        name: "Sweet Potato",
        score: 30,
      },
      {
        name: "Turnip",
        score: 30,
      },
      {
        name: "Bok Choy",
        score: 60,
        aliases: ["Pak Choi"],
      },
      {
        name: "Celeriac",
        score: 60,
        aliases: ["Celery Root"],
      },
      {
        name: "Fennel",
        score: 60,
      },
      {
        name: "Kale",
        score: 60,
      },
      {
        name: "Kohlrabi",
        score: 60,
      },
      {
        name: "Okra",
        score: 60,
      },
      {
        name: "Rutabaga",
        score: 60,
        aliases: ["Swede"],
      },
      {
        name: "Swiss Chard",
        score: 60,
        aliases: ["Chard"],
      },
      {
        name: "Cassava",
        score: 85,
        aliases: ["Manioc", "Yuca"],
      },
      {
        name: "Jerusalem Artichoke",
        score: 85,
        aliases: ["Sunchoke"],
      },
      {
        name: "Lotus Root",
        score: 85,
      },
      {
        name: "Salsify",
        score: 85,
      },
      {
        name: "Celtuce",
        score: 100,
      },
      {
        name: "Oca",
        score: 100,
      },
      {
        name: "Skirret",
        score: 100,
      },
      { name: "Mushroom", score: 10, aliases: ["Mushrooms"] },
      { name: "Button Mushroom", score: 15, aliases: ["White Mushroom"] },
      { name: "Shiitake", score: 30, aliases: ["Shiitake Mushroom"] },
      { name: "Oyster Mushroom", score: 30 },
      { name: "Sweetcorn", score: 10, aliases: ["Sweet Corn", "Corn"] },
    ],
  },
  {
    id: "world-culinary-herbs",
    category: "Food",
    prompt: "Name a culinary herb used for its leaves.",
    note: "Fresh or dried plant leaves used to season food qualify. Seeds, bark, roots, and plants used only medicinally do not qualify.",
    answers: [
      {
        name: "Basil",
        score: 10,
      },
      {
        name: "Mint",
        score: 10,
      },
      {
        name: "Parsley",
        score: 10,
      },
      {
        name: "Rosemary",
        score: 10,
      },
      {
        name: "Thyme",
        score: 10,
      },
      {
        name: "Coriander",
        score: 15,
        aliases: ["Cilantro"],
      },
      {
        name: "Oregano",
        score: 15,
      },
      {
        name: "Sage",
        score: 15,
      },
      {
        name: "Bay Leaf",
        score: 30,
        aliases: ["Bay"],
      },
      {
        name: "Chives",
        score: 30,
      },
      {
        name: "Dill",
        score: 30,
      },
      {
        name: "Lemongrass",
        score: 30,
      },
      {
        name: "Marjoram",
        score: 30,
      },
      {
        name: "Tarragon",
        score: 30,
      },
      {
        name: "Chervil",
        score: 60,
      },
      {
        name: "Curry Leaf",
        score: 60,
      },
      {
        name: "Lemon Balm",
        score: 60,
      },
      {
        name: "Lovage",
        score: 60,
      },
      {
        name: "Sorrel",
        score: 60,
      },
      {
        name: "Culantro",
        score: 85,
      },
      {
        name: "Epazote",
        score: 85,
      },
      {
        name: "Shiso",
        score: 85,
        aliases: ["Perilla"],
      },
      {
        name: "Summer Savory",
        score: 85,
      },
      {
        name: "Huacatay",
        score: 100,
      },
      {
        name: "Lemon Verbena",
        score: 100,
      },
      {
        name: "Vietnamese Coriander",
        score: 100,
        aliases: ["Rau Ram"],
      },
    ],
  },
  {
    id: "world-culinary-spices",
    category: "Food",
    prompt: "Name a culinary spice.",
    note: "A non-leafy plant seasoning qualifies, including seeds, fruit, bark, roots, flower parts, and resins. Spice blends such as garam masala do not qualify.",
    answers: [
      {
        name: "Cinnamon",
        score: 10,
      },
      {
        name: "Black Pepper",
        score: 10,
      },
      {
        name: "Cumin",
        score: 10,
      },
      {
        name: "Ginger",
        score: 10,
      },
      {
        name: "Paprika",
        score: 10,
      },
      {
        name: "Turmeric",
        score: 15,
      },
      {
        name: "Nutmeg",
        score: 15,
      },
      {
        name: "Clove",
        score: 15,
        aliases: ["Cloves"],
      },
      {
        name: "Allspice",
        score: 30,
      },
      {
        name: "Anise",
        score: 30,
        aliases: ["Aniseed"],
      },
      {
        name: "Cardamom",
        score: 30,
      },
      {
        name: "Cayenne",
        score: 30,
        aliases: ["Cayenne Pepper"],
      },
      {
        name: "Coriander Seed",
        score: 30,
        aliases: ["Coriander"],
      },
      {
        name: "Fennel Seed",
        score: 30,
      },
      {
        name: "Fenugreek",
        score: 30,
      },
      {
        name: "Mustard Seed",
        score: 30,
      },
      {
        name: "Saffron",
        score: 30,
      },
      {
        name: "Star Anise",
        score: 30,
      },
      {
        name: "Vanilla",
        score: 30,
      },
      {
        name: "Caraway",
        score: 60,
      },
      {
        name: "Celery Seed",
        score: 60,
      },
      {
        name: "Mace",
        score: 60,
      },
      {
        name: "Nigella",
        score: 60,
        aliases: ["Black Seed"],
      },
      {
        name: "Sumac",
        score: 60,
      },
      {
        name: "Szechuan Pepper",
        score: 60,
        aliases: ["Sichuan Pepper"],
      },
      {
        name: "Ajwain",
        score: 85,
        aliases: ["Carom Seed"],
      },
      {
        name: "Annatto",
        score: 85,
        aliases: ["Achiote"],
      },
      {
        name: "Asafoetida",
        score: 85,
        aliases: ["Hing"],
      },
      {
        name: "Juniper Berry",
        score: 85,
        aliases: ["Juniper Berries"],
      },
      {
        name: "Grains of Paradise",
        score: 100,
      },
      {
        name: "Long Pepper",
        score: 100,
      },
      {
        name: "Mahleb",
        score: 100,
      },
    ],
  },
  {
    id: "world-breads",
    category: "Food",
    prompt: "Name a traditional type of bread.",
    note: "Named bread styles qualify, including flatbreads, loaves, and rolls. A filling or topping alone does not identify a type of bread.",
    answers: [
      {
        name: "Baguette",
        score: 10,
      },
      {
        name: "Bagel",
        score: 10,
      },
      {
        name: "Brioche",
        score: 10,
      },
      {
        name: "Naan",
        score: 10,
      },
      {
        name: "Sourdough",
        score: 10,
      },
      {
        name: "Pita",
        score: 15,
        aliases: ["Pitta"],
      },
      {
        name: "Focaccia",
        score: 15,
      },
      {
        name: "Ciabatta",
        score: 15,
      },
      {
        name: "Challah",
        score: 30,
      },
      {
        name: "Chapati",
        score: 30,
        aliases: ["Chapatti"],
      },
      {
        name: "Cornbread",
        score: 30,
      },
      {
        name: "English Muffin",
        score: 30,
      },
      {
        name: "Flatbread",
        score: 30,
      },
      {
        name: "Injera",
        score: 30,
      },
      {
        name: "Lavash",
        score: 30,
      },
      {
        name: "Pumpernickel",
        score: 30,
      },
      {
        name: "Roti",
        score: 30,
      },
      {
        name: "Rye Bread",
        score: 30,
      },
      {
        name: "Soda Bread",
        score: 30,
      },
      {
        name: "Tortilla",
        score: 30,
      },
      {
        name: "Arepa",
        score: 60,
      },
      {
        name: "Bannock",
        score: 60,
      },
      {
        name: "Crumpet",
        score: 60,
      },
      {
        name: "Damper",
        score: 60,
      },
      {
        name: "Lefse",
        score: 60,
      },
      {
        name: "Mantou",
        score: 60,
      },
      {
        name: "Paratha",
        score: 60,
      },
      {
        name: "Puri",
        score: 60,
        aliases: ["Poori"],
      },
      {
        name: "Shokupan",
        score: 60,
      },
      {
        name: "Barmbrack",
        score: 85,
      },
      {
        name: "Borodinsky Bread",
        score: 85,
      },
      {
        name: "Knackebrod",
        score: 85,
        aliases: ["Knäckebröd"],
      },
      {
        name: "Lahoh",
        score: 85,
      },
      {
        name: "Bazlama",
        score: 100,
      },
      {
        name: "Broa",
        score: 100,
      },
      {
        name: "Pandesal",
        score: 100,
      },
      {
        name: "Tunnbrod",
        score: 100,
        aliases: ["Tunnbröd"],
      },
    ],
  },
  {
    id: "world-edible-legumes",
    category: "Food",
    prompt: "Name an edible bean, pea or lentil.",
    note: "Legumes eaten as seeds or seed pods qualify. Familiar culinary types count even when they are varieties of the same species; nuts other than peanut are excluded.",
    answers: [
      {
        name: "Chickpea",
        score: 10,
        aliases: ["Garbanzo Bean"],
      },
      {
        name: "Kidney Bean",
        score: 10,
      },
      {
        name: "Lentil",
        score: 10,
      },
      {
        name: "Pea",
        score: 10,
        aliases: ["Garden Pea", "Green Pea"],
      },
      {
        name: "Peanut",
        score: 10,
        aliases: ["Groundnut"],
      },
      {
        name: "Black Bean",
        score: 15,
      },
      {
        name: "Soybean",
        score: 15,
        aliases: ["Soya Bean"],
      },
      {
        name: "Edamame",
        score: 15,
      },
      {
        name: "Black-Eyed Pea",
        score: 30,
        aliases: ["Cowpea"],
      },
      {
        name: "Broad Bean",
        score: 30,
        aliases: ["Fava Bean"],
      },
      {
        name: "Cannellini Bean",
        score: 30,
      },
      {
        name: "Lima Bean",
        score: 30,
        aliases: ["Butter Bean"],
      },
      {
        name: "Mung Bean",
        score: 30,
      },
      {
        name: "Navy Bean",
        score: 30,
        aliases: ["Haricot Bean"],
      },
      {
        name: "Pinto Bean",
        score: 30,
      },
      {
        name: "Split Pea",
        score: 30,
      },
      {
        name: "Adzuki Bean",
        score: 60,
        aliases: ["Azuki Bean"],
      },
      {
        name: "Borlotti Bean",
        score: 60,
        aliases: ["Cranberry Bean"],
      },
      {
        name: "Pigeon Pea",
        score: 60,
      },
      {
        name: "Runner Bean",
        score: 60,
      },
      {
        name: "Snow Pea",
        score: 60,
      },
      {
        name: "Sugar Snap Pea",
        score: 60,
      },
      {
        name: "Bambara Groundnut",
        score: 85,
      },
      {
        name: "Hyacinth Bean",
        score: 85,
      },
      {
        name: "Lupin Bean",
        score: 85,
        aliases: ["Lupini Bean"],
      },
      {
        name: "Tepary Bean",
        score: 85,
      },
      {
        name: "Grass Pea",
        score: 100,
      },
      {
        name: "Horse Gram",
        score: 100,
      },
      {
        name: "Moth Bean",
        score: 100,
      },
      {
        name: "Winged Bean",
        score: 100,
      },
    ],
  },
];
