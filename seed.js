require('dotenv').config();
const mongoose = require('mongoose');

const PlaybookSection = require('./models/PlaybookSection');
const Category = require('./models/Category');
const Checklist = require('./models/Checklist');
const ServiceProvider = require('./models/ServiceProvider');

const sections = [
  {
    title: 'Business Setup in Kuwait',
    slug: 'business-setup',
    icon: 'Building',
    order: 1,
    status: 'published',
    content: `## Getting Started with Business Registration

Setting up a business in Kuwait requires understanding the legal framework and registration process.

### Types of Business Entities

- **Sole Proprietorship (Individual Establishment)** - Simplest form, 100% ownership for Kuwaitis
- **Limited Liability Company (WLL)** - Most common, requires Kuwaiti partner (51%)
- **Shareholding Company** - For larger enterprises
- **Foreign Branch** - For international companies

### Registration Steps

1. Choose your business activity and legal structure
2. Reserve a trade name at the Ministry of Commerce
3. Obtain initial approval from relevant authorities
4. Draft Articles of Association (for companies)
5. Deposit capital at a local bank
6. Register with the Commercial Registry
7. Obtain municipal license
8. Register with PACI and social security

:::tip
Start the process early - registration can take 2-4 weeks depending on your business type.
:::

### Costs to Expect

- Trade name reservation: 5-10 KWD
- Commercial registration: 100-300 KWD
- Municipal license: varies by activity
- Professional fees: 500-2000 KWD

:::warning
Always verify current fees with official sources as they may change.
:::`
  },
  {
    title: 'Branding & Identity Resources',
    slug: 'branding-identity',
    icon: 'Palette',
    order: 2,
    status: 'published',
    content: `## Building Your Brand in Kuwait

Your brand is more than a logo - it's how customers perceive and remember you.

### Essential Brand Elements

- **Business Name** - Arabic and English versions
- **Logo** - Works in color and black/white
- **Color Palette** - 2-3 primary colors
- **Typography** - Bilingual font pairing
- **Brand Voice** - How you communicate

### Naming Considerations

- Check availability in Commercial Registry
- Ensure Arabic translation works well
- Verify domain and social media availability
- Consider cultural sensitivities

### Working with Designers

When hiring a designer in Kuwait, expect:
- Logo design: 150-1500 KWD
- Full brand identity: 500-5000 KWD
- Timeline: 2-6 weeks

:::tip
Get your brand assets in multiple formats (AI, PNG, SVG) for different uses.
:::`
  },
  {
    title: 'Digital & Tech Guidance',
    slug: 'digital-tech',
    icon: 'Monitor',
    order: 3,
    status: 'published',
    content: `## Technology Stack for Kuwait Startups

Building your digital presence and choosing the right tools.

### Website Essentials

- **Domain**: Get .com and .kw versions
- **Hosting**: Consider regional servers for speed
- **SSL Certificate**: Required for trust and SEO
- **Bilingual Support**: Arabic RTL design

### Recommended Tech Stack

**For E-commerce:**
- Shopify (easiest) or WooCommerce (more control)
- Payment: KNET integration, Tap Payments, MyFatoorah

**For Services:**
- WordPress or custom React/Next.js
- Booking: Calendly, Cal.com

### Local Considerations

- KNET is essential for local payments
- Arabic language support is expected
- Mobile-first design (80%+ mobile traffic)

:::note
Many Kuwaiti customers prefer WhatsApp for communication over email.
:::`
  },
  {
    title: 'Marketing & Growth',
    slug: 'marketing-growth',
    icon: 'TrendingUp',
    order: 4,
    status: 'published',
    content: `## Marketing in Kuwait

Understanding the local market and effective channels.

### Top Marketing Channels

1. **Instagram** - Primary platform, high engagement
2. **Snapchat** - Very popular in Kuwait
3. **TikTok** - Growing rapidly
4. **WhatsApp** - Customer service and sales
5. **Google Ads** - Search and display

### Content Strategy

- Bilingual content (Arabic performs better)
- Local cultural references
- Influencer partnerships
- User-generated content

### Influencer Marketing

Kuwait has a strong influencer culture:
- Micro (5-50K): 50-200 KWD per post
- Mid (50-200K): 200-800 KWD per post
- Macro (200K+): 800-5000 KWD per post

:::tip
Focus on engagement rate over follower count when choosing influencers.
:::`
  },
  {
    title: 'Offices, Workspaces & Logistics',
    slug: 'offices-logistics',
    icon: 'MapPin',
    order: 5,
    status: 'published',
    content: `## Finding Your Workspace

Options for setting up your physical presence in Kuwait.

### Workspace Options

**Virtual Office**
- Address for registration: 50-150 KWD/month
- Good for starting out

**Co-working Space**
- Hot desk: 75-150 KWD/month
- Dedicated desk: 150-300 KWD/month
- Private office: 300-800 KWD/month

**Traditional Office**
- Small office (20-50 sqm): 300-800 KWD/month
- Depends heavily on location

### Popular Areas

- **Kuwait City** - Traditional business district
- **Sharq** - Premium location
- **Salmiya** - Commercial hub
- **Hawally** - More affordable

### Logistics Providers

For e-commerce fulfillment:
- Aramex
- DHL
- Fetchr
- Local couriers

:::warning
Factor in parking availability when choosing a location - it's often overlooked.
:::`
  },
  {
    title: 'Hiring & Employees in Kuwait',
    slug: 'hiring-employees',
    icon: 'Users',
    order: 6,
    status: 'published',
    content: `## Building Your Team

Understanding Kuwait's labor market and regulations.

### Hiring Options

- **Kuwaiti Nationals** - Required quotas for some businesses
- **Expat Workers** - Require visa sponsorship
- **Freelancers** - Limited legal framework
- **Remote Workers** - Growing option

### Visa & Work Permits

To hire an expat:
1. Company must be registered and licensed
2. Apply for work permit at PAM
3. Medical examination required
4. Residency visa processing
5. Civil ID issuance

Timeline: 4-8 weeks typically
Cost: 300-600 KWD total

### Salary Expectations (Monthly)

- Entry-level admin: 250-400 KWD
- Marketing coordinator: 400-700 KWD
- Developer: 600-1500 KWD
- Manager: 800-2000 KWD

:::note
Salaries vary significantly by nationality and experience - these are general ranges.
:::`
  },
  {
    title: 'Operations & Founder Tool Stack',
    slug: 'operations-tools',
    icon: 'Settings',
    order: 7,
    status: 'published',
    content: `## Essential Tools for Kuwait Founders

Software and systems to run your business efficiently.

### Communication
- **Slack** or **Microsoft Teams** - Team chat
- **WhatsApp Business** - Customer communication
- **Zoom** - Video meetings

### Finance & Accounting
- **Zoho Books** - Popular in Kuwait
- **QuickBooks** - International standard
- **Wafeq** - Arabic-first accounting

### Project Management
- **Notion** - All-in-one workspace
- **Trello** - Simple boards
- **Asana** - Task management

### Customer Management
- **HubSpot** - Free CRM
- **Zoho CRM** - Affordable option

### Design & Content
- **Canva** - Quick graphics
- **Figma** - UI/UX design

### Payments
- **Tap Payments** - Easy integration
- **MyFatoorah** - Multiple options
- **Upayments** - Local provider

:::tip
Start with free tiers and upgrade as you grow - avoid over-investing in tools early.
:::`
  },
  {
    title: 'Sample Budgets',
    slug: 'sample-budgets',
    icon: 'Calculator',
    order: 8,
    status: 'published',
    content: `## Startup Budget Examples

Real cost breakdowns for different business types.

### E-commerce Store (First Year)

**Setup Costs:**
- Business registration: 500 KWD
- Branding & logo: 300 KWD
- Website development: 800 KWD
- Initial inventory: 2000 KWD
- **Total Setup: ~3,600 KWD**

**Monthly Costs:**
- Virtual office: 100 KWD
- Marketing: 300 KWD
- Payment processing: Variable
- Tools & software: 50 KWD
- **Monthly: ~450 KWD**

### Service Business (First Year)

**Setup Costs:**
- Business registration: 500 KWD
- Branding: 400 KWD
- Website: 500 KWD
- Equipment: 500 KWD
- **Total Setup: ~1,900 KWD**

**Monthly Costs:**
- Co-working space: 200 KWD
- Marketing: 200 KWD
- Tools: 50 KWD
- **Monthly: ~450 KWD**

:::warning
Always keep 3-6 months of runway in reserve for unexpected costs.
:::`
  },
  {
    title: 'Common Mistakes',
    slug: 'common-mistakes',
    icon: 'AlertTriangle',
    order: 9,
    status: 'published',
    content: `## Mistakes to Avoid

Learn from others' experiences.

### Business Setup Mistakes

- **Wrong business activity** - Choosing too narrow or wrong category
- **Skipping legal agreements** - Partner disputes without contracts
- **Ignoring Kuwaitization** - Not planning for quota requirements
- **Underestimating timeline** - Registration takes longer than expected

### Financial Mistakes

- **No separate accounts** - Mixing personal and business finances
- **Ignoring taxes** - Yes, there are still obligations
- **Overspending on office** - Ego over practicality
- **No emergency fund** - Cash flow problems

### Marketing Mistakes

- **English-only marketing** - Missing the Arabic audience
- **Ignoring Instagram** - It's where customers are
- **No customer service plan** - Slow responses hurt reputation

### Operational Mistakes

- **Hiring too fast** - Adding overhead before revenue
- **No systems** - Everything depends on you
- **Ignoring contracts** - Verbal agreements fail

:::tip
Most successful founders made these mistakes too - the key is recognizing and fixing them quickly.
:::`
  },
  {
    title: 'Checklists & Action Plans',
    slug: 'checklists-action',
    icon: 'CheckSquare',
    order: 10,
    status: 'published',
    content: `## Your Action Plans

Use the interactive checklists in the Checklists section to track your progress.

### Available Checklists

1. **Business Setup Checklist** - Registration and legal steps
2. **Branding Checklist** - Logo, name, identity essentials
3. **Hiring Checklist** - First employee process
4. **First 90 Days Checklist** - Priority actions

### How to Use

- Check off items as you complete them
- Your progress is saved automatically
- Reset anytime to start fresh
- Print for offline reference

### Recommended Order

**Week 1-2:** Business registration research
**Week 3-4:** Legal setup and registration
**Month 2:** Branding and digital presence
**Month 3:** Launch and first marketing

:::note
Go to the Checklists page to start tracking your progress!
:::`
  }
];

const categories = [
  { name: 'Branding', slug: 'branding', order: 1 },
  { name: 'Tech', slug: 'tech', order: 2 },
  { name: 'Legal & Accounting', slug: 'legal-accounting', order: 3 },
  { name: 'Marketing', slug: 'marketing', order: 4 },
  { name: 'Offices & Logistics', slug: 'offices-logistics', order: 5 },
  { name: 'Hiring & Recruitment', slug: 'hiring-recruitment', order: 6 }
];

const checklists = [
  {
    title: 'Business Setup Checklist',
    slug: 'business-setup',
    order: 1,
    items: [
      { text: 'Decide on business structure (sole proprietorship, WLL, etc.)', order: 0 },
      { text: 'Choose and reserve trade name at Ministry of Commerce', order: 1 },
      { text: 'Find a Kuwaiti partner if required (for WLL)', order: 2 },
      { text: 'Draft partnership agreement with lawyer', order: 3 },
      { text: 'Prepare required documents (civil ID, passport copies)', order: 4 },
      { text: 'Open corporate bank account', order: 5 },
      { text: 'Deposit minimum capital requirement', order: 6 },
      { text: 'Submit commercial registration application', order: 7 },
      { text: 'Obtain municipal license', order: 8 },
      { text: 'Register with PACI', order: 9 },
      { text: 'Set up accounting system', order: 10 }
    ]
  },
  {
    title: 'Branding Checklist',
    slug: 'branding',
    order: 2,
    items: [
      { text: 'Define your target audience', order: 0 },
      { text: 'Research competitor brands', order: 1 },
      { text: 'Choose business name (Arabic and English)', order: 2 },
      { text: 'Check domain availability', order: 3 },
      { text: 'Check social media handle availability', order: 4 },
      { text: 'Design or commission logo', order: 5 },
      { text: 'Choose brand colors and fonts', order: 6 },
      { text: 'Create brand guidelines document', order: 7 },
      { text: 'Design business cards', order: 8 },
      { text: 'Set up social media profiles', order: 9 }
    ]
  },
  {
    title: 'Hiring First Employee Checklist',
    slug: 'hiring',
    order: 3,
    items: [
      { text: 'Define role and responsibilities', order: 0 },
      { text: 'Set salary range and benefits', order: 1 },
      { text: 'Post job on relevant platforms', order: 2 },
      { text: 'Review applications and shortlist', order: 3 },
      { text: 'Conduct interviews', order: 4 },
      { text: 'Check references', order: 5 },
      { text: 'Make offer and negotiate', order: 6 },
      { text: 'Prepare employment contract', order: 7 },
      { text: 'Apply for work permit (if expat)', order: 8 },
      { text: 'Complete onboarding process', order: 9 },
      { text: 'Register with social security', order: 10 }
    ]
  },
  {
    title: 'First 90 Days Checklist',
    slug: 'first-90-days',
    order: 4,
    items: [
      { text: 'Complete all business registration', order: 0 },
      { text: 'Set up business bank account', order: 1 },
      { text: 'Finalize branding and visual identity', order: 2 },
      { text: 'Launch website or landing page', order: 3 },
      { text: 'Set up social media presence', order: 4 },
      { text: 'Create initial content calendar', order: 5 },
      { text: 'Set up payment processing', order: 6 },
      { text: 'Launch first marketing campaign', order: 7 },
      { text: 'Get first 10 customers', order: 8 },
      { text: 'Collect and implement feedback', order: 9 },
      { text: 'Review and adjust strategy', order: 10 }
    ]
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');

    // Clear existing data
    console.log('Clearing existing data...');
    await PlaybookSection.deleteMany({});
    await Category.deleteMany({});
    await Checklist.deleteMany({});
    await ServiceProvider.deleteMany({});

    // Seed sections
    console.log('Seeding playbook sections...');
    await PlaybookSection.insertMany(sections);
    console.log(`Created ${sections.length} sections`);

    // Seed categories
    console.log('Seeding categories...');
    const createdCategories = await Category.insertMany(categories);
    console.log(`Created ${categories.length} categories`);

    // Seed checklists
    console.log('Seeding checklists...');
    await Checklist.insertMany(checklists);
    console.log(`Created ${checklists.length} checklists`);

    // Seed sample providers
    console.log('Seeding sample providers...');
    const brandingCat = createdCategories.find(c => c.slug === 'branding');
    const techCat = createdCategories.find(c => c.slug === 'tech');
    const legalCat = createdCategories.find(c => c.slug === 'legal-accounting');

    const sampleProviders = [
      {
        name: 'Brand Studio Kuwait',
        description: 'Full-service branding agency specializing in startups and SMEs. They offer logo design, brand identity, and marketing collateral.',
        category: brandingCat._id,
        priceRange: 'mid',
        bestFor: ['Startups', 'Rebranding', 'Full identity'],
        contactInstagram: 'brandstudiokw',
        practicalNotes: 'Good turnaround time, responsive on WhatsApp. Ask for their startup package.'
      },
      {
        name: 'Kuwait Web Solutions',
        description: 'Web development and e-commerce specialists. They build custom websites and Shopify stores with KNET integration.',
        category: techCat._id,
        priceRange: 'mid',
        bestFor: ['E-commerce', 'Custom websites', 'KNET integration'],
        contactWebsite: 'https://example.com',
        practicalNotes: 'Strong technical team. Best for complex projects. Get detailed scope before starting.'
      },
      {
        name: 'Al-Rashid Legal',
        description: 'Business law firm handling company formation, contracts, and commercial disputes. English and Arabic speaking lawyers.',
        category: legalCat._id,
        priceRange: 'premium',
        bestFor: ['Company formation', 'Contracts', 'Legal disputes'],
        contactWhatsApp: '+96599999999',
        practicalNotes: 'Premium pricing but thorough. Good for complex structures or foreign investors.'
      },
      {
        name: 'Quick Legal Services',
        description: 'Affordable legal services for basic company registration and PRO services.',
        category: legalCat._id,
        priceRange: 'budget',
        bestFor: ['Basic registration', 'PRO services', 'Document processing'],
        contactWhatsApp: '+96588888888',
        practicalNotes: 'Good for straightforward registrations. May need to follow up on timelines.'
      }
    ];

    await ServiceProvider.insertMany(sampleProviders);
    console.log(`Created ${sampleProviders.length} sample providers`);

    console.log('\n✅ Seed completed successfully!');
    console.log('\nYou can now run the application with: npm start');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
