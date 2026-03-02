// Mock data for development. Replace with real API calls when backend is ready.

export const mockAbout = {
  content: `> cat about_bhavil.txt

BHAVIL AHUJA
Software Engineer | Systems Architect

Mission: Engineering scalable systems beyond Earth's orbit.

Specializing in distributed systems, high-throughput platforms,
and developer experience. Passionate about clean architecture
and performance at scale.

Current focus: Commerce platforms, real-time systems, and
building tools that empower engineering teams.`,
}

export const mockExperience = [
  {
    id: '1',
    mission: 'Walmart Commerce Platform',
    status: 'ACTIVE',
    role: 'Software Engineer',
    period: 'Present',
    impact: 'Large-scale distributed commerce optimization. Real-time inventory and order systems.',
  },
  {
    id: '2',
    mission: 'Previous Mission Alpha',
    status: 'COMPLETED',
    role: 'Senior Developer',
    period: '2020 – 2022',
    impact: 'Led backend services and API design for high-traffic applications.',
  },
  {
    id: '3',
    mission: 'Mission Beta',
    status: 'COMPLETED',
    role: 'Full Stack Engineer',
    period: '2018 – 2020',
    impact: 'Built and maintained customer-facing and internal tooling.',
  },
]

export const mockProjects = [
  {
    id: '1',
    title: 'Orbit OS',
    flagship: true,
    status: 'OPERATIONAL',
    type: 'Console / Portfolio',
    role: 'Full Stack',
    scale: 'Production',
    missionObjective: 'Interactive spacecraft-style developer portfolio and system console for identity and project deployment.',
    impact: [
      'Real-time 3D starfield and section-aware environment',
      'Cinematic boot sequence and module activation transitions',
      'Unified scroll-snap console with spatial section feedback',
    ],
    techStack: ['React', 'Three.js', 'Framer Motion', 'TailwindCSS', 'Zustand'],
    githubUrl: '#',
    liveUrl: '#',
    architectureOverview: 'Single-page React app with a landing (boot sequence) and a scroll-snap console. SpaceBackground (Three.js) and EclipseCore provide environment; Zustand drives boot and section state. Section changes trigger parallax, focus overlay, and starfield response.',
    designDecisions: [
      'Scroll-snap proximity (not mandatory) so users can scroll freely between sections.',
      'Section-based environmental response (camera, nebula, focus) to reinforce module switching.',
      'Terminal and mission-log language (boot lines, IMPACT bullets, STATUS) for system realism.',
    ],
    technicalChallenges: [
      'Balancing 3D starfield performance with section-triggered effects (drift, speed) without layout thrash.',
      'Keeping all motion to transform/opacity for 60fps and avoiding heavy filters.',
    ],
    screenshots: [],
  },
  {
    id: '2',
    title: 'Distributed Task Queue',
    flagship: false,
    status: 'OPERATIONAL',
    type: 'Backend Service',
    role: 'Backend Lead',
    scale: 'Production',
    missionObjective: 'High-throughput job queue with priority, retries, and dead-letter handling for production workloads.',
    impact: [
      'Sub-millisecond job dispatch with Redis-backed queue',
      'Horizontal scaling and observability integration',
      'At-least-once delivery with configurable retries',
    ],
    techStack: ['Node.js', 'Redis', 'PostgreSQL', 'Docker'],
    githubUrl: '#',
    liveUrl: '#',
    architectureOverview: 'Worker-pool architecture with Redis as the queue store and PostgreSQL for job metadata and dead-letter. Producers push to Redis; workers poll and claim jobs with Lua scripts for atomicity.',
    designDecisions: [
      'Redis for speed and simplicity; PostgreSQL for durability and queryability of job history.',
      'Priority levels and per-queue retry/backoff configuration.',
    ],
    technicalChallenges: [
      'Avoiding thundering herd when many workers wake on new jobs; solved with randomized backoff and batching.',
    ],
    screenshots: [],
  },
  {
    id: '3',
    title: 'API Gateway',
    flagship: false,
    status: 'OPERATIONAL',
    type: 'Infrastructure',
    role: 'Systems',
    scale: 'Production',
    missionObjective: 'Custom API gateway with rate limiting, authentication, and full observability.',
    impact: [
      'Centralized auth and rate limiting at edge',
      'gRPC and REST routing with metrics export',
      'Kubernetes-native deployment and scaling',
    ],
    techStack: ['Go', 'gRPC', 'Prometheus', 'Kubernetes'],
    githubUrl: '#',
    liveUrl: '#',
    architectureOverview: 'Go service sitting in front of backend APIs. Handles TLS, JWT validation, rate limiting (token bucket), and routing to gRPC or REST backends. Metrics exported to Prometheus.',
    designDecisions: [
      'Go for low latency and small binaries; gRPC for internal service-to-service calls.',
      'Rate limits applied per client and per route with configurable quotas.',
    ],
    technicalChallenges: [
      'Unifying gRPC and REST in one gateway while keeping a single metrics and auth model.',
    ],
    screenshots: [],
  },
]

export const mockPublications = [
  {
    id: '1',
    title: 'Example Publication Title',
    authors: 'B. Ahuja et al.',
    venue: 'Conference or Journal Name',
    year: '2024',
    url: '#',
    description: 'Brief summary or abstract of the publication.',
  },
]

export const mockSkills = [
  { id: '1', name: 'React', category: 'Frontend' },
  { id: '2', name: 'Node.js', category: 'Backend' },
  { id: '3', name: 'TypeScript', category: 'Language' },
  { id: '4', name: 'PostgreSQL', category: 'Data' },
  { id: '5', name: 'Redis', category: 'Data' },
  { id: '6', name: 'Docker', category: 'DevOps' },
  { id: '7', name: 'Kubernetes', category: 'DevOps' },
  { id: '8', name: 'Three.js', category: 'Frontend' },
  { id: '9', name: 'GraphQL', category: 'Backend' },
  { id: '10', name: 'Go', category: 'Language' },
]

export const mockResume = {
  viewUrl: 'https://example.com/resume.pdf',
  downloadUrl: 'https://example.com/resume.pdf',
  terminalData: {
    name: 'BHAVIL AHUJA',
    title: 'Software Engineer · Systems & Full-Stack',
    sections: [
      { title: 'EXPERIENCE', lines: ['Senior Engineer · Company · 2022–Present', 'Engineer · Company · 2020–2022', 'Associate · Company · 2018–2020'] },
      { title: 'EDUCATION', lines: ['Degree · Institution · Year'] },
      { title: 'TECHNICAL', lines: ['Languages: JavaScript, TypeScript, Python, Go', 'Systems: Distributed systems, APIs, Databases', 'Frontend: React, Three.js · Backend: Node, Go'] },
    ],
  },
}

export const mockLanding = {
  name: 'BHAVIL AHUJA',
  tagline: 'Engineering scalable systems beyond Earth\'s orbit',
  bootLines: [
    'Initializing Orbit OS...',
    'Authenticating Visitor...',
    'Access Granted',
  ],
}
