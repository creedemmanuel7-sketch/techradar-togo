import { collection, addDoc, setDoc, doc, Timestamp, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";
import { UserProfile, OpportunityData } from "./db";

// Helper to generate a random ID
function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

export async function seedDatabase() {
  console.log("Starting database seeding & cleanup...");

  try {
    // 0. CLEANUP OLD DATA
    console.log("Cleaning old opportunities...");
    const oppsSnap = await getDocs(collection(db, "opportunities"));
    const deleteOpps = oppsSnap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deleteOpps);
    
    console.log("Cleaning old seed users...");
    const usersSnap = await getDocs(collection(db, "users"));
    const deleteUsers = usersSnap.docs
      .filter(d => d.id.startsWith("talent_") || d.id.startsWith("recruiter_"))
      .map(d => deleteDoc(d.ref));
    await Promise.all(deleteUsers);
    
    console.log("Cleanup done. Injecting new data...");

    // 1. Seed Talents (Users)
    const talents: UserProfile[] = [
    {
      name: "Edem Kodjo",
      email: "edem.k@example.tg",
      role: "talent",
      bio: "Développeur Fullstack passionné par les technologies web modernes. Spécialisé en React et Node.js.",
      location: "Lomé, Togo",
      skills: "React, Node.js, TypeScript, Tailwind CSS",
      photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Edem",
      createdAt: Date.now() - 10000000,
    },
    {
      name: "Abla Mensah",
      email: "abla.m@example.tg",
      role: "talent",
      bio: "Product Designer (UI/UX) avec 3 ans d'expérience. J'adore créer des interfaces intuitives et accessibles.",
      location: "Lomé, Togo",
      skills: "Figma, UI Design, UX Research, Prototypage",
      photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Abla",
      createdAt: Date.now() - 20000000,
    },
    {
      name: "Koffi Agbeko",
      email: "koffi.a@example.tg",
      role: "talent",
      bio: "Ingénieur DevOps et Cloud. J'automatise des infrastructures sur AWS et Google Cloud.",
      location: "Kpalimé, Togo",
      skills: "Docker, Kubernetes, AWS, CI/CD, Terraform",
      photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Koffi",
      createdAt: Date.now() - 30000000,
    },
    {
      name: "Afia Sow",
      email: "afia.s@example.tg",
      role: "talent",
      bio: "Développeuse Mobile React Native & Flutter. Focus sur l'expérience utilisateur mobile.",
      location: "Kara, Togo",
      skills: "React Native, Flutter, Firebase, Mobile App",
      photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Afia",
      createdAt: Date.now() - 40000000,
    },
    {
      name: "Komi Tetteh",
      email: "komi.t@example.tg",
      role: "talent",
      bio: "Data Scientist Junior spécialisé en analyse de données et Machine Learning avec Python.",
      location: "Lomé, Togo",
      skills: "Python, Pandas, Machine Learning, SQL",
      photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Komi",
      createdAt: Date.now() - 50000000,
    },
    {
      name: "Yao Dossou",
      email: "yao.d@example.tg",
      role: "talent",
      bio: "Développeur Backend Python/Django. Conception d'APIs REST robustes.",
      location: "Lomé, Togo",
      skills: "Python, Django, PostgreSQL, API REST",
      photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Yao",
      createdAt: Date.now() - 60000000,
    },
    {
      name: "Akouvi Bado",
      email: "akouvi.b@example.tg",
      role: "talent",
      bio: "Scrum Master et Product Owner expérimentée dans la gestion de projets agiles.",
      location: "Remote",
      skills: "Scrum, Jira, Agile, Product Management",
      photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Akouvi",
      createdAt: Date.now() - 70000000,
    },
    {
      name: "Kokouvi Lawson",
      email: "kokouvi.l@example.tg",
      role: "talent",
      bio: "Développeur Frontend Angular et Vue.js. Expert en intégration web.",
      location: "Tsévié, Togo",
      skills: "Angular, Vue.js, HTML, CSS, JavaScript",
      photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kokouvi",
      createdAt: Date.now() - 80000000,
    },
  ];

  // 2. Seed Recruiters (To own some opportunities)
  const recruiterId = "recruiter_" + generateId();
    const recruiter: UserProfile = {
      name: "Agence PayGo",
      email: "rh@paygo.tg",
      role: "recruiter",
      location: "Lomé, Togo",
      createdAt: Date.now(),
    };

    // Add Recruiter
    await setDoc(doc(db, "users", recruiterId), recruiter);

    // Add Talents
    for (const talent of talents) {
      const id = "talent_" + generateId();
      await setDoc(doc(db, "users", id), talent);
    }
    console.log(`✅ Injected ${talents.length} talents`);

    // 3. Seed Opportunities
    const opportunities: Omit<OpportunityData, "publisherId">[] = [
      {
        title: "Meet-Up Challenge #3 - Build for the Community",
        organization: "TechRadar Togo",
        type: "evenement",
        typeLabel: "Hackathon",
        domain: "Général",
        level: "Tous",
        location: "Lomé (En présentiel)",
        deadline: "2026-06-27",
        externalLink: "https://techradar.tg",
        description: "Rejoignez-nous pour le grand hackathon de la communauté ! 72h pour construire une solution tech innovante à un problème local. Présentation devant un jury d'experts.",
      },
      {
        title: "Bootcamp Intensif React & Node.js",
        organization: "CodeAcademy TG",
        type: "formation",
        typeLabel: "Bootcamp",
        domain: "Web",
        level: "Débutant",
        location: "En ligne",
        deadline: "2026-08-15",
        externalLink: "https://codeacademy.tg",
        description: "Formation de 12 semaines pour maîtriser le développement Fullstack JavaScript. Ouvert aux débutants passionnés. Projets pratiques et mentorat inclus.",
      },
      {
        title: "Concours d'Innovation Fintech 2026",
        organization: "Banque Panafricaine",
        type: "concours",
        typeLabel: "Compétition",
        domain: "Entrepreneuriat",
        level: "Intermédiaire",
        location: "Lomé",
        deadline: "2026-09-10",
        externalLink: "https://fintech-challenge.tg",
        description: "Vous avez une idée révolutionnaire pour l'inclusion financière en Afrique ? Participez au concours et tentez de remporter le grand prix de 5 millions FCFA.",
      },
      {
        title: "Stage Pré-Emploi Développement Flutter",
        organization: "AgriTech Solutions",
        type: "stage",
        typeLabel: "Stage PFE",
        domain: "Mobile",
        level: "Débutant",
        location: "Kpalimé",
        deadline: "2026-07-01",
        externalLink: "https://agritech.tg",
        description: "Nous recherchons un stagiaire motivé pour participer au développement de notre nouvelle application mobile destinée aux agriculteurs togolais.",
      },
      {
        title: "Programme 'Women in Tech Togo'",
        organization: "Femmes & Tech",
        type: "programme",
        typeLabel: "Mentorat",
        domain: "Général",
        level: "Tous",
        location: "Hybride",
        deadline: "2026-07-30",
        externalLink: "https://womenintech.tg",
        description: "Programme d'accompagnement de 6 mois pour les jeunes femmes souhaitant faire carrière dans le numérique. Sessions de mentorat, ateliers et networking.",
      },
      {
        title: "Développeur Senior Frontend Vue.js",
        organization: "StartupHub",
        type: "emploi",
        typeLabel: "CDI",
        domain: "Web",
        level: "Avancé",
        location: "Remote",
        deadline: "2026-08-05",
        externalLink: "https://startuphub.tg",
        description: "Poste en CDI 100% remote. Rejoignez notre équipe produit pour concevoir des interfaces modernes et performantes avec Vue.js 3 et Tailwind CSS.",
      },
      {
        title: "Atelier UI/UX : Les bases d'une app réussie",
        organization: "Designers Club TG",
        type: "evenement",
        typeLabel: "Atelier",
        domain: "Design",
        level: "Débutant",
        location: "Lomé (Agoè)",
        deadline: "2026-07-10",
        externalLink: "https://designersclub.tg",
        description: "Apprenez les principes fondamentaux de l'UX/UI avec des experts locaux. Comment passer de l'idée au prototype sur Figma en une journée.",
      },
      {
        title: "Masterclass Machine Learning sur Google Cloud",
        organization: "CloudAfrica",
        type: "formation",
        typeLabel: "Masterclass",
        domain: "IA",
        level: "Avancé",
        location: "En ligne",
        deadline: "2026-09-01",
        externalLink: "https://cloudafrica.net",
        description: "Formation pointue sur le déploiement de modèles d'IA à l'échelle sur GCP en utilisant Vertex AI. Réservé aux data scientists expérimentés.",
      },
      {
        title: "CTF (Capture The Flag) Cybersécurité",
        organization: "Togo Hackers",
        type: "concours",
        typeLabel: "CTF",
        domain: "Cybersécurité",
        level: "Intermédiaire",
        location: "En ligne",
        deadline: "2026-08-20",
        externalLink: "https://togohackers.tg",
        description: "Testez vos compétences en sécurité informatique lors de ce CTF de 48h. Epreuves de reverse engineering, web exploitation et cryptographie.",
      },
      {
        title: "Meetup : L'avenir de l'Open Source au Togo",
        organization: "OS Togo",
        type: "evenement",
        typeLabel: "Meetup",
        domain: "Général",
        level: "Tous",
        location: "Lomé (Centre Ville)",
        deadline: "2026-07-22",
        externalLink: "https://ostogo.org",
        description: "Rencontre mensuelle de la communauté Open Source. Échanges sur les contributions possibles aux grands projets mondiaux depuis le Togo.",
      },
      {
        title: "Stage Assistant Data Analyst",
        organization: "TogoTelecom",
        type: "stage",
        typeLabel: "Stage de Vacances",
        domain: "Data",
        level: "Débutant",
        location: "Lomé",
        deadline: "2026-07-15",
        externalLink: "https://togotelecom.tg",
        description: "Idéal pour les étudiants en fin d'année. Vous aiderez l'équipe Data à nettoyer et visualiser les données commerciales sous PowerBI.",
      },
      {
        title: "Incubation Startups Tech (Cohorte 5)",
        organization: "Nunya Lab",
        type: "programme",
        typeLabel: "Incubation",
        domain: "Entrepreneuriat",
        level: "Intermédiaire",
        location: "Lomé",
        deadline: "2026-08-10",
        externalLink: "https://nunyalab.tg",
        description: "Vous avez un MVP ? Intégrez notre programme d'incubation pour structurer votre business model et préparer votre première levée de fonds.",
      },
      {
        title: "Ingénieur Backend Python (Django)",
        organization: "E-Commerce TG",
        type: "emploi",
        typeLabel: "Freelance",
        domain: "Web",
        level: "Intermédiaire",
        location: "Remote",
        deadline: "2026-07-25",
        externalLink: "https://ecommerce.tg",
        description: "Mission freelance de 6 mois pour optimiser l'API de notre marketplace. Solide expérience sur Django, PostgreSQL et Celery requise.",
      },
      {
        title: "Webinaire : Sécuriser ses applications Web",
        organization: "TechRadar Togo",
        type: "evenement",
        typeLabel: "Webinaire",
        domain: "Cybersécurité",
        level: "Intermédiaire",
        location: "En ligne",
        deadline: "2026-07-05",
        externalLink: "https://techradar.tg",
        description: "Session en direct avec un expert cybersécurité pour comprendre le top 10 OWASP et apprendre à protéger vos applications.",
      },
      {
        title: "Formation Découverte de Figma",
        organization: "UI/UX Togo",
        type: "formation",
        typeLabel: "Atelier Pratique",
        domain: "Design",
        level: "Débutant",
        location: "Lomé",
        deadline: "2026-08-01",
        externalLink: "https://uiux.tg",
        description: "Initiation complète à l'outil Figma. Création d'une maquette d'application mobile étape par étape.",
      },
      {
        title: "Game Jam Lome 2026",
        organization: "Togo Gaming",
        type: "concours",
        typeLabel: "Game Jam",
        domain: "Général",
        level: "Tous",
        location: "Hybride",
        deadline: "2026-09-15",
        externalLink: "https://togogaming.tg",
        description: "48h pour créer un jeu vidéo complet sur un thème imposé. Programmeurs, artistes, musiciens, tous les talents sont les bienvenus !",
      },
      {
        title: "Programme Accélération E-Santé",
        organization: "HealthTech Africa",
        type: "programme",
        typeLabel: "Accélération",
        domain: "Entrepreneuriat",
        level: "Avancé",
        location: "Lomé / Paris",
        deadline: "2026-10-01",
        externalLink: "https://healthtech.africa",
        description: "Accompagnement intensif pour les startups e-santé générant déjà du revenu. Accès à des financements européens et du mentorat.",
      },
      {
        title: "Stage Developpeur Mobile iOS",
        organization: "Digital Agency Lomé",
        type: "stage",
        typeLabel: "Stage PFE",
        domain: "Mobile",
        level: "Intermédiaire",
        location: "Lomé",
        deadline: "2026-08-20",
        externalLink: "https://digital-agency.tg",
        description: "Venez apprendre Swift et SwiftUI avec nos experts. Vous participerez à la refonte de l'application de notre client principal.",
      },
      {
        title: "Conférence Cloud & Data Africa",
        organization: "Google Dev Group",
        type: "evenement",
        typeLabel: "Conférence",
        domain: "Data",
        level: "Tous",
        location: "Palais des Congrès, Lomé",
        deadline: "2026-11-10",
        externalLink: "https://clouddata.africa",
        description: "Le plus grand rassemblement de professionnels Cloud et Data d'Afrique de l'Ouest. Keynotes, panels et networking.",
      },
      {
        title: "Scrum Master",
        organization: "Banque Panafricaine",
        type: "emploi",
        typeLabel: "CDD",
        domain: "Général",
        level: "Intermédiaire",
        location: "Lomé",
        deadline: "2026-07-30",
        externalLink: "https://banque-pan.tg",
        description: "Contrat à durée déterminée d'un an pour accompagner notre transformation agile. Jira, Confluence, et aisance relationnelle.",
      }
    ];

    for (const opp of opportunities) {
      await addDoc(collection(db, "opportunities"), {
        ...opp,
        publisherId: recruiterId,
        saves: 0,
        createdAt: Timestamp.now(),
      });
    }
    console.log(`✅ Injected ${opportunities.length} opportunities`);

    return { success: true, message: "Base de données initialisée avec succès !" };
  } catch (error) {
    console.error("Error seeding database: ", error);
    return { success: false, message: "Erreur lors de l'injection des données." };
  }
}
