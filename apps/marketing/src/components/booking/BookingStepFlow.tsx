"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StepHeader } from "@pbh/ui";
import {
  DetailsForm,
  ConsentForm,
  PaymentStep,
  CONSENT_STAMP_FIELD,
  DEFAULT_PACKAGE_KEY,
  trackForPackage,
  type DetailsInitialValues,
  type PackageKey,
  type SignupResult,
} from "@pbh/booking";
import { Modal } from "./Modal";
import { BookingSection } from "./BookingSection";
import { ConsentTerms } from "./ConsentTerms";
import { resolveConsentTerms } from "./consent-copy";
import { MODAL_STEPS, type ModalStepCopyMap } from "./steps";
import { BookingOverviewPane } from "./BookingOverviewPane";
import { BookingStepper } from "./BookingStepper";
import {
  displayKeyFor,
  progressOrder,
  stepIndexFor,
  type BookingProgressStep,
  type DisplayStepKey,
} from "./step-model";
import { resolveStepHeaders } from "./step-headers";
import { NavigatorNote } from "./NavigatorNote";
import { EmailConfirmationStep } from "./EmailConfirmationStep";
import {
  signupAction,
  detailsAction,
  consentAction,
  resendConfirmationAction,
  getBookingResumeState,
  getBookingDetailsValues,
} from "./actions";
import {
  createAssessmentCheckoutSession,
  finalizeCheckoutSession,
} from "./payment/actions";

/**
 * Signup happens on the page, not in the modal (Figma 1804:17908) — so the modal
 * picks the flow up at the confirmation gate, which is where submitting that
 * form lands the customer.
 *
 * Payment is the last step it owns: a paid customer is sent to `/welcome`, so
 * there is no in-modal confirmation step (see `WELCOME_PATH`).
 */

/**
 * Where the flow ends. The route gates on an Auth.js session or the booking
 * cookie plus a succeeded payment — both of which `finalizeCheckoutSession` has
 * just arranged — so a customer arriving here is always let in.
 */
const WELCOME_PATH = "/welcome";

/**
 * What the client knows about the booking in progress. No user id: identity is
 * the server's signed HttpOnly cookie, so every action below resolves the
 * account itself rather than being told which one to write to (pbh-9yb.2).
 */
type FlowContext = {
  /**
   * Prefills the details step, which asks for the person being assessed. Starts
   * as the account holder's name and is theirs to edit there — that edit is the
   * only place we ask who the assessment is for.
   */
  firstName: string;
  lastName: string;
};

const EMPTY_CONTEXT: FlowContext = {
  firstName: "",
  lastName: "",
};

/**
 * Client orchestrator for the booking flow. `BookingSection` renders the signup
 * form on the page; submitting it creates the account and opens the modal at the
 * confirmation gate, which then steps through `DetailsForm` → `ConsentForm` →
 * `PaymentStep` (Stripe Embedded Checkout) → `/welcome`. Every step calls a real
 * `@pbh/booking/server`-backed action injected here. State is in-memory for the
 * session.
 */
export function BookingStepFlow({
  headline,
  subheadline,
  buttonText,
  buttonTextMobile,
  showIncludes,
  tinaFields,
  modalCopy,
  consentStamp,
}: {
  headline?: string;
  subheadline?: string;
  buttonText?: string;
  buttonTextMobile?: string;
  showIncludes?: boolean;
  tinaFields?: { headline?: string; subheadline?: string };
  /**
   * Step headers from the Modals collection. Modal-only — unlike every other
   * prop here it is deliberately not forwarded to `BookingSection`. Each step
   * falls back to the copy that ships in code; see `resolveStepHeaders`.
   */
  modalCopy?: ModalStepCopyMap;
  /**
   * The server's signed note of which agreement `modalCopy` renders, minted
   * alongside it and handed back at submit so the consent row names the terms
   * that were actually on screen. Travels with `modalCopy` or not at all — the
   * two describe the same render.
   */
  consentStamp?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [packageKey, setPackageKey] = useState<PackageKey>(DEFAULT_PACKAGE_KEY);
  const [context, setContext] = useState<FlowContext>(EMPTY_CONTEXT);
  const [expiredLink, setExpiredLink] = useState(false);
  /**
   * An account exists for this visit, so the on-page form must stop accepting
   * submissions — it is still mounted behind the modal, React has reset its
   * fields, and submitting again would only fail on the unique-email
   * constraint. See `BookingFormCard`.
   */
  const [signedUp, setSignedUp] = useState(false);
  /**
   * Which of the modal's two faces is showing: the overview pane, or the step
   * itself. A second axis beside `stepIndex` rather than a fifth entry in
   * `MODAL_STEPS` — that array is asserted against the CMS documents on disk,
   * so it cannot carry a screen that has no document.
   */
  const [pane, setPane] = useState<"overview" | "step">("overview");
  /**
   * The furthest point this booking has reached, which is not the same as the
   * step on screen once a customer goes back to edit their details. Raised only
   * by the resume resolver or by `advance`, i.e. only after a server write has
   * actually landed — which is what makes it safe to greet on (see
   * `BookingOverviewPane`).
   */
  const [furthestStep, setFurthestStep] = useState<BookingProgressStep>("confirm");
  /**
   * The row as it stands, fetched only when someone goes back into the details
   * step — without it the form would come up blank and be unsubmittable until
   * five fields were retyped. Null means "not fetched"; an empty object means
   * fetched and there was nothing, so neither state re-triggers the read.
   */
  const [detailsValues, setDetailsValues] =
    useState<DetailsInitialValues | null>(null);

  /**
   * Move to the next step — or back to where the booking had already got to, if
   * that is further.
   *
   * The clamp used to be `min(i + 1, last)`, which was right while the flow was
   * strictly forward. Now that a customer can drop back into Details from
   * Payment, `i + 1` would land them on Consent, which they have already signed.
   *
   * Deliberately keyed on state rather than `[]`-stable. Safe here: both
   * consumers call `onComplete` from an effect guarded by an `advanced` ref, so
   * a new identity cannot re-fire it. It would NOT be safe to do this to
   * `createSession` below, whose stability is what stops `PaymentStep` minting a
   * fresh Stripe Session on every render.
   */
  const advance = useCallback(() => {
    const next = MODAL_STEPS[Math.min(stepIndex + 1, MODAL_STEPS.length - 1)];
    const behind = progressOrder(next) <= progressOrder(furthestStep);
    setFurthestStep(behind ? furthestStep : next);
    // `furthestStep` can be "done", which has no modal step — a fully paid
    // booking leaves for /welcome instead. Fall back to `next` rather than
    // indexing past the end of the array.
    const index = behind ? stepIndexFor(displayKeyFor(furthestStep)) : -1;
    setStepIndex(index >= 0 ? index : MODAL_STEPS.indexOf(next));
    setPane("step");
  }, [stepIndex, furthestStep]);

  /**
   * Open the modal at a step.
   *
   * The overview pane is opt-in, and it is only ever right for someone coming
   * back to a booking that already has progress behind it. Someone who has just
   * filled in their name and email needs the confirmation gate and nothing else
   * — a summary of four steps in front of a person who has taken none is an
   * obstacle, not orientation.
   */
  const openModal = useCallback(
    (index: number, options?: { overview?: boolean }) => {
      setStepIndex(index);
      setPane(options?.overview ? "overview" : "step");
      setOpen(true);
    },
    [],
  );

  /**
   * Carry the chosen package into signup so it is persisted on the account.
   * The confirmation gate sends the customer away and they return to a fresh
   * page, so this component's state is gone by the time they reach payment —
   * the stored value is what checkout actually charges.
   */
  const signupWithPackage = useCallback(
    (prev: Parameters<typeof signupAction>[0], formData: FormData) => {
      formData.set("packageKey", packageKey);
      return signupAction(prev, formData);
    },
    [packageKey],
  );

  /**
   * Carry the signed terms stamp into the consent submission, the same way
   * `signupWithPackage` carries the package. It is the server's own statement
   * round-tripped, not a client claim: `consentAction` verifies the signature
   * and refuses anything it didn't sign, so binding it here can only tell the
   * truth about which agreement this render put on screen.
   */
  const consentWithStamp = useCallback(
    (prev: Parameters<typeof consentAction>[0], formData: FormData) => {
      formData.set(CONSENT_STAMP_FIELD, consentStamp ?? "");
      return consentAction(prev, formData);
    },
    [consentStamp],
  );

  /**
   * The account now exists and the confirmation email is out, so open the modal
   * at the gate the customer has to clear. `confirm` is index 0 — the modal no
   * longer owns the step that just ran.
   */
  const completeSignup = useCallback((result: SignupResult) => {
    setContext({ firstName: result.firstName, lastName: result.lastName });
    setSignedUp(true);
    setExpiredLink(false);
    setFurthestStep("confirm");
    openModal(0);
  }, [openModal]);

  const reopen = useCallback(() => {
    openModal(0);
  }, [openModal]);

  /**
   * Payment is the last step we own — hand the customer to `/welcome` rather
   * than a step inside the modal, so the confirmation survives a reload and a
   * returning customer sees the same screen.
   */
  const completePayment = useCallback(() => {
    // `replace`, not `push`: the modal step the customer just left is behind a
    // paid `?booking=resume` page whose mount effect sends them here again, so
    // pushing would make Back bounce forward forever. Replacing keeps one exit
    // to the marketing site.
    router.replace(WELCOME_PATH);
  }, [router]);

  const close = useCallback(() => setOpen(false), []);

  /**
   * Reopen the flow for someone returning from a confirmation link.
   *
   * The confirm route redirects here with `?booking=resume` (or `expired`) and a
   * signed httpOnly cookie; the marker in the URL carries no identity of its own.
   * Resolving the step through a server action rather than in the page keeps the
   * home page statically rendered — only a returning customer pays the
   * round-trip. `router` is stable, so this still runs once on mount.
   */
  useEffect(() => {
    const marker = new URLSearchParams(window.location.search).get("booking");
    if (marker !== "resume" && marker !== "expired") {
      return;
    }
    let cancelled = false;
    void getBookingResumeState().then((resumed) => {
      if (cancelled || !resumed) {
        return;
      }
      // The server still calls a fully-paid booking "done"; that is no longer a
      // modal step, so send them to the screen it stands for. Checked before the
      // expired-link branch below, since a paid customer's address is proven.
      if (resumed.step === "done") {
        router.replace(WELCOME_PATH);
        return;
      }
      // The name as the row holds it, so a correction made in the details step
      // is what comes back rather than what signup first captured.
      setContext({ firstName: resumed.firstName, lastName: resumed.lastName });
      // The account exists, so the on-page form behind the modal would only
      // fail on the unique-email constraint if it were left submittable.
      setSignedUp(true);
      // Without this the flow would fall back to the default package and charge
      // the basic price for a Comprehensive booking — every customer passes
      // through here, because the confirmation gate is blocking.
      setPackageKey(resumed.packageKey);
      // An expired link lands on the confirmation step whatever else is done,
      // since the address still isn't proven.
      const target = marker === "expired" ? "confirm" : resumed.step;
      // Both, and together: an unproven address invalidates everything after it,
      // so an expired link must clamp the progress as well as the step. Letting
      // the two disagree would greet someone "Welcome Back!" over a list whose
      // rows the flow will not actually let them reach.
      setFurthestStep(target);
      setExpiredLink(marker === "expired");
      // The overview only for someone with progress to survey. `confirm` means
      // the address still isn't proven — whether that is a first visit or an
      // expired link — so there is nothing to summarise and one thing to do.
      openModal(MODAL_STEPS.indexOf(target), {
        overview: target !== "confirm",
      });
    });
    return () => {
      cancelled = true;
    };
  }, [router, openModal]);

  /**
   * Bind the chosen package to the checkout action. Memoised deliberately:
   * `PaymentStep` mints its Session from a `useEffect` keyed on this function,
   * so a new identity each render would create a fresh Stripe Session every
   * time the component re-rendered.
   */
  const createSession = useCallback(
    () => createAssessmentCheckoutSession(packageKey),
    [packageKey],
  );

  /**
   * Which product's vocabulary these steps speak in. Derived from the chosen
   * package rather than tracked alongside it, so the words a customer reads
   * can't disagree with the package they are being charged for — including
   * after the confirmation gate, where `packageKey` is restored from the server
   * and any parallel track state would have been lost.
   */
  const track = trackForPackage(packageKey);

  const step = MODAL_STEPS[stepIndex];

  // The agreement and the version naming it, resolved together — see
  // `resolveConsentTerms`. Only `content` is needed here; the version rode out
  // to the server that minted `consentStamp`.
  const consentTerms = resolveConsentTerms(modalCopy?.consent);

  // Each step's header is rendered by the Modal in a fixed region above the
  // scroll area (so only the body scrolls), using the step's own exported copy.
  // CMS copy from the Modals collection where an editor has written some, the
  // step's exported constant otherwise — keyed off MODAL_STEPS, so a renamed
  // step is a typecheck failure rather than a silently missing header.
  const headers = resolveStepHeaders(modalCopy, track);
  const stepHeader = <StepHeader {...headers[step]} />;

  /**
   * Go back into a step already behind them. Only ever called for a step the
   * model marks re-enterable — the rows and tabs for the others render nothing
   * clickable at all, so this is not a guard against a click that can happen.
   */
  const selectStep = useCallback(
    (key: DisplayStepKey) => {
      const index = stepIndexFor(key);
      if (index < 0) {
        return;
      }
      if (key === "details" && detailsValues === null) {
        void getBookingDetailsValues().then((fetched) => {
          // `{}` rather than leaving it null, so a user the server can't resolve
          // doesn't send a second request on the next visit to this step.
          setDetailsValues(fetched ?? {});
        });
      }
      setStepIndex(index);
      setPane("step");
    },
    [detailsValues],
  );

  const showOverview = pane === "overview";

  return (
    <>
      <BookingSection
        headline={headline}
        subheadline={subheadline}
        buttonText={buttonText}
        buttonTextShort={buttonTextMobile}
        showIncludes={showIncludes}
        action={signupWithPackage}
        onSignupComplete={completeSignup}
        signedUp={signedUp}
        onReopen={reopen}
        tinaFields={tinaFields}
      />
      <NavigatorNote />
      <Modal
        open={open}
        onClose={close}
        // The accessible name tracks what is actually on screen, rather than a
        // parallel list of step names that could drift from the visible titles.
        label={showOverview ? "Your onboarding steps" : headers[step].title}
        header={showOverview ? undefined : stepHeader}
        // The overview has no stepper — it *is* the step list — and neither does
        // the email gate, which sits before there is any progress to show.
        banner={
          showOverview || step === "confirm" ? undefined : (
            <BookingStepper
              furthestStep={furthestStep}
              activeStep={step}
              onSelectStep={selectStep}
            />
          )
        }
      >
        {showOverview && (
          <BookingOverviewPane
            furthestStep={furthestStep}
            activeStep={step}
            onStart={() => {
              setPane("step");
            }}
            onSelectStep={selectStep}
          />
        )}
        {!showOverview && step === "confirm" && (
          <EmailConfirmationStep
            expired={expiredLink}
            resend={resendConfirmationAction}
          />
        )}
        {!showOverview && step === "details" && (
          <DetailsForm
            action={detailsAction}
            firstName={context.firstName}
            lastName={context.lastName}
            // `key` remounts the form once the row arrives: the three controlled
            // fields seed from this prop in `useState`, which a re-render alone
            // would not revisit. Only ever changes on a deliberate re-entry.
            key={detailsValues ? "prefilled" : "blank"}
            initialValues={detailsValues ?? undefined}
            onComplete={advance}
            showHeader={false}
          />
        )}
        {!showOverview && step === "consent" && (
          <ConsentForm
            action={consentWithStamp}
            track={track}
            onComplete={advance}
            showHeader={false}
            // Undefined — not an element that renders nothing — when the CMS
            // holds no agreement, because that is what makes `ConsentForm` fall
            // back to the terms that ship in code. An empty element would leave
            // a customer accepting a blank box.
            terms={
              consentTerms.content ? (
                <ConsentTerms content={consentTerms.content} />
              ) : undefined
            }
          />
        )}
        {!showOverview && step === "payment" && (
          <PaymentStep
            createSession={createSession}
            finalize={finalizeCheckoutSession}
            onComplete={completePayment}
            showHeader={false}
          />
        )}
      </Modal>
    </>
  );
}
