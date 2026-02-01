const PROJECT_DATA = {
  "optml-shipper": {
    title: "optML shippper",
    image: "assets/optML_Ship.png",
    link: "optML_shipper.html",
    subtitle: "AI-augmented Shipping Dashboard",
    desc: "Fall 2025 - How might a top 3 global athletics company leverage machine learning to optimize their downstream supplychain?"
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
    title: "Link™ Creative Connections 🖇📱",
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
    title: "Knomee Financial Identity Prototype📱💵🧘‍♀️",
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
    title: "Synq Logo and Animation ⚜️🎞",
    image: "assets/Synq_Cover.png",
    link: "synq.html",
    subtitle: "Logo and Motion Design for Synq",
    desc: "Autumn 2022 - A monolithic “S” revealed as just a part of the larger whole: a composite isometric cube."
  },
  "jordache": {
    title: "JORDACHE Shopify Home Page 🐴👖",
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
    title: "Better Honor Code Adherance 🤥",
    image: "assets/ivyLeagueCheaters_cover.png",
    link: "cheaters.html",
    subtitle: "Culminating Systems Design Case",
    desc: "Fall 2018 - Do students cheat at Dartmouth? What can faculty do to curb this behavior?"
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
    desc: "I create animations and motion graphics using a mix of Procreate and Adobe Animate."
  }
};

class ProjectCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.expanded = false;
  }

  connectedCallback() {
    this.render();
  }

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

    const isExternal = data.external ? 'target="_blank"' : '';
    const wrapperOpen = data.action 
        ? `<a class="card-link" onclick="${data.action}">` 
        : `<a class="card-link" href="${data.link}" ${isExternal}>`;

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; margin-bottom: 20px; }
        .card-link { 
          display: flex; 
          flex-direction: column; 
          text-decoration: none; 
          color: inherit; 
          border: 1px solid #eee;
          border-radius: 8px;
          overflow: hidden;
          transition: 0.2s;
        }
        .card-link:hover { border-color: #ccc; }
        img { width: 100%; height: 200px; object-fit: cover; }
        .text-content { padding: 15px; }
        h3 { margin: 0 0 5px 0; font-size: 1.2rem; }
        .subtitle { font-style: italic; color: #666; margin-bottom: 8px; display: block; }
        
        /* Truncation Logic */
        .desc {
          margin: 0;
          font-size: 0.9rem;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: ${this.expanded ? 'unset' : '3'};
          overflow: hidden;
        }

        .toggle-btn {
          background: none;
          border: none;
          color: #007bff;
          padding: 0;
          margin-top: 8px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: bold;
        }
      </style>

      ${wrapperOpen}
        <img src="${data.image}" alt="${data.title}">
        <section class="text-content">
          <h3>${data.title}</h3>
          <span class="subtitle">${data.subtitle}</span>
          <p class="desc">${data.desc}</p>
          <button class="toggle-btn">
            ${this.expanded ? 'Show Less ↑' : 'See More ↓'}
          </button>
        </section>
      </a>
    `;

    this.shadowRoot.querySelector('.toggle-btn').addEventListener('click', (e) => this.toggleExpand(e));
  }
}

customElements.define('project-card', ProjectCard);