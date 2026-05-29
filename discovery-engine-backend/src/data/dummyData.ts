/**
 * ============================================================================
 * DISCOVERY ENGINE - Dummy Data
 * ============================================================================
 * Comprehensive dummy data for ALL API responses.
 * This data simulates realistic LLM-generated content.
 * Replace these with actual LLM API calls in production.
 * ============================================================================
 */

import { User, NicheOption, Persona, ProgramName, PricingStrategy, RoadmapPhase, Blueprint, CreditDeductions, ModuleItem } from '../types';

// ---------------------------------------------------------------------------
// Credit Deduction Configuration
// ---------------------------------------------------------------------------
export const creditDeductions: CreditDeductions = {
  niche: 10,
  audience: 10,
  program: 5,
  pricing: 5,
  curriculum: 10,
  roadmap: 15,
};

// ---------------------------------------------------------------------------
// Mock User
// ---------------------------------------------------------------------------
export const dummyUser: User = {
  id: 'usr_001',
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JohnDoe',
  credits: 100,
  language: 'english',
  createdAt: new Date('2024-01-15T08:00:00Z'),
  updatedAt: new Date('2024-06-20T10:30:00Z'),
};

// ---------------------------------------------------------------------------
// Niche Discovery - 3 Detailed Niche Options
// ---------------------------------------------------------------------------
export const dummyNiches: NicheOption[] = [
  {
    id: 'niche_001',
    name: 'Clarity & Confidence Coach for Mid-Career Professionals',
    whoYouHelp: 'Working professionals aged 30-45 who feel stuck in their careers',
    problemSolved: 'Lack of clarity about next career move, imposter syndrome, and inability to advocate for themselves',
    resultDelivered: 'Clear career direction, renewed confidence, and a concrete action plan within 90 days',
    revenuePotential: '₹50K - ₹2L/month through 1:1 coaching and group programs',
    marketDemand: 8.5,
    fitExplanation: 'Your HR background gives you insider knowledge about what companies look for, and your passion for helping people shines through',
    competitionLevel: 'Medium',
    keywords: ['career clarity', 'confidence building', 'mid-career transition', 'leadership coaching', 'imposter syndrome'],
    isSelected: false,
  },
  {
    id: 'niche_002',
    name: 'Wellness Coach for Busy Entrepreneurs',
    whoYouHelp: 'Startup founders and small business owners burning out',
    problemSolved: 'Chronic stress, poor work-life balance, declining health due to neglect',
    resultDelivered: 'Sustainable wellness routines, increased energy, better productivity without burnout',
    revenuePotential: '₹75K - ₹3L/month through high-ticket 1:1 and masterminds',
    marketDemand: 9.2,
    fitExplanation: 'Entrepreneurs have purchasing power and urgency; your wellness expertise meets a critical pain point',
    competitionLevel: 'Low-Medium',
    keywords: ['entrepreneur wellness', 'burnout prevention', 'high-performance health', 'stress management', 'founder fitness'],
    isSelected: false,
  },
  {
    id: 'niche_003',
    name: 'Parenting Coach for Working Parents',
    whoYouHelp: 'Dual-income families struggling with parenting guilt and work-life balance',
    problemSolved: 'Parenting overwhelm, guilt about not spending enough time, conflicting parenting styles',
    resultDelivered: 'Harmonious family routines, confident parenting approach, quality time strategies',
    revenuePotential: '₹30K - ₹1.5L/month through courses and community memberships',
    marketDemand: 7.8,
    fitExplanation: 'Growing market with strong community potential; working parents actively seek solutions',
    competitionLevel: 'Medium-High',
    keywords: ['working parent', 'parenting guilt', 'family routines', 'conscious parenting', 'work-life balance'],
    isSelected: false,
  },
];

// ---------------------------------------------------------------------------
// Audience Persona - "Kartik"
// ---------------------------------------------------------------------------
export const dummyPersona: Persona = {
  id: 'persona_001',
  name: 'Kartik',
  ageRange: '35-45',
  role: 'Senior Manager / Director',
  location: 'Bangalore / Hyderabad',
  currentSituation:
    'Kartik has spent 12+ years climbing the corporate ladder. He earns well (₹30-50L PA) but feels a growing emptiness. He wakes up dreading Mondays, questions if this is all there is, and secretly dreams of starting something of his own. He has saved some money but is afraid of risking it all.',
  biggestDesire:
    'To find meaningful work that aligns with his values — something that gives him freedom, purpose, and the ability to make a real impact without sacrificing financial security.',
  onlinePlatforms: [
    'LinkedIn (daily)',
    'Twitter/X (for thought leaders)',
    'Spotify (podcasts on entrepreneurship)',
    'YouTube (self-improvement & business)',
    'WhatsApp groups with like-minded professionals',
  ],
  payingCapacity: '₹25,000 - ₹75,000 for the right program; willing to pay premium for proven results',
  painPoints: [
    'Fear of starting over at this age',
    'No clear idea what business to start',
    'Analysis paralysis — overthinking every option',
    'Lack of a support system or mentor',
    'Societal pressure to "stick to the safe path"',
    'Not sure if his skills translate to entrepreneurship',
  ],
  goals: [
    'Gain clarity on his ideal business direction within 30 days',
    'Build confidence to take the first step',
    'Create a financial transition plan (not quit abruptly)',
    'Connect with others on the same journey',
    'Learn practical skills (marketing, sales, product)',
  ],
  quote:
    '"I don\'t want to regret not trying. But I also don\'t want to fail publicly and lose everything I\'ve built."',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=KartikSeniorManager',
};

// ---------------------------------------------------------------------------
// Program Names - 3 Options (One AI Recommended)
// ---------------------------------------------------------------------------
export const dummyProgramNames: ProgramName[] = [
  {
    id: 'progname_001',
    name: 'Career Clarity Accelerator',
    description: 'A structured 8-week program to help mid-career professionals find direction and build confidence',
    isAiRecommended: false,
  },
  {
    id: 'progname_002',
    name: 'The Confident Professional Blueprint',
    description: 'AI-recommended: Combines clarity work with confidence building and actionable career strategy',
    isAiRecommended: true,
  },
  {
    id: 'progname_003',
    name: 'Next Chapter Mastery',
    description: 'Premium 12-week transformation for professionals ready to reinvent their careers',
    isAiRecommended: false,
  },
];

// ---------------------------------------------------------------------------
// Program Modules - 6 Modules
// ---------------------------------------------------------------------------
export const dummyModules: ModuleItem[] = [
  {
    id: 'mod_001',
    title: 'Module 1: Self-Discovery & Strengths Assessment',
    description: 'Uncover your unique strengths, values, and career anchors through proven assessments',
    duration: 'Week 1-2',
  },
  {
    id: 'mod_002',
    title: 'Module 2: Career Clarity Mapping',
    description: 'Map out your ideal career landscape and identify high-potential directions',
    duration: 'Week 3',
  },
  {
    id: 'mod_003',
    title: 'Module 3: Confidence Rebuilding',
    description: 'Overcome imposter syndrome and build unshakeable professional confidence',
    duration: 'Week 4-5',
  },
  {
    id: 'mod_004',
    title: 'Module 4: Strategic Networking',
    description: 'Learn how to build a powerful professional network that opens doors',
    duration: 'Week 6',
  },
  {
    id: 'mod_005',
    title: 'Module 5: Personal Branding',
    description: 'Craft your professional story and establish thought leadership',
    duration: 'Week 7',
  },
  {
    id: 'mod_006',
    title: 'Module 6: 90-Day Action Plan',
    description: 'Create a concrete, actionable plan with milestones and accountability',
    duration: 'Week 8',
  },
];

// ---------------------------------------------------------------------------
// Pricing Strategy
// ---------------------------------------------------------------------------
export const dummyPricing: PricingStrategy = {
  startingPrice: 4999,
  aiRecommendedPrice: 4999,
  priceJustification:
    '₹4,999 is an accessible entry point that removes price barriers while signaling value. It allows you to test the market, gather testimonials, and iterate. At this price, you only need 10 students to validate demand and 50 to generate meaningful revenue.',
  marketInsight:
    'The Indian online coaching market is growing at 25% YoY. Mid-career professionals in Tier 1 cities are actively investing in self-improvement. Competitors in this space charge ₹10K-₹50K for similar programs, giving you room to raise prices as you build credibility.',
  milestones: {
    students10: 49990,
    students50: 249950,
    students100: 499900,
  },
  priceEvolution: {
    launch: 4999,
    after10Students: 'Raise to ₹9,999 (2x) — you have social proof and testimonials',
    premiumTier: '₹24,999 for a premium tier with 1:1 coaching and exclusive community access',
  },
  sweetSpotRange: '₹9,999 - ₹19,999 (after initial validation phase)',
};

// ---------------------------------------------------------------------------
// Course Curriculum
// ---------------------------------------------------------------------------
export const dummyCurriculum = {
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

// ---------------------------------------------------------------------------
// 12-Week Roadmap - 4 Phases
// ---------------------------------------------------------------------------
export const dummyRoadmapPhases: RoadmapPhase[] = [
  {
    phase: 1,
    weeks: 'Weeks 1-3',
    title: 'Foundation & Validation',
    color: '#F97316',
    items: [
      {
        week: 'Week 1',
        tasks: [
          'Finalize your niche and target persona',
          'Set up your coaching business structure (sole proprietorship)',
          'Create your ideal client avatar document',
          'Set up professional email and calendar system',
        ],
      },
      {
        week: 'Week 2',
        tasks: [
          'Design your program curriculum outline',
          'Create a simple landing page (use Carrd or Notion)',
          'Set up payment collection (Razorpay / Stripe)',
          'Draft your offer and pricing structure',
        ],
      },
      {
        week: 'Week 3',
        tasks: [
          'Validate your offer with 5 potential clients (free discovery calls)',
          'Gather feedback and refine your program',
          'Create content for LinkedIn (3 posts per week)',
          'Join 3 relevant online communities where your audience hangs out',
        ],
      },
    ],
  },
  {
    phase: 2,
    weeks: 'Weeks 4-6',
    title: 'Build & Prepare',
    color: '#8B5CF6',
    items: [
      {
        week: 'Week 4',
        tasks: [
          'Build your program content (slides, worksheets, templates)',
          'Record welcome video and module 1 content',
          'Set up community platform (WhatsApp group or Circle)',
          'Create onboarding email sequence',
        ],
      },
      {
        week: 'Week 5',
        tasks: [
          'Complete all module recordings and materials',
          'Set up automation (email reminders, access links)',
          'Create client intake form and assessment',
          'Prepare bonus resources (templates, checklists)',
        ],
      },
      {
        week: 'Week 6',
        tasks: [
          'Run a beta test with 3-5 clients at 50% discount',
          'Collect detailed feedback and testimonials',
          'Fix any issues in content or delivery',
          'Document FAQs and create a knowledge base',
        ],
      },
    ],
  },
  {
    phase: 3,
    weeks: 'Weeks 7-9',
    title: 'Launch & Acquire',
    color: '#059669',
    items: [
      {
        week: 'Week 7',
        tasks: [
          'Plan your official launch (date, messaging, channels)',
          'Create launch content (case studies, testimonials, behind-the-scenes)',
          'Reach out to your network personally (DMs, calls)',
          'Offer early-bird pricing (₹3,999 for first 10 students)',
        ],
      },
      {
        week: 'Week 8',
        tasks: [
          'Execute launch: daily LinkedIn posts + stories',
          'Host a free webinar or workshop to attract leads',
          'Follow up with all interested prospects',
          'Enroll first 10 paying students',
        ],
      },
      {
        week: 'Week 9',
        tasks: [
          'Deliver program to first cohort with excellence',
          'Document student wins and collect testimonials',
          'Iterate on program based on live feedback',
          'Plan referral program for students',
        ],
      },
    ],
  },
  {
    phase: 4,
    weeks: 'Weeks 10-12',
    title: 'Scale & Optimize',
    color: '#3B82F6',
    items: [
      {
        week: 'Week 10',
        tasks: [
          'Raise price to ₹9,999 based on testimonials',
          'Launch referral program with incentives',
          'Start collecting video testimonials',
          'Create case study content from student results',
        ],
      },
      {
        week: 'Week 11',
        tasks: [
          'Set up automated lead generation (LinkedIn + ads)',
          'Create evergreen funnel (free resource → email sequence → offer)',
          'Hire a VA for admin tasks (2-3 hours/week)',
          'Plan premium tier (₹24,999 with 1:1 coaching)',
        ],
      },
      {
        week: 'Week 12',
        tasks: [
          'Launch premium tier to existing students',
          'Document your entire system (SOPs)',
          'Plan next quarter: new program or market expansion',
          'Celebrate your wins and set new revenue targets!',
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Blueprint State (in-progress example)
// ---------------------------------------------------------------------------
export const dummyBlueprint: Blueprint = {
  id: 'bp_001',
  userId: 'usr_001',
  status: 'in_progress',
  currentStep: 1,
  progress: 15,
  createdAt: new Date('2024-06-01T10:00:00Z'),
  updatedAt: new Date('2024-06-20T14:30:00Z'),
};

// ---------------------------------------------------------------------------
// Sample Selected Problems (for problem submission step)
// ---------------------------------------------------------------------------
export const dummySelectedProblems: string[] = [
  'Fear of starting over at this age',
  'No clear idea what business to start',
  'Analysis paralysis — overthinking every option',
];

// ---------------------------------------------------------------------------
// Auth Tokens (mock)
// ---------------------------------------------------------------------------
export const mockToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3JfMDAxIiwiZW1haWwiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsImlhdCI6MTcxODg4MDAwMH0.mock_signature';

// ---------------------------------------------------------------------------
// Duration-Aware Curriculum Variants
// ---------------------------------------------------------------------------
export const dummyCurriculum4Weeks = {
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

export const dummyCurriculum8Weeks = {
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

export const dummyCurriculum12Weeks = dummyCurriculum;

// ---------------------------------------------------------------------------
// Duration-Aware Roadmap Variants
// ---------------------------------------------------------------------------
export const dummyRoadmap4Weeks: RoadmapPhase[] = [
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

export const dummyRoadmap8Weeks: RoadmapPhase[] = [
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

export const dummyRoadmap12Weeks = dummyRoadmapPhases;
