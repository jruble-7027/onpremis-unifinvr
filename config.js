/**
 * UniFi NVR Portal Configuration
 * 
 * Configured for internal school district surveillance network (10.10.42.x)
 */
window.PORTAL_CONFIG = {
  // District or Organization Details
  districtName: "You business name Video Surveillance",
  portalTitle: "UniFi Protect Internal Access Portal",
  portalSubtitle: "Direct High-Speed Local Network Streaming for Principals & Administrators",
  
  // IT / Help Desk Contact Info
  itSupport: {
    department: "Technology Department",
    phone: "Ext. 000 (HELP)",
    email: "helpdesk@xxxxx.org",
    hours: "Mon - Fri, 7:00 AM - 4:30 PM"
  },

  // Notice Banner at top of page (set enabled: false to hide)
  noticeBanner: {
    enabled: true,
    badge: "INTERNAL LAN ONLY",
    message: "You are streaming directly over the high-speed internal network (10.10.42.x). Playback is instant and stays on-premise without using internet bandwidth."
  },

  // Ubiquiti Official Cloud Access (unifi.ui.com)
  cloudPortal: {
    enabled: true,
    title: "Ubiquiti UniFi Cloud Site Manager (Remote Access)",
    description: "Access your UniFi consoles remotely off-campus or manage multi-site cloud settings via Ubiquiti Single Sign-On.",
    url: "https://unifi.ui.com",
    buttonText: "Launch unifi.ui.com"
  },

  // List of Internal NVRs (10.10.42.x)
  nvrs: [
    {
      id: "nvr-early-ed",
      name: "Early Ed",
      model: "UniFi Protect NVR",
      location: " Building",
      ip: "10.10.0.0",
      port: 443,
      defaultView: "/protect",
      badgeColor: "amber",
      status: "online",
      quickLinks: [
        { label: "Live View", path: "/protect/liveview" },
        { label: "Detections", path: "/protect/detections" },
        { label: "Console OS", path: "/" }
      ]
    },
    {
      id: "nvr-1",
      name: "NVR 1",
      model: "UniFi Protect NVR",
      location: "Campus Network Rack",
      ip: "10.10.0.0",
      port: 443,
      defaultView: "/protect",
      badgeColor: "blue",
      status: "online",
      quickLinks: [
        { label: "Live View", path: "/protect/liveview" },
        { label: "Detections", path: "/protect/detections" },
        { label: "Console OS", path: "/" }
      ]
    },
    {
      id: "nvr-2",
      name: "NVR 2",
      model: "UniFi Protect NVR",
      location: "Campus Network Rack",
      ip: "10.10.0.0",
      port: 443,
      defaultView: "/protect",
      badgeColor: "green",
      status: "online",
      quickLinks: [
        { label: "Live View", path: "/protect/liveview" },
        { label: "Detections", path: "/protect/detections" },
        { label: "Console OS", path: "/" }
      ]
    },
    {
      id: "nvr-3",
      name: "NVR 3",
      model: "UniFi Protect NVR",
      location: "Campus Network Rack",
      ip: "10.10.0.0",
      port: 443,
      defaultView: "/protect",
      badgeColor: "purple",
      status: "online",
      quickLinks: [
        { label: "Live View", path: "/protect/liveview" },
        { label: "Detections", path: "/protect/detections" },
        { label: "Console OS", path: "/" }
      ]
    },
    {
      id: "nvr-enterprise",
      name: "Enterprise NVR",
      model: "UniFi Protect Enterprise NVR",
      location: "Central Core MDF / Server Facility",
      ip: "10.10.0.0",
      port: 443,
      defaultView: "/protect",
      badgeColor: "blue",
      status: "online",
      quickLinks: [
        { label: "Live View", path: "/protect/liveview" },
        { label: "Detections", path: "/protect/detections" },
        { label: "Console OS", path: "/" }
      ]
    }
  ],

  // Administrator Quick Tips & Guidance
  faqs: [
    {
      question: "Why does my browser say 'Your connection is not private' (SSL Warning)?",
      answer: "Because these NVRs are located directly on our internal school network (10.10.42.x) and do not expose footage to the public internet, they use internal security certificates. To continue: Click <strong>'Advanced'</strong> (or 'More Info'), then click <strong>'Proceed to [IP Address] (unsafe)'</strong>. This is normal and 100% safe inside our school firewall."
    },
    {
      question: "When should I use this internal portal vs unifi.ui.com?",
      answer: "When on-campus, always use this <strong>internal portal</strong>! It connects directly to internal NVRs over high-speed local switches (10.10.42.x), providing instant playback and zero buffering without using school internet bandwidth. When you are <em>off-campus</em> or working from home, use the <strong>unifi.ui.com</strong> button below to connect via Ubiquiti cloud remote access."
    },
    {
      question: "What credentials does the Principal use to log in?",
      answer: "Use the local administrator or viewer credentials provided by the IT Department (or your district Single Sign-On / Ubiquiti account if configured). You can check 'Remember Me' on your office computer for quick access."
    },
    {
      question: "Can I view multiple cameras on a wall monitor or second screen?",
      answer: "Yes! Click the <strong>'Live View'</strong> button on any NVR card to open the multi-camera grid. You can create customized views (e.g. 'Hallways Only' or 'Entrances Only') inside UniFi Protect and press F11 for full-screen."
    }
  ]
};
