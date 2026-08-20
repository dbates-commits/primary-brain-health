import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { AccountCard } from "@/components/account/AccountCard";
import { ProfileForm } from "@/components/account/ProfileForm";
import type { ProfileInitialValues } from "@/lib/profile-values";
import {
  SLOW_ACTION_DELAY_MS,
  profileFails,
  profileFieldErrors,
  profileSpy,
  profileSucceeds,
  profileSucceedsThenFails,
} from './mock-actions';

/** The filled profile drawn in Figma 2092:13144. */
const FILLED: ProfileInitialValues = {
  firstName: 'David',
  lastName: 'Smith',
  email: 'david.smith@email.com',
  phone: '(555) 000-0000',
  dateOfBirth: '1975-04-12',
  gender: 'MALE',
  zip: '12345',
  educationLevel: 'ED_YEARS_16',
};

/** A row that predates the details step: every nullable column empty. */
const EMPTY: ProfileInitialValues = {
  firstName: 'David',
  lastName: 'Smith',
  email: 'david.smith@email.com',
  phone: '',
  dateOfBirth: '',
  gender: '',
  zip: '',
  educationLevel: '',
};

const meta = {
  title: 'Account/ProfileForm',
  component: ProfileForm,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The Profile Information form on `/profile` (Figma 2092:13144). Eight fields in a ' +
          'two-column grid, collapsing to one below `sm`. Save is genuinely disabled until ' +
          'something differs from the loaded values — the pale `brand/muted` fill is the ' +
          "design's pristine state, not a decoration. Email is locked: it carries no `name` " +
          'and is `disabled`, so it can never reach the payload. ' +
          'Figma labels the birth field "Year of Birth"; we render the booking step\'s date ' +
          'input instead, because `users.date_of_birth` is a full date Linus needs as a ' +
          '`birthDate`. The newsletter checkbox in the frame is out of scope. ' +
          'A save raises the confirmation toast (2092:13191), pinned to the top of the page ' +
          'and gone after four seconds. ' +
          'The action is a prop, so these stories drive the real component with stubs.',
      },
    },
  },
  tags: ['autodocs'],
  args: { initial: FILLED },
  decorators: [
    (Story) => (
      // The card it lives in, on the page's own ground.
      <div className="bg-background-brand-subtle p-6">
        <AccountCard>
          <Story />
        </AccountCard>
      </div>
    ),
  ],
} satisfies Meta<typeof ProfileForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The loaded state: everything prefilled, nothing to save. */
export const Default: Story = {
  args: { action: profileSucceeds() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByLabelText('First Name')).toHaveValue('David');
    await expect(canvas.getByLabelText('Last Name')).toHaveValue('Smith');
    await expect(canvas.getByLabelText('Email')).toHaveValue('david.smith@email.com');
    await expect(canvas.getByLabelText('Phone Number')).toHaveValue('(555) 000-0000');
    await expect(canvas.getByLabelText('Date of Birth')).toHaveValue('1975-04-12');
    await expect(canvas.getByLabelText('Gender')).toHaveValue('MALE');
    await expect(canvas.getByLabelText('ZIP Code')).toHaveValue('12345');
    await expect(canvas.getByLabelText('Highest Level of Education')).toHaveValue('ED_YEARS_16');

    const save = canvas.getByRole('button', { name: 'Save Changes' });
    await expect(save).toBeDisabled();
    await expect(save).toHaveClass(/bg-brand-muted/);
  },
};

/** The account address is shown but not editable. */
export const EmailIsLocked: Story = {
  args: { action: profileSucceeds() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText('Email')).toBeDisabled();
  },
};

/**
 * The locked-email requirement as an executable check. This is what fails if
 * someone "helpfully" swaps `disabled` for `readOnly`, which would put the
 * address back in the payload.
 */
const submitSpy = fn();

export const EmailIsNeverSubmitted: Story = {
  args: { action: profileSpy((keys, values) => submitSpy(keys, values)) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    submitSpy.mockClear();

    await userEvent.type(canvas.getByLabelText('First Name'), 'son');
    await userEvent.click(canvas.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(submitSpy).toHaveBeenCalled());
    const [keys] = submitSpy.mock.calls[0];
    await expect(keys).not.toContain('email');
    await expect(keys).toContain('firstName');
  },
};

/** Save tracks a comparison, not a latched flag: undo an edit and it goes inert again. */
export const EnablesSaveWhenEdited: Story = {
  args: { action: profileSucceeds() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const firstName = canvas.getByLabelText('First Name');
    const save = canvas.getByRole('button', { name: 'Save Changes' });

    await expect(save).toBeDisabled();

    await userEvent.type(firstName, 'x');
    await waitFor(() => expect(save).toBeEnabled());

    await userEvent.clear(firstName);
    await userEvent.type(firstName, 'David');
    await waitFor(() => expect(save).toBeDisabled());
  },
};

/** A `<select>` fires `change`, not `input` — the field type a naive dirty check misses. */
export const SelectEnablesSave: Story = {
  args: { action: profileSucceeds() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByLabelText('Gender'), 'FEMALE');
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Save Changes' })).toBeEnabled(),
    );
  },
};

/** Same, for the native date control. */
export const DateEnablesSave: Story = {
  args: { action: profileSucceeds() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dob = canvas.getByLabelText('Date of Birth');
    await userEvent.clear(dob);
    await userEvent.type(dob, '1980-06-01');
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Save Changes' })).toBeEnabled(),
    );
  },
};

/** Live `(XXX) XXX-XXXX` formatting, from the shared `formatPhone`. */
export const PhoneFormatting: Story = {
  args: { action: profileSucceeds() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const phone = canvas.getByLabelText('Phone Number');
    await userEvent.clear(phone);
    await userEvent.type(phone, '6175550142');
    await expect(phone).toHaveValue('(617) 555-0142');
  },
};

/**
 * The most load-bearing story here: React 19 resets the form after a server
 * action, which would otherwise revert every field to the pre-edit render and
 * yank both selects back to their first option.
 */
export const SavedResetsDirty: Story = {
  args: { action: profileSucceeds() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const zip = canvas.getByLabelText('ZIP Code');

    await userEvent.clear(zip);
    await userEvent.type(zip, '90210');
    await userEvent.click(canvas.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent('Changes saved successfully'),
    );

    // The edit survived the reset — inputs, selects and the phone alike.
    await expect(zip).toHaveValue('90210');
    await expect(canvas.getByLabelText('Gender')).toHaveValue('MALE');
    await expect(canvas.getByLabelText('Phone Number')).toHaveValue('(555) 000-0000');

    // And the new values are the new baseline. `setDirty(false)` runs in an
    // effect, a commit after the success message renders, so this needs a wait.
    const save = canvas.getByRole('button', { name: 'Save Changes' });
    await waitFor(() => expect(save).toBeDisabled());
    await expect(save).toHaveClass(/bg-brand-muted/);
  },
};

/**
 * The toast is what confirms a save (Figma 2092:13191). It is `fixed`, so it
 * renders over the story's own frame rather than inside the card.
 */
export const SavedShowsToast: Story = {
  args: { action: profileSucceeds() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByLabelText('First Name'), 'son');
    await userEvent.click(canvas.getByRole('button', { name: 'Save Changes' }));

    const toast = await waitFor(() => canvas.getByRole('status'));
    await expect(toast).toHaveTextContent('Changes saved successfully');
    await expect(toast).toHaveClass(/bg-toast-surface/);
  },
};

/**
 * The toast shows **once** per save and stays gone.
 *
 * The regression this guards: latching the success object and then clearing
 * that latch on hide leaves the render-time condition true again on the next
 * render, so the toast reappears every few seconds for as long as the page is
 * open. Slow by design — it has to outlive the four-second hold.
 */
export const ToastShowsOnlyOnce: Story = {
  args: { action: profileSucceeds() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByLabelText('First Name'), 'son');
    await userEvent.click(canvas.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() => expect(canvas.getByRole('status')).toBeInTheDocument());

    // Gone after the hold plus the exit, and still gone a beat later — a
    // re-latch would have put it straight back.
    await waitFor(() => expect(canvas.queryByRole('status')).toBeNull(), { timeout: 8000 });
    await new Promise((resolve) => setTimeout(resolve, 750));
    await expect(canvas.queryByRole('status')).toBeNull();
  },
};

/**
 * A failed save does not lose an earlier successful one. Save, fail a second
 * save, then retype the original value: the baseline is what the database last
 * accepted, not what the page loaded, so Save stays live.
 */
export const FailedSaveKeepsThePersistedBaseline: Story = {
  args: { action: profileSucceedsThenFails('Something went wrong saving your details.') },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByLabelText('First Name');
    const save = () => canvas.getByRole('button', { name: 'Save Changes' });

    // A successful save moves the baseline off `initial`.
    await userEvent.clear(first);
    await userEvent.type(first, 'Dave');
    await userEvent.click(save());
    await waitFor(() => expect(save()).toBeDisabled());

    // The next save fails, so nothing is written…
    await userEvent.clear(first);
    await userEvent.type(first, 'Davey');
    await userEvent.click(save());
    await waitFor(() => expect(canvas.getByRole('alert')).toBeInTheDocument());

    // …and typing the *loaded* value back in is still an unsaved edit, because
    // the row holds "Dave".
    await userEvent.clear(first);
    await userEvent.type(first, 'David');
    await expect(save()).toBeEnabled();
  },
};

/**
 * `onSaved` fires once per successful save and never on a failure — this is
 * what `ProfileFormWithSession` hangs the session refresh on, so the header
 * stops greeting the customer by the name they just changed.
 */
const savedSpy = fn();

export const NotifiesOnSave: Story = {
  args: {
    action: profileSucceedsThenFails('Something went wrong saving your details.'),
    onSaved: savedSpy,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByLabelText('First Name');
    const save = () => canvas.getByRole('button', { name: 'Save Changes' });
    savedSpy.mockClear();

    await userEvent.type(first, 'son');
    await userEvent.click(save());
    await waitFor(() => expect(savedSpy).toHaveBeenCalledTimes(1));

    // The failed second save leaves the count alone.
    await userEvent.type(first, 'x');
    await userEvent.click(save());
    await waitFor(() => expect(canvas.getByRole('alert')).toBeInTheDocument());
    await expect(savedSpy).toHaveBeenCalledTimes(1);
  },
};

/** Per-field messages, the invalid ring, and the input kept for a retry. */
export const FieldErrors: Story = {
  args: {
    action: profileFieldErrors({
      zip: 'Enter a 5-digit ZIP code.',
      gender: 'Select your gender.',
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const zip = canvas.getByLabelText('ZIP Code');
    await userEvent.clear(zip);
    await userEvent.type(zip, '123');
    await userEvent.click(canvas.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(canvas.getByText('Enter a 5-digit ZIP code.')).toBeVisible());
    await expect(canvas.getByText('Select your gender.')).toBeVisible();
    await expect(canvas.getByLabelText('Gender')).toHaveAttribute('aria-invalid', 'true');
    // The rejected input survives the reset, so it can be corrected in place.
    await expect(zip).toHaveValue('123');

    // Still dirty, so the customer can fix and resubmit.
    await expect(canvas.getByRole('button', { name: 'Save Changes' })).toBeEnabled();
  },
};

/** A failure with no field to attach to. */
export const FormLevelError: Story = {
  args: { action: profileFails('Something went wrong saving your details. Please try again.') },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('First Name'), 'son');
    await userEvent.click(canvas.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() =>
      expect(canvas.getByRole('alert')).toHaveTextContent(
        'Something went wrong saving your details. Please try again.',
      ),
    );
  },
};

/** Parked in flight: the fieldset dims and the label changes. */
export const Submitting: Story = {
  args: { action: profileSucceeds(SLOW_ACTION_DELAY_MS) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('First Name'), 'son');
    await userEvent.click(canvas.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(canvas.getByRole('button', { name: 'Saving…' })).toBeVisible());
  },
};

/**
 * A row that predates the details step. Every field is required, so Save stays
 * inert until the profile is completed — the intended behaviour for a card
 * whose sub-copy says these details drive the assessment.
 */
export const IncompleteLegacyProfile: Story = {
  args: { initial: EMPTY, action: profileSucceeds() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByLabelText('Phone Number')).toHaveValue('');
    await expect(canvas.getByLabelText('Date of Birth')).toHaveValue('');
    await expect(canvas.getByLabelText('Gender')).toHaveValue('');
    await expect(canvas.getByLabelText('Highest Level of Education')).toHaveValue('');
    await expect(canvas.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
  },
};
