// Data layer exports
// Uses GitHub API when deployed, falls back to local filesystem

import * as localData from './local-data';
import * as githubData from './github-data';

// When running on Vercel (no local filesystem access), use GitHub
// When running locally, use filesystem
const isVercel = !!process.env.VERCEL;

export type { FileInfo, DailyMemory, TaskItem } from './github-data';

// Re-export functions from the appropriate source
export const listMarkdownFiles = isVercel ? githubData.listMarkdownFiles : localData.listMarkdownFiles;
export const getFileContent = isVercel ? githubData.getFileContent : localData.getFileContent;
export const getAllMemories = isVercel ? githubData.getAllMemories : localData.getAllMemories;
export const getDailyMemories = isVercel ? githubData.getDailyMemories : localData.getDailyMemories;
export const searchMemories = isVercel ? githubData.searchMemories : localData.searchMemories;
export const extractTasks = isVercel ? githubData.extractTasks : localData.extractTasks;
export const getStats = isVercel ? githubData.getStats : localData.getStats;
