export const MOCK_USERS = {
    candidate: {
        email: 'candidate@example.com',
        password: 'password123',
        name: 'John Doe',
        role: 'candidate',
    },
    recruiter: {
        email: 'recruiter@example.com',
        password: 'password123',
        name: 'Jane Smith',
        company: 'TechCorp',
        role: 'recruiter',
    }
};

export interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
    salary: string;
    description: string;
    postedDate: string;
}

export interface Candidate {
    id: string;
    name: string;
    email: string;
    role: string;
    skills: string[];
    experience: string;
    resumeToken: string; // Links to existing resume viewer
}

export interface Application {
    id: string;
    jobId: string;
    candidateId: string;
    status: 'Pending' | 'Reviewed' | 'Interviewing' | 'Rejected' | 'Hired' | 'Shortlisted' | 'Declined' | 'Interview Scheduled';
    appliedDate: string;
}

export const MOCK_JOBS: Job[] = [
    {
        id: 'j1',
        title: 'Senior React Developer',
        company: 'TechCorp',
        location: 'Remote',
        type: 'Full-time',
        salary: '$120k - $160k',
        description: 'Looking for a React expert to lead our frontend team.',
        postedDate: '2025-12-15',
    },
    {
        id: 'j2',
        title: 'UI/UX Designer',
        company: 'Creative Studio',
        location: 'New York, NY',
        type: 'Contract',
        salary: '$80/hr - $100/hr',
        description: 'Help us design the next generation of mobile apps.',
        postedDate: '2025-12-18',
    },
    {
        id: 'j3',
        title: 'Backend Engineer (Go)',
        company: 'FastData',
        location: 'Austin, TX',
        type: 'Full-time',
        salary: '$130k - $170k',
        description: 'Scale our high-concurrency Go services.',
        postedDate: '2025-12-10',
    }
];

export const MOCK_CANDIDATES: Candidate[] = [
    {
        id: 'c1',
        name: 'John Doe',
        email: 'candidate@example.com',
        role: 'Fullstack Developer',
        skills: ['React', 'Node.js', 'Go', 'Tailwind'],
        experience: '5 years',
        resumeToken: 'test-token-123',
    },
    {
        id: 'c2',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        role: 'Frontend Engineer',
        skills: ['Vue', 'CSS', 'Figma'],
        experience: '3 years',
        resumeToken: 'test-token-456',
    },
    {
        id: 'c3',
        name: 'Bob Smith',
        email: 'bob@example.com',
        role: 'Product Designer',
        skills: ['Sketch', 'Prototyping', 'User Research'],
        experience: '7 years',
        resumeToken: 'test-token-789',
    }
];

export const MOCK_APPLICATIONS: Application[] = [
    {
        id: 'a1',
        jobId: 'j1',
        candidateId: 'c1',
        status: 'Interviewing',
        appliedDate: '2025-12-16',
    }
];
