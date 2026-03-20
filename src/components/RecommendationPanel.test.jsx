/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import RecommendationPanel from './RecommendationPanel.jsx';

let originalMatchMedia;

describe('RecommendationPanel', () => {
  beforeAll(() => {
    originalMatchMedia = window.matchMedia;
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
  });

  afterAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: originalMatchMedia
    });
  });

  it('点击查看详情后打开承接抽屉', async () => {
    render(
      <RecommendationPanel
        loading={false}
        recommendations={{
          advisors: [
            {
              id: 'advisor_001',
              title: '事业方向深度咨询',
              description: '适合对工作选择有疑问的用户。',
              priceLabel: '¥99 起',
              targetUrl: '/consultants/career-001',
              highlights: ['聚焦职业定位'],
              deliveryType: '图文 / 语音 1 对 1',
              serviceSteps: ['提交 AI 报告'],
              ctaLabel: '预约咨询'
            }
          ],
          products: []
        }}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '查看详情' }));

    const dialog = await screen.findByRole('dialog', { name: '事业方向深度咨询' });

    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('交付方式')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: '预约咨询' })).toBeInTheDocument();
  });
});
