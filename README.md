# Classroom Hand Cricket

A phone-first hand cricket game: toss, bat or bowl, and beat the student on the bench. Win to earn trophy tokens.

## Features
- Heads/tails toss, then the winner picks bat or bowl
- "1, 2, 3" reveal each ball; same number = out
- Opponent's face changes with every ball
- Editable player and opponent names
- Trophy tokens saved in the browser (`localStorage`)

## Run locally
Open `index.html` in a browser.

## Publish on GitHub Pages
1. Create a new repository and upload these files to the root.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, pick `main` and `/ (root)`, then save.
4. Your game appears at `https://<your-username>.github.io/<repo-name>/`.

## Turn it into an Android app later
Wrap it with [Capacitor](https://capacitorjs.com): `npm init`, `npm i @capacitor/core @capacitor/cli @capacitor/android`, set `webDir` to this folder, then `npx cap add android` and open it in Android Studio.

## Ideas for next steps
Custom face and hand artwork, sound effects, a PWA service worker for offline play, difficulty levels.
