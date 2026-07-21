import React, { useState, useMemo } from "react";
import {
  Search, Cpu, Bot, UserCheck, Send, AlertTriangle, CheckCircle2,
  Loader2, Play, ArrowRight, Split, Database,
} from "lucide-react";

// Le dataset (79 demandes) sert de BASE DE CONNAISSANCES pour le RAG.
const KB = [{"id": 1, "categorie": "Onboarding", "langue": "FR", "urgence": "Haute", "entreprise": "Nestlé SA", "message": "Bonjour, j'ai essayé d'inviter 45 collaborateurs sur Swibeco la semaine dernière mais aucun n'a reçu l'email d'invitation. Pouvez-vous vérifier ? C'est urgent car notre lancement est prévu lundi."}, {"id": 2, "categorie": "Onboarding", "langue": "FR", "urgence": "Normale", "entreprise": "Rolex SA", "message": "Département: RH | Sujet: Import | Message: Je souhaite importer notre liste de 120 collaborateurs. Quel format de fichier acceptez-vous ? CSV ou Excel ?"}, {"id": 3, "categorie": "Onboarding", "langue": "EN", "urgence": "Haute", "entreprise": "ABB Ltd", "message": "Hi, we launched Swibeco 3 days ago but 12 employees still cannot activate their accounts. They receive the email but the activation link says 'expired'. Please help urgently."}, {"id": 4, "categorie": "Onboarding", "langue": "FR", "urgence": "Normale", "entreprise": "Novartis AG", "message": "Département: RH | Sujet: Modification | Message: Un collaborateur a changé d'adresse email professionnelle. Comment puis-je mettre à jour son profil Swibeco ?"}, {"id": 5, "categorie": "Onboarding", "langue": "EN", "urgence": "Basse", "entreprise": "Kuehne+Nagel", "message": "Hello, we are planning to onboard our team next month. Could you send us a step-by-step guide for the onboarding process? We have around 200 employees."}, {"id": 6, "categorie": "Onboarding", "langue": "FR", "urgence": "Haute", "entreprise": "Swatch Group", "message": "Bonjour, une collaboratrice clé n'arrive pas à activer son compte depuis 4 jours. Elle reçoit l'email mais le lien ne fonctionne pas. Son nom : Anne-Sophie Favre. Merci de traiter en urgence."}, {"id": 7, "categorie": "Onboarding", "langue": "EN", "urgence": "Normale", "entreprise": "Zurich Insurance", "message": "Department: HR | Subject: Bulk invite | Message: How can I send invitations to 350 employees at once? Is there a bulk upload feature available?"}, {"id": 8, "categorie": "Onboarding", "langue": "FR", "urgence": "Normale", "entreprise": "Givaudan SA", "message": "Bonjour, j'ai invité par erreur deux fois la même liste de collaborateurs. Certains ont maintenant deux comptes. Comment puis-je supprimer les doublons ?"}, {"id": 9, "categorie": "Onboarding", "langue": "EN", "urgence": "Basse", "entreprise": "Lonza Group", "message": "Department: HR | Subject: Language | Message: Some of our employees prefer German. Can they change the platform language after signing up?"}, {"id": 10, "categorie": "Onboarding", "langue": "FR", "urgence": "Haute", "entreprise": "Richemont", "message": "Bonjour, j'ai tenté d'importer notre fichier CSV de 80 collaborateurs mais le système affiche une erreur : 'Format de colonne invalide'. J'ai besoin d'aide immédiatement car la direction attend le lancement demain."}, {"id": 11, "categorie": "Onboarding", "langue": "EN", "urgence": "Normale", "entreprise": "LafargeHolcim", "message": "Hi, we would like to configure SSO with our Azure AD for the Swibeco login. Could you provide the technical documentation?"}, {"id": 12, "categorie": "Onboarding", "langue": "FR", "urgence": "Basse", "entreprise": "Firmenich", "message": "Département: RH | Sujet: Délai | Message: Combien de temps les collaborateurs ont-ils pour activer leur compte après avoir reçu l'invitation ?"}, {"id": 13, "categorie": "Onboarding", "langue": "FR", "urgence": "Normale", "entreprise": "Migros", "message": "Bonjour, nous avons des collaborateurs en entrepôt qui n'ont pas d'adresse email professionnelle. Comment peuvent-ils accéder à Swibeco ?"}, {"id": 14, "categorie": "Onboarding", "langue": "EN", "urgence": "Haute", "entreprise": "UBS AG", "message": "Department: HR | Subject: Bounced emails | Message: We sent invitations yesterday and already have 23 bounced emails. Our IT says the domain swibeco.ch might be blocked. What should we do?"}, {"id": 15, "categorie": "Onboarding", "langue": "FR", "urgence": "Normale", "entreprise": "CERN", "message": "Bonjour, notre entreprise a changé de nom suite à une fusion. Comment mettre à jour le nom affiché sur la plateforme Swibeco pour nos collaborateurs ?"}, {"id": 16, "categorie": "Onboarding", "langue": "EN", "urgence": "Basse", "entreprise": "Swiss Re", "message": "Hello, some employees are asking if there is a mobile app for Swibeco. Where can they download it? iOS and Android?"}, {"id": 17, "categorie": "Onboarding", "langue": "FR", "urgence": "Normale", "entreprise": "Credit Suisse", "message": "Département: Admin | Sujet: Accès | Message: Je souhaite donner un accès administrateur à ma collègue RH. Comment puis-je faire ?"}, {"id": 18, "categorie": "Onboarding", "langue": "EN", "urgence": "Haute", "entreprise": "Straumann", "message": "Hi, I accidentally imported the wrong employee list — it contained outdated data including former employees. How can I reset the list and reimport the correct version urgently?"}, {"id": 19, "categorie": "Onboarding", "langue": "FR", "urgence": "Basse", "entreprise": "Nestlé Suisse", "message": "Département: RH | Sujet: Test | Message: Puis-je créer un compte test pour vérifier l'expérience collaborateur avant d'inviter toute l'équipe ?"}, {"id": 20, "categorie": "Onboarding", "langue": "EN", "urgence": "Normale", "entreprise": "Helvetia Insurance", "message": "Hello, we have 45 part-time employees. Do they have the same access and benefits as full-time employees on Swibeco?"}, {"id": 21, "categorie": "Gestion bénéfices", "langue": "FR", "urgence": "Haute", "entreprise": "Nestlé SA", "message": "Bonjour, j'ai lancé une distribution de 500 Cadeau à 200 collaborateurs hier mais aucun n'a reçu ses points. Le solde n'a pas changé. Pouvez-vous vérifier en urgence ?"}, {"id": 22, "categorie": "Gestion bénéfices", "langue": "EN", "urgence": "Normale", "entreprise": "Zurich Financial", "message": "Department: Benefits | Subject: Lunch benefit | Message: Three employees report they cannot see their Lunch allowance benefit on the platform. They have active accounts. Names: Marc Dupont, Lisa Klein, John Park."}, {"id": 23, "categorie": "Gestion bénéfices", "langue": "FR", "urgence": "Normale", "entreprise": "Roche AG", "message": "Bonjour, nous souhaitons offrir un cadeau de Noël à nos 350 collaborateurs sous forme de bon d'achat Swibeco de CHF 150. Comment configurer cette distribution ? Y a-t-il des implications fiscales ?"}, {"id": 24, "categorie": "Gestion bénéfices", "langue": "FR", "urgence": "Haute", "entreprise": "Syngenta AG", "message": "Département: Bénéfices | Sujet: Erreur montant | Message: J'ai distribué CHF 200 au lieu de CHF 50 à tous les collaborateurs par erreur. Comment annuler ou corriger cette distribution ?"}, {"id": 25, "categorie": "Gestion bénéfices", "langue": "EN", "urgence": "Basse", "entreprise": "Barry Callebaut", "message": "Hi, is there a way to see how much budget we have spent on benefits this year versus last year? I need this for my annual HR report."}, {"id": 26, "categorie": "Gestion bénéfices", "langue": "FR", "urgence": "Normale", "entreprise": "BCV Banque", "message": "Bonjour, j'ai activé l'avantage mobilité pour 30 collaborateurs il y a une semaine mais plusieurs me signalent qu'ils ne voient pas l'avantage dans leur application. Pouvez-vous vérifier ?"}, {"id": 27, "categorie": "Gestion bénéfices", "langue": "EN", "urgence": "Normale", "entreprise": "Baloise Group", "message": "Department: Benefits | Subject: Expiry | Message: Do Cadeau expire? Some employees are asking how long they have to use their points. Where can they find this information?"}, {"id": 28, "categorie": "Gestion bénéfices", "langue": "FR", "urgence": "Haute", "entreprise": "Philip Morris", "message": "Bonjour, nous avons configuré des cadeaux automatiques pour les anniversaires mais 3 collaborateurs dont l'anniversaire était cette semaine n'ont rien reçu. Il s'agit de Pierre Favre, Anne Martin et Luc Bonnet."}, {"id": 29, "categorie": "Gestion bénéfices", "langue": "FR", "urgence": "Basse", "entreprise": "Nestlé SA", "message": "Département: Reporting | Sujet: Export | Message: Comment exporter un rapport de tous les avantages utilisés par nos collaborateurs sur les 6 derniers mois ?"}, {"id": 30, "categorie": "Gestion bénéfices", "langue": "EN", "urgence": "Normale", "entreprise": "Tetra Pak", "message": "Hello, we would like to set up a welcome gift for all new employees joining the company. Can this be automated based on the onboarding date?"}, {"id": 31, "categorie": "Gestion bénéfices", "langue": "FR", "urgence": "Haute", "entreprise": "Julius Baer", "message": "Bonjour, plusieurs collaborateurs signalent que leurs Cadeau ont été débités deux fois pour un même achat. C'est un problème urgent qui affecte la confiance. Quand est-ce que ce sera résolu ?"}, {"id": 32, "categorie": "Gestion bénéfices", "langue": "EN", "urgence": "Normale", "entreprise": "Schindler Group", "message": "Department: Config | Subject: Categories | Message: We want to add a new benefit category for 'Wellness' with a monthly budget of CHF 80 per employee. How do I set this up?"}, {"id": 33, "categorie": "Gestion bénéfices", "langue": "FR", "urgence": "Basse", "entreprise": "Coop Suisse", "message": "Bonjour, est-il possible de simuler une distribution de Cadeau avant de la valider définitivement, pour voir l'impact sur notre budget ?"}, {"id": 34, "categorie": "Gestion bénéfices", "langue": "FR", "urgence": "Normale", "entreprise": "Swisscom AG", "message": "Département: Bénéfices | Sujet: Jubilé | Message: Nous souhaitons offrir un bonus de CHF 500 aux collaborateurs fêtant leur 10e anniversaire dans l'entreprise. Comment automatiser cela ?"}, {"id": 35, "categorie": "Gestion bénéfices", "langue": "EN", "urgence": "Haute", "entreprise": "Adecco Group", "message": "Hi, I accidentally assigned the Executive benefit package to the entire company instead of just the leadership team (15 people). This needs to be corrected immediately as it represents a significant cost overrun."}, {"id": 36, "categorie": "Gestion bénéfices", "langue": "FR", "urgence": "Normale", "entreprise": "Sunrise UPC", "message": "Bonjour, l'avantage loisirs que nous avons activé il y a 2 semaines n'apparaît pas dans la liste des avantages de nos collaborateurs. Pouvez-vous vérifier la configuration ?"}, {"id": 37, "categorie": "Gestion bénéfices", "langue": "EN", "urgence": "Basse", "entreprise": "Swiss Life", "message": "Department: Finance | Subject: Tax | Message: Our accounting team needs a tax report for all benefits distributed in 2024. Is there a way to export this from Swibeco?"}, {"id": 38, "categorie": "Gestion bénéfices", "langue": "FR", "urgence": "Normale", "entreprise": "Bobst Group", "message": "Bonjour, nous souhaitons plafonner les avantages mensuels à CHF 300 par collaborateur. Comment configurer ce plafond dans la plateforme ?"}, {"id": 39, "categorie": "Gestion bénéfices", "langue": "EN", "urgence": "Haute", "entreprise": "Panalpina", "message": "Department: Benefits | Subject: Missing points | Message: Employee Stefan Müller made a purchase 5 days ago but his Cadeau were never credited. Transaction reference: TX-2024-00847."}, {"id": 40, "categorie": "Gestion bénéfices", "langue": "FR", "urgence": "Basse", "entreprise": "Meteo Swiss", "message": "Bonjour, comment puis-je consulter l'historique complet de toutes les distributions de bénéfices effectuées depuis le début de notre contrat Swibeco ?"}, {"id": 41, "categorie": "Onboarding", "langue": "EN", "urgence": "Normale", "entreprise": "Glencore", "message": "Hello, an employee has left the company. How do I deactivate their Swibeco account and what happens to their remaining Cadeau?"}, {"id": 42, "categorie": "Onboarding", "langue": "FR", "urgence": "Haute", "entreprise": "Clariant AG", "message": "Département: RH | Sujet: Spam | Message: Notre lancement Swibeco est compromis. Tous les emails d'invitation arrivent dans les spams de nos collaborateurs. Que faire d'urgence ? Nous avons 250 personnes concernées."}, {"id": 43, "categorie": "Onboarding", "langue": "FR", "urgence": "Basse", "entreprise": "Georg Fischer", "message": "Bonjour, nous prévoyons d'onboarder nos collaborateurs en 3 vagues sur 3 mois. Est-ce possible de planifier les invitations à l'avance ?"}, {"id": 44, "categorie": "Onboarding", "langue": "EN", "urgence": "Normale", "entreprise": "Sika AG", "message": "Department: IT | Subject: Password reset | Message: Employee Maria Santos cannot log in and says she never received the password reset email. Can you send it again to m.santos@sika.com?"}, {"id": 45, "categorie": "Onboarding", "langue": "FR", "urgence": "Normale", "entreprise": "Clariant AG", "message": "Bonjour, nous utilisons SAP SuccessFactors. Existe-t-il une intégration avec Swibeco pour synchroniser automatiquement les données collaborateurs ?"}, {"id": 46, "categorie": "Onboarding", "langue": "EN", "urgence": "Basse", "entreprise": "Rieter AG", "message": "Department: HR | Subject: Profile | Message: Employees are asking if they can add a profile picture to their Swibeco account. Is this feature available?"}, {"id": 47, "categorie": "Onboarding", "langue": "FR", "urgence": "Haute", "entreprise": "Ciba AG", "message": "Bonjour, suite à une erreur technique, un collaborateur a été onboardé deux fois avec deux emails différents. Il a maintenant deux comptes actifs avec des soldes différents. Comment fusionner ces comptes ?"}, {"id": 48, "categorie": "Onboarding", "langue": "EN", "urgence": "Normale", "entreprise": "Franke Group", "message": "Department: HR | Subject: Manager access | Message: We have a new HR manager starting next Monday. How do I create her admin account before she arrives?"}, {"id": 49, "categorie": "Onboarding", "langue": "FR", "urgence": "Basse", "entreprise": "Bobst SA", "message": "Bonjour, avez-vous des templates de communication interne (email, affiche) que nous pourrions utiliser pour annoncer le lancement de Swibeco à nos collaborateurs ?"}, {"id": 50, "categorie": "Onboarding", "langue": "EN", "urgence": "Normale", "entreprise": "Temenos", "message": "Department: IT | Subject: 2FA | Message: Our security policy requires two-factor authentication for all platforms. Does Swibeco support 2FA? How do we enable it company-wide?"}, {"id": 51, "categorie": "Gestion bénéfices", "langue": "FR", "urgence": "Normale", "entreprise": "Emmi AG", "message": "Bonjour, nous souhaitons configurer un avantage repas de CHF 25 par jour ouvré. Comment paramétrer cela pour que ce soit automatique chaque mois ?"}, {"id": 52, "categorie": "Gestion bénéfices", "langue": "EN", "urgence": "Haute", "entreprise": "OC Oerlikon", "message": "Department: Finance | Subject: Budget alert | Message: Our benefits budget for Q3 has been exceeded by CHF 15,000. I need an urgent breakdown of which categories overspent and by how much."}, {"id": 53, "categorie": "Gestion bénéfices", "langue": "FR", "urgence": "Basse", "entreprise": "Schindler AG", "message": "Bonjour, un collaborateur me demande quel est le taux de conversion des Cadeau en francs suisses. Pouvez-vous me confirmer ?"}, {"id": 54, "categorie": "Gestion bénéfices", "langue": "EN", "urgence": "Normale", "entreprise": "Sulzer AG", "message": "Department: Benefits | Subject: Recurring | Message: How do I set up a monthly automatic distribution of 100 Cadeau to all active employees on the 1st of each month?"}, {"id": 55, "categorie": "Gestion bénéfices", "langue": "FR", "urgence": "Haute", "entreprise": "Audemars Piguet", "message": "Bonjour, nous avons des collaborateurs en Valais mais certains partenaires Swibeco ne sont pas disponibles dans leur région. Nos collaborateurs se plaignent d'une offre limitée. Quelles solutions ?"}, {"id": 56, "categorie": "Gestion bénéfices", "langue": "FR", "urgence": "Normale", "entreprise": "Romande Energie", "message": "Département: Bénéfices | Sujet: Sport | Message: Pouvons-nous ajouter un avantage pour les abonnements de fitness ? Nos collaborateurs sont très intéressés par ce type de bénéfice."}, {"id": 57, "categorie": "Gestion bénéfices", "langue": "EN", "urgence": "Basse", "entreprise": "Forbo Group", "message": "Hello, an employee is requesting a summary of all benefits they have received this year for their personal records. How can I generate this report?"}, {"id": 58, "categorie": "Gestion bénéfices", "langue": "EN", "urgence": "Normale", "entreprise": "Nestlé International", "message": "Department: HR | Subject: Interns | Message: We have 15 interns joining for 6 months. Should we create a specific benefit package for them with lower limits?"}, {"id": 59, "categorie": "Gestion bénéfices", "langue": "FR", "urgence": "Haute", "entreprise": "Maus Frères SA", "message": "Bonjour, suite à un bug signalé la semaine dernière, 15 de nos collaborateurs ont été débités deux fois de leurs Cadeau. Nous attendons toujours le remboursement promis. Quel est le statut ?"}, {"id": 60, "categorie": "Gestion bénéfices", "langue": "FR", "urgence": "Basse", "entreprise": "Pictet Group", "message": "Département: Bénéfices | Sujet: Désactivation | Message: Nous souhaitons désactiver temporairement l'avantage loisirs pendant le mois de décembre pour des raisons budgétaires. Est-ce possible ?"}, {"id": 61, "categorie": "Onboarding", "langue": "EN", "urgence": "Haute", "entreprise": "Holcim Group", "message": "Hi, following our acquisition of a subsidiary, we need to merge two separate Swibeco company accounts (Holcim SA and Holcim Services SA) into one. How should we proceed? This affects 450 employees."}, {"id": 62, "categorie": "Gestion bénéfices", "langue": "FR", "urgence": "Normale", "entreprise": "Transdev Suisse", "message": "Bonjour, la carte Swibeco d'une collaboratrice a été bloquée suite à 3 tentatives de saisie de code erronées. Comment la débloquer ? Il s'agit de Mme Irène Kaufmann."}, {"id": 63, "categorie": "Onboarding", "langue": "FR", "urgence": "Basse", "entreprise": "Edipresse SA", "message": "Département: Juridique | Sujet: RGPD | Message: Dans le cadre de notre conformité RGPD, pouvez-vous nous fournir votre politique de traitement des données personnelles et le registre des traitements ?"}, {"id": 64, "categorie": "Gestion bénéfices", "langue": "EN", "urgence": "Normale", "entreprise": "Kuoni Group", "message": "Hello, employee Thomas Weber forgot his Swibeco Card PIN. How can he reset it? Is there a self-service option or does it go through HR?"}, {"id": 65, "categorie": "Onboarding", "langue": "EN", "urgence": "Haute", "entreprise": "SGS SA", "message": "Department: IT | Subject: CRITICAL | Message: Following a system update this morning, ALL our employees have been logged out of Swibeco and cannot log back in. Error message: 'Session token invalid'. Affects 600 users."}, {"id": 66, "categorie": "Gestion bénéfices", "langue": "FR", "urgence": "Basse", "entreprise": "IMD Business School", "message": "Bonjour, un collaborateur qui part à la retraite le mois prochain aimerait savoir comment utiliser son solde de Cadeau restant. A-t-il un délai pour les utiliser après son départ ?"}, {"id": 67, "categorie": "Onboarding", "langue": "EN", "urgence": "Normale", "entreprise": "Schindler Elevator", "message": "Hello, an employee recently married and changed her last name. How do I update her name on Swibeco to match her new legal name?"}, {"id": 68, "categorie": "Gestion bénéfices", "langue": "FR", "urgence": "Haute", "entreprise": "Orange Suisse", "message": "Département: Bénéfices | Sujet: Partenaire | Message: Plusieurs de nos collaborateurs signalent qu'un partenaire majeur refuse leur carte Swibeco en magasin. Il s'agit de Coop. Est-ce un problème technique connu ?"}, {"id": 69, "categorie": "Onboarding", "langue": "EN", "urgence": "Basse", "entreprise": "Temenos AG", "message": "Department: IT | Subject: API | Message: Our engineering team would like to integrate Swibeco data into our internal HR dashboard via API. Do you have an API and can we get access credentials?"}, {"id": 70, "categorie": "Gestion bénéfices", "langue": "FR", "urgence": "Normale", "entreprise": "Mövenpick Hotels", "message": "Bonjour, nous souhaitons intégrer un budget formation annuel de CHF 1000 par collaborateur dans Swibeco. Est-ce que ce type d'avantage est disponible sur la plateforme ?"}, {"id": 71, "categorie": "Onboarding", "langue": "FR", "urgence": "Normale", "entreprise": "TCS Touring Club", "message": "Bonjour, nous avons des collaborateurs saisonniers qui travaillent uniquement 6 mois par an. Comment gérer leur accès Swibeco pendant leur période d'inactivité ?"}, {"id": 72, "categorie": "Gestion bénéfices", "langue": "EN", "urgence": "Haute", "entreprise": "Alcon Inc", "message": "Department: Benefits | Subject: Suspended | Message: Our employees are reporting that their accounts have been suspended since yesterday without any notification. This is causing significant dissatisfaction. What happened?"}, {"id": 73, "categorie": "Onboarding", "langue": "EN", "urgence": "Basse", "entreprise": "ABB Asea Brown", "message": "Hi, is it possible to customise the welcome email that new employees receive when invited to Swibeco? We would like to add our company logo and a personal message."}, {"id": 74, "categorie": "Gestion bénéfices", "langue": "FR", "urgence": "Normale", "entreprise": "Wärtsilä Suisse", "message": "Bonjour, recevons-nous automatiquement un rapport mensuel de l'utilisation des bénéfices ou devons-nous le générer manuellement à chaque fois ?"}, {"id": 75, "categorie": "Onboarding", "langue": "FR", "urgence": "Haute", "entreprise": "Stäubli AG", "message": "Département: Admin | Sujet: Accès perdu | Message: Suite au départ de notre DRH, nous n'avons plus accès au compte administrateur Swibeco. Le seul admin était Mme Renaud qui a quitté l'entreprise vendredi. URGENT."}, {"id": 76, "categorie": "Gestion bénéfices", "langue": "EN", "urgence": "Basse", "entreprise": "Sonova Group", "message": "Hello, an employee is asking about a specific partner discount. Is the discounted rate for Digitec Galaxus available on the Swibeco platform? If yes, how much is the discount?"}, {"id": 77, "categorie": "Onboarding", "langue": "EN", "urgence": "Normale", "entreprise": "Lindt & Sprungli", "message": "Department: HR | Subject: Data update | Message: After our annual review, we need to update job titles and departments for approximately 60 employees. Is there a bulk update option available?"}, {"id": 78, "categorie": "Gestion bénéfices", "langue": "FR", "urgence": "Haute", "entreprise": "SBB CFF FFS", "message": "Bonjour, notre budget annuel de bénéfices a été consommé en 9 mois au lieu de 12. Nous avons besoin d'un rapport détaillé pour comprendre les dépassements et ajuster nos paramètres immédiatement."}, {"id": 79, "categorie": "Onboarding", "langue": "EN", "urgence": "Basse", "entreprise": "Bühler Group", "message": "Hi, is there a dashboard where I can see an overview of all employees, their activation status, and account activity at a glance?"}];
const MODEL = "claude-sonnet-4-6";

// ============ API : appel simple + relances (proxy artefact parfois instable) ============
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function callModel(system, user, attempts = 3) {
  let lastErr;
  for (let a = 0; a < attempts; a++) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: MODEL, max_tokens: 1000, system,
          messages: [{ role: "user", content: user }],
        }),
      });
      if (!res.ok) throw new Error("API " + res.status);
      const data = await res.json();
      const text = (data.content || []).map((b) => b.text || "").join("").trim();
      if (!text) throw new Error("réponse vide");
      return text;
    } catch (e) {
      lastErr = e;
      if (a < attempts - 1) await sleep(700 * (a + 1)); // backoff avant relance
    }
  }
  throw lastErr || new Error("échec API");
}

// Extraction JSON robuste (orchestrateur : petit JSON)
function extractJson(text) {
  let t = (text || "").trim().replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
  const s = t.indexOf("{"), e = t.lastIndexOf("}");
  if (s !== -1 && e !== -1) t = t.slice(s, e + 1);
  return JSON.parse(t);
}

// ============ Retriever RAG : TF-IDF + cosinus, en JS (récupération lexicale) ============
const STOP = new Set(("le la les de des du un une et a au aux en dans pour par sur avec ne pas que qui je nous vous il elle ils on ce cette mon notre est sont ai the of to in for on with and is are i we you it this that my our can how do please hi hello bonjour comment").split(" "));
function tokenize(s) {
  return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !STOP.has(w));
}
function buildIndex(docs) {
  const toks = docs.map((d) => tokenize(d.message));
  const df = new Map();
  toks.forEach((ts) => new Set(ts).forEach((t) => df.set(t, (df.get(t) || 0) + 1)));
  const N = docs.length, idf = new Map();
  df.forEach((c, t) => idf.set(t, Math.log((N + 1) / (c + 1)) + 1));
  const vecs = toks.map((ts) => {
    const v = new Map();
    ts.forEach((t) => v.set(t, (v.get(t) || 0) + 1));
    let norm = 0;
    v.forEach((c, t) => { const w = c * (idf.get(t) || 0); v.set(t, w); norm += w * w; });
    return { v, norm: Math.sqrt(norm) || 1 };
  });
  return { idf, vecs };
}
function retrieve(query, docs, index, k = 3) {
  const ts = tokenize(query), qv = new Map();
  ts.forEach((t) => qv.set(t, (qv.get(t) || 0) + 1));
  let qn = 0;
  qv.forEach((c, t) => { const w = c * (index.idf.get(t) || 0); qv.set(t, w); qn += w * w; });
  qn = Math.sqrt(qn) || 1;
  return docs.map((d, i) => {
    const dv = index.vecs[i]; let dot = 0;
    qv.forEach((w, t) => { if (dv.v.has(t)) dot += w * dv.v.get(t); });
    return { doc: d, score: dot / (qn * dv.norm) };
  }).sort((a, b) => b.score - a.score).slice(0, k).filter((s) => s.score > 0.02);
}

// Séparateur pour la sortie de l'agent : le brouillon reste du TEXTE BRUT,
// donc aucun JSON.parse fragile sur un long texte.
const DELIM = "===A_VERIFIER===";

const ORCH_SYS = `Tu es l'agent ORCHESTRATEUR du support Client Success de Swibeco (plateforme suisse d'avantages salariés). On te donne la question d'un client RH. Renvoie UNIQUEMENT un objet JSON, sans aucun texte autour : {"topic":"onboarding"|"benefits","language":"fr"|"en","urgency":"haute"|"normale"|"basse","entities":["infos clés : noms, nombres, entreprise, réf..."],"summary":"une phrase dans la langue du message","confidence":0.0}. onboarding = invitations, activation, imports, accès, lancement ; benefits = Cadeau/points, avantages, budgets, fiscalité, reporting.`;
const AGENT_SYS = {
  onboarding: `Tu es l'AGENT ONBOARDING du support Client Success de Swibeco (invitations, activation, imports, accès, lancement). Tu n'as PAS accès à l'admin ni aux données internes : rédige un BROUILLON que l'humain validera. Mets des [placeholders] là où une vérification interne est nécessaire.`,
  benefits: `Tu es l'AGENT BÉNÉFICES du support Client Success de Swibeco (distribution de Cadeau/points, avantages, budgets, fiscalité, reporting). Tu n'as PAS accès à l'admin ni aux données internes : rédige un BROUILLON que l'humain validera. Mets des [placeholders] là où une vérification interne est nécessaire.`,
};

function agentUser(question, language, cases) {
  const lang = language === "en" ? "English" : "français";
  const ctx = cases.length
    ? "Cas similaires passés (RÉFÉRENCE de ton et de contexte — NE PAS recopier) :\n" +
      cases.map((c, i) => `${i + 1}. ${c.doc.message}`).join("\n")
    : "Aucun cas similaire trouvé.";
  return `Question du client :\n"""${question}"""\n\n${ctx}\n\nÉcris ta réponse EN ${lang} (même langue que le client), en t'inspirant du style des cas sans les recopier.\n\nFORMAT EXACT de ta sortie :\n1) le brouillon complet (salutation → réponse avec [placeholders] là où une donnée interne manque → étapes → politesse)\n2) une ligne contenant exactement ${DELIM}\n3) un point à vérifier par ligne, chacun commençant par "- "`;
}

async function runOrchestrator(q) {
  for (let a = 0; a < 2; a++) {
    const raw = await callModel(ORCH_SYS + (a ? " Rappel : réponds par du JSON STRICT, rien d'autre." : ""), q);
    try { return extractJson(raw); } catch (_) { /* on retente */ }
  }
  throw new Error("l'orchestrateur n'a pas renvoyé un JSON exploitable");
}
async function runAgent(topic, q, lang, cases) {
  const raw = await callModel(AGENT_SYS[topic] || AGENT_SYS.onboarding, agentUser(q, lang, cases));
  const i = raw.indexOf(DELIM);
  const draft = (i === -1 ? raw : raw.slice(0, i)).trim();
  const rest = i === -1 ? "" : raw.slice(i + DELIM.length);
  const a_verifier = rest.split("\n").map((s) => s.replace(/^[-*\s]+/, "").trim()).filter(Boolean);
  return { draft, a_verifier };
}

// ============ UI ============
function Badge({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-600", indigo: "bg-indigo-100 text-indigo-700",
    teal: "bg-teal-100 text-teal-700", amber: "bg-amber-100 text-amber-800",
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}
const uTone = (u) => (u === "haute" ? "amber" : u === "basse" ? "slate" : "indigo");
const tTone = (t) => (t === "benefits" ? "teal" : "indigo");
const tLabel = (t) => (t === "benefits" ? "Bénéfices" : "Onboarding");

function Step({ icon: Icon, label, state }) {
  const cls = state === "done" ? "bg-emerald-50 border-emerald-200 text-emerald-700"
    : state === "active" ? "bg-indigo-50 border-indigo-300 text-indigo-700"
    : "bg-slate-50 border-slate-200 text-slate-400";
  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${cls}`}>
      {state === "active" ? <Loader2 className="h-4 w-4 animate-spin" /> : state === "done" ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
      {label}
    </div>
  );
}

const EXAMPLES = [
  "Bonjour, la moitié de mes collaborateurs n'ont jamais reçu le mail pour créer leur compte. Que faire ?",
  "How do I give admin rights to my new HR colleague who starts Monday?",
  "On voudrait offrir un bon de 100 CHF à toute l'équipe pour Noël — comment le configurer, et est-ce imposable ?",
  "Some employees say their meal allowance is not showing up in the app.",
];

export default function App() {
  const index = useMemo(() => buildIndex(KB), []);
  const [question, setQuestion] = useState("");
  const [cases, setCases] = useState([]);
  const [stage, setStage] = useState("idle"); // idle | retrieving | orchestrating | drafting | review
  const [orch, setOrch] = useState(null);
  const [draft, setDraft] = useState(null);
  const [edited, setEdited] = useState("");
  const [err, setErr] = useState(null);
  const [log, setLog] = useState([]);

  const busy = ["retrieving", "orchestrating", "drafting"].includes(stage);

  async function run() {
    const q = question.trim();
    if (!q || busy) return;
    setErr(null); setOrch(null); setDraft(null); setEdited("");
    setStage("retrieving");
    const hits = retrieve(q, KB, index, 3);
    setCases(hits);
    setStage("orchestrating");
    try {
      const o = await runOrchestrator(q);
      setOrch(o);
      setStage("drafting");
      const topic = o.topic === "benefits" ? "benefits" : "onboarding";
      const d = await runAgent(topic, q, o.language || "fr", hits);
      setDraft(d); setEdited(d.draft || ""); setStage("review");
    } catch (e) {
      setErr("Une étape a échoué (" + e.message + "). Réessaie.");
      setStage("idle");
    }
  }

  function decide(decision) {
    setLog((l) => [{ q: question.trim(), topic: orch?.topic, language: orch?.language, urgency: orch?.urgency, decision }, ...l]);
    setQuestion(""); setCases([]); setOrch(null); setDraft(null); setEdited(""); setStage("idle");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Client Success · RAG + multi-agents</div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Assistant de réponse — demandes clients</h1>
          <p className="text-sm text-slate-500">Pose une question → récupération de cas similaires (base de connaissances) → l'orchestrateur classe → l'agent rédige → un humain valide.</p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-4 py-6 sm:px-6">
        {/* Saisie */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">Question du client</label>
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={3}
            placeholder="Ex. : nos invitations arrivent dans les spams, que faire ?"
            className="w-full resize-y rounded-lg border border-slate-200 p-3 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-300" />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {EXAMPLES.map((ex, i) => (
              <button key={i} onClick={() => setQuestion(ex)} disabled={busy}
                className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-50 disabled:opacity-50">
                {ex.length > 42 ? ex.slice(0, 42) + "…" : ex}
              </button>
            ))}
          </div>
          <button onClick={run} disabled={busy || !question.trim()}
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Traiter la demande
          </button>
        </div>

        {/* Stepper */}
        {stage !== "idle" && (
          <div className="flex items-center gap-2 flex-wrap">
            <Step icon={Search} label="Récupération" state={stage === "retrieving" ? "active" : "done"} />
            <ArrowRight className="h-4 w-4 text-slate-300" />
            <Step icon={Cpu} label="Orchestrateur" state={stage === "retrieving" ? "todo" : stage === "orchestrating" ? "active" : "done"} />
            <ArrowRight className="h-4 w-4 text-slate-300" />
            <Step icon={Bot} label={orch ? "Agent " + tLabel(orch.topic) : "Agent"} state={["retrieving", "orchestrating"].includes(stage) ? "todo" : stage === "drafting" ? "active" : "done"} />
            <ArrowRight className="h-4 w-4 text-slate-300" />
            <Step icon={UserCheck} label="Revue" state={stage === "review" ? "active" : "todo"} />
          </div>
        )}

        {err && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {err}
          </div>
        )}

        {/* Cas récupérés (RAG) */}
        {cases.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Database className="h-3.5 w-3.5" /> Base de connaissances — cas similaires récupérés
            </div>
            <p className="mb-2 text-xs text-slate-400">Référence pour l'agent (ton, contexte) — pas de recopie. Score = similarité.</p>
            <div className="space-y-2">
              {cases.map((c, i) => (
                <div key={i} className="rounded-lg border border-slate-100 bg-slate-50 p-2 text-sm text-slate-600">
                  <div className="mb-0.5 flex items-center gap-2 text-xs text-slate-400">
                    <Badge tone={tTone(c.doc.categorie === "Onboarding" ? "onboarding" : "benefits")}>{c.doc.categorie}</Badge>
                    <span>{c.doc.entreprise}</span>
                    <span className="ml-auto">sim. {c.score.toFixed(2)}</span>
                  </div>
                  <p className="truncate">{c.doc.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orchestrateur */}
        {orch && (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Cpu className="h-3.5 w-3.5" /> Décision de l'orchestrateur
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={tTone(orch.topic)}><Split className="h-3 w-3" /> {tLabel(orch.topic)}</Badge>
              <Badge tone="slate">langue : {orch.language}</Badge>
              <Badge tone={uTone(orch.urgency)}>urgence : {orch.urgency}</Badge>
              {typeof orch.confidence === "number" && <Badge tone="slate">confiance : {Math.round(orch.confidence * 100)}%</Badge>}
            </div>
            {orch.summary && <p className="mt-2 text-sm italic text-slate-600">« {orch.summary} »</p>}
            {Array.isArray(orch.entities) && orch.entities.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {orch.entities.map((e, i) => <span key={i} className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">{String(e)}</span>)}
              </div>
            )}
          </div>
        )}

        {/* Revue humaine */}
        {stage === "review" && draft && (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <UserCheck className="h-3.5 w-3.5" /> Brouillon — à valider avant envoi
            </div>
            <textarea value={edited} onChange={(e) => setEdited(e.target.value)} rows={10}
              className="w-full resize-y rounded-lg border border-slate-200 p-3 text-sm leading-relaxed text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-300" />
            {Array.isArray(draft.a_verifier) && draft.a_verifier.length > 0 && (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-amber-800"><AlertTriangle className="h-3.5 w-3.5" /> À vérifier par l'humain</div>
                <ul className="list-disc space-y-0.5 pl-5 text-sm text-amber-800">
                  {draft.a_verifier.map((x, i) => <li key={i}>{String(x)}</li>)}
                </ul>
              </div>
            )}
            <div className="mt-3 flex gap-2">
              <button onClick={() => decide("envoyée")} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"><Send className="h-4 w-4" /> Approuver &amp; envoyer</button>
              <button onClick={() => decide("escalade")} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"><AlertTriangle className="h-4 w-4" /> Escalader</button>
            </div>
          </div>
        )}

        {/* Registre */}
        {log.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Registre — {log.length} traitée(s)</div>
            <div className="space-y-1">
              {log.slice(0, 5).map((l, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                  {l.decision === "escalade" ? <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                  <span className="truncate">{l.q}</span>
                  <span className="ml-auto"><Badge tone={tTone(l.topic)}>{tLabel(l.topic)}</Badge></span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
