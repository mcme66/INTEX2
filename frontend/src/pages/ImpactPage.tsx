const impactMetrics = [
  { label: 'Children served across partner safehouses', value: '126', note: 'Rolling 12-month total, anonymized and aggregated.' },
  { label: 'Average stabilization window', value: '17 days', note: 'Time from crisis intake to documented care plan.' },
  { label: 'Education re-entry or continuation', value: '81%', note: 'Children connected to school placement or tutoring support.' },
  { label: 'Funds deployed directly to care programs', value: '94%', note: 'Administrative overhead excluded from this view.' },
]

const milestoneSeries = [
  { label: 'Q2', value: 42 },
  { label: 'Q3', value: 51 },
  { label: 'Q4', value: 63 },
  { label: 'Q1', value: 68 },
]

const stewardshipNotes = [
  'All figures shown here are aggregated and anonymized to protect children and partner locations.',
  'No case-level information, photographs, or personally identifying stories are used in donor-facing reporting.',
  'Outcome reporting combines safehouse, counseling, education, and case-conference records into summary indicators.',
]

export function ImpactPage() {
  const maxValue = Math.max(...milestoneSeries.map((item) => item.value))

  return (
    <div className="pageStack">
      <section className="pageIntro">
        <p className="eyebrow">Donor-facing dashboard</p>
        <h1>Impact in view, privacy intact.</h1>
        <p className="lede">
          Donors should be able to see what their support makes possible without asking children to
          surrender their privacy to prove that the work matters.
        </p>
      </section>

      <section className="metricsGrid">
        {impactMetrics.map((metric) => (
          <article key={metric.label} className="metricCard tall">
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <p>{metric.note}</p>
          </article>
        ))}
      </section>

      <section className="twoColumnGrid">
        <article className="panelCard">
          <div className="sectionHeading compact">
            <h2>Milestone progress</h2>
            <p>Program milestones completed by quarter across all active safehouse partners.</p>
          </div>
          <div className="barChart" aria-label="Quarterly milestones">
            {milestoneSeries.map((item) => (
              <div key={item.label} className="barGroup">
                <div className="barTrack">
                  <div
                    className="barFill"
                    style={{ height: `${(item.value / maxValue) * 100}%` }}
                    aria-hidden="true"
                  />
                </div>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panelCard">
          <div className="sectionHeading compact">
            <h2>Resource use</h2>
            <p>How current donor funding is being used across the care model.</p>
          </div>
          <div className="resourceBreakdown">
            <div className="resourceRow">
              <span>Housing and essentials</span>
              <strong>43%</strong>
            </div>
            <div className="resourceRow">
              <span>Clinical care</span>
              <strong>26%</strong>
            </div>
            <div className="resourceRow">
              <span>Education support</span>
              <strong>18%</strong>
            </div>
            <div className="resourceRow">
              <span>Legal and reunification support</span>
              <strong>13%</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="storyBand" id="stewardship">
        <div className="storyColumn">
          <p className="eyebrow">Reporting practice</p>
          <h2>Stewardship means evidence, not exposure.</h2>
        </div>
        <div className="storyColumn">
          {stewardshipNotes.map((note) => (
            <p key={note}>{note}</p>
          ))}
        </div>
      </section>
    </div>
  )
}
