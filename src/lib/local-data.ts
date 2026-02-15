// Local filesystem data layer (for development)

import fs from 'fs';
import path from 'path';

const BASE_DIR = process.env.BRAIN_DATA_DIR || '/home/node/openclaw';

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

// Check if directory exists
async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.promises.access(p);
    return true;
  } catch {
    return false;
  }
}

// List all markdown files
export async function listMarkdownFiles(dir: string = BASE_DIR): Promise<FileInfo[]> {
  if (!(await pathExists(dir))) {
    return [];
  }

  const results: FileInfo[] = [];

  async function walk(currentPath: string) {
    const entries = await fs.promises.readdir(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name.startsWith('.') || entry.name === 'cache') {
          continue;
        }
        await walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const stat = await fs.promises.stat(fullPath);
        const relativePath = path.relative(BASE_DIR, fullPath);
        let type: FileInfo['type'] = 'other';
        if (relativePath.includes('memory/') && /^\d{4}-\d{2}-\d{2}\.md$/.test(entry.name)) {
          type = 'memory';
        } else if (relativePath.startsWith('AGENTS.md') || relativePath.startsWith('SKILL.md') || relativePath.startsWith('README')) {
          type = 'config';
        } else if (!relativePath.includes('node_modules')) {
          type = 'doc';
        }
        results.push({
          name: entry.name,
          path: relativePath,
          size: stat.size,
          mtime: stat.mtime,
          type,
        });
      }
    }
  }

  await walk(dir);
  return results;
}

// Get file content
export async function getFileContent(filePath: string): Promise<string> {
  const fullPath = path.join(BASE_DIR, filePath);
  if (!(await pathExists(fullPath))) {
    return '';
  }
  return fs.promises.readFile(fullPath, 'utf-8');
}

// Get all daily memories
export async function getAllMemories(): Promise<DailyMemory[]> {
  const memoryDir = path.join(BASE_DIR, 'memory');
  if (!(await pathExists(memoryDir))) {
    return [];
  }

  const files = await fs.promises.readdir(memoryDir);
  const memories: DailyMemory[] = [];

  for (const file of files.sort().reverse()) {
    if (/^\d{4}-\d{2}-\d{2}\.md$/.test(file)) {
      const content = await fs.promises.readFile(path.join(memoryDir, file), 'utf-8');
      memories.push({
        date: file.replace('.md', ''),
        filename: file,
        content,
        preview: content.substring(0, 300).replace(/\n/g, ' ') + '...',
      });
    }
  }

  return memories;
}

// Get daily memories (limited)
export async function getDailyMemories(limit: number = 10): Promise<DailyMemory[]> {
  const all = await getAllMemories();
  return all.slice(0, limit);
}

// Search memories
export async function searchMemories(query: string): Promise<{ file: string; snippet: string }[]> {
  const files = await listMarkdownFiles();
  const results: { file: string; snippet: string }[] = [];
  const lowerQuery = query.toLowerCase();

  for (const file of files) {
    try {
      const content = await getFileContent(file.path);
      if (content.toLowerCase().includes(lowerQuery)) {
        const index = content.toLowerCase().indexOf(lowerQuery);
        const start = Math.max(0, index - 100);
        const end = Math.min(content.length, index + 200);
        const snippet = content.substring(start, end);
        results.push({ file: file.path, snippet });
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

  const allMtimes = files.map(f => f.mtime);
  const lastUpdated = allMtimes.length > 0
    ? new Date(Math.max(...allMtimes.map(d => d.getTime())))
    : new Date();

  return {
    memories: memories.length,
    documents: docs.length,
    lastUpdated,
  };
}
