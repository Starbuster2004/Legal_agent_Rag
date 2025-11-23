import { NewsItem, Advocate, TeamMember, FAQ } from '../types';

// Mock News Data
const NEWS_ITEMS: NewsItem[] = [
  {
    id: 'n1',
    title: "Supreme Court Rules on AI Copyright Case",
    source: "Legal Daily",
    snippet: "The apex court has delivered a landmark judgment regarding the use of copyrighted material in training artificial intelligence models...",
    content: "The Supreme Court today delivered a landmark judgment regarding the use of copyrighted material in training artificial intelligence models. In a 5-judge bench ruling, the court established that fair use doctrines must be strictly interpreted when commercial gain is involved. This sets a precedent for all future Generative AI developments within the jurisdiction.",
    published_at: new Date().toISOString(),
    tags: ["Supreme Court", "IP Law", "Technology"],
    imageUrl: "https://picsum.photos/800/400?random=1"
  },
  {
    id: 'n2',
    title: "New Environmental Compliance Standards for 2025",
    source: "Green Law Journal",
    snippet: "Industries face tighter regulations starting next quarter as the new Environmental Protection Act amendments come into force.",
    content: "Industries face tighter regulations starting next quarter as the new Environmental Protection Act amendments come into force. Key changes include mandatory real-time emission monitoring for all Tier-1 manufacturing units and stricter penalties for non-compliance.",
    published_at: new Date(Date.now() - 86400000).toISOString(),
    tags: ["Environment", "Regulatory", "Corporate"],
    imageUrl: "https://picsum.photos/800/400?random=2"
  },
  {
    id: 'n3',
    title: "Corporate Tax Structure Overhaul Proposed",
    source: "Finance & Law",
    snippet: "The Ministry of Finance has released a white paper proposing significant changes to the corporate tax structure for startups.",
    published_at: new Date(Date.now() - 172800000).toISOString(),
    tags: ["Tax", "Corporate", "Startups"],
    imageUrl: "https://picsum.photos/800/400?random=3"
  },
  {
    id: 'n4',
    title: "Bar Council Introduces Digital Filing Norms",
    source: "Advocate News",
    snippet: "All district courts to mandate e-filing for civil cases by the end of the year to reduce paper waste and improve efficiency.",
    published_at: new Date(Date.now() - 200000000).toISOString(),
    tags: ["Judiciary", "Procedure"],
    imageUrl: "https://picsum.photos/800/400?random=4"
  }
];

// Mock Advocates Data
const ADVOCATES: Advocate[] = [
  {
    id: 'a1',
    name: "Adv. Priya Sharma",
    firm: "Sharma & Associates",
    practice_areas: ["Criminal", "Family"],
    lat: 18.5204,
    lon: 73.8567,
    phone: "+91 98765 43210",
    email: "priya@sharmalegal.com",
    rating: 4.8,
    review_count: 124,
    address: "12, Law College Road, Pune",
    imageUrl: "https://picsum.photos/200/200?random=10",
    is_online: true
  },
  {
    id: 'a2',
    name: "Adv. Rajesh Verma",
    firm: "Verma Legal",
    practice_areas: ["Corporate", "IP"],
    lat: 18.5304,
    lon: 73.8467,
    phone: "+91 98765 12345",
    email: "rajesh@vermalegal.com",
    rating: 4.5,
    review_count: 89,
    address: "45, FC Road, Pune",
    imageUrl: "https://picsum.photos/200/200?random=11",
    is_online: false
  },
  {
    id: 'a3',
    name: "Adv. Sarah John",
    firm: "John & Partners",
    practice_areas: ["Property", "Civil"],
    lat: 18.5104,
    lon: 73.8667,
    phone: "+91 98765 67890",
    email: "sarah@johnpartners.com",
    rating: 4.9,
    review_count: 210,
    address: "88, MG Road, Pune",
    imageUrl: "https://picsum.photos/200/200?random=12",
    is_online: true
  },
  {
    id: 'a4',
    name: "Adv. Michael D'Souza",
    firm: "Legal Minds",
    practice_areas: ["Cyber Law", "Technology"],
    lat: 18.5504,
    lon: 73.8167,
    phone: "+91 98765 98765",
    email: "michael@legalminds.in",
    rating: 4.7,
    review_count: 56,
    address: "Baner, Pune",
    imageUrl: "https://picsum.photos/200/200?random=13",
    is_online: true
  }
];

export const MockService = {
  getNews: async (filter?: string): Promise<NewsItem[]> => {
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate latency
    if (!filter || filter === 'All') return NEWS_ITEMS;
    return NEWS_ITEMS.filter(item => item.tags.includes(filter));
  },
  
  getNewsById: async (id: string): Promise<NewsItem | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return NEWS_ITEMS.find(item => item.id === id);
  },

  getAdvocates: async (lat: number, lon: number, radius: number): Promise<Advocate[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    // Simulate distance calc logic here if needed, but returning all for demo
    // Add dummy distance property
    return ADVOCATES.map(adv => ({
        ...adv,
        distance_km: parseFloat((Math.random() * 5).toFixed(1))
    })).sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
  },

  getTeam: (): TeamMember[] => [
    { id: 't1', name: "Pravin P.", role: "Founder & Lead Engineer", bio: "Expert in RAG architectures and LegalTech innovation.", photo_url: "https://picsum.photos/200/200?random=20" },
    { id: 't2', name: "Sarah L.", role: "Legal Consultant", bio: "Senior Advocate with 15 years of experience in corporate law.", photo_url: "https://picsum.photos/200/200?random=21" },
    { id: 't3', name: "Dev M.", role: "Frontend Architect", bio: "Passionate about creating accessible and intuitive user experiences.", photo_url: "https://picsum.photos/200/200?random=22" }
  ],

  getFAQs: (): FAQ[] => [
    { q: "Is the information provided considered legal advice?", a: "No. The content provided by this AI and platform is for educational and informational purposes only. It is not a substitute for professional legal counsel." },
    { q: "How accurate is the AI summarization?", a: "Our RAG system is designed to be highly accurate by grounding answers in uploaded documents. However, errors can occur. Always verify with original sources." },
    { q: "Is my data secure?", a: "Yes. We use enterprise-grade encryption for all document uploads and queries. We do not share your data with third parties without consent." }
  ]
};