/**
 * Hostel proximity and grouping logic for Thapar Institute
 */

// Hostel groups based on proximity and type
const HOSTEL_GROUPS = {
  // Boys hostels - North Campus
  BOYS_NORTH: [
    "Agira Hall (Hostel-A)",
    "Amritam Hall (Hostel-B)",
    "Prithvi Hall (Hostel-C)",
    "Neeram Hall (Hostel-D)",
  ],
  // Boys hostels - Central/East Campus
  BOYS_CENTRAL: [
    "Vyan Hall (Hostel-H)",
    "Tejas Hall (Hostel-J)",
    "Ambaram Hall (Hostel-K)",
    "Viyat Hall (Hostel-L)",
    "Anantam Hall (Hostel-M)",
    "Vyom Hall (Hostel-O)",
  ],
  // Girls hostels
  GIRLS: [
    "Vasudha Hall - Block E (Hostel-E)",
    "Vasudha Hall - Block G (Hostel-G)",
    "Ira Hall (Hostel-I)",
    "Ananta Hall (Hostel-N)",
    "Dhriti Hall (Hostel-PG)",
    "Vahni Hall (Hostel-Q)",
  ],
  // Special categories
  OTHER: ["Hostel-FRF/G", "Day Scholar", "Off Campus"],
};

/**
 * Get the group a hostel belongs to
 */
const getHostelGroup = (hostel) => {
  if (!hostel) return null;

  for (const [group, hostels] of Object.entries(HOSTEL_GROUPS)) {
    if (hostels.includes(hostel)) {
      return group;
    }
  }
  return null;
};

/**
 * Calculate proximity score between two hostels
 * Higher score = more similar/closer
 */
const calculateProximityScore = (hostel1, hostel2) => {
  if (!hostel1 || !hostel2) return 0;

  // Same hostel - highest priority
  if (hostel1 === hostel2) return 100;

  const group1 = getHostelGroup(hostel1);
  const group2 = getHostelGroup(hostel2);

  if (!group1 || !group2) return 0;

  // Same group - high priority
  if (group1 === group2) {
    // Within same boys group
    if (group1 === "BOYS_NORTH" || group1 === "BOYS_CENTRAL") return 80;
    // Within girls hostels
    if (group1 === "GIRLS") return 80;
    // Within other category
    return 60;
  }

  // Different groups but both on campus
  if (group1 !== "OTHER" && group2 !== "OTHER") {
    // Boys to boys (different zones)
    if (
      (group1 === "BOYS_NORTH" || group1 === "BOYS_CENTRAL") &&
      (group2 === "BOYS_NORTH" || group2 === "BOYS_CENTRAL")
    ) {
      return 50;
    }
    // Boys to girls or vice versa (still on campus)
    return 30;
  }

  // One is off-campus/day scholar
  if (group1 === "OTHER" || group2 === "OTHER") {
    // Both off-campus
    if (group1 === "OTHER" && group2 === "OTHER") return 40;
    // One off-campus, one on-campus
    return 20;
  }

  return 10;
};

/**
 * Get hostels in order of proximity to user's hostel
 */
const getHostelsByProximity = (userHostel) => {
  const allHostels = Object.values(HOSTEL_GROUPS).flat();

  return allHostels
    .map((hostel) => ({
      hostel,
      score: calculateProximityScore(userHostel, hostel),
    }))
    .sort((a, b) => b.score - a.score)
    .map((item) => item.hostel);
};

/**
 * Check if hostel is same as user's hostel
 */
const isSameHostel = (hostel1, hostel2) => {
  return hostel1 === hostel2;
};

/**
 * Check if hostel is in nearby group
 */
const isNearbyHostel = (userHostel, targetHostel) => {
  const score = calculateProximityScore(userHostel, targetHostel);
  return score >= 50; // Same or nearby group
};

/**
 * Get hostel display name (shortened version)
 */
const getHostelShortName = (hostel) => {
  if (!hostel) return "Unknown";

  // Extract the letter/code from hostel name
  const match = hostel.match(/Hostel-([A-Z]+)/);
  if (match) return `Hostel ${match[1]}`;

  // Special cases
  if (hostel.includes("Agira")) return "Hostel A";
  if (hostel.includes("Amritam")) return "Hostel B";
  if (hostel.includes("Prithvi")) return "Hostel C";
  if (hostel.includes("Neeram")) return "Hostel D";
  if (hostel.includes("Vasudha"))
    return hostel.includes("Block E") ? "Hostel E" : "Hostel G";
  if (hostel.includes("Vyan")) return "Hostel H";
  if (hostel.includes("Ira")) return "Hostel I";
  if (hostel.includes("Tejas")) return "Hostel J";
  if (hostel.includes("Ambaram")) return "Hostel K";
  if (hostel.includes("Viyat")) return "Hostel L";
  if (hostel.includes("Anantam")) return "Hostel M";
  if (hostel.includes("Ananta")) return "Hostel N";
  if (hostel.includes("Vyom")) return "Hostel O";
  if (hostel.includes("Dhriti")) return "Hostel PG";
  if (hostel.includes("Vahni")) return "Hostel Q";
  if (hostel === "Day Scholar") return "Day Scholar";
  if (hostel === "Off Campus") return "Off Campus";

  return hostel;
};

module.exports = {
  HOSTEL_GROUPS,
  getHostelGroup,
  calculateProximityScore,
  getHostelsByProximity,
  isSameHostel,
  isNearbyHostel,
  getHostelShortName,
};
