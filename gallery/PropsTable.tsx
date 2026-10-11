import type { ComponentApi } from './data/props'

/** One component's generated props table (G4): prop, type, default, description. */
export function PropsTable({ api }: { api: ComponentApi }) {
  const id = `api-${api.name}`
  return (
    <section className="g-api__component" aria-labelledby={id}>
      <h4 id={id} className="g-api__name">
        <code>{api.name}</code> <span className="g-api__entry">from {api.entry}</span>
      </h4>
      {api.description ? <p className="g-api__desc">{api.description}</p> : null}
      {api.props.length ? (
        <div className="g-api__scroll" role="region" aria-label={`${api.name} props`} tabIndex={0}>
          <table className="g-api__table">
            <thead>
              <tr>
                <th scope="col">Prop</th>
                <th scope="col">Type</th>
                <th scope="col">Default</th>
                <th scope="col">Description</th>
              </tr>
            </thead>
            <tbody>
              {api.props.map((p) => (
                <tr key={p.name}>
                  <th scope="row">
                    <code>{p.name}</code>
                    {p.required ? <span className="g-api__req"> (required)</span> : null}
                  </th>
                  <td>
                    <code className="g-api__type">{p.type}</code>
                  </td>
                  <td>{p.default ? <code>{p.default}</code> : <span aria-label="none">–</span>}</td>
                  <td>{p.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="g-api__desc">No props of its own.</p>
      )}
      {api.native ? <p className="g-api__native">Also takes the native element’s attributes (className, aria-*, data-*, event handlers).</p> : null}
    </section>
  )
}
