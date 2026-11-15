import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import App from './App';

test('renders the app shell with the three navigation tabs', async () => {
  render(<App />);

  const labels = await screen.findAllByText(/^(Kebun|Tanaman|Grafik)$/);
  expect(labels.length).toBeGreaterThanOrEqual(3);
});
