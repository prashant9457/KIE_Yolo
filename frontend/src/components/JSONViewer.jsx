import React, { useState } from 'react';
import { Copy, Check, Download, FileJson } from 'lucide-react';

const JSONViewer = ({ jsonData, title = "Structured Output (JSON)" }) => {
  const [copied, setCopied] = useState(false);

  const formattedJson = JSON.stringify(jsonData, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([formattedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ingredient_extraction_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Custom regex syntax highlighting for presentation
  const syntaxHighlight = (jsonStr) => {
    if (!jsonStr) return "";
    
    // Escape HTML characters
    let escaped = jsonStr
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Regex replacement for JSON keys, strings, numbers, booleans
    return escaped.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        let cls = 'text-amber-600'; // number
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'text-brand-600 font-semibold'; // key
          } else {
            cls = 'text-emerald-600'; // string
          }
        } else if (/true|false/.test(match)) {
          cls = 'text-purple-600 font-bold'; // boolean
        } else if (/null/.test(match)) {
          cls = 'text-slate-400 font-bold'; // null
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  };

  const highlightedCode = syntaxHighlight(formattedJson);
  const lines = formattedJson.split('\n');

  return (
    <div className="bg-slate-900 rounded-2xl p-6 shadow-xl shadow-slate-900/10 text-slate-100 flex flex-col h-full border border-slate-800">
      {/* Header Panel */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <FileJson className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-200 tracking-tight text-sm">{title}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Parsed nutrition and allergen structure</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Copy Button */}
          <button 
            onClick={handleCopy}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all duration-200 ${
              copied 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 hover:border-slate-600 text-slate-300'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Download Button */}
          <button 
            onClick={handleDownload}
            className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 shadow-md shadow-brand-900/20 border border-brand-500"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 overflow-auto rounded-xl bg-slate-950/80 border border-slate-850 p-4 font-mono text-[11px] leading-relaxed max-h-[450px] relative">
        <div className="flex">
          {/* Line Numbers */}
          <div className="text-slate-700 select-none text-right pr-4 border-r border-slate-800 text-[10px] w-8">
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {/* Code Area */}
          <pre 
            className="pl-4 overflow-x-auto whitespace-pre select-text flex-1"
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </div>
      </div>
    </div>
  );
};

export default JSONViewer;
