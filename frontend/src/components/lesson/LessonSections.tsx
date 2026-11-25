import type { Section } from '../../lib/types';
import { CodeTokens } from '../ui/CodeTokens';
import { Inline } from './Inline';

export function LessonSections({ sections }: { sections: Section[] }) {
  return (
    <div className="prose">
      {sections.map((section, index) => {
        if (section.type === 'text') {
          return (
            <p key={index}>
              <Inline text={section.body} />
            </p>
          );
        }
        if (section.type === 'code') {
          return (
            <figure key={index} className="code-figure">
              <div className="code-figure-bar">
                <span>{section.language}</span>
              </div>
              <pre>
                <code>
                  <CodeTokens code={section.code} language={section.language} />
                </code>
              </pre>
              {section.caption && <figcaption>{section.caption}</figcaption>}
            </figure>
          );
        }
        if (section.type === 'list') {
          return (
            <ul key={index} className="prose-list">
              {section.items.map((item) => (
                <li key={item}>
                  <span className="prose-bullet" aria-hidden="true" />
                  <span>
                    <Inline text={item} />
                  </span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <aside key={index} className={`callout callout--${section.tone}`}>
            <p className="callout-title">{section.title}</p>
            <p>
              <Inline text={section.body} />
            </p>
          </aside>
        );
      })}
    </div>
  );
}
