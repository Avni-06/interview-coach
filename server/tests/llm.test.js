const { z } = require('zod');

jest.mock('../config/groq', () => ({
  chat: { completions: { create: jest.fn() } },
}));
const groq = require('../config/groq');
const { callJSON, safeText } = require('../utils/llm');

const reply = (content) => ({ choices: [{ message: { content } }] });
const schema = z.object({ ok: z.boolean() });

beforeEach(() => {
  groq.chat.completions.create.mockReset();
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('callJSON', () => {
  test('returns parsed data on first success', async () => {
    groq.chat.completions.create.mockResolvedValueOnce(reply('{"ok":true}'));
    await expect(callJSON({ system: 's', user: 'u', schema })).resolves.toEqual({ ok: true });
    expect(groq.chat.completions.create).toHaveBeenCalledTimes(1);
  });

  test('retries after malformed JSON, then succeeds', async () => {
    groq.chat.completions.create
      .mockResolvedValueOnce(reply('not json at all'))
      .mockResolvedValueOnce(reply('{"ok":true}'));
    await expect(callJSON({ system: 's', user: 'u', schema })).resolves.toEqual({ ok: true });
    expect(groq.chat.completions.create).toHaveBeenCalledTimes(2);
  });

  test('retries when output fails schema validation', async () => {
    groq.chat.completions.create
      .mockResolvedValueOnce(reply('{"ok":"yes"}'))
      .mockResolvedValueOnce(reply('{"ok":false}'));
    await expect(callJSON({ system: 's', user: 'u', schema })).resolves.toEqual({ ok: false });
  });

  test('throws a 502 after exhausting retries', async () => {
    groq.chat.completions.create.mockResolvedValue(reply('garbage'));
    await expect(callJSON({ system: 's', user: 'u', schema, retries: 1 })).rejects.toMatchObject({ status: 502 });
    expect(groq.chat.completions.create).toHaveBeenCalledTimes(2);
  });

  test('requests JSON mode with low temperature by default', async () => {
    groq.chat.completions.create.mockResolvedValueOnce(reply('{"ok":true}'));
    await callJSON({ system: 's', user: 'u', schema });
    const body = groq.chat.completions.create.mock.calls[0][0];
    expect(body.response_format).toEqual({ type: 'json_object' });
    expect(body.temperature).toBe(0.2);
  });
});

describe('safeText', () => {
  test('strips characters that could break out of a prompt', () => {
    expect(safeText('Frontend Dev"}] <script>')).toBe('Frontend Dev script');
  });
  test('caps length', () => {
    expect(safeText('a'.repeat(200)).length).toBe(60);
  });
});
