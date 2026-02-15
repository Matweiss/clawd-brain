// GitHub-based data layer for Clawd Brain
// Fetches memory files from private GitHub repo instead of local filesystem

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'Matweiss';
const REPO_NAME = 'clawd-brain-data';
const BRANCH = 'main';

export interface FileInfo {
  name: string;
  path: string;
  size: number;
  mtime: Date;
  type: 'memory' | 'doc' | 'config' | 'other';
}

export interface DailyMemory {
  date: string;
  filename: string;
  content: string;
  preview: string;
}

export interface TaskItem {
  text: string;
  source: string;
  date: string;
  status: 'pending' | 'done';
}

// GitHub API helper
async function githubApi(path: string): Promise<any> {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}?ref=${BRANCH}`;
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
  };
  
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  }
  
  const res = await fetch(url, { headers });
  
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Not found: ${path}`);
    }
    throw new Error(`GitHub API error: ${res.status}`);
  }
  
  return res.json();
}

// Get file content (returns base64 decoded content)
export async function getFileContent(path: string): Promise<string> {
  try {
    const data = await githubApi(path);
    
    if (data.content) {
      // Decode base64 content
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      return content;
    }
    
    return '';
  } catch (error) {
    console.error(`Error fetching ${path}:`, error);
    return `## File not found

The file \`${path}\` could not be loaded from GitHub.

**Error:** ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

// List all markdown files in repo
export async function listMarkdownFiles(): Promise<FileInfo[]> {
  try {
    const files = await githubApi('');
    const results: FileInfo[] = [];
    
    for (const file of files) {
      if (file.type === 'file' && file.name.endsWith('.md')) {
        let type: FileInfo['type'] = 'other';
        
        if (/^\d{4}-\d{2}-\d{2}\.md$/.test(file.name)) {
          type = 'memory';
        } else if (['AGENTS.md', 'SKILL.md', 'README.md', 'MEMORY.md'].some(name => file.name.startsWith(name))) {
          type = 'config';
        } else {
          type = 'doc';
        }
        
        results.push({
          name: file.name,
          path: file.name,
          size: file.size,
          mtime: new Date(file.sha), // Use sha as proxy since GitHub doesn't give mtime
          type,
        });
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error listing files:', error);
    return [];
  }
}

// Get all daily memories (YYYY-MM-DD.md files)
export async function getAllMemories(): Promise<DailyMemory[]> {
  try {
    const files = await listMarkdownFiles();
    const memories: DailyMemory[] = [];
    
    for (const file of files) {
      if (/^\d{4}-\d{2}-\d{2}\.md$/.test(file.name)) {
        const content = await getFileContent(file.name);
        memories.push({
          date: file.name.replace('.md', ''),
          filename: file.name,
          content,
          preview: content.substring(0, 300).replace(/\n/g, ' ') + '...',
        });
      }
    }
    
    // Sort by date descending
    return memories.sort((a, b) => b.date.localeCompare(a.date));
  } catch (error) {
    console.error('Error loading memories:', error);
    return [];
  }
}

// Get daily memories (limited)
export async function getDailyMemories(limit: number = 10): Promise<DailyMemory[]> {
  const all = await getAllMemories();
  return all.slice(0, limit);
}

// Search memories
export async function searchMemories(query: string): Promise<{ file: string; snippet: string }[]> {
  const lowerQuery = query.toLowerCase();
  const files = await listMarkdownFiles();
  const results: { file: string; snippet: string }[] = [];
  
  for (const file of files) {
    try {
      const content = await getFileContent(file.name);
      if (content.toLowerCase().includes(lowerQuery)) {
        const index = content.toLowerCase().indexOf(lowerQuery);
        const start = Math.max(0, index - 100);
        const end = Math.min(content.length, index + 200);
        const snippet = content.substring(start, end);
        results.push({ file: file.name, snippet });
      }
    } catch {
      // Skip files that can't be read
    }
  }
  
  return results;
}

// Extract tasks from memories
export async function extractTasks(): Promise<TaskItem[]> {
  const memories = await getAllMemories();
  const tasks: TaskItem[] = [];
  const seen = new Set<string>();
  
  const patterns = [
    /[-*] \[ \] (.+?)(?=\n|$)/g,
    /TODO[:\s]+(.+?)(?=\n|$)/gi,
    /ACTION[:\s]+(.+?)(?=\n|$)/gi,
  ];
  
  for (const memory of memories) {
    for (const pattern of patterns) {
      const matches = Array.from(memory.content.matchAll(pattern) || []);
      for (const match of matches) {
        const text = match[1]?.trim() || match[0]?.trim();
        if (text && !seen.has(text)) {
          seen.add(text);
          tasks.push({
            text,
            source: memory.filename,
            date: memory.date,
            status: 'pending',
          });
        }
      }
    }
  }
  
  return tasks;
}

// Get stats
export async function getStats(): Promise<{ memories: number; documents: number; lastUpdated: Date }> {
  const files = await listMarkdownFiles();
  const memories = files.filter(f => f.type === 'memory');
  const docs = files.filter(f => f.type === 'doc');
  
  return {
    memories: memories.length,
    documents: docs.length,
    lastUpdated: new Date(),
  };
}
