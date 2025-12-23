import React from "react";

const ContactUs = () => {
  return (
    <footer className="py-20 border-t border-[var(--color-line)] bg-[var(--color-panel)]/60 backdrop-blur relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Top: heading + contact */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-yellow-400"><b>Get in Touch</b></h2>

          <p className="mt-2 text-gray-700">
            {/* full URL for mailto */}
            <a
              href=""
              className="underline decoration-[var(--color-line)] hover:opacity-80"
            >
              support@treasurly.com
            </a>
            <span className="mx-2 text-gray-400">|</span>
            <span className="mx-2 text-gray-200">J15, Shephard St. University of Sydney NSW 2000 Australia</span>
          </p>

          {/* Social icons */}
          <div className="mt-6 flex items-center justify-center gap-6">
            <a
                href="https://www.instagram.com/treasurly"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Treasurly on Instagram"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 text-gray-200 transition-colors hover:text-yellow-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/60"
                title="Instagram"
            >
            {/* Instagram (stroke-based, theme-friendly) */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <circle cx="17.5" cy="6.5" r="1" />
            </svg>
            </a>

            <a
                href=""
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Treasurly on Facebook"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 text-gray-200 transition-colors hover:text-yellow-400"
                title="Facebook"
            >
              {/* Facebook SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" className="h-6 w-6">
                <path  fill="currentColor" d="M279.14 288l14.22-92.66h-88.91V127.41c0-25.35 12.42-50.06 52.24-50.06H295V6.26S259.65 0 225.36 0C149.1 0 100.2 44.38 100.2 124.72v70.62H12v92.66h88.2V512h107.62V288z"/>
              </svg>
            </a>

            <a
                href=""
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Treasurly on X (Twitter)"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 text-gray-200 transition-colors hover:text-yellow-400"
                title="X"
            >
              {/* X / Twitter SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="h-6 w-6">
                <path fill="currentColor" d="M389.2 48h70.6L305.3 229.6 482 464H343.6L232.3 318.6 104 464H33.4L196.2 270.9 24 48h140.9l99.6 130.5L389.2 48zM364.4 418.1h39.1L151.1 90h-42L364.4 418.1z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Map */}
        <div className="mt-10 rounded-lg flex justify-center">
           <div className="w-[320px] h-[320px] rounded-lg overflow-hidden border border-[var(--color-line)] shadow-sm">
            <iframe
                title="Treasurly Location Map"
                className="w-[320px] h-[320px] block"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                // Full embed URL pointing to J15, Shephard St, University of Sydney
                src="https://www.google.com/maps?q=J15.Shepherd%20St%20Building.Electronics%20%26%20Comms%20Lab%2C%20Shepherd%20St%2C%20Chippendale%20NSW%202008&output=embed"
            ></iframe>
          </div>
        </div>

        {/* Bottom copyright */}
        <p className="mt-8 text-center text-xs text-gray-500">
          © 2025 Treasurly. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default ContactUs;
