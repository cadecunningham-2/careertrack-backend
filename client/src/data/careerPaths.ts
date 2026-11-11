import { StrandKey } from '../types';

export interface CareerPath {
  strand: StrandKey;
  fullName: string;
  color: string;
  icon: string;
  description: string;
  degrees: string[];
  careers: string[];
  localDemand: string;
}

export const CAREER_PATHS: Record<StrandKey, CareerPath> = {
  STEM: {
    strand: 'STEM',
    fullName: 'Science, Technology, Engineering & Mathematics',
    color: '#2E5BFF',
    icon: '🔬',
    description:
      'Science, Technology, Engineering, and Mathematics. Best for students who love numbers, experiments, and solving complex problems.',
    degrees: [
      'BS Computer Science',
      'BS Information Technology',
      'BS Electronics Engineering',
      'BS Civil Engineering',
      'BS Mechanical Engineering',
      'BS Chemical Engineering',
      'BS Mathematics',
      'BS Biology',
      'BS Physics',
      'BS Architecture',
    ],
    careers: [
      'Software Developer',
      'Data Scientist',
      'Mechanical Engineer',
      'Civil Engineer',
      'Electronics Engineer',
      'Research Scientist',
      'Architect',
      'Medical Doctor',
      'Nurse',
      'Pharmacist',
    ],
    localDemand:
      'STEM graduates are the most in-demand in the Philippines. The IT-BPM industry alone employs over 1.4 million Filipinos and continues to grow. Engineering and healthcare sectors consistently report talent shortages.',
  },
  ABM: {
    strand: 'ABM',
    fullName: 'Accountancy, Business & Management',
    color: '#059669',
    icon: '📊',
    description:
      'Accountancy, Business, and Management. Best for students who are interested in business, entrepreneurship, finance, and leadership.',
    degrees: [
      'BS Accountancy',
      'BS Business Administration',
      'BS Management',
      'BS Economics',
      'BS Marketing',
      'BS Financial Management',
      'BS Entrepreneurship',
      'BS Human Resource Management',
    ],
    careers: [
      'Accountant',
      'Business Analyst',
      'Entrepreneur',
      'Marketing Manager',
      'Financial Advisor',
      'HR Manager',
      'Operations Manager',
      'Bank Officer',
      'Auditor',
      'Stock Trader',
    ],
    localDemand:
      'Business and finance professionals are consistently needed across all industries in the Philippines. CPAs are among the highest-paid professionals. The BPO sector also creates strong demand for business graduates.',
  },
  HUMSS: {
    strand: 'HUMSS',
    fullName: 'Humanities & Social Sciences',
    color: '#7C3AED',
    icon: '📚',
    description:
      'Humanities and Social Sciences. Best for students who are passionate about people, culture, communication, law, and social change.',
    degrees: [
      'AB Communication',
      'AB Political Science',
      'AB Psychology',
      'AB Sociology',
      'AB Philosophy',
      'BS Social Work',
      'AB Journalism',
      'AB Literature',
      'BS Education',
      'AB History',
    ],
    careers: [
      'Lawyer',
      'Journalist',
      'Psychologist',
      'Social Worker',
      'Teacher',
      'Diplomat',
      'Writer',
      'HR Specialist',
      'Guidance Counselor',
      'Public Relations Officer',
    ],
    localDemand:
      'Education and psychology graduates are in high demand with the growing emphasis on mental health in the Philippines. Law and political science graduates are needed in government and NGOs. Communication graduates thrive in media and the BPO industry.',
  },
  GAS: {
    strand: 'GAS',
    fullName: 'General Academic Strand',
    color: '#D97706',
    icon: '🎓',
    description:
      'General Academic Strand. A flexible track that keeps all college options open. Best for students who are still exploring or have diverse interests across multiple fields.',
    degrees: ['Any college course — GAS graduates can apply to all degree programs'],
    careers: ['Depends on the college degree taken after SHS — GAS opens all career paths'],
    localDemand:
      'GAS is ideal for students who want flexibility. It provides a broad academic foundation that universities across the Philippines accept for any course application.',
  },
  TVL: {
    strand: 'TVL',
    fullName: 'Technical-Vocational-Livelihood',
    color: '#DC2626',
    icon: '🔧',
    description:
      'Technical-Vocational-Livelihood. Best for students who prefer hands-on, practical, and technical work. Leads directly to TESDA certifications and employment.',
    degrees: [
      'BS Industrial Technology',
      'BS Food Technology',
      'TESDA NC II/III certifications',
      'BS Hospitality Management',
      'BS Tourism',
      'BS Agricultural Technology',
    ],
    careers: [
      'Electrician',
      'Plumber',
      'Automotive Technician',
      'Chef',
      'Cosmetologist',
      'Welder',
      'HVAC Technician',
      'Farmer',
      'Hotel Staff',
      'Tour Guide',
    ],
    localDemand:
      'TESDA-certified TVL graduates are in extremely high demand both locally and overseas. Skilled workers in construction, hospitality, and electronics are among the top OFW categories. The government actively promotes TVL as a priority track.',
  },
  ARTS: {
    strand: 'ARTS',
    fullName: 'Arts and Design',
    color: '#DB2777',
    icon: '🎨',
    description:
      'Arts and Design. For students drawn to visual art, design, music, media and performance. Programs often value a portfolio or an audition, so practice outside class too.',
    degrees: [
      'BFA / Fine Arts',
      'BS Multimedia Arts',
      'BA Communication / Media Arts',
      'Music and Performing Arts programs',
    ],
    careers: [
      'Graphic Designer',
      'Animator',
      'Multimedia Artist',
      'Musician',
      'Performer',
      'Film / Video Editor',
    ],
    localDemand:
      'Creative and digital media work is growing. Confirm with your school and nearby colleges which programs and portfolio requirements apply.',
  },
  SPORTS: {
    strand: 'SPORTS',
    fullName: 'Sports',
    color: '#0891B2',
    icon: '🏅',
    description:
      'Sports. For students who want to train, compete, coach, or work in fitness and sports science.',
    degrees: [
      'BS Physical Education',
      'BS Exercise and Sports Sciences',
      'BS Sports Science',
    ],
    careers: [
      'Coach',
      'PE Teacher',
      'Fitness Instructor',
      'Athletic Trainer',
      'Sports Analyst',
    ],
    localDemand:
      'Opportunities depend on your region and school programs. Ask your guidance counselor which colleges near you offer sports programs.',
  },
};