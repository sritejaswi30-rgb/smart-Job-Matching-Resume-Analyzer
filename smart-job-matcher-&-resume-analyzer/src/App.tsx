import React, { useState, useEffect, useRef } from 'react';
import { 
  Briefcase, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  FileCode, 
  User, 
  Plus, 
  X, 
  Search, 
  SlidersHorizontal, 
  PlusCircle, 
  ExternalLink, 
  ShieldCheck, 
  MapPin, 
  IndianRupee, 
  Clock, 
  Lightbulb, 
  ChevronRight,
  TrendingUp,
  Inbox,
  Filter
} from 'lucide-react';
import { Job, MatchResult } from './types';
import { SAMPLE_JOBS } from './data/sampleJobs';
import { SKILL_DICTIONARY } from './utils/skillsDictionary';
import { extractSkillsFromText, groupSkillsByCategory } from './utils/skillExtractor';
import { calculateMatch } from './utils/matchingEngine';

const RESUME_PRESETS = [
  {
    name: 'Backend Intern Template',
    description: 'CS student focusing on servers, Java Spring Boot, PostgreSQL, and deployments.',
    text: `SHREYA PATHAK - BACKEND ENGINEERING STUDENT
Email: shreya@example.com | GitHub: github.com/shreya | LinkedIn

EDUCATION
BS in Computer Science, University of California, Berkeley - Expected Graduate 2027
GPA: 3.8/4.0 | Relevant Coursework: Data Structures, Algorithms, Database Systems

TECHNICAL EXPERIENCE
Backend Engineering Intern | TechStart Solutions (Jan 2026 - Present)
* Engineered high-frequency server-side routes and API endpoints using Java and Spring Boot framework.
* Optimized complex database query structures in PostgreSQL, decreasing fetch latency by 32%.
* Formulated unit test suites with JUnit maintaining code coverage standards of 88%.
* Packaged local application environments into Docker containers, facilitating streamlined CI/CD deployments.

PROJECTS
High-Volume Chat Engine (Python & MySQL)
* Built a concurrent message delivery platform utilizing asynchronous Python libraries.
* Structured data models in MySQL database supporting quick retrieval of chat logs via custom indices.
* Implemented user authentication and session management using Redis caching layers.
* Version controlled with Git and published working codebases on GitHub.

SKILLS & TOOLS
Languages: Java, Python, SQL, JavaScript
Frameworks/APIs: Spring Boot, Node.js, Express, REST APIs
Databases & Cloud: MySQL, PostgreSQL, Redis, Docker, Git, Linux
`
  },
  {
    name: 'Frontend Specialist Template',
    description: 'Web developer skilled in JavaScript, Redux, Next.js, and visual UI/UX design.',
    text: `ALEX RIVERA - FRONTEND DEVELOPER / UI DESIGNER
Email: alex.design@example.com | Portfolio: alexdesign.dev7 | Boston, MA

SUMMARY
A passionate frontend specialist with 2 years of academic and freelance experience translating high-fidelity prototypes into robust, responsive, and highly accessible user interfaces.

TECHNICAL SKILLS
- Frontend Languages: HTML5, CSS3, JavaScript (ES6+), TypeScript
- Frameworks & libraries: React, Next.js, Redux, Svelte, Tailwind CSS, Bootstrap
- Design & Styling: Figma, Adobe XD, Responsive Grid Layouts, Typography pairing
- Workflows & Methodology: Git, GitHub, Agile/Scrum, Jira boards

SELECTED PROJECTS
Collaborative Design Canvas (Next.js & Figma Integration)
* Engineered a collaborative drag-and-drop workspace using Next.js and React states.
* Conducted comprehensive UI/UX Design wireframing phases in Figma prior to active coding.
* Optimized client bundle performance using Vite and TypeScript interfaces.

E-Commerce Customizer Portal (React & Redux)
* Programmed dynamic cart modules using React Redux toolkit tracking customer selections.
* Implemented beautiful micro-animations using custom style coordinates.
* Participated in weekly agile scrums, code-reviews, and backlog refinement.
`
  },
  {
    name: 'AI & Data Analyst Template',
    description: 'Data enthusiast experienced in Python processing, TensorFlow, SQL, and AWS.',
    text: `KAI CHEN - SCIENTIFIC DATA ANALYST / AI INTERN
Email: kai.chen@example.com | Dallas, TX | github.com/kaich

STATEMENT
A details-driven student seeking an internship or early-career entry role in Data Engineering, Data Analytics, or Machine Learning. Skilled in Python scripting, statistical analysis, and Amazon Web Services (AWS).

KEY EXPOSURES
* Mathematical Languages: Python, SQL querying, R programming, MATLAB
* Deep Libraries: TensorFlow, PyTorch, Pandas, NumPy, Scikit-Learn
* Engineering Cloud: AWS (S3, Lambda, EC2), Google Cloud (GCP)
* Databases: PostgreSQL, MongoDB, Redis caching
* Professional tools: Jupyter Notebook, Jira, Git version control, Tableau

ACADEMIC RESEARCH & REPOS
Social Sentiment Pipeline (Python & TensorFlow)
* Developed an NLP deep learning pipeline using TensorFlow and PyTorch to classify sentiment with 91% accuracy.
* Loaded, cleaned, and normalized millions of text records using Pandas series and NumPy vectors.
* Orchestrated automated data extraction tasks utilizing AWS Lambda and stored outputs securely on Amazon S3.
* Plotted statistical metrics, heatmaps, and confusion matrices to present trends during visual research forums.
`
  }
];

export default function App() {
  // Resume state
  const [resumeText, setResumeText] = useState<string>('');
  const [detectedSkills, setDetectedSkills] = useState<string[]>([]);
  
  // Custom added/deleted skills list to let user fine-tune their profile
  const [userProfileSkills, setUserProfileSkills] = useState<string[]>([]);
  
  // Skill dictionary searching
  const [skillSearch, setSkillSearch] = useState<string>('');
  const [showSkillDropdown, setShowSkillDropdown] = useState<boolean>(false);
  
  // File drag-over effect
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Job Listing states (custom + preloaded)
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [levelFilter, setLevelFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'rating' | 'title' | 'company'>('rating');

  // Admin section state
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [newJob, setNewJob] = useState<Partial<Job>>({
    title: '',
    company: '',
    location: '',
    type: 'Internship',
    category: 'Frontend Development',
    salary: '',
    description: '',
    requiredSkills: [],
    experienceLevel: 'Students'
  });
  const [skillsSelectedForForm, setSkillsSelectedForForm] = useState<string[]>([]);
  const [formSkillSearch, setFormSkillSearch] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [formValidationError, setFormValidationError] = useState<string>('');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 1. Initial Load: Load jobs from preloaded template and localStorage
  useEffect(() => {
    const savedJobsJson = localStorage.getItem('smart_matcher_custom_jobs');
    let loadedJobs = [...SAMPLE_JOBS];
    if (savedJobsJson) {
      try {
        const customJobs = JSON.parse(savedJobsJson) as Job[];
        // Filter out duplicates just in case
        const customFiltered = customJobs.filter(cj => !SAMPLE_JOBS.some(sj => sj.id === cj.id));
        loadedJobs = [...customFiltered, ...SAMPLE_JOBS];
      } catch (e) {
        console.error('Failed to parse cached jobs', e);
      }
    }
    setJobs(loadedJobs);
    if (loadedJobs.length > 0) {
      setSelectedJobId(loadedJobs[0].id);
    }

    // Try loading saved profile skills
    const savedProfileSkills = localStorage.getItem('smart_matcher_user_skills');
    if (savedProfileSkills) {
      try {
        const skillsArray = JSON.parse(savedProfileSkills) as string[];
        setUserProfileSkills(skillsArray);
      } catch (e) {
        // Safe fallback
      }
    }
  }, []);

  // Sync profile skills to localStorage for persistence
  useEffect(() => {
    if (userProfileSkills.length > 0) {
      localStorage.setItem('smart_matcher_user_skills', JSON.stringify(userProfileSkills));
    }
  }, [userProfileSkills]);

  // Keep a clean stream of active categories for filters
  const categoriesList = ['All', ...Array.from(new Set(jobs.map(j => j.category)))];

  // 2. Handle parsing whenever resume text changes
  const handleResumeTextChange = (text: string) => {
    setResumeText(text);
    if (text.trim() === '') {
      setDetectedSkills([]);
      setUserProfileSkills([]);
      return;
    }
    const extracted = extractSkillsFromText(text);
    setDetectedSkills(extracted);
    setUserProfileSkills(extracted);
  };

  // Preset quick loaders
  const loadPreset = (index: number) => {
    const preset = RESUME_PRESETS[index];
    setResumeText(preset.text);
    const extracted = extractSkillsFromText(preset.text);
    setDetectedSkills(extracted);
    setUserProfileSkills(extracted);
  };

  // 3. User manual edit skills
  const removeSkill = (skillToRemove: string) => {
    const filtered = userProfileSkills.filter(s => s !== skillToRemove);
    setUserProfileSkills(filtered);
  };

  const addSkill = (newSkillName: string) => {
    if (!userProfileSkills.includes(newSkillName)) {
      const updated = [...userProfileSkills, newSkillName];
      setUserProfileSkills(updated);
    }
    setSkillSearch('');
    setShowSkillDropdown(false);
  };

  // Filter skills for autocomplete dropdown
  const filteredSkillSearchOptions = skillSearch.trim() === ''
    ? []
    : SKILL_DICTIONARY.filter(cell => 
        cell.name.toLowerCase().includes(skillSearch.toLowerCase()) && 
        !userProfileSkills.includes(cell.name)
      ).slice(0, 5);

  // File loading triggers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      readFileContent(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      readFileContent(e.target.files[0]);
    }
  };

  const readFileContent = (file: File) => {
    // We only parse text files, txt, markdown, json, etc.
    if (file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.json') || file.type.startsWith('text/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleResumeTextChange(event.target.result as string);
        }
      };
      reader.readAsText(file);
    } else {
      // Show synthetic text injection for binary formats safely in preview environment
      const reader = new FileReader();
      reader.onload = () => {
        // Simulated textual capture for mockup parsing
        const simulatedText = `RESUME ATTACHMENT: ${file.name}\nCaptured generic PDF file blocks.\nRequired Skill Exposure matches:\nPython, JavaScript, React, SQL, Git, Figma, Docker`;
        handleResumeTextChange(simulatedText);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // 4. Admin custom job additions
  const handleAddSkillsToJobForm = (skillName: string) => {
    if (!skillsSelectedForForm.includes(skillName)) {
      setSkillsSelectedForForm([...skillsSelectedForForm, skillName]);
    }
    setFormSkillSearch('');
  };

  const removeSkillFromJobForm = (skillName: string) => {
    setSkillsSelectedForForm(skillsSelectedForForm.filter(s => s !== skillName));
  };

  const formSkillSearchOptions = formSkillSearch.trim() === ''
    ? []
    : SKILL_DICTIONARY.filter(cell => 
        cell.name.toLowerCase().includes(formSkillSearch.toLowerCase()) && 
        !skillsSelectedForForm.includes(cell.name)
      ).slice(0, 5);

  const handleAdminFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newJob.title || !newJob.company) {
      setFormValidationError('Please specify both the Job Title and Company Name before publishing.');
      return;
    }
    setFormValidationError('');

    const uniqueId = `custom-job-${Date.now()}`;
    const constructedJob: Job = {
      id: uniqueId,
      title: newJob.title,
      company: newJob.company,
      location: newJob.location || 'Remote',
      type: (newJob.type as any) || 'Internship',
      category: newJob.category || 'General',
      salary: newJob.salary || 'Competitive',
      description: newJob.description || 'No description provided.',
      requiredSkills: skillsSelectedForForm.length > 0 ? skillsSelectedForForm : ['React', 'JavaScript'],
      experienceLevel: (newJob.experienceLevel as any) || 'Students',
      isCustom: true
    };

    // Grab existing, prepend
    const savedJobsJson = localStorage.getItem('smart_matcher_custom_jobs');
    let customJobs: Job[] = [];
    if (savedJobsJson) {
      try {
        customJobs = JSON.parse(savedJobsJson);
      } catch (e) {
        // clear corrupted
      }
    }

    const updatedCustomList = [constructedJob, ...customJobs];
    localStorage.setItem('smart_matcher_custom_jobs', JSON.stringify(updatedCustomList));

    // Update state
    setJobs([constructedJob, ...jobs]);
    setSelectedJobId(uniqueId);
    
    // Clear out form
    setNewJob({
      title: '',
      company: '',
      location: '',
      type: 'Internship',
      category: 'Frontend Development',
      salary: '',
      description: '',
      requiredSkills: [],
      experienceLevel: 'Students'
    });
    setSkillsSelectedForForm([]);
    
    setSuccessMessage('Job Posting Successfully Created! Added at the top.');
    setIsAdminOpen(false);

    // Auto-clear success notification
    setTimeout(() => {
      setSuccessMessage('');
    }, 5000);
  };

  const deleteCustomJob = (idToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent selecting the job
    const isConfirmed = window.confirm("Are you sure you want to delete this custom job posting?");
    if (!isConfirmed) return;

    // Filter local storage list
    const savedJobsJson = localStorage.getItem('smart_matcher_custom_jobs');
    if (savedJobsJson) {
      try {
        const customJobs = JSON.parse(savedJobsJson) as Job[];
        const filtered = customJobs.filter(j => j.id !== idToDelete);
        localStorage.setItem('smart_matcher_custom_jobs', JSON.stringify(filtered));
      } catch (err) {
        // silent fail
      }
    }

    // Filter state
    const filteredJobsState = jobs.filter(j => j.id !== idToDelete);
    setJobs(filteredJobsState);

    // Re-adjust selection if deleted selected job
    if (selectedJobId === idToDelete && filteredJobsState.length > 0) {
      setSelectedJobId(filteredJobsState[0].id);
    }
  };

  const triggerSubmitApplication = () => {
    setIsSubmitModalOpen(true);
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
    }, 1200);
  };

  // 5. Build calculations and metrics
  // Process math parameters across listed jobs
  const jobsWithScores = jobs.map(j => {
    const calculation = calculateMatch(userProfileSkills, j);
    return {
      ...j,
      matchResult: calculation
    };
  });

  // Filter jobs based on panel entries
  const filteredJobs = jobsWithScores.filter(j => {
    const matchesSearch = 
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || j.category === categoryFilter;
    const matchesType = typeFilter === 'All' || j.type === typeFilter;
    const matchesLevel = levelFilter === 'All' || j.experienceLevel === levelFilter;

    return matchesSearch && matchesCategory && matchesType && matchesLevel;
  });

  // Sort calculations
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'rating') {
      // sort from highest score to lowest
      return b.matchResult.matchScore - a.matchResult.matchScore;
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'company') {
      return a.company.localeCompare(b.company);
    }
    return 0;
  });

  // Load active matched statistics for visual gauge of current selection
  const selectedJobDecorated = jobsWithScores.find(j => j.id === selectedJobId) || jobsWithScores[0];
  const selectedMatch = selectedJobDecorated 
    ? selectedJobDecorated.matchResult 
    : { jobId: '', matchScore: 0, matchedSkills: [], missingSkills: [], recommendations: [] };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16 font-sans text-slate-800 antialiased selection:bg-indigo-100 dark:bg-slate-900/10" id="main_container">
      {/* HEADER SECTION */}
      <header className="border-b border-slate-200/80 bg-white/90 shadow-xs backdrop-blur-md" id="app_header">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20" id="app_logo">
              <Briefcase className="h-6 w-6 stroke-[2]" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900" id="app_title">
                Smart Job Matcher
              </h1>
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                & Resume Analyzer Hub
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3" id="header_control">
            <button
              onClick={() => setIsAdminOpen(!isAdminOpen)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-display text-sm font-medium transition-all duration-200 ${
                isAdminOpen
                  ? 'bg-amber-50 text-amber-700 ring-2 ring-amber-200'
                  : 'bg-slate-900 text-white shadow-sm hover:bg-slate-800'
              }`}
              id="admin_toggle_btn"
            >
              <PlusCircle className="h-4 w-4" />
              <span>{isAdminOpen ? "Close Admin Panel" : "Admin: Add Job"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" id="main_grid_content">
        {/* SUCCESS ALERTS */}
        {successMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 shadow-xs transition-all duration-300 animate-in fade-in slide-in-from-top-4" id="success_alert">
            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <p className="font-medium text-sm">{successMessage}</p>
            </div>
          </div>
        )}

        {/* AMDIN COLLAPSIBLE JOB POSTER FORM */}
        {isAdminOpen && (
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-100 transition-all duration-300" id="admin_form_panel">
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">Post a Role (Admin Workspace)</h3>
                <p className="text-xs text-slate-500">Newly posted jobs are stored locally and run instantly against the parser.</p>
              </div>
              <button 
                onClick={() => setIsAdminOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAdminFormSubmit} className="space-y-4">
              {formValidationError && (
                <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-850 animate-in fade-in duration-200">
                  <AlertCircle className="h-4.5 w-4.5 text-rose-600 shrink-0" />
                  <span>{formValidationError}</span>
                </div>
              )}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Job Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Systems Engineer Intern"
                    value={newJob.title}
                    onChange={e => setNewJob({...newJob, title: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transitionfocus:border-indigo-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Company *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stripe"
                    value={newJob.company}
                    onChange={e => setNewJob({...newJob, company: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transitionfocus:border-indigo-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Palo Alto, CA (Hybrid)"
                    value={newJob.location}
                    onChange={e => setNewJob({...newJob, location: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transitionfocus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Job Type</label>
                  <select
                    value={newJob.type}
                    onChange={e => setNewJob({...newJob, type: e.target.value as any})}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:bg-white"
                  >
                    <option value="Internship">Internship</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Category</label>
                  <select
                    value={newJob.category}
                    onChange={e => setNewJob({...newJob, category: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:bg-white"
                  >
                    <option value="Frontend Development">Frontend Development</option>
                    <option value="Backend Development">Backend Development</option>
                    <option value="Full-Stack Development">Full-Stack Development</option>
                    <option value="Data Science / AI">Data Science / AI</option>
                    <option value="DevOps & Cloud">DevOps & Cloud</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Product Management">Product Management</option>
                    <option value="Systems Engineering">Systems Engineering</option>
                    <option value="General">General / Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Exp Level</label>
                  <select
                    value={newJob.experienceLevel}
                    onChange={e => setNewJob({...newJob, experienceLevel: e.target.value as any})}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:bg-white"
                  >
                    <option value="Students">Students / Academic</option>
                    <option value="Entry Level">Entry Level (0-2 years)</option>
                    <option value="Intermediate">Intermediate (3-5 years)</option>
                    <option value="Senior">Senior (5+ years)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Salary Range</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹40,000 - ₹60,000 / mo"
                    value={newJob.salary}
                    onChange={e => setNewJob({...newJob, salary: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transitionfocus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Form Skills Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Required Competencies ({skillsSelectedForForm.length} added) *
                </label>
                <div className="mb-2 flex flex-wrap gap-1.5 min-h-8 rounded-xl border border-dashed border-slate-200 p-2 bg-slate-50/50">
                  {skillsSelectedForForm.length === 0 ? (
                    <span className="text-xs text-slate-400 self-center pl-1">No skills added yet. Search or use the options dropdown below.</span>
                  ) : (
                    skillsSelectedForForm.map(skill => (
                      <span key={skill} className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                        {skill}
                        <button type="button" onClick={() => removeSkillFromJobForm(skill)} className="text-indigo-500 hover:text-indigo-800">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                <div className="relative">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Search to add technical skills (e.g. Python, SQL, Docker)..."
                      value={formSkillSearch}
                      onChange={e => setFormSkillSearch(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        // Quick add first dictionary match
                        const match = SKILL_DICTIONARY.find(sk => sk.name.toLowerCase().includes(formSkillSearch.toLowerCase()) && !skillsSelectedForForm.includes(sk.name));
                        if (match) {
                          handleAddSkillsToJobForm(match.name);
                        } else if (formSkillSearch.trim().length > 0) {
                          // Allow custom tag
                          if (!skillsSelectedForForm.includes(formSkillSearch.trim())) {
                            setSkillsSelectedForForm([...skillsSelectedForForm, formSkillSearch.trim()]);
                          }
                          setFormSkillSearch('');
                        }
                      }}
                      className="rounded-xl bg-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-300"
                    >
                      Quick Add
                    </button>
                  </div>
                  
                  {/* Results box */}
                  {formSkillSearchOptions.length > 0 && (
                    <div className="absolute left-0 z-20 mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                      {formSkillSearchOptions.map(option => (
                        <button
                          key={option.name}
                          type="button"
                          onClick={() => handleAddSkillsToJobForm(option.name)}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
                        >
                          <span className="font-medium">{option.name}</span>
                          <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400">{option.category}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Preloaded quick selectors */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider self-center mr-1">Popular:</span>
                    {['React', 'TypeScript', 'Node.js', 'Java', 'Python', 'SQL', 'Git', 'Docker', 'Figma'].map(fastSkill => (
                      <button
                        key={fastSkill}
                        type="button"
                        onClick={() => handleAddSkillsToJobForm(fastSkill)}
                        disabled={skillsSelectedForForm.includes(fastSkill)}
                        className={`rounded-md px-2 py-0.5 text-xs border ${
                          skillsSelectedForForm.includes(fastSkill)
                            ? 'bg-slate-100 text-slate-400 border-transparent cursor-not-allowed'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-500 hover:text-indigo-600'
                        }`}
                      >
                        +{fastSkill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Role Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Introduce the responsibilities, project scopes, team structure, and target impact..."
                  value={newJob.description}
                  onChange={e => setNewJob({...newJob, description: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:bg-white resize-y"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdminOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-md shadow-indigo-600/10 hover:bg-indigo-700"
                >
                  Publish Posting
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MAIN SPLIT GRID STRUCTURE */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12" id="grid_container">
          
          {/* LEFT 5 COLUMNS: RESUME & SKILLS PROFILE INTEGRATION */}
          <section className="lg:col-span-5 space-y-6" id="resume_section">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-6" id="resume_input_box">
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  <h2 className="font-display text-lg font-bold text-slate-900">Your Resume Workspace</h2>
                </div>
                <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest pl-2">Step 1</span>
              </div>

              {/* DEMO PROFILE PICKERS */}
              <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5" id="presets_container">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-indigo-700 mb-2">
                  ⚡ Load Demo Student Profile Presets
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {RESUME_PRESETS.map((preset, index) => (
                    <button
                      key={preset.name}
                      onClick={() => loadPreset(index)}
                      className="flex flex-col items-start text-left rounded-lg border border-indigo-100 bg-white p-2 text-[11px] font-medium text-slate-700 shadow-2xs hover:border-indigo-400 hover:text-indigo-700 active:scale-95 transition-all duration-150"
                      title={preset.description}
                    >
                      <span className="font-bold block text-indigo-600 leading-tight truncate w-full">{preset.name.split(' ')[0]} Dev</span>
                      <span className="text-[9px] text-slate-400 leading-none mt-1">Preset #{index + 1}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* DRAG AND DROP AREA */}
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`group cursor-pointer border-2 border-dashed rounded-2xl p-4 text-center transition-all duration-200 ${
                  isDragging 
                    ? 'border-indigo-500 bg-indigo-50/40 scale-[0.99]' 
                    : resumeText 
                      ? 'border-slate-200 bg-slate-50/30 hover:border-slate-300' 
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100/60 hover:border-slate-300'
                }`}
                id="file_drop_area"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".txt,.md,.json" 
                  className="hidden" 
                />
                
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition-transform duration-200 group-hover:scale-110">
                  <Upload className="h-5 w-5" />
                </div>
                <p className="mt-2 text-xs font-medium text-slate-700">
                  {resumeText ? "Click or drag to replace document" : "Drag-and-drop or Browse file"}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Supports TXT, MD, JSON files (or any document)</p>
              </div>

              {/* TEXT AREA INPUT */}
              <div className="mt-4" id="text_area_box">
                <div className="flex items-center justify-between mb-1.5 pl-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Paste Resume Content
                  </label>
                  {resumeText && (
                    <button 
                      onClick={() => handleResumeTextChange('')}
                      className="text-[10px] font-bold text-rose-500 hover:underline"
                    >
                      Reset Workspace
                    </button>
                  )}
                </div>
                <div className="relative">
                  <textarea
                    rows={8}
                    placeholder="Paste technical qualifications, research summaries, courses, or full resume text here to analyze..."
                    value={resumeText}
                    onChange={(e) => handleResumeTextChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/40 p-3 font-mono text-xs outline-none transitionfocus:border-indigo-500 focus:bg-white resize-y leading-relaxed"
                  />
                </div>
                {resumeText.trim() === '' && (
                  <div className="mt-2.5 rounded-xl border border-slate-200/60 bg-slate-50/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1.5 pl-0.5">
                      <FileCode className="h-3.5 w-3.5 text-indigo-500" />
                      <span>Recommended Resume Format Example:</span>
                    </div>
                    <pre className="text-[10px] text-slate-500/80 font-mono leading-tight bg-white p-2.5 rounded-lg border border-slate-200/50 overflow-x-auto whitespace-pre-wrap">
                      {`Jane Doe - Software Intern
Skills: Python, React, PostgreSQL, Docker, Git
Projects: Web portal using Tailwind CSS...`}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* DYNAMIC PROFILE SKILLS DRAWER */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-6" id="user_skills_box">
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-indigo-600" />
                  <h2 className="font-display text-lg font-bold text-slate-900">Extracted Skills</h2>
                </div>
                <span className="font-mono text-[10px] bg-slate-100 px-2.5 py-0.5 rounded-full font-bold text-slate-600">
                  {userProfileSkills.length} Detected
                </span>
              </div>

              <div className="space-y-4">
                {/* AUTOCOMPLETE PICKER TO MANUALLY ADD EXTRA SKILLS */}
                <div className="relative">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Add additional skills (e.g. Kotlin, Redux)..."
                        value={skillSearch}
                        onChange={e => {
                          setSkillSearch(e.target.value);
                          setShowSkillDropdown(true);
                        }}
                        onFocus={() => setShowSkillDropdown(true)}
                        className="w-full pl-9 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs outline-none focus:border-indigo-500 focus:bg-white"
                      />
                    </div>
                    {skillSearch && (
                      <button
                        onClick={() => {
                          setSkillSearch('');
                          setShowSkillDropdown(false);
                        }}
                        className="rounded-xl border border-slate-200 bg-white px-2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Complete Dialog */}
                  {showSkillDropdown && filteredSkillSearchOptions.length > 0 && (
                    <div className="absolute left-0 z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white p-1 shadow-lg max-h-48 overflow-y-auto">
                      <p className="px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">Suggestions:</p>
                      {filteredSkillSearchOptions.map(option => (
                        <button
                          key={option.name}
                          onClick={() => addSkill(option.name)}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition"
                        >
                          <span className="font-semibold">{option.name}</span>
                          <span className="font-mono text-[9px] text-slate-400 uppercase">{option.category}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* If searched token isn't in dictionary, let them add custom string anyway */}
                  {skillSearch.trim() !== '' && filteredSkillSearchOptions.length === 0 && (
                    <div className="absolute left-0 z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                      <button
                        onClick={() => addSkill(skillSearch.trim())}
                        className="flex w-full items-center gap-1.5 text-left text-xs text-indigo-600 font-medium hover:underline p-1"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add "{skillSearch.trim()}" as a custom skill</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* SKILLS TAGS BY CATEGORY */}
                {userProfileSkills.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
                    <User className="h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-500">Your skills profile is empty</p>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">
                      Paste a resume above or load a template to extract your technical competencies.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4" id="skills_grouped_list">
                    {Object.entries(groupSkillsByCategory(userProfileSkills)).map(([category, rawSkills]) => (
                      <div key={category} className="space-y-1.5">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-0.5">
                          {category}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {rawSkills.map(skill => (
                            <span 
                              key={skill} 
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50/60 pl-2.5 pr-1 py-0.5 text-xs font-medium text-slate-700 hover:border-slate-300"
                            >
                              {skill}
                              <button 
                                onClick={() => removeSkill(skill)}
                                className="rounded-md p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-800"
                                title={`Delete ${skill}`}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* RIGHT 7 COLUMNS: JOBS LISTING HUB + ANALYSIS MATCH PANEL */}
          <section className="lg:col-span-7 space-y-6" id="job_hub_section">
            
            {/* MATCH ANALYSIS DETAILED DISPLAY */}
            {selectedJobDecorated && (
              <div className="rounded-2xl border border-indigo-200 bg-white shadow-md p-6 relative overflow-hidden" id="match_display_card">
                
                {/* Floating custom badge */}
                {selectedJobDecorated.isCustom && (
                  <div className="absolute right-0 top-0 rounded-bl-xl bg-amber-500 px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-white">
                    Custom Post
                  </div>
                )}

                {/* Score panel header info */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                        {selectedJobDecorated.category}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">{selectedJobDecorated.location}</span>
                    </div>
                    <h2 className="font-display text-xl font-extrabold text-slate-900 leading-snug">
                      {selectedJobDecorated.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">{selectedJobDecorated.company}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-bold text-slate-600">
                        <IndianRupee className="h-3 w-3" />
                        {selectedJobDecorated.salary}
                      </span>
                      <span>•</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        {selectedJobDecorated.type}
                      </span>
                    </div>
                  </div>

                  {/* Circular Dial Match Score Rating Graph widget */}
                  <div className="flex items-center gap-3 shrink-0" id="match_dial_display">
                    <div className="relative h-20 w-20" id="svg_score_circle">
                      <svg className="h-full w-full -rotate-90">
                        {/* Background track circle */}
                        <circle 
                          cx="40" 
                          cy="40" 
                          r="34" 
                          stroke="#e2e8f0" 
                          strokeWidth="6" 
                          fill="transparent" 
                        />
                        {/* Active score arch curve filled mathematically based on score percent */}
                        <circle 
                          cx="40" 
                          cy="40" 
                          r="34" 
                          stroke={
                            selectedMatch.matchScore >= 80 
                              ? '#10b981' 
                              : selectedMatch.matchScore >= 50 
                                ? '#f59e0b' 
                                : '#f43f5e'
                          } 
                          strokeWidth="6" 
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 34}
                          strokeDashoffset={2 * Math.PI * 34 * (1 - selectedMatch.matchScore / 100)}
                          strokeLinecap="round"
                          className="transition-all duration-700 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                        <span className="font-mono text-xl font-extrabold tracking-tight">
                          {selectedMatch.matchScore}%
                        </span>
                        <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                          Match
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col text-left">
                      <span className={`text-xs font-extrabold uppercase tracking-wider ${
                        selectedMatch.matchScore >= 80 
                          ? 'text-emerald-700' 
                          : selectedMatch.matchScore >= 50 
                            ? 'text-amber-700' 
                            : 'text-rose-700'
                      }`}>
                        {selectedMatch.matchScore >= 80 
                          ? 'Strong Match' 
                          : selectedMatch.matchScore >= 50 
                            ? 'Medium Match' 
                            : 'Action Required'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {selectedMatch.matchedSkills.length} of {selectedJobDecorated.requiredSkills.length} skills owned
                      </span>
                    </div>
                  </div>
                </div>

                {/* SKILLS ALIGNMENT SECTIONS: MATCHED VS GAP COMPETENCIES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100" id="alignment_grid">
                  
                  {/* Owned matching skills */}
                  <div className="rounded-xl bg-emerald-50/45 p-4 border border-emerald-100/40">
                    <div className="flex items-center gap-1.5 text-emerald-800 mb-2">
                      <CheckCircle className="h-4.5 w-4.5 shrink-0 text-emerald-600" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">Your Matched Skills</h4>
                    </div>
                    {selectedMatch.matchedSkills.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No skills overlap discovered.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedMatch.matchedSkills.map(skill => (
                          <span 
                            key={skill} 
                            className="inline-flex items-center bg-emerald-100/70 border border-emerald-200/50 rounded-lg px-2.5 py-0.5 text-xs font-semibold text-emerald-800"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Required Missing Skills (gap) */}
                  <div className="rounded-xl bg-orange-50/45 p-4 border border-orange-100/40">
                    <div className="flex items-center gap-1.5 text-orange-900 mb-2">
                      <AlertCircle className="h-4.5 w-4.5 shrink-0 text-amber-600" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">Required Skill Gaps</h4>
                    </div>
                    {selectedMatch.missingSkills.length === 0 ? (
                      <p className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-1 rounded">
                        ✨ Perfect coverage! No missing required skills.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedMatch.missingSkills.map(skill => (
                          <span 
                            key={skill} 
                            className="inline-flex items-center bg-orange-100/70 border border-orange-200/50 rounded-lg px-2.5 py-0.5 text-xs font-semibold text-orange-850"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* SUGGESTED IMPROVEMENT PATHWAYS */}
                <div className="mt-5 space-y-3" id="suggestions_remediator">
                  <div className="flex items-center gap-1.5 text-slate-900 mb-1">
                    <Lightbulb className="h-4.5 w-4.5 text-yellow-500" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">Suggested Improvement Action Plan</h4>
                  </div>
                  
                  {selectedMatch.missingSkills.length === 0 ? (
                    <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 text-xs text-slate-600" id="recommendation_perfect">
                      <p className="font-semibold text-slate-900">Recommended Steps:</p>
                      <p className="mt-1 leading-relaxed">
                        Since your resume perfectly covers all core requirements, we recommend submitting your candidacy. 
                        Incorporate custom bullet points highlighting past projects that utilize <span className="font-semibold text-indigo-600">{selectedJobDecorated.requiredSkills.slice(0, 3).join(', ')}</span> dynamically!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5" id="recommendation_items">
                      {selectedMatch.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs leading-relaxed text-slate-700">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 font-mono text-[9px] font-extrabold text-indigo-600 select-none">
                            {i + 1}
                          </span>
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* JOB DESCRIPTION PARAGRAPH SUMMARY */}
                <div className="mt-6 pt-5 border-t border-slate-100 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Position Responsibilities</h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/30 p-3.5 rounded-xl border border-slate-100">
                    {selectedJobDecorated.description}
                  </p>
                </div>

                {/* ACTION TRIGGER CONTAINER */}
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 rounded-xl p-3 border border-slate-200/50">
                  <div className="text-xs text-slate-500 pl-1 text-center sm:text-left">
                    Role Experience: <span className="font-bold text-slate-700">{selectedJobDecorated.experienceLevel}</span>
                  </div>
                  
                  <div className="flex gap-2 w-full sm:w-auto">
                    {selectedJobDecorated.isCustom && (
                      <button
                        onClick={(e) => deleteCustomJob(selectedJobDecorated.id, e)}
                        className="rounded-xl bg-white border border-rose-200 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition w-full sm:w-auto"
                      >
                        Delete Posting
                      </button>
                    )}
                    <button
                      onClick={triggerSubmitApplication}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition w-full sm:w-auto"
                    >
                      <span>Submit Application</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* JOBS DIRECTORY CARD CONTAINER */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-6" id="job_directory_card">
              
              <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-indigo-600" />
                  <h2 className="font-display text-lg font-bold text-slate-900">Job Matches Directory</h2>
                </div>
                <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">
                  Step 2 • {sortedJobs.length} Positions Available
                </span>
              </div>

              {/* FILTERING CONTROLS FOR DIRECTORY LIST */}
              <div className="mb-4 space-y-3" id="navigation_controls">
                
                {/* Search query input */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search roles, tech stack, or enterprise hubs (e.g. Google, Python, React)..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm py-2 outline-none transitionfocus:border-indigo-500 focus:bg-white"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2 text-xs font-bold text-slate-400 hover:text-slate-600"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Multipurpose categories filters rows */}
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-4 bg-slate-50 p-3 rounded-xl border border-slate-150" id="filters_matrix">
                  
                  {/* Category select filter */}
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Tech Area</label>
                    <select
                      value={categoryFilter}
                      onChange={e => setCategoryFilter(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs outline-none"
                    >
                      <option value="All">All Categories</option>
                      {categoriesList.filter(c => c !== 'All').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Job type (internship/full-time) select filter */}
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Contract Type</label>
                    <select
                      value={typeFilter}
                      onChange={e => setTypeFilter(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs outline-none"
                    >
                      <option value="All">All Types</option>
                      <option value="Internship">Internships</option>
                      <option value="Full-time">Full-time Roles</option>
                      <option value="Part-time">Part-time Roles</option>
                    </select>
                  </div>

                  {/* Experience Level */}
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Experience Level</label>
                    <select
                      value={levelFilter}
                      onChange={e => setLevelFilter(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs outline-none"
                    >
                      <option value="All">All Levels</option>
                      <option value="Students">Students / Academic</option>
                      <option value="Entry Level">Entry Level</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Senior">Senior</option>
                    </select>
                  </div>

                  {/* Sort rules */}
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Sort Listing By</label>
                    <select
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value as any)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs outline-none"
                    >
                      <option value="rating">Match Score (High-Low)</option>
                      <option value="title">Role Title Alphabetical</option>
                      <option value="company">Corporate Name</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SCROLLING ACTION CONTAINER FOR FILTER LISTINGS */}
              {sortedJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-12 px-6 text-center bg-slate-50/50" id="jobs_empty">
                  <Inbox className="h-10 w-10 text-slate-350 mb-3" />
                  <p className="text-sm font-bold text-slate-600">No matching jobs discovered</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    Try loosening your search prompts, expanding the tech categories, or adding more skills under step 1.
                  </p>
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setCategoryFilter('All');
                      setTypeFilter('All');
                      setLevelFilter('All');
                    }}
                    className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Reset Active Filters
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1" id="scrolling_jobs_list">
                  {sortedJobs.map((item) => {
                    const isSelected = item.id === selectedJobDecorated?.id;
                    const rating = item.matchResult.matchScore;
                    
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedJobId(item.id);
                          setTimeout(() => {
                            const detailsCard = document.getElementById('match_display_card');
                            if (detailsCard) {
                              detailsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }, 50);
                        }}
                        className={`group relative cursor-pointer rounded-xl border p-4 text-left transition-all duration-200 hover:shadow-xs hover:border-indigo-200 ${
                          isSelected 
                            ? 'border-indigo-600 bg-gradient-to-r from-indigo-50/10 to-indigo-50/30 ring-1 ring-indigo-150' 
                            : 'border-slate-100 bg-slate-50/10 hover:bg-slate-50/40'
                        }`}
                        id={`job_row_${item.id}`}
                      >
                        {/* Selector colored left bar status indicator */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition ${
                          isSelected 
                            ? 'bg-indigo-600' 
                            : 'bg-transparent group-hover:bg-indigo-200'
                        }`} />

                        <div className="flex items-start justify-between gap-3 pl-1">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono text-[9px] font-bold text-indigo-600 uppercase tracking-wider">
                                {item.company}
                              </span>
                              <span className="text-[10px] text-slate-300">•</span>
                              <span className="font-mono text-[10px] text-slate-400">
                                {item.location.split(' (')[0]}
                              </span>
                              {item.isCustom && (
                                <span className="rounded bg-amber-50 px-1 py-0.5 text-[8px] font-bold uppercase tracking-wider text-amber-700 border border-amber-100">
                                  Custom
                                </span>
                              )}
                            </div>
                            
                            <h3 className="font-display text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition truncate max-w-sm sm:max-w-md">
                              {item.title}
                            </h3>
                            
                            {/* Tags list snippet preview */}
                            <div className="flex flex-wrap gap-1 pt-1">
                              {item.requiredSkills.slice(0, 4).map(reqS => {
                                const userOwns = userProfileSkills.map(s => s.toLowerCase()).includes(reqS.toLowerCase());
                                return (
                                  <span 
                                    key={reqS} 
                                    className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                      userOwns 
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                        : 'bg-slate-100 text-slate-500'
                                    }`}
                                  >
                                    {reqS}
                                  </span>
                                );
                              })}
                              {item.requiredSkills.length > 4 && (
                                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-400">
                                  +{item.requiredSkills.length - 4} more
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Matching Rating badge on right margin */}
                          <div className="flex flex-col items-end gap-1.5 text-right shrink-0">
                            <span className={`inline-flex h-8 w-11 items-center justify-center rounded-lg font-mono text-xs font-black tracking-tight ${
                              rating >= 80 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : rating >= 50 
                                  ? 'bg-amber-100 text-amber-800' 
                                  : 'bg-rose-100 text-rose-800'
                            }`} id={`match_badge_line_${item.id}`}>
                              {rating}%
                            </span>
                            <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Match</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

        </div>
      </main>

      {/* SUCCESS APPLICATION MODAL */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in" id="application_modal">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl animate-in scale-in duration-200">
            {/* Close button */}
            <button 
              onClick={() => setIsSubmitModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              id="close_modal_btn"
            >
              <X className="h-5 w-5" />
            </button>

            {isSubmitting ? (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
                <div className="space-y-1">
                  <h3 className="font-display text-base font-bold text-slate-900">Processing Candidacy Match</h3>
                  <p className="text-xs text-slate-500 max-w-xs">
                    Transmitting {selectedMatch.matchedSkills.length} matches & security certificates...
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <ShieldCheck className="h-8 w-8 stroke-[2]" />
                </div>
                
                <div className="text-center space-y-1">
                  <h3 className="font-display text-lg font-extrabold text-slate-900">Application Transmitted!</h3>
                  <p className="text-xs text-slate-500">
                    Your matched resume payload has been compiled and secured offline.
                  </p>
                </div>

                {/* Info Card */}
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-150 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Position:</span>
                    <span className="font-bold text-slate-800">{selectedJobDecorated?.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Company:</span>
                    <span className="font-bold text-slate-800">{selectedJobDecorated?.company}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Match score:</span>
                    <span className="font-bold text-emerald-600">{selectedMatch.matchScore}% Score Match</span>
                  </div>
                  <div className="border-t border-slate-200/60 pt-2 flex flex-col gap-1">
                    <span className="text-slate-400 font-semibold text-slate-600">Matched Skills Packaged:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedMatch.matchedSkills.slice(0, 8).map(s => (
                        <span key={s} className="bg-emerald-50 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded-md border border-emerald-150 font-medium">
                          {s}
                        </span>
                      ))}
                      {selectedMatch.matchedSkills.length === 0 && (
                        <span className="text-slate-400 italic">No skills matching job requirement</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Subtext info */}
                <p className="text-[10px] leading-normal text-slate-400 text-center">
                  This represents a secure deployment simulation. In production, this packages matches as direct metadata filters to Greenhouse/Workday tracking structures.
                </p>

                {/* Action Button */}
                <button
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/10 hover:bg-indigo-700 active:scale-[0.98] transition"
                  id="modal_done_btn"
                >
                  Done, Return to Workspace
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FOOTER BAR */}
      <footer className="mt-12 text-center" id="app_footer_container">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 border-t border-slate-200">
          <p className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">
            🛡️ offline sandbox matcher • no server transmission • instant browser compilation
          </p>
        </div>
      </footer>
    </div>
  );
}
