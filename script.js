/* --- CONFIGURATION GLOBALE --- */
const animalAvatars = [
    "https://openmoji.org/data/color/svg/1F981.svg", "https://openmoji.org/data/color/svg/1F43C.svg",
    "https://openmoji.org/data/color/svg/1F43B.svg", "https://openmoji.org/data/color/svg/1F428.svg",
    "https://openmoji.org/data/color/svg/1F94A.svg", "https://openmoji.org/data/color/svg/1F99D.svg",
    "https://openmoji.org/data/color/svg/1F412.svg", "https://openmoji.org/data/color/svg/1F418.svg",
    "https://openmoji.org/data/color/svg/1F430.svg", "https://openmoji.org/data/color/svg/1F42F.svg",
    "https://openmoji.org/data/color/svg/1F436.svg", "https://openmoji.org/data/color/svg/1F431.svg",
    "https://openmoji.org/data/color/svg/1F992.svg", "https://openmoji.org/data/color/svg/1F99B.svg",
    "https://openmoji.org/data/color/svg/1F437.svg", "https://openmoji.org/data/color/svg/1F993.svg",
    "https://openmoji.org/data/color/svg/1F989.svg", "https://openmoji.org/data/color/svg/1F438.svg",
    "https://openmoji.org/data/color/svg/1F98C.svg", "https://openmoji.org/data/color/svg/1F427.svg"
]
let players = [];
let availableQuestions = []; // Liste des questions neuves
let usedQuestions = [];      // Liste des questions déjà posées
let playerCount = 3;
let currentRound = 1;
let activePlayerIdx = 0;
let chainIdx = 0;
let scoreBank = 0;
let timeLeft = 60;
let timerInterval = null;
let isPaused = false;
let themeStats = {};
let lastLoadedQuestionTheme = "";
let totalAccordsSaved = 0; // Cumul des accords sécurisés (Banque)
let totalAccordsLost = 0;  // Cumul des accords perdus par erreur
let totalQuestionsAsked = 0;
let realCorrectAnswers = 0;     // Les VRAIES bonnes réponses (pour les stats %)
let totalCorrectAnswers = 0;    // Le "Score Social" (pour la jauge, avec bonus)
let totalTeamPoints = 0;

const moneySteps = [0, 50, 100, 250, 500, 1000, 2000, 5000];

/* --- VARIABLES FINALE --- */
let isDuelMode = false;
let duelQuestionsCount = 0;
let duelScores = { player0: 0, player1: 0 };
let duelHistory = { player0: [], player1: [] };
let isSuddenDeath = false;

/* --- CONFIGURATION MUSIQUE ACCUEIL --- */
let bgMusicNodes = null;

// On mélange une fois au chargement
animalAvatars.sort(() => Math.random() - 0.5);

let accordsSignedThisRound = 0; // Compteur d'accords pour la manche en cours

/* --- BASE DE DONNÉES GLOBALE COMPLÈTE --- */
// --- THÈME 1 : INSTANCES & CADRE (31 questions) ---
const THEME_INSTANCES = [
    { q: "Le CSE-C est compétent pour les sujets de 2 établissements, lesquels ?", options: ["Marignane et Paris-Le Bourget", "Toulouse et Nantes"], r: 0, info: "Le CSE Central coordonne la stratégie sociale pour les deux sites principaux d'Airbus Helicopters en France." },
    { q: "Sur combien de pays au moins le Comité Européen est-il compétent ?", options: ["2 pays", "5 pays"], r: 0, info: "L'instance européenne traite des projets impactant au moins deux pays de l'Union Européenne." },
    { q: "Le CSE-E est compétent pour les projets concernant combien d'établissements ?", options: ["1 établissement", "La société entière"], r: 0, info: "Le CSE d'établissement se concentre sur les enjeux locaux et spécifiques à son site de rattachement." },
    { q: "Quelle instance est consultée sur les orientations stratégiques de l'entreprise ?", options: ["Le CSE-C", "Le Comité Européen"], r: 0, info: "La consultation stratégique annuelle est une prérogative majeure du Comité Social et Économique Central." },
    { q: "Quelle instance est consultée sur le Bilan Social Établissement ?", options: ["Le CSE-E", "Le CSE-C"], r: 0, info: "Le Bilan Social est un document local analysé chaque année par les élus du CSE de l'établissement concerné." },
    { q: "Qu'est-ce que le Bilan Social d'Établissement ?", options: ["Un document récapitulant les données sociales sur les 3 dernières années", "Le compte de résultat financier de l'usine"], r: 0, info: "C'est une 'photographie' chiffrée de l'emploi, des rémunérations, de l'hygiène et de la sécurité propre à chaque site." },
    { q: "Le Comité Européen est aussi compétent si un projet a un impact majeur sur...", options: ["L'emploi, la santé ou la sécurité", "Le prix des hélicoptères"], r: 0, info: "L’ECAH veille à la protection des conditions sociales de travail à l'échelle transnationale." },
    { q: "À partir de quel effectif le CSE passe-t-il d'attributions réduites à des attributions étendues ?", options: ["50 salariés", "11 salariés"], r: 0, info: "À 50 salariés, le CSE acquiert la personnalité juridique, des budgets propres et un droit de regard sur la stratégie économique de l'entreprise." },
    { q: "Quels pays siègent au Comité Européen (hors France/Allemagne) ?", options: ["UK, Espagne, Hongrie", "Italie, Belgique, Grèce"], r: 0, info: "La composition du Comité Européen reflète le champ d’application géographique défini dans l’accord sur la constitution de l’ECAH." },
    { q: "Combien de membres Français siègent au Comité Européen ?", options: ["6 membres", "10 membres"], r: 0, info: "La délégation française à l’ECAH est fixée par l'accord de groupe pour assurer une représentativité équilibrée." },
    { q: "Combien de membres d'Allemagne siègent au Comité Européen ?", options: ["4 membres", "2 membres"], r: 0, info: "L'Allemagne, pilier historique du groupe, dispose d'un nombre de sièges proportionnel à ses effectifs." },
    { q: "Combien de membres titulaires composent le CSE-E de Marignane ?", options: ["35 membres", "13 membres"], r: 0, info: "Le nombre d'élus dépend de l'effectif total de l'établissement, Marignane étant le site le plus important." },
    { q: "Combien de membres titulaires composent le CSE-E de Paris-Le Bourget ?", options: ["14 membres", "9 membres"], r: 0, info: "Le nombre d'élus dépend de l'effectif total de l'établissement." },
    { q: "Combien de membres titulaires composent le CSE-C ?", options: ["13 membres", "35 membres"], r: 0, info: "Le CSE Central est composé de représentants désignés parmi les élus des différents CSE-E." },
    { q: "À quelle fréquence le CSE-E se réunit-il ?", options: ["1 fois par mois", "1 fois par trimestre"], r: 0, info: "La réunion mensuelle permet un dialogue régulier sur la vie de l'établissement." },
    { q: "À quelle fréquence le CSE-C se réunit-il ?", options: ["1 fois tous les deux mois", "1 fois par mois"], r: 0, info: "L'instance centrale se réunit généralement de façon bimestrielle pour aborder les sujets/projets impactant MA et PLB." },
    { q: "Quel jour de la semaine se réunit habituellement le CSE-E ?", options: ["Le dernier vendredi du mois", "Le premier lundi du mois"], r: 0, info: "Ce calendrier permet de clore le mois avec une vision claire du climat social." },
    { q: "À quelle fréquence le Comité Européen se réunit-il ?", options: ["1 fois par trimestre", "Tous les mois"], r: 0, info: "Le rythme trimestriel assure une coordination efficace entre les filiales européennes." },
    { q: "Quelle instance remplace désormais le Comité Central d'Entreprise (CCE) ?", options: ["Le CSE-C", "Le Comité Européen"], r: 0, info: "Depuis les ordonnances Macron, le CCE est devenu le Comité Social et Économique Central." },
    { q: "Quelles instances ont été fusionnées pour créer le CSE ?", options: [" les Délégués du Personnel (DP), le Comité d'Entreprise (CE) et le CHSCT (Santé et Sécurité)", "Les Délégués Syndicaux (DS), La Commission Économique et l’Inspection du Travail "], r: 0, info: "Le CSE est né de la fusion de trois instances historiques pour simplifier le dialogue social." },
    { q: "En quelle année a été créé le CSE ?", options: ["2017", "2019"], r: 0, info: "Le 22 septembre 2017 : Signature des Ordonnances Macron (dites 'Ordonnances Travail'). C'est l'acte de naissance légal du CSE." },
    { q: "Combien de commissions dispose le CSE-C ?", options: ["4", "3"], r: 0, info: "Le CSE-C dispose de 4 commissions : Économique, GEPP, Egalité Professionnelle et Développement Durable." },
    { q: "Que signifie CSSCT ?", options: ["Commission Santé, Sécurité et Conditions de Travail", "Comité Supérieur de Surveillance du Café et du Télétravail"], r: 0, info: "La CSSCT est une commission spécialisée qui existe au sein du CSE (Comité Social et Économique) dans les entreprises d'au moins 300 salariés." },
    { q: "Quelles sont les attributions de la CSSCT ?", options: ["Santé, Sécurité, Environnement et Conditions de Travail", "Optimisation et Gestion des Flux"], r: 0, info: "La CSSCT agit par délégation du CSE. Elle ne prend pas de décisions finales (elle n’est pas consultée), mais elle prépare tout le travail de fond sur les sujets de Santé, Sécurité, Environnement et Conditions de Travail." },
    { q: "Quelle est la fréquence des réunions des CSSCT ?", options: ["4 fois par an", "Tous les mois"], r: 0, info: "La commission santé, sécurité et conditions de travail assure un suivi rigoureux des risques." },
    { q: "Quel est le rôle du 'Référent Harcèlement' du CSE ?", options: ["Orienter et accompagner les salariés", "Accompagner et Sanctionner"], r: 0, info: "L'élu référent est un interlocuteur clé pour la prévention et l'écoute des salariés en difficulté." },
    { q: "Qui préside les séances du CSE-E chez Airbus Helicopters ?", options: ["L'employeur (ou son représentant)", "Le Secrétaire du CSE"], r: 0, info: "Le CSE est une instance paritaire : il est présidé par la direction, tandis que l'ordre du jour est signé conjointement avec le Secrétaire." },
    { q: "Qu'est-ce que l'ordre du jour d'un CSE ?", options: ["La liste des sujets qui seront communiqués en séance", "Le compte-rendu de la réunion précédente"], r: 0, info: "L'ordre du jour doit être communiqué aux membres au moins 3 jours avant la réunion pour un CSE d'établissement." },
    { q: "Quel est le rôle du 'Secrétaire' au sein du CSE-E ?", options: ["Organiser les travaux du CSE et rédiger les procès-verbaux", "Gérer uniquement la billetterie et les vacances"], r: 0, info: "Le Secrétaire est l'interlocuteur privilégié de la direction et le porte-parole officiel de l'instance." },
    { q: "Qui prépare l'ordre du jour du CSE ?", options: ["Le Président et le Secrétaire", "La Direction seule"], r: 0, info: "L'ordre du jour doit impérativement être signé par les deux parties." },
    { q: "Quels sont les deux budgets distincts gérés par le CSE?", options: ["Fonctionnement et Activités Sociales (ASC)", "Frais de déplacement et Rémunération des membres du bureau"], r: 0, info: "Le budget de fonctionnement sert à la vie du CSE (formation, experts, fournitures…), tandis que le budget des ASC est dédié aux avantages des salariés (chèques cadeaux, voyages, sport…)." },
    { q: "Le CSE peut-il se faire assister par un expert-comptable ?", options: ["Oui, pour analyser les comptes et la stratégie de l'entreprise", "Non, c'est interdit par le secret industriel"], r: 0, info: "Le CSE a le droit de nommer un expert, financé par l'entreprise, pour l'aider à comprendre les dossiers économiques complexes." }
];

// --- THÈME 2 : SYNDICATS & REPRÉSENTATIVITÉ (18 questions) ---
const THEME_SYNDICATS = [
    { q: "Quel est le 1er syndicat représentatif (tous collèges confondus) chez Airbus Helicopters ?", options: ["FO", "CFE-CGC"], r: 0, info: "Force Ouvrière (FO) conserve sa position de leader suite aux dernières élections (avec environ 37% des voix au niveau global), portée par une forte base historique, notamment au sein du collège Ouvrier/Production." },
    { q: "Suite aux élections de 2023, quel est le 2ème syndicat représentatif chez Airbus Helicopters ?", options: ["CFE-CGC", "CFTC"], r: 0, info: "Avec environ 32 % des voix au niveau global, la CFE-CGC est la 2ème force syndicale derrière FO. Elle reste cependant l'organisation leader sur les collèges cadres et techniciens." },
    { q: "Quel est le 3ème syndicat représentatif chez Airbus Helicopters ?", options: ["CFTC", "CGT"], r: 0, info: "La CFTC occupe la 3ème place du podium chez Airbus Helicopters (environ 18% des voix au niveau global), devant la CGT, grâce à une implantation stable dans les différents collèges" },
    { q: "Combien de syndicats y a-t-il à Marignane ?", options: ["7", "3"], r: 0, info: "Le site de Marignane possède un paysage syndical riche avec 7 organisations syndicales présentes." },
    { q: "Combien de syndicats y a-t-il à Paris-Le Bourget ?", options: ["5", "3"], r: 0, info: "Malgré sa taille réduite par rapport à Marignane, le site parisien compte 5 organisations syndicales." },
    { q: "Quel syndicat a été créé à Marignane en 2023 ?", options: ["Printemps écologique", "CFDT"], r: 0, info: "Ce syndicat récent se concentre sur les enjeux environnementaux liés à l'aéronautique." },
    { q: "Quel syndicat a été créé à Marignane et PLB en 1938 ?", options: ["CGT", "FO"], r: 0, info: "La CGT est l'un des syndicats historiques présents depuis la création du site aéronautique." },
    { q: "En quelle année la section FO a-t-elle été créée sur le site de Marignane ?", options: ["1961", "1976"], r: 0, info: "FO s'est implanté solidement à Marignane dès 1961, devenant rapidement un acteur majeur du dialogue social sur le site." },
    { q: "En quelle année la section syndicale FO a-t-elle été créée sur le site aéronautique du Bourget ?", options: ["1976", "1961"], r: 0, info: "Si FO s'est implanté solidement à Marignane dès 1961, il a fallu attendre 1976 pour voir la section de PLB voir le jour." },
    { q: "En quelle année la section CFE-CGC (ex-CGC) s'est-elle structurée sur le site de Marignane ?", options: ["1968", "1938"], r: 0, info: "C'est lors des mouvements de mai 1968 que l'encadrement de Sud-Aviation (devenu Airbus Helicopters) a structuré sa représentation syndicale de façon autonome." },
    { q: "En quelle année la section CFTC a-t-elle été officiellement créée sur le site de Marignane ?", options: ["1975", "2012"], r: 0, info: "La section CFTC de l'usine de Marignane (alors SNIAS) a été créée en 1975, s'inscrivant dans la volonté de proposer un syndicalisme de construction sociale." },
    { q: "En quelle année la section CFDT s’est-elle structurée sur le site de Marignane ?", options: ["1973", "1984"], r: 0, info: "La CFDT (issue de la déconfessionnalisation de la CFTC en 1964) a mis quelques années à s'implanter solidement dans l'aéronautique face aux bastions FO et CGT. 1973 correspond à la période de montée en puissance des revendications sur les conditions de travail à Marignane.." },
    { q: "Quel syndicat a fait son apparition sur le site de Marignane en 2012 ?", options: ["UNSA", "CFDT"], r: 0, info: "L'UNSA s'est implantée chez Airbus Helicopters en 2012, se positionnant comme une alternative autonome et réformiste aux organisations historiques." },
    { q: "Quel syndicat place 'l'humanisme, l'équité et la responsabilité' au cœur de son engagement ?", options: ["CFE-CGC", "CGT"], r: 0, info: "Ces trois piliers constituent le socle de l'identité de la CFE-CGC, qu'elle applique à la défense spécifique des intérêts de l'encadrement et des techniciens." },
    { q: "Quel syndicat place la 'République sociale, la démocratie et la laïcité' au sommet de ses principes ?", options: ["FO", "CFTC"], r: 0, info: "Ces valeurs sont les piliers statutaires de Force Ouvrière, garantissant son indépendance absolue vis-à-vis des partis politiques et des religions." },
    { q: "Quel syndicat se définit historiquement comme un syndicat de 'lutte de classe' ?", options: ["CGT", "CFDT"], r: 0, info: "La CGT prône la transformation sociale par le rapport de force et la mobilisation, se distinguant du syndicalisme dit de 'négociation' ou réformiste." },
    { q: "L'UNSA se définit comme un syndicat dit...", options: ["Réformiste", "De contestation"], r: 0, info: "L'UNSA (Union Nationale des Syndicats Autonomes) privilégie la négociation et le dialogue constructif, une approche qualifiée de syndicalisme réformiste." },
    { q: "Quelles sont les organisations syndicales non représentatives à Marignane ?", options: ["CGT, CFDT, UNSA, PRINTEMPS ÉCOLOGIQUE", "FO, CFE-CGC, CFTC"], r: 0, info: "Pour être représentatif, un syndicat doit franchir le seuil des 10% au 1er tour." },
    { q: "Quel est le seuil de suffrages pour être représentatif ?", options: ["10%", "5%"], r: 0, info: "La loi de 2008 fixe ce seuil à 10% pour pouvoir signer des accords d'entreprise." }
];

// --- THÈME 3 : ÉLECTIONS & PROTOCOLE (PAP) (30 questions) ---
const THEME_ELECTIONS = [
    { q: "Pour être électeur, quel est l'âge minimum requis ?", options: ["16 ans", "18 ans"], r: 0, info: "Sont électeurs l'ensemble des salariés âgés de seize ans révolus, travaillant depuis 3 mois au moins dans l'entreprise et n'ayant fait l'objet d'aucune interdiction, déchéance ou incapacité relative à leurs droits civiques." },
    { q: "Quelle est l'ancienneté minimum pour voter au 1er tour ?", options: ["3 mois", "1 an"], r: 0, info: "Il faut avoir travaillé 3 mois dans l'entreprise pour pouvoir participer au scrutin." },
    { q: "Quelle est la durée maximale d'un mandat des membres du CSE ?", options: ["4 ans", "5 ans"], r: 0, info: "Les élus du CSE sont renouvelés tous les 4 ans lors d'un vote à deux tours." },
    { q: "À quel tour des élections calcule-t-on la représentativité ?", options: ["1er tour", "2nd tour"], r: 0, info: "Seul le 1er tour sert de base légale au calcul de l'audience syndicale." },
    { q: "Combien de sièges titulaires compte le CSE de Marignane ?", options: ["35 sièges", "15 sièges"], r: 0, info: "Le nombre de sièges est défini par l'accord préélectoral en fonction des effectifs." },
    { q: "Quel collège spécifique est ajouté aux 3 collèges légaux chez AH ?", options: ["Personnel Navigant", "Personnel Technique"], r: 0, info: "Airbus Helicopters possède un collège dédié aux pilotes et ingénieurs navigants." },
    { q: "À quelle date les mandats de 2019 arrivaient-ils à échéance ?", options: ["21 novembre 2023", "15 décembre 2023"], r: 0, info: "La fin des mandats marque le début officiel de la période électorale." },
    { q: "Combien de sièges de suppléants compte Marignane au total ?", options: ["35 sièges", "20 sièges"], r: 0, info: "Il y a généralement autant de suppléants que de titulaires élus." },
    { q: "Pourquoi le 1er tour est-il crucial pour un syndicat ?", options: ["Il détermine sa représentativité (seuil des 10%)", "Il permet de choisir la couleur des tracts"], r: 0, info: "C'est l'audience récoltée ici qui permet de désigner des délégués syndicaux." },
    { q: "Que signifie l'acronyme 'PAP' ?", options: ["Protocole d'Accord Préélectoral", "Plan d'Action Patronal"], r: 0, info: "Le PAP fixe les règles du jeu électoral validées par les syndicats et la direction." },
    { q: "À quoi sert principalement le PAP ?", options: ["À définir les règles du scrutin", "À choisir le futur DRH"], r: 0, info: "Il cadre les collèges, la répartition des sièges et les dates de vote." },
    { q: "Qui négocie et signe le PAP ?", options: ["Les organisations syndicales", "L'Inspection du Travail"], r: 0, info: "La direction invite tous les syndicats présents à négocier ce protocole." },
    { q: "Pourquoi est-il important d'aller voter au 1er tour ?", options: ["Pour donner de la force et de la légitimité aux élus", "Pour gagner des points"], r: 0, info: "La légitimité des représentants du personnel dépend directement du taux de participation." },
    { q: "Le vote aux élections professionnelles est-il anonyme ?", options: ["Oui, secret du vote obligatoire", "Non, la Direction peut vérifier"], r: 0, info: "Le secret du scrutin est une garantie démocratique absolue." },
    { q: "Que se passe-t-il si la participation est trop faible au 1er tour ?", options: ["Un second tour est organisé", "L'élection est annulée"], r: 0, info: "Si le quorum (50% de votants) n'est pas atteint, un second tour est ouvert à tous les candidats." },
    { q: "Quel est l'impact d'un fort taux de participation ?", options: ["Un dialogue social plus robuste", "Plus de congés"], r: 0, info: "Plus les élus représentent de voix, plus leur poids en négociation est important." },
    { q: "Le PAP fixe le nombre de sièges. Combien y en a-t-il à Marignane ?", options: ["35 titulaires et 35 suppléants", "10 titulaires"], r: 0, info: "Ces 70 élus assure la représentation de l'ensemble des métiers du site." },
    { q: "Comment le PAP assure-t-il l'équité entre les catégories ?", options: ["Division en 3 collèges", "Tirage au sort"], r: 0, info: "Ouvriers/Employés, TAM et Cadres votent dans des collèges séparés." },
    { q: "Peut-on voter depuis son poste de travail ?", options: ["Oui, par vote électronique", "Non, uniquement par courrier"], r: 0, info: "Le vote électronique facilite l'accès au scrutin pour tous, y compris en déplacement." },
    { q: "À quoi sert la 'propagande électorale' ?", options: ["À présenter les programmes des syndicats", "À faire de la publicité"], r: 0, info: "C'est le moment où chaque organisation explique son projet pour les 4 ans à venir." },
    { q: "Pourquoi le PAP impose-t-il la mixité ?", options: ["Respect de la parité réelle", "Tradition"], r: 0, info: "Les listes doivent refléter la proportion réelle d'hommes et de femmes dans chaque collège." },
    { q: "Qu'est-ce que la règle de la 'parité alternée' sur les listes électorales ?", options: ["L'obligation d'alterner un homme et une femme sur la liste", "Voter une fois sur deux pour une femme"], r: 0, info: "Les listes doivent refléter la proportion de femmes et d'hommes du collège électoral, sous peine d'annulation de l'élection des candidats surnuméraires." },
    { q: "Le vote électronique chez Airbus Helicopters est-il accessible hors du site ?", options: ["Oui, via un portail sécurisé 24h/24 pendant la période de vote", "Non, uniquement sur les bornes dans l'usine"], r: 0, info: "Le vote en ligne permet aux salariés en déplacement, en télétravail ou en congé de participer au scrutin facilement." },
    { q: "Qui surveille le bon déroulement du vote électronique ?", options: ["Un bureau de vote composé de salariés volontaires et d'experts", "La Direction des Ressources Humaines seule"], r: 0, info: "Le bureau de vote (président et assesseurs) scelle les urnes électroniques et contrôle le dépouillement." },
    { q: "Qu'est-ce que le 'Quorum' lors du premier tour ?", options: ["Le fait que le nombre de votants soit au moins égal à 50% des inscrits", "Le nombre de candidats par liste"], r: 0, info: "Si le quorum n'est pas atteint (forte abstention), on doit organiser un second tour, même si des candidats ont eu beaucoup de voix." },
    { q: "Combien de temps dure la campagne électorale officielle chez AH ?", options: ["Elle est définie précisément dans le PAP", "Elle dure toute l'année sans limite"], r: 0, info: "Le PAP fixe les dates d'affichage, de distribution des tracts et les heures de réunions d'information syndicale." },
    { q: "À quel moment un syndicat peut-il désigner un Délégué Syndical (DS) ?", options: ["Dès qu'il a franchi le seuil de 10% de représentativité", "Même s'il a fait 0% aux élections"], r: 0, info: "Le score électoral donne le droit de désigner des délégués qui auront le pouvoir de négocier les accords." },
    { q: "Peut-on raturer (rayer) un nom sur une liste électorale ?", options: ["Oui, mais cela n'a d'impact que si les ratures dépassent 10% des voix", "Non, cela annule le bulletin de vote"], r: 0, info: "Le 'panachage' est autorisé, mais il est rare qu'il modifie l'ordre des élus." },
    { q: "Quel est l'âge minimum pour être candidat aux élections chez AH ?", options: ["18 ans révolus", "16 ans révolus"], r: 0, info: "Pour être éligible, il faut être majeur, alors que certains apprentis de 16 ans peuvent être électeurs." },
    { q: "Un salarié à temps partiel peut-il être candidat aux élections ?", options: ["Oui, au même titre qu'un salarié à temps plein", "Non, il faut être à 100%"], r: 0, info: "Le temps de travail n'influence pas le droit d'être élu, afin de garantir la représentation de toutes les formes d'organisation du travail." },
    { q: "Quel dispositif permet aux salariés d'Airbus de voter pour leurs représentants ?", options: ["Les élections professionnelles", "Le référendum d'entreprise"], r: 0, info: "Ces élections déterminent la composition du CSE et le poids de chaque syndicat pour les 4 années à venir." },
];

// --- THÈME 4 : COMMISSIONS DU CSE (24 questions) ---
const THEME_COMMISSIONS = [
    { q: "Dans quel cadre sont généralement instruites les orientations stratégiques de la formation ?", options: ["La Commission GEPP", "La Commission Santé, Sécurité et Conditions de Travail (SSCT)"], r: 0, info: "La GEPP (ex-GPEC) permet d'anticiper les besoins en compétences et de définir les priorités de formation des salariés." },
    { q: "La Commission GEPP examine-t-elle les dispositifs d'alternance ?", options: ["Oui, elle suit le recrutement des apprentis et stagiaires", "Non, elle s'occupe uniquement des seniors"], r: 0, info: "Chez Airbus Helicopters, l'alternance est un levier majeur de la GEPP pour préparer les compétences de demain." },
    { q: "Quel est le rôle de la Commission GEPP concernant la mobilité interne ?", options: ["Analyser les flux de mouvements entre services et sites", "Valider chaque demande de mutation"], r: 0, info: "La commission n'a pas de pouvoir décisionnel individuel, mais elle étudie les tendances de mobilité pour vérifier l'adéquation besoins/ressources." },
    { q: "La Commission GEPP traite-t-elle du sujet de la pyramide des âges ?", options: ["Oui, pour anticiper les départs à la retraite et les transmissions de savoirs", "Non, c'est confidentiel"], r: 0, info: "Le suivi démographique est essentiel dans l'aéronautique pour ne pas perdre d'expertises critiques lors des départs." },
    { q: "Quelle commission sécurise le recours aux prestataires et les achats importants du CSE ?", options: ["La Commission des Marchés", "La Commission Logement"], r: 0, info: "Obligatoire dans les grands CSE, elle garantit la transparence et l'objectivité lors du choix des fournisseurs (appels d'offres)." },
    { q: "Quelle commission gère les bons d'achat (Noël, rentrée scolaire, naissance…) ?", options: ["La Commission ASC", "La Commission Économique"], r: 0, info: "Le budget des Activités Sociales et Culturelles (ASC) permet d'offrir des avantages aux salariés, souvent exonérés de cotisations sociales sous conditions." },
    { q: "Quel est le rôle principal de la Commission Logement du CSE ?", options: ["Aider les salariés dans leurs projets immobiliers", "Financer les vacances au camping"], r: 0, info: "Elle accompagne les salariés dans la recherche de locations ou l'accession à la propriété, notamment via le dispositif Action Logement." },
    { q: "Quel est le rôle de la 'Commission Économique' du CSE-C ?", options: ["Préparer l'analyse de la situation financière d'Airbus Helicopters", "Valider les notes de frais du Directeur Général"], r: 0, info: "Elle étudie les documents financiers avant la consultation annuelle sur la situation économique de l’entreprise." },
    { q: "La Commission Économique se réunit-elle avant ou après la séance plénière du CSE-C ?", options: ["Avant, pour préparer l'avis que rendra le CSE", "Après, pour vérifier ce qui a été dit"], r: 0, info: "Son rôle est d'étudier les dossiers techniques en amont pour que les élus puissent poser les bonnes questions lors de la réunion officielle." },
    { q: "La Commission Égalité Professionnelle étudie en priorité les écarts de situation entre...", options: ["Les femmes et les hommes", "Les actionnaires et les salariés"], r: 0, info: "Elle analyse les données de l'Index Égalité (rémunération, promotions, augmentations) pour garantir l'équité de traitement dans l'entreprise." },
    { q: "Une commission peut-elle prendre une décision juridique à la place du CSE ?", options: ["Non, elle n'a qu'un rôle d'étude et de préparation", "Oui, si le Secrétaire est présent"], r: 0, info: "Une commission n'a pas de personnalité morale propre ; elle instruit les dossiers pour le compte du CSE." },
    { q: "La Commission d'Information et d'Aide au Logement peut-elle aider à la mobilité ?", options: ["Oui, notamment pour les salariés changeant de site", "Non, elle s'occupe uniquement des prêts immobiliers"], r: 0, info: "Elle facilite le logement et l’accession des salariés à la propriété et à la location." },
    { q: "Quelle commission est en charge de la gestion des vacances et des voyages ?", options: ["La Commission Loisirs / Vacances", "La Commission Économique"], r: 0, info: "Cette commission négocie des tarifs préférentiels auprès des prestataires pour permettre aux salariés de partir à moindre coût." },
    { q: "La Commission Sport s'occupe de quoi chez Airbus Helicopters ?", options: ["Des sections sportives et des subventions aux licences", "De la gym obligatoire le matin en atelier"], r: 0, info: "Elle encourage la pratique sportive des salariés en finançant une partie des adhésions aux clubs partenaires ou internes." },
    { q: "Pourquoi les bons d'achat du CSE sont-ils soumis à des plafonds ?", options: ["Pour bénéficier d'une exonération de cotisations sociales (URSSAF)", "Parce que le CSE n'a plus d'argent"], r: 0, info: "Pour que ces bons ne soient pas considérés comme du salaire (et donc taxés), ils doivent respecter les montants maximums fixés par l'URSSAF chaque année." },
    { q: "Le budget des Activités Sociales et Culturelles (ASC) est-il obligatoire ?", options: ["Oui, son montant est fixé par accord d'entreprise", "Non, c'est au bon vouloir du patron"], r: 0, info: "Chez Airbus Helicopters, le taux de contribution de l'employeur (5% de la masse salariale à aux ASC est garanti par accord pour pérenniser les avantages." },
    { q: "Qui nomme les membres des différentes commissions du CSE ?", options: ["Les élus du CSE par un vote", "Le Directeur des Ressources Humaines"], r: 0, info: "C'est une prérogative des élus du CSE de désigner, parmi eux, les membres des commissions." },
    { q: "Quel document la Commission Égalité Professionnelle analyse-t-elle en priorité ?", options: ["L'Index Égalité Femmes-Hommes", "Le registre des accidents du travail"], r: 0, info: "Cet index, noté sur 100, permet de mesurer les écarts de rémunération et de promotion au sein d'Airbus Helicopters." },
    { q: "La commission 'Développement Durable' du CSE-C traite de quel sujet ?", options: ["L'impact environnemental des activités du site et la décarbonation", "Le recyclage du papier dans les bureaux uniquement"], r: 0, info: "Depuis la loi Climat, le CSE doit être informé des conséquences environnementales de l'activité de l'entreprise." },
    { q: "Quel est le rôle principal de la commission CSSCT ?", options: ["Prévenir les risques professionnels et protéger la santé des salariés", "Gérer les budgets des œuvres sociales"], r: 0, info: "La CSSCT instruit les dossiers liés aux conditions de travail et à la sécurité pour le compte du CSE, qui reste le seul décideur." },
    { q: "Qui préside les commissions du CSE ?", options: ["Un représentant de la Direction", "Le Secrétaire du CSE"], r: 0, info: "Les commissions sont un espace de travail paritaire entre élus et direction." },
    { q: "La Commission GEPP travaille sur quel sujet majeur ?", options: ["Formation et Gestion des Compétences", "Énergie"], r: 0, info: "Elle anticipe les besoins en compétences futures pour sécuriser l'emploi." },
    { q: "À partir de quel seuil la CSSCT est-elle obligatoire ?", options: ["300 salariés", "50 salariés"], r: 0, info: "La CSSCT est obligatoire dès 300 salariés ou sur décision de l'inspecteur du travail." },
    { q: "Quel est le rôle principal de la Commission des Marchés ?", options: ["Sélectionner les prestataires selon des critères objectifs", "Négocier les tarifs des billets de cinéma"], r: 0, info: "Elle intervient pour les gros contrats du CSE afin d'éviter les conflits d'intérêts et garantir la transparence financière." },
    { q: "Qui compose principalement les commissions du CSE ?", options: ["Les membres élus du CSE", "Uniquement la direction"], r: 0, info: "Les commissions sont composées d'élus, mais un accord peut autoriser la participation de salariés non-élus pour leur expertise." },
];

// --- THÈME 5 : MANDATS, HEURES & MOYENS (41 questions) ---
const THEME_MANDATS = [
    { q: "Combien d'heures de délégation possède un RVS ?", options: ["30 heures", "4 heures"], r: 0, info: "Le Représentant de Vie Sociale dispose de temps pour assurer ses missions syndicales." },
    { q: "Combien d'heures de délégation possède un RSS ?", options: ["4 heures", "30 heures"], r: 0, info: "Le Représentant de Section Syndicale a un crédit d'heures limité pour faire vivre son syndicat." },
    { q: "Quels mandats sont dits à Temps Plein ?", options: ["DSC, DS et DS de Section", "RVS et RSS"], r: 0, info: "Les mandats de délégués syndicaux centraux nécessitent un investissement total." },
    { q: "Qui anime la section syndicale de l'établissement ?", options: ["Le DS en charge de la SS", "Le RVS"], r: 0, info: "Le Délégué Syndical est le moteur politique et stratégique de son organisation sur le site." },
    { q: "Qu'est-ce que les 'heures de délégation' ?", options: ["Le temps payé par l'employeur pour l'exercice des missions d'élu", "Le temps de pause supplémentaire pour les délégués"], r: 0, info: "Les élus disposent d'un crédit d'heures mensuel pour rencontrer les salariés et préparer les réunions." },
    { q: "Un élu peut-il utiliser ses heures de délégation pour circuler librement sur le site ?", options: ["Oui, il dispose d'une liberté de déplacement", "Non, il doit demander l'autorisation à son manager"], r: 0, info: "La liberté de circulation est un droit fondamental de l'élu pour rester en contact avec la réalité du terrain." },
    { q: "De quelle formation spécifique bénéficient les membres de la CSSCT ?", options: ["Une formation Santé, Sécurité et Conditions de Travail", "Une formation en pilotage d'hélicoptère"], r: 0, info: "Cette formation de 5 jours minimum est essentielle pour apprendre à détecter les risques professionnels et les RPS." },
    { q: "À quelle fréquence les comptes du CSE doivent-ils être présentés aux salariés ?", options: ["Chaque année (rapport annuel)", "Tous les 4 ans lors des élections"], r: 0, info: "La transparence financière est obligatoire : le CSE doit publier un rapport annuel d'activité et de gestion." },
    { q: "Le CSE peut-il décider d'utiliser son budget de fonctionnement pour payer un avocat ?", options: ["Oui, pour faire respecter ses droits ou ceux des salariés", "Non, les frais juridiques sont interdits"], r: 0, info: "Le recours à une assistance juridique est une dépense de fonctionnement classique pour le CSE." },
    { q: "Que se passe-t-il si un élu dépasse son crédit d'heures mensuel ?", options: ["Il doit justifier de 'circonstances exceptionnelles'", "Ses heures ne sont jamais payées"], r: 0, info: "En cas de crise majeure (ex: grève, restructuration), le dépassement est toléré s'il est justifié." },
    { q: "Quel document récapitule l'ensemble des données économiques et sociales d'Airbus ?", options: ["La BDESE (Base de Données Économiques, Sociales et Environnementales)", "Le livret d'accueil"], r: 0, info: "La BDESE est l'outil principal d'information des élus, accessible en permanence." },
    { q: "À qui sont rattachés les mandatés à temps plein ?", options: ["Relations Sociales", "Ancien manager"], r: 0, info: "Pour garantir leur indépendance, ils sont rattachés administrativement à la direction RH." },
    { q: "Quel est le délai pour réaliser l'entretien de début de mandat ?", options: ["Dans les 4 mois", "Dans l'année"], r: 0, info: "Cet entretien permet de définir l'équilibre entre vie pro et vie syndicale." },
    { q: "Quelle plateforme héberge la BDESE ?", options: ["myDDESE", "Hublo"], r: 0, info: "La Base de Données Économiques, Sociales et Environnementale est accessible numériquement aux élus." },
    { q: "Comment s'appelle l'entretien spécifique destiné à l'élu qui termine ses fonctions ?", options: ["L'entretien de fin de mandat", "L'entretien de réintégration"], r: 0, info: "Obligatoire pour les élus et mandatés, il permet de valoriser les compétences acquises (gestion, droit, médiation) auprès de l'employeur." },
    { q: "À quoi sert le budget de fonctionnement du CSE s'élevant à 0,22% de la masse salariale ?", "options": ["Au fonctionnement du CSE et aux expertises", "Aux chèques vacances et cadeaux"], "r": 0, "info": "Dans les entreprises de plus de 2000 salariés, ce budget de 0,22% finance exclusivement le fonctionnement (formations, experts, matériel…) et non les avantages sociaux." },
    { q: "À quoi est exclusivement dédié le budget 'ASC' du CSE ?", options: ["Aux activités sociales et culturelles", "Aux salaires et charges de l'entreprise"], r: 0, info: "Le budget ASC sert à financer les avantages directs : chèques-vacances, billetterie, voyages ou cadeaux de Noël." },
    { q: "Lors de son premier mandat, de combien de jours de formation 'Santé et Sécurité' l'élu CSE bénéficie-t-il ?", options: ["5 jours minimum", "1 jour par an"], r: 0, info: "Ce droit à la formation, financé par l'employeur, permet aux élus de maîtriser les méthodes d'analyse des risques et de prévention." },
    { q: "Qu'est-ce que la 'Garantie d'Évolution Salariale' des mandatés ?", options: ["L'assurance de ne pas être pénalisé financièrement par son mandat", "Une augmentation double par rapport aux autres"], r: 0, info: "La loi et les accords Airbus prévoient que l'élu doit bénéficier d'une évolution de salaire au moins égale à la moyenne de sa catégorie." },
    { q: "Un élu peut-il bénéficier d'un entretien de 'fin de mandat' ?", options: ["Oui, pour faire le bilan des compétences acquises pendant le mandat", "Non, cela n'existe pas"], r: 0, info: "Cet entretien permet de valoriser l'expérience de l'élu (négociation, gestion de projet, droit) dans son parcours professionnel chez AH." },
    { q: "Peut-on sanctionner un salarié en raison de son appartenance syndicale ?", options: ["Non, c'est une discrimination syndicale punie par la loi", "Oui, s'il passe trop de temps en réunion"], r: 0, info: "La liberté syndicale est un droit constitutionnel. Toute discrimination (frein à la promotion, notation injuste) est strictement interdite." },
    { q: "À quel moment doit avoir lieu l'entretien de début de mandat ?", options: ["Au début de la prise de fonction", "Après un an de mandat"], r: 0, info: "Cet entretien permet de définir comment l'élu va articuler son activité professionnelle avec ses missions syndicales." },
    { q: "Qu'est-ce que la VAE (Validation des Acquis de l'Expérience) syndicale ?", options: ["Une certification des compétences acquises durant le mandat", "Un examen pour devenir Directeur"], r: 0, info: "Elle permet à un élu de transformer son expérience syndicale en un diplôme ou une certification reconnue." },
    { q: "Comment appelle-t-on le principe qui interdit de payer un élu moins que la moyenne de ses collègues ?", options: ["La garantie de non-discrimination salariale", "Le bonus de représentativité"], r: 0, info: "L'accord de groupe du Dialogue Social garantit que l'évolution salariale des mandatés follows celle de leur catégorie de référence." },
    { q: "Qui évalue la performance professionnelle d'un élu/mandaté à temps partagé ?", options: ["Son manager opérationnel, uniquement sur sa partie travail", "Le Secrétaire du CSE"], r: 0, info: "Le manager évalue les objectifs professionnels qui ont été adaptés au prorata du temps passé en délégation." },
    { q: "Quelle est la principale différence entre un élu du CSE et un Délégué Syndical (DS) ?", options: ["L'élu est choisi par les salariés, le DS est désigné par son syndicat", "L'élu gère les hélicoptères, le DS gère les bureaux"], r: 0, info: "L'élu CSE représente le personnel en instance, tandis que le DS représente son syndicat et négocie les accords." },
    { q: "Quel est le rôle spécifique du 'Représentant Syndical au CSE' (RS) ?", options: ["Donner l'avis de son syndicat lors des réunions du CSE", "Vendre des cartes d'adhérents en réunion"], r: 0, info: "Le RS assiste aux séances du CSE avec voix consultative : il exprime la position de son organisation sans participer au vote." },
    { q: "Qu'est-ce qu'un 'Représentant de la Vie Sociale' (RVS) ?", options: ["Un relais local pour les questions de terrain (ateliers, bureaux…)", "Un élu qui habite près de l'usine"], r: 0, info: "Créés par accord chez Airbus, les RVS traitent les réclamations individuelles et les problèmes quotidiens au plus près des services." },
    { q: "Qui désigne le Délégué Syndical Central (DSC) ?", options: ["Le syndicat au niveau de la société entière", "Le Directeur Général"], r: 0, info: "Le DSC coordonne l'action syndicale sur l'ensemble des sites (Marignane et Paris-Le Bourget) et négocie les accords centraux." },
    { q: "Quel mandat est spécifique à la surveillance de la santé et de la sécurité ?", options: ["Le membre de la CSSCT", "Le trésorier du CSE"], r: 0, info: "Les membres de la CSSCT sont des élus du CSE désignés pour se spécialiser sur les conditions de travail et la prévention des risques." },
    { q: "Peut-on cumuler plusieurs mandats (ex: élu CSE et RVS) ?", options: ["Oui, selon les règles fixées par l’accord de Groupe du Dialogue Social", "Non, c'est strictement interdit par la loi"], r: 0, info: "Le cumul est possible et fréquent pour assurer une continuité entre les dossiers stratégiques et le terrain." },
    { q: "Quel est le rôle du 'Délégué Syndical' lors des NAO ?", options: ["Négocier et signer (ou non) les augmentations de salaire", "Prendre des notes pour le CSE"], r: 0, info: "Seuls les Délégués Syndicaux ont le pouvoir juridique d'engager leur organisation en signant des accords collectifs." },
    { q: "Qu'est-ce qu'un 'mandat extérieur' (ex: Conseiller des Prud'hommes) ?", options: ["Un salarié d'AH qui siège dans une instance hors de l'entreprise", "Un élu qui travaille chez un sous-traitant"], r: 0, info: "Airbus Helicopters facilite l'exercice de mandats externes qui participent à la vie sociale de la cité (Prud'hommes, CPAM, etc.)." },
    { q: "Quelle est la durée d'un mandat de Délégué Syndical ?", options: ["Il prend fin en même temps que les mandats du CSE (4 ans)", "Il est valable à vie"], r: 0, info: "Le mandat de DS est lié au cycle électoral : il doit être renouvelé après chaque élection professionnelle." },
    { q: "Comment appelle-t-on le mandat de celui qui coordonne les syndicats sur les sites de Marignane ET du Bourget ?", options: ["Le Délégué Syndical Central (DSC)", "Le Président du Comité Européen"], r: 0, info: "Le DSC assure la cohérence des revendications et des négociations au niveau de toute la société Airbus Helicopters en France." },
    { q: "Quels sont les deux types d'exercice de mandat chez Airbus Helicopters ?", options: ["Les mandats à temps plein et les mandats en temps partagé", "Les mandats de jour et les mandats de nuit"], r: 0, info: "Cette organisation permet d'avoir des élus totalement dédiés aux dossiers complexes et d'autres qui gardent un pied dans leur métier d'origine." },
    { q: "Qu'est-ce qu'un mandat à 'temps partagé' ?", options: ["Un élu qui partage son temps entre son métier et ses missions syndicales", "Un élu qui partage son bureau avec la Direction"], r: 0, info: "L'élu en temps partagé dispose d'un crédit d'heures (délégation) mais continue d'exercer son activité professionnelle chez AH." },
    { q: "À quoi sert principalement un mandat à 'temps plein' (permanent) ?", options: ["À assurer la gestion des dossiers lourds et la présence aux instances de coordination", "À ne plus jamais revenir travailler en atelier"], r: 0, info: "Les permanents assurent la continuité du dialogue social et la gestion des structures (comme le Secrétariat du CSE ou les délégués syndicaux centraux)." },
    { q: "Comment est calculée la charge de travail d'un élu en temps partagé ?", options: ["Elle doit être réduite au prorata de ses heures de délégation", "Elle reste identique à celle d'un salarié classique"], r: 0, info: "C'est un point clé de l'accord sur le droit syndical : le manager doit adapter les objectifs pour que l'élu puisse exercer ses missions sans surcharge." },
    { q: "Vrai ou Faux : Un élu peut passer d'un temps plein à un temps partagé durant son mandat ?", options: ["Vrai, selon les besoins de son organisation syndicale et les accords de site", "Faux, le choix est définitif pour 4 ans"], r: 0, info: "La flexibilité des mandats permet de s'adapter aux évolutions des dossiers et à la disponibilité des représentants." },
    { q: "Qu'est-ce que la 'valorisation des parcours syndicaux' chez Airbus ?", options: ["Reconnaître les compétences de l'élu comme un atout pour l'entreprise", "Donner une médaille à chaque fin de mandat"], r: 0, info: "Airbus Helicopters s'engage à ce que l'exercice d'un mandat soit considéré comme une étape formatrice du parcours de carrière." },
    { q: "Quelle est la principale différence entre un élu CSE et un Délégué Syndical (DS) ?", options: ["Le DS négocie et signe les accords d'entreprise", "L'élu CSE décide seul des augmentations de salaire"], r: 0, info: "Le monopole de la négociation des accords appartient aux syndicats (DS), tandis que le CSE est une instance d’information et de consultation." },
];

// --- THÈME 6 : ACCORDS et NÉGOCIATIONS RÉCENTES (16 questions) ---
const THEME_ACCORDS = [
    { q: "Quel est l'objet de l'accord du 20 décembre 2024 ?", options: ["Le Dialogue Social", "Le Télétravail"], r: 0, info: "Cet accord modernise les moyens mis à disposition des élus chez Airbus Helicopters." },
    { q: "Lors du CSE, quelle est la règle pour une information présentée comme 'confidentielle' par l'employeur ?", options: ["Elle ne doit pas être diffusée en dehors du CSE", "Elle peut être publiée sur le compte Facebook du CSE"], r: 0, info: "Les élus ont une obligation de discrétion. Révéler une information stratégique peut constituer une faute grave ou un délit d'entrave." },
    { q: "Quel nouvel enjeu est intégré depuis 2025 dans le CSE ?", options: ["L'impact environnemental", "Les uniformes"], r: 0, info: "La loi climat et résilience impose au CSE d'étudier l'impact écologique des projets." },
    { q: "Que signifie l'acronyme NAO, moment clé du dialogue social annuel ?", options: ["Négociation Annuelle Obligatoire", "Nouvel Accord Opérationnel"], r: 0, info: "Les NAO portent principalement sur les salaires, le temps de travail et le partage de la valeur ajoutée." },
    { q: "Quelle est la principale différence de rôle entre un syndicat et le CSE ?", options: ["Le syndicat négocie les accords, le CSE est consulté sur les projets", "Le CSE décide des salaires, le syndicat gère la cantine"], r: 0, info: "C'est une règle d'or : la négociation des accords est réservée aux syndicats, alors que le CSE rend des avis sur la marche de l'entreprise." },
    { q: "Qu'est-ce qu'un 'Accord d'Entreprise' ?", options: ["Un contrat signé entre la Direction et les Syndicats pour fixer des règles spécifiques", "Un règlement imposé par la Direction sans discussion"], r: 0, info: "L'accord permet d'adapter le Code du Travail aux besoins spécifiques d'Airbus (ex: organisation industrielle, télétravail)." },
    { q: "Un accord d'entreprise peut-il être signé par un seul syndicat ?", options: ["Oui, s'il représente plus de 50% des voix au 1er tour des élections", "Non, il faut toujours l'unanimité des syndicats"], r: 0, info: "C'est la règle de la majorité : pour être valide, un accord doit être signé par des organisations totalisant plus de 50% de l'audience électorale." },
    { q: "Quel est le rôle des élus du CSE et des mandatés une fois qu'un accord est signé ?", options: ["Veiller à sa bonne application sur le terrain et en commissions", "Le renégocier chaque trimestre"], r: 0, info: "Les élus s'assurent que la Direction respecte bien les engagements pris dans les accords." },
    { q: "Quelle est la durée de vie habituelle d'un accord d'entreprise ?", options: ["Elle est définie dans l'accord (souvent à durée déterminée ou indéterminée)", "Elle est obligatoirement de 1 an"], r: 0, info: "Certains accords sont liés à un projet précis (durée déterminée), d'autres fixent des règles durables (durée indéterminée)." },
    { q: "Qu'est-ce qu'un 'avenant' à un accord ?", options: ["Un texte complémentaire qui modifie ou précise l'accord initial", "Une amende payée par l'entreprise"], r: 0, info: "Le dialogue social est vivant : si le contexte change (ex: nouvelle loi), les partenaires signent un avenant pour mettre à jour l'accord." },
    { q: "Que signifie 'dénoncer' un accord ?", options: ["Vouloir mettre fin à l'accord en respectant un préavis", "Signaler une fraude à la police"], r: 0, info: "La direction ou les syndicats peuvent dénoncer un accord s'ils estiment qu'il n'est plus adapté, ce qui oblige à une nouvelle négociation." },
    { q: "Où sont déposés les accords signés chez Airbus Helicopters ?", options: ["À la Direction du Travail (DREETS) et au greffe du conseil de prud'hommes", "Dans un coffre-fort secret à Marignane"], r: 0, info: "Le dépôt officiel rend l'accord juridiquement valable et consultable par les autorités." },
    { q: "Qu'est-ce qu'un 'accord de méthode' ?", options: ["Un accord qui fixe les règles et le calendrier des négociations futures", "Un manuel pour réparer les hélicoptères"], r: 0, info: "Avant de négocier un sujet lourd (comme Reload), on signe souvent un accord de méthode pour se mettre d'accord sur 'comment on va discuter'." },
    { q: "Un accord d'entreprise peut-il prévoir des dispositions plus favorables que la loi ?", options: ["Oui, c'est souvent le but du dialogue social chez Airbus", "Non, il doit copier la loi mot pour mot"], r: 0, info: "Le dialogue social sert souvent à créer un 'mieux-disant social' (ex: plus de congés, de meilleures primes) par rapport au minimum légal." },
    { q: "Qui peut consulter le texte intégral d'un accord signé chez AH ?", options: ["Tous les salariés de l'entreprise", "Uniquement les cadres"], r: 0, info: "La transparence est obligatoire : tout salarié doit pouvoir accéder aux accords qui régissent ses conditions de travail via l'intranet." },
    { q: "Peut-on contester un accord d'entreprise ?", options: ["Oui, devant le tribunal judiciaire si l'accord ne respecte pas la loi", "Non, un accord est définitif et sacré"], r: 0, info: "Même si un accord est signé, il doit respecter les règles d'ordre public (la loi) sous peine d'être annulé." },
];

// --- THÈME 7 : POUVOIRS & CO-CONSTRUCTION (34 questions) ---
const THEME_POUVOIRS = [
    { q: "Qui peut signer des accords d'entreprise ?", options: ["Les Délégués Syndicaux", "Les élus CSE"], r: 0, info: "La signature d'un accord est réservée aux syndicats représentatifs." },
    { q: "En présence de délégués syndicaux, pourquoi un élu CSE ne peut-il pas signer d'accord ?", options: ["La signature est réservée aux syndicats", "Les élus n'ont qu'un rôle consultatif"], r: 0, info: "C'est le principe du monopole syndical : seuls les délégués syndicaux peuvent engager l'entreprise par accord, sauf exceptions légales (absence de DS)." },
    { q: "Quel est le pouvoir spécifique d'un syndicat 'représentatif' ?", options: ["Négocier et signer des accords collectifs", "Gérer le budget des chèques vacances"], r: 0, info: "Ayant obtenu au moins 10% des voix aux élections, il est le seul habilité à négocier les salaires ou le temps de travail avec l'employeur." },
    { q: "Quel est le rôle principal d'un syndicat 'non-représentatif' dans l'entreprise ?", options: ["Animer une section syndicale et diffuser ses idées", "Négocier et signer les accords de salaires"], r: 0, info: "Même sans les 10 % de voix, il peut désigner un Représentant de Section Syndicale (RSS) pour s'exprimer et préparer les prochaines élections." },
    { q: "Qu'est-ce qu'une 'Organisation Syndicale Représentative' ?", options: ["Un syndicat ayant obtenu au moins 10% des voix aux élections", "Un syndicat qui a plus de 100 ans d'existence"], r: 0, info: "La représentativité est basée sur les résultats des élections professionnelles tous les 4 ans." },
    { q: "Un syndicat ayant obtenu moins de 10% des voix peut-il désigner un représentant ?", options: ["Oui, un RSS (Représentant de Section Syndicale)", "Non, il perd toute présence dans l'entreprise"], r: 0, info: "Le RSS permet au syndicat d'exister et de communiquer, même s'il ne peut pas encore négocier d'accords collectifs." },
    { q: "Dans le dialogue social, qu'est-ce que la 'Co-construction' ?", options: ["Élaborer un projet ensemble dès le début", "Valider une décision déjà prise par la direction"], r: 0, info: "Elle permet aux élus / aux syndicats représentatifs et à la direction de bâtir une solution commune avant même la phase formelle de consultation." },
    { q: "Quel accord majeur chez Airbus a été cité comme un modèle de co-construction ?", options: ["L'accord 'Airbus Reload'", "L'accord sur la couleur des casques"], r: 0, info: "Airbus Reload a nécessité des mois de groupes de travail paritaires pour harmoniser les statuts sociaux du groupe." },
    { q: "Qu'est-ce qu'un 'Groupe de Travail Paritaire' dans la co-construction ?", options: ["Une instance composée à parts égales de représentants syndicaux et de la direction", "Un groupe uniquement composé de cadres"], r: 0, info: "Ces groupes permettent d'étudier techniquement un sujet (ex: télétravail) pour aboutir à un texte partagé." },
    { q: "Dans une démarche de co-construction, quel est le rôle des syndicats ?", options: ["Force de proposition et de négociation", "Simple spectateur des décisions"], r: 0, info: "Les syndicats apportent la vision du terrain pour s'assurer que les projets sont réalistes et acceptables par les salariés." },
    { q: "La co-construction empêche-t-elle le CSE de rendre un avis négatif ?", options: ["Non, le CSE garde sa pleine liberté de jugement à la fin du processus", "Oui, si on co-construit, on doit être d'accord"], r: 0, info: "Même si le projet est co-construit, l'instance reste souveraine pour rendre son avis lors de la consultation finale." },
    { q: "Comment appelle-t-on la méthode de dialogue qui vise à trouver un bénéfice mutuel (Gagnant-Gagnant) ?", options: ["La négociation raisonnée", "La négociation de combat"], r: 0, info: "La co-construction s'appuie sur la négociation raisonnée : on se concentre sur les intérêts communs plutôt que sur les positions figées." },
    { q: "Qui anime généralement les démarches de co-construction sur les sujets RH ?", options: ["La Direction des Relations Sociales", "Le service comptabilité"], r: 0, info: "Les Relations Sociales orchestrent le calendrier et les échanges avec les organisations syndicales représentatives." },
    { q: "Vrai ou Faux : La co-construction est obligatoire selon le Code du Travail ?", options: ["Faux, c'est un choix volontaire des partenaires sociaux chez Airbus", "Vrai, c'est la loi"], r: 0, info: "La loi impose la consultation, mais la co-construction est une pratique avancée issue de la culture d'entreprise d'Airbus." },
    { q: "Dans le dialogue social, qu'est-ce que la 'Co-gestion' ?", options: ["Le partage du pouvoir de décision entre direction et élus", "La gestion partagée des plannings de congés"], r: 0, info: "Contrairement à la simple consultation, la co-gestion implique que les représentants des salariés participent directement aux décisions stratégiques." },
    { q: "Quelle est la principale différence de rôle entre un Délégué Syndical (DS) et un élu au CSE ?", options: ["Le DS négocie les accords, le CSE est consulté sur les projets", "Le DS gère les œuvres sociales, le CSE s'occupe des salaires"], r: 0, info: "Le syndicat (DS) a le monopole de la négociation collective, tandis que le CSE a un rôle de surveillance et de consultation sur la gestion de l'entreprise." },
    { q: "Qu'est-ce que la 'représentativité syndicale' calculée au 1er tour ?", options: ["La capacité d'un syndicat à négocier et signer des accords", "Le nombre d'adhérents ayant payé leur cotisation"], r: 0, info: "Un syndicat doit obtenir au moins 10% des suffrages exprimés au 1er tour pour être considéré comme représentatif dans l'entreprise." },
    { q: "Pour être valide, un accord d'entreprise doit être signé par des syndicats totalisant quel score ?", options: ["Plus de 50 % des suffrages exprimés", "Au moins 30 % des suffrages exprimés"], r: 0, info: "Le principe est l'accord majoritaire (50 %). Si le score est entre 30 et 50 %, un référendum auprès des salariés est nécessaire pour valider l'accord." },
    { q: "Qui désigne-t-on par le terme 'Partenaires Sociaux' ?", options: ["Les syndicats représentatifs qui travaillent avec la Direction", "Les prestataires de services du CSE"], r: 0, info: "Ce terme valorise le dialogue et la négociation collective comme moteur de l'évolution du droit du travail." },
    { q: "Quels sont les deux piliers indispensables à une démarche de co-construction ?", options: ["La transparence de l'information et la confiance mutuelle", "La patience des élus et le budget du CSE"], r: 0, info: "Pour construire un projet ensemble, la direction doit partager ses intentions réelles et les élus doivent être prêts à proposer des solutions plutôt que de simply s'opposer." },
    { q: "Un Représentant de Section Syndicale (RSS) peut-il signer un accord sur les salaires ?", options: ["Non, c'est réservé aux syndicats représentatifs", "Oui, s'il a été désigné officiellement"], r: 0, info: "Le RSS représente un syndicat qui n'a pas encore atteint 10% des voix. Il ne peut donc pas engager l'entreprise par un accord collectif." },
    { q: "Le droit de grève est-il un droit individuel ou collectif ?", options: ["Collectif (nécessite une cessation concertée du travail)", "Individuel (on peut faire grève tout seul)"], r: 0, info: "Sauf s'il répond à un mot d'ordre national, le mouvement de grève doit être suivi par au moins deux salariés de l'entreprise." },
    { q: "Qu'est-ce qu'un 'débrayage' chez Airbus Helicopters ?", options: ["Un arrêt de travail de courte durée (ex: 1h ou 2h)", "Une panne moteur sur la chaîne de montage"], r: 0, info: "Le débrayage est une forme de grève courte souvent utilisée pour marquer une désapprobation sans perdre une journée de salaire entière." },
    { q: "Un gréviste peut-il bloquer l'accès au site de Marignane aux non-grévistes ?", options: ["Non, l'entrave à la liberté de travail est illicite", "Oui, c'est le principe du piquet de grève"], r: 0, info: "Si le piquet de grève est autorisé, le blocage physique des accès peut être sanctionné et donner lieu à une expulsion par décision de justice." },
    { q: "Pendant une grève, le contrat de travail est-il rompu ou suspendu ?", options: ["Suspendu (le salarié reste dans l'effectif)", "Rompu (le salarié démissionne)"], r: 0, info: "La grève suspend le contrat de travail ; le salarié ne peut pas être licencié pour avoir exercé son droit de grève, sauf faute lourde." },
    { q: "Qui peut appeler officiellement à la grève au sein de l'entreprise ?", options: ["Tout groupement de salariés ou un syndicat", "Uniquement le Secrétaire du CSE"], r: 0, info: "Le mouvement peut être lancé par une organisation syndicale ou résulter d'une décision collective spontanée des salariés." },
    { q: "Si un salarié arrive avec 1h de retard pour cause de débrayage, est-il en faute ?", options: ["Non, s'il s'agit d'un exercice licite du droit de grève", "Oui, c'est un retard injustifié"], r: 0, info: "Le temps de grève est un droit ; l'employeur ne peut pas sanctionner le retard s'il correspond à un mouvement de grève dont les motifs sont connus." },
    { q: "Peut-on déclencher une grève de 15 minutes seulement ?", options: ["Oui, la loi n'impose pas de durée minimale pour un arrêt de travail", "Non, la durée minimale est d'une demi-journée"], r: 0, info: "Les arrêts de travail de très courte durée (débrayages) sont autorisés tant qu'ils ne sont pas répétés de manière abusive pour désorganiser l'entreprise." },
    { q: "Le 'lock-out' (fermer l'usine pour empêcher la grève) est-il autorisé ?", options: ["Non, c'est une pratique interdite en France sauf cas exceptionnels", "Oui, c'est le droit de réponse de l'employeur"], r: 0, info: "L'employeur ne peut pas empêcher les non-grévistes de travailler en fermant l'accès au site, sauf si la sécurité ne peut plus être assurée." },
    { q: "À quel moment l'employeur doit-il être informé des motifs de la grève ?", options: ["Au plus tard au moment de l'arrêt de travail", "24 heures après le début du conflit"], r: 0, info: "Pour que la grève soit licite, l'employeur doit connaître les revendications professionnelles au moment où les salariés cessent le travail." },
    { q: "Est-ce qu'une grève 'surprise' est légale ?", options: ["Oui, si les revendications ont été transmises à la direction", "Non, c'est considéré comme une faute lourde"], r: 0, info: "L'absence de préavis n'est pas une faute. La 'surprise' réside dans l'absence de délai, pas dans l'absence de motifs." },
    { q: "Existe-t-il un délai de prévenance légal pour déclencher une grève ?", options: ["Non, la grève peut être immédiate dès que les revendications sont connues", "Oui, il faut respecter un préavis de 5 jours ouvrés"], r: 0, info: "Dans le secteur privé, contrairement au secteur public, aucun préavis n'est imposé par la loi, sauf dispositions spécifiques d'un accord d'entreprise." },
    { q: "L'employeur peut-il sanctionner un salarié pour avoir participé à une grève ?", options: ["Non, c'est une discrimination interdite", "Oui, si cela désorganise la production"], r: 0, info: "L'exercice normal du droit de grève ne peut donner lieu à aucune sanction disciplinaire." },
    { q: "La retenue sur salaire après une grève doit-elle être proportionnelle ?", options: ["Oui, strictement au temps de travail non effectué", "Non, l'employeur peut retirer une journée entière pour 1h de grève"], r: 0, info: "La retenue de salaire doit correspondre exactement à la durée de l'arrêt de travail. Toute retenue supérieure est une sanction pécuniaire illégale." },
    { q: "L'employeur peut-il remplacer des grévistes par des intérimaires ?", options: ["Non, c'est strictement interdit par la loi", "Oui, pour ne pas arrêter la production"], r: 0, info: "Le recours à l'intérim ou au CDD pour remplacer un gréviste est une infraction pénale visant à protéger l'exercice du droit de grève." },
];

// --- THÈME 8 : Réorganisations, Travaux et Déménagements (8 questions) ---
const THEME_REORGDÉMÉNAGEMENTS = [
    { q: "Quelle est l'obligation de l'employeur avant de lancer un grand projet de déménagement ?", options: ["Informer et consulter le CSE sur le projet et ses impacts", "Envoyer un simple mail aux salariés concernés"], r: 0, info: "La loi impose que les élus soient consultés sur les conditions de travail et l'aménagement des locaux avant le début des travaux." },
    { q: "Quelle commission est envoyée sur le terrain pour étudier un projet de réorganisation ?", options: ["La CSSCT (Santé, Sécurité et Conditions de Travail)", "La Commission Économique"], r: 0, info: "La CSSCT analyse les risques (bruit, lumière, ergonomie, stress) liés au nouvel aménagement ou à la nouvelle organisation." },
    { q: "Qu'est-ce qu'une 'étude d'impact' dans le cadre d'un déménagement ?", options: ["Un document évaluant les conséquences du projet sur la santé et la sécurité", "Le calcul du coût du trajet des camions de déménagement"], r: 0, info: "L'employeur doit démontrer qu'il a anticipé les risques psychosociaux et physiques liés au changement." },
    { q: "Le CSE peut-il demander l'avis d'un expert pour un projet de réorganisation majeure ?", options: ["Oui, si le projet modifie de façon importante les conditions de travail", "Non, c'est uniquement pour les chiffres financiers"], r: 0, info: "Les élus peuvent voter le recours à un expert agréé pour évaluer si le projet respecte la santé des salariés." },
    { q: "Dans quel ordre se déroule le processus de consultation ?", options: ["Information et examen en commission (CSSCT), puis vote en séance plénière", "Vote des élus, puis présentation du projet par la Direction"], r: 0, info: "Le dialogue social respecte un calendrier précis : on présente le dossier, les experts l'étudient, puis le CSE rend son avis." },
    { q: "Lors d'un déménagement, sur quels points précis la CSSCT est-elle vigilante ?", options: ["L'ergonomie des postes, la luminosité et les nuisances sonores", "La couleur de la peinture des murs"], r: 0, info: "L'objectif est de garantir que le nouvel environnement de travail ne dégrade pas la santé des collaborateurs." },
    { q: "Le CSE peut-il proposer des modifications au projet de la Direction ?", options: ["Oui, par le biais de préconisations réalisées par la CSSCT jointes à son avis", "Non, c'est 'à prendre ou à laisser'"], r: 0, info: "Le dialogue social permet souvent d'ajuster le projet initial (ex: ajout de salles de réunion, modification de l'emplacement des bureaux)." },
    { q: "Vrai ou Faux : Un projet de déménagement peut être suspendu par la justice si le CSE n'a pas été consulté ?", options: ["Vrai, c'est un délit d'entrave", "Faux, les travaux peuvent continuer"], r: 0, info: "L'absence de consultation obligatoire peut bloquer juridiquement un chantier tant que la procédure sociale n'est pas régularisée." },
];

// --- THÈME 9 : BUDGET ET FONCTIONNEMENT DES ASC (10 questions) ---
const THEME_ASC_BUDGET = [
    { q: "Qui a la charge exclusive de verser la contribution finançant le budget des ASC ?", options: ["L'employeur (Airbus Helicopters)", "Les salariés via une cotisation"], r: 0, info: "Le financement des activités sociales est une obligation patronale dont le montant est versé directement au CSE." },
    { q: "Sur quelle base est calculé le montant du budget ASC chez Airbus Helicopters ?", options: ["Un pourcentage de la masse salariale brute", "Un montant fixe par hélicoptère vendu"], r: 0, info: "Le budget est indexé sur les salaires versés, garantissant une évolution proportionnelle aux effectifs et aux rémunérations." },
    { q: "Quel est l'avantage principal des prestations ASC pour le salarié ?", options: ["L'exonération de cotisations sociales et d'impôts", "L'augmentation de sa future retraite"], r: 0, info: "Sous réserve de respecter les plafonds URSSAF, les avantages ASC ne sont pas considérés comme du salaire imposable." },
    { q: "Le CSE peut-il utiliser l'argent des ASC pour payer un expert-comptable ?", options: ["Non, c'est le rôle du budget de fonctionnement", "Oui, si le budget AEP est vide"], r: 0,     info: "La loi impose une séparation stricte : le budget ASC est pour les salariés, le budget AEP est pour les missions du CSE." },
    { q: "Qui décide de la répartition du budget entre voyages, billetterie ou cadeaux ?", options: ["Les élus du CSE", "Le Directeur Général d'Airbus Helicopters"], r: 0, info: "Le CSE est totalement autonome et souverain dans le choix des priorités sociales pour les salariés." },
    { q: "À combien s'élève environ la contribution totale versée par AH au CSE ?", options: ["5% de la masse salariale", "2% de la masse salariale"], r: 0, info: "Grâce aux accords d'entreprise, Airbus Helicopters verse un pourcentage élevé pour garantir un haut niveau d'avantages sociaux et de moyens de fonctionnement." },
    { q: "Si la masse salariale d'Airbus Helicopters augmente, que devient le budget du CSE ?", options: ["Il augmente mécaniquement", "Il reste fixe selon un montant défini en 2019"], r: 0, info: "Comme le budget est un pourcentage (%), toute hausse des salaires ou des effectifs entraîne une hausse du budget disponible pour les activités des salariés." },
    { q: "L'employeur peut-il décider de baisser ce pourcentage unilatéralement ?", options: ["Non, ce taux est sécurisé par un accord d'entreprise", "Oui, si les bénéfices sont en baisse"], r: 0, info: "Le taux de contribution est un acquis social négocié ; la direction ne peut pas le réduire sans dénoncer l'accord et renégocier avec les syndicats." },
    { q: "Le budget ASC est-il versé en une seule fois par an ?", options: ["Non, il est versé par acomptes tout au long de l'année", "Oui, toujours le 1er janvier"], r: 0, info: "Le versement suit l'évolution de la masse salariale réelle de l'entreprise au fil des mois." },
    { q: "Un alternant peut-il bénéficier des ASC au même titre qu'un salarié en CDI ?", options: ["Oui, tous les salariés de l'effectif y ont droit", "Non, c'est réservé aux CDI"], r: 0, info: "Le CSE doit traiter de manière équitable tous les salariés présents dans l'entreprise, quel que soit leur contrat." },
];

const questionsDatabase = [
    ...THEME_INSTANCES.map(q => ({...q, theme: "Instances & Cadre"})),
    ...THEME_SYNDICATS.map(q => ({...q, theme: "Syndicats & Représentativité"})),
    ...THEME_ELECTIONS.map(q => ({...q, theme: "Élections & PAP"})),
    ...THEME_COMMISSIONS.map(q => ({...q, theme: "Commissions du CSE"})),
    ...THEME_MANDATS.map(q => ({...q, theme: "Mandats & Moyens"})),
    ...THEME_ACCORDS.map(q => ({...q, theme: "Accords & Négos"})),
    ...THEME_POUVOIRS.map(q => ({...q, theme: "Pouvoirs & Co-construction"})),
    ...THEME_REORGDÉMÉNAGEMENTS.map(q => ({...q, theme: "Réorganisations, Travaux et Déménagements"})),
    ...THEME_ASC_BUDGET.map(q => ({...q, theme: "ASC et Budget CSE"})),
];

/* --- AUDIO ENGINE --- */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'correct') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.2);
    } else if (type === 'wrong') {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(220, audioCtx.currentTime);
        oscillator.frequency.linearRampToValueAtTime(110, audioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
    } else if (type === 'bank') {
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    }
    // AJOUT DU SON DE DÉMARRAGE
    else if (type === 'start') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // Note LA (plus aigu, type bip)
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1); // Durée très courte (0.1s)
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    }
}

/* --- CORRECTION DES BOUTONS (CLIC UNIQUE) --- */

function startApp() {
    // 1. On tente de réveiller l'audio en arrière-plan (sans bloquer le reste)
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
   
    // 2. On joue le son immédiatement
    playSound('start');

    // 3. On coupe la musique d'accueil proprement
    if (bgMusicNodes) {
        bgMusicNodes.oscs.forEach(o => { try { o.stop(); } catch(e) {} });
        clearInterval(bgMusicNodes.interval);
        bgMusicNodes = null;
    }

    // 4. CHANGEMENT D'ÉCRAN IMMÉDIAT (sans setTimeout long)
    showScreen('screen-rules');
}

function goToConfig() {
    // 1. On réveille l'audio (sécurité)
    if (audioCtx.state === 'suspended') audioCtx.resume();
   
    // 2. On joue le son de démarrage
    playSound('start');

    // 3. --- L'ANIMATION DES HÉLICOPTÈRES ---
    // On cible le bouton de décollage
    const takeoffBtn = document.querySelector('.rules-btn-launch');
   
    if (takeoffBtn) {
        takeoffBtn.classList.add('flying');
        takeoffBtn.disabled = true;
    }

    // --- TRANSITION TEMPORISÉE AJUSTÉE ---
    // MODIFICATION : On attend 2 secondes (la nouvelle durée CSS)
   setTimeout(() => {
        showScreen('screen-config');
       
        // On retire la classe pour stopper l'animation une fois l'écran changé
        if (takeoffBtn) {
            takeoffBtn.classList.remove('flying');
            takeoffBtn.disabled = false;
        }
    }, 1500); // 1500ms = 1.5 seconde
}

function playIntroMusic() {
    // SÉCURITÉ : Si on n'est pas sur l'écran d'accueil, on ne lance rien
    if (!document.getElementById('screen-home').classList.contains('active')) return;
    if (bgMusicNodes) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);
    const oscs = [];
    const frequencies = [110, 111, 220];
    frequencies.forEach(freq => {
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        g.gain.setValueAtTime(0.05, audioCtx.currentTime);
        g.gain.setTargetAtTime(0.15, audioCtx.currentTime + 1, 2);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.connect(filter);
        filter.connect(g);
        g.connect(masterGain);
        osc.start();
        oscs.push(osc);
    });
    const clockInterval = setInterval(() => {
        const tick = audioCtx.createOscillator();
        const tickGain = audioCtx.createGain();
        tick.type = 'square';
        tick.frequency.setValueAtTime(800, audioCtx.currentTime);
        tickGain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        tickGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);
        tick.connect(tickGain);
        tickGain.connect(masterGain);
        tick.start();
        tick.stop(audioCtx.currentTime + 0.08);
    }, 1500);
    bgMusicNodes = { oscs, interval: clockInterval, gain: masterGain };
}

function stopIntroMusic() {
    if (bgMusicNodes) {
        bgMusicNodes.gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.5);
        setTimeout(() => {
            if (bgMusicNodes) {
                bgMusicNodes.oscs.forEach(o => { try { o.stop(); } catch(e) {} });
                clearInterval(bgMusicNodes.interval);
                bgMusicNodes = null;
            }
        }, 1500);
    }
}

function playHeartbeatTransition() {
    if (audioCtx.state === 'suspended') audioCtx.resume();

    let beatCount = 0;
    const totalBeats = 6; // 3 doubles battements (LUB-DUB)

    const playBeat = (time, freq, vol) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        osc.frequency.exponentialRampToValueAtTime(freq - 20, time + 0.1);
       
        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
       
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(time);
        osc.stop(time + 0.1);
    };

    // On planifie les battements sur 3 secondes
    for (let i = 0; i < 3; i++) {
        let startTime = audioCtx.currentTime + i;
        // Premier coup (LUB)
        playBeat(startTime, 60, 0.5);
        // Deuxième coup (DUB) un peu plus tard
        playBeat(startTime + 0.2, 50, 0.4);
    }
}

function showScreen(id) {
    const allScreens = document.querySelectorAll('.screen');
    allScreens.forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none';
    });

    const target = document.getElementById(id);
    if (target) {
        target.classList.add('active');
        target.style.display = 'flex';
    }

    // RÉTABLIR LE FOND OFFICIEL (Dégradé + Motifs)
    document.body.style.background = `
        radial-gradient(circle at center, rgba(0, 161, 224, 0.15) 0%, transparent 85%),
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill='white' fill-opacity='0.02'%3E%3Cpath d='M20 25 h30 a5 5 0 0 1 5 5 v15 a5 5 0 0 1-5 5 h-20 l-10 10 v-10 a5 5 0 0 1-5-5 v-15 a5 5 0 0 1 5-5' /%3E%3Ccircle cx='75' cy='65' r='8' /%3E%3Cpath d='M60 90 q15-15 30 0' /%3E%3C/g%3E%3C/svg%3E"),
        #00205b`;
    document.body.style.backgroundColor = "#00205b";
}

    document.documentElement.style.setProperty('--blue', '#00205b');
       
        // On cache aussi le bandeau d'alerte s'il était resté affiché
        const alertBox = document.getElementById('alert-overlay');
        if (alertBox) alertBox.style.display = 'none';

/* --- FONCTION DE TRANSITION ET RESET COULEURS POUR LE DUEL --- */
/* --- FONCTION DE TRANSITION ET RESET COULEURS POUR LE DUEL --- */
function startDuelMode() {
    isDuelMode = true;
    isSuddenDeath = false;
    duelQuestionsCount = 0;
    duelScores = { player0: 0, player1: 0 };
    duelHistory = { player0: [], player1: [] };
    activePlayerIdx = 0;

    // 1. RESET DES COULEURS OFFICIELLES AIRBUS
    document.documentElement.style.setProperty('--blue', '#00205b');
    document.body.style.backgroundColor = '#00205b';
    document.body.style.background = `
        radial-gradient(circle at center, rgba(0, 161, 224, 0.15) 0%, transparent 85%),
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill='white' fill-opacity='0.02'%3E%3Cpath d='M20 25 h30 a5 5 0 0 1 5 5 v15 a5 5 0 0 1-5 5 h-20 l-10 10 v-10 a5 5 0 0 1-5-5 v-15 a5 5 0 0 1 5-5' /%3E%3Ccircle cx='75' cy='65' r='8' /%3E%3Cpath d='M60 90 q15-15 30 0' /%3E%3C/g%3E%3C/svg%3E"),
        #00205b`;

    // 2. NETTOYAGE RADICAL DES ÉLÉMENTS DE LA PHASE MANCHE
    document.querySelector('.btn-bank').style.display = 'none';
    document.getElementById('btn-pause').style.display = 'none';
    document.querySelector('.gauge-wrapper').style.display = 'none';
    document.querySelector('.bank-mood-container').style.display = 'none';
   
    // Suppression du bandeau des joueurs en bas (ton image)
    const playersFooter = document.getElementById('players-list');
    if (playersFooter) playersFooter.style.display = 'none';

    // Masquage des alertes et stats
    if (document.getElementById('alert-overlay')) document.getElementById('alert-overlay').style.display = 'none';
    if (document.getElementById('success-stats')) document.getElementById('success-stats').style.display = 'none';
    if (document.getElementById('chain-counter')) document.getElementById('chain-counter').style.display = 'none';

    // 3. AFFICHAGE DE L'INTERFACE DE FINALE
    document.getElementById('round-label').innerText = "FINALE : FACE À FACE";
    document.getElementById('timer').innerText = "DUEL";
    document.getElementById('timer').style.borderColor = "var(--gold)";
    document.getElementById('duel-status-container').style.display = 'flex';
    document.getElementById('duel-header').style.display = 'flex';
   
    // Attribution des avatars et noms aux cartes de duel
    document.getElementById('duel-img-0').src = players[0].avatar;
    document.getElementById('duel-name-0').innerText = players[0].name;
    document.getElementById('duel-img-1').src = players[1].avatar;
    document.getElementById('duel-name-1').innerText = players[1].name;

    showScreen('screen-game');
    loadQuestion();
}

function adjustPlayers(val) {
    playerCount = Math.max(3, Math.min(12, playerCount + val));
    document.getElementById('player-count').innerText = playerCount;
    updateNameInputs();
}

function updateNameInputs() {
    const container = document.getElementById('player-names-container');
    if (!container) return;
    container.innerHTML = "";

    for (let i = 0; i < playerCount; i++) {
        const avatarUrl = animalAvatars[i % animalAvatars.length];
       
        const group = document.createElement('div');
        group.className = "input-group";
       
        const icon = document.createElement('div');
        icon.className = "input-icon";
        icon.innerHTML = `<img src="${avatarUrl}" style="width:24px; height:24px; border-radius:50%;">`;
       
        const input = document.createElement('input');
        input.type = "text";
        input.placeholder = `Pilote ${i + 1}`;
        input.className = "player-name-input";
        input.dataset.avatar = avatarUrl; // On sauvegarde l'avatar ici
       
        group.appendChild(icon);
        group.appendChild(input);
        container.appendChild(group);
    }
}

// On ne lance la musique que si on clique PARTOUT SAUF sur le bouton plein écran
window.addEventListener('click', (e) => {
    if (e.target.id === 'btn-fullscreen') return; // Ne rien faire si on clique sur le bouton plein écran
   
    if (document.getElementById('screen-home').classList.contains('active')) {
        playIntroMusic();
    }
}, { once: true });

window.onload = updateNameInputs;

/* --- FONCTION DE MÉLANGE (FISHER-YATES) --- */
function shuffleQuestions(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function setupGame() {
    // On s'assure que l'audio est bien réveillé pour le jeu
    audioCtx.resume().then(() => {
        playSound('start');
       
        // On garde un micro-délai pour laisser le temps au son de sortir
        setTimeout(() => {
            stopIntroMusic();
            players = [];
            totalQuestionsAsked = 0;
            totalCorrectAnswers = 0;
            availableQuestions = [...questionsDatabase];
            shuffleQuestions(availableQuestions);

            // RESET DES QUESTIONS
            availableQuestions = [...questionsDatabase];
            usedQuestions = []; // On vide la corbeille
            shuffleQuestions(availableQuestions);

            // 🚀 LA CORRECTION EST ICI : on cible uniquement la zone "#player-names-container"
            const inputs = document.querySelectorAll('#player-names-container .player-name-input');
           
            inputs.forEach((input, i) => {
                let name = input.value.trim() || `Pilote ${i + 1}`;
                let avatar = input.dataset.avatar;
                players.push({
                    name: name,
                    avatar: avatar,
                    wrongAnswers: 0,
                    correctAnswers: 0
                });
            });

            // On s'assure que le bandeau des joueurs est visible pour la nouvelle partie
            const playersFooter = document.getElementById('players-list');
            if (playersFooter) {
                playersFooter.style.display = 'grid';
            }

            const labelsDiv = document.getElementById('gauge-labels');
            if (labelsDiv) {
                labelsDiv.innerHTML = moneySteps.map(m => `<div class="gauge-label-step">${m}€</div>`).join('');
            }
           
            document.getElementById('success-stats').style.display = 'inline-block';
            startRound();
        }, 100);
    });
}

function startRound() {
    // --- AJUSTEMENT DYNAMIQUE DU CHRONO ---
    const nbJoueurs = players.length;

    const playersList = document.getElementById('players-list');
    if (playersList) {
        playersList.classList.remove('hide-players-list');
    }
   
    if (nbJoueurs >= 2 && nbJoueurs <= 8) {
        timeLeft = 120;
    } else if (nbJoueurs >= 9 && nbJoueurs <= 15) {
        timeLeft = 180;
    } else if (nbJoueurs >= 16 && nbJoueurs <= 20) {
        timeLeft = 240;
    } else {
        timeLeft = 60; // Sécurité par défaut
    }

    // --- RÉINITIALISATION DU TOUR ---
    chainIdx = 0;
    activePlayerIdx = 0;
    scoreBank = 0;
    isPaused = false;
    isDuelMode = false;
   
    // Remise à zéro des erreurs pour le vote de fin de manche
    players.forEach(p => p.wrongAnswers = 0);

    // Mise à jour de l'affichage
    document.getElementById('timer').innerText = timeLeft;
    document.getElementById('round-label').innerText = `Manche ${currentRound}`;
   
    // Affichage des éléments de jeu (au cas où on sort d'un duel)
    document.getElementById('duel-status-container').style.display = 'none';
    document.querySelector('.btn-bank').style.display = 'block';
    document.getElementById('btn-pause').style.display = 'block';
    document.querySelector('.gauge-wrapper').style.display = 'flex';
    document.querySelector('.bank-mood-container').style.display = 'flex';
    document.getElementById('players-list').style.display = 'flex';

// ON RÉAFFICHE LE COMPTEUR (au cas où)
    if(document.getElementById('chain-counter')) document.getElementById('chain-counter').style.display = 'block';

    updateMood();
    updatePlayersList();
    updateGauge();
    showScreen('screen-game');

    // Lancement du compte à rebours
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (!isPaused && !isDuelMode) {
            timeLeft--;
            document.getElementById('timer').innerText = timeLeft;
            if (timeLeft <= 0) endRound();
        }
    }, 1000);
   
    loadQuestion();
}

function loadQuestion() {
   // 1. Si on a épuisé toutes les questions neuves, on réutilise les anciennes
    if (availableQuestions.length === 0) {
        if (usedQuestions.length === 0) {
            // Sécurité ultime si la database était vide
            availableQuestions = [...questionsDatabase];
        } else {
            availableQuestions = [...usedQuestions];
            usedQuestions = [];
        }
        shuffleQuestions(availableQuestions);
    }

    // 2. Tirage de la question
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const q = availableQuestions.splice(randomIndex, 1)[0];
   
    // 3. On mémorise qu'elle a été utilisée
    usedQuestions.push(q);

    lastLoadedQuestionTheme = q.theme;
    const correctText = q.options[q.r];

    // 4. Mélange des options (Utilisation de shuffleArray pour un mix parfait)
    const shuffledOptions = [...q.options];
    shuffleArray(shuffledOptions);

    // --- Mise à jour de l'affichage ---
    const qCountEl = document.getElementById('q-remaining');
    if (qCountEl) qCountEl.innerText = `Questions restantes : ${availableQuestions.length}`;

    const playerDisplay = document.getElementById('current-player-display');
    const questionTextEl = document.getElementById('question-text');

    if (isDuelMode) {
        document.getElementById('duel-card-0').classList.toggle('active-turn', activePlayerIdx === 0);
        document.getElementById('duel-card-1').classList.toggle('active-turn', activePlayerIdx === 1);
        updateDuelUI();
        playerDisplay.innerHTML = "";
    } else {
        playerDisplay.innerHTML = `<span style="font-size:0.8rem;color:white;display:block;margin-bottom:5px;">TOUR DE</span>${players[activePlayerIdx].name}`;
    }

    questionTextEl.innerText = q.q;

// --- GESTION DE L'AFFICHAGE DU JOUEUR (MODE DUEL VS NORMAL) ---
    if (isDuelMode) {
        document.getElementById('duel-card-0').classList.toggle('active-turn', activePlayerIdx === 0);
        document.getElementById('duel-card-1').classList.toggle('active-turn', activePlayerIdx === 1);
        updateDuelUI();
       
        // On vide le playerDisplay en mode Duel pour éviter les doublons sous les badges
        playerDisplay.innerHTML = "";
    } else {
        // Affichage standard uniquement pour les manches normales
        playerDisplay.innerHTML = `<span style="font-size:0.8rem;color:white;display:block;margin-bottom:5px;">TOUR DE</span>${players[activePlayerIdx].name}`;
    }

    // --- ANIMATION D'APPARITION DU TEXTE ---
    questionTextEl.innerText = q.q;
    questionTextEl.style.opacity = "0";
    setTimeout(() => {
        questionTextEl.style.transition = "opacity 0.3s ease";
        questionTextEl.style.opacity = "1";
    }, 50);

    const grid = document.getElementById('options-grid');
    grid.innerHTML = '';

    shuffledOptions.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'btn-option';
        btn.innerText = opt;
        btn.onclick = () => {
            if (isPaused) return;
            const isCorrect = (opt === correctText);
           
            // Désactiver tous les boutons pour éviter le double-clic
            const allBtns = grid.querySelectorAll('.btn-option');
            allBtns.forEach(b => b.disabled = true);

            if (isCorrect) {
                playSound('correct');
                processAnswer(true);
            } else {
                playSound('wrong');
                isPaused = true; // ON FIGE LE CHRONO

                // --- EFFET GLITCH ---
                document.body.classList.add('glitch-effect');
                setTimeout(() => { document.body.classList.remove('glitch-effect'); }, 2500);
               
                btn.style.backgroundColor = "var(--danger)";
                allBtns.forEach(b => {
                    if (b.innerText === correctText) b.style.backgroundColor = "var(--success)";
                });

                // --- NOUVELLE POP-UP INDÉPENDANTE ---
                const modalOverlay = document.createElement('div');
                modalOverlay.className = 'error-modal-overlay';
                modalOverlay.innerHTML = `
                    <div class="error-modal-content">
                        <span style="color:var(--danger); font-weight:900; font-size:1.6rem; margin-bottom:10px; text-align:center; letter-spacing: 2px; text-transform: uppercase;">
                            ⚠️ ERREUR ⚠️
                        </span>
                        <span style="color:var(--gold); font-weight:800; font-size:1.1rem; margin-bottom:20px; text-align:center;">
                            💡 LE SAVIEZ-VOUS ?
                        </span>
                        <p style="font-size:1.05rem; line-height:1.5; margin-bottom:30px; text-align:center; color: white;">
                            ${q.info}
                        </p>
                        <button id="btn-resume-mission" class="btn-main" style="border-color: var(--danger); font-size: 0.9rem; padding: 12px 30px;">
                            🚀 CONTINUER LA MISSION
                        </button>
                    </div>
                `;
               
                // On attache la pop-up par-dessus toute la page
                document.body.appendChild(modalOverlay);

                // On supprime la pop-up quand le joueur clique pour continuer
                document.getElementById('btn-resume-mission').onclick = () => {
                    document.body.removeChild(modalOverlay);
                    isPaused = false;
                    processAnswer(false);
                };
            }
        };
        grid.appendChild(btn);
    });
}

function processAnswer(isCorrect) {
    if (isDuelMode) {
        handleDuelAnswer(isCorrect);
        return;
    }
   
// --- TRACKING DATA VIZ ---
    const theme = lastLoadedQuestionTheme || "Général";
    if (!themeStats[theme]) themeStats[theme] = { correct: 0, total: 0 };
    themeStats[theme].total++;
    if (isCorrect) themeStats[theme].correct++;
    // -------------------------

    totalQuestionsAsked++;
    if (isCorrect) {
        players[activePlayerIdx].correctAnswers++;
        realCorrectAnswers++;
        totalCorrectAnswers++;
        totalTeamPoints += 10;
        if (chainIdx < moneySteps.length - 1) chainIdx++;
    } else {
        // --- DETECTION ACCORD PERDU ---
        if (chainIdx >= 5) {
            totalAccordsLost++; // On incrémente le compteur pour le bilan
            totalTeamPoints = Math.max(0, totalTeamPoints - 10); // Malus plus fort
            showToast("⚠️ ACCORD PERDU (Non banqué) -10pts !");
           
            // Effet visuel d'alerte sur le bouton Banque pour simuler l'échec
            const bankBtn = document.querySelector('.btn-bank');
            bankBtn.classList.add('bank-critical-alert');
            setTimeout(() => bankBtn.classList.remove('bank-critical-alert'), 2000);
        } else {
            totalTeamPoints = Math.max(0, totalTeamPoints - 5);
        }
       
        players[activePlayerIdx].wrongAnswers++;
        chainIdx = 0; // Reset de la série
    }
   
    activePlayerIdx = (activePlayerIdx + 1) % players.length;
    updatePlayersList();
    updateGauge();
    updateMood();
    loadQuestion();
}

function startDuelIntro() {
    isDuelMode = true;
    isSuddenDeath = false;
    duelQuestionsCount = 0;
    duelScores = { player0: 0, player1: 0 };
    duelHistory = { player0: [], player1: [] };
    activePlayerIdx = 0;

    // MASQUER LE BANDEAU DES JOUEURS
    const playersList = document.getElementById('players-list');
    if (playersList) {
        playersList.classList.add('hide-players-list');
    }

// Dans startDuelIntro()
document.getElementById('alert-overlay').style.display = 'none';

    // --- LIGNE À AJOUTER ICI ---
    document.getElementById('success-stats').style.display = 'none';
    // AJOUTER CETTE LIGNE ICI 🎯
    if(document.getElementById('chain-counter')) document.getElementById('chain-counter').style.display = 'none';

    document.getElementById('round-label').innerText = "FINALE : FACE À FACE";
    document.getElementById('round-label').innerText = "FINALE : FACE À FACE";
    document.getElementById('timer').innerText = "DUEL";
    document.getElementById('timer').style.borderColor = "var(--gold)";
    document.getElementById('duel-status-container').style.display = 'flex';
   
    document.querySelector('.btn-bank').style.display = 'none';
    document.getElementById('btn-pause').style.display = 'none';
    document.querySelector('.gauge-wrapper').style.display = 'none';
    document.querySelector('.bank-mood-container').style.display = 'none';
    document.getElementById('players-list').style.display = 'none';
    document.getElementById('alert-overlay').style.display = 'none';

    showScreen('screen-game');
    loadQuestion();

    // Affichage et remplissage du bandeau finale
    const duelHeader = document.getElementById('duel-header');
    duelHeader.style.display = 'flex';
   
    document.getElementById('duel-img-0').src = players[0].avatar;
    document.getElementById('duel-name-0').innerText = players[0].name;
    document.getElementById('duel-img-1').src = players[1].avatar;
    document.getElementById('duel-name-1').innerText = players[1].name;
}

function updateDuelUI() {
    for (let pIdx = 0; pIdx < 2; pIdx++) {
        const container = document.getElementById(`duel-p${pIdx}-steps`);
        const history = duelHistory[`player${pIdx}`];
        let html = `<div style="font-size:0.7rem; color:var(--sky); margin-bottom:5px; text-align:center; font-weight:bold;">${players[pIdx].name}</div><div style="display:flex; gap:5px;">`;
        const totalDots = Math.max(5, history.length);
        for (let i = 0; i < totalDots; i++) {
            let statusClass = "";
            let icon = "";
            if (history[i] === 'correct') { statusClass = "correct"; icon = "✓"; }
            else if (history[i] === 'wrong') { statusClass = "wrong"; icon = "✕"; }
            const isCurrentDot = (pIdx === activePlayerIdx && i === history.length);
            const activeClass = isCurrentDot ? "active-player-dot" : "";
            html += `<div class="duel-dot ${statusClass} ${activeClass}">${icon}</div>`;
        }
        html += `</div>`;
        container.innerHTML = html;
    }
}

function handleDuelAnswer(isCorrect) {
    const status = isCorrect ? 'correct' : 'wrong';
    if (activePlayerIdx === 0) {
        duelHistory.player0.push(status);
        if (isCorrect) duelScores.player0++;
    } else {
        duelHistory.player1.push(status);
        if (isCorrect) duelScores.player1++;
    }
    const gameScreen = document.getElementById('screen-game');
    gameScreen.classList.add(isCorrect ? 'flash-success' : 'flash-error');
    setTimeout(() => {
        gameScreen.classList.remove('flash-success', 'flash-error');
        duelQuestionsCount++;
        if (!isSuddenDeath) {
            if (duelQuestionsCount < 10) {
                activePlayerIdx = (activePlayerIdx + 1) % 2;
                updatePlayersList();
                loadQuestion();
            } else {
                if (duelScores.player0 !== duelScores.player1) determineWinner();
                else {
                    isSuddenDeath = true;
                    alert("ÉGALITÉ ! Passage en MORT SUBITE !");
                    activePlayerIdx = 0;
                    updatePlayersList();
                    loadQuestion();
                }
            }
        } else {
            if (duelQuestionsCount % 2 === 0) {
                if (duelScores.player0 !== duelScores.player1) determineWinner();
                else { activePlayerIdx = 0; loadQuestion(); }
            } else { activePlayerIdx = 1;
                updatePlayersList();
                loadQuestion(); }
        }
    }, 600);
}

function determineWinner() {
    const winner = duelScores.player0 > duelScores.player1 ? players[0] : players[1];
    showWinner(winner);
}

function endRound() {
    clearInterval(timerInterval);
    if (players.length === 2) startDuelIntro();
    else if (players.length > 2) showVote();
    else showWinner(players[0]);
}

function eliminate(idx) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    players.splice(idx, 1);
   
    if (players.length === 2) {
        // --- RESET VISUEL TOTAL POUR LA FINALE ---
        isDuelMode = true; // On l'active ici pour bloquer updateGauge

        // On force le retour au bleu Airbus officiel
        document.documentElement.style.setProperty('--blue', '#00205b');
        document.body.style.backgroundColor = '#00205b';
        document.body.style.background = `radial-gradient(circle at center, rgba(0, 161, 224, 0.15) 0%, transparent 85%), #00205b`;
        // ------------------------------------------
   
const namesEl = document.getElementById('finalists-names');
        if(namesEl) namesEl.innerText = `${players[0].name} VS ${players[1].name}`;
       
        playHeartbeatTransition();
        showScreen('screen-transition-finale');
       
        setTimeout(() => {
            currentRound++;
            startDuelMode();
        }, 3000);
   
    }
    else if (players.length <= 1) {
        showWinner(players[0]);
    }
    else {
        currentRound++;
        startRound();
    }
}

function showWinner(p) {
    isDuelMode = false;
    showScreen('screen-winner');
    playApplause();
    launchConfetti();

    const profile = getPlayerTitle(p);

    document.getElementById('winner-name').innerText = p.name;
    document.getElementById('winner-display').innerHTML = `
        <div class="winner-hero-card">
            <div class="winner-avatar-container">
                <img src="${p.avatar}" class="winner-img-main">
                <div class="winner-crown">🏆</div>
            </div>
            <div class="player-badge">
                <span class="badge-icon">${profile.icon}</span>
                <div class="badge-text">
                    <div class="badge-title">${profile.title}</div>
                    <div class="badge-desc">${profile.desc}</div>
                </div>
            </div>
        </div>
    `;
    // À ajouter à la fin de la fonction showWinner(p)
const teamDist = getTeamDistinction(totalTeamPoints, currentGauge);

const teamSection = document.createElement('div');
teamSection.className = 'team-distinction-card';
teamSection.innerHTML = `
    <div class="team-distinction-header">MENTION DE L'ÉQUIPAGE</div>
    <div class="team-distinction-body">
        <span class="team-icon">${teamDist.icon}</span>
        <div>
            <div class="team-name">${teamDist.name}</div>
            <div class="team-desc">${teamDist.desc}</div>
        </div>
    </div>
`;
document.getElementById('screen-winner').appendChild(teamSection);
}

function togglePause() {
    isPaused = !isPaused;
    document.getElementById('btn-pause').innerText = isPaused ? "REPRENDRE" : "PAUSE";
}

function bankMoney() {
    if (isPaused) return;

    const currentGain = moneySteps[chainIdx];
   
    if (chainIdx > 0) {
        playSound('bank');

        // --- SECTION ACCORD MAJEUR (Série de 5 ou plus) ---
        if (currentGain >= 1000) {
            // 1. Incrémente les compteurs pour le bilan de manche et le bilan final
            accordsSignedThisRound++;
            totalAccordsSaved++;

            // 2. Bonus de points social (pour la jauge/emoji)
            totalCorrectAnswers += 1;

            // 3. Bonus de temps (uniquement hors duel)
            if (!isDuelMode) timeLeft += 5;
           
            // 4. AJOUT DU BONUS AU SCORE D'ÉQUIPAGE (+20 pts)
            totalTeamPoints += 20;
           
            showToast("ACCORD SIGNÉ & BANQUÉ (+20 pts) 🤩");
            launchConfetti();
        } else {
            // Gain classique (Série inférieure à 5)
            showToast("GAIN SÉCURISÉ 💰");
        }

        scoreBank += currentGain;
        chainIdx = 0; // Réinitialise la série après avoir banqué
    }
    else {
        // --- SECTION STABILISATION (Clic sans série en cours) ---
        // Utile pour limiter la chute de la jauge après une erreur
        showToast("CLIMAT STABILISÉ 🛡️");
        if (totalQuestionsAsked > 0) {
            totalCorrectAnswers += 0.2; // Petit bonus de lissage pour la jauge
        }
    }

    // Mise à jour visuelle immédiate
    updateMood();
    updateGauge();
}

function launchConfetti() {
    const container = document.getElementById('confetti-container');
    const colors = ['#ffcc00', '#ffffff', '#00a1e0']; // Or, Blanc, Bleu Ciel

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
       
        // Position et style aléatoires
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = Math.random() * 8 + 5 + 'px';
        confetti.style.height = confetti.style.width;
       
        // Durée et délai aléatoires
        const duration = Math.random() * 2 + 1;
        confetti.style.animationDuration = duration + 's';
        confetti.style.animationDelay = Math.random() * 0.5 + 's';

        container.appendChild(confetti);

        // Nettoyage après l'animation
        setTimeout(() => confetti.remove(), (duration + 0.5) * 1000);
    }
}

// Petite fonction pour afficher le succès du bonus
function showBonusToast(message) {
    const alertBox = document.getElementById('alert-overlay');
    if (alertBox) {
        const originalText = alertBox.innerText;
        const originalDisplay = alertBox.style.display;
        const originalBg = alertBox.style.background;

        alertBox.innerText = "🌟 " + message + " 🌟";
        alertBox.style.display = 'block';
        alertBox.style.background = "var(--success)"; // Vert Airbus
       
        setTimeout(() => {
            alertBox.innerText = originalText;
            alertBox.style.display = originalDisplay;
            alertBox.style.background = originalBg;
        }, 2000);
    }
}

function updateMood() {
    // SI ON EST EN DUEL, ON NE FAIT RIEN
    if (isDuelMode) return;
    const mood = document.getElementById('total-mood');
    const stats = document.getElementById('success-stats');
    const chainCounter = document.getElementById('chain-counter');
   
    // 1. Calcul de la réussite réelle (Stats %) - Max 100%
    const successPerc = totalQuestionsAsked > 0 ? Math.round((realCorrectAnswers / totalQuestionsAsked) * 100) : 0;
   
    // 2. Calcul du Climat Social (Jauge/Emoji) - Capé à 100%
    const socialPerc = totalQuestionsAsked > 0 ? Math.min(100, Math.round((totalCorrectAnswers / totalQuestionsAsked) * 100)) : 0;

    // Mise à jour du texte des stats (Utilise le score RÉEL)
    if (stats) {
        stats.innerText = `% de bonnes réponses : ${successPerc}%`;
        stats.style.color = (successPerc < 30) ? "var(--danger)" : (successPerc >= 90 ? "var(--success)" : "var(--sky)");
    }

    // Mise à jour du Smiley (Utilise le score SOCIAL capé)
    if (socialPerc < 30) mood.innerText = "😟";
    else if (socialPerc < 75) mood.innerText = "😐";
    else if (socialPerc < 90) mood.innerText = "🙂";
    else mood.innerText = "🤩";
   
    mood.classList.toggle('mood-excellent', socialPerc >= 90);

    if (chainCounter && !isDuelMode) {
        // Mise à jour du texte
        chainCounter.innerText = `Série : ${chainIdx} / 5`;

        // GESTION DE L'ALERTE 5/5
        if (chainIdx >= 5) {
    chainCounter.innerText = `SÉRIE : ${chainIdx} / 5 (BANQUEZ !)`;
    chainCounter.classList.add('blink-alert');
} else {
    chainCounter.style.color = "var(--sky)"; // Couleur normale si pas de bonus
    chainCounter.classList.remove('blink-alert');
}
    }
}

function updatePlayersList() {
    const list = document.getElementById('players-list');
    if (!list) return;

    const fragment = document.createDocumentFragment();
    const playersToShow = isDuelMode ? [players[0], players[1]] : players;

    playersToShow.forEach((p, i) => {
        const isActive = (i === activePlayerIdx);
       
        const playerDiv = document.createElement('div');
        playerDiv.style.cssText = `
            display:flex; flex-direction:column; align-items:center;
            min-width:80px; transition:all 0.4s ease;
            opacity: ${isActive ? '1' : '0.3'};
            transform: ${isActive ? 'scale(1.15)' : 'scale(0.9)'};
        `;

        playerDiv.innerHTML = `
            <img src="${p.avatar}" style="width:40px; height:40px; border-radius:50%;
                 border:2px solid ${isActive ? 'var(--gold)' : 'rgba(255,255,255,0.1)'};
                 background:rgba(255,255,255,0.1); padding:2px;
                 box-shadow:${isActive ? '0 0 15px var(--gold)' : 'none'};">
            <div style="font-size:0.65rem; font-weight:800; color:white; margin-top:5px;
                 text-transform:uppercase; letter-spacing:1px;">${p.name}</div>
        `;
        fragment.appendChild(playerDiv);
    });

    list.innerHTML = ""; // Un seul "reflow" du DOM ici
    list.appendChild(fragment);
}

function updateGauge() {
    const alertBox = document.getElementById('alert-overlay');
    const fill = document.getElementById('gauge-fill');
    const container = document.querySelector('.gauge-container');
    const helpBtn = document.querySelector('.btn-help-trigger');

    // --- SÉCURITÉ RADICALE ---
    // Si on est en duel, on cache et on stoppe la fonction immédiatement
    if (isDuelMode) {
        if (alertBox) alertBox.style.setProperty('display', 'none', 'important');
        return;
    }

    const asked = totalQuestionsAsked || 0;
    const correct = totalCorrectAnswers || 0;
    const socialPerc = asked > 0 ? Math.min(100, Math.round((correct / asked) * 100)) : 0;

    if (fill) fill.style.height = socialPerc + "%";

    // Mise à jour de la couleur du fond (uniquement hors duel)
    let bgColor = "#00205b";
    if (socialPerc <= 30) bgColor = "#4a0000";    
    else if (socialPerc <= 60) bgColor = "#6e3a00";
   
    document.body.style.backgroundColor = bgColor;
    document.documentElement.style.setProperty('--blue', bgColor);

    // Détermination du texte d'alerte
    let statusText = "";
    let alertColor = "";
    if (socialPerc <= 19) { statusText = "🚨 GRÈVE GÉNÉRALE 🚨"; alertColor = "#b30000"; }
    else if (socialPerc <= 30) { statusText = "⚠️ RISQUE DE GRÈVE !"; alertColor = "#ff4757"; }
    else if (socialPerc <= 40) { statusText = "🟠 CLIMAT SOCIAL INSTABLE"; alertColor = "#e67e22"; }
    else if (socialPerc <= 50) { statusText = "😤 SYNDICATS EN COLÈRE"; alertColor = "#f39c12"; }
    else if (socialPerc <= 60) { statusText = "📢 MOUVEMENT D'HUMEUR"; alertColor = "#d4af37"; }
    else if (socialPerc <= 70) { statusText = "📄 TRACT SYNDICAL !"; alertColor = "#3498db"; }
    else if (socialPerc <= 85) { statusText = "✅ CLIMAT SOCIAL STABLE"; alertColor = "#27ae60"; }
    else { statusText = "🤩 EXCELLENT DIALOGUE SOCIAL"; alertColor = "#2ed573"; }

    if (alertBox) {
        alertBox.innerText = statusText;
        alertBox.style.backgroundColor = alertColor;
        // On affiche seulement si isDuelMode est faux (double sécurité)
        alertBox.style.display = 'block';

        if (socialPerc <= 30) {
            alertBox.classList.add('blink-alert');
            if (container) container.classList.add('gauge-critical');
            if (helpBtn) helpBtn.classList.add('help-danger-blink');
        } else {
            alertBox.classList.remove('blink-alert');
            if (container) container.classList.remove('gauge-critical');
            if (helpBtn) helpBtn.classList.remove('help-danger-blink');
        }
    }
}

function showVote() {
    showScreen('screen-vote');
    const grid = document.getElementById('vote-grid');
    if (!grid) return;

    const recapHeader = `<div style="grid-column: 1 / -1; background: rgba(255, 204, 0, 0.1); border: 1px solid var(--gold); border-radius: 15px; padding: 15px; margin-bottom: 20px; text-align: center;">
        <span style="color: var(--gold); font-weight: 800; font-size: 1.2rem;">🤝 BILAN DE LA MANCHE : ${accordsSignedThisRound} ACCORD(S) SIGNÉ(S)</span>
    </div>`;

    grid.innerHTML = recapHeader + players.map((p, i) => {
        // Calcul du ratio de réussite individuel
        const total = p.correctAnswers + p.wrongAnswers;
        const ratio = total > 0 ? Math.round((p.correctAnswers / total) * 100) : 0;
       
        // Couleur du ratio selon la performance
        const ratioColor = ratio >= 70 ? "var(--success)" : (ratio >= 40 ? "var(--gold)" : "var(--danger)");

        return `
        <div class="glass-card" onclick="eliminate(${i})" style="cursor:pointer;padding:15px;background:rgba(255,255,255,0.1); width:100%; max-width:400px; flex-direction:row; gap:20px; align-items:center;">
            <div style="position: relative;">
                <img src="${p.avatar}" style="width:55px; height:55px; border-radius:50%; border:2px solid var(--sky); background:rgba(255,255,255,0.1); padding:2px;">
                <div style="position: absolute; bottom: -5px; right: -5px; background: ${ratioColor}; color: #000; font-size: 0.7rem; font-weight: 800; padding: 2px 5px; border-radius: 10px; border: 1px solid white;">
                    ${ratio}%
                </div>
            </div>
            <div style="text-align:left; flex-grow: 1;">
                <div style="font-size:1.1rem;font-weight:bold;color:white;margin-bottom:4px;">${p.name}</div>
                <div style="display: flex; flex-direction: column; gap: 1px;">
                    <div style="color:var(--success); font-size:0.8rem; font-weight:bold; opacity: 0.9;">✅ ${p.correctAnswers} Réussites</div>
                    <div style="color:var(--danger); font-size:0.8rem; font-weight:bold; opacity: 0.9;">❌ ${p.wrongAnswers} Erreurs</div>
                </div>
            </div>
            <div style="font-size: 1.5rem; opacity: 0.3;">🗳️</div>
        </div>`;
    }).join('');

    accordsSignedThisRound = 0;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function showToast(message) {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;

    toast.innerText = message;
    toast.className = "toast-visible";

    // On le cache après 2.5 secondes
    setTimeout(() => {
        toast.className = "toast-hidden";
    }, 2500);
}

/* --- MOTEUR D'APPLAUDISSEMENTS SYNTHÉTIQUE --- */
let applauseInterval = null;

function playApplause() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
   
    // On crée un petit intervalle pour simuler plusieurs claps qui se chevauchent
    applauseInterval = setInterval(() => {
        const duration = 0.1 + Math.random() * 0.2;
        const bufferSize = audioCtx.sampleRate * duration;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);

        // Génération de bruit blanc (texture du clap)
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        // Fréquence aléatoire pour simuler différentes mains/distances
        filter.frequency.setValueAtTime(800 + Math.random() * 1000, audioCtx.currentTime);

        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime); // Volume discret
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        noise.start();
    }, 40); // 40ms entre chaque "clap" pour un effet de foule dense
}

function stopApplause() {
    if (applauseInterval) {
        clearInterval(applauseInterval);
        applauseInterval = null;
    }
}

function toggleHelpModal() {
    const modal = document.getElementById('help-modal');
    const helpBtn = document.querySelector('.btn-help-trigger');
    const isVisible = modal.style.display === 'flex';
   
    if (isVisible) {
        modal.style.display = 'none';
        if (typeof window.isPausedBeforeHelp !== 'undefined' && !window.isPausedBeforeHelp) {
            isPaused = false;
        }
    } else {
        modal.style.display = 'flex';
        window.isPausedBeforeHelp = isPaused;
        isPaused = true;
        playSound('start');
        // Optionnel : on enlève l'animation une fois cliqué pour ne pas harceler le joueur
        if (helpBtn) helpBtn.classList.remove('help-danger-blink');
    }
}

async function showTeamScore() {
    stopApplause();
    let teamName = await showCustomModal('prompt', '🎯 MISSION ACCOMPLIE !', 'Entrez le nom de votre équipage :');
    if (!teamName || teamName.trim() === "") teamName = "Équipage Anonyme";

    saveToLeaderboard(teamName, totalTeamPoints);
   
    const leaderboard = JSON.parse(localStorage.getItem('airbusLeaderboard')) || [];
    const myRank = leaderboard.findIndex(entry => entry.current === true) + 1;
    const totalTeams = leaderboard.length;

    showScreen('screen-team-score');

    document.getElementById('stat-total-correct').innerText = realCorrectAnswers;
    document.getElementById('stat-total-wrong').innerText = totalQuestionsAsked - realCorrectAnswers;
    document.getElementById('stat-accords-saved').innerText = totalAccordsSaved;
    document.getElementById('stat-accords-lost').innerText = totalAccordsLost;

    const scoreEl = document.getElementById('final-team-points');
    const labelEl = document.getElementById('team-performance-label');

    let rankBadge = document.getElementById('final-rank-badge');
    if (!rankBadge) {
        rankBadge = document.createElement('div');
        rankBadge.id = 'final-rank-badge';
        rankBadge.className = 'rank-badge';
        labelEl.parentNode.insertBefore(rankBadge, labelEl.nextSibling);
    }
    rankBadge.innerHTML = `RANG : <span class="rank-number">${myRank}${myRank === 1 ? 'er' : 'ème'}</span> / ${totalTeams} ÉQUIPAGES`;

    const target = document.getElementById('screen-team-score').querySelector('.rules-container');
   
    const oldStats = document.querySelector('.stats-grid');
    if(oldStats) oldStats.remove();
    const oldGrid = document.querySelector('.footer-buttons-grid');
    if(oldGrid) oldGrid.remove();

    const statsContainer = document.createElement('div');
    statsContainer.className = 'stats-grid';
   
    let statsHtml = '<div class="theme-label-highlight">📊 ANALYSE DES COMPÉTENCES</div>';
   
    Object.keys(themeStats).forEach(theme => {
        const data = themeStats[theme];
        const percent = Math.round((data.correct / data.total) * 100);
        const color = percent < 40 ? 'var(--danger)' : (percent < 75 ? 'var(--sky)' : 'var(--success)');
       
        statsHtml += `
            <div class="theme-row">
                <div class="theme-info">
                    <span>${theme}</span>
                    <span>${percent}%</span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: 0%; background: ${color}" data-target="${percent}"></div>
                </div>
            </div>`;
    });
    statsContainer.innerHTML = statsHtml;
    target.appendChild(statsContainer);

    const btnGrid = document.createElement('div');
    btnGrid.className = 'footer-buttons-grid';
    btnGrid.innerHTML = `
        <button class="btn-main" onclick="location.reload()">RETOUR ACCUEIL</button>
        <button class="btn-main" style="border-color:var(--sky); color:var(--sky) !important;" onclick="cleanTestScores()">NETTOYER TESTS</button>
        <button class="btn-main btn-export-csv" onclick="exportToCSV()">EXPORTER CSV</button>
        <button class="btn-main" style="border-color:var(--danger); color:var(--danger) !important;" onclick="clearLeaderboard()">EFFACER TOUT</button>
    `;
    target.appendChild(btnGrid);

    setTimeout(() => {
        document.querySelectorAll('.progress-bar-fill').forEach(bar => {
            bar.style.width = bar.dataset.target + "%";
        });
    }, 500);

    if (totalTeamPoints >= 500) labelEl.innerText = "🌟 ÉLITE DU DIALOGUE SOCIAL";
    else if (totalTeamPoints >= 200) labelEl.innerText = "✈️ ÉQUIPAGE OPÉRATIONNEL";
    else labelEl.innerText = "⚠️ ZONE DE TURBULENCES";

    let currentDisplay = 0;
    const step = Math.max(1, Math.floor(totalTeamPoints / 50));
    const counterInterval = setInterval(() => {
        if (currentDisplay >= totalTeamPoints) {
            scoreEl.innerText = totalTeamPoints;
            clearInterval(counterInterval);
        } else {
            currentDisplay += step;
            scoreEl.innerText = currentDisplay;
        }
    }, 20);
}

// 2. Gestion du Leaderboard (LocalStorage)
function saveToLeaderboard(name, score) {
   
    let leaderboard = JSON.parse(localStorage.getItem('airbusLeaderboard')) || [];

     // 1. SECURITÉ : On retire le marqueur "current" de TOUTES les anciennes entrées
    leaderboard = leaderboard.map(entry => ({ ...entry, current: false }));

    // On ajoute le nouveau score
    leaderboard.push({
        name: name,
        score: score,
        date: new Date().toLocaleDateString(),
        current: true // Marqueur temporaire pour identifier l'équipe qui vient de jouer
    });
   
    // On trie tout par score décroissant
    leaderboard.sort((a, b) => b.score - a.score);
   
    // On sauvegarde TOUT (on ne fait plus le .slice(0, 5) ici)
    localStorage.setItem('airbusLeaderboard', JSON.stringify(leaderboard));

}

function displayLeaderboard() {
    const container = document.getElementById('leaderboard-container');
    const leaderboard = JSON.parse(localStorage.getItem('airbusLeaderboard')) || [];
   
    if (leaderboard.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:20px; opacity:0.5;">Aucun score enregistré</div>`;
        return;
    }

    const currentIndex = leaderboard.findIndex(entry => entry.current === true);
    const currentEntry = leaderboard[currentIndex];
    let html = "";

    // TOP 5
    const topLimit = Math.min(leaderboard.length, 5);
    for (let i = 0; i < topLimit; i++) {
        const entry = leaderboard[i];
        const isCurrent = (i === currentIndex);
        const rankColor = i < 3 ? 'var(--gold)' : 'var(--sky)';
        const rowClass = isCurrent ? 'leaderboard-row current-team-row' : 'leaderboard-row';

        html += `
        <div class="${rowClass}">
            <div style="display:flex; align-items:center; flex:1;">
                <span style="color:${rankColor}; font-weight:800; margin-right:15px; width:30px;">#${i + 1}</span>
                <b style="text-transform:uppercase; font-size:0.85rem; color:white;">${entry.name}</b>
            </div>
            <div style="color:var(--gold); font-weight:800;">${entry.score} PTS</div>
        </div>`;
    }

    // SI POSITION ÉLOIGNÉE (HORS TOP 5)
    if (currentIndex >= 5 && currentEntry) {
        html += `
        <div class="leaderboard-separator">•••</div>
        <div class="leaderboard-row current-team-row highlight-rank">
            <div style="display:flex; align-items:center; flex:1;">
                <span style="color:var(--gold); font-weight:900; margin-right:15px; width:40px;">#${currentIndex + 1}</span>
                <b style="text-transform:uppercase; font-size:0.85rem; color:white;">${currentEntry.name} (POSITION)</b>
            </div>
            <div style="color:var(--gold); font-weight:900;">${currentEntry.score} PTS</div>
        </div>`;
    }

    container.innerHTML = html;

// AUTO-SCROLL : Si l'équipe est hors Top 5, on descend doucement vers sa position
    if (currentIndex >= 5) {
        setTimeout(() => {
            container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        }, 800); // Petit délai pour laisser l'animation de montée des points se finir
    } else {
        container.scrollTop = 0; // Sinon, on reste en haut pour voir le podium
    }

}

// 3. Fonctions de Maintenance (Effacer)
async function cleanTestScores() {
    const testRegex = /^test(s)?$/i;
    const confirmed = await showCustomModal('confirm', '🧹 NETTOYAGE', "Supprimer tous les équipages nommés 'Test' ou 'Tests' ?");
   
    if (confirmed) {
        let leaderboard = JSON.parse(localStorage.getItem('airbusLeaderboard')) || [];
        const initialCount = leaderboard.length;
        leaderboard = leaderboard.filter(entry => !testRegex.test(entry.name.trim()));
        const finalCount = leaderboard.length;
        localStorage.setItem('airbusLeaderboard', JSON.stringify(leaderboard));
        displayLeaderboard();
        const deletedCount = initialCount - finalCount;
        showToast(`${deletedCount} SESSION(S) DE TEST SUPPRIMÉE(S) ✨`);
    }
}

async function clearLeaderboard() {
    const confirmed = await showCustomModal('confirm', '⚠️ ACTION IRRÉVERSIBLE', "Effacer l'intégralité du tableau des scores ?");
    if (confirmed) {
        localStorage.removeItem('airbusLeaderboard');
        displayLeaderboard();
        showToast("CLASSEMENT EFFACÉ 🗑️");
    }
}

function exportLeaderboard() {
    // 1. Récupérer les données
    const leaderboard = JSON.parse(localStorage.getItem('airbusLeaderboard')) || [];
   
    if (leaderboard.length === 0) {
        showToast("AUCUNE DONNÉE À EXPORTER 📭");
        return;
    }

    // 2. Créer l'en-tête du CSV
    let csvContent = "Rang;Equipage;Score;Date\n";

    // 3. Ajouter les lignes (triées par score comme dans le tableau)
    leaderboard.sort((a, b) => b.score - a.score).forEach((entry, index) => {
        const row = `${index + 1};${entry.name};${entry.score};${entry.date}`;
        csvContent += row + "\n";
    });

    // 4. Créer le fichier "Blob" (format binaire pour le téléchargement)
    // On utilise un encodage spécifique (\uFEFF) pour qu'Excel reconnaisse les accents (UTF-8)
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
   
    // 5. Créer un lien invisible pour déclencher le téléchargement
    const link = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10); // Format YYYY-MM-DD
   
    link.setAttribute("href", url);
    link.setAttribute("download", `Bilan_DiagSo_Airbus_${today}.csv`);
    link.style.visibility = 'hidden';
   
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
   
    showToast("EXPORT RÉUSSI ✅ (Fichier CSV)");
}

function exportToCSV() {
    // 1. Récupérer et trier les données par score décroissant
    let leaderboard = JSON.parse(localStorage.getItem('airbusLeaderboard')) || [];
   
    if (leaderboard.length === 0) {
        showToast("AUCUNE DONNÉE À EXPORTER ❌");
        return;
    }

    // Tri de sécurité pour l'export
    leaderboard.sort((a, b) => b.score - a.score);

    // 2. Créer l'en-tête (Rang;Nom;Score;Date)
    // Note : On utilise le point-virgule (;) car c'est le standard français pour Excel
    let csvContent = "Rang;Equipage;Score;Date de session\n";

    // 3. Remplir les lignes
    leaderboard.forEach((entry, index) => {
        const row = `${index + 1};${entry.name};${entry.score};${entry.date}`;
        csvContent += row + "\n";
    });

    // 4. Création du Blob avec BOM UTF-8 (le \uFEFF force Excel à lire les accents)
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
   
    // 5. Téléchargement discret
    const link = document.createElement("a");
    const timestamp = new Date().toLocaleDateString().replace(/\//g, "-");
   
    link.setAttribute("href", url);
    link.setAttribute("download", `Classement_DiagSo_Airbus_${timestamp}.csv`);
    link.style.visibility = 'hidden';
   
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("CLASSEMENT EXPORTÉ ✅");
}

function preloadAvatars() {
    animalAvatars.forEach(url => {
        const img = new Image();
        img.src = url;
    });
    console.log("🚀 Avatars mis en cache");
}

// Appelez cette fonction à la fin du chargement de la page
window.addEventListener('load', () => {
    updateNameInputs();
    preloadAvatars();
});

function getPlayerTitle(p) {
    const total = p.correctAnswers + p.wrongAnswers;
    const ratio = total > 0 ? (p.correctAnswers / total) * 100 : 0;
    // 1. Le Négociateur Né (Zéro faute et au moins 5 questions)
    if (p.wrongAnswers === 0 && p.correctAnswers >= 5)
        return { title: "Le Négociateur Né", icon: "💎", desc: "Précision chirurgicale. Aucune erreur de pilotage." };

    // 2. Le Brise-Glace (A sauvé la jauge en zone rouge)
    // Note : On pourrait tracker l'utilisation du bouton banque en zone rouge,
    // ici on simplifie par un ratio solide malgré des tentatives.
    if (ratio >= 80)
        return { title: "L'As du Dialogue", icon: "🎖️", desc: "Maîtrise totale des accords et des instances." };

    // 3. Le Pilote Prudent (Peu d'erreurs, régulier)
    if (p.wrongAnswers <= 2 && p.correctAnswers > 0)
        return { title: "Le Pilote Prudent", icon: "🛡️", desc: "Garant de la stabilité et de la paix sociale." };
    // 4. Le Médiateur (Plus de 50% de réussite)
    if (ratio >= 50)
        return { title: "Le Médiateur", icon: "🤝", desc: "Toujours à la recherche du consensus." };

    // 5. Apprenti DRH (Par défaut)
    return { title: "Apprenti DRH", icon: "📚", desc: "En phase d'apprentissage des rouages sociaux." };
}

function getTeamDistinction(totalPoints, finalGauge) {
    // 1. Équipage de Haute Voltige (Score élevé ET Paix Sociale > 80%)
    if (totalPoints >= 5000 && finalGauge >= 80)
        return { name: "Équipage de Haute Voltige", icon: "🚀", desc: "Performance exceptionnelle. Le dialogue et les résultats sont au sommet." };

    // 2. Gestionnaires de Crise (Score correct mais jauge basse < 40%)
    if (totalPoints >= 3000 && finalGauge < 40)
        return { name: "Gestionnaires de Crise", icon: "👨‍🚒", desc: "Vous avez privilégié les résultats malgré un climat social très tendu." };

    // 3. Diplomates de l'Air (Jauge > 90% mais score modéré)
    if (finalGauge >= 90 && totalPoints < 3000)
        return { name: "Diplomates de l'Air", icon: "🕊️", desc: "La paix sociale est votre priorité absolue. Un équipage très soudé." };

    // 4. Vol de Reconnaissance (Par défaut)
    return { name: "Vol de Reconnaissance", icon: "🚁", desc: "Une mission de découverte. Continuez à pratiquer vos accords !" };
}

// --- LOGIQUE DE SUPPRESSION DU FOOTER EN FINALE ---
// Ce code observe les changements d'écrans et masque le logo/footer si on est en Duel
const observer = new MutationObserver(() => {
    const gameScreen = document.getElementById('screen-game');
    const footer = document.querySelector('.airbus-logo-fixed');
    const duelHeader = document.getElementById('duel-header');

    if (gameScreen && footer && duelHeader) {
        // Si l'écran de jeu est actif ET que le header du duel est visible
        if (gameScreen.classList.contains('active') && duelHeader.style.display !== 'none') {
            footer.style.display = 'none'; // On cache
        } else {
            footer.style.display = 'block'; // On réaffiche sur les autres écrans
        }
    }
});

// On lance la surveillance sur le body pour détecter les changements de classes (active)
observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class', 'style'] });

// --- FORCE LA SUPPRESSION DU FOOTER EN FINALE ---
setInterval(() => {
    const playersList = document.getElementById('players-list');
    const duelHeader = document.getElementById('duel-header');
    const gameScreen = document.getElementById('screen-game');

    if (playersList && duelHeader && gameScreen) {
        // Si l'écran de jeu est actif ET que le header du duel est affiché (pas en none)
        if (gameScreen.classList.contains('active') && duelHeader.style.display !== 'none') {
            playersList.style.setProperty('display', 'none', 'important');
        } else {
            // On le remet si on n'est plus en duel
            if (!gameScreen.classList.contains('active')) {
                playersList.style.display = 'flex';
            }
        }
    }
}, 500);

function toggleFullScreen() {
// On récupère l'élément racine
    const elem = document.documentElement;

    if (!document.fullscreenElement &&    // Standard
        !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // Anciens navigateurs
       
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
        document.getElementById('btn-fullscreen').innerText = "✕"; // Change l'icône une fois activé
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
        document.getElementById('btn-fullscreen').innerText = "⛶";
    }

// SÉCURITÉ : On s'assure que le bourdonnement ne se relance pas ici
    // Si on est déjà en cours de jeu, on force l'arrêt au cas où le navigateur ferait du zèle
    if (!document.getElementById('screen-home').classList.contains('active')) {
        stopIntroMusic();
    }

}

function showCustomModal(type, title, message) {
    return new Promise((resolve) => {
        const overlay = document.getElementById('custom-modal-overlay');
        const titleEl = document.getElementById('custom-modal-title');
        const messageEl = document.getElementById('custom-modal-message');
        const inputEl = document.getElementById('custom-modal-input');
        const btnConfirm = document.getElementById('custom-modal-confirm');
        const btnCancel = document.getElementById('custom-modal-cancel');

        titleEl.innerText = title;
        messageEl.innerText = message;
        inputEl.value = "";
        inputEl.style.display = type === 'prompt' ? 'block' : 'none';
       
        overlay.classList.add('visible');
        if (type === 'prompt') inputEl.focus();

        const closeAndResolve = (result) => {
            overlay.classList.remove('visible');
            btnConfirm.onclick = null;
            btnCancel.onclick = null;
            resolve(result);
        };

        btnConfirm.onclick = () => closeAndResolve(type === 'prompt' ? inputEl.value : true);
        btnCancel.onclick = () => closeAndResolve(type === 'prompt' ? null : false);
    });
}
