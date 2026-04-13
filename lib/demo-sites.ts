import type { Site } from "@/lib/supabase/types";

export const DEMO_SITES: (Site & { is_demo: true })[] = [
  {
    id: "demo-1",
    name: "Lincoln Memorial",
    description:
      "Completed in 1922, this neoclassical monument honors Abraham Lincoln, the 16th President. The 19-foot seated statue inside is one of the most recognizable images in America.",
    photo_url: null,
    lat: 38.8893,
    lng: -77.0502,
    points_value: 10,
    created_by: null,
    created_at: "2024-01-01T00:00:00Z",
    ai_history: null,
    is_demo: true,
  },
  {
    id: "demo-2",
    name: "Washington Monument",
    description:
      "Standing 555 feet tall, this obelisk was the world's tallest structure when completed in 1884. Construction was halted during the Civil War, leaving a visible color change in the stone partway up.",
    photo_url: null,
    lat: 38.8895,
    lng: -77.0353,
    points_value: 10,
    created_by: null,
    created_at: "2024-01-01T00:00:00Z",
    ai_history: null,
    is_demo: true,
  },
  {
    id: "demo-3",
    name: "United States Capitol",
    description:
      "Home to the U.S. Congress since 1800, the Capitol's cast-iron dome was completed during the Civil War as a symbol of national unity. The current dome replaced the original copper-clad wooden one.",
    photo_url: null,
    lat: 38.8899,
    lng: -77.0091,
    points_value: 10,
    created_by: null,
    created_at: "2024-01-01T00:00:00Z",
    ai_history: null,
    is_demo: true,
  },
  {
    id: "demo-4",
    name: "Library of Congress",
    description:
      "The Thomas Jefferson Building, opened in 1897, is the oldest of the three Library of Congress buildings. Its Italian Renaissance design houses one of the world's largest collections of books and manuscripts.",
    photo_url: null,
    lat: 38.8887,
    lng: -77.0047,
    points_value: 10,
    created_by: null,
    created_at: "2024-01-01T00:00:00Z",
    ai_history: null,
    is_demo: true,
  },
  {
    id: "demo-5",
    name: "Ford's Theatre",
    description:
      "On April 14, 1865, President Abraham Lincoln was shot here by John Wilkes Booth. Now a National Historic Site, the theatre still hosts live performances and maintains a museum in the basement.",
    photo_url: null,
    lat: 38.8966,
    lng: -77.0257,
    points_value: 10,
    created_by: null,
    created_at: "2024-01-01T00:00:00Z",
    ai_history: null,
    is_demo: true,
  },
  {
    id: "demo-6",
    name: "The White House",
    description:
      "Every U.S. President since John Adams (1800) has lived here. Burned by British forces in 1814 during the War of 1812, it was rebuilt and has been continuously expanded and renovated since.",
    photo_url: null,
    lat: 38.8977,
    lng: -77.0365,
    points_value: 10,
    created_by: null,
    created_at: "2024-01-01T00:00:00Z",
    ai_history: null,
    is_demo: true,
  },
  {
    id: "demo-7",
    name: "National Archives",
    description:
      "Completed in 1935, the National Archives Building holds the original Declaration of Independence, the Constitution, and the Bill of Rights. Its neoclassical exterior is adorned with the motto 'What Is Past Is Prologue.'",
    photo_url: null,
    lat: 38.8934,
    lng: -77.0228,
    points_value: 10,
    created_by: null,
    created_at: "2024-01-01T00:00:00Z",
    ai_history: null,
    is_demo: true,
  },
  {
    id: "demo-8",
    name: "Supreme Court of the United States",
    description:
      "The Supreme Court building opened in 1935, long after the Court was established in 1790. Before that, justices heard cases in Capitol Hill rooms and even taverns. The marble building's grand columns bear the inscription 'Equal Justice Under Law.'",
    photo_url: null,
    lat: 38.8906,
    lng: -77.0044,
    points_value: 10,
    created_by: null,
    created_at: "2024-01-01T00:00:00Z",
    ai_history: null,
    is_demo: true,
  },
  {
    id: "demo-9",
    name: "National Museum of American History",
    description:
      "Part of the Smithsonian Institution, this museum opened in 1964 and holds more than 1.8 million artifacts. Among its most famous objects are the original Star-Spangled Banner that inspired the national anthem.",
    photo_url: null,
    lat: 38.8912,
    lng: -77.03,
    points_value: 10,
    created_by: null,
    created_at: "2024-01-01T00:00:00Z",
    ai_history: null,
    is_demo: true,
  },
  {
    id: "demo-10",
    name: "Frederick Douglass National Historic Site",
    description:
      "Cedar Hill was the final home of abolitionist and statesman Frederick Douglass from 1877 until his death in 1895. The 21-room house overlooking Anacostia is preserved largely as it was during his lifetime.",
    photo_url: null,
    lat: 38.8644,
    lng: -76.9844,
    points_value: 10,
    created_by: null,
    created_at: "2024-01-01T00:00:00Z",
    ai_history: null,
    is_demo: true,
  },
];

export const DC_CENTER: [number, number] = [38.9072, -77.0369];
export const DC_ZOOM = 13;

export function isDemoSite(site: Site): boolean {
  return site.id.startsWith("demo-");
}
