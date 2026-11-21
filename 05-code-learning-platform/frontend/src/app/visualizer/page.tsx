'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AlgorithmVisualizerPage() {
  const [algorithm, setAlgorithm] = useState<'bubble' | 'selection'>('bubble');
  const [currentStep, setCurrentStep] = useState(0);

  // Pre-calculated trace frames for demo array [5, 2, 8, 1, 9]
  const bubbleFrames = [
    { array: [5, 2, 8, 1, 9], i: 0, j: 0, desc: 'Initial array state. Ready to compare elements.' },
    { array: [5, 2, 8, 1, 9], i: 0, j: 0, desc: 'Compare index 0 (5) and index 1 (2). 5 > 2, swap needed.' },
    { array: [2, 5, 8, 1, 9], i: 0, j: 1, desc: 'Swapped 5 and 2. Array: [2, 5, 8, 1, 9].' },
    { array: [2, 5, 8, 1, 9], i: 0, j: 1, desc: 'Compare index 1 (5) and index 2 (8). 5 < 8, no swap.' },
    { array: [2, 5, 8, 1, 9], i: 0, j: 2, desc: 'Compare index 2 (8) and index 3 (1). 8 > 1, swap needed.' },
    { array: [2, 5, 1, 8, 9], i: 0, j: 3, desc: 'Swapped 8 and 1. Array: [2, 5, 1, 8, 9].' },
    { array: [2, 5, 1, 8, 9], i: 0, j: 3, desc: 'Compare index 3 (8) and index 4 (9). 8 < 9, no swap.' },
    { array: [2, 5, 1, 8, 9], i: 1, j: 0, desc: 'Pass 1 complete. Element 9 is in its sorted position.' },
    { array: [2, 1, 5, 8, 9], i: 1, j: 1, desc: 'Pass 2: Swapped 5 and 1. Array: [2, 1, 5, 8, 9].' },
    { array: [1, 2, 5, 8, 9], i: 2, j: 0, desc: 'Pass 3: Swapped 2 and 1. Array is now sorted: [1, 2, 5, 8, 9].' },
  ];

  const frames = bubbleFrames;
  const frame = frames[currentStep] || frames[0];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Interactive Algorithm Visualizer</h1>
          <p className="text-sm text-slate-400 mt-1">
            Observe sorting algorithms manipulate memory in real-time step-by-step
          </p>
        </div>
        <select
          value={algorithm}
          onChange={e => {
            setAlgorithm(e.target.value as any);
            setCurrentStep(0);
          }}
          className="bg-[#161b22] border border-[#30363d] text-white rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none"
        >
          <option value="bubble">Bubble Sort (O(n²))</option>
          <option value="selection">Selection Sort (O(n²))</option>
        </select>
      </div>

      {/* Visualizer Canvas */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 space-y-8 shadow-xl">
        {/* Animated Bar Representation */}
        <div className="h-64 flex items-end justify-center gap-6 pt-8 pb-4 border-b border-[#30363d]">
          {frame.array.map((val, idx) => {
            const isComparing = idx === frame.j || idx === frame.j + 1;
            const heightPercent = val * 10;

            return (
              <div key={idx} className="flex flex-col items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-300">{val}</span>
                <div
                  style={{ height: `${heightPercent * 2.2}px` }}
                  className={`w-14 rounded-t-lg transition-all duration-300 flex items-end justify-center pb-2 font-mono text-xs font-black ${
                    isComparing
                      ? 'bg-orange-500 shadow-lg shadow-orange-500/20 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  [{idx}]
                </div>
              </div>
            );
          })}
        </div>

        {/* Step Explanation Banner */}
        <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 flex items-center justify-between text-sm">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold text-emerald-400">
              Step {currentStep + 1} of {frames.length}
            </span>
            <p className="text-slate-200 font-medium">{frame.desc}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
            <span className="text-xs text-slate-400">Comparing</span>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="bg-[#21262d] hover:bg-[#30363d] disabled:opacity-40 text-slate-200 font-semibold px-4 py-2 rounded-lg text-xs font-mono transition"
          >
            &larr; Step Back
          </button>
          <button
            onClick={() => setCurrentStep(0)}
            className="bg-[#21262d] hover:bg-[#30363d] text-slate-200 font-semibold px-4 py-2 rounded-lg text-xs font-mono transition"
          >
            Reset
          </button>
          <button
            onClick={() => setCurrentStep(Math.min(frames.length - 1, currentStep + 1))}
            disabled={currentStep === frames.length - 1}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold px-5 py-2 rounded-lg text-xs font-mono shadow transition"
          >
            Step Forward &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
