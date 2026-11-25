const steps = [
  {
    index: '01',
    title: 'Read for seven minutes',
    body: 'A short lesson that explains one idea properly, with real code and the reasoning behind it. No 40-minute video, no filler.',
    artefact: '7 min average',
  },
  {
    index: '02',
    title: 'Write the code yourself',
    body: 'Every lesson ends in an editor with the exact brief. The preview updates as you type, so the feedback loop is immediate.',
    artefact: 'Real editor, real preview',
  },
  {
    index: '03',
    title: 'Prove it, then move on',
    body: 'Automated checks inspect the DOM, computed styles and function output — and tell you what is missing, not just that you failed.',
    artefact: 'Checks that explain',
  },
];

export function MethodSection() {
  return (
    <section className="section section--tint" id="method">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="eyebrow">The method</p>
            <h2 className="section-title">
              Small loops, <em>tight</em> feedback.
            </h2>
          </div>
          <p className="section-note">
            You learn a language by using it, not by watching someone else use it. Zuno is built around one loop,
            repeated until the syntax stops feeling foreign.
          </p>
        </div>

        <ol className="method-grid">
          {steps.map((step) => (
            <li key={step.index} className="method-step">
              <div className="method-step-top">
                <span className="method-index">{step.index}</span>
                <span className="method-tag mono">{step.artefact}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
