const residentStats = [
  { label: 'Active residents', value: '28' },
  { label: 'Partner safehouses', value: '4' },
  { label: 'Open care plans', value: '19' },
  { label: 'Urgent placement requests', value: '3' },
]

const conferences = [
  { title: 'Case review · Bogota House', date: 'Apr 7 · 9:00 AM', detail: 'Clinical lead, education liaison, housing coordinator' },
  { title: 'Transition planning · Medellin', date: 'Apr 8 · 2:30 PM', detail: 'Reintegration plan and school enrollment review' },
  { title: 'Legal coordination huddle', date: 'Apr 10 · 11:00 AM', detail: 'Protective order updates and documentation status' },
]

const recentDonations = [
  { source: 'Camino Foundation', amount: '$24,000', note: 'Restricted housing support' },
  { source: 'Cali Community Drive', amount: '84 kits', note: 'Emergency essentials delivered' },
  { source: 'Dr. Sofia Rojas', amount: '16 hrs', note: 'Clinical consultation donated' },
]

const progressSummary = [
  { name: 'Stabilized cases this month', value: '11' },
  { name: 'Education placements in progress', value: '7' },
  { name: 'Family reunification reviews', value: '5' },
  { name: 'Cases closed with long-term plan', value: '4' },
]

export function AdminDashboardPage() {
  return (
    <div className="pageStack">
      <section className="pageIntro">
        <p className="eyebrow">Operations dashboard</p>
        <h1>Command center for current activity</h1>
        <p className="lede">
          A staff view focused on live operations: resident load, current giving, scheduled case
          conferences, and progress signals that need attention.
        </p>
      </section>

      <section className="metricsGrid">
        {residentStats.map((stat) => (
          <article key={stat.label} className="metricCard">
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </section>

      <section className="twoColumnGrid">
        <article className="panelCard">
          <div className="sectionHeading compact">
            <h2>Upcoming case conferences</h2>
            <p>Meetings requiring cross-functional coordination in the next seven days.</p>
          </div>
          <div className="miniLedger">
            {conferences.map((conference) => (
              <div key={conference.title} className="ledgerRow">
                <div>
                  <strong>{conference.title}</strong>
                  <p>{conference.detail}</p>
                </div>
                <div>
                  <strong>{conference.date}</strong>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panelCard">
          <div className="sectionHeading compact">
            <h2>Recent donations</h2>
            <p>Latest contributions available for review and acknowledgment.</p>
          </div>
          <div className="miniLedger">
            {recentDonations.map((donation) => (
              <div key={donation.source} className="ledgerRow">
                <div>
                  <strong>{donation.source}</strong>
                  <p>{donation.note}</p>
                </div>
                <div>
                  <strong>{donation.amount}</strong>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="panelCard">
        <div className="sectionHeading compact">
          <h2>Summarized progress</h2>
          <p>Current program movement across care planning and case outcomes.</p>
        </div>
        <div className="progressGrid">
          {progressSummary.map((item) => (
            <article key={item.name} className="progressTile">
              <strong>{item.value}</strong>
              <span>{item.name}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
