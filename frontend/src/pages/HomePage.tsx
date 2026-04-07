import { Link } from 'react-router-dom'

const priorities = [
  {
    title: 'Immediate refuge',
    text: 'Safe housing, food, transport coordination, and crisis response arranged around the child rather than the system.',
  },
  {
    title: 'Trauma-informed care',
    text: 'Case planning, counseling referrals, education support, and daily routines that restore stability with dignity.',
  },
  {
    title: 'Long-term restoration',
    text: 'Family coordination where appropriate, legal advocacy support, and practical steps toward lasting safety.',
  },
]

const commitments = [
  'Board members need a site that communicates the mission clearly and reports progress responsibly.',
  'Donors need a credible window into how contributions are allocated without exposing private resident data.',
  'Volunteers and skilled contributors need clear entry points to offer time, services, and long-term support.',
]

export function HomePage() {
  return (
    <div className="pageStack">
      <section className="heroGrid">
        <div className="heroCopy">
          <p className="eyebrow">North Star</p>
          <h1>A place to look toward when safety, guidance, and refuge are urgently needed.</h1>
          <p className="lede">
            North Star supports children recovering from trafficking and abuse in Colombia through
            safe shelter partnerships, case coordination, and the steady work of restoration.
          </p>
          <div className="ctaRow">
            <Link className="button" to="/impact">
              View impact
            </Link>
            <Link className="button buttonGhost" to="/donors">
              Explore ways to help
            </Link>
          </div>
        </div>

        <aside className="heroPanel">
          <p className="panelLabel">Why this site exists</p>
          {commitments.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </aside>
      </section>

      <section className="splitSection">
        <div className="sectionHeading">
          <p className="eyebrow">What we do</p>
          <h2>North Star is structured around practical protection, not abstract awareness.</h2>
        </div>
        <div className="priorityList">
          {priorities.map((priority) => (
            <article key={priority.title} className="priorityItem">
              <h3>{priority.title}</h3>
              <p>{priority.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="storyBand">
        <div className="storyColumn">
          <p className="eyebrow">For administrators and board members</p>
          <h2>Use the website as a public front door and an internal reporting surface.</h2>
        </div>
        <div className="storyColumn">
          <p>
            The donor management area is designed for staff workflows: supporter records,
            contribution tracking, allocations, and notes. The admin dashboard is a separate
            operational view for current activity and upcoming decisions.
          </p>
          <Link to="/admin" className="textLink">
            Go to the admin dashboard
          </Link>
        </div>
      </section>

      <section className="homeCallout">
        <div>
          <p className="eyebrow">Next step</p>
          <h2>Build trust with specifics.</h2>
        </div>
        <p>
          This first pass uses concrete language, measured hierarchy, and restrained styling so the
          organization feels credible. From here we can refine copy, add real photography, and wire
          these pages to live data.
        </p>
      </section>
    </div>
  )
}
