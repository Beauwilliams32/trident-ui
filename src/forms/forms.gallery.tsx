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

export interface GalleryExample {
  id: string
  title: string
  render: () => ReactElement
}

const DEMO_CSRF = 'gallery-demo-token'

export const group = 'forms'

export const examples: GalleryExample[] = [
  {
    id: 'sign-in',
    title: 'Sign-in form (native POST + CSRF)',
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
      </Form>
    ),
  },
  {
    id: 'controls',
    title: 'Textarea, Select, Switch, disabled',
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
]

export default { group, examples }
