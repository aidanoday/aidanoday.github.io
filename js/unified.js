//project-cards

console.log("1. Script loaded successfully!");

const PROJECT_DATA = {

   "optml-shipper": {
    title: "optML shipper",
    image: "assets/optML_Ship.png",
    link: "optML_shipper.html",
    subtitle: "AI-augmented Shipping Dashboard",
    desc: "Fall 2025 - How might a top 3 global athletics company leverage machine learning to optimize their downstream supplychain?"
  },
  "store-portal": {
    title: "Store Portal 2.1",
    image: "assets/store_portal_cover.png",
    link: "storePortal_2_1.html",
    subtitle: "User research, Interface design",
    desc: "Summer/Fall 2025 - How can UX best practices and insights from contextual inquiry elevate lululemon's internally-built Store Shipping Portal from minimum viable product to most valuable portal?"
  },
  "dawg-walks": {
    title: "Dawg Walks",
    image: "assets/dawgWalks.png",
    link: "https://sites.google.com/uw.edu/dawgwalks/home",
    external: true,
    subtitle: "Service design for UW",
    desc: "Autumn 2025 - How might we increase safety and connection for UW students traveling after dark?"
  },
  "link-cc": {
    title: "Creative Connections 🖇📱",
    image: "assets/linkCover.png",
    link: "linkCC.html",
    subtitle: "Mobile UX Design for ILOVEWHATEVER.",
    desc: "Summer 2022 - How might we create an app for creative connection that is atomic, and so simple that anyone can use it?"
  },
  "pebble-ai": {
    title: "Pebble AI",
    image: "assets/ai_pebble.png",
    action: "showDialog()",
    subtitle: "In-context Academic Advising",
    desc: "Spring 2025 - How might we guide lost students at a critical junctures in their academic journeys using agentic adivsors trained on historic student data and advising materials?"
  },
  "twabler": {
    title: "Twabler 🐣 🏷",
    image: "assets/Twabler_Cover.png",
    link: "twabler.html",
    subtitle: "Mobile UX for Code for San Francisco",
    desc: "Autumn 2019 - A labeling method for ML NLP training sets that improves on old methods by segmenting and batching tweet labeling tasks."
  },
  "knomee": {
    title: "Knomee Prototype📱💵🧘‍♀️",
    image: "assets/Knomee.png",
    link: "knomee_app.html",
    subtitle: "Strategy and Prototyping for Knomee",
    desc: "Winter 2023 - How might we help the newly-affluent meaningfully align their financial planning with values?"
  },
  "inquired": {
    title: "Better Curriculum Navigation 📓👩‍🏫🗺️",
    image: "assets/InquirED.png",
    action: "showDialog()",
    subtitle: "Improving the inquirED portal",
    desc: "Summer 2024 - How might we use accessibility compliance as an opportunity to improve clarity?"
  },
  "synq": {
    title: "Synq Logo Animation ⚜️🎞",
    image: "assets/Synq_Cover.png",
    link: "synq.html",
    subtitle: "Logo and Motion Design for Synq",
    desc: "Autumn 2022 - A monolithic “S” revealed as just a part of the larger whole: a composite isometric cube."
  },
  "jordache": {
    title: "JORDACHE Home Page 🐴👖",
    image: "assets/Jordache_Cover.png",
    link: "jordache.html",
    subtitle: "Responsive Landing Page for JORDACHE",
    desc: "Winter 2023 - Revamping JORDACHE's online storefront to communicate 'Sexy, Bold, and Timeless.'"
  },
  "stay-home": {
    title: "Stay Home 🏠 🦠",
    image: "assets/StayHome_Cover.png",
    link: "stayHome.html",
    subtitle: "Mobile App Hack",
    desc: "Summer 2020 - How might we transform staying home into a fun, safe, and rewarding experience?"
  },
  "tact-tiles": {
    title: "TactTiles 🟦 🧤 🟨 🟥",
    image: "assets/TactileCubeCover.png",
    link: "tactTiles.html",
    subtitle: "Interaction Design for DALI Lab.",
    desc: "A customizable sensory therapeutic toy for people with Autism with heightened sensory input."
  },
  "rent-cap": {
    title: "Rent Cap 🌇",
    image: "assets/RentCap_Cover.png",
    link: "rentCap.html",
    subtitle: "Logo and Web Design for Code for San Francisco",
    desc: "An informational portal for helping tenants determine new rent protection status."
  },
  "honor-code": {
    title: "Honor Code Study 🤥",
    image: "assets/ivyLeagueCheaters_cover.png",
    link: "cheaters.html",
    subtitle: "Culminating Systems Design Case",
    desc: "Fall 2018 - Do students cheat at Dartmouth? What drives this behavior? What can faculty do to curb this behavior?"
  },
  "tote": {
    title: "Totes Wide Open 👜",
    image: "assets/toteCover.png",
    link: "tote.html",
    subtitle: "Product Design for Design Thinking",
    desc: "Fall 2018 - An over-the-shoulder tote that opens wider than any other bag."
  },
  "animations": {
    title: "Animation 🎞",
    image: "assets/laptop_spin.gif",
    link: "animations/index.html",
    subtitle: "A Gallery of Motion Graphics.",
    desc: "I create animations and motion graphics using a mix of Procreate and Adobe Animate.",
    status:"pending"
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
        this.render();
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
                min-width: 320px;
                max-width: 480px;
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
                box-shadow: 0 2px 8px rgba(0, 43, 128, 0.08);
                transition: transform 0.2s ease, box-shadow 0.2s ease; 
                height: auto;
                font-family: 'Work Sans', sans-serif;
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
                margin: 8px 8px 0 8px;
                width: calc(100% - 16px);
                height: 240px; 
                overflow: hidden;
                border-radius: 4px; 
                border:solid 1px #626262; 
            }

            img { 
                width: 100%; 
                height: 100%; 
                object-fit: cover; 
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
                -webkit-line-clamp: ${this.expanded ? 'unset' : '3'}; 
                overflow: hidden;
            }

            .toggle-btn {
                background: none; 
                border: none; 
                padding: 0;
                margin-top: 8px; 
                cursor: pointer; 
                font-family: 'Work Sans', sans-serif;
                font-size: 12px;
                font-weight: 600; 
                color: #888; 
                text-decoration: underline;
                text-underline-offset: 2px;
                align-self: flex-start;
                transition: color 0.2s;
            }

            .toggle-btn:hover { color: #555; }

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
    }
}
customElements.define('project-card', ProjectCard);

//peekaboo navigation bar
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