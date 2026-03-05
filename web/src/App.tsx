import { useState, useRef, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import {
  Bot, Send, Loader2, Terminal, FileCode, GitBranch,
  Globe, Brain, Cpu, Shield, Zap, Settings, Code,
  MessageSquare, ChevronRight, Copy, Check, Search,
  Clock, Wrench, Radio, PanelLeftClose, PanelLeft,
  Sparkles, HardDrive
} from 'lucide-react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'https://app-eqirvazw.fly.dev'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const CAPABILITIES = [
  { icon: Code, label: 'Code Generation', desc: 'Write, read, and edit code in any language', color: 'text-violet-400' },
  { icon: Terminal, label: 'Shell Execution', desc: 'Run commands, scripts, and build systems', color: 'text-green-400' },
  { icon: FileCode, label: 'File Operations', desc: 'Read, write, edit, and manage files', color: 'text-blue-400' },
  { icon: GitBranch, label: 'Git Operations', desc: 'Version control, branches, commits', color: 'text-orange-400' },
  { icon: Globe, label: 'Web Search', desc: 'Search the web and fetch content', color: 'text-cyan-400' },
  { icon: Brain, label: 'Memory System', desc: 'Persistent hybrid vector + FTS5 memory', color: 'text-pink-400' },
  { icon: Settings, label: 'Self-Modification', desc: 'Modify config, install skills, adapt behavior', color: 'text-yellow-400' },
  { icon: Sparkles, label: 'Subagents', desc: 'Delegate to specialized sub-agents', color: 'text-purple-400' },
  { icon: Clock, label: 'Scheduled Tasks', desc: 'Cron jobs and one-shot timers', color: 'text-emerald-400' },
  { icon: HardDrive, label: 'Hardware Control', desc: 'Arduino, RPi GPIO, STM32 peripherals', color: 'text-red-400' },
  { icon: Radio, label: '18+ Channels', desc: 'Slack, Discord, Telegram, Signal, Matrix...', color: 'text-indigo-400' },
  { icon: Shield, label: 'Security', desc: 'Sandboxed execution, encrypted secrets', color: 'text-amber-400' },
]

const QUICK_PROMPTS = [
  { icon: Code, label: 'Write me code', prompt: 'Write me a Python FastAPI server with a /hello endpoint that returns a greeting with the current time.' },
  { icon: Settings, label: 'Modify yourself', prompt: 'How would you modify your own configuration to switch from Gemini to Anthropic Claude as the default provider?' },
  { icon: Brain, label: 'Explain memory', prompt: 'Explain how your memory system works, including the hybrid vector + FTS5 search approach.' },
  { icon: Wrench, label: 'Show capabilities', prompt: 'What are all your tools and capabilities? List them with descriptions.' },
  { icon: Search, label: 'Research a topic', prompt: 'Research and explain WebAssembly edge deployment patterns for AI assistants.' },
  { icon: Cpu, label: 'Hardware setup', prompt: 'How would you set up to control an Arduino board? Walk me through the configuration.' },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = useCallback(() => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [text])
  return (
    <button
      onClick={copy}
      className="absolute top-2 right-2 p-1.5 rounded-md bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 hover:text-gray-200 transition-all opacity-0 group-hover:opacity-100"
      title="Copy code"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          const codeString = String(children).replace(/\n$/, '')
          if (match) {
            return (
              <div className="relative group my-3 rounded-lg overflow-hidden border border-gray-700/50">
                <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800/80 border-b border-gray-700/50">
                  <span className="text-xs text-gray-400 font-mono">{match[1]}</span>
                </div>
                <CopyButton text={codeString} />
                <SyntaxHighlighter
                  style={oneDark as Record<string, React.CSSProperties>}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    padding: '1rem',
                    background: 'rgb(17 20 28)',
                    fontSize: '0.8rem',
                    lineHeight: '1.5',
                  }}
                >
                  {codeString}
                </SyntaxHighlighter>
              </div>
            )
          }
          return (
            <code className="bg-gray-800/60 text-violet-300 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
              {children}
            </code>
          )
        },
        p({ children }) {
          return <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
        },
        ul({ children }) {
          return <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>
        },
        ol({ children }) {
          return <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>
        },
        h1({ children }) {
          return <h1 className="text-xl font-bold mb-2 mt-3 text-white">{children}</h1>
        },
        h2({ children }) {
          return <h2 className="text-lg font-bold mb-2 mt-3 text-white">{children}</h2>
        },
        h3({ children }) {
          return <h3 className="text-base font-semibold mb-1 mt-2 text-white">{children}</h3>
        },
        strong({ children }) {
          return <strong className="font-semibold text-white">{children}</strong>
        },
        a({ href, children }) {
          return <a href={href} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline">{children}</a>
        },
        blockquote({ children }) {
          return <blockquote className="border-l-2 border-violet-500/50 pl-3 my-2 text-gray-400 italic">{children}</blockquote>
        },
        table({ children }) {
          return <div className="overflow-x-auto my-2"><table className="min-w-full text-sm border border-gray-700 rounded">{children}</table></div>
        },
        th({ children }) {
          return <th className="px-3 py-1.5 bg-gray-800/50 border border-gray-700 text-left font-medium text-gray-300">{children}</th>
        },
        td({ children }) {
          return <td className="px-3 py-1.5 border border-gray-700/50 text-gray-300">{children}</td>
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const send = async (text?: string) => {
    const msgText = (text || input).trim()
    if (!msgText || loading) return
    const userMsg: Message = { role: 'user', content: msgText, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    if (inputRef.current) {
      inputRef.current.style.height = '44px'
    }

    try {
      const allMessages = [...messages, userMsg]
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply, timestamp: new Date() }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `**Connection Error**\n\n${err instanceof Error ? err.message : 'Failed to connect to nullclaw backend.'}`,
        timestamp: new Date()
      }])
    }
    setLoading(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const el = e.target
    el.style.height = '44px'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }

  return (
    <div className="h-screen flex bg-gray-950 text-gray-200 overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-0'} flex-shrink-0 transition-all duration-200 overflow-hidden border-r border-gray-800/50`}>
        <div className="w-72 h-full flex flex-col bg-gray-900/50">
          {/* Logo */}
          <div className="px-4 py-4 border-b border-gray-800/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                <Bot className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-white tracking-tight">nullclaw</h1>
                <p className="text-xs text-gray-500">AI Assistant Runtime</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="px-4 py-3 border-b border-gray-800/50">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-800/30 rounded-md py-1.5">
                <div className="text-xs font-bold text-violet-400">678KB</div>
                <div className="text-[10px] text-gray-500">Binary</div>
              </div>
              <div className="bg-gray-800/30 rounded-md py-1.5">
                <div className="text-xs font-bold text-green-400">&lt;2ms</div>
                <div className="text-[10px] text-gray-500">Startup</div>
              </div>
              <div className="bg-gray-800/30 rounded-md py-1.5">
                <div className="text-xs font-bold text-cyan-400">~1MB</div>
                <div className="text-[10px] text-gray-500">RAM</div>
              </div>
            </div>
          </div>

          {/* Capabilities */}
          <div className="flex-1 overflow-y-auto px-3 py-3">
            <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium px-1 mb-2">Capabilities</div>
            <div className="space-y-0.5">
              {CAPABILITIES.map((cap) => (
                <button
                  key={cap.label}
                  onClick={() => send(`Tell me about your ${cap.label.toLowerCase()} capability in detail.`)}
                  className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-gray-800/50 transition-colors group text-left"
                >
                  <cap.icon className={`w-3.5 h-3.5 ${cap.color} flex-shrink-0`} />
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors truncate">{cap.label}</div>
                    <div className="text-[10px] text-gray-500 truncate">{cap.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-800/50">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Zap className="w-3 h-3 text-violet-400" />
              <span>Powered by Gemini 2.5 Flash</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/50 bg-gray-900/30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-md hover:bg-gray-800/50 text-gray-400 hover:text-white transition-colors"
            >
              {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium text-white">Chat</span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{messages.length} messages</span>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-4">
              <div className="max-w-2xl w-full">
                <div className="text-center mb-10">
                  <div className="w-16 h-16 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-8 h-8 text-violet-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Talk to nullclaw</h2>
                  <p className="text-sm text-gray-400 max-w-md mx-auto">
                    Your autonomous AI assistant with 30+ tools, code generation, self-modification, and more. Ask me anything.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {QUICK_PROMPTS.map((qp) => (
                    <button
                      key={qp.label}
                      onClick={() => send(qp.prompt)}
                      className="flex items-start gap-3 p-3 rounded-xl border border-gray-800/50 bg-gray-900/30 hover:bg-gray-800/30 hover:border-gray-700/50 transition-all text-left group"
                    >
                      <qp.icon className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{qp.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{qp.prompt}</div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 mt-0.5 ml-auto flex-shrink-0 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}>
                  {m.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-violet-600/15 border border-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-violet-400" />
                    </div>
                  )}
                  <div className={`min-w-0 max-w-[85%] ${m.role === 'user' ? 'max-w-[70%]' : ''}`}>
                    <div className={`rounded-2xl px-4 py-3 text-sm ${
                      m.role === 'user'
                        ? 'bg-violet-600/15 border border-violet-500/20 text-gray-100 rounded-br-md'
                        : 'bg-gray-900/50 border border-gray-800/50 text-gray-200 rounded-bl-md'
                    }`}>
                      {m.role === 'assistant' ? (
                        <div className="prose-sm">
                          <MarkdownContent content={m.content} />
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">{m.content}</div>
                      )}
                    </div>
                    <div className={`text-[10px] text-gray-600 mt-1 ${m.role === 'user' ? 'text-right' : ''}`}>
                      {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-violet-600/15 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                  <div className="bg-gray-900/50 border border-gray-800/50 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin" />
                    <span className="text-xs text-gray-400">nullclaw is thinking...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-800/50 bg-gray-900/30 px-4 py-3">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-2 bg-gray-800/40 border border-gray-700/40 rounded-xl px-3 py-2 focus-within:border-violet-600/50 transition-colors">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Message nullclaw... (Enter to send, Shift+Enter for new line)"
                rows={1}
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none resize-none min-h-[28px] max-h-[160px] py-1"
                style={{ height: '28px' }}
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className={`p-2 rounded-lg transition-all flex-shrink-0 ${
                  input.trim() && !loading
                    ? 'bg-violet-600 hover:bg-violet-500 text-white'
                    : 'bg-gray-700/30 text-gray-600'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-gray-600 text-center mt-2">
              nullclaw web interface &middot; 678 KB binary &middot; 22+ providers &middot; 30+ tools
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
