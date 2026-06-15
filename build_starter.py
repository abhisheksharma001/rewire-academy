import json

days_data = [
    {
        "day": 1,
        "title": "Foundations of AI & LLMs",
        "learn": [
            "Master core prompting techniques like role-based and context-driven frameworks",
            "Learn how core language models understand and process text",
            "Use simple rules to perform regular daily tasks"
        ],
        "tools": [
            {"name": "ChatGPT", "color": "10A37F"},
            {"name": "Gemini", "color": "1A73E8"},
            {"name": "Claude", "color": "D97757"}
        ],
        "phase": "Phase 1: Foundations & Creative Intelligence"
    },
    {
        "day": 2,
        "title": "Creating Marketing Copy & Visuals",
        "learn": [
            "Use dedicated AI writing tools to generate high-converting marketing copy",
            "Create effective descriptive prompts for modern AI image generators",
            "Design professional visual assets for your brand and social media"
        ],
        "tools": [
            {"name": "ChatGPT", "color": "10A37F"},
            {"name": "Copy.ai", "color": "2D3136"},
            {"name": "Midjourney", "color": "FFFFFF"}
        ]
    },
    {
        "day": 3,
        "title": "AI for Daily Office/Class Work",
        "learn": [
            "Use native AI features directly inside your daily Office applications",
            "Automate basic document formatting and work with spreadsheets much faster",
            "Streamline regular email communication routines using cloud-based smart tools"
        ],
        "tools": [
            {"name": "Microsoft Copilot", "color": "0078D4"},
            {"name": "Gemini Work", "color": "1A73E8"}
        ]
    },
    {
        "day": 4,
        "title": "AI Video Creation",
        "learn": [
            "Write clear prompts to generate short high-quality video clips",
            "Turn text ideas into engaging commercial marketing footage",
            "Produce professional motion clips without expensive recording studio setups"
        ],
        "tools": [
            {"name": "Kling", "color": "E50914"},
            {"name": "Sora", "color": "000000"}
        ]
    },
    {
        "day": 5,
        "title": "AI Presentation Decks & Job Roles",
        "learn": [
            "Build complete presentation slide decks dynamically from text prompts",
            "Design professional presentation layouts instantly using intelligent presentation software",
            "Apply customized AI assistants to speed up your specific job"
        ],
        "tools": [
            {"name": "Gamma", "color": "FF6B6B"},
            {"name": "Genspark", "color": "4ECDC4"}
        ]
    },
    {
        "day": 6,
        "title": "Personal Productivity & Workspaces",
        "learn": [
            "Create automated personal routines to track your daily tasks",
            "Organize your personal notes and project files into smart folders",
            "Build custom everyday workflow assistants to save time each week"
        ],
        "tools": [
            {"name": "Claude", "color": "D97757"},
            {"name": "ChatGPT", "color": "10A37F"}
        ]
    },
    {
        "day": 7,
        "title": "Automated Voice Agents",
        "learn": [
            "Setup and run human-sounding voice bots to handle phone calls",
            "Create automated voice solutions for standard business customer conversations",
            "Manage easy call routes for basic inbound and outbound requests"
        ],
        "tools": [
            {"name": "Retell AI", "color": "845EC2"},
            {"name": "ElevenLabs", "color": "000000"}
        ]
    },
    {
        "day": 8,
        "title": "Digital Twins & AI Avatars",
        "learn": [
            "Create customized digital talking clones that mimic real human speakers",
            "Build lifelike presentation avatars for scalable digital video content production",
            "Convert text scripts directly into video files without using cameras"
        ],
        "tools": [
            {"name": "HeyGen", "color": "7B2CBF"},
            {"name": "Synthesia", "color": "2A9D8F"}
        ],
        "phase": "Phase 2: Avatars, Agents & Automation"
    },
    {
        "day": 9,
        "title": "Custom AI Assistants (Custom GPTs)",
        "learn": [
            "Write custom instructions to guide your unique AI chatbot persona.",
            "Upload personal business files to build a private knowledge base.",
            "Create specialized AI assistants customized for your daily routine tasks."
        ],
        "tools": [
            {"name": "ChatGPT", "color": "10A37F"},
            {"name": "Gemini", "color": "1A73E8"},
            {"name": "Claude", "color": "D97757"}
        ]
    },
    {
        "day": 10,
        "title": "Simple Automation with Zapier",
        "learn": [
            "Connect your favorite everyday software applications together using cloud tools.",
            "Send automated text data instantly from one app to another.",
            "Setup simple triggers to run background workflows while you sleep."
        ],
        "tools": [
            {"name": "Zapier", "color": "FF4F00"},
            {"name": "LLM Integration", "color": "2B2B2B"}
        ]
    },
    {
        "day": 11,
        "title": "Multi-Step Automation with Make.com",
        "learn": [
            "Build visual step-by-step automations to move data between platforms.",
            "Launch a working social media automation project to publish content.",
            "Schedule automated workflows that generate and format regular daily posts."
        ],
        "tools": [
            {"name": "Make.com", "color": "5B2B82"},
            {"name": "AI Content", "color": "4B90FF"}
        ]
    },
    {
        "day": 12,
        "title": "Simple AI Agents with n8n",
        "learn": [
            "Build connected app networks using visual workflow execution blocks easily.",
            "Create a simple autonomous agent that can choose its own tasks.",
            "Automate repetitive daily operational tasks with smart self-running node systems."
        ],
        "tools": [
            {"name": "n8n", "color": "EA4335"},
            {"name": "AI Copilots", "color": "00C853"}
        ]
    },
    {
        "day": 13,
        "title": "Building a Website with AI (Vibe Coding)",
        "learn": [
            "Design and launch complete web applications purely through simple text.",
            "Build your personal portfolio webpage using conversational software development tools.",
            "Modify customer landing page designs without writing any confusing code."
        ],
        "tools": [
            {"name": "Lovable", "color": "FF007A"},
            {"name": "Bolt.new", "color": "F2B705"}
        ]
    },
    {
        "day": 14,
        "title": "Freelancing & Getting Clients",
        "learn": [
            "Set up freelance marketplace profiles for high online search visibility.",
            "Master direct LinkedIn outreach to pitch and connect with high-value prospects.",
            "Build a reliable business sales funnel to sell your services."
        ],
        "tools": [
            {"name": "Fiverr", "color": "00B22D"},
            {"name": "Upwork", "color": "14A800"},
            {"name": "LinkedIn", "color": "0A66C2"}
        ]
    }
]

html_template = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rewire Bharat: AI Generalist Accelerator</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;1,500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
  <style>
    /* Custom Timeline Styles */
    body { background-color: #050505; color: #fff; overflow-x: hidden; }
    .hero-curriculum {
      padding: 120px 24px 60px;
      text-align: center;
      background: radial-gradient(circle at 50% 0%, rgba(0, 136, 255, 0.1) 0%, transparent 70%);
    }
    .timeline-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 24px 100px;
      position: relative;
    }
    .timeline-container::before {
      content: '';
      position: absolute;
      top: 40px;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      width: 2px;
      background: linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(0,136,255,0.3), rgba(255,255,255,0.1));
    }
    .phase-marker {
      text-align: center;
      position: relative;
      z-index: 10;
      margin: 60px 0 40px;
    }
    .phase-badge {
      display: inline-block;
      background: #0a0a0c;
      border: 1px solid rgba(0, 136, 255, 0.5);
      color: #0088ff;
      padding: 8px 24px;
      border-radius: 30px;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      box-shadow: 0 0 20px rgba(0, 136, 255, 0.2);
    }
    .day-card-wrapper {
      display: flex;
      justify-content: flex-end;
      padding: 30px 0;
      position: relative;
      width: 50%;
      margin-left: 50%;
    }
    .day-card-wrapper:nth-child(even) {
      justify-content: flex-start;
      margin-left: 0;
    }
    .day-card-wrapper::before {
      content: '';
      position: absolute;
      top: 50px;
      left: -6px;
      width: 14px;
      height: 14px;
      background: #000;
      border: 2px solid var(--accent);
      border-radius: 50%;
      z-index: 2;
      box-shadow: 0 0 10px rgba(0,136,255,0.5);
    }
    .day-card-wrapper:nth-child(even)::before {
      left: auto;
      right: -8px;
    }
    .day-card {
      width: 90%;
      background: rgba(20, 20, 20, 0.6);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 32px;
      transition: transform 0.3s ease, border-color 0.3s ease;
    }
    .day-card:hover {
      transform: translateY(-5px);
      border-color: rgba(0, 136, 255, 0.4);
    }
    .day-number {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 8px;
    }
    .day-title {
      font-family: var(--serif);
      font-size: 24px;
      margin-bottom: 20px;
      color: #fff;
    }
    .day-learn-list {
      list-style: none;
      padding: 0;
      margin: 0 0 24px 0;
    }
    .day-learn-list li {
      position: relative;
      padding-left: 24px;
      margin-bottom: 12px;
      font-size: 14px;
      color: rgba(255,255,255,0.7);
      line-height: 1.5;
    }
    .day-learn-list li::before {
      content: '→';
      position: absolute;
      left: 0;
      top: 0;
      color: rgba(255,255,255,0.3);
    }
    .tool-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      border-top: 1px solid rgba(255,255,255,0.05);
      padding-top: 20px;
    }
    .tool-item {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255,255,255,0.03);
      padding: 6px 12px 6px 6px;
      border-radius: 30px;
      border: 1px solid rgba(255,255,255,0.05);
      font-size: 12px;
      font-weight: 500;
      color: rgba(255,255,255,0.8);
    }
    .tool-icon {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      object-fit: cover;
      background: #222;
    }
    
    @media (max-width: 768px) {
      .timeline-container::before {
        left: 24px;
      }
      .day-card-wrapper, .day-card-wrapper:nth-child(even) {
        width: 100%;
        margin-left: 0;
        justify-content: flex-end;
      }
      .day-card-wrapper::before, .day-card-wrapper:nth-child(even)::before {
        left: 17px;
        right: auto;
      }
      .day-card {
        width: calc(100% - 48px);
      }
    }
  </style>
</head>
<body>

  <!-- Navigation (Minimal) -->
  <nav class="nav" id="nav">
    <div class="container nav-inner">
      <a href="index.html" class="nav-logo">REWIRE ●</a>
      <a href="index.html" class="btn btn-secondary">Back to Home</a>
    </div>
  </nav>

  <!-- Hero -->
  <header class="hero-curriculum">
    <div class="container">
      <div class="section-label" style="margin-bottom: 16px;">Rewire Bharat</div>
      <h1 class="section-headline" style="margin-bottom: 24px; max-width: 800px; margin-left: auto; margin-right: auto; line-height: 1.2;">AI Generalist Accelerator</h1>
      <p class="section-subheadline" style="max-width: 600px; margin: 0 auto 40px;">Comprehensive 14-Day Curriculum & Strategic Roadmap. Master the foundation of AI workflows, from basic prompting to simple automations.</p>
      <div style="display: flex; justify-content: center; gap: 24px; font-size: 14px; color: rgba(255,255,255,0.6);">
        <span><strong style="color:#fff;">Duration:</strong> 14 Days Continuous</span>
        <span><strong style="color:#fff;">Format:</strong> Live & Hands-on</span>
      </div>
    </div>
  </header>

  <!-- Timeline -->
  <section class="timeline-container">
"""

card_index = 0
for d in days_data:
    day_num = d['day']
    title = d['title']
    phase = d.get('phase', None)
    
    if phase:
        html_template += f'''
    <div class="phase-marker reveal">
      <div class="phase-badge">{phase}</div>
    </div>
'''

    wrapper_class = "day-card-wrapper reveal"
    # we just let CSS pseudo selectors handle the left/right layout based on child position!
    
    html_template += f'''
    <div class="{wrapper_class}">
      <div class="day-card">
        <div class="day-number">Day {day_num}</div>
        <h3 class="day-title">{title}</h3>
        <ul class="day-learn-list">
'''
    for item in d['learn']:
        html_template += f'          <li>{item}</li>\n'
    
    html_template += '''        </ul>
        <div class="tool-grid">
'''
    for tool in d['tools']:
        t_name = tool['name']
        t_color = tool['color']
        text_color = "fff" if t_color != "FFFFFF" else "000"
        img_url = f"https://ui-avatars.com/api/?name={t_name.replace(' ', '+')}&background={t_color}&color={text_color}&rounded=true&bold=true&size=128"
        
        html_template += f'''          <div class="tool-item">
            <img src="{img_url}" alt="{t_name} logo" class="tool-icon">
            <span>{t_name}</span>
          </div>
'''
    html_template += '''        </div>
      </div>
    </div>
'''
    card_index += 1

html_template += """
  </section>

  <!-- Footer CTA -->
  <section class="section-padding" style="text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
    <div class="container reveal">
      <h2 style="font-family: var(--serif); font-size: 32px; margin-bottom: 24px;">Ready to start?</h2>
      <a href="#" class="btn btn-primary" style="padding: 16px 40px; font-size: 16px;">Enroll in Starter</a>
    </div>
  </section>

  <script>
    // Reveal Animation
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });
    reveals.forEach(reveal => observer.observe(reveal));
  </script>
</body>
</html>
"""

with open('/Users/abhisheksharma/Desktop/Rewire/starter.html', 'w') as f:
    f.write(html_template)
print("Done writing starter.html")
