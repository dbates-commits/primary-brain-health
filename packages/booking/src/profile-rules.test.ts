import { describe, expect, it } from "vitest";
import { validateProfileFields } from "./profile-rules";

/** A profile that passes every rule; each test spoils one field. */
const VALID = {
  firstName: "David",
  lastName: "Smith",
  dateOfBirth: "1975-04-12",
  zip: "12345",
  phone: "(555) 000-0000",
  gender: "MALE",
  educationLevel: "ED_YEARS_16",
};

describe("validateProfileFields", () => {
  it("passes a complete profile", () => {
    expect(validateProfileFields(VALID)).toEqual({});
  });

  it("rejects a ZIP that is not five digits", () => {
    expect(validateProfileFields({ ...VALID, zip: "1234" })).toHaveProperty("zip");
    expect(validateProfileFields({ ...VALID, zip: "123456" })).toHaveProperty("zip");
  });

  it("counts phone digits, not characters", () => {
    expect(validateProfileFields({ ...VALID, phone: "5550000000" })).toEqual({});
    expect(validateProfileFields({ ...VALID, phone: "(555) 000-000" })).toHaveProperty("phone");
  });

  it("rejects an unparseable or future date of birth", () => {
    expect(validateProfileFields({ ...VALID, dateOfBirth: "" })).toHaveProperty("dateOfBirth");
    expect(validateProfileFields({ ...VALID, dateOfBirth: "not-a-date" })).toHaveProperty(
      "dateOfBirth",
    );
    expect(validateProfileFields({ ...VALID, dateOfBirth: "2999-01-01" })).toHaveProperty(
      "dateOfBirth",
    );
  });

  /**
   * The load-bearing one: an out-of-set education value is a 500 from Linus at
   * registration, not a validation error — see `field-options.ts`.
   */
  it("rejects option values outside the Linus enums", () => {
    expect(validateProfileFields({ ...VALID, gender: "Male" })).toHaveProperty("gender");
    expect(validateProfileFields({ ...VALID, educationLevel: "ED_YEARS_20" })).toHaveProperty(
      "educationLevel",
    );
  });

  /** The booking step hangs the same rule off its `patient*` inputs. */
  it("keys the name errors by the caller's field names", () => {
    const blank = { ...VALID, firstName: "", lastName: "" };
    expect(validateProfileFields(blank)).toEqual({
      firstName: "Enter a first name.",
      lastName: "Enter a last name.",
    });
    expect(
      validateProfileFields(blank, { first: "patientFirstName", last: "patientLastName" }),
    ).toEqual({
      patientFirstName: "Enter a first name.",
      patientLastName: "Enter a last name.",
    });
  });
});
