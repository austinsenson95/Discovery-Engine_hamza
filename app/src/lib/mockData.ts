import type { User, NicheOption, Persona, ProgramName, PricingStrategy, RoadmapPhase, ActivityItem, CourseCurriculum } from '@/types';

export const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  credits: 100,
  language: 'english',
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date(),
};

export const mockNiches: NicheOption[] = [
  {
    id: '1',
    name: 'Career Transition Coaching for IT Professionals',
    whoYouHelp: 'Mid-level IT professionals (5-12 years exp.) in India feeling stuck in their current roles',
    problemSolved: 'Lack of clarity on next career move, limited growth in current company, fear of switching domains',
    resultDelivered: 'Clear 12-month career roadmap, successful domain switch with 40%+ salary hike, leadership position within 18 months',
    revenuePotential: '₹50,000 - ₹2,00,000/month (individual + corporate training)',
    marketDemand: 85,
    fitExplanation: 'Your 10+ years in tech leadership + people management makes you perfectly positioned to guide others through this transition. The Indian IT market is booming with 5M+ professionals seeking growth.',
    competitionLevel: 'Medium - Most coaches are generic; domain-specific IT transition coaches are rare',
    keywords: ['Career Change', 'IT Leadership', 'Salary Negotiation', 'Domain Switch'],
  },
  {
    id: '2',
    name: 'Executive Presence Coaching for New Managers',
    whoYouHelp: 'First-time managers (2-5 years exp.) in corporate India recently promoted to lead teams',
    problemSolved: 'Imposter syndrome, inability to command respect, poor delegation, fear of difficult conversations with team members',
    resultDelivered: 'Confident leadership style within 90 days, high-performing team, recognized as a "natural leader" by stakeholders',
    revenuePotential: '₹75,000 - ₹3,00,000/month (high-ticket 1:1 + group coaching)',
    marketDemand: 92,
    fitExplanation: 'Having managed large teams yourself, you understand the exact pressure points. Every tech company in India promotes engineers to managers without training them. Huge pain point.',
    competitionLevel: 'Low-Medium - Executive coaching exists but not tailored for Indian new-manager context',
    keywords: ['Leadership', 'New Manager', 'Team Building', 'Executive Presence'],
  },
  {
    id: '3',
    name: 'Mindful Productivity Coaching for Entrepreneurs',
    whoYouHelp: 'Solo entrepreneurs and startup founders in India struggling with burnout and decision fatigue',
    problemSolved: 'Overwhelm from wearing multiple hats, inability to focus, working 12+ hours with no results, neglected health and relationships',
    resultDelivered: 'Sustainable 6-8 hour workday with 2x output, clear priority framework, improved well-being, thriving business AND personal life',
    revenuePotential: '₹40,000 - ₹1,50,000/month (course + community + workshops)',
    marketDemand: 78,
    fitExplanation: 'You have personally navigated the corporate grind and understand burnout deeply. The Indian startup ecosystem has 100K+ founders desperate for sustainable productivity systems.',
    competitionLevel: 'Medium - Productivity coaches exist but "mindful productivity" niche is underserved in India',
    keywords: ['Productivity', 'Mindfulness', 'Entrepreneurship', 'Burnout Recovery'],
  },
];

export const mockPersona: Persona = {
  id: '1',
  name: 'Kartik',
  ageRange: '35-45',
  role: 'Senior Manager at Tech Company',
  location: 'Bangalore',
  currentSituation: '10+ years in corporate IT, managing a team of 15 developers, earning ₹25L+ but feels stuck. Works 50+ hours weekly, has lost touch with hobbies and family. Sees younger colleagues getting promoted faster. Started questioning if this is all there is. Has thought about coaching for 2 years but never took action.',
  biggestDesire: 'Build a coaching business that gives him freedom to work from anywhere, impact lives directly, and earn ₹2L+/month within 18 months without sacrificing health and family time.',
  onlinePlatforms: ['LinkedIn', 'YouTube', 'WhatsApp Groups'],
  payingCapacity: '₹15,000 - ₹50,000',
  painPoints: [
    'Feeling unfulfilled despite a "successful" career',
    'No clear roadmap to transition out of corporate',
    'Fear of starting from scratch at this age',
    'Time constraints between job and family',
    'Imposter syndrome about being a coach',
  ],
  goals: [
    'Quit 9-5 in 18 months',
    'First paying client in 90 days',
    'Build a personal brand on LinkedIn',
    'Create a signature coaching program',
  ],
  quote: 'I have the experience. I just need the roadmap.',
  avatar: 'K',
};

export const mockProgramNames: ProgramName[] = [
  {
    id: '1',
    name: 'The Corporate Escape Blueprint',
    description: 'A 90-day intensive program designed to help mid-career professionals transition from corporate jobs to a thriving coaching/consulting business. Covers niche clarity, offer creation, client acquisition, and financial planning.',
    isAiRecommended: true,
  },
  {
    id: '2',
    name: 'Freedom Framework',
    description: 'A comprehensive 6-month coaching program that takes you from employee to entrepreneur. Build your coaching business alongside your day job with a proven step-by-step system tailored for the Indian market.',
    isAiRecommended: false,
  },
  {
    id: '3',
    name: 'Next Chapter Coaching',
    description: 'A results-driven program for professionals ready to reinvent their career. Discover your expertise, package it into a premium offer, and build a sustainable income stream that replaces your salary.',
    isAiRecommended: false,
  },
];

export const mockProblems: string[] = [
  'Feeling stuck in corporate with no clear exit strategy or timeline',
  'Having expertise but no idea how to package it into a sellable coaching offer',
  'Overwhelmed by conflicting advice from generic online business gurus who do not understand the Indian market',
  'Fear of losing financial stability by leaving a well-paying corporate job',
  'Not knowing how to find the first paying clients without spending on ads',
  'Struggling with imposter syndrome and wondering "who would pay ME for coaching?"',
];

export const mockPricing: PricingStrategy = {
  startingPrice: 4999,
  aiRecommendedPrice: 4999,
  priceJustification: '₹4,999 is positioned as an accessible yet serious investment for Indian working professionals. It is low enough to reduce purchase friction but high enough to attract committed action-takers who will do the work and get results — leading to testimonials and referrals.',
  marketInsight: 'In the Indian coaching market, programs priced between ₹3,000-8,000 see the highest conversion rates for first-time coaches. Your target persona (₹15-50L salary) views ₹4,999 as a "no-brainer" investment for career transformation.',
  milestones: {
    students10: 49990,
    students50: 249950,
    students100: 499900,
  },
  priceEvolution: {
    launch: 4999,
    after10Students: '₹9,999 - ₹14,999',
    premiumTier: '₹24,999 - ₹34,999',
  },
  sweetSpotRange: '₹2,999 - ₹4,999',
};

export const mockCurriculum: CourseCurriculum = {
  modules: [
    {
      id: 'mod_welcome',
      title: 'Welcome',
      lessons: [
        { id: 'les_001', title: 'The Coaching Blueprint Roadmap', duration: '15 min', learningOutcome: 'Understand the complete coaching business blueprint and your path to ₹1L+ months' },
        { id: 'les_002', title: 'Your ₹1K Commitment', duration: '10 min', learningOutcome: 'Commit to your first revenue milestone and understand the psychology of paid coaching' },
      ],
    },
    {
      id: 'mod_day1',
      title: 'Day 1: Mindset and High-Value Positioning',
      subtitle: 'Shift from a "worker" mindset to an "expert" and pick a profitable niche.',
      lessons: [
        { id: 'les_003', title: 'Killing the Freelancer Trap', duration: '25 min', learningOutcome: 'Identify and break free from freelancer mindset patterns that limit coaching income' },
        { id: 'les_004', title: 'Niche Selection Matrix', duration: '35 min', learningOutcome: 'Use a structured framework to select a profitable, high-ticket coaching niche' },
        { id: 'les_005', title: 'The Future of AI Automation', duration: '20 min', learningOutcome: 'Leverage AI tools to automate 70% of repetitive coaching business tasks' },
        { id: 'les_006', title: 'Your Expert Identity Quiz', duration: '15 min', learningOutcome: 'Define your expert identity and positioning statement for premium clients' },
      ],
      output: 'A defined high-ticket niche and a professional expert profile.',
    },
    {
      id: 'mod_day2',
      title: 'Day 2: Building Your Irresistible Offer',
      subtitle: 'Create a service package that businesses feel stupid saying no to.',
      lessons: [
        { id: 'les_007', title: 'The ₹1,000 Offer Framework', duration: '30 min', learningOutcome: 'Design a high-ticket coaching offer using the value-first framework' },
        { id: 'les_008', title: 'The "Value-First" Demo Secret', duration: '25 min', learningOutcome: 'Create a compelling demo session that converts 50%+ of prospects into paying clients' },
        { id: 'les_009', title: 'Real Results Case Study', duration: '20 min', learningOutcome: 'Analyze successful coaching case studies and extract repeatable success patterns' },
        { id: 'les_010', title: 'Pricing for Profit', duration: '20 min', learningOutcome: 'Set profitable pricing tiers using market research and value-based pricing principles' },
      ],
      output: 'A ready-to-sell offer with a clear price tag.',
    },
    {
      id: 'mod_day3',
      title: 'Day 3: The Lead Machine and Closing',
      subtitle: 'Launch your outreach system and learn how to handle the sales call.',
      lessons: [
        { id: 'les_011', title: 'LinkedIn Authority Blueprint', duration: '30 min', learningOutcome: 'Build a LinkedIn presence that attracts inbound coaching inquiries weekly' },
        { id: 'les_012', title: 'The 3-Step Closing Script', duration: '25 min', learningOutcome: 'Use a proven 3-step script to close discovery calls without being pushy' },
        { id: 'les_013', title: 'Your Next Chapter: The 90-Day Scale', duration: '20 min', learningOutcome: 'Create a 90-day action plan to scale from first client to consistent monthly revenue' },
        { id: 'les_014', title: 'First Outreach Sprint', duration: '15 min', learningOutcome: 'Execute your first outreach sprint and generate 5+ qualified leads within 48 hours' },
      ],
      output: 'Your first 10 active leads and a proven script to close them.',
    },
    {
      id: 'mod_grad',
      title: 'Graduation',
      lessons: [
        { id: 'les_015', title: 'Recap & Celebration', duration: '10 min', learningOutcome: 'Consolidate all learnings into a personal coaching business action checklist' },
        { id: 'les_016', title: 'Your Achievement Summary', duration: '10 min', learningOutcome: 'Document your achievements and articulate your unique coaching methodology' },
        { id: 'les_017', title: 'Your Growth Path', duration: '10 min', learningOutcome: 'Map your 6-month and 12-month growth milestones for scaling your coaching business' },
        { id: 'les_018', title: 'Certificate & Celebration', duration: '10 min', learningOutcome: 'Celebrate completion and commit to your first 30-day implementation sprint' },
      ],
    },
  ],
  totalLessons: 18,
  totalDuration: '6 hours',
};

export const mockRoadmap: RoadmapPhase[] = [
  {
    phase: 1,
    weeks: 'Weeks 1-3',
    title: 'Foundation',
    color: '#F97316',
    items: [
      {
        week: 'Week 1',
        tasks: [
          'Define your coaching niche and ideal student persona',
          'Set up your coaching business structure (name, legal)',
          'Create your LinkedIn optimization strategy',
        ],
      },
      {
        week: 'Week 2',
        tasks: [
          'Build your signature coaching framework',
          'Design your program curriculum (6-8 modules)',
          'Create your first lead magnet (checklist/guide)',
        ],
      },
      {
        week: 'Week 3',
        tasks: [
          'Set up your coaching tools (scheduling, payments, Zoom)',
          'Build a simple landing page for your program',
          'Post 5 value-driven LinkedIn posts to build authority',
        ],
      },
    ],
  },
  {
    phase: 2,
    weeks: 'Weeks 4-6',
    title: 'Build',
    color: '#3B82F6',
    items: [
      {
        week: 'Week 4',
        tasks: [
          'Create your program content (record first 2 modules)',
          'Build your email list with a free workshop/webinar',
          'Reach out to 20 potential clients for discovery calls',
        ],
      },
      {
        week: 'Week 5',
        tasks: [
          'Launch beta program at early-bird price (₹2,999)',
          'Deliver first live coaching sessions, gather feedback',
          'Get 3 testimonials from beta clients',
        ],
      },
      {
        week: 'Week 6',
        tasks: [
          'Refine program based on beta feedback',
          'Create case studies from early client wins',
          'Set up referral system for existing clients',
        ],
      },
    ],
  },
  {
    phase: 3,
    weeks: 'Weeks 7-9',
    title: 'Launch',
    color: '#22C55E',
    items: [
      {
        week: 'Week 7',
        tasks: [
          'Official launch at ₹4,999 price point',
          'Run a 5-day LinkedIn launch campaign',
          'Host a free masterclass to generate leads',
        ],
      },
      {
        week: 'Week 8',
        tasks: [
          'Follow up with all leads and discovery calls',
          'Close first 5-10 paying clients',
          'Deliver exceptional results for maximum testimonials',
        ],
      },
      {
        week: 'Week 9',
        tasks: [
          'Optimize your sales process based on learnings',
          'Scale content creation (2-3 posts/week on LinkedIn)',
          'Set up automated email nurture sequences',
        ],
      },
    ],
  },
  {
    phase: 4,
    weeks: 'Weeks 10-12',
    title: 'Scale',
    color: '#A855F7',
    items: [
      {
        week: 'Week 10',
        tasks: [
          'Introduce premium 1:1 coaching tier (₹24,999)',
          'Build a community/group coaching model',
          'Partner with corporate clients for team coaching',
        ],
      },
      {
        week: 'Week 11',
        tasks: [
          'Hire a VA for admin tasks to free your time',
          'Create your second revenue stream (course/template)',
          'Build a waitlist for future cohorts',
        ],
      },
      {
        week: 'Week 12',
        tasks: [
          'Analyze 12-week results and set new 90-day goals',
          'Plan your transition timeline to quit corporate',
          'Celebrate wins and share your journey publicly',
        ],
      },
    ],
  },
];

export const mockActivity: ActivityItem[] = [
  {
    id: '1',
    title: 'Blueprint Created',
    description: 'Started your coaching business blueprint journey',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    type: 'blueprint',
  },
  {
    id: '2',
    title: 'Niche Discovery Completed',
    description: 'Found 3 potential niches for your coaching business',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    type: 'niche',
  },
  {
    id: '3',
    title: 'Audience Persona Generated',
    description: 'Created detailed persona "Kartik" for audience targeting',
    timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000),
    type: 'audience',
  },
  {
    id: '4',
    title: 'Credits Used',
    description: 'Used 30 credits for niche discovery and persona generation',
    timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000),
    type: 'credit',
  },
  {
    id: '5',
    title: 'Program Framework Built',
    description: 'Selected "The Corporate Escape Blueprint" as your signature program',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    type: 'program',
  },
];

// ---------------------------------------------------------------------------
// Duration-Aware Curriculum Variants
// ---------------------------------------------------------------------------

export const mockCurriculum4Weeks: CourseCurriculum = {
  modules: [
    {
      id: 'mod_intensive_welcome',
      title: 'Welcome & Setup',
      lessons: [
        { id: 'les_i01', title: 'The Intensive Blueprint', duration: '20 min', learningOutcome: 'Understand the accelerated 4-week path to your first paying client' },
        { id: 'les_i02', title: 'Your ₹10K Commitment', duration: '15 min', learningOutcome: 'Set an aggressive revenue target and commit to daily action' },
      ],
    },
    {
      id: 'mod_intensive_core',
      title: 'Week 1-2: Niche & Offer Intensive',
      subtitle: 'Rapidly define your niche, build your offer, and validate demand.',
      lessons: [
        { id: 'les_i03', title: 'Niche Selection Sprint', duration: '45 min', learningOutcome: 'Pick a profitable niche in 48 hours using the urgency framework' },
        { id: 'les_i04', title: 'The ₹5,000 Offer Blueprint', duration: '40 min', learningOutcome: 'Design a high-converting offer with urgency baked in' },
        { id: 'les_i05', title: 'Pricing for Quick Sales', duration: '30 min', learningOutcome: 'Set a price that converts fast without undermining value' },
        { id: 'les_i06', title: 'Validation Outreach Sprint', duration: '35 min', learningOutcome: 'Get 5+ validation calls booked in 72 hours' },
      ],
      output: 'A validated niche, a priced offer, and 5+ scheduled discovery calls.',
    },
    {
      id: 'mod_intensive_launch',
      title: 'Week 3-4: Launch & Close',
      subtitle: 'Execute your launch, close your first clients, and systematize.',
      lessons: [
        { id: 'les_i07', title: 'The 48-Hour Launch Framework', duration: '40 min', learningOutcome: 'Launch your program with urgency and social proof' },
        { id: 'les_i08', title: 'Closing Without Being Pushy', duration: '35 min', learningOutcome: 'Use the 2-step close to convert discovery calls into sales' },
        { id: 'les_i09', title: 'Delivery & Testimonials', duration: '30 min', learningOutcome: 'Deliver exceptional results and capture powerful testimonials' },
        { id: 'les_i10', title: 'Next 90 Days Scale Plan', duration: '25 min', learningOutcome: 'Map your path from first client to consistent monthly revenue' },
      ],
      output: 'Your first 3-5 paying clients and a testimonial collection system.',
    },
    {
      id: 'mod_intensive_grad',
      title: 'Graduation',
      lessons: [
        { id: 'les_i11', title: 'Recap & Celebration', duration: '15 min', learningOutcome: 'Celebrate your first revenue milestone and plan your scale' },
      ],
    },
  ],
  totalLessons: 11,
  totalDuration: '5.5 hours',
};

export const mockCurriculum8Weeks: CourseCurriculum = {
  modules: [
    {
      id: 'mod_std_welcome',
      title: 'Welcome',
      lessons: [
        { id: 'les_s01', title: 'The Coaching Blueprint Roadmap', duration: '15 min', learningOutcome: 'Understand the complete coaching business blueprint and your path to ₹1L+ months' },
        { id: 'les_s02', title: 'Your ₹1K Commitment', duration: '10 min', learningOutcome: 'Commit to your first revenue milestone and understand the psychology of paid coaching' },
      ],
    },
    {
      id: 'mod_std_w1',
      title: 'Week 1-2: Mindset and High-Value Positioning',
      subtitle: 'Shift from a "worker" mindset to an "expert" and pick a profitable niche.',
      lessons: [
        { id: 'les_s03', title: 'Killing the Freelancer Trap', duration: '25 min', learningOutcome: 'Identify and break free from freelancer mindset patterns that limit coaching income' },
        { id: 'les_s04', title: 'Niche Selection Matrix', duration: '35 min', learningOutcome: 'Use a structured framework to select a profitable, high-ticket coaching niche' },
        { id: 'les_s05', title: 'The Future of AI Automation', duration: '20 min', learningOutcome: 'Leverage AI tools to automate 70% of repetitive coaching business tasks' },
        { id: 'les_s06', title: 'Your Expert Identity Quiz', duration: '15 min', learningOutcome: 'Define your expert identity and positioning statement for premium clients' },
      ],
      output: 'A defined high-ticket niche and a professional expert profile.',
    },
    {
      id: 'mod_std_w3',
      title: 'Week 3-4: Building Your Irresistible Offer',
      subtitle: 'Create a service package that businesses feel stupid saying no to.',
      lessons: [
        { id: 'les_s07', title: 'The ₹1,000 Offer Framework', duration: '30 min', learningOutcome: 'Design a high-ticket coaching offer using the value-first framework' },
        { id: 'les_s08', title: 'The "Value-First" Demo Secret', duration: '25 min', learningOutcome: 'Create a compelling demo session that converts 50%+ of prospects into paying clients' },
        { id: 'les_s09', title: 'Real Results Case Study', duration: '20 min', learningOutcome: 'Analyze successful coaching case studies and extract repeatable success patterns' },
        { id: 'les_s10', title: 'Pricing for Profit', duration: '20 min', learningOutcome: 'Set profitable pricing tiers using market research and value-based pricing principles' },
      ],
      output: 'A ready-to-sell offer with a clear price tag.',
    },
    {
      id: 'mod_std_w5',
      title: 'Week 5-6: The Lead Machine and Closing',
      subtitle: 'Launch your outreach system and learn how to handle the sales call.',
      lessons: [
        { id: 'les_s11', title: 'LinkedIn Authority Blueprint', duration: '30 min', learningOutcome: 'Build a LinkedIn presence that attracts inbound coaching inquiries weekly' },
        { id: 'les_s12', title: 'The 3-Step Closing Script', duration: '25 min', learningOutcome: 'Use a proven 3-step script to close discovery calls without being pushy' },
        { id: 'les_s13', title: 'Your Next Chapter: The 90-Day Scale', duration: '20 min', learningOutcome: 'Create a 90-day action plan to scale from first client to consistent monthly revenue' },
        { id: 'les_s14', title: 'First Outreach Sprint', duration: '15 min', learningOutcome: 'Execute your first outreach sprint and generate 5+ qualified leads within 48 hours' },
      ],
      output: 'Your first 10 active leads and a proven script to close them.',
    },
    {
      id: 'mod_std_w7',
      title: 'Week 7-8: Delivery & Scale',
      subtitle: 'Deliver exceptional results and build systems for growth.',
      lessons: [
        { id: 'les_s15', title: 'Client Success Framework', duration: '25 min', learningOutcome: 'Design a delivery experience that generates referrals and testimonials' },
        { id: 'les_s16', title: 'Building a Coaching Community', duration: '20 min', learningOutcome: 'Create a community that increases retention and lifetime value' },
        { id: 'les_s17', title: 'Operations & Automation', duration: '20 min', learningOutcome: 'Set up systems to handle 10+ clients without burning out' },
        { id: 'les_s18', title: 'Your 6-Month Roadmap', duration: '15 min', learningOutcome: 'Map your growth from ₹0 to ₹1L+ months with clear milestones' },
      ],
      output: 'A scalable delivery system and a 6-month growth roadmap.',
    },
    {
      id: 'mod_std_grad',
      title: 'Graduation',
      lessons: [
        { id: 'les_s19', title: 'Recap & Celebration', duration: '10 min', learningOutcome: 'Consolidate all learnings into a personal coaching business action checklist' },
        { id: 'les_s20', title: 'Certificate & Celebration', duration: '10 min', learningOutcome: 'Celebrate completion and commit to your first 30-day implementation sprint' },
      ],
    },
  ],
  totalLessons: 20,
  totalDuration: '7 hours',
};

export const mockCurriculum12Weeks: CourseCurriculum = {
  modules: [
    {
      id: 'mod_comp_welcome',
      title: 'Welcome',
      lessons: [
        { id: 'les_c01', title: 'The Coaching Blueprint Roadmap', duration: '15 min', learningOutcome: 'Understand the complete coaching business blueprint and your path to ₹1L+ months' },
        { id: 'les_c02', title: 'Your ₹1K Commitment', duration: '10 min', learningOutcome: 'Commit to your first revenue milestone and understand the psychology of paid coaching' },
      ],
    },
    {
      id: 'mod_comp_w1',
      title: 'Week 1: Foundation & Mindset',
      subtitle: 'Build the mindset of a high-ticket coach.',
      lessons: [
        { id: 'les_c03', title: 'Killing the Freelancer Trap', duration: '25 min', learningOutcome: 'Identify and break free from freelancer mindset patterns that limit coaching income' },
        { id: 'les_c04', title: 'The Expert Identity Shift', duration: '20 min', learningOutcome: 'Redefine yourself as an expert, not a service provider' },
      ],
      output: 'A strong expert mindset and clear identity.',
    },
    {
      id: 'mod_comp_w2',
      title: 'Week 2: Niche Clarity',
      subtitle: 'Find the perfect intersection of your skills and market demand.',
      lessons: [
        { id: 'les_c05', title: 'Niche Selection Matrix', duration: '35 min', learningOutcome: 'Use a structured framework to select a profitable, high-ticket coaching niche' },
        { id: 'les_c06', title: 'Market Research Deep Dive', duration: '30 min', learningOutcome: 'Validate your niche with real market data and competitor analysis' },
      ],
      output: 'A validated, profitable niche with market proof.',
    },
    {
      id: 'mod_comp_w3',
      title: 'Week 3: Audience Persona',
      subtitle: 'Understand your ideal student deeply.',
      lessons: [
        { id: 'les_c07', title: 'Building Your Ideal Student Avatar', duration: '30 min', learningOutcome: 'Create a detailed persona that guides all your marketing and content' },
        { id: 'les_c08', title: 'Pain Point Mapping', duration: '25 min', learningOutcome: 'Map the exact problems your audience pays to solve' },
      ],
      output: 'A detailed audience persona and pain-point map.',
    },
    {
      id: 'mod_comp_w4',
      title: 'Week 4: Offer Design',
      subtitle: 'Create an offer that sells itself.',
      lessons: [
        { id: 'les_c09', title: 'The ₹1,000 Offer Framework', duration: '30 min', learningOutcome: 'Design a high-ticket coaching offer using the value-first framework' },
        { id: 'les_c10', title: 'Packaging Your Transformation', duration: '25 min', learningOutcome: 'Structure your program for maximum perceived value' },
      ],
      output: 'A packaged offer with clear transformation promise.',
    },
    {
      id: 'mod_comp_w5',
      title: 'Week 5: Pricing Strategy',
      subtitle: 'Set prices that reflect your value.',
      lessons: [
        { id: 'les_c11', title: 'Pricing for Profit', duration: '25 min', learningOutcome: 'Set profitable pricing tiers using market research and value-based pricing principles' },
        { id: 'les_c12', title: 'The Price Psychology Playbook', duration: '20 min', learningOutcome: 'Use psychological pricing to increase conversions without discounting' },
      ],
      output: 'A pricing strategy with launch, growth, and premium tiers.',
    },
    {
      id: 'mod_comp_w6',
      title: 'Week 6: Lead Generation',
      subtitle: 'Build a predictable lead flow.',
      lessons: [
        { id: 'les_c13', title: 'LinkedIn Authority Blueprint', duration: '30 min', learningOutcome: 'Build a LinkedIn presence that attracts inbound coaching inquiries weekly' },
        { id: 'les_c14', title: 'Content That Converts', duration: '25 min', learningOutcome: 'Create a content calendar that generates leads on autopilot' },
      ],
      output: 'A content system and 50+ warm LinkedIn connections.',
    },
    {
      id: 'mod_comp_w7',
      title: 'Week 7: Sales Mastery',
      subtitle: 'Close discovery calls with confidence.',
      lessons: [
        { id: 'les_c15', title: 'The 3-Step Closing Script', duration: '25 min', learningOutcome: 'Use a proven 3-step script to close discovery calls without being pushy' },
        { id: 'les_c16', title: 'Objection Handling', duration: '20 min', learningOutcome: 'Handle price, time, and commitment objections gracefully' },
      ],
      output: 'A closing script and objection-handling playbook.',
    },
    {
      id: 'mod_comp_w8',
      title: 'Week 8: Launch Week',
      subtitle: 'Execute your first paid launch.',
      lessons: [
        { id: 'les_c17', title: 'The 7-Day Launch Sequence', duration: '30 min', learningOutcome: 'Run a structured launch that generates sales in one week' },
        { id: 'les_c18', title: 'Launch Email Templates', duration: '20 min', learningOutcome: 'Use proven email templates to drive launch sales' },
      ],
      output: 'A completed launch with your first paying clients.',
    },
    {
      id: 'mod_comp_w9',
      title: 'Week 9: Delivery Excellence',
      subtitle: 'Deliver results that generate referrals.',
      lessons: [
        { id: 'les_c19', title: 'Client Success Framework', duration: '25 min', learningOutcome: 'Design a delivery experience that generates referrals and testimonials' },
        { id: 'les_c20', title: 'The Testimonial Engine', duration: '20 min', learningOutcome: 'Systematically collect and use testimonials to drive future sales' },
      ],
      output: 'A delivery framework and 3+ testimonials.',
    },
    {
      id: 'mod_comp_w10',
      title: 'Week 10: Community Building',
      subtitle: 'Create belonging and retention.',
      lessons: [
        { id: 'les_c21', title: 'Building a Coaching Community', duration: '20 min', learningOutcome: 'Create a community that increases retention and lifetime value' },
        { id: 'les_c22', title: 'Group Coaching Mechanics', duration: '20 min', learningOutcome: 'Run effective group coaching sessions that scale your impact' },
      ],
      output: 'A community structure and group coaching format.',
    },
    {
      id: 'mod_comp_w11',
      title: 'Week 11: Systems & Automation',
      subtitle: 'Build systems that free your time.',
      lessons: [
        { id: 'les_c23', title: 'Operations & Automation', duration: '25 min', learningOutcome: 'Set up systems to handle 10+ clients without burning out' },
        { id: 'les_c24', title: 'Hiring Your First VA', duration: '20 min', learningOutcome: 'Delegate admin tasks and reclaim 10+ hours per week' },
      ],
      output: 'An automated operations system and hiring plan.',
    },
    {
      id: 'mod_comp_w12',
      title: 'Week 12: Scale & Celebrate',
      subtitle: 'Plan your next 6 months of growth.',
      lessons: [
        { id: 'les_c25', title: 'Your 6-Month Roadmap', duration: '20 min', learningOutcome: 'Map your growth from ₹0 to ₹1L+ months with clear milestones' },
        { id: 'les_c26', title: 'Certificate & Celebration', duration: '15 min', learningOutcome: 'Celebrate completion and commit to your first 30-day implementation sprint' },
      ],
      output: 'A 6-month growth roadmap and completion certificate.',
    },
    {
      id: 'mod_comp_grad',
      title: 'Graduation',
      lessons: [
        { id: 'les_c27', title: 'Final Recap & Action Plan', duration: '15 min', learningOutcome: 'Consolidate all learnings into a personal coaching business action checklist' },
      ],
    },
  ],
  totalLessons: 27,
  totalDuration: '9 hours',
};

// ---------------------------------------------------------------------------
// Duration-Aware Roadmap Variants
// ---------------------------------------------------------------------------

export const mockRoadmap4Weeks: RoadmapPhase[] = [
  {
    phase: 1,
    weeks: 'Weeks 1-2',
    title: 'Build',
    color: '#F97316',
    items: [
      { week: 'Week 1', tasks: ['Define niche and ideal student persona', 'Build your signature coaching framework', 'Design your program curriculum', 'Create your first lead magnet'] },
      { week: 'Week 2', tasks: ['Set up coaching tools (scheduling, payments, Zoom)', 'Build a simple landing page', 'Post 5 value-driven LinkedIn posts', 'Reach out to 20 potential clients'] },
    ],
  },
  {
    phase: 2,
    weeks: 'Weeks 3-4',
    title: 'Launch',
    color: '#22C55E',
    items: [
      { week: 'Week 3', tasks: ['Launch beta program at early-bird price', 'Deliver first live coaching sessions', 'Get 3 testimonials from beta clients', 'Refine offer based on feedback'] },
      { week: 'Week 4', tasks: ['Official launch at full price', 'Close first 5-10 paying clients', 'Optimize sales process', 'Celebrate your first revenue milestone'] },
    ],
  },
];

export const mockRoadmap8Weeks: RoadmapPhase[] = [
  {
    phase: 1,
    weeks: 'Weeks 1-2',
    title: 'Foundation',
    color: '#F97316',
    items: [
      { week: 'Week 1', tasks: ['Define your coaching niche and ideal student persona', 'Set up your coaching business structure', 'Create your LinkedIn optimization strategy'] },
      { week: 'Week 2', tasks: ['Build your signature coaching framework', 'Design your program curriculum', 'Create your first lead magnet', 'Set up coaching tools'] },
    ],
  },
  {
    phase: 2,
    weeks: 'Weeks 3-4',
    title: 'Build',
    color: '#3B82F6',
    items: [
      { week: 'Week 3', tasks: ['Create your program content (record first 2 modules)', 'Build your email list with a free workshop', 'Reach out to 20 potential clients'] },
      { week: 'Week 4', tasks: ['Launch beta program at early-bird price', 'Deliver first live coaching sessions', 'Get 3 testimonials from beta clients'] },
    ],
  },
  {
    phase: 3,
    weeks: 'Weeks 5-6',
    title: 'Launch',
    color: '#22C55E',
    items: [
      { week: 'Week 5', tasks: ['Official launch at full price', 'Run a 5-day LinkedIn launch campaign', 'Host a free masterclass to generate leads'] },
      { week: 'Week 6', tasks: ['Follow up with all leads and discovery calls', 'Close first 5-10 paying clients', 'Deliver exceptional results for testimonials'] },
    ],
  },
  {
    phase: 4,
    weeks: 'Weeks 7-8',
    title: 'Scale',
    color: '#A855F7',
    items: [
      { week: 'Week 7', tasks: ['Optimize your sales process', 'Scale content creation (2-3 posts/week)', 'Set up automated email nurture sequences'] },
      { week: 'Week 8', tasks: ['Analyze 8-week results and set new goals', 'Plan your transition timeline', 'Celebrate wins and share your journey'] },
    ],
  },
];

export const mockRoadmap12Weeks: RoadmapPhase[] = [
  {
    phase: 1,
    weeks: 'Weeks 1-3',
    title: 'Foundation',
    color: '#F97316',
    items: [
      { week: 'Week 1', tasks: ['Define your coaching niche and ideal student persona', 'Set up your coaching business structure (name, legal)', 'Create your LinkedIn optimization strategy'] },
      { week: 'Week 2', tasks: ['Build your signature coaching framework', 'Design your program curriculum (6-8 modules)', 'Create your first lead magnet (checklist/guide)'] },
      { week: 'Week 3', tasks: ['Set up your coaching tools (scheduling, payments, Zoom)', 'Build a simple landing page for your program', 'Post 5 value-driven LinkedIn posts to build authority'] },
    ],
  },
  {
    phase: 2,
    weeks: 'Weeks 4-6',
    title: 'Build',
    color: '#3B82F6',
    items: [
      { week: 'Week 4', tasks: ['Create your program content (record first 2 modules)', 'Build your email list with a free workshop/webinar', 'Reach out to 20 potential clients for discovery calls'] },
      { week: 'Week 5', tasks: ['Launch beta program at early-bird price (₹2,999)', 'Deliver first live coaching sessions, gather feedback', 'Get 3 testimonials from beta clients'] },
      { week: 'Week 6', tasks: ['Refine program based on beta feedback', 'Create case studies from early client wins', 'Set up referral system for existing clients'] },
    ],
  },
  {
    phase: 3,
    weeks: 'Weeks 7-9',
    title: 'Launch',
    color: '#22C55E',
    items: [
      { week: 'Week 7', tasks: ['Official launch at ₹4,999 price point', 'Run a 5-day LinkedIn launch campaign', 'Host a free masterclass to generate leads'] },
      { week: 'Week 8', tasks: ['Follow up with all leads and discovery calls', 'Close first 5-10 paying clients', 'Deliver exceptional results for maximum testimonials'] },
      { week: 'Week 9', tasks: ['Optimize your sales process based on learnings', 'Scale content creation (2-3 posts/week on LinkedIn)', 'Set up automated email nurture sequences'] },
    ],
  },
  {
    phase: 4,
    weeks: 'Weeks 10-12',
    title: 'Scale',
    color: '#A855F7',
    items: [
      { week: 'Week 10', tasks: ['Introduce premium 1:1 coaching tier (₹24,999)', 'Build a community/group coaching model', 'Partner with corporate clients for team coaching'] },
      { week: 'Week 11', tasks: ['Hire a VA for admin tasks to free your time', 'Create your second revenue stream (course/template)', 'Build a waitlist for future cohorts'] },
      { week: 'Week 12', tasks: ['Analyze 12-week results and set new 90-day goals', 'Plan your transition timeline to quit corporate', 'Celebrate wins and share your journey publicly'] },
    ],
  },
];
