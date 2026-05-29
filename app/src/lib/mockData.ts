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
