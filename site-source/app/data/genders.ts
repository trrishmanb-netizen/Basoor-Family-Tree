export type GenderHaze = "male" | "female" | "neutral";

// A visual draft based on names, as requested by the family. Ambiguous names stay neutral.
// Administrators can correct any card from the member profile editor.
const femaleNames = new Set([
  "aanya", "ajooni", "anaisha", "babli", "baby", "binny", "dolly",
  "gaytri", "gudia", "hanna", "jia", "kaira", "kanika", "kiaana",
  "kirti", "mahima", "mannat", "meena", "meera", "minna", "miraya",
  "mohini", "naira", "namrata", "neena", "neetu", "pinky", "pritam",
  "puneet", "rani", "rasna", "rashleen", "reena", "renu", "ridhima",
  "ritika", "ritu", "ruby", "ruchika", "saiba", "samaira", "sapna",
  "seher", "shanaya", "sharon", "shayana", "shitija", "simran",
  "sona", "sonia", "soni", "sudarshan", "sunaina", "sweety", "tanya",
  "vanshika", "varya", "veenita", "wafa", "juliette", "khushneet",
]);

const maleNames = new Set([
  "abhijeet", "aman", "amir", "avtar", "babloo", "bittu", "bubbie",
  "bunny", "bunty", "davinder", "gagan", "gaurav", "harinder",
  "harjeet", "happy", "jasdeep", "jaswant", "jeffraaj", "jitin",
  "jivraj", "joginder", "karan", "kabir", "laik", "nirvair",
  "parv", "prabhjeet", "rahul", "ranjeet", "rattan",
  "ravinder", "ruveer", "sanad", "sanraj", "satinder", "sham",
  "shaurya", "suba", "sunny", "suryansh", "swai", "tony",
  "trilochan", "trrishman", "vaibhav", "vedant", "viraj", "vishal",
  "yathin", "jwala", "rashid", "sahib", "gagandeep", "saman",
  "sanju", "resham", "chinky", "nirver", "rayaan", "sarab",
]);

export function draftGender(name: string): GenderHaze {
  if (/\bkaur\b/i.test(name)) return "female";
  if (/\bsingh\b/i.test(name)) return "male";
  const first = name.replace(/^(?:Ch\.|Sr\.)\s*/i, "").trim().toLowerCase().split(/\s+/)[0];
  if (femaleNames.has(first)) return "female";
  if (maleNames.has(first)) return "male";
  return "neutral";
}
