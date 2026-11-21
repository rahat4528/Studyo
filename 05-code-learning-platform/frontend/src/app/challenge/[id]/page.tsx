'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ChallengeIDEPage({ params }: { params: { id: string } }) {
  const [language, setLanguage] = useState<'javascript' | 'python' | 'typescript'>('javascript');
  const [code, setCode] = useState(`function solution(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`);

  const [activeTab, setActiveTab] = useState<'testcases' | 'console'>('testcases');
  const [selectedCase, setSelectedCase] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [verdict, setVerdict] = useState<'IDLE' | 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED'>('IDLE');

  const testCases = [
    { input: 'nums = [2, 7, 11, 15], target = 9', expected: '[0, 1]', actual: '[0, 1]', passed: true },
    { input: 'nums = [3, 2, 4], target = 6', expected: '[1, 2]', actual: '[1, 2]', passed: true },
    { input: 'nums = [3, 3], target = 6', expected: '[0, 1]', actual: '[0, 1]', passed: true },
  ];

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setVerdict('ACCEPTED');
    }, 600);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-[#0d1117] text-[#e6edf3]">
      {/* Challenge Navigation Bar */}
      <div className="h-10 bg-[#161b22] border-b border-[#30363d] px-4 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-slate-400 hover:text-white font-sans">
            &larr; Problem List
          </Link>
          <span className="text-slate-600">|</span>
          <span className="font-bold text-white">Two Sum</span>
          <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded text-[10px]">
            Easy
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-purple-400 font-bold">+50 XP</span>
          <span className="text-slate-500">&middot;</span>
          <span className="text-slate-400">Time Limit: 3.0s</span>
          <span className="text-slate-500">&middot;</span>
          <span className="text-slate-400">Memory: 128 MB</span>
        </div>
      </div>

      {/* Main Split-Pane Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: Problem Description */}
        <div className="w-1/2 border-r border-[#30363d] overflow-y-auto p-6 space-y-6 text-sm">
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white font-sans">Two Sum</h1>
            <p className="text-slate-300 leading-relaxed">
              Given an array of integers <code className="bg-[#161b22] px-1.5 py-0.5 rounded text-emerald-400 font-mono">nums</code> and an integer <code className="bg-[#161b22] px-1.5 py-0.5 rounded text-emerald-400 font-mono">target</code>, return <em>indices of the two numbers such that they add up to <code className="text-emerald-400 font-mono">target</code></em>.
            </p>
            <p className="text-slate-300 leading-relaxed">
              You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice. You can return the answer in any order.
            </p>
          </div>

          {/* Examples */}
          <div className="space-y-4">
            <h3 className="font-bold text-white text-base font-sans">Examples</h3>
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 font-mono text-xs space-y-1.5">
              <div><span className="text-slate-400">Input:</span> nums = [2,7,11,15], target = 9</div>
              <div><span className="text-slate-400">Output:</span> [0,1]</div>
              <div className="text-slate-400 pt-1 font-sans text-xs">Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].</div>
            </div>
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 font-mono text-xs space-y-1.5">
              <div><span className="text-slate-400">Input:</span> nums = [3,2,4], target = 6</div>
              <div><span className="text-slate-400">Output:</span> [1,2]</div>
            </div>
          </div>

          {/* Constraints */}
          <div className="space-y-2">
            <h3 className="font-bold text-white text-base font-sans">Constraints</h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-300 font-mono text-xs">
              <li>2 &le; nums.length &le; 10<sup>4</sup></li>
              <li>-10<sup>9</sup> &le; nums[i] &le; 10<sup>9</sup></li>
              <li>-10<sup>9</sup> &le; target &le; 10<sup>9</sup></li>
              <li>Only one valid answer exists.</li>
            </ul>
          </div>
        </div>

        {/* Right Pane: Code Editor + Test Console */}
        <div className="w-1/2 flex flex-col bg-[#0d1117]">
          {/* Editor Header */}
          <div className="h-10 bg-[#161b22] border-b border-[#30363d] px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as any)}
                className="bg-[#0d1117] border border-[#30363d] text-xs font-mono text-slate-200 rounded px-2.5 py-1 focus:outline-none focus:border-emerald-500"
              >
                <option value="javascript">JavaScript (Node.js 20)</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python 3.11</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRun}
                disabled={isRunning}
                className="bg-[#21262d] hover:bg-[#30363d] text-slate-200 px-3 py-1 rounded text-xs font-semibold font-mono transition"
              >
                {isRunning ? 'Running...' : 'Run Tests'}
              </button>
              <button
                onClick={handleRun}
                disabled={isRunning}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1 rounded text-xs font-bold font-mono shadow transition"
              >
                {isRunning ? 'Evaluating...' : 'Submit'}
              </button>
            </div>
          </div>

          {/* Code Textarea / Editor Area */}
          <div className="flex-1 p-4 font-mono text-sm overflow-hidden flex flex-col">
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              className="w-full flex-1 bg-transparent text-[#e6edf3] font-mono text-sm leading-relaxed focus:outline-none resize-none selection:bg-emerald-900"
              spellCheck={false}
            />
          </div>

          {/* Test Case & Console Results Drawer */}
          <div className="h-56 bg-[#161b22] border-t border-[#30363d] flex flex-col text-xs font-mono">
            <div className="h-9 border-b border-[#30363d] px-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveTab('testcases')}
                  className={`font-bold transition ${activeTab === 'testcases' ? 'text-emerald-400 border-b-2 border-emerald-400 pb-1.5' : 'text-slate-400'}`}
                >
                  Test Cases ({testCases.length})
                </button>
                <button
                  onClick={() => setActiveTab('console')}
                  className={`font-bold transition ${activeTab === 'console' ? 'text-emerald-400 border-b-2 border-emerald-400 pb-1.5' : 'text-slate-400'}`}
                >
                  Stdout Console
                </button>
              </div>

              {verdict === 'ACCEPTED' && (
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span>✓ ACCEPTED</span>
                  <span className="text-slate-500">&middot;</span>
                  <span className="text-slate-400">3/3 Passed (42ms)</span>
                </div>
              )}
            </div>

            {/* Test Case Content */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {activeTab === 'testcases' ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    {testCases.map((tc, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedCase(idx)}
                        className={`px-3 py-1 rounded text-xs font-semibold ${
                          selectedCase === idx
                            ? 'bg-[#30363d] text-white'
                            : 'bg-[#21262d] text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Case {idx + 1}
                      </button>
                    ))}
                  </div>

                  <div className="bg-[#0d1117] p-3 rounded border border-[#30363d] space-y-2">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Input</span>
                      <span className="text-slate-200">{testCases[selectedCase].input}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Expected Output</span>
                      <span className="text-emerald-400">{testCases[selectedCase].expected}</span>
                    </div>
                    {verdict !== 'IDLE' && (
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Actual Output</span>
                        <span className="text-emerald-400">{testCases[selectedCase].actual}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-[#0d1117] p-3 rounded border border-[#30363d] text-slate-400 min-h-full">
                  [Sandboxed Worker]: Execution completed in 42ms. Zero memory violations detected.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
