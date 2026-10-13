# Team photos

Put the practitioners' photos in this folder. The website shows each photo
in that person's card automatically. Anyone without a photo keeps the
line-drawing placeholder.

## File names

Name each photo exactly like this (lowercase, no spaces):

| Person                   | File name        |
|--------------------------|------------------|
| Marie-Ange Abou Chrouche | `marie-ange.jpg` |
| Nour Asmar               | `nour.jpg`       |
| Tracy Chamoun            | `tracy.jpg`      |
| Romy Moussa              | `romy.jpg`       |
| Perla Boutros            | `perla.jpg`      |
| Christian Abou Zahra     | `christian.jpg`  |
| Mervat Salem             | `mervat.jpg`     |
| Fadia Mourad             | `fadia.jpg`      |
| Frederic Nader           | `frederic.jpg`   |
| Jeanne d’Arc Tannous     | `jeanne-darc.jpg`|

`.jpg`, `.jpeg`, `.png` and `.webp` all work, for example `nour.png`.
Use only one file per person.

## What makes a good photo

- **Vertical or square**, at least **800 × 800 pixels**.
- **Face in the upper third.** The card crops the photo to fill the frame
  and keeps the top-middle part, so leave some space above the head.
- **Plain, light background** and soft daylight. It matches the site's
  cream and olive colours best.
- **Under 500 KB.** Phone photos are often 3–5 MB. Shrink them first,
  for example with https://squoosh.app (free, works in the browser),
  set to 1000 px wide and quality ~75.
- **Permission:** make sure each person agrees to their photo being online.

## Adding a photo

1. Rename the photo as shown above.
2. Drag it into this folder: `artifacts/nama-polyclinic/src/assets/team/`.
3. If the website is running locally, it updates by itself. Check the
   "Notre équipe" section at http://localhost:5173/#equipe.
4. To put it online, commit the file and redeploy on Replit.

## Adjusting the crop

If a face sits too high or too low in its card, change that person's
`focus` in `teamPhotoIds` near the top of `src/App.tsx`. `0%` shows the top
of the photo and `100%` the bottom, so a higher number moves the face up.

## Adding a new team member

There are three groups, each with its own photo size:

| Group                   | List in `src/App.tsx` | Photo height |
|-------------------------|-----------------------|--------------|
| Co-founders             | `founders`            | 400 px       |
| "Notre équipe"          | `members`             | 270 px       |
| "Équipe de soutien"     | `support`             | 200 px       |

A group's heading only appears once it has at least one person.

1. Add the person to the right list in all three languages in `src/App.tsx`
   (`fr`, `en` and `ar`), for example:
   ```ts
   {
     name: 'Rita Haddad',
     specialty: 'Physiothérapeute',          // shown under the photo
     details: [                              // shown on hover / tap
       'Diplômée de …, elle accompagne …',
       'Langues : français, anglais, arabe.',
     ],
   }
   ```
   Under the photo, only the name and `specialty` show. Everything in
   `details` (one string per paragraph) appears over the photo on hover, on
   tap on phones, or when the "+" button gets keyboard focus. Leave `details`
   out and the card has no "+" button.
2. Add their name, a short file id and a crop to `teamPhotoIds` near the
   top of `src/App.tsx`, for example `'Rita Haddad': { id: 'rita', focus: '25%' }`.
3. Put `rita.jpg` in this folder.
