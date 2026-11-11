export interface ResourceItem {
  name: string;
  url: string;
}

export interface ResourceCategory {
  category: string;
  items: ResourceItem[];
}

export const RESOURCES: ResourceCategory[] = [
  {
    category: 'Universities',
    items: [
      { name: 'University of the Philippines', url: 'https://up.edu.ph' },
      { name: 'Ateneo de Manila University', url: 'https://www.ateneo.edu' },
      { name: 'De La Salle University', url: 'https://www.dlsu.edu.ph' },
      { name: 'University of Santo Tomas', url: 'https://www.ust.edu.ph' },
      { name: 'Mapua University', url: 'https://www.mapua.edu.ph' },
    ],
  },
  {
    category: 'TESDA',
    items: [
      { name: 'TESDA Official Website', url: 'https://www.tesda.gov.ph' },
      { name: 'TESDA Online Program (TOP)', url: 'https://top.tesda.gov.ph' },
    ],
  },
  {
    category: 'DepEd',
    items: [
      { name: 'DepEd SHS Strands Guide', url: 'https://www.deped.gov.ph/senior-high-school' },
      { name: 'DepEd Career Guidance', url: 'https://www.deped.gov.ph' },
    ],
  },
  {
    category: 'Scholarships',
    items: [
      { name: 'CHED Scholarship Programs', url: 'https://www.ched.gov.ph/scholarships' },
      { name: 'DOST-SEI Scholarship', url: 'https://www.sei.dost.gov.ph' },
      { name: 'Tulong Dunong Program', url: 'https://www.ched.gov.ph' },
    ],
  },
  {
    category: 'Career Exploration',
    items: [
      { name: 'JobStreet Philippines', url: 'https://www.jobstreet.com.ph' },
      { name: 'LinkedIn Philippines', url: 'https://www.linkedin.com' },
      { name: 'PESO Philippines', url: 'https://www.peso.gov.ph' },
    ],
  },
];
