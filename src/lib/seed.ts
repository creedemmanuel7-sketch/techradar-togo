import { collection, addDoc, setDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "./firebase";
import { UserProfile, OpportunityData } from "./db";

// Helper to generate a random ID
function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

export async function seedDatabase() {
  console.log("Starting database seeding...");

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

  try {
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
        title: "Développeur Senior React / Node.js",
        organization: "PayGo Africa",
        type: "emploi",
        typeLabel: "CDI",
        domain: "Web",
        level: "Avancé",
        location: "Lomé",
        deadline: "2026-08-30",
        externalLink: "https://paygo.tg/jobs",
        description: "Nous cherchons un développeur Fullstack expérimenté pour mener notre équipe technique. Compétences requises : React, Node.js, TypeScript. Expérience avec le cloud AWS est un plus.",
      },
      {
        title: "Product Designer (UX/UI)",
        organization: "Tech Innovate Togo",
        type: "emploi",
        typeLabel: "CDD",
        domain: "Design",
        level: "Intermédiaire",
        location: "Lomé",
        deadline: "2026-07-15",
        externalLink: "https://techinnovate.tg",
        description: "Rejoignez-nous pour concevoir la prochaine application fintech du Togo. Maîtrise de Figma, prototypage interactif et recherche utilisateur requise.",
      },
      {
        title: "Ingénieur DevOps AWS",
        organization: "CloudAfrica",
        type: "emploi",
        typeLabel: "Freelance",
        domain: "Web",
        level: "Avancé",
        location: "Remote",
        deadline: "2026-09-01",
        externalLink: "https://cloudafrica.net",
        description: "Mission de 6 mois pour automatiser l'infrastructure d'un grand compte. Compétences : Docker, Kubernetes, Terraform, CI/CD sur GitLab.",
      },
      {
        title: "Stage Développeur Mobile Flutter",
        organization: "AgriTech Solutions",
        type: "stage",
        typeLabel: "Stage",
        domain: "Mobile",
        level: "Débutant",
        location: "Kpalimé",
        deadline: "2026-07-01",
        externalLink: "https://agritech.tg",
        description: "Stage pré-emploi pour un développeur mobile junior. Vous travaillerez sur notre app Flutter pour les agriculteurs. Connaissances en Firebase appréciées.",
      },
      {
        title: "Data Analyst Junior",
        organization: "TogoTelecom",
        type: "emploi",
        typeLabel: "CDI",
        domain: "Data",
        level: "Débutant",
        location: "Lomé",
        deadline: "2026-08-10",
        externalLink: "https://togotelecom.tg",
        description: "Analyse des données clients. Maîtrise de SQL, Python (Pandas) et des outils de BI (Tableau ou PowerBI) requise.",
      },
      {
        title: "Développeur Backend Python/Django",
        organization: "E-Commerce TG",
        type: "emploi",
        typeLabel: "CDI",
        domain: "Web",
        level: "Intermédiaire",
        location: "Lomé",
        deadline: "2026-07-20",
        externalLink: "https://ecommerce.tg",
        description: "Nous recherchons un développeur Backend robuste pour notre API. Python, Django, PostgreSQL et REST APIs obligatoires.",
      },
      {
        title: "Scrum Master Agile",
        organization: "Digital Agency Lomé",
        type: "emploi",
        typeLabel: "CDI",
        domain: "Général",
        level: "Intermédiaire",
        location: "Lomé",
        deadline: "2026-07-25",
        externalLink: "https://digital-agency.tg",
        description: "Vous animerez les rituels Scrum de 3 équipes de développeurs. Outils: Jira, Confluence. Excellente communication.",
      },
      {
        title: "Développeur Frontend Vue.js",
        organization: "StartupHub",
        type: "emploi",
        typeLabel: "Freelance",
        domain: "Web",
        level: "Intermédiaire",
        location: "Remote",
        deadline: "2026-08-05",
        externalLink: "https://startuphub.tg",
        description: "Mission urgente pour refondre l'interface utilisateur d'un Dashboard B2B. Compétences en Vue.js 3 et Tailwind CSS requises.",
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
