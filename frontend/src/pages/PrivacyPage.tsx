const policySections = [
  {
    title: 'What data we collect',
    text: 'North Star may collect contact details submitted by staff users, account login credentials, donor records entered by administrators, and site usage information through optional analytics cookies.',
  },
  {
    title: 'How data is used',
    text: 'We use data to manage staff access, maintain donor and contribution records, understand which parts of the site are useful, and communicate with users who request updates or support.',
  },
  {
    title: 'How data is stored',
    text: 'Account and supporter records are stored in protected application databases with access limited to authorized staff. Analytics preferences are stored locally in your browser.',
  },
  {
    title: 'Your rights',
    text: 'Users may request access to personal data, correction of inaccurate information, deletion where appropriate, and withdrawal of consent for non-essential cookies.',
  },
  {
    title: 'Data concerns',
    text: 'For demonstration purposes, contact `privacy@northstar-example.org` or the organization administrator for data questions, access requests, or consent withdrawal.',
  },
]

export function PrivacyPage() {
  return (
    <div className="pageStack narrow">
      <section className="pageIntro">
        <p className="eyebrow">Privacy policy</p>
        <h1>Privacy and cookie use</h1>
        <p className="lede">
          This policy is written for the course project and explains how the site handles data,
          cookies, and user rights in plain language.
        </p>
      </section>

      <section className="policyNotice">
        <p>
          Essential cookies support login state and site function. Optional analytics cookies may be
          accepted or declined through the consent banner.
        </p>
      </section>

      <section className="policyList">
        {policySections.map((section) => (
          <article key={section.title} className="policyItem">
            <h2>{section.title}</h2>
            <p>{section.text}</p>
          </article>
        ))}
      </section>
    </div>
  )
}
