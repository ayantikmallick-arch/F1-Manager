# APEX Formula One Team Manager

## Run locally

1. Install Node.js 20 or later.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open the local URL printed by Vite.

Use the Vite server rather than opening `index.html` directly; Firebase Authentication requires a web origin.

## Firebase Authentication

The welcome screen supports Google sign-in, email/password sign-in and account creation, password reset, and guest play.

1. In Firebase Console, open **Authentication → Sign-in method** and enable **Google** and **Email/Password**.
2. In **Authentication → Settings → Authorized domains**, add the development host (`127.0.0.1`) and the production host where the game will be deployed.
3. Copy `.env.example` to `.env.local` and set the Firebase web app values. The provided `.env.local` is excluded from source control.
4. Restart the Vite server after editing environment values.

Firebase web configuration is delivered to the browser and is not a secret, even when supplied through a local environment file. Restrict the Firebase API key to the intended web origins in Google Cloud Console, and configure Firebase Authentication and any future database security rules in Firebase Console.

Careers are stored in this browser's local storage under separate keys for guest play and each signed-in Firebase user. Sign-in currently does not synchronize career progress across devices.

Run `npm run build` to create the production site in `dist/`.

## Circuit layouts and live sessions

The 24 circuit maps use the 2025-season layouts from the [f1-circuits-svg white-outline collection](https://github.com/MisterSix2295/f1-circuits-svg/tree/main/circuits/white-outline). The SVG assets are stored in `src/tracks/`. Their upstream MIT license and copyright notice are kept in [`src/tracks/LICENSE.txt`](./src/tracks/LICENSE.txt) and shipped in production at [`public/licenses/f1-circuits-svg.txt`](./public/licenses/f1-circuits-svg.txt).

Practice, Q1–Q3 qualifying, and races share a continuously animated top-down circuit view; each car uses its team's supplied top-down sprite, follows the SVG track path, and is linked to its driver's number, name, and running position. Playback at 1× uses the circuit's configured lap time; the displayed lap duration updates with the selected 1×, 2×, 4×, 8×, 16×, 32×, or 64× speed. Live timing uses three-letter surname codes with full names available on hover/accessibility labels. The mobile timing tower is collapsible; on desktop it sits beside the circuit. During races, set each of your two cars to push, balanced, or conserve pace, or call it into the pits on the next lap. These calls affect the remaining race and its final classification. The race report retains lap-by-lap order, gaps, events, and car positions for replay.
