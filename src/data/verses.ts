/**
 * verses.ts — Verse library for daily memorization
 *
 * SWAP INSTRUCTIONS: replace VERSES with your curated list.
 * The site picks one verse per day using the day-of-year, so the rotation
 * is deterministic and the same for every visitor on a given day.
 *
 * If you have fewer verses than 365, the rotation simply wraps.
 */

export interface Verse {
  chapter: number;
  verse: number;
  sanskrit: string;       // Devanagari or transliterated Sanskrit
  transliteration?: string;
  translation: string;
  purport?: string;       // optional short purport / context line
}

export const VERSES: Verse[] = [
  {
    chapter: 2,
    verse: 47,
    sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।",
    transliteration: "karmaṇy-evādhikāras te mā phaleṣu kadācana",
    translation:
      "You have a right to perform your prescribed duty, but you are not entitled to the fruits of action.",
    purport: "Act with devotion; release attachment to outcomes.",
  },
  {
    chapter: 4,
    verse: 7,
    sanskrit: "यदा यदा हि धर्मस्य ग्लानिर्भवति भारत।",
    transliteration: "yadā yadā hi dharmasya glānir bhavati bhārata",
    translation:
      "Whenever there is a decline of dharma and a rise of adharma, at that time I manifest Myself.",
  },
  {
    chapter: 18,
    verse: 66,
    sanskrit: "सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज।",
    transliteration: "sarva-dharmān parityajya mām ekaṁ śaraṇaṁ vraja",
    translation:
      "Abandon all varieties of dharma and simply surrender unto Me. I shall deliver you from all sin. Do not fear.",
  },
  {
    chapter: 9,
    verse: 22,
    sanskrit: "अनन्याश्चिन्तयन्तो मां ये जनाः पर्युपासते।",
    transliteration: "ananyāś cintayanto māṁ ye janāḥ paryupāsate",
    translation:
      "To those who are constantly devoted and worship Me with love, I give the understanding by which they can come to Me.",
  },
  {
    chapter: 6,
    verse: 5,
    sanskrit: "उद्धरेदात्मनात्मानं नात्मानमवसादयेत्।",
    transliteration: "uddhared ātmanātmānaṁ nātmānam avasādayet",
    translation:
      "One must deliver oneself with the help of one's mind, and not degrade oneself. The mind is the friend of the conditioned soul, and also its enemy.",
  },
  {
    chapter: 2,
    verse: 14,
    sanskrit: "मात्रास्पर्शास्तु कौन्तेय शीतोष्णसुखदुःखदाः।",
    transliteration: "mātrā-sparśās tu kaunteya śītoṣṇa-sukha-duḥkha-dāḥ",
    translation:
      "The happiness and distress arising from the senses come and go like winter and summer. One must learn to tolerate them without being disturbed.",
  },
  {
    chapter: 7,
    verse: 19,
    sanskrit: "बहूनां जन्मनामन्ते ज्ञानवान्मां प्रपद्यते।",
    transliteration: "bahūnāṁ janmanām ante jñānavān māṁ prapadyate",
    translation:
      "After many births and deaths, one who is actually in knowledge surrenders unto Me, knowing Me to be the cause of all causes. Such a great soul is very rare.",
  },
  {
    chapter: 15,
    verse: 7,
    sanskrit: "ममैवांशो जीवलोके जीवभूतः सनातनः।",
    transliteration: "mamaivāṁśo jīva-loke jīva-bhūtaḥ sanātanaḥ",
    translation:
      "The living entities in this conditioned world are My eternal fragmental parts.",
  },
  {
    chapter: 10,
    verse: 10,
    sanskrit: "तेषां सततयुक्तानां भजतां प्रीतिपूर्वकम्।",
    transliteration: "teṣāṁ satata-yuktānāṁ bhajatāṁ prīti-pūrvakam",
    translation:
      "To those who are constantly devoted to serving Me with love, I give the intelligence by which they can come to Me.",
  },
  {
    chapter: 9,
    verse: 26,
    sanskrit: "पत्रं पुष्पं फलं तोयं यो मे भक्त्या प्रयच्छति।",
    transliteration: "patraṁ puṣpaṁ phalaṁ toyaṁ yo me bhaktyā prayacchati",
    translation:
      "If one offers Me with love and devotion a leaf, a flower, a fruit or water, I will accept it.",
  },
];

/**
 * Get today's verse based on the day of year.
 * Deterministic — same for every visitor on the same day.
 */
export function getVerseOfTheDay(date: Date = new Date()): Verse {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return VERSES[dayOfYear % VERSES.length];
}
