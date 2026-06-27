/**
 * Script de seed data pour TechRadar Togo
 * Crée 2 talents et 1 recruteur avec une publication pour la démo
 * 
 * Utilisation :
 * 1. Copier ce fichier dans src/app/api/seed/route.ts
 * 2. Visiter /api/seed pour exécuter
 * 3. Supprimer le fichier après utilisation
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';

export async function GET() {
  try {
    // Talent 1 : Développeur Fullstack
    await setDoc(doc(db, 'users', 'talent-1-demo'), {
      name: 'Kofi Mensah',
      email: 'kofi.mensah@demo.tech',
      role: 'talent',
      skills: 'React, Next.js, TypeScript, Node.js, MongoDB, Docker, AWS, GraphQL',
      bio: 'Développeur Fullstack passionné par le web moderne et le cloud',
      location: 'Lomé',
      createdAt: Date.now() - 86400000 * 7, // 7 jours ago
      authProvider: 'email',
      deviceInfo: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      source: 'direct',
      savedOpportunities: []
    });

    // Talent 2 : Data Scientist
    await setDoc(doc(db, 'users', 'talent-2-demo'), {
      name: 'Awa Koffi',
      email: 'awa.koffi@demo.tech',
      role: 'talent',
      skills: 'Python, Pandas, TensorFlow, Machine Learning, SQL, Data Visualization, Scikit-learn',
      bio: 'Data Scientist spécialisée en NLP et computer vision',
      location: 'Lomé',
      createdAt: Date.now() - 86400000 * 3, // 3 jours ago
      authProvider: 'google',
      deviceInfo: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      source: 'referral',
      savedOpportunities: []
    });

    // Recruteur : Nunya Lab
    await setDoc(doc(db, 'users', 'recruiter-1-demo'), {
      name: 'Marie Koffi',
      email: 'marie@nunya-lab.tg',
      role: 'recruiter',
      bio: 'Responsable des talents chez Nunya Lab',
      location: 'Lomé',
      createdAt: Date.now() - 86400000 * 30, // 30 jours ago
      authProvider: 'email',
      deviceInfo: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      source: 'direct',
      isVerified: true
    });

    // Publication du recruteur
    await addDoc(collection(db, 'opportunities'), {
      title: 'Développeur Fullstack React/Node.js',
      organization: 'Nunya Lab',
      type: 'emploi',
      typeLabel: 'Emploi',
      domain: 'Web',
      level: 'Intermédiaire',
      location: 'Lomé',
      deadline: '15 Juil',
      description: 'Nous recherchons un développeur Fullstack passionné pour rejoindre notre équipe. Vous travaillerez sur des projets innovants utilisant React, Next.js, Node.js et MongoDB. Expérience avec Docker et AWS appréciée. Remote possible 2 jours/semaine.',
      publisherId: 'recruiter-1-demo',
      publisherIsVerified: true,
      status: 'open',
      saves: 12,
      applicantCount: 5,
      views: 89,
      createdAt: Date.now() - 86400000 * 2 // 2 jours ago
    });

    // Publication supplémentaire pour le matching
    await addDoc(collection(db, 'opportunities'), {
      title: 'Stage Data Scientist - Machine Learning',
      organization: 'DataTogo Analytics',
      type: 'stage',
      typeLabel: 'Stage',
      domain: 'Data',
      level: 'Débutant',
      location: 'Lomé',
      deadline: '20 Juil',
      description: 'Stage de 6 mois en Data Science. Vous travaillerez sur des projets concrets de machine learning avec Python, TensorFlow et Scikit-learn. Formation continue incluse. Possibilité de CDI après stage.',
      publisherId: 'recruiter-1-demo',
      publisherIsVerified: true,
      status: 'open',
      saves: 24,
      applicantCount: 8,
      views: 156,
      createdAt: Date.now() - 86400000 * 1 // 1 jour ago
    });

    // Publication événement
    await addDoc(collection(db, 'opportunities'), {
      title: 'Hackathon AI Togo 2026',
      organization: 'Les Pros de la Tech',
      type: 'evenement',
      typeLabel: 'Événement',
      domain: 'IA',
      level: 'Tous',
      location: 'Lomé',
      deadline: '27 Juin',
      description: '48h pour construire une solution IA innovante pour le Togo. Équipes de 3-5 personnes. Prix : 1 000 000 FCFA pour le gagnant. Inscription gratuite. Repas et hébergement inclus.',
      publisherId: 'recruiter-1-demo',
      publisherIsVerified: true,
      status: 'open',
      saves: 67,
      applicantCount: 0,
      views: 234,
      createdAt: Date.now() - 86400000 * 5 // 5 jours ago
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Données de démo créées avec succès !',
      accounts: [
        { email: 'kofi.mensah@demo.tech', password: 'demo123', role: 'talent' },
        { email: 'awa.koffi@demo.tech', password: 'demo123', role: 'talent' },
        { email: 'marie@nunya-lab.tg', password: 'demo123', role: 'recruiter' }
      ]
    });
  } catch (error) {
    console.error('Erreur seed data:', error);
    return NextResponse.json({ success: false, error: 'Erreur lors de la création des données' }, { status: 500 });
  }
}
