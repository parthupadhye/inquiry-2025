// =============================================================================
// Inquiry Framework - Test Seed Data
// Description: Sample data for testing and development
// =============================================================================

// -----------------------------------------------------------------------------
// SOURCES
// -----------------------------------------------------------------------------

// Academic source
CREATE (s1:Source {
  id: 'src-001-academic',
  name: 'Journal of Fact-Checking Studies',
  type: 'academic',
  url: 'https://example.com/journal-fcs',
  description: 'Peer-reviewed journal on fact-checking methodologies',
  credibilityScore: 0.92,
  reliability: 'very_high',
  biasScore: 0.05,
  biasDirection: 'neutral',
  citationCount: 0,
  verifiedCount: 0,
  falseCount: 0,
  lastVerified: null,
  domain: 'fact-checking',
  region: 'global',
  language: 'en',
  isActive: true,
  metadata: null,
  createdAt: datetime(),
  updatedAt: datetime(),
  deletedAt: null
});

// News source
CREATE (s2:Source {
  id: 'src-002-news',
  name: 'The Daily Observer',
  type: 'news',
  url: 'https://example.com/daily-observer',
  description: 'Major metropolitan newspaper with fact-checking team',
  credibilityScore: 0.78,
  reliability: 'high',
  biasScore: -0.15,
  biasDirection: 'center-left',
  citationCount: 0,
  verifiedCount: 0,
  falseCount: 0,
  lastVerified: null,
  domain: 'news',
  region: 'US',
  language: 'en',
  isActive: true,
  metadata: null,
  createdAt: datetime(),
  updatedAt: datetime(),
  deletedAt: null
});

// Official source
CREATE (s3:Source {
  id: 'src-003-official',
  name: 'National Statistics Bureau',
  type: 'official',
  url: 'https://example.gov/statistics',
  description: 'Government statistical agency',
  credibilityScore: 0.95,
  reliability: 'very_high',
  biasScore: 0.0,
  biasDirection: null,
  citationCount: 0,
  verifiedCount: 0,
  falseCount: 0,
  lastVerified: null,
  domain: 'statistics',
  region: 'US',
  language: 'en',
  isActive: true,
  metadata: null,
  createdAt: datetime(),
  updatedAt: datetime(),
  deletedAt: null
});

// Social media source (lower credibility)
CREATE (s4:Source {
  id: 'src-004-social',
  name: '@ViralNewsAccount',
  type: 'social_media',
  url: 'https://social.example.com/viralnews',
  description: 'Popular social media account sharing news',
  credibilityScore: 0.35,
  reliability: 'low',
  biasScore: 0.4,
  biasDirection: 'sensationalist',
  citationCount: 0,
  verifiedCount: 0,
  falseCount: 0,
  lastVerified: null,
  domain: 'social_media',
  region: 'global',
  language: 'en',
  isActive: true,
  metadata: null,
  createdAt: datetime(),
  updatedAt: datetime(),
  deletedAt: null
});

// -----------------------------------------------------------------------------
// CLAIMS
// -----------------------------------------------------------------------------

// Verified true claim
CREATE (c1:Claim {
  id: 'clm-001-verified',
  text: 'The unemployment rate decreased by 0.3% in Q3 2024',
  normalizedText: 'unemployment rate decreased 0.3 percent q3 2024',
  status: 'verified_true',
  confidence: 'very_high',
  confidenceScore: 0.95,
  category: 'economics',
  tags: ['unemployment', 'statistics', 'economy'],
  originalSource: 'National Statistics Bureau press release',
  claimDate: '2024-10-15',
  claimant: 'National Statistics Bureau',
  priority: 3,
  createdBy: 'extraction-agent',
  metadata: null,
  createdAt: datetime(),
  updatedAt: datetime(),
  deletedAt: null
});

// Unverified claim
CREATE (c2:Claim {
  id: 'clm-002-unverified',
  text: 'A new study shows that coffee consumption reduces heart disease risk by 25%',
  normalizedText: 'study coffee consumption reduces heart disease risk 25 percent',
  status: 'unverified',
  confidence: null,
  confidenceScore: null,
  category: 'health',
  tags: ['coffee', 'health', 'heart disease', 'research'],
  originalSource: 'The Daily Observer article',
  claimDate: '2024-11-01',
  claimant: null,
  priority: 2,
  createdBy: 'extraction-agent',
  metadata: null,
  createdAt: datetime(),
  updatedAt: datetime(),
  deletedAt: null
});

// Verified false claim
CREATE (c3:Claim {
  id: 'clm-003-false',
  text: 'Scientists have discovered a cure for all forms of cancer',
  normalizedText: 'scientists discovered cure all cancer',
  status: 'verified_false',
  confidence: 'very_high',
  confidenceScore: 0.98,
  category: 'health',
  tags: ['cancer', 'medicine', 'misinformation'],
  originalSource: 'Viral social media post',
  claimDate: '2024-10-20',
  claimant: '@ViralNewsAccount',
  priority: 5,
  createdBy: 'extraction-agent',
  metadata: null,
  createdAt: datetime(),
  updatedAt: datetime(),
  deletedAt: null
});

// In-progress claim
CREATE (c4:Claim {
  id: 'clm-004-inprogress',
  text: 'The city council approved a $50 million infrastructure budget',
  normalizedText: 'city council approved 50 million infrastructure budget',
  status: 'in_progress',
  confidence: null,
  confidenceScore: null,
  category: 'politics',
  tags: ['local government', 'budget', 'infrastructure'],
  originalSource: 'Local news report',
  claimDate: '2024-11-10',
  claimant: 'City Council spokesperson',
  priority: 3,
  createdBy: 'extraction-agent',
  metadata: null,
  createdAt: datetime(),
  updatedAt: datetime(),
  deletedAt: null
});

// Partially true claim
CREATE (c5:Claim {
  id: 'clm-005-partial',
  text: 'Electric vehicles now outsell gas cars in Europe',
  normalizedText: 'electric vehicles outsell gas cars europe',
  status: 'partially_true',
  confidence: 'medium',
  confidenceScore: 0.65,
  category: 'technology',
  tags: ['electric vehicles', 'automotive', 'europe'],
  originalSource: 'Industry publication',
  claimDate: '2024-10-28',
  claimant: null,
  priority: 2,
  createdBy: 'extraction-agent',
  metadata: '{"note": "True for some countries, not all of Europe"}',
  createdAt: datetime(),
  updatedAt: datetime(),
  deletedAt: null
});

// -----------------------------------------------------------------------------
// EVIDENCE
// -----------------------------------------------------------------------------

// Supporting evidence for claim 1
CREATE (e1:Evidence {
  id: 'evd-001-supporting',
  content: 'Official government statistics report showing quarterly unemployment figures with methodology documentation',
  summary: 'Q3 2024 unemployment report from National Statistics Bureau',
  type: 'supporting',
  strength: 0.95,
  relevance: 1.0,
  quality: 0.98,
  collectedAt: datetime(),
  sourceUrl: 'https://example.gov/statistics/q3-2024-employment',
  sourceLocation: 'Page 12, Table 3',
  excerpt: 'The seasonally adjusted unemployment rate fell from 4.2% to 3.9%, representing a 0.3 percentage point decrease.',
  isVerified: true,
  collectedBy: 'research-agent',
  collectionMethod: 'direct_retrieval',
  metadata: null,
  createdAt: datetime(),
  updatedAt: datetime(),
  deletedAt: null
});

// Refuting evidence for claim 3
CREATE (e2:Evidence {
  id: 'evd-002-refuting',
  content: 'Statement from major cancer research organizations confirming no universal cancer cure exists',
  summary: 'Expert consensus on cancer treatment state',
  type: 'refuting',
  strength: 0.98,
  relevance: 1.0,
  quality: 0.95,
  collectedAt: datetime(),
  sourceUrl: 'https://example.org/cancer-research/fact-check',
  sourceLocation: 'Main article',
  excerpt: 'While significant advances have been made in cancer treatment, no single cure for all cancers exists or is imminent.',
  isVerified: true,
  collectedBy: 'research-agent',
  collectionMethod: 'expert_consultation',
  metadata: null,
  createdAt: datetime(),
  updatedAt: datetime(),
  deletedAt: null
});

// Contextual evidence for claim 5
CREATE (e3:Evidence {
  id: 'evd-003-contextual',
  content: 'EV sales data varies significantly across European countries, with Norway at 80% but Poland at only 5%',
  summary: 'Regional variation in European EV adoption',
  type: 'contextual',
  strength: 0.75,
  relevance: 0.9,
  quality: 0.85,
  collectedAt: datetime(),
  sourceUrl: 'https://example.eu/automotive-statistics',
  sourceLocation: 'Country comparison table',
  excerpt: 'EV market share ranges from 5% in Eastern Europe to over 80% in Scandinavian countries.',
  isVerified: true,
  collectedBy: 'research-agent',
  collectionMethod: 'database_query',
  metadata: null,
  createdAt: datetime(),
  updatedAt: datetime(),
  deletedAt: null
});

// Pending verification evidence
CREATE (e4:Evidence {
  id: 'evd-004-pending',
  content: 'City council meeting minutes mentioning infrastructure budget discussion',
  summary: 'Council meeting notes on budget',
  type: 'supporting',
  strength: 0.6,
  relevance: 0.85,
  quality: 0.7,
  collectedAt: datetime(),
  sourceUrl: 'https://city.example.gov/council/minutes/2024-11',
  sourceLocation: 'Agenda item 7',
  excerpt: 'Motion to approve infrastructure allocation of $50M was discussed.',
  isVerified: false,
  collectedBy: 'research-agent',
  collectionMethod: 'document_scraping',
  metadata: '{"note": "Awaiting official vote confirmation"}',
  createdAt: datetime(),
  updatedAt: datetime(),
  deletedAt: null
});

// -----------------------------------------------------------------------------
// CONTENT
// -----------------------------------------------------------------------------

// Fact-check report
CREATE (ct1:Content {
  id: 'cnt-001-report',
  title: 'Q3 2024 Economic Claims Fact Check',
  body: 'This report examines claims about economic indicators from Q3 2024, with a focus on unemployment statistics and their accuracy.',
  type: 'fact_check',
  summary: 'Verification of economic claims from Q3 2024',
  status: 'published',
  version: 1,
  wordCount: 2500,
  author: 'fact-check-team',
  reviewer: 'editor-01',
  publishedAt: datetime(),
  audience: 'general public',
  classification: 'public',
  tags: ['economics', 'q3-2024', 'fact-check'],
  metadata: null,
  createdAt: datetime(),
  updatedAt: datetime(),
  deletedAt: null
});

// Analysis brief
CREATE (ct2:Content {
  id: 'cnt-002-analysis',
  title: 'Health Misinformation Trends Analysis',
  body: 'An analysis of health-related misinformation spreading on social media platforms during October 2024.',
  type: 'analysis',
  summary: 'Monthly health misinformation report',
  status: 'review',
  version: 2,
  wordCount: 4200,
  author: 'analysis-agent',
  reviewer: null,
  publishedAt: null,
  audience: 'researchers',
  classification: 'internal',
  tags: ['health', 'misinformation', 'social-media', 'monthly-report'],
  metadata: null,
  createdAt: datetime(),
  updatedAt: datetime(),
  deletedAt: null
});

// Draft summary
CREATE (ct3:Content {
  id: 'cnt-003-draft',
  title: 'European EV Market Summary',
  body: 'Draft summary of electric vehicle adoption trends across European markets.',
  type: 'summary',
  summary: null,
  status: 'draft',
  version: 1,
  wordCount: 800,
  author: 'research-agent',
  reviewer: null,
  publishedAt: null,
  audience: 'analysts',
  classification: 'internal',
  tags: ['ev', 'automotive', 'europe'],
  metadata: null,
  createdAt: datetime(),
  updatedAt: datetime(),
  deletedAt: null
});

// -----------------------------------------------------------------------------
// RELATIONSHIPS
// -----------------------------------------------------------------------------

// Content contains claims
MATCH (ct1:Content {id: 'cnt-001-report'}), (c1:Claim {id: 'clm-001-verified'})
CREATE (ct1)-[:CONTAINS_CLAIM {
  position: 1,
  section: 'Unemployment Statistics',
  isExplicit: true,
  extractionConfidence: 0.95,
  extractionMethod: 'manual',
  createdAt: datetime(),
  createdBy: 'extraction-agent',
  notes: null
}]->(c1);

MATCH (ct2:Content {id: 'cnt-002-analysis'}), (c3:Claim {id: 'clm-003-false'})
CREATE (ct2)-[:CONTAINS_CLAIM {
  position: 1,
  section: 'Case Study: Cancer Cure Misinformation',
  isExplicit: true,
  extractionConfidence: 0.98,
  extractionMethod: 'automated',
  createdAt: datetime(),
  createdBy: 'extraction-agent',
  notes: 'Primary example of health misinformation'
}]->(c3);

MATCH (ct3:Content {id: 'cnt-003-draft'}), (c5:Claim {id: 'clm-005-partial'})
CREATE (ct3)-[:CONTAINS_CLAIM {
  position: 1,
  section: 'Market Overview',
  isExplicit: true,
  extractionConfidence: 0.85,
  extractionMethod: 'automated',
  createdAt: datetime(),
  createdBy: 'extraction-agent',
  notes: null
}]->(c5);

// Claims supported by evidence
MATCH (c1:Claim {id: 'clm-001-verified'}), (e1:Evidence {id: 'evd-001-supporting'})
CREATE (c1)-[:SUPPORTED_BY {
  strength: 0.95,
  relevance: 1.0,
  aspect: 'unemployment rate decrease',
  isDirect: true,
  reasoning: 'Official government data directly confirms the claim',
  createdAt: datetime(),
  createdBy: 'verification-agent',
  notes: null
}]->(e1);

MATCH (c4:Claim {id: 'clm-004-inprogress'}), (e4:Evidence {id: 'evd-004-pending'})
CREATE (c4)-[:SUPPORTED_BY {
  strength: 0.6,
  relevance: 0.85,
  aspect: 'budget amount',
  isDirect: false,
  reasoning: 'Meeting minutes reference the budget but not final vote',
  createdAt: datetime(),
  createdBy: 'verification-agent',
  notes: 'Pending final confirmation'
}]->(e4);

// Claims refuted by evidence
MATCH (c3:Claim {id: 'clm-003-false'}), (e2:Evidence {id: 'evd-002-refuting'})
CREATE (c3)-[:REFUTED_BY {
  strength: 0.98,
  relevance: 1.0,
  aspect: 'existence of universal cancer cure',
  isDirect: true,
  reasoning: 'Expert consensus from major research organizations',
  createdAt: datetime(),
  createdBy: 'verification-agent',
  notes: null
}]->(e2);

// Evidence derived from sources
MATCH (e1:Evidence {id: 'evd-001-supporting'}), (s3:Source {id: 'src-003-official'})
CREATE (e1)-[:DERIVED_FROM {
  derivedAt: datetime(),
  sourceLocation: 'Q3 2024 Employment Report, Page 12',
  quote: 'The seasonally adjusted unemployment rate fell from 4.2% to 3.9%',
  accessedAt: datetime(),
  isDirect: true,
  transformation: null,
  createdAt: datetime(),
  createdBy: 'research-agent',
  notes: null
}]->(s3);

MATCH (e2:Evidence {id: 'evd-002-refuting'}), (s1:Source {id: 'src-001-academic'})
CREATE (e2)-[:DERIVED_FROM {
  derivedAt: datetime(),
  sourceLocation: 'Fact-check article',
  quote: null,
  accessedAt: datetime(),
  isDirect: true,
  transformation: null,
  createdAt: datetime(),
  createdBy: 'research-agent',
  notes: null
}]->(s1);

// Claims derived from sources
MATCH (c3:Claim {id: 'clm-003-false'}), (s4:Source {id: 'src-004-social'})
CREATE (c3)-[:DERIVED_FROM {
  derivedAt: datetime(),
  sourceLocation: 'Social media post',
  quote: 'BREAKING: Scientists have discovered a cure for all forms of cancer!',
  accessedAt: datetime(),
  isDirect: true,
  transformation: null,
  createdAt: datetime(),
  createdBy: 'extraction-agent',
  notes: 'Original viral post'
}]->(s4);

// Content cites sources
MATCH (ct1:Content {id: 'cnt-001-report'}), (s3:Source {id: 'src-003-official'})
CREATE (ct1)-[:CITES {
  citationStyle: 'APA',
  citationText: 'National Statistics Bureau. (2024). Q3 Employment Report.',
  referenceNumber: 1,
  purpose: 'support',
  createdAt: datetime(),
  createdBy: 'author-agent',
  notes: null
}]->(s3);

// Related claims
MATCH (c1:Claim {id: 'clm-001-verified'}), (c4:Claim {id: 'clm-004-inprogress'})
CREATE (c1)-[:RELATED_TO {
  relationType: 'broader',
  strength: 0.4,
  similarity: 0.3,
  explanation: 'Both relate to economic/government statistics',
  createdAt: datetime(),
  createdBy: 'analysis-agent',
  notes: null
}]->(c4);

// Contextual evidence for partial claim
MATCH (c5:Claim {id: 'clm-005-partial'}), (e3:Evidence {id: 'evd-003-contextual'})
CREATE (c5)-[:SUPPORTED_BY {
  strength: 0.75,
  relevance: 0.9,
  aspect: 'regional variation context',
  isDirect: false,
  reasoning: 'Provides context for why claim is only partially true',
  createdAt: datetime(),
  createdBy: 'verification-agent',
  notes: 'Explains regional variation'
}]->(e3);

// -----------------------------------------------------------------------------
// UPDATE SOURCE CITATION COUNTS
// -----------------------------------------------------------------------------

MATCH (s:Source)<-[:DERIVED_FROM|CITES]-()
WITH s, count(*) as citations
SET s.citationCount = citations;

// -----------------------------------------------------------------------------
// VERIFICATION QUERY
// -----------------------------------------------------------------------------

// Return summary of seeded data
MATCH (n)
RETURN labels(n)[0] as NodeType, count(n) as Count
ORDER BY NodeType;
