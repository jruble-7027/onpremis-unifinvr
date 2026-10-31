# UniFi Protect Internal NVR Portal for Schools

A lightweight, intranet-optimized web portal designed to give school principals, campus administrators, and security staff one-click access to internal UniFi NVRs (UNVR, UNVR-Pro, UDM-Pro/SE, Cloud Key Gen2+).

---

## 🎯 Why Use an Internal Portal?

1. **Instant, High-Speed Local Playback:** Streams stay completely on your 1Gbps / 10Gbps local LAN switches. Video playback and timeline scrubbing are immediate with zero buffering.
2. **Zero Internet Bandwidth Consumption:** Does not route multi-stream 4K/HD video footage through the public internet or external cloud relays (`protect.ui.com`).
3. **Works Even During Internet Outages:** As long as local school power and network switches are up, the principal can still access surveillance feeds.
4. **Simple & Intuitive for Non-Technical Users:** The principal doesn't need to remember IP addresses, port numbers, or complex console menus.

---

## 📁 File Structure

```text
unifi-nvr-portal/
├── index.html           # Main executive surveillance dashboard
├── styles.css           # Modern, responsive UI (dark & light mode, zero external CDNs)
├── config.js            # Configuration file: NVR names, IPs, ports, and camera zones
├── app.js               # Dynamic card rendering, search filter, and SSL help modal
├── web.config           # Ready-to-go Microsoft IIS configuration file
├── deploy-to-iis.ps1    # 1-click PowerShell deployment script for Windows Server
├── start-preview.ps1    # Lightweight preview server for instant testing
├── start-preview.bat    # Double-click launcher for local testing
└── README.md            # Complete deployment and configuration documentation
```

---

## ⚙️ Step 1: Customize Your NVRs (`config.js`)

Open `config.js` in any text editor (Notepad, VS Code). Update the placeholder IP addresses with your actual internal UniFi NVR IPs or DNS hostnames:

```javascript
window.PORTAL_CONFIG = {
  districtName: "West Central Academy Video Surveillance",
  portalTitle: "UniFi Protect Internal Access Portal",
  portalSubtitle: "Direct High-Speed Local Network Streaming for Principals & Staff",

  nvrs: [
    {
      id: "nvr-hs",
      name: "High School Main Campus",
      model: "UniFi UNVR-Pro",
      location: "Main Building • Server Room",
      ip: "10.10.10.50",               // <-- Put your actual internal IP here
      port: 443,
      defaultView: "/protect",
      cameraCount: 48,
      coverageSummary: "Main Entrances, Hallways, Cafeteria, Courtyard, Perimeter",
      badgeColor: "blue",
      status: "online",
      quickLinks: [
        { label: "Live View", path: "/protect/liveview" },
        { label: "Detections", path: "/protect/detections" },
        { label: "Console OS", path: "/" }
      ]
    },
    // Add additional NVRs as needed...
  ]
};
```

---

## 🚀 Step 2: Deploy to Your Windows Server

### Option A: Automated IIS Deployment (Recommended)

1. Copy the `unifi-nvr-portal` folder to your Windows Server.
2. Open **PowerShell as Administrator** on that server.
3. Navigate to the folder and run:
   ```powershell
   .\deploy-to-iis.ps1
   ```
4. The script will:
   - Verify or enable the IIS Web Server role.
   - Copy files to `C:\inetpub\wwwroot\nvr-portal`.
   - Create an IIS Virtual Application under your Default Web Site.
   - Ensure Windows Firewall port 80/443 is open.
   - Display the ready-to-share URLs (e.g. `http://<server-name>/nvr-portal/` or `http://<server-ip>/nvr-portal/`).

---

### Option B: Manual IIS Setup

If you prefer doing it manually in the **Internet Information Services (IIS) Manager** GUI:
1. Copy the `unifi-nvr-portal` folder to `C:\inetpub\wwwroot\nvr-portal`.
2. Open **IIS Manager** (`inetmgr`).
3. In the left tree, expand `Sites` -> `Default Web Site`.
4. Right-click `Default Web Site` -> **Add Application...**:
   - **Alias:** `nvr-portal`
   - **Physical path:** `C:\inetpub\wwwroot\nvr-portal`
   - Click **OK**.
5. Test in browser: `http://localhost/nvr-portal/`.

---

## 🖥️ Making it Effortless for the Principal

### 1. Create a Desktop Shortcut for the Principal
You can place a shortcut directly on the principal's Windows desktop:
- Right-click desktop -> **New** -> **Shortcut**.
- Location: `http://<server-name>/nvr-portal/`
- Name: **Campus Video Surveillance**
- (Optional) Change the icon to a security camera icon.

### 2. Kiosk / Dedicated Full-Screen Mode (Optional)
If the principal has a secondary wall monitor or dedicated surveillance screen, you can launch Chrome or Edge directly in app mode:
```cmd
msedge.exe --app=http://<server-name>/nvr-portal/
```
or
```cmd
chrome.exe --app=http://<server-name>/nvr-portal/
```

### 3. UniFi Account Setup for School Administrators
- Log in to your UniFi OS console (`https://<nvr-ip>`).
- Go to **Admins & Users**.
- Add the principal as a **Local User** or **Ubiquiti Cloud Account**.
- Assign the role: **Protect -> View Only** (or Custom: View & Export Clips).
- Check **"Remember Me"** when logging in from their office computer.

### 4. Handling Browser SSL Warnings ("Your connection is not private")
Because UniFi NVRs generate internal self-signed SSL certificates for their HTTPS interface:
- The portal has a built-in **"SSL Warning Help"** button that gives clear instructions.
- Staff simply click **Advanced** -> **Proceed to [IP] (unsafe)** once; Chrome/Edge will remember the exception.
- *(Advanced IT option)*: If your district uses Active Directory Certificate Services (AD CS), you can issue and install an internal trusted wildcard or machine certificate on the UniFi NVRs.

---

## 🧪 Testing Locally Before Deployment

Double-click `start-preview.bat` (or run `.\start-preview.ps1` in PowerShell). It will launch an immediate lightweight web server on `http://localhost:8080/` with no IIS or external software installation required!
