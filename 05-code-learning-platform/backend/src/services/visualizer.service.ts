import { VisualizerTraceFrame } from '../types';

export class VisualizerService {
  /**
   * Generates step-by-step visualizer trace frames for array sorting algorithms
   */
  public generateSortingTrace(
    algorithm: 'bubble' | 'selection' | 'insertion',
    initialArray: number[]
  ): VisualizerTraceFrame[] {
    const frames: VisualizerTraceFrame[] = [];
    const arr = [...initialArray];
    let step = 0;

    frames.push({
      step: ++step,
      array: [...arr],
      pointers: { i: 0, j: 0 },
      description: 'Initial array state',
    });

    if (algorithm === 'bubble') {
      const n = arr.length;
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          frames.push({
            step: ++step,
            array: [...arr],
            pointers: { i, j, comparing: j + 1 },
            description: `Comparing elements at index ${j} (${arr[j]}) and ${j + 1} (${arr[j + 1]})`,
          });

          if (arr[j] > arr[j + 1]) {
            const temp = arr[j];
            arr[j] = arr[j + 1];
            arr[j + 1] = temp;

            frames.push({
              step: ++step,
              array: [...arr],
              pointers: { i, j: j + 1, swapped: 1 },
              description: `Swapped ${arr[j + 1]} and ${arr[j]} because ${arr[j + 1]} < ${arr[j]}`,
            });
          }
        }
      }
    } else if (algorithm === 'selection') {
      const n = arr.length;
      for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
          frames.push({
            step: ++step,
            array: [...arr],
            pointers: { i, j, currentMin: minIdx },
            description: `Comparing current minimum at index ${minIdx} (${arr[minIdx]}) with index ${j} (${arr[j]})`,
          });
          if (arr[j] < arr[minIdx]) {
            minIdx = j;
          }
        }

        if (minIdx !== i) {
          const temp = arr[i];
          arr[i] = arr[minIdx];
          arr[minIdx] = temp;
          frames.push({
            step: ++step,
            array: [...arr],
            pointers: { i, swappedWith: minIdx },
            description: `Placed minimum element ${arr[i]} into sorted index ${i}`,
          });
        }
      }
    }

    frames.push({
      step: ++step,
      array: [...arr],
      pointers: {},
      description: 'Sorting complete: Array is fully sorted',
    });

    return frames;
  }
}

export const visualizerService = new VisualizerService();
