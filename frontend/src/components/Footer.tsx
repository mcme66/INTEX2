import { Link } from 'react-router-dom'

const footerGroups = [
  {
    title: 'North Star',
    links: [
      { label: 'Home', to: '/' },
      { label: 'Impact dashboard', to: '/impact' },
      { label: 'Privacy policy', to: '/privacy' },
    ],
  },
  {
    title: 'Get Involved',
    links: [
      { label: 'Ways to help', to: '/donors' },
      { label: 'Volunteer pathways', to: '/donors#supporter-types' },
      { label: 'Board updates', to: '/impact#stewardship' },
    ],
  },
  {
    title: 'Operations',
    links: [
      { label: 'Admin dashboard', to: '/admin' },
      { label: 'Staff sign in', to: '/login' },
      { label: 'Create staff account', to: '/register' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="siteFooter">
      <div className="footerWrap">
        <div className="footerIntro">
          <img src="/kid_stars.svg" alt="" className="footerIcon" />
          <p>
            North Star exists to provide immediate refuge, trauma-informed support, and stable
            pathways forward for children recovering from trafficking and abuse in Colombia.
          </p>
        </div>

        {footerGroups.map((group) => (
          <div key={group.title} className="footerGroup">
            <h2>{group.title}</h2>
            {group.links.map((link) => (
              <Link key={link.label} to={link.to}>
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </footer>
  )
}
