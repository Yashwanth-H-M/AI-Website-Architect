
export interface GeneratedWebsite {
  id: string;
  prompt: string;
  code: string;
  createdAt: number;
  sources?: Array<{ web?: { uri: string; title: string } }>;
}

export enum AppState {
  HOME = 'HOME',
  GENERATING = 'GENERATING',
  PREVIEW = 'PREVIEW',
  IMAGE_EDIT = 'IMAGE_EDIT'
}

export enum GenerationMode {
  NORMAL = 'NORMAL', // gemini-3-flash-preview (standard)
  DEEP_THINK = 'DEEP_THINK', // gemini-3-pro-preview + thinking
  SEARCH = 'SEARCH', // gemini-3-flash-preview + googleSearch
  FAST = 'FAST' // gemini-2.5-flash-lite-latest
}
