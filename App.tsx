
import React, { useState, useRef } from 'react';
import { AppState, GeneratedWebsite, GenerationMode } from './types';
import Header from './components/Header';
import { generateWebsiteCode, editImage } from './services/geminiService';
import { 
  Sparkles, 
  ArrowRight, 
  Code, 
  Eye, 
  Download, 
  ChevronLeft, 
  Loader2,
  AlertCircle,
  BrainCircuit,
  Globe,
  Zap,
  ImageIcon,
  Upload,
  ExternalLink,
  Camera,
  Layers,
  ShoppingBag,
  Coffee,
  Rocket,
  Mail
} from 'lucide-react';
import EditorView from './components/EditorView';
import JSZip from 'jszip';

const BLUEPRINTS = [
  {
    id: 'portfolio',
    label: 'Portfolio',
    icon: Camera,
    prompt: 'A minimalist photography portfolio with a deep charcoal theme, a sleek masonry grid for images, and a smooth-scrolling "About Me" section with elegant typography.',
    mode: GenerationMode.NORMAL
  },
  {
    id: 'saas',
    label: 'SaaS Hub',
    icon: Rocket,
    prompt: 'A professional SaaS landing page with a hero section featuring a dummy app preview, a clear three-tier pricing table, and a "Features" grid with modern icons.',
    mode: GenerationMode.DEEP_THINK
  },
  {
    id: 'commerce',
    label: 'Shopfront',
    icon: ShoppingBag,
    prompt: 'A luxury e-commerce homepage layout with a bold hero banner, a "Featured Collection" carousel, and a clean, accessible navigation bar with a shopping cart icon.',
    mode: GenerationMode.SEARCH
  },
  {
    id: 'cafe',
    label: 'Gourmet',
    icon: Coffee,
    prompt: 'A warm, inviting restaurant website with an interactive digital menu, a table reservation form, and high-quality image backgrounds with parallax effects.',
    mode: GenerationMode.FAST
  },
  {
    id: 'agency',
    label: 'Agency',
    icon: Layers,
    prompt: 'A creative agency landing page using bold neon accents, a "Our Work" section with hover-reveal effects, and a detailed footer with social media links.',
    mode: GenerationMode.NORMAL
  }
];

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.HOME);
  const [mode, setMode] = useState<GenerationMode>(GenerationMode.NORMAL);
  const [prompt, setPrompt] = useState('');
  const [generatedWebsite, setGeneratedWebsite] = useState<GeneratedWebsite | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Image Edit State
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const applyBlueprint = (blueprint: typeof BLUEPRINTS[0]) => {
    setPrompt(blueprint.prompt);
    setMode(blueprint.mode);
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setState(AppState.GENERATING);
    setError(null);
    
    try {
      const { code, sources } = await generateWebsiteCode(prompt, mode);
      const newWebsite: GeneratedWebsite = {
        id: Math.random().toString(36).substr(2, 9),
        prompt,
        code,
        createdAt: Date.now(),
        sources: sources,
      };
      setGeneratedWebsite(newWebsite);
      setState(AppState.PREVIEW);
    } catch (err: any) {
      setError(err.message || 'Something went wrong while generating your site.');
      setState(AppState.HOME);
    }
  };

  const handleDownload = async () => {
    if (!generatedWebsite) return;
    const zip = new JSZip();
    zip.file('index.html', generatedWebsite.code);
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `website-${generatedWebsite.id}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCodeChange = (newCode: string) => {
    if (generatedWebsite) {
      setGeneratedWebsite({ ...generatedWebsite, code: newCode });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourceImage(reader.result as string);
        setEditedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImage = async () => {
    if (!sourceImage || !imagePrompt.trim()) return;
    setIsProcessingImage(true);
    setError(null);
    try {
      const result = await editImage(sourceImage, imagePrompt);
      setEditedImage(result);
    } catch (err: any) {
      setError(err.message || 'Image editing failed.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const renderFooter = () => (
    <footer className="w-full px-6 py-12 text-center border-t border-slate-900/50 mt-auto">
      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-700">
          Powered by Gemini Intelligence
        </p>
        <div className="flex flex-col items-center gap-1">
          <p className="text-[9px] font-medium tracking-widest text-slate-500 uppercase">
            Developed by <span className="text-slate-300">Yashwanth H M</span>
          </p>
          <a 
            href="mailto:yashwanth.32997@gmail.com" 
            className="group flex items-center gap-1.5 text-[9px] font-medium text-slate-600 hover:text-indigo-400 transition-colors"
          >
            <Mail className="h-3 w-3 transition-transform group-hover:scale-110" />
            yashwanth.32997@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );

  if (state === AppState.GENERATING) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-200">
        <main className="flex flex-1 flex-col items-center justify-center text-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-6" />
          <h2 className="text-xl font-medium text-white">Generating your website...</h2>
          <p className="mt-2 text-sm text-slate-500">Using {mode.toLowerCase()} intelligence</p>
        </main>
      </div>
    );
  }

  if (state === AppState.IMAGE_EDIT) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-200">
        <Header onGoHome={() => setState(AppState.HOME)} />
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-12">
          <div className="mb-8 flex items-center justify-between">
            <button 
              onClick={() => setState(AppState.HOME)}
              className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> Back to Generator
            </button>
            <h1 className="text-lg font-semibold text-white">Image Editor</h1>
          </div>
          
          <div className="grid flex-1 gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex flex-1 cursor-pointer items-center justify-center rounded-xl border border-slate-800 bg-slate-900/30 transition-colors hover:bg-slate-900/50 min-h-[300px]"
              >
                {sourceImage ? (
                  <img src={sourceImage} className="h-full w-full rounded-xl object-contain p-4" alt="Source" />
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto mb-2 h-8 w-8 text-slate-600" />
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Upload Base Image</p>
                  </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>

              <div className="space-y-4">
                <textarea
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="Describe your edits (e.g., 'Add a vintage polaroid filter')"
                  className="w-full resize-none rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-white focus:border-indigo-500 focus:outline-none h-24"
                />
                <button
                  disabled={!sourceImage || !imagePrompt.trim() || isProcessingImage}
                  onClick={handleEditImage}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-500 disabled:opacity-50"
                >
                  {isProcessingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : "Process Image"}
                </button>
              </div>
            </div>

            <div className="flex flex-1 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/10 min-h-[300px]">
              {editedImage ? (
                <div className="relative h-full w-full p-4">
                  <img src={editedImage} className="h-full w-full rounded-xl object-contain" alt="Edited result" />
                  <a 
                    href={editedImage} 
                    download="edited.png"
                    className="absolute bottom-6 right-6 flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg"
                  >
                    <Download className="h-3 w-3" /> Save
                  </a>
                </div>
              ) : (
                <div className="text-center text-slate-700">
                  <ImageIcon className="mx-auto mb-2 h-8 w-8 opacity-20" />
                  <p className="text-xs uppercase tracking-widest">Output Preview</p>
                </div>
              )}
            </div>
          </div>
        </main>
        {renderFooter()}
      </div>
    );
  }

  if (state === AppState.PREVIEW && generatedWebsite) {
    return (
      <div className="flex h-screen flex-col bg-slate-950 text-slate-200 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-900 bg-slate-950 px-6 py-3">
          <div className="flex items-center gap-4">
            <button onClick={() => setState(AppState.HOME)} className="text-slate-500 hover:text-white transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Previewing</h1>
              <p className="text-[10px] text-slate-600 truncate max-w-[200px]">{generatedWebsite.prompt}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="flex rounded-lg bg-slate-900 p-1">
                <button onClick={() => setIsEditing(false)} className={`rounded px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all ${!isEditing ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}`}>Preview</button>
                <button onClick={() => setIsEditing(true)} className={`rounded px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all ${isEditing ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}`}>Code</button>
             </div>
             <button onClick={handleDownload} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-indigo-500 transition-colors">
               <Download className="h-3 w-3" /> Export
             </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {isEditing ? (
            <div className="flex-1">
              <EditorView code={generatedWebsite.code} onChange={handleCodeChange} />
            </div>
          ) : (
            <div className="flex-1 bg-white flex flex-col">
               {generatedWebsite.sources && generatedWebsite.sources.length > 0 && (
                <div className="bg-slate-100 border-b border-slate-200 px-4 py-1.5 flex gap-3">
                  {generatedWebsite.sources.slice(0, 3).map((s, idx) => s.web && (
                    <a key={idx} href={s.web.uri} target="_blank" rel="noopener noreferrer" className="text-[9px] text-slate-500 flex items-center gap-1 hover:text-indigo-600">
                      Ref: {s.web.title.substring(0, 20)}... <ExternalLink className="h-2 w-2" />
                    </a>
                  ))}
                </div>
              )}
              <iframe className="w-full flex-1" srcDoc={generatedWebsite.code} title="Preview" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-200">
      <Header onGoHome={() => setState(AppState.HOME)} />
      
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <div className="mb-12">
          <h1 className="text-4xl font-light tracking-tight text-white sm:text-6xl">
            Design <span className="text-indigo-500">better</span> software.
          </h1>
          <p className="mt-4 text-slate-500 font-light text-lg">
            An intelligent agent for professional-grade website generation.
          </p>
        </div>

        <div className="w-full space-y-8">
          <div className="inline-flex items-center rounded-xl bg-slate-900/50 p-1 border border-slate-800">
            {[
              { id: GenerationMode.NORMAL, icon: Sparkles, label: 'Standard' },
              { id: GenerationMode.DEEP_THINK, icon: BrainCircuit, label: 'Logic' },
              { id: GenerationMode.SEARCH, icon: Globe, label: 'Search' },
              { id: GenerationMode.FAST, icon: Zap, label: 'Lite' }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                  mode === m.id ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <m.icon className="h-3 w-3" />
                {m.label}
              </button>
            ))}
          </div>

          <div className="relative w-full">
            <textarea
              ref={textAreaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your vision..."
              className="w-full resize-none rounded-2xl border border-slate-800 bg-slate-900/30 p-6 text-xl font-light text-white placeholder-slate-700 focus:border-indigo-500/50 focus:outline-none transition-all min-h-[160px]"
            />
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim()}
              className="absolute bottom-4 right-4 flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-xs font-bold uppercase tracking-widest text-slate-950 transition-all hover:bg-slate-200 disabled:opacity-20 active:scale-95 shadow-xl"
            >
              Generate <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">Quick Blueprints</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {BLUEPRINTS.map((bp) => (
                <button
                  key={bp.id}
                  onClick={() => applyBlueprint(bp)}
                  className="group flex items-center gap-2 rounded-xl border border-slate-800/50 bg-slate-900/20 px-4 py-2.5 transition-all hover:border-indigo-500/30 hover:bg-slate-900/50"
                >
                  <bp.icon className="h-3.5 w-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-white transition-colors">{bp.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-8 pt-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
             <button onClick={() => setState(AppState.IMAGE_EDIT)} className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest hover:text-white transition-colors">
               <ImageIcon className="h-4 w-4" /> Image Studio
             </button>
             <div className="h-1 w-1 rounded-full bg-slate-700"></div>
             <span className="text-xs font-medium uppercase tracking-widest">Single Page</span>
             <div className="h-1 w-1 rounded-full bg-slate-700"></div>
             <span className="text-xs font-medium uppercase tracking-widest">Mobile Native</span>
          </div>

          {error && (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-red-900/50 bg-red-950/20 px-4 py-2 text-xs font-medium text-red-400">
              <AlertCircle className="h-3 w-3" /> {error}
            </div>
          )}
        </div>
      </main>

      {renderFooter()}
    </div>
  );
};

export default App;
