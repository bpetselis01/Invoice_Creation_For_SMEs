import { atom } from "jotai";
import { atomStateControls } from "../../utils/atomUtils";

const emailAtom = atom<string>("");
const passwordAtom = atom<string>("");
const usernameAtom = atom<string>("");
const phoneAtom = atom<string>("");

export const { useEmailAtom, getEmailAtom } = atomStateControls(
  emailAtom,
  "Email"
);
export const { usePasswordAtom, getPasswordAtom } = atomStateControls(
  passwordAtom,
  "Password"
);
export const { useUsernameAtom, getUsernameAtom } = atomStateControls(
  usernameAtom,
  "Username"
);
export const { usePhoneAtom, getPhoneAtom } = atomStateControls(
  phoneAtom,
  "Phone"
);
