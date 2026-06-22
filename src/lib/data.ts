export const mockOpportunities = [
  {
    id: "1",
    title: "Développeur Frontend Junior",
    organization: "TechVision Lomé",
    type: "emploi" as const,
    typeLabel: "Emploi",
    domain: "Web",
    level: "Débutant",
    location: "Lomé",
    deadline: "15 Juil",
    saves: 24
  },
  {
    id: "2",
    title: "Stage en Data Science",
    organization: "DataTogo Analytics",
    type: "stage" as const,
    typeLabel: "Stage",
    domain: "Data",
    level: "Débutant",
    location: "Remote",
    deadline: "20 Juil",
    saves: 42
  },
  {
    id: "3",
    title: "Tech Meetup #6",
    organization: "Les Pros de la Tech",
    type: "evenement" as const,
    typeLabel: "Événement",
    domain: "Général",
    level: "Tous",
    location: "Lomé",
    deadline: "27 Juin",
    saves: 156
  },
  {
    id: "4",
    title: "Formation React 2026",
    organization: "CodeAcademy TG",
    type: "formation" as const,
    typeLabel: "Formation",
    domain: "Web",
    level: "Intermédiaire",
    location: "Lomé",
    deadline: "10 Août",
    saves: 89
  },
  {
    id: "5",
    title: "Incubateur Zizi Africa",
    organization: "Zizi Ventures",
    type: "programme" as const,
    typeLabel: "Programme",
    domain: "Entrepreneuriat",
    level: "Avancé",
    location: "Togo",
    deadline: "30 Août",
    saves: 12
  },
  {
    id: "6",
    title: "Hackathon Build Africa",
    organization: "Tech Hub",
    type: "concours" as const,
    typeLabel: "Concours",
    domain: "Mobile",
    level: "Tous",
    location: "Lomé",
    deadline: "5 Sept",
    saves: 67
  }
];

export const mockCategories = [
  { id: "stage", label: "Stage", count: 24, type: "stage" as const },
  { id: "emploi", label: "Emploi", count: 45, type: "emploi" as const },
  { id: "evenement", label: "Événement", count: 12, type: "evenement" as const },
  { id: "formation", label: "Formation", count: 18, type: "formation" as const },
  { id: "programme", label: "Programme", count: 5, type: "programme" as const },
  { id: "concours", label: "Concours", count: 8, type: "concours" as const }
];
