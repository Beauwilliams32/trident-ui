import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
// eslint-disable-next-line no-restricted-imports -- test-only: prove the markup works with no JS.
import { renderToStaticMarkup } from 'react-dom/server'
import { axe } from 'vitest-axe'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as root from '../index'
import {
  Checkbox,
  CsrfField,
  DEFAULT_CSRF_FIELD,
  ErrorSummary,
  Field,
  Fieldset,
  Form,
  FormError,
  Input,
  Radio,
  Select,
  SubmitButton,
  Switch,
  Textarea,
  fieldId,
} from './index'
import { examples } from './forms.gallery'

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

/** A realistic server-rendered money/auth-style form after a failed POST. */
function SignupForm({ csrf = 'tok_123' }: { csrf?: string }) {
  return (
    <Form action="/signup" csrfToken={csrf} aria-label="Sign up">
      <ErrorSummary focusOnMount={false} errors={{ email: 'Enter an email address', plan: 'Choose a plan' }} />
      <FormError>Something went wrong.</FormError>
      <Field label="Email" name="email" hint="We never share it." error="Enter an email address" required>
        <Input type="email" autoComplete="email" />
      </Field>
      <Field label="About you" name="about">
        <Textarea />
      </Field>
      <Field label="Country" name="country" required>
        <Select placeholder="Choose a country" options={[{ value: 'us', label: 'United States' }, { value: 'ca', label: 'Canada' }]} />
      </Field>
      <Fieldset legend="Plan" name="plan" error="Choose a plan" required>
        <Radio value="starter" label="Starter" />
        <Radio value="pro" label="Pro" />
      </Fieldset>
      <Checkbox name="terms" value="yes" label="I accept the terms" />
      <Switch name="newsletter" label="Send me the newsletter" />
      <SubmitButton>Create account</SubmitButton>
    </Form>
  )
}

describe('forms: no-JS static markup (renderToStaticMarkup)', () => {
  const html = renderToStaticMarkup(<SignupForm />)
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html')
  const form = doc.querySelector('form')!

  it('is a native POST form with a real action and no script', () => {
    expect(form.getAttribute('method')).toBe('post')
    expect(form.getAttribute('action')).toBe('/signup')
    expect(html).not.toContain('<script')
  })

  it('carries the CSRF value from server props as the first field', () => {
    const csrf = form.querySelector('input[type="hidden"]')!
    expect(csrf).toBe(form.querySelector('input'))
    expect(csrf.getAttribute('name')).toBe(DEFAULT_CSRF_FIELD)
    expect(csrf.getAttribute('value')).toBe('tok_123')
  })

  it('wires label, hint, error, required and aria-invalid to the control', () => {
    const email = form.querySelector<HTMLInputElement>('#email')!
    expect(email.getAttribute('name')).toBe('email')
    expect(email.getAttribute('type')).toBe('email')
    expect(email.hasAttribute('required')).toBe(true)
    expect(email.getAttribute('aria-invalid')).toBe('true')
    expect(email.getAttribute('aria-describedby')).toBe('email-hint email-error')
    expect(form.querySelector('label[for="email"]')!.textContent).toContain('Email')
    expect(form.querySelector('#email-hint')!.textContent).toBe('We never share it.')
    expect(form.querySelector('#email-error')!.textContent).toBe('Error: Enter an email address')
  })

  it('renders a native select with a placeholder selected by default', () => {
    const select = form.querySelector<HTMLSelectElement>('select#country')!
    expect(select.getAttribute('name')).toBe('country')
    const options = [...select.querySelectorAll('option')]
    expect(options.map((o) => o.getAttribute('value'))).toEqual(['', 'us', 'ca'])
    expect(options[0]!.hasAttribute('selected')).toBe(true)
    expect(options[0]!.hasAttribute('disabled')).toBe(true)
  })

  it('groups radios in a fieldset with a legend and a shared name', () => {
    const fieldset = form.querySelector('fieldset#plan')!
    expect(fieldset.querySelector('legend')!.textContent).toContain('Plan')
    const radios = [...fieldset.querySelectorAll<HTMLInputElement>('input[type="radio"]')]
    expect(radios.map((r) => [r.getAttribute('name'), r.getAttribute('value')])).toEqual([
      ['plan', 'starter'],
      ['plan', 'pro'],
    ])
    radios.forEach((r) => {
      expect(r.hasAttribute('required')).toBe(true)
      expect(form.querySelector(`label[for="${r.id}"]`)).not.toBeNull()
    })
    expect(fieldset.getAttribute('aria-describedby')).toBe('plan-error')
  })

  it('renders checkbox and switch as native checkboxes (switch role)', () => {
    const terms = form.querySelector<HTMLInputElement>('input[name="terms"]')!
    expect(terms.getAttribute('type')).toBe('checkbox')
    expect(terms.getAttribute('value')).toBe('yes')
    const sw = form.querySelector<HTMLInputElement>('input[name="newsletter"]')!
    expect(sw.getAttribute('type')).toBe('checkbox')
    expect(sw.getAttribute('role')).toBe('switch')
  })

  it('has a native submit button', () => {
    const submit = form.querySelector('button')!
    expect(submit.getAttribute('type')).toBe('submit')
    expect(submit.hasAttribute('disabled')).toBe(false)
    expect(submit.hasAttribute('aria-disabled')).toBe(false)
  })

  it('error summary links point at elements that exist', () => {
    const links = [...form.querySelectorAll<HTMLAnchorElement>('.ui-error-summary a')]
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['#email', '#plan'])
    for (const a of links) expect(doc.getElementById(a.getAttribute('href')!.slice(1))).not.toBeNull()
    expect(form.querySelector('.ui-error-summary')!.getAttribute('role')).toBe('alert')
  })

  it('form-level error is an alert', () => {
    expect(form.querySelector('.ui-form-error')!.getAttribute('role')).toBe('alert')
  })

  it('every gallery example renders statically', () => {
    for (const e of examples) {
      const out = renderToStaticMarkup(e.render())
      expect(out).toContain('method="post"')
      expect(out).toContain('name="_csrf"')
    }
  })
})

describe('Form', () => {
  it('defaults to POST and is exported from the root', () => {
    expect(root.Form).toBe(Form)
    render(<Form action="/x" aria-label="f" />)
    expect(screen.getByRole('form').getAttribute('method')).toBe('post')
  })

  it('omits CSRF when no token is given and supports a custom field name', () => {
    const { container, rerender } = render(<Form action="/x" />)
    expect(container.querySelector('input[type="hidden"]')).toBeNull()
    rerender(<Form action="/x" csrfToken="abc" csrfFieldName="csrf_token" />)
    const hidden = container.querySelector('input[type="hidden"]')!
    expect(hidden.getAttribute('name')).toBe('csrf_token')
    expect(hidden.getAttribute('value')).toBe('abc')
  })

  it('CsrfField warns in dev when the server gave no token', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<CsrfField value="" />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('CsrfField'))
  })
})

describe('Field and controls', () => {
  it('fieldId maps names to ids consistently', () => {
    expect(fieldId('email')).toBe('email')
    expect(fieldId('user[email]')).toBe('user-email')
    expect(fieldId('items[0].qty')).toBe('items-0-qty')
    expect(fieldId('[]')).toBe('field')
  })

  it('Field without a name still labels its control (useId)', () => {
    render(
      <Field label="Search">
        <Input type="search" />
      </Field>,
    )
    expect(screen.getByLabelText('Search').getAttribute('type')).toBe('search')
  })

  it('explicit control props win over Field context', () => {
    render(
      <Field label="Code" name="code" hint="6 digits">
        <Input id="otp" name="otp" aria-describedby="extra" />
      </Field>,
    )
    const input = document.getElementById('otp')!
    expect(input.getAttribute('name')).toBe('otp')
    expect(input.getAttribute('aria-describedby')).toBe('code-hint extra')
  })

  it('standalone invalid prop sets aria-invalid', () => {
    render(<Input aria-label="Name" invalid />)
    expect(screen.getByLabelText('Name').getAttribute('aria-invalid')).toBe('true')
  })

  it('Select accepts option children', () => {
    render(
      <Field label="Size" name="size">
        <Select defaultValue="m">
          <option value="s">Small</option>
          <option value="m">Medium</option>
        </Select>
      </Field>,
    )
    expect((screen.getByLabelText('Size') as HTMLSelectElement).value).toBe('m')
  })

  it('Checkbox, Radio and Switch toggle natively and label their inputs', () => {
    render(
      <>
        <Checkbox name="a" label="Alpha" hint="Hint A" />
        <Fieldset legend="Pick" name="p">
          <Radio value="1" label="One" />
          <Radio value="2" label="Two" />
        </Fieldset>
        <Switch name="s" label="Sound" />
      </>,
    )
    const alpha = screen.getByLabelText('Alpha') as HTMLInputElement
    expect(alpha.getAttribute('aria-describedby')).toMatch(/-hint$/)
    fireEvent.click(alpha)
    expect(alpha.checked).toBe(true)
    fireEvent.click(screen.getByLabelText('Two'))
    expect((screen.getByLabelText('Two') as HTMLInputElement).checked).toBe(true)
    const sound = screen.getByRole('switch', { name: 'Sound' }) as HTMLInputElement
    fireEvent.click(sound)
    expect(sound.checked).toBe(true)
  })

  it('a standalone Checkbox error marks it invalid and describes it', () => {
    render(<Checkbox name="terms" label="Accept" error="You must accept" />)
    const box = screen.getByLabelText('Accept')
    expect(box.getAttribute('aria-invalid')).toBe('true')
    const describedBy = box.getAttribute('aria-describedby')!
    expect(document.getElementById(describedBy)!.textContent).toContain('You must accept')
  })

  it('a disabled Fieldset disables its options', () => {
    render(
      <Fieldset legend="Off" name="o" disabled>
        <Switch label="Thing" />
      </Fieldset>,
    )
    expect((screen.getByRole('switch', { name: 'Thing' }) as HTMLInputElement).disabled).toBe(true)
  })
})

describe('FormError', () => {
  it('renders nothing without content', () => {
    const { container } = render(<FormError />)
    expect(container.innerHTML).toBe('')
  })

  it('renders an alert with title and message', () => {
    render(<FormError title="Payment failed">Your card was declined.</FormError>)
    const alert = screen.getByRole('alert')
    expect(alert.textContent).toContain('Payment failed')
    expect(alert.textContent).toContain('Your card was declined.')
  })
})

describe('SubmitButton', () => {
  function renderForm(onSubmit?: (e: Event) => void) {
    const handler = vi.fn((e: Event) => {
      onSubmit?.(e)
    })
    const utils = render(
      <form
        aria-label="f"
        onSubmitCapture={(e) => {
          // jsdom cannot navigate; stop the real submission after our listeners have seen it.
          handler(e.nativeEvent)
        }}
      >
        <SubmitButton pendingLabel="Saving…">Save</SubmitButton>
      </form>,
    )
    return { ...utils, handler }
  }

  it('is type=submit and enters the loading state after a native submit', async () => {
    const { container } = renderForm()
    const form = container.querySelector('form')!
    // Simulate a native navigation submit that nobody prevented.
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Saving…' }).getAttribute('aria-busy')).toBe('true'))
    expect(screen.getByRole('button').getAttribute('type')).toBe('submit')
  })

  it('does not enter the loading state when the submit was prevented (client validation / fetch)', async () => {
    const { container } = renderForm((e) => e.preventDefault())
    const form = container.querySelector('form')!
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await new Promise((r) => setTimeout(r, 10))
    expect(screen.getByRole('button', { name: 'Save' }).hasAttribute('aria-busy')).toBe(false)
  })

  it('re-enables on pageshow (back/forward cache restore)', async () => {
    const { container } = renderForm()
    container.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await waitFor(() => expect(screen.getByRole('button').getAttribute('aria-busy')).toBe('true'))
    act(() => {
      window.dispatchEvent(new Event('pageshow'))
    })
    const btn = screen.getByRole('button', { name: 'Save' })
    expect(btn.hasAttribute('aria-busy')).toBe(false)
    expect(btn.hasAttribute('aria-disabled')).toBe(false)
  })

  it('a pending click does not submit again', () => {
    const onSubmit = vi.fn((e: { preventDefault: () => void }) => e.preventDefault())
    render(
      <form onSubmit={onSubmit}>
        <SubmitButton pending>Pay</SubmitButton>
      </form>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Pay' }))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows pending during a React 19 form action (useFormStatus)', async () => {
    let finish!: () => void
    const action = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)))
    render(
      <form action={action}>
        <SubmitButton pendingLabel="Sending…">Send</SubmitButton>
      </form>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Sending…' })).toBeTruthy())
    expect(action).toHaveBeenCalledTimes(1)
    await act(async () => finish())
    await waitFor(() => expect(screen.getByRole('button', { name: 'Send' }).hasAttribute('aria-busy')).toBe(false))
  })
})

describe('ErrorSummary', () => {
  it('renders nothing when there are no messages', () => {
    const { container } = render(<ErrorSummary errors={{ email: '', name: undefined }} />)
    expect(container.innerHTML).toBe('')
  })

  it('focuses itself on mount and is labelled by its heading', () => {
    render(<ErrorSummary errors={[{ id: 'x', message: 'Bad' }]} headingLevel={3} />)
    const summary = screen.getByRole('alert', { name: 'There is a problem' })
    expect(document.activeElement).toBe(summary)
    expect(summary.querySelector('h3')).not.toBeNull()
  })

  it('link click focuses the field, or the first option of a fieldset', () => {
    render(
      <form>
        <ErrorSummary focusOnMount={false} errors={{ email: 'Enter email', plan: 'Pick one' }} />
        <Field label="Email" name="email" error="Enter email">
          <Input />
        </Field>
        <Fieldset legend="Plan" name="plan" error="Pick one">
          <Radio value="a" label="A" />
          <Radio value="b" label="B" />
        </Fieldset>
      </form>,
    )
    Element.prototype.scrollIntoView = vi.fn()
    fireEvent.click(screen.getByRole('link', { name: 'Enter email' }))
    expect(document.activeElement).toBe(screen.getByLabelText('Email'))
    fireEvent.click(screen.getByRole('link', { name: 'Pick one' }))
    expect(document.activeElement).toBe(screen.getByLabelText('A'))
  })

  it('leaves the native fragment link alone when the target is missing', () => {
    render(<ErrorSummary focusOnMount={false} errors={{ ghost: 'Missing' }} />)
    const link = screen.getByRole('link', { name: 'Missing' })
    const event = new MouseEvent('click', { bubbles: true, cancelable: true })
    link.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
  })
})

describe('forms a11y', () => {
  it.each(examples.map((e) => [e.id, e] as const))('gallery example %s passes axe', async (_id, example) => {
    const { container } = render(<main>{example.render()}</main>)
    expect(await axe(container)).toHaveNoViolations()
  })

  it.each([
    ['trident-nil', 'dark'],
    ['wmh-portal', 'light'],
  ])('theme smoke: %s / %s', async (theme, scheme) => {
    const { container } = render(
      <div data-theme={theme} data-scheme={scheme}>
        <main>
          <SignupForm />
        </main>
      </div>,
    )
    expect(container.querySelector(`[data-theme="${theme}"] form.ui-form`)).not.toBeNull()
    expect(await axe(container)).toHaveNoViolations()
  })
})
