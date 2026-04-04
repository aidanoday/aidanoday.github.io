//project-cards

console.log("1. Script loaded successfully!");

const PROJECT_DATA = {

   "optml-shipper": {
    title: "📊 optML shipper",
    image: "assets/optML_Ship.png",
    link: "optML_shipper.html",
    subtitle: "AI-augmented Shipping Dashboard",
    desc: "Fall 2025 - How might a top 3 global athletics company leverage machine learning to optimize their downstream supply chain? Following a general call for innovative ways to leverage ai, I explored this question, developed a business plan, and used Claude to help make a prototype in react.js."
  },

  "store-portal": {
    title: "🗓️ Store Portal 2.1",
    image: "assets/store_portal_cover.png",
    link: "storePortal_2_1.html",
    subtitle: "User research, Interface design",
    desc: "Summer/Fall 2025 - How can UX best practices and insights from contextual inquiry elevate lululemon's internally-built Store Shipping Portal from minimum viable product to most valuable portal?"
  },
  "dawg-walks": {
    title: "👯‍♀️ Dawg Walks Kiosk",
    image: "assets/dawgWalks.png",
    link: "https://sites.google.com/uw.edu/dawgwalks/home",
    external: true,
    subtitle: "Service design for UW",
    desc: "Autumn 2025 - How might we increase safety and connection for UW students traveling after dark?"
  },
  "link-cc": {
    title: "🎨 Creative Connections App",
    image: "assets/linkCover.png",
    link: "linkCC.html",
    subtitle: "Mobile UX Design for ILOVEWHATEVER.",
    desc: "Summer 2022 - How might we create an app for creative connection that is atomic, and so simple that anyone can use it?  Facing a evaporating runway and low user adoption, we refocused the app on one core feature: aggregating and sharing creative work simply and quickly."
  },
  "pebble-ai": {
    title: "🗿 Pebble AI Agent",
    image: "assets/ai_pebble.png",
    link: "ai_pebble.html",
    subtitle: "In-context Academic Advising",
    desc: "Spring 2025 - How might we guide lost students at a critical junctures in their academic journeys?  Using agentic adivsors trained on historic student data and advising materials, this concept brings personalized, context-aware, and proactive advising to students.  I developed the concept and prototype in collaboration with a team of 2 other designers for a graduate design course at University of Washington."
  },
  "twabler": {
    title: "🏷 Twabler App",
    image: "assets/Twabler_Cover.png",
    link: "twabler.html",
    subtitle: "Mobile UX for Code for San Francisco",
    desc: "Autumn 2019 - A labeling method for ML NLP training sets that improves on old methods by segmenting and batching tweet labeling tasks. While volunteering for the UX team at Code for San Francisco, I picked up where their previous designer left off and improved entity coding speed by 130%."
  },
  "knomee": {
    title: "💆‍♀️ Knomee Mobile Prototype",
    image: "assets/Knomee.png",
    link: "knomee_app.html",
    subtitle: "Strategy and Prototyping for Knomee",
    desc: "Winter 2023 - How might we help the newly-affluent meaningfully align their financial planning with values?  I worked directly with the founder of Knomee to bring her MVP prototype to life with a lively clickable Figma prototype."
  },
  "inquired": {
    title: "📚 Better Curriculum Navigation",
    image: "assets/InquirED.png",
    action: "showDialog()",
    subtitle: "Accessibility Audit, Mobile First Design, and Navigation Redesign for InquirED",
    desc: "Summer 2024 - How might we use accessibility compliance as an opportunity to improve clarity?  Building off of a win in redesigning the curriculum selection page, I worked for three months with engineers and product managers to overhaul the navigation system and correct over 93 flagged accessibility issues."
  },
  "synq": {
    title: "🎞 Synq Logo Animation",
    image: "assets/Synq_Cover.png",
    link: "synq.html",
    subtitle: "Logo and Motion Design for Synq",
    desc: "Autumn 2022 - A stylized “S” revealed as just a part of the larger whole: a composite isometric cube. I created this logo and animation for Synq, an app to facilitate spontaneous meetups between friends."
  },
  "jordache": {
    title: "👖 JORDACHE Home Page",
    image: "assets/Jordache_Cover.png",
    link: "jordache.html",
    subtitle: "Responsive Landing Page for JORDACHE",
    desc: "Winter 2023 - Revamping JORDACHE's online storefront to communicate 'Sexy, Bold, and Timeless,' for responsive web environment."
  },
  "stay-home": {
    title: "🏠 Stay Home App",
    image: "assets/StayHome_Cover.png",
    link: "stayHome.html",
    subtitle: "Mobile App Hack",
    desc: "Summer 2020 - How might we transform staying home into a fun, safe, and rewarding experience?"
  },
  "tact-tiles": {
    title: "🧊 TactTiles Focus Box",
    image: "assets/TactileCubeCover.png",
    link: "tactTiles.html",
    subtitle: "Interaction Design for DALI Lab.",
    desc: "Winter-Spring 2019 - A customizable sensory therapeutic toy for people with Autism with heightened sensory input."
  },
  "rent-cap": {
    title: "🌇 Rent Cap Portal",
    image: "assets/RentCap_Cover.png",
    link: "rentCap.html",
    subtitle: "Web App and Logo Design for Code for San Francisco",
    desc: "Fall 2019 - An informational portal for helping tenants determine new rent protection status."
  },
  "honor-code": {
    title: "🤥 Honor Code Study",
    image: "assets/ivyLeagueCheaters_cover.png",
    link: "cheaters.html",
    subtitle: "Culminating Systems Design Case for Engs 12 course",
    desc: "Fall 2018 - Do students cheat at Dartmouth? What drives this behavior? What can faculty do to curb this behavior?"
  },
  "tote": {
    title: "👜 Wide-Open Shelf Tote",
    image: "assets/toteCover.png",
    link: "tote.html",
    subtitle: "Product Design for Engs 12 course",
    desc: "Fall 2018 - An over-the-shoulder tote that opens wider than any other bag"
  },
  "animations": {
    title: "🎞 Animation",
    image: "assets/laptop_spin.gif",
    link: "animations/index.html",
    subtitle: "A Gallery of Motion Graphics.",
    desc: "I create animations and motion graphics using a mix of Procreate and Adobe Animate.",
    status:"pending"
  },
  "waybetterboxd": {
    title: "🎬 waybetterboxd web app",
    image: "assets/waybetterboxd_cover.png",
    link: "https://www.aidanoday.me/waybetterboxd.html?list=H4sIAAAAAAAAE4VVy27cRhD8lcJecuGubCXIIZdAVmwoiI0YkhAhMHxoDpucgYbTxPRwafqkf8gpQPJz-pKkh5LtOAddJK22px9VXdXv3u1uQkqBUTzjrYjfNTtfyqQ_nJxELoVzKx-6g5PxpA9xPFlq9L543k9b9CsaQ1x3ze6nOYc0gBIkdyFRXtHRipBwMacuc4czlxk3Il2Dr6pCuShkLiiCPqQOKiPDS-L1gDdBQyqcp8yllkCSwuizjDj3OWiRyXPGpbQhNfh1iXCSjiE51pq-wXUYBs4NLqltQ2nwNgyRS4NfKA3U4FKkAaUOL3mVbH1RseZCxipzGtDnwKmDJ0XLnOBoKrPN1K4guMxkH5Fo_Pd_93d_vSB3q5Lu7_6uaYvn1WZ8HDGzupnhw3jYNbvnu2Z3FjpK3-iuef6-ebe7lhVXRfKK0ycIKbLu1SL3p1-ScZa6FZ6pU0jfW8lzWVpZcU7j1CAyHQ1JHxRFVvvxMK4sCR0fg2M94NqHNCjUh74gpCLwYfAYmDIWz6mS3SqrhiNbIjiJkV2R_ADFWcQbd-MN_dRYcs6QHmfx_u5PhY35gnLCbegSTVqXYz3Auq8BtbdR5lRA6Kgu2AN2Y1ANkhq8mD9-xOsw-LJaXyPbKtlgIxXnK_w1bSWvCDp2oWPrPzM81wAL90y5oOQ5rmg5Shoeufld5qw_7ppnRs3NXDzXRi7YiipOn51-_5RsHh_t_fZo__DoUkZKjrciaYDkyVPCBVPxLoa-R1BQJ1PZds0EszDF4le8pJzU04K-sl4HGeXIulG18claqHCD_7V9wJUYfJYx8WKwho5TQU8xKnrJFRUn40QVaTLJiRbO0GC_GpxT8autCaMsAvWUGYTMI-VbaiOjlbr9VKDMo2JObWbavptTCXHL0aBnjtadtTNlVjU5SQ8VF2jTM6dSCdd5qhFsnOXHl7rNTzkHVrzsBsp4bUCkBoTRNrXHyJQUixe03IeyJTCE5syHL1E_ylKXZQmpxrTkbm0dvvtSqnUfLjg_Qb6vEVcu4FXYNbuf04a5FKigC1rIUJ-th8awlE7sL0KUxHHFkkNFe5qz82RjkzEWVxMqR5m4g0ycqZqjrlp4RMcahsSdDWGSqDVn5Vx1xUfOKxJzd8C1fCpav9M5Tzlo7SDbepbgkDmSoa8-TI9lzQrLYm7ow_hJRl93Ul3EiP9MIUVEOTKqb6GNnDqFusDJMfrgLKbmy5s67IYQdKljUHywZ_4wRcmsG5qb_0q_ZX7wXCxk3lbNnJ1PEmVYEVQiFd4WxklK7IpiVlCMxvG3xtYUbvkTx69Fzf9wnSnpBsQTnEfRsg9pX_7z4rParxeBxUBljopj0FAxu5bbVXB_90dtv96eBokHM1XusIS-DkmYvBQZMtXDZ4MQFlLP3X6ezAWCwUsZ6kUejub1b6bmkXNVlNWol9aU0dnBjeQ25CZO1dD7zNzJaCvUMjJTNBCYnIeYm9R1qQaR1ga00Lrd5M15YtisCGcj5-DIoLUbdSV9oA3a9_8AsroBsIAIAAA&name=Aidan's%20Demo%20List",
    external: true,
    subtitle: "Build: Serverless Peer-to-Peer Movie Listing and Recommendation App",
    desc: "Spring 2025 - A friend sent me a link to a sprawling spreadsheet asking for movie recommendations. I asked why she didn't just use Letterboxd. For her, Letterboxd had too many features, and didn't allow for convenient list sharing. I made this app using google gemini as a tongue-in-cheek solution that more specifically generalizes her use case for others."
  },
  "thewaitlist": {
    title: "The Waitlist",
    image: "assets/thewaitlist_cover.png",
    link: "https://www.aidanoday.me/thewaitlist/",
    external: true,
    subtitle: "Build: Full Stack Web App built in React and deployed with a Cloudflare D1 SQL backend",
    desc: "Spring 2026 - Ever since I built waybetterboxd, I've been curious about pushing past the limits of serverless web apps and deploying a full stack app. I used Claude Code and Omma to explore the essentials of application deployment - identity management, account creation, backend calls, and account deletion - through this lightweight build that purports to be a premier wait list experience."
  }
  // ... (Keep the rest of your data here)
};

// ... (Keep your PROJECT_DATA object at the top)

// ... Project cards described below:

class ProjectCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.expanded = false;
    }

    connectedCallback() { this.render(); }

    toggleExpand(e) {
        e.preventDefault();
        e.stopPropagation();
        this.expanded = !this.expanded;

        const desc = this.shadowRoot.querySelector('.desc');
        const btn = this.shadowRoot.querySelector('.toggle-btn');

        if (this.expanded) {
            desc.style.webkitLineClamp = 'unset';
            desc.style.maxHeight = desc.scrollHeight + 'px';
            btn.textContent = 'see less...';
        } else {
            // Set current expanded height so transition has a start value
            desc.style.maxHeight = desc.scrollHeight + 'px';
            // Force reflow then collapse
            desc.offsetHeight;
            desc.style.maxHeight = desc.dataset.collapsedHeight + 'px';
            btn.textContent = 'see more...';
            // Re-apply line clamp after transition finishes
            desc.addEventListener('transitionend', () => {
                if (!this.expanded) {
                    desc.style.webkitLineClamp = '3';
                }
            }, { once: true });
        }
    }

    render() {
        const slug = this.getAttribute('slug');
        const data = PROJECT_DATA[slug];
        if (!data) return;

        // 1. Determine the Wrapper Behavior
        let wrapperOpen;
        let wrapperClose;

        if (data.action === "showDialog()") {
            // Use the new global function we built
            wrapperOpen = `<div class="card" onclick="showConstructionDialog()">`;
            wrapperClose = `</div>`;
        } else {
            const isExternal = data.external ? 'target="_blank"' : '';
            wrapperOpen = `<a class="card" href="${data.link || '#'}" ${isExternal}>`;
            wrapperClose = `</a>`;
        }

        this.shadowRoot.innerHTML = `
        <style>
            :host { 
                display: block; 
                min-width: 270px;
                width: 100%; 
            }
            
            .card { 
                display: flex; 
                flex-direction: column; 
                text-decoration: none; 
                color: #1a1a1a; 
                background: var(--Surface, #FFF7F0);
                border-radius: 12px; 
                border:solid 1px #626262;
                overflow: hidden;
                transform: translateZ(0);
                box-shadow: 0 2px 8px rgba(0, 43, 128, 0.08);
                transition: transform 0.2s ease, box-shadow 0.2s ease; 
                height: auto;
                font-family: 'Roboto', sans-serif;
                box-sizing: border-box;
                cursor: pointer;
            }

            /* Visual feedback for "Under Construction" items */
            .card[onclick*="showConstructionDialog"] {
                cursor: help;
            }

            .card:hover { 
                transform: translateY(-4px);
                box-shadow: 0 8px 16px rgba(82, 114, 255, 0.5); 
            }

            .img-container {
                width: calc(100%-18px);
                margin: 8px;
                height: auto; 
                overflow: hidden;
                border-radius: 4px; 
                border:solid 1px #626262; 
            }

            img { 
                width: 100%; 
                height: auto; 
                display: block;
            }

            .text-content { 
                padding: 16px 20px 24px 20px; 
                display: flex; 
                flex-direction: column; 
                gap: 6px; 
            }

            h3 { 
                margin: 0 0 4px 0; 
                font-size: 24px; 
                font-weight: 700; 
                line-height: 1.2;
                color: #000;
            }

            .subtitle { 
                font-size: 12px; 
                font-weight: 700; 
                color: #000;
                margin-bottom: 4px;
                display: block;
            }

            .desc {
                margin: 0;
                font-size: 12px;
                font-weight: 400;
                line-height: 1.5;
                color: #333;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 3;
                overflow: hidden;
                transition: max-height 300ms ease-in-out;
            }

            .toggle-btn {
                background: rgba(255, 247, 240, 0.7);
                border: 1px solid rgba(0, 0, 0, 0.15);
                padding: 6px 14px;
                border-radius: 6px;
                margin-top: 2px;
                cursor: pointer;
                font-family: 'Roboto', sans-serif;
                font-size: 12px;
                font-weight: 600;
                color: #888;
                text-decoration: underline;
                text-underline-offset: 2px;
                align-self: flex-start;
                transition: color 0.2s, background 0.2s, border-color 0.2s;
            }

            .toggle-btn:hover {
                color: #555;
                background: rgba(255, 247, 240, 0.9);
                border-color: rgba(0, 0, 0, 0.25);
            }
            .toggle-btn.hidden { display: none; }
            .text-content:has(.toggle-btn:not(.hidden)) { padding-bottom: 8px; }

            /* 1. Create the container for the hover label */
            .card[onclick*="showConstructionDialog"] {
                position: relative;
                cursor: help;
            }

            /* 2. The Label itself (Hidden by default) */
            .card[onclick*="showConstructionDialog"]::after {
                content: "Coming Soon 🚧";
                position: absolute;
                top: 16px;
                right: 16px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 10px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                opacity: 0;
                transition: opacity 0.2s ease;
                pointer-events: none; /* Prevents the label from blocking clicks */
                z-index: 10;
            }

            /* 3. Show on Hover */
            .card[onclick*="showConstructionDialog"]:hover::after {
                opacity: 1;
}
        </style>

        ${wrapperOpen}
            <div class="img-container">
                <img src="${data.image}" alt="${data.title}">
            </div>
            <section class="text-content">
                <h3>${data.title}</h3>
                <span class="subtitle">${data.subtitle}</span>
                <p class="desc">${data.desc}</p>
                <button class="toggle-btn">${this.expanded ? 'see less...' : 'see more...'}</button>
            </section>
        ${wrapperClose}`;
        
        this.shadowRoot.querySelector('.toggle-btn').addEventListener('click', (e) => this.toggleExpand(e));

        // Only show the toggle button when text is actually clamped
        const desc = this.shadowRoot.querySelector('.desc');
        const btn = this.shadowRoot.querySelector('.toggle-btn');

        // Wait a frame so layout is computed
        requestAnimationFrame(() => {
            if (desc.scrollHeight <= desc.clientHeight) {
                btn.classList.add('hidden');
            }
            // Store collapsed height and set initial max-height for transitions
            desc.dataset.collapsedHeight = desc.clientHeight;
            desc.style.maxHeight = desc.clientHeight + 'px';
        });
    }
}
customElements.define('project-card', ProjectCard);

//============peekaboo navigation bar====================
// Make SVG accessible but not keyboard-focusable
document.addEventListener('DOMContentLoaded', function() {
  var nav = document.getElementById("peekaboo");
  if (nav) {
    var svg = nav.querySelector("svg");
    if (svg) {
      // Don't add tabindex so SVG is not in tab order
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", "Home logo");
    }

    // Ensure nav links are always in tab order even when nav is hidden
    var links = nav.querySelectorAll("a");
    links.forEach(function(link, index) {
      // Give explicit tabindex to ensure nav links come first
      link.setAttribute("tabindex", index + 1);

      // Show nav when any link receives focus
      link.addEventListener("focus", function() {
        nav.style.top = "0";
      });
    });
  }
});

// Scroll-based show/hide behavior
var prevScrollpos = window.pageYOffset;

window.onscroll = function() {
  var currentScrollPos = window.pageYOffset;
  var nav = document.getElementById("peekaboo");

  // Don't hide nav when an element inside has focus
  if (nav && !nav.matches(':focus-within')) {
    if (prevScrollpos > currentScrollPos) {
      nav.style.top = "0";
    } else {
      nav.style.top = "-100px";
    }
  }
  prevScrollpos = currentScrollPos;
}


// Under Construction Dialog
/* --- Construction Dialog Logic --- */

// 1. Create the functions FIRST so they exist in memory
window.showConstructionDialog = function() {
    const dialog = document.getElementById('constructionDialog');
    if (dialog) {
        dialog.removeAttribute('inert');
        dialog.showModal();
    } else {
        // If the element hasn't been created yet, try to create it now
        createConstructionDialog();
        document.getElementById('constructionDialog').showModal();
    }
};

window.closeConstructionDialog = function() {
    const dialog = document.getElementById('constructionDialog');
    if (dialog) {
        dialog.close();
        dialog.setAttribute('inert', '');
    }
};

// 2. Function to build the UI
function createConstructionDialog() {
    if (document.getElementById('constructionDialog')) return; // Don't duplicate

    const style = document.createElement('style');
    style.textContent = `
        #constructionDialog {
            position: fixed;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            margin: 0;
            z-index: 10001;
            border: none;
            border-radius: 12px;
            padding: 0;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
            max-width: 400px;
            width: 85%;
            background: white;
        }
        #constructionDialog::backdrop {
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(4px);
        }
        .dialog-content { padding: 30px; text-align: center; font-family: sans-serif; }
        .dialog-content h2 { margin-top: 0; font-size: 22px; }
        .close-button {
            margin-top: 20px;
            padding: 12px 24px;
            background: #222;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
        }
        .close-button:hover { background: paleturquoise; color: black; }
    `;
    document.head.appendChild(style);

    const dialog = document.createElement('dialog');
    dialog.id = 'constructionDialog';
    dialog.setAttribute('inert', '');
    dialog.innerHTML = `
        <div class="dialog-content">
            <h2>🚧 Page In Progress 🚧</h2>
            <p>So sorry! This project is done but the writeup is still in progress. Check back soon!</p>
            <button class="close-button" onclick="closeConstructionDialog()">Done (esc)</button>
        </div>
    `;
    document.body.appendChild(dialog);

    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) closeConstructionDialog();
    });
}

// 3. Initialize as soon as the script loads
createConstructionDialog();

/**
 * Typewriter Contact Widget
 *
 * Usage:
 *   <div id="typewriter-contact"></div>
 *   <script
 *     src="typewriter-contact.js"
 *     data-public-key="YOUR_PUBLIC_KEY"
 *     data-service-id="YOUR_SERVICE_ID"
 *     data-template-id="YOUR_TEMPLATE_ID"
 *   ></script>
 *
 * Optional: data-container="custom-id" to target a different container.
 * All styles are scoped to .tw-widget to avoid conflicts.
 */
(function () {
  const scriptEl = document.currentScript;
  const EMAILJS_PUBLIC_KEY  = scriptEl?.getAttribute('data-public-key')  || 'YOUR_PUBLIC_KEY';
  const EMAILJS_SERVICE_ID  = scriptEl?.getAttribute('data-service-id')  || 'YOUR_SERVICE_ID';
  const EMAILJS_TEMPLATE_ID = scriptEl?.getAttribute('data-template-id') || 'YOUR_TEMPLATE_ID';
  const CONTAINER_ID        = scriptEl?.getAttribute('data-container')   || 'typewriter-contact';
  const BACKUP_URL          = scriptEl?.getAttribute('data-backup-url')  || null;

  // Load Google Fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Special+Elite&family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Pinyon+Script&display=swap';
  document.head.appendChild(fontLink);

  // Load EmailJS SDK
  function loadEmailJS() {
    return new Promise((resolve, reject) => {
      if (window.emailjs) { resolve(); return; }
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  // ── Inject CSS ──
  function injectStyles() {
    const style = document.createElement('style');
    style.id = 'tw-widget-styles';
    style.textContent = getWidgetCSS();
    document.head.appendChild(style);
  }

  function getWidgetCSS() {
    return `
    .tw-widget *, .tw-widget *::before, .tw-widget *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    .tw-widget {
      --tw-body-dark: #2c2927;
      --tw-body-mid: #3d3835;
      --tw-chrome: #6b6260;
      --tw-paper: #faf5eb;
      --tw-ink: #1a1611;
      --tw-ink-faded: #5c544a;
      --tw-red: #c0392b;
      font-family: 'Courier Prime', 'Courier New', monospace;
      max-width: 800px;
      width: 100%;
      margin: 0 auto;
      user-select: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }
    .tw-paper-wrap {
      width: calc(100% - 72px);
      position: relative;
      z-index: 2;
    }
    .tw-paper {
      background: var(--tw-paper);
      padding: 36px 44px 16px;
      min-height: 110px;
      position: relative;
      border-radius: 3px 3px 0 0;
      box-shadow:
        3px 0 8px rgba(0,0,0,0.07),
        -3px 0 8px rgba(0,0,0,0.07),
        0 -2px 8px rgba(0,0,0,0.05);
      transition: min-height 0.15s ease;
      background-image:
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E");
    }
    .tw-paper::before {
      content: '';
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 18px;
      background: linear-gradient(90deg, rgba(0,0,0,0.03), transparent);
      pointer-events: none;
      border-radius: 3px 0 0 0;
    }
    .tw-paper::after {
      content: '';
      position: absolute;
      bottom: -6px; left: -2px; right: -2px;
      height: 8px;
      background: linear-gradient(180deg, rgba(0,0,0,0.18), transparent);
      pointer-events: none;
      z-index: 3;
    }
    .tw-date {
      position: absolute;
      top: 20px; right: 48px;
      font-family: 'Special Elite', 'Courier New', monospace;
      font-size: 14px;
      color: var(--tw-ink);
      letter-spacing: 0.03em;
      opacity: 0.78;
    }
    .tw-form {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 20px;
    }
    .tw-form-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-height: 30px;
      line-height: 30px;
    }
    .tw-form-row label {
      font-family: 'Special Elite', 'Courier New', monospace;
      font-size: 15px;
      color: var(--tw-ink);
      white-space: nowrap;
      user-select: none;
    }
    .tw-form-row input {
      width: 100%;
      font-family: 'Special Elite', 'Courier New', monospace;
      font-size: 15px;
      color: var(--tw-ink);
      background: transparent;
      border: none;
      border-bottom: 1.5px solid rgba(26, 22, 17, 0.15);
      outline: none;
      padding: 0 4px 2px;
      line-height: 30px;
      transition: border-color 0.25s;
      user-select: text;
    }
    .tw-form-row input:focus {
      border-bottom-color: rgba(26, 22, 17, 0.5);
    }
    .tw-form-row input::placeholder {
      color: rgba(26, 22, 17, 0.2);
      font-style: italic;
    }
    .tw-message-label {
      font-family: 'Special Elite', 'Courier New', monospace;
      font-size: 15px;
      color: var(--tw-ink);
      margin-top: 10px;
      margin-bottom: 2px;
      display: block;
      user-select: none;
    }
    .tw-message-area {
      font-family: 'Special Elite', 'Courier New', monospace;
      font-size: 15px;
      color: var(--tw-ink);
      background: transparent;
      border: none;
      outline: none;
      width: 100%;
      min-height: 30px;
      line-height: 30px;
      resize: none;
      overflow: hidden;
      padding: 0 4px;
      user-select: text;
    }
    .tw-message-area::placeholder {
      color: rgba(26, 22, 17, 0.2);
      font-style: italic;
    }
    .tw-body {
      width: 100%;
      background: var(--tw-body-dark);
      border-radius: 14px 14px 10px 10px;
      padding: 0 0 22px;
      position: relative;
      z-index: 1;
      box-shadow:
        0 16px 48px rgba(0,0,0,0.30),
        0 4px 12px rgba(0,0,0,0.18),
        inset 0 1px 0 rgba(255,255,255,0.06);
    }
    .tw-slot {
      height: 16px;
      margin: 0 24px;
      background: #1a1714;
      border-radius: 3px 3px 0 0;
      box-shadow: inset 0 4px 10px rgba(0,0,0,0.6);
      position: relative;
    }
    .tw-slot::before, .tw-slot::after {
      content: '';
      position: absolute;
      top: -4px;
      width: 14px;
      height: 24px;
      background: linear-gradient(180deg, #6b6260, #4a4340, #6b6260);
      border-radius: 3px;
      box-shadow: inset 0 1px 1px rgba(255,255,255,0.1), 0 1px 3px rgba(0,0,0,0.3);
    }
    .tw-slot::before { left: -2px; }
    .tw-slot::after { right: -2px; }
    .tw-platen {
      height: 20px;
      margin: 0 24px;
      background: linear-gradient(180deg, #1a1714 0%, #2a2623 30%, #3d3835 50%, #2a2623 70%, #1a1714 100%);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .tw-platen-knob {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: radial-gradient(circle at 40% 35%, #7a7270, #4a4340);
      border: 2.5px solid #3a3330;
      box-shadow: inset 0 1px 3px rgba(255,255,255,0.15), 0 2px 4px rgba(0,0,0,0.4);
      flex-shrink: 0;
      position: relative;
      z-index: 2;
    }
    .tw-platen-knob::after {
      content: '';
      display: block;
      width: 12px;
      height: 2.5px;
      background: #3a3330;
      margin: 10px auto 0;
      border-radius: 1px;
    }
    .tw-brand {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      margin: 8px 0 0;
      padding-top: 8px;
      border-top: 1px solid rgba(255,255,255,0.04);
    }
    .tw-brand-name {
      font-family: 'Pinyon Script', cursive;
      font-size: 28px;
      color: #9a9185;
      letter-spacing: 0.04em;
      text-shadow: 0 1px 0 rgba(0,0,0,0.3), 0 -1px 0 rgba(255,255,255,0.04);
      line-height: 1.1;
    }
    .tw-brand-sub {
      font-family: 'Special Elite', 'Courier New', monospace;
      font-size: 9px;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: #6b6260;
      text-shadow: 0 1px 0 rgba(0,0,0,0.2);
    }
    .tw-controls {
      margin: 16px 28px 0;
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }
    .tw-from-row {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .tw-from-row label {
      font-family: 'Special Elite', 'Courier New', monospace;
      font-size: 12px;
      color: #9a9185;
      white-space: nowrap;
    }
    .tw-from-row input {
      font-family: 'Special Elite', 'Courier New', monospace;
      font-size: 13px;
      color: #9a9185;
      background: transparent;
      border: none;
      border-bottom: 1.5px solid rgba(154, 145, 133, 0.3);
      outline: none;
      padding: 0 4px 4px;
      line-height: 24px;
    }
    .tw-from-row input:focus {
      border-bottom-color: rgba(154, 145, 133, 0.7);
      color: #d4cec6;
    }
    .tw-from-row input::placeholder {
      color: rgba(154, 145, 133, 0.4);
      font-style: italic;
    }
    .tw-send-col {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
      flex-shrink: 0;
    }
    .tw-enter-key {
      width: 160px;
      height: 44px;
      border-radius: 7px;
      background: linear-gradient(180deg, #d9d2c6 0%, #c4bcb0 40%, #b0a89c 100%);
      border: 2.5px solid #8a8278;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      font-family: 'Special Elite', 'Courier New', monospace;
      font-size: 14px;
      font-weight: 700;
      color: var(--tw-ink);
      letter-spacing: 0.14em;
      text-transform: uppercase;
      cursor: pointer;
      box-shadow:
        0 5px 2px rgba(0,0,0,0.3),
        0 2px 0 rgba(255,255,255,0.08) inset;
      transition: transform 0.08s, box-shadow 0.08s, background 0.1s;
      user-select: none;
      position: relative;
      overflow: hidden;
    }
    .tw-enter-key::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 40%;
      background: linear-gradient(180deg, rgba(255,255,255,0.18), transparent);
      border-radius: 5px 5px 0 0;
      pointer-events: none;
    }
    .tw-enter-key:hover {
      background: linear-gradient(180deg, #e2dbd0 0%, #cec6ba 40%, #bab2a6 100%);
    }
    .tw-enter-key:active, .tw-enter-key.pressed {
      transform: translateY(3px);
      box-shadow:
        0 1px 0 rgba(0,0,0,0.3),
        0 1px 0 rgba(255,255,255,0.05) inset;
    }
    .tw-enter-key:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .tw-enter-arrow {
      font-size: 18px;
      line-height: 1;
    }
    .tw-status {
      font-family: 'Special Elite', 'Courier New', monospace;
      font-size: 12px;
      text-align: right;
      min-height: 16px;
      transition: opacity 0.3s;
    }
    .tw-status.error { color: var(--tw-red); }
    .tw-status.success { color: #4a7c59; }
    .tw-status.sending { color: #a09888; }
    .tw-feet {
      display: flex;
      justify-content: space-between;
      width: 100%;
      padding: 0 40px;
    }
    .tw-foot {
      width: 50px;
      height: 6px;
      background: #1e1b19;
      border-radius: 0 0 4px 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .tw-modal-backdrop {
      position: fixed;
      inset: 0;
      background: #faf5eb;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.35s ease, visibility 0.35s ease;
    }
    .tw-modal-backdrop.show {
      opacity: 1;
      visibility: visible;
    }
    .tw-modal {
      background: var(--tw-paper);
      border-radius: 14px;
      padding: 44px 40px 36px;
      max-width: 360px;
      width: 90%;
      text-align: center;
      box-shadow: 0 24px 60px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.1);
      transform: translateY(20px) scale(0.95);
      transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
    }
    .tw-modal-backdrop.show .tw-modal {
      transform: translateY(0) scale(1);
    }
    .tw-envelope {
      margin: 0 auto 20px;
      width: 80px;
      height: 60px;
      position: relative;
    }
    .tw-envelope svg {
      width: 100%;
      height: 100%;
    }
    .tw-envelope-letter {
      position: absolute;
      top: 8px; left: 12px; right: 12px;
      height: 30px;
      background: #fff;
      border-radius: 2px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transform: translateY(0);
      animation: twLetterTuck 0.6s 0.3s ease forwards;
    }
    .tw-envelope-letter::before {
      content: '';
      position: absolute;
      top: 8px; left: 8px; right: 8px;
      height: 2px;
      background: rgba(26, 22, 17, 0.12);
      border-radius: 1px;
    }
    .tw-envelope-letter::after {
      content: '';
      position: absolute;
      top: 14px; left: 8px;
      width: 60%;
      height: 2px;
      background: rgba(26, 22, 17, 0.08);
      border-radius: 1px;
    }
    @keyframes twLetterTuck {
      0%   { transform: translateY(-16px); }
      50%  { transform: translateY(4px); }
      100% { transform: translateY(2px); }
    }
    .tw-modal h3 {
      font-family: 'Special Elite', 'Courier New', monospace;
      font-size: 22px;
      color: #1a1611;
      margin-bottom: 6px;
      letter-spacing: -0.01em;
    }
    .tw-modal p {
      font-family: 'Courier Prime', 'Courier New', monospace;
      font-size: 14px;
      color: #5c544a;
      line-height: 1.5;
    }
    .tw-modal-close {
      margin-top: 24px;
      font-family: 'Special Elite', 'Courier New', monospace;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #1a1611;
      background: transparent;
      border: 2px solid rgba(26, 22, 17, 0.2);
      border-radius: 6px;
      padding: 10px 28px;
      cursor: pointer;
      transition: background 0.2s, border-color 0.2s;
    }
    .tw-modal-close:hover {
      background: rgba(26, 22, 17, 0.06);
      border-color: rgba(26, 22, 17, 0.35);
    }
    @media (max-width: 520px) {
      .tw-paper-wrap { width: calc(100% - 48px); }
      .tw-paper { padding: 30px 28px 28px; }
      .tw-date { right: 32px; font-size: 13px; }
      .tw-form-row label, .tw-form-row input,
      .tw-message-label, .tw-message-area { font-size: 14px; }
      .tw-enter-key { width: 140px; height: 40px; font-size: 13px; }
      .tw-slot { margin: 0 16px; }
      .tw-platen { margin: 0 16px; }
    }
    `;
  }

  // ── Build HTML ──
  function getWidgetHTML(dateStr) {
    return `
    <div class="tw-widget">
      <div class="tw-paper-wrap">
        <div class="tw-paper">
          <div class="tw-date">${dateStr}</div>
          <div class="tw-form">
            <label class="tw-message-label">Message:</label>
            <textarea class="tw-message-area" id="twMessage" name="message" rows="1" placeholder="Write your message here. Maybe it begins, &#34;Dear Aidan...&#34;" required></textarea>
          </div>
        </div>
      </div>
      <div class="tw-body">
        <div class="tw-slot"></div>
        <div class="tw-platen">
          <div class="tw-platen-knob"></div>
          <div class="tw-platen-knob"></div>
        </div>
        <div class="tw-controls">
          <div class="tw-from-row">
            <label for="twEmail">From:</label>
            <input type="email" id="twEmail" name="email" placeholder="your@email.com" required autocomplete="email">
          </div>
          <div class="tw-send-col">
            <button class="tw-enter-key" id="twSend" type="button">
              <span>Send</span>
              <span class="tw-enter-arrow">✉</span>
            </button>
            <div class="tw-status" id="twStatus"></div>
          </div>
        </div>
        <div class="tw-brand">
          <span class="tw-brand-name">Contact</span>
          <span class="tw-brand-sub">product of Seattle</span>
        </div>
      </div>
      <div class="tw-feet">
        <div class="tw-foot"></div>
        <div class="tw-foot"></div>
      </div>
    </div>
    <div class="tw-modal-backdrop" id="twModal">
      <div class="tw-modal">
        <div class="tw-envelope">
          <div class="tw-envelope-letter"></div>
          <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="12" width="76" height="46" rx="4" fill="#e8e2da" stroke="#b0a89c" stroke-width="2"/>
            <path d="M2 16 L40 40 L78 16" fill="none" stroke="#b0a89c" stroke-width="2" stroke-linejoin="round"/>
            <path d="M2 58 L30 38" stroke="#c4bcb0" stroke-width="1" opacity="0.5"/>
            <path d="M78 58 L50 38" stroke="#c4bcb0" stroke-width="1" opacity="0.5"/>
          </svg>
        </div>
        <h3>Message Sent!</h3>
        <p>Your letter is on its way.<br>I'll get back to you soon.</p>
        <button class="tw-modal-close" id="twModalClose">Close</button>
      </div>
    </div>`;
  }

  // ── Init ──
  function init() {
    const container = document.getElementById(CONTAINER_ID);
    if (!container) {
      console.error(`Typewriter widget: #${CONTAINER_ID} not found.`);
      return;
    }

    const now = new Date();
    const months = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];
    const dateStr = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

    injectStyles();
    container.innerHTML = getWidgetHTML(dateStr);

    const messageInput = document.getElementById('twMessage');
    const emailInput   = document.getElementById('twEmail');
    const sendBtn      = document.getElementById('twSend');
    const statusEl     = document.getElementById('twStatus');
    const modal        = document.getElementById('twModal');
    const modalClose   = document.getElementById('twModalClose');

    // Auto-expand — paper grows upward, typewriter stays put
    const twBody = container.querySelector('.tw-body');

    function autoExpand() {
      const bodyRect = twBody.getBoundingClientRect();
      const bodyViewportTop = bodyRect.top;

      messageInput.style.height = 'auto';
      messageInput.style.height = messageInput.scrollHeight + 'px';

      requestAnimationFrame(() => {
        // If inside the contact modal, scroll paper to bottom
        const modalPaperWrap = document.querySelector('.contact-modal-inner .tw-paper-wrap');
        if (modalPaperWrap) {
          modalPaperWrap.scrollTop = modalPaperWrap.scrollHeight;
          return;
        }

        const newBodyRect = twBody.getBoundingClientRect();
        const drift = newBodyRect.top - bodyViewportTop;
        if (Math.abs(drift) > 1) {
          window.scrollBy({ top: drift, behavior: 'instant' });
        }
      });
    }
    messageInput.addEventListener('input', autoExpand);
    autoExpand();

    // Modal
    function showModal() { modal.classList.add('show'); }
    function hideModal() { modal.classList.remove('show'); }
    modalClose.addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) hideModal(); });

    // Backup POST helper (Google Apps Script compatible)
    async function backupMessage(data) {
      if (!BACKUP_URL) return;
      try {
        await fetch(BACKUP_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify(data)
        });
      } catch (backupErr) {
        console.warn('Backup save also failed:', backupErr);
      }
    }

    // Send
    async function handleSend() {
      const email   = emailInput.value.trim();
      const message = messageInput.value.trim();

      if (!email || !message) {
        statusEl.textContent = 'Please fill in both fields.';
        statusEl.className = 'tw-status error';
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        statusEl.textContent = 'Please enter a valid email.';
        statusEl.className = 'tw-status error';
        return;
      }

      const payload = {
        from_email: email,
        message: message,
        date: dateStr,
        timestamp: new Date().toISOString()
      };

      sendBtn.disabled = true;
      sendBtn.classList.add('pressed');
      statusEl.textContent = 'Sending...';
      statusEl.className = 'tw-status sending';

      try {
        await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, payload);

        // Also save backup on success
        backupMessage(payload);

        statusEl.textContent = '';
        showModal();
        emailInput.value = '';
        messageInput.value = '';
        autoExpand();
        sendBtn.disabled = false;
        sendBtn.classList.remove('pressed');

      } catch (err) {
        console.error('EmailJS error:', err);

        // Attempt backup save
        const backupSaved = await backupMessage(payload)
          .then(() => !!BACKUP_URL)
          .catch(() => false);

        if (backupSaved) {
          // Backup succeeded — still show success to the user
          statusEl.textContent = '';
          showModal();
          emailInput.value = '';
          messageInput.value = '';
          autoExpand();
        } else {
          statusEl.textContent = 'Failed to send. Try again.';
          statusEl.className = 'tw-status error';
        }

        sendBtn.disabled = false;
        sendBtn.classList.remove('pressed');
      }
    }

    sendBtn.addEventListener('click', handleSend);

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (document.activeElement === emailInput || document.activeElement === messageInput) {
          handleSend();
        }
      }
      if (e.key === 'Escape' && modal.classList.contains('show')) {
        hideModal();
      }
    });
  }

  // Expose a global initializer so the footer modal can create a standalone widget
  window._initTypewriterIn = function(containerId) {
    const container = document.getElementById(containerId);
    if (!container || container.hasChildNodes()) return;
    const now = new Date();
    const months = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];
    const dateStr = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
    injectStyles();
    container.innerHTML = getWidgetHTML(dateStr);

    const messageInput = container.querySelector('#twMessage');
    const emailInput   = container.querySelector('#twEmail');
    const sendBtn      = container.querySelector('#twSend');
    const statusEl     = container.querySelector('#twStatus');
    const modal        = container.querySelector('#twModal');
    const modalClose   = container.querySelector('#twModalClose');
    const twBody       = container.querySelector('.tw-body');

    function autoExpand() {
      const bodyRect = twBody.getBoundingClientRect();
      const bodyViewportTop = bodyRect.top;
      messageInput.style.height = 'auto';
      messageInput.style.height = messageInput.scrollHeight + 'px';
      requestAnimationFrame(() => {
        const modalPaperWrap = container.closest('.contact-modal-inner')?.querySelector('.tw-paper-wrap');
        if (modalPaperWrap) {
          modalPaperWrap.scrollTop = modalPaperWrap.scrollHeight;
        }
      });
    }
    messageInput.addEventListener('input', autoExpand);
    autoExpand();

    function showModal() { modal.classList.add('show'); }
    function hideModal() { modal.classList.remove('show'); }
    modalClose.addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) hideModal(); });

    async function backupMessage(data) {
      if (!BACKUP_URL) return;
      try {
        await fetch(BACKUP_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(data) });
      } catch (backupErr) { console.warn('Backup save also failed:', backupErr); }
    }

    async function handleSend() {
      const email   = emailInput.value.trim();
      const message = messageInput.value.trim();
      if (!email || !message) { statusEl.textContent = 'Please fill in both fields.'; statusEl.className = 'tw-status error'; return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { statusEl.textContent = 'Please enter a valid email.'; statusEl.className = 'tw-status error'; return; }
      const payload = { from_email: email, message: message, date: dateStr, timestamp: new Date().toISOString() };
      sendBtn.disabled = true; sendBtn.classList.add('pressed');
      statusEl.textContent = 'Sending...'; statusEl.className = 'tw-status sending';
      try {
        if (window.emailjs) { await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, payload); }
        backupMessage(payload);
        statusEl.textContent = ''; showModal();
        emailInput.value = ''; messageInput.value = ''; autoExpand();
        sendBtn.disabled = false; sendBtn.classList.remove('pressed');
      } catch (err) {
        console.error('EmailJS error:', err);
        const backupSaved = await backupMessage(payload).then(() => !!BACKUP_URL).catch(() => false);
        if (backupSaved) { statusEl.textContent = ''; showModal(); emailInput.value = ''; messageInput.value = ''; autoExpand(); }
        else { statusEl.textContent = 'Failed to send. Try again.'; statusEl.className = 'tw-status error'; }
        sendBtn.disabled = false; sendBtn.classList.remove('pressed');
      }
    }
    sendBtn.addEventListener('click', handleSend);
    container.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (document.activeElement === emailInput || document.activeElement === messageInput) handleSend();
      }
      if (e.key === 'Escape' && modal.classList.contains('show')) hideModal();
    });
  };

  // Load EmailJS then init
  loadEmailJS().then(() => {
    window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    init();
  }).catch((err) => {
    console.error('Failed to load EmailJS SDK:', err);
    // Still render the widget even if EmailJS fails to load
    init();
  });

})();

// ============ Site Footer Component ============

class SiteFooter extends HTMLElement {
    connectedCallback() {
        const linkedinUrl = this.getAttribute('linkedin') || 'https://www.linkedin.com/in/aidanoday/';

        const isHome = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');

        this.innerHTML = `
            <div class="footer-left">
                <div class="footer-links">
                    <a class="alt footer-home-link" href="${isHome ? '#' : 'index.html'}"><img src="assets/apod.svg" alt="Home" class="footer-logo" />Home</a>
                    <a class="alt footer-contact-link" href="#"><svg class="footer-contact-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 4-10 8L2 4"/></svg>Contact</a>
                    <a class="alt" href="${linkedinUrl}" target="_blank" rel="noopener noreferrer"><svg class="footer-linkedin-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>LinkedIn</a>
                </div>
                <p class="footer-copyright">&copy; Aidan O'Day 2026</p>
            </div>
        `;

        // Home link: scroll to top on home page, push-in navigate on others
        this.querySelector('.footer-home-link').addEventListener('click', (e) => {
            if (isHome) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                e.preventDefault();
                document.body.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
                document.body.style.transform = 'translateX(100%)';
                document.body.style.opacity = '0';
                setTimeout(() => { window.location.href = 'index.html'; }, 400);
            }
        });

        // Create modal backdrop (once, on body)
        if (!document.getElementById('contactModalBackdrop')) {
            const backdrop = document.createElement('div');
            backdrop.className = 'contact-modal-backdrop';
            backdrop.id = 'contactModalBackdrop';
            backdrop.innerHTML = `
                <div class="contact-modal-inner">
                    <button class="contact-modal-close" aria-label="Close">&times;</button>
                    <div id="typewriter-contact-modal"></div>
                </div>
                <div class="contact-modal-plinth"></div>
            `;
            document.body.appendChild(backdrop);

            // Close handlers
            backdrop.querySelector('.contact-modal-close').addEventListener('click', () => closeContactModal());
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) closeContactModal();
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && backdrop.classList.contains('show')) {
                    closeContactModal();
                }
            });
        }

        // Contact link opens modal
        this.querySelector('.footer-contact-link').addEventListener('click', (e) => {
            e.preventDefault();
            openContactModal();
        });
    }
}

function openContactModal() {
    const backdrop = document.getElementById('contactModalBackdrop');

    // Initialize a standalone typewriter widget inside the modal if needed
    if (window._initTypewriterIn) {
        window._initTypewriterIn('typewriter-contact-modal');
    }

    backdrop.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeContactModal() {
    const backdrop = document.getElementById('contactModalBackdrop');
    backdrop.classList.remove('show');
    document.body.style.overflow = '';
}

customElements.define('site-footer', SiteFooter);

// ============ App Footer Component (floating bar variant) ============

class AppFooter extends HTMLElement {
    connectedCallback() {
        const linkedinUrl = this.getAttribute('linkedin') || 'https://www.linkedin.com/in/aidanoday/';

        this.innerHTML = `
            <a class="onSurface" href="index.html"><img src="assets/apod.svg" alt="Home" class="footer-logo" />Home</a>
            <a class="onSurface app-footer-contact-link" href="#"><svg class="footer-contact-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 4-10 8L2 4"/></svg>Contact</a>
            <a class="onSurface" href="${linkedinUrl}" target="_blank" rel="noopener noreferrer"><svg class="footer-linkedin-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>LinkedIn</a>
            <span class="app-footer-copyright">&copy; Aidan O'Day 2026</span>
        `;

        // Home link navigates with push-in animation
        this.querySelector('a').addEventListener('click', (e) => {
            e.preventDefault();
            document.body.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
            document.body.style.transform = 'translateX(100%)';
            document.body.style.opacity = '0';
            setTimeout(() => { window.location.href = 'index.html'; }, 400);
        });

        // Create modal backdrop (once, on body)
        if (!document.getElementById('contactModalBackdrop')) {
            const backdrop = document.createElement('div');
            backdrop.className = 'contact-modal-backdrop';
            backdrop.id = 'contactModalBackdrop';
            backdrop.innerHTML = `
                <div class="contact-modal-inner">
                    <button class="contact-modal-close" aria-label="Close">&times;</button>
                    <div id="typewriter-contact-modal"></div>
                </div>
                <div class="contact-modal-plinth"></div>
            `;
            document.body.appendChild(backdrop);

            backdrop.querySelector('.contact-modal-close').addEventListener('click', () => closeContactModal());
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) closeContactModal();
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && backdrop.classList.contains('show')) {
                    closeContactModal();
                }
            });
        }

        // Contact link opens modal
        this.querySelector('.app-footer-contact-link').addEventListener('click', (e) => {
            e.preventDefault();
            openContactModal();
        });
    }
}

customElements.define('app-footer', AppFooter);

// Letter scroll-settle animation
const letter = document.getElementById('letter');
if (letter) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                letter.classList.add('settled');
            } else {
                letter.classList.remove('settled');
            }
        });
    }, { threshold: 0.2 });
    observer.observe(letter);
}

// Letter history inline expand
const inlineExpand = document.getElementById('letterInlineExpand');
const historyContent = document.getElementById('letterHistoryContent');
if (inlineExpand && historyContent) {
    inlineExpand.addEventListener('click', (e) => {
        e.preventDefault();
        historyContent.classList.add('expanded');
        inlineExpand.classList.add('hidden');
        inlineExpand.setAttribute('aria-expanded', 'true');
    });
}
