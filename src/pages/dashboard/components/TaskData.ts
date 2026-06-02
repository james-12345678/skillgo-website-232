export interface Task {
  id: number;
  title: string;
  category: string;
  completed: boolean;
  description?: string;
  questions?: string[];
  response?: string;
  aiFeedback?: string;
  completedAt?: string;
}

export const defaultTasks: Task[] = [
  {
    id: 1,
    title: "Morning Reflection",
    category: "Reflection",
    completed: true,
    description: "Share your thoughts about starting the day",
    response: "Feeling energized and ready to tackle today's challenges. Looking forward to the presentation at 2 PM.",
    aiFeedback: "Your morning energy shows a positive mindset. I'm learning about your approach to new challenges.",
    completedAt: "2024-12-19T08:30:00Z"
  },
  {
    id: 2,
    title: "Skill Focus Session",
    category: "Growth",
    completed: false,
    description: "Practice or learn something new for 15 minutes"
  },
  {
    id: 3,
    title: "Memory Capture",
    category: "Memory",
    completed: false,
    description: "Share a meaningful memory from your past"
  },
  {
    id: 4,
    title: "Tomorrow's Blueprint",
    category: "Planning",
    completed: false,
    description: "Plan your key objectives for tomorrow"
  }
];

export const weekProgress = [
  { day: "Mon", completed: 4, total: 4 },
  { day: "Tue", completed: 3, total: 4 },
  { day: "Wed", completed: 4, total: 4 },
  { day: "Thu", completed: 2, total: 4 },
  { day: "Fri", completed: 3, total: 4 }
];

export const categoryIcons = {
  Memory: "📝",
  Planning: "🎯",
  Growth: "🌿",
  Reflection: "🔍"
};

export const categoryColors = {
  Memory: "from-blue-500 to-blue-600",
  Planning: "from-green-500 to-green-600", 
  Growth: "from-purple-500 to-purple-600",
  Reflection: "from-orange-500 to-orange-600"
};
