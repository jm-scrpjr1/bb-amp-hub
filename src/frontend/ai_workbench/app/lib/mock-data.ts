
// Mock data for the AI Workbench application

export const mockUser = {
  name: "Edward",
  avatar: "https://cdn.abacus.ai/images/cc817c83-52d2-48f2-8aa8-0a87831a89d7.png",
  greeting: "Howdy, Edward!"
};

export const mockTrainings = [
  {
    id: 1,
    title: "React Basics",
    duration: "2h 30min",
    progress: 75,
    image: "https://cdn.abacus.ai/images/5edf753e-9502-4da7-9228-139ea2bcc387.png"
  },
  {
    id: 2,
    title: "TypeScript Fundamentals", 
    duration: "1h 45min",
    progress: 50,
    image: "https://cdn.abacus.ai/images/b7c4f5fe-fc4a-4764-9acb-b8bb5d416d24.png"
  },
  {
    id: 3,
    title: "Next.js Advanced",
    duration: "3h 15min", 
    progress: 25,
    image: "https://cdn.abacus.ai/images/6ed1e918-25c6-4443-903d-533d69028abe.png"
  }
];

export const mockMessages = [
  {
    id: 1,
    sender: "Alice Johnson",
    message: "Hey Edward, could you review the latest project update?",
    time: "2 min ago",
    avatar: "https://cdn.abacus.ai/images/6c3b0caf-55c6-439d-98f3-63b774149953.png",
    unread: true
  },
  {
    id: 2,
    sender: "Project Manager",
    message: "Meeting scheduled for tomorrow at 2 PM",
    time: "15 min ago", 
    avatar: "https://cdn.abacus.ai/images/55b36fc3-3ee8-4ab6-887d-9ad358499e8c.png",
    unread: true
  },
  {
    id: 3,
    sender: "Anna Rodriguez",
    message: "Great work on the presentation!",
    time: "1 hour ago",
    avatar: "https://cdn.abacus.ai/images/3390ef3e-8962-4cdb-acb8-9b098f566212.png",
    unread: false
  },
  {
    id: 4,
    sender: "Development Team",
    message: "Code review completed, looks good!",
    time: "2 hours ago",
    avatar: "https://cdn.abacus.ai/images/e08a4b47-1dc3-46ac-a753-fb8278877ae2.png", 
    unread: false
  }
];

export const mockBoldUpdates = [
  {
    id: 1,
    title: "Latest AI/ML Assista product Launch Spons...",
    image: "https://cdn.abacus.ai/images/6a2cabdd-8cc1-4fe3-b7c8-266791bb2fb3.png",
    category: "Product Launch"
  },
  {
    id: 2,
    title: "Latest AI/ML Assista product Launch Spons...",
    image: "https://cdn.abacus.ai/images/3713b847-f0f8-4ddd-be03-f7ddc595f2b9.png", 
    category: "Product Launch"
  },
  {
    id: 3,
    title: "Latest AI/ML Assista product Launch Spons...",
    image: "https://cdn.abacus.ai/images/144457c8-df06-4a1a-81db-87bd12b7c232.png",
    category: "Product Launch"
  }
];

export const mockQuickActions = [
  {
    id: 1,
    title: "Track your time",
    subtitle: "Select your tools and start tracking amplified productivity",
    icon: "Clock",
    color: "bg-blue-50 border-blue-200"
  },
  {
    id: 2,
    title: "Submit Ticket",
    subtitle: "Ask for help with technical issues - get amplified support",
    icon: "Ticket",
    color: "bg-green-50 border-green-200"
  },
  {
    id: 3,
    title: "Submit Bold Idea",
    subtitle: "Start your work with innovative ideas - achieve amplified impact",
    icon: "Lightbulb",
    color: "bg-purple-50 border-purple-200"
  }
];

export const mockActivity = [
  {
    id: 1,
    type: "project_update",
    user: "Alice Johnson",
    action: "updated the project status",
    project: "AI Dashboard",
    time: "2 minutes ago",
    avatar: "https://cdn.abacus.ai/images/6c3b0caf-55c6-439d-98f3-63b774149953.png"
  },
  {
    id: 2, 
    type: "new_message",
    user: "Project Manager", 
    action: "sent a message",
    details: "Team meeting scheduled",
    time: "15 minutes ago",
    avatar: "https://cdn.abacus.ai/images/55b36fc3-3ee8-4ab6-887d-9ad358499e8c.png"
  },
  {
    id: 3,
    type: "task_completed",
    user: "You",
    action: "completed task",
    details: "Frontend development review",
    time: "1 hour ago", 
    avatar: "https://cdn.abacus.ai/images/cc817c83-52d2-48f2-8aa8-0a87831a89d7.png"
  }
];

export const navigationItems = [
  { id: 'home', name: 'Home', icon: 'Home', active: true },
  { id: 'prompt-tutor', name: 'Prompt Tutor', icon: 'BookOpen' },
  { id: 'ai-agents', name: 'AI Agents', icon: 'Bot' },
  { id: 'automations', name: 'Automations', icon: 'Zap' },
  { id: 'ai-assessments', name: 'AI Assessments', icon: 'ClipboardList' },
  { id: 'groups', name: 'Groups', icon: 'Users' },
  { id: 'activity', name: 'Activity', icon: 'Activity' },
  { id: 'resources', name: 'Resources', icon: 'FileText' },
  { id: 'trainings', name: 'Trainings', icon: 'GraduationCap' },
  { id: 'submit-bold-idea', name: 'Submit Bold Idea', icon: 'Lightbulb' },
  { id: 'submit-ticket', name: 'Submit Ticket', icon: 'Ticket' },
  { id: 'settings', name: 'Settings', icon: 'Settings' },
  { id: 'logout', name: 'Logout', icon: 'LogOut' }
];
