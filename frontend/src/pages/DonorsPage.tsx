import { useMemo, useState } from 'react'

type Supporter = {
  id: number
  name: string
  type: 'Monetary' | 'Volunteer' | 'Skills' | 'Advocacy' | 'In-Kind'
  status: 'Active' | 'Inactive'
  location: string
  contact: string
  lastContribution: string
  notes: string
}

const supporters: Supporter[] = [
  {
    id: 1,
    name: 'Camino Foundation',
    type: 'Monetary',
    status: 'Active',
    location: 'Bogota',
    contact: 'partnerships@camino.org',
    lastContribution: '$24,000 restricted to housing',
    notes: 'Prefers quarterly stewardship updates and survivor outcome summaries.',
  },
  {
    id: 2,
    name: 'Dr. Sofia Rojas',
    type: 'Skills',
    status: 'Active',
    location: 'Medellin',
    contact: 'sofia.rojas@example.org',
    lastContribution: '16 trauma counseling hours',
    notes: 'Available two Saturdays per month for staff consultation.',
  },
  {
    id: 3,
    name: 'Iglesia Puerta Abierta',
    type: 'In-Kind',
    status: 'Active',
    location: 'Cali',
    contact: 'missions@puertaabierta.co',
    lastContribution: 'Bedding, hygiene kits, school backpacks',
    notes: 'Seasonal drives perform best in August and December.',
  },
  {
    id: 4,
    name: 'Ava Thompson',
    type: 'Volunteer',
    status: 'Inactive',
    location: 'Remote',
    contact: 'ava.t@example.com',
    lastContribution: '42 translation hours',
    notes: 'Paused service while relocating, re-engagement likely in summer.',
  },
  {
    id: 5,
    name: 'Northfield Student Network',
    type: 'Advocacy',
    status: 'Active',
    location: 'Utah',
    contact: 'northfieldnetwork@example.edu',
    lastContribution: 'Social campaign reached 18,200 accounts',
    notes: 'Interested in coordinating an annual awareness series.',
  },
]

const allocations = [
  { area: 'Safehouse operations', amount: '41%', detail: 'Food, utilities, transport, household support' },
  { area: 'Clinical and case care', amount: '24%', detail: 'Counseling, assessments, case conferences' },
  { area: 'Education and reintegration', amount: '19%', detail: 'School fees, tutoring, transition planning' },
  { area: 'Legal and family advocacy', amount: '10%', detail: 'Documentation, hearings, protective coordination' },
  { area: 'Emergency reserve', amount: '6%', detail: 'Immediate placement and crisis stabilization' },
]

const contributionLedger = [
  { date: 'Apr 1', supporter: 'Camino Foundation', type: 'Monetary', value: '$24,000', allocation: 'Safehouse operations' },
  { date: 'Mar 28', supporter: 'Dr. Sofia Rojas', type: 'Skills', value: '16 hrs', allocation: 'Clinical and case care' },
  { date: 'Mar 25', supporter: 'Iglesia Puerta Abierta', type: 'In-Kind', value: '84 kits', allocation: 'Safehouse operations' },
  { date: 'Mar 20', supporter: 'Northfield Student Network', type: 'Advocacy', value: '18.2k reach', allocation: 'Awareness and referrals' },
]

export function DonorsPage() {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')

  const filteredSupporters = useMemo(() => {
    return supporters.filter((supporter) => {
      const matchesType = typeFilter === 'All' || supporter.type === typeFilter
      const matchesQuery =
        supporter.name.toLowerCase().includes(query.toLowerCase()) ||
        supporter.contact.toLowerCase().includes(query.toLowerCase()) ||
        supporter.location.toLowerCase().includes(query.toLowerCase())

      return matchesType && matchesQuery
    })
  }, [query, typeFilter])

  return (
    <div className="pageStack">
      <section className="pageIntro">
        <p className="eyebrow">Staff interface</p>
        <h1>Donors & contributions</h1>
        <p className="lede">
          Track every kind of support in one place: financial gifts, volunteer time, in-kind
          donations, professional services, and advocacy.
        </p>
      </section>

      <section className="controlBar">
        <label className="field">
          <span>Search supporters</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, contact, or location"
          />
        </label>
        <label className="field">
          <span>Filter by supporter type</span>
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            <option>All</option>
            <option>Monetary</option>
            <option>Volunteer</option>
            <option>Skills</option>
            <option>Advocacy</option>
            <option>In-Kind</option>
          </select>
        </label>
      </section>

      <section className="metricsRow">
        <article className="metricCard">
          <span>Total active supporters</span>
          <strong>84</strong>
          <p>Across individual, church, foundation, and professional contributor relationships.</p>
        </article>
        <article className="metricCard">
          <span>Volunteer and skills hours</span>
          <strong>312</strong>
          <p>Logged in the last 90 days, including therapy, translation, and legal support.</p>
        </article>
        <article className="metricCard">
          <span>Unrestricted giving ratio</span>
          <strong>38%</strong>
          <p>Flexible funding available for crisis placements, transit, and urgent household needs.</p>
        </article>
      </section>

      <section className="tableSection" id="supporter-types">
        <div className="sectionHeading compact">
          <h2>Supporter profiles</h2>
          <button className="button">Create supporter</button>
        </div>
        <div className="dataTable">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Contact</th>
                <th>Last contribution</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredSupporters.map((supporter) => (
                <tr key={supporter.id}>
                  <td>
                    <strong>{supporter.name}</strong>
                    <div>{supporter.location}</div>
                  </td>
                  <td>{supporter.type}</td>
                  <td>{supporter.status}</td>
                  <td>{supporter.contact}</td>
                  <td>{supporter.lastContribution}</td>
                  <td>{supporter.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="twoColumnGrid">
        <article className="panelCard">
          <div className="sectionHeading compact">
            <h2>Allocation overview</h2>
            <p>How current donations are distributed across core program areas.</p>
          </div>
          <div className="allocationList">
            {allocations.map((item) => (
              <div key={item.area} className="allocationRow">
                <div>
                  <strong>{item.area}</strong>
                  <p>{item.detail}</p>
                </div>
                <span>{item.amount}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panelCard">
          <div className="sectionHeading compact">
            <h2>Recent contribution log</h2>
            <p>Latest supporter activity across all contribution types.</p>
          </div>
          <div className="miniLedger">
            {contributionLedger.map((entry) => (
              <div key={`${entry.date}-${entry.supporter}`} className="ledgerRow">
                <div>
                  <strong>{entry.supporter}</strong>
                  <p>
                    {entry.type} · {entry.allocation}
                  </p>
                </div>
                <div>
                  <strong>{entry.value}</strong>
                  <p>{entry.date}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}
