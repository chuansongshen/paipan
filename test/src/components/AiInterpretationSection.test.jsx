/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import AiInterpretationSection from '../../../src/components/AiInterpretationSection.jsx';

let originalMatchMedia;
let originalResizeObserver;

const mockFlow = {
  question: '',
  setQuestion: vi.fn(),
  report: null,
  followUps: [],
  followUpInput: '',
  setFollowUpInput: vi.fn(),
  recommendations: {
    advisors: [],
    products: []
  },
  reportLoading: false,
  followUpLoading: false,
  followUpPackLoading: false,
  recommendationLoading: false,
  reportError: '',
  followUpError: '',
  followUpPackError: '',
  reportUnlockPriceLabel: '¥4.9',
  followUpPackPriceLabel: '¥9.9',
  submitReport: vi.fn(),
  submitFollowUp: vi.fn(),
  purchaseFollowUpPack: vi.fn()
};

describe('AiInterpretationSection', () => {
  beforeAll(() => {
    originalMatchMedia = window.matchMedia;
    originalResizeObserver = globalThis.ResizeObserver;
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }))
    });
    globalThis.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  afterAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: originalMatchMedia
    });
    globalThis.ResizeObserver = originalResizeObserver;
  });

  it('渲染统一的 AI 解读、追问和推荐区域', () => {
    render(
      <AiInterpretationSection
        disabledReason=""
        flow={mockFlow}
      />
    );

    expect(screen.getByText('使用说明')).toBeInTheDocument();
    expect(screen.getByText('AI 解读')).toBeInTheDocument();
    expect(screen.getByText('继续追问')).toBeInTheDocument();
    expect(screen.getByText('延伸推荐')).toBeInTheDocument();
  });

  it('透传禁用原因到报告面板', () => {
    render(
      <AiInterpretationSection
        disabledReason="紫微斗数排盘加载中，请稍后再试。"
        flow={mockFlow}
      />
    );

    expect(screen.getByText('紫微斗数排盘加载中，请稍后再试。')).toBeInTheDocument();
  });
});
