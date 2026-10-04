import { describe, it, expect } from 'vitest';
import { parseText, plainText, glossaryRefs } from '../../src/story/text.js';

const vars = { name: 'Andres', title: 'Don' };

describe('parseText', () => {
  it('returns one text segment for plain text', () => {
    expect(parseText('Hello.', vars)).toEqual([{ kind: 'text', text: 'Hello.' }]);
  });

  it('substitutes name and title into the surrounding text', () => {
    expect(parseText('Welcome, {title} {name}!', vars)).toEqual([{ kind: 'text', text: 'Welcome, Don Andres!' }]);
  });

  it('turns glossary tokens into term segments', () => {
    expect(parseText('The {g:indio} and the {g:guardia_civil|Guardia Civil}.', vars)).toEqual([
      { kind: 'text', text: 'The ' },
      { kind: 'term', id: 'indio', text: 'indio' },
      { kind: 'text', text: ' and the ' },
      { kind: 'term', id: 'guardia_civil', text: 'Guardia Civil' },
      { kind: 'text', text: '.' },
    ]);
  });

  it('shows underscores as spaces when no display text is given', () => {
    expect(parseText('{g:bahay_na_bato}', vars)).toEqual([{ kind: 'term', id: 'bahay_na_bato', text: 'bahay na bato' }]);
  });

  it('leaves unknown tokens as literal text', () => {
    expect(plainText(parseText('{nope}', vars))).toBe('{nope}');
  });
});

describe('glossaryRefs', () => {
  it('lists glossary ids only', () => {
    expect(glossaryRefs('{name} {g:indio} {g:tinola|the soup}')).toEqual(['indio', 'tinola']);
  });
});
