/**
 * Gallery examples for the forms group, consumed by the integrator's gallery page (spec §10.6).
 * Every form posts natively; the CSRF value is a fixed demo string standing in for a server prop.
 */
import type { ReactElement } from 'react'
import { ErrorSummary } from './ErrorSummary'
import { Field, Fieldset } from './Field'
import { Form } from './Form'
import { FormError } from './FormError'
import { SubmitButton } from './SubmitButton'
import { Checkbox, Input, Radio, Select, Switch, Textarea } from './controls'
import { errorTitle } from './errorTitle'

export interface GalleryExample {
  id: string
  title: string
  /** One line: when to use it. Required: the gallery test fails without it. */
  description: string
  render: () => ReactElement
}

const DEMO_CSRF = 'gallery-demo-token'

export const group = 'forms'

export const examples: GalleryExample[] = [
  {
    id: 'sign-in',
    title: 'Sign-in form (native POST + CSRF)',
    description: 'Posts natively with a server-supplied CSRF token; labels, hints and autocomplete wired by Field.',
    render: () => (
      <Form action="/login" csrfToken={DEMO_CSRF} aria-label="Sign in">
        <Field label="Email" name="email" required>
          <Input type="email" autoComplete="email" />
        </Field>
        <Field label="Password" name="password" required hint="At least 12 characters.">
          <Input type="password" autoComplete="current-password" />
        </Field>
        <Checkbox name="remember" label="Keep me signed in" />
        <SubmitButton pendingLabel="Signing in…">Sign in</SubmitButton>
      </Form>
    ),
  },
  {
    id: 'errors',
    title: 'Server-side errors: ErrorSummary links to fields',
    description: 'After a failed POST: a summary at the top that links to each field, inline errors above the inputs, and errorTitle() for the page title.',
    render: () => (
      <Form action="/profile" csrfToken={DEMO_CSRF} aria-label="Profile with errors">
        <ErrorSummary focusOnMount={false} errors={{ 'profile[name]': 'Enter your full name', plan: 'Choose a plan' }} />
        <FormError title="We could not save your profile">Fix the fields below and try again.</FormError>
        <Field label="Full name" name="profile[name]" error="Enter your full name" required>
          <Input autoComplete="name" />
        </Field>
        <Fieldset legend="Plan" name="plan" error="Choose a plan" required>
          <Radio value="starter" label="Starter" />
          <Radio value="pro" label="Pro" hint="Includes priority support." />
        </Fieldset>
        <SubmitButton>Save profile</SubmitButton>
        <p style={{ margin: 0, color: 'var(--ui-muted)', fontSize: 13 }}>
          Page title: <code>{errorTitle('Your profile | Trident NIL', { 'profile[name]': 'Enter your full name', plan: 'Choose a plan' })}</code>
        </p>
      </Form>
    ),
  },
  {
    id: 'controls',
    title: 'Textarea, Select, Switch, disabled',
    description: 'Native controls with token styling. The switch shows state by thumb position, never colour alone.',
    render: () => (
      <Form action="/settings" csrfToken={DEMO_CSRF} aria-label="Settings">
        <Field label="Bio" name="bio" hint="Shown on your public profile.">
          <Textarea />
        </Field>
        <Field label="Time zone" name="tz" required>
          <Select
            placeholder="Choose a time zone"
            options={[
              { value: 'America/Chicago', label: 'Central (Chicago)' },
              { value: 'America/New_York', label: 'Eastern (New York)' },
              { value: 'America/Los_Angeles', label: 'Pacific (Los Angeles)' },
            ]}
          />
        </Field>
        <Fieldset legend="Notifications">
          <Switch name="notify_email" label="Email me about new bookings" defaultChecked />
          <Switch name="notify_sms" label="Text me reminders" />
          <Switch name="notify_fax" label="Fax (unavailable)" disabled />
        </Fieldset>
        <Field label="Account ID" name="account_id" disabled>
          <Input defaultValue="acct_demo_0001" readOnly />
        </Field>
        <SubmitButton variant="secondary">Update settings</SubmitButton>
      </Form>
    ),
  },
  {
    id: 'rtl',
    title: 'Right to left (dir="rtl")',
    description: 'Logical properties mirror the form: labels, the select chevron, the switch thumb and the error edge all flip.',
    render: () => (
      <div dir="rtl" lang="ar">
        <Form action="/login" csrfToken={DEMO_CSRF} aria-label="تسجيل الدخول">
          <Field label="البريد الإلكتروني" name="rtl_email" required error="أدخل بريدك الإلكتروني">
            <Input type="email" autoComplete="email" />
          </Field>
          <Field label="المدينة" name="rtl_city">
            <Select
              options={[
                { value: 'cai', label: 'القاهرة' },
                { value: 'dxb', label: 'دبي' },
              ]}
            />
          </Field>
          <Switch name="rtl_remember" label="تذكرني" defaultChecked />
          <SubmitButton>تسجيل الدخول</SubmitButton>
        </Form>
      </div>
    ),
  },
]

export default { group, examples }
