MAVERICKS BADMINTON ACADEMY — HOW TO ADD, CHANGE AND REMOVE PHOTOS
=====================================================

You never need to touch the website's code. You only ever do two things:
  (a) put a picture file in THIS folder (images/photos/), and
  (b) add or change ONE line in the file photos.json (also in this folder).

If no photos are listed, the website shows friendly "Photo coming soon" boxes.


PART 1 — THE "ACADEMY MOMENTS" GALLERY (any number of photos, 1 to 12 or more)
---------------------------------------------------------------------------
TO ADD A PHOTO
  1. Get your photo ready (see "Getting a photo the right size" below).
     Give it a simple name with no spaces, e.g.  friday-social.jpg
  2. Copy it into this folder (images/photos/).
  3. Open photos.json in Notepad / TextEdit. Find the part that says "gallery".
  4. Add one line for your photo inside the square brackets [ ]:

        { "file": "friday-social.jpg", "alt": "Players at the Friday social", "caption": "Friday social" },

     - file    = the exact file name (capital letters and .jpg/.jpeg/.png/.webp matter)
     - alt     = a short description for people who can't see the picture (screen readers) — please always fill this in
     - caption = optional words shown on the photo. Leave it out if you don't want one.
     - IMPORTANT: every line ends with a comma EXCEPT the very last line in the list.
  5. Save the file and reload the website (see "Nothing changed?" at the bottom).

TO REPLACE A PHOTO
  Easiest: save the new picture with the SAME file name over the old one.
  Or: add the new file and change the "file" name on that line in photos.json.

TO REMOVE A PHOTO
  Delete its whole line from photos.json (you can leave the picture file where it is,
  or delete it too).

TO CHANGE THE ORDER
  Photos appear in the same order as the lines. Move a line up or down to move the photo.

THE LAYOUT LOOKS AFTER ITSELF
  The gallery arranges any number of photos neatly (1 big photo, 2 side by side, 3 or 4 in a row,
  and tidy rows beyond that). Photos are shown as tidy rectangles (portrait, 4:5), so the edges
  can be trimmed — keep the main subject (faces!) near the middle. Visitors can tap a photo to see
  it full size.
  If a face is being cut off, add a "focus" to that line to say which part to keep, e.g.
      { "file": "squad.jpg", "alt": "The junior squad", "focus": "center top" }
  (focus can be: "center top", "center bottom", "left center", "right center", or "center").

AN EXAMPLE photos.json WITH THREE GALLERY PHOTOS
  (copy this shape; the five named photo spots at the top can stay empty "")

  {
    "junior-coaching": "",
    "junior-lisa": "",
    "junior-squad": "",
    "venue-hall": "",
    "about-club": "",

    "gallery": [
      { "file": "friday-social.jpg",  "alt": "Players at the Friday social", "caption": "Friday social" },
      { "file": "juniors-smash.jpg",  "alt": "A junior playing a smash" },
      { "file": "ladies-club.jpg",    "alt": "Ladies Club on a Sunday morning", "caption": "Ladies Club" }
    ]
  }

If a file name is wrong or the picture is missing, the website quietly leaves that photo out.


PART 2 — THE NAMED PHOTO SPOTS (hero / section pictures)
--------------------------------------------------------
These are fixed places on the page. To fill one, put the file name between the quotes
next to its name in photos.json, e.g.   "junior-coaching": "junior-coaching.jpg"
Optional description for screen readers:  "junior-coaching_alt": "Juniors practising clears"

  Name              Shape           Best size (px)   Where it appears
  ----------------  --------------  ---------------  -------------------------------------------
  junior-coaching   wide 16:9       1600 x 900       Juniors section — the big coaching photo
  junior-lisa       4:5 portrait    1200 x 1500      Juniors — big "Train with Lisa Curtin" feature block (her photo)
  junior-squad      wide 16:9       1600 x 900       Juniors — the group / squad
  venue-hall        extra wide 21:9 1890 x 810       Schedule — St. Michael's sports hall
  about-club        wide 16:9       1600 x 900       Grown-ups section — an evening group shot

To replace one: use the same file name, or change the name in photos.json.
To remove one: put "" (two quote marks) back between the quotes.
(The old four portrait spots — junior-action, junior-tournament, ladies-club, mixed-social —
are now simply photos in the gallery list. No Sunday Mens photos are needed.)


GETTING A PHOTO THE RIGHT SIZE (this keeps the site fast)
---------------------------------------------------------
Phone photos are huge (3–8 MB). Please shrink them first — aim for about 1200–1600 pixels on the
long side and under 300 KB.
  - Windows: open the photo in Photos > "..." > Resize image, or use the free site squoosh.app
  - Mac: open in Preview > Tools > Adjust Size (width 1600) and File > Export > quality about 70%
  - Phone / any computer: go to squoosh.app (free, in your browser), drop the photo in, choose
    "MozJPEG" or "WebP", quality 70–75, width 1600, and download.
Use .jpg, .png or .webp. No spaces in the file name (use friday-social.jpg, not "Friday social.jpg").
Please only use photos you have permission to share — especially of children.


NOTHING CHANGED? (the preview doesn't update)
---------------------------------------------
  1. Save photos.json, then hard-refresh the page:  Windows  Ctrl + F5   |  Mac  Cmd + Shift + R
  2. Check the file name in photos.json matches the picture's name EXACTLY (capitals, spelling, .jpg).
  3. Check the picture is inside images/photos/ (not in a sub-folder or on the Desktop).
  4. Check commas: every line in the list ends with a comma except the last one, and every
     name and file is inside "double quotes". If the file has a typo, the website shows the
     "Photo coming soon" boxes — paste the file into jsonlint.com to find the mistake.
  5. photos.json is only read when the site is opened through a web address (e.g.
     http://localhost:3008 or the real website), NOT by double-clicking index.html on your computer.
  6. Still stuck? Try a private/incognito window, which skips old saved copies.
