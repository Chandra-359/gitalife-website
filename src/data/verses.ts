/**
 * verses.ts — Verse library for daily memorization
 *
 * Translations are the full canonical English renderings by
 * His Divine Grace A.C. Bhaktivedanta Swami Prabhupada from
 * "Bhagavad-gītā As It Is" (as published on vedabase.io).
 *
 * The site picks one verse per day using the day-of-year, so the
 * rotation is deterministic and the same for every visitor on a
 * given day. If you have fewer verses than 365, the rotation wraps.
 */

export interface Verse {
  chapter: number;
  verse: number;
  /** Full IAST transliteration of the Sanskrit verse, as on vedabase.io. */
  transliteration: string;
  translation: string;
  purport?: string;
}

export const VERSES: Verse[] = [
  {
    chapter: 2,
    verse: 47,
    transliteration:
      "karmaṇy evādhikāras te\nmā phaleṣu kadācana\nmā karma-phala-hetur bhūr\nmā te saṅgo 'stv akarmaṇi",
    translation:
      "You have a right to perform your prescribed duty, but you are not entitled to the fruits of action. Never consider yourself the cause of the results of your activities, and never be attached to not doing your duty.",
    purport:
      "Act with devotion; release attachment to outcomes. Duty performed without selfish motive becomes an offering, and the doer is freed from karmic reaction.",
  },
  {
    chapter: 4,
    verse: 7,
    transliteration:
      "yadā yadā hi dharmasya\nglānir bhavati bhārata\nabhyutthānam adharmasya\ntadātmānaṁ sṛjāmy aham",
    translation:
      "Whenever and wherever there is a decline in religious practice, O descendant of Bharata, and a predominant rise of irreligion—at that time I descend Myself.",
    purport:
      "The Lord appears in every age to re-establish dharma. His descent is not the birth of an ordinary being but the merciful arrival of the eternal.",
  },
  {
    chapter: 18,
    verse: 66,
    transliteration:
      "sarva-dharmān parityajya\nmām ekaṁ śaraṇaṁ vraja\nahaṁ tvāṁ sarva-pāpebhyo\nmokṣayiṣyāmi mā śucaḥ",
    translation:
      "Abandon all varieties of religion and just surrender unto Me. I shall deliver you from all sinful reactions. Do not fear.",
    purport:
      "Considered the essence of the entire Gita. Pure surrender to Krishna is the supreme dharma, transcending all lesser duties and fears.",
  },
  {
    chapter: 9,
    verse: 22,
    transliteration:
      "ananyāś cintayanto māṁ\nye janāḥ paryupāsate\nteṣāṁ nityābhiyuktānāṁ\nyoga-kṣemaṁ vahāmy aham",
    translation:
      "But those who always worship Me with exclusive devotion, meditating on My transcendental form—to them I carry what they lack, and I preserve what they have.",
    purport:
      "For the devotee who depends fully on Krishna, the Lord personally supplies necessities and protects what is already given. This is the promise of bhakti.",
  },
  {
    chapter: 6,
    verse: 5,
    transliteration:
      "uddhared ātmanātmānaṁ\nnātmānam avasādayet\nātmaiva hy ātmano bandhur\nātmaiva ripur ātmanaḥ",
    translation:
      "One must deliver himself with the help of his mind, and not degrade himself. The mind is the friend of the conditioned soul, and his enemy as well.",
    purport:
      "The same mind that binds us can also liberate us. Trained in remembrance of Krishna, it becomes our greatest friend on the spiritual path.",
  },
  {
    chapter: 2,
    verse: 14,
    transliteration:
      "mātrā-sparśās tu kaunteya\nśītoṣṇa-sukha-duḥkha-dāḥ\nāgamāpāyino 'nityās\ntāṁs titikṣasva bhārata",
    translation:
      "O son of Kuntī, the nonpermanent appearance of happiness and distress, and their disappearance in due course, are like the appearance and disappearance of winter and summer seasons. They arise from sense perception, O scion of Bharata, and one must learn to tolerate them without being disturbed.",
    purport:
      "Pleasure and pain come and go like the seasons. The wise endure both without losing equipoise, fixed in their spiritual duty.",
  },
  {
    chapter: 7,
    verse: 19,
    transliteration:
      "bahūnāṁ janmanām ante\njñānavān māṁ prapadyate\nvāsudevaḥ sarvam iti\nsa mahātmā su-durlabhaḥ",
    translation:
      "After many births and deaths, he who is actually in knowledge surrenders unto Me, knowing Me to be the cause of all causes and all that is. Such a great soul is very rare.",
    purport:
      "Genuine surrender is the fruit of mature wisdom across many lifetimes. Such a soul has seen through all illusion and rests in Krishna alone.",
  },
  {
    chapter: 15,
    verse: 7,
    transliteration:
      "mamaivāṁśo jīva-loke\njīva-bhūtaḥ sanātanaḥ\nmanaḥ-ṣaṣṭhānīndriyāṇi\nprakṛti-sthāni karṣati",
    translation:
      "The living entities in this conditioned world are My eternal fragmental parts. Due to conditioned life, they are struggling very hard with the six senses, which include the mind.",
    purport:
      "Every soul is eternally part of Krishna—qualitatively one with Him, quantitatively minute. Our struggle ends when we remember this origin.",
  },
  {
    chapter: 10,
    verse: 10,
    transliteration:
      "teṣāṁ satata-yuktānāṁ\nbhajatāṁ prīti-pūrvakam\ndadāmi buddhi-yogaṁ taṁ\nyena mām upayānti te",
    translation:
      "To those who are constantly devoted to serving Me with love, I give the understanding by which they can come to Me.",
    purport:
      "Loving service itself opens the door to divine wisdom. The Lord personally illuminates the heart of the sincere devotee.",
  },
  {
    chapter: 9,
    verse: 26,
    transliteration:
      "patraṁ puṣpaṁ phalaṁ toyaṁ\nyo me bhaktyā prayacchati\ntad ahaṁ bhakty-upahṛtam\naśnāmi prayatātmanaḥ",
    translation:
      "If one offers Me with love and devotion a leaf, a flower, a fruit or water, I will accept it.",
    purport:
      "Krishna does not require wealth or grandeur—only love. The smallest offering, made with sincere devotion, is received by the Supreme Person Himself.",
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
