# Clinic photos

The "NAMA space" carousel shows every photo in this folder, in file-name order.

## Changing the photos

- **Order:** start each file name with a number: `01-salon.jpeg`, `02-wall.jpeg`, …
- **Replace a photo:** drop the new file in with the same name.
- **Add or remove one:** just add or delete the file. The dots update by themselves.
- Any shape works (landscape or portrait). Each photo keeps its own proportions.
- Keep each photo **under 500 KB**, about 1600 px on the long side (https://squoosh.app).

## Descriptions (for screen readers and Google)

The word after the number (`salon` in `01-salon.jpeg`) picks the description in
`clinic.carousel.photos` in `src/App.tsx`, in French, English and Arabic.
For a new photo, add a line there in all three languages, for example
`garden: 'Jardin de la clinique'`. Without one, a generic "The NAMA space" is used.
