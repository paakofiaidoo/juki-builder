import {
  attachInstruction as attachTreeInstruction,
  extractInstruction as extractTreeInstruction,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item';
import {
  attachClosestEdge,
  extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import {
  ElementDragPayload,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { Instruction } from '../types';


export function getInstruction(
  userData: Record<string | symbol, unknown>,
  canHaveChildren: boolean
): Instruction | null {
  if (canHaveChildren) {
    const instruction = extractTreeInstruction(userData);
    if (instruction?.type === 'instruction-blocked') {
      return null;
    }
    return instruction?.type ?? null;
  }
  const edge = extractClosestEdge(userData);
  if (edge === 'top') {
    return 'reorder-above';
  }
  if (edge === 'bottom') {
    return 'reorder-below';
  }
  return null;
}

export function attachInstruction(
  userData: Record<string | symbol, unknown>,
  args: {
    input: ElementDragPayload['input'];
    element: HTMLElement;
    canHaveChildren: boolean;
    currentLevel: number;
  }
) {
  if (args.canHaveChildren) {
    return attachTreeInstruction(userData, {
      element: args.element,
      input: args.input,
      currentLevel: args.currentLevel,
      indentPerLevel: 20,
      mode: 'standard',
    });
  }
  return attachClosestEdge(userData, {
    element: args.element,
    input: args.input,
    allowedEdges: ['top', 'bottom'],
  });
}