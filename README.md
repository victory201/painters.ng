# Painters.ng website

A lightweight one-page website designed for Linux shared hosting. The site uses HTML, CSS, vanilla JavaScript and a PHP email handler; no build command or database is required.

## Launch checklist

1. Confirm that `painters.ng` points to the hosting account.
2. Create `hello@painters.ng` and `website@painters.ng` in the hosting control panel.
3. Change `$recipient` and `$siteDomain` near the top of `contact.php` if necessary.
4. Replace the three project-art placeholders with optimized client-owned images from Painters.ng.
5. Add the confirmed WhatsApp number and link once supplied.
6. Upload all public files to `public_html` while keeping `.git` out of the web root.
7. Issue the free SSL certificate, then test the HTTPS redirect and quote form.

## Project images

Export source photography at approximately 1600px wide as WebP, with an 80-85 quality setting. Keep individual images below 300KB where practical. Add descriptive `alt` text to every meaningful image.

## Local preview

PHP must be installed to exercise the form endpoint:

```sh
php -S localhost:8000
```

Open `http://localhost:8000`. PHP's local mail function may not deliver email; end-to-end delivery should be tested through the hosting account.
