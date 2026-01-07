
import React, { useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
// @ts-ignore
import Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import { Palette } from 'lucide-react';

interface EditorViewProps {
  code: string;
  onChange: (code: string) => void;
}

type ThemeKey = 'tomorrow' | 'light' | 'dracula' | 'okaidia';

const THEMES: Record<ThemeKey, { name: string; url: string; bg: string; color: string }> = {
  tomorrow: {
    name: 'Tomorrow Night',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css',
    bg: '#1e1e1e',
    color: '#ccc'
  },
  light: {
    name: 'Prism Light',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css',
    bg: '#f5f2f0',
    color: '#000'
  },
  dracula: {
    name: 'Dracula',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/prism-themes/1.9.0/prism-dracula.min.css',
    bg: '#282a36',
    color: '#f8f8f2'
  },
  okaidia: {
    name: 'Okaidia',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-okaidia.min.css',
    bg: '#272822',
    color: '#f8f8f2'
  }
};

const EditorView: React.FC<EditorViewProps> = ({ code, onChange }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>('tomorrow');

  useEffect(() => {
    // Load the current theme CSS
    const linkId = 'prism-theme-link';
    let link = document.getElementById(linkId) as HTMLLinkElement;
    
    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    
    link.href = THEMES[currentTheme].url;

    return () => {
      // Optional: Cleanup if needed, but usually fine to leave it
    };
  }, [currentTheme]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/50 px-4 py-1.5">
        <div className="flex items-center gap-2">
          <Palette className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Editor Theme</span>
        </div>
        <div className="flex gap-1">
          {(Object.keys(THEMES) as ThemeKey[]).map((themeKey) => (
            <button
              key={themeKey}
              onClick={() => setCurrentTheme(themeKey)}
              className={`rounded px-2 py-0.5 text-[10px] font-medium transition-all ${
                currentTheme === themeKey
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {THEMES[themeKey].name}
            </button>
          ))}
        </div>
      </div>
      <div 
        className="flex-1 overflow-auto font-mono text-sm leading-relaxed transition-colors duration-300"
        style={{ backgroundColor: THEMES[currentTheme].bg }}
      >
        <Editor
          value={code}
          onValueChange={onChange}
          highlight={(code) => Prism.highlight(code, Prism.languages.markup, 'markup')}
          padding={20}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 14,
            minHeight: '100%',
            color: THEMES[currentTheme].color
          }}
          className="editor-container"
        />
      </div>
    </div>
  );
};

export default EditorView;
