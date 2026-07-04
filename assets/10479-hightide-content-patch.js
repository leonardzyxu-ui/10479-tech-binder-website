(function () {
  const textMap = new Map([
    ["HIGH", "POWER"],
    ["TIDE", "HOUSE"],
    ["HighTide", "Powerhouse"],
    ["Team 4414", "Team 10479"],
    ["Team 4414 | HighTide", "Team 10479 | Powerhouse"],
    ["RIPCURRENT", "NEXUS"],
    ["Bumpers", "Overall"],
    ["Bumpers.", "Overall."],
    ["Dye Rotor", "Indexer"],
    ["Dye Rotor.", "Indexer."],
    ["Turret.", "Turrets."],
    ["Tide Apps", "Mentor Requests"],
    ["Tide Apps.", "Mentor Requests."],
    ["Tide Apps · 11", "Mentor Requests · 11"],
    ["Four Kraken X44s on a 3″ flywheel.", "Two Limelight turret shooters with X60 flywheels."],
    ["55.7:1 reduction with a flex-wheel cable-chain tensioner.", "37:1 turret rotation with 124.55:1 hood control."],
    ["25×32″ swerve, geared 7.67:1 for lower current draw.", "27.16″ square MK4N swerve with 6.75:1 drive ratio."],
    ["Optimized for high BPS single stream shooting.", "Barrel wheels feed Fuel toward the twin turrets."],
    ["Structural bumpers that double as hopper walls and shooter mount.", "Shooter, Hopper, Chassis, Intake, and Indexer packaging."],
    ["Powered by 2 X60s and 1 X44 bottom bar.", "X60 roller drive with X44 intake deployment."],
    ["Our collection of in-house software tools.", "Evidence needed before this can become a complete public binder site."],
    ["A 25\" × 32\" swerve base, geared 7.67:1 for low current draw on launch.", "A 27.16\" × 27.16\" swerve base using MK4N modules, Kraken drive motors, and compact electronics packaging."],
    ["Structural bumpers that double as hopper walls and shooter mounting.", "Final robot layout showing Shooter, Hopper, Chassis, Intake, and Indexer packaging."],
    ["Four Kraken X44s on a 3\" flywheel, copper mass for stored energy, dual GT2 belts on the hood.", "Two compact turret shooters with Limelight vision, flywheel speed control, turret rotation, and adjustable hood angle."],
    ["A 55.7:1 reduction on a single Kraken X44, with a flex-wheel cable-chain tensioner.", "Twin turret architecture using 360° rotation, Limelight targeting, and hood/backboard trajectory control."],
    ["Precomputed trajectories, tilt-compensated shots, and an AI-first dev loop.", "State estimation, path planning, dynamic confidence adjustment, and future-position shooting."],
    ["Medium-fidelity block CAD for fast iteration before final part modeling.", "Block CAD and early architecture evidence still needed from the team."],
    ["Rotor Iterations.", "Prototype Evidence Needed."],
    ["Shooter Iterations.", "Shooter Evidence Needed."],
    ["Block CAD.", "Block CAD Request."],
    ["Mechanical · 02", "Mechanical · 02"],
    ["Prototyping · 09", "Evidence · 09"],
    ["Prototyping · 10", "Evidence · 10"],
    ["Prototyping · 08", "Evidence · 08"],
    ["Nautilus", "Autonomous Paths"],
    ["TideScout", "Localization Logs"],
    ["TideShot", "Shot Data"],
    ["Autonomous Sim", "Path Planning"],
    ["TideScout Film Review", "Sensor Evidence"],
    ["TideMatch", "Shot Readiness"],
    ["Shot Calculator", "PID & Feedforward"],
    ["TidePower", "Electronics Photos"],
    ["TideLogs", "Solver Validation"],
    ["TideSim", "Robot Strategy"],
    ["TideScout Pick Lists", "Lookup Tables"],
    ["TideParts", "Wiring Layout"],
    ["In-house high-fidelity autonomous path planning and visualization.", "Autonomous path screenshots or simulator views are needed to support the binder's planning claims."],
    ["Custom scouting app with multiplayer picklists, AI agents, high scalability, and qualitative data-driven insights.", "Localization logs or examples are needed to show Limelight, Pigeon, and swerve encoder fusion in practice."],
    ["BPS analyzer.", "Measured distance, flywheel speed, hood angle, and time-of-flight data are needed."],
    ["Collaborative autonomous path visualization for match strategy. The fastest way to draw accurate paths.", "Global and local path-planning evidence should show planned paths and obstacle response."],
    ["Pairs match video with scouting data so strategy reviews stay grounded in what happened.", "Sensor placement and AprilTag update examples would make the state-estimation section concrete."],
    ["Ipad app for review matched with proper shift timings.", "Shot-readiness logs should show turret, hood, flywheel, and solver-valid gates."],
    ["A physics-based simulation engine used to determine optimal exit velocities and release angles.", "PID and feedforward tuning evidence would support the control section."],
    ["A diagnostic dashboard for monitoring current draw and battery health across all subsystems.", "Electronics and wiring photos are needed for RoboRIO, VH109, PDP 2.0, MPM, Limelight, and Pigeon placement."],
    ["A server-based AdvantageScope repository: anyone can view any log anywhere, anytime.", "Dynamic shooting solver validation and practice data would strengthen the programming story."],
    ["An early-season V3 multiplayer top-down game with customizable robots, used to help decide robot architecture.", "Design-strategy evidence should show why NEXUS prioritized Fuel cycle time, scoring, and defense avoidance."],
    ["A master strategic dashboard that ranks team scoring efficiency and reliability for playoff picklists.", "Lookup table data should include distance, flywheel speed, hood angle, and time of flight."],
    ["A centralized inventory and part-tracking system for the build season.", "A clean electronics/wiring layout would complete the architecture evidence set."],
    ["25\" x 32\" frame size with chamfered back corners", "27.16\" x 27.16\" / 690 mm x 690 mm square frame"],
    ["2 custom swerve modules using WCP Swerve X2 components", "MK4N Swerve modules"],
    ["Chamfered corners maximize hopper area and dye rotor diameter while staying within 110\" and keeping the dye rotor low", "Low center of mass and compact packaging help prevent tipping and reduce cycle time"],
    ["2\" x 1\" x .0625\" aluminum box tube as main structure", "MK4N drivebase selected for speed, precision, and defense avoidance"],
    ["Left drive rail split to bias the battery to the very edge in order to accommodate dye rotor packaging", "Driving gear ratio: 6.75:1"],
    ["Two cross rails provide structure to the dye rotor", "Steering gear ratio: 24:1"],
    ["Split \"brain pan\" style electronics mounting made from .060\" bent aluminum", "Electronics include RoboRIO 2.0, VH109 Radio, PDP 2.0, MPM, two Limelight 4 cameras, and Pigeon 2.0"],
    ["Protected by .125\" ABS plastic sheet", "Kraken X60 drive motors"],
    ["Easy to access and low profile", "Kraken X44 steering motors"],
    ["7.67:1 swerve gearing to minimize current draw when accelerating", "Battery is placed toward the center under the indexer, standing straight up"],
    ["Bumper backing used as hopper walls to gain ~1\" extra hopper space per side", "Overall robot architecture centers on Shooter, Hopper, Chassis, Intake, and Indexer"],
    ["Acts as the structure for the shooter", "The design prioritizes fast Fuel collection and reliable scoring"],
    ["Mounted to the drivebase via 4 WCP bumper cones and nuts", "The drivetrain supports short cycle times and stable movement"],
    ["Mainly constructed from .090\" bent aluminum", "The intake expands Fuel pickup coverage in the Neutral Zone"],
    ["Side panels constructed from bent .125\" polycarbonate reinforced with .125\" SRPP", "The indexer organizes chaotic Fuel for the two compact shooters"],
    ["Hopper panels made from .033\" polycarbonate sheets", "Two turrets sit above the indexer with Limelight targeting"],
    [".060\" bent C channel aluminum holds bumper foam and nests inside the .090\" structure for easier assembly", "Shooter, hood, turret, and sensor placement need clean public CAD exports"],
    ["Cutouts in the corners to access the main breaker, RSL and radio", "Electronics and wiring photos are still needed"],
    ["3d printed \"stadium\" pieces funnel balls into the dye rotor", "Prototype iteration evidence is still needed"],
    ["2x Kraken X60 for rollers and 1x Kraken X60 for rotation", "Indexer is the main bottleneck for moving Fuel from collection to Hub scoring"],
    ["2.5:1 Reduction on feeder wheels", "Barrel wheels push Fuel from the hopper toward the shooters"],
    ["36.4:1 Reduction for rotation", "Two Kraken X44 motors drive six large and six small rollers"],
    ["15mm HTD Belts + extended geartrain system in order to prevent belt slippage", "A 4:1 gear ratio feeds the twin turrets"],
    ["Contour shaping 3D prints for smoother operation", "The indexer combines aluminum, rubber wheels, and many 3D printed parts"],
    ["\"Dolphin Fin\" ramp on the outside, rotor constantly spins in the opposite direction slowly to agitate balls and reduce packing pressure.", "The design goal is to move chaotic Fuel cleanly into two small shooters."],
    ["\"Shrink Wrap\" to allow balls to fall down smoothly around the rotor and reduce agitation while firing", "Detailed jam testing and iteration photos are still needed."],
    ["Passive rollers for jam free operation", "Indexer proof should include photos, CAD exports, and practice throughput evidence"],
    ["Passive plastic rollers on hook and ramp coupled with bearings decrease current draw and allow balls to push each other through", "Add measured or video evidence for Fuel flow through the hopper/indexer path"],
    ["Vertical 3\" Omni Wheel to allow balls to fall down smoothly into the 3\" TTB Urethane Wheels", "Add details for barrel wheel geometry and roller placement"],
    ["Horizontal 1.25\" GoBilda Omni Wheels to allow balls to slide smoothly onto the ramp", "Add evidence for jam prevention and recovery behavior"],
    ["Primary 3\" diameter ⅛\" wall polycarbonate roller", "1 Kraken X60 drives a 3.33:1 pulley reduction for the intake rollers"],
    ["Powered by 2x Kraken X60s geared down 3.45:1", "Small and large rubber wheels pull Fuel into the robot"],
    ["3D printed stub axle hub with aluminum shear pins", "The intake is supported by aluminum and polycarbonate sheets"],
    ["Bottom 1.5\" diameter ⅛\" wall polycarbonate roller", "1 Kraken X44 deploys the intake through a 45:1 planetary gearbox"],
    ["Powered by 1x Kraken X44 geared down 1.5:1", "The intake is built to pull in as much Fuel as possible quickly"],
    ["Deploys at the beginning of the match between ~1.3\" wide bumper gaps and stays down via steel latches", "Fast collection supports short cycle time"],
    ["Large flange 3D printed hubs, reinforced with steel shear pins, aluminum shear tubes, and internal steel tapped \"crown\"", "More prototype and test evidence is needed before public release"],
    ["Doubled up .25\" polycarbonate 10DP gear racks act as leaf springs with each other", "The intake panel is designed to be light"],
    ["Driven by 1x Kraken X44 on each side geared to 3.33:1 at the 10T pinion", "The mechanism connects directly to the drivetrain"],
    ["Extending hopper holds 85+ balls under the trench, 100+ with net over the bump", "Intake speed is a core design priority"],
    ["Oversized bent aluminum impact guards allow intake to slide along field perimeter", "Detailed impact and durability evidence is still needed"],
    ["Cutout on the front panel allows for extra capacity while still keeping the starting configuration under the trench", "Clean isolated CAD exports should be added for publication"],
    ["4x Kraken X44 geared 1:1 to a 3\" flywheel", "1 Kraken X60 drives the flywheel for each shooter"],
    ["3x 1\" sushi wheel feeder on one side geared down 16:14 with .5\" compression", "An aluminum wheel with rubber and copper momentum wheels stores shooting energy"],
    ["1\" sushi wheel hood roller at 50% surface speed with 1\" compression", "1 Kraken X44 drives turret rotation through a 37:1 gearbox"],
    [".9\" and .8\" compression on hood backing 3d prints", "1 Kraken X44 controls the backboard/hood through a 124.55:1 gear and pulley system"],
    ["Staggered plate structure to reduce swept volume", "Each turret is compact to save space and power"],
    ["All motors centered and vertically stacked for minimal protrusions", "Limelight sensors are mounted at the top with a cooling fan behind the camera"],
    [".25\" copper flywheels in addition to mass disks inside the stealth wheels", "The hood provides about 30° trajectory control"],
    ["Slightly more dense than steel", "Shot data and lookup tables still need publication-ready evidence"],
    ["Dual GT2 3mm pitch 6mm wide belts directly over the hood side plates", "Dynamic shooting accounts for robot motion and target distance"],
    ["Allows for a hood roller while maintaining the low profile of a static hood", "Shot readiness checks turret angle, hood angle, flywheel speed, and solver validity"],
    ["Belt teeth constrained to the pulleys using idlers to eliminate belt skipping", "The binder notes a 530 RPM readiness threshold; mentor confirmation is needed before public release"],
    ["Tapped .10\" steel plates used for low profile structure and act as belt guides, preventing the belts from walking off the pulleys", "Validation photos, logs, and measured accuracy should be added"],
    ["20dp hood sector gear made from doubled up .125\" 7075 aluminum", "Two Limelight-equipped turret shooters sit above the indexer"],
    ["85.3:1 overall ratio driven by 1 Kraken X44", "Turret rotation is designed for up to 360° movement"],
    ["Harder and more wear resistant than 6061", "The turret is supported directly by the indexer"],
    ["Greater impact resistance against accidental trench collisions", "Clean CAD exports for hood/backboard/flywheel are still needed"],
    ["Compact bearing stack using WCP 21/32\" ultra low profile shoulder bolts threaded directly into the shooter body mounting nut strips", "Each turret integrates Limelight targeting with shooter control"],
    ["55.7:1 overall ratio powered by 1 Kraken X44", "Turret rotation uses a Kraken X44 through a 37:1 gearbox"],
    ["44t idler gear machined down to 0.275\" thick for cable chain clearance", "The hood/backboard is controlled through a 124.55:1 gear and pulley system"],
    ["Also utilizes double stacked .125\" 7075 for wear resistance", "A compact turret keeps the mechanism within packaging constraints"],
    ["2 back-to-back 8lb constant force springs retract a 1.625\" flex wheel to tension the cable chain", "Motion compensation must account for turret offset and robot rotation"],
    ["2 stacks of 4 thrust bushings constrain the tensioner to only linear motion", "Measured turret response and shot readiness logs are still needed"],
    ["Precomputed trajectory map", "State estimation and autonomous control"],
    ["For a range of inputs (distance, robot velocity), compute ALL possible shots that score in the goal. [Upper limit shown in green, lower limit in red]", "Subsystems stay modular while a unified command scheduler coordinates autonomous and teleop behavior"],
    ["Find the shot at each set of inputs that is most robust to errors", "Field-oriented control translates joystick inputs into field coordinates"],
    ["Precompute a 2nd-order polynomial to look up hood angle/flywheel speed quickly at runtime", "Speed and acceleration limits help prevent slipping and smooth drivetrain response"],
    ["Polynomial handles robot radial velocity; tangential velocity is compensated for at runtime with the turret using 3D vector math", "Autonomous combines state estimation, path planning, and closed-loop control"],
    ["Tilt-compensated shooting", "Sensor fusion and confidence"],
    ["Robot's pitch and yaw are used to transform the calculated 3D shot trajectory to compensate for tilt.", "Swerve encoders, two Limelight 4 cameras, and Pigeon 2.0 contribute to pose estimation"],
    ["Allows us to shoot on the bump while under defense", "AprilTag updates correct drift with globally referenced observations"],
    ["AI-first development", "Dynamic shooting"],
    ["Features are attempted by AI agents and reviewed by humans; little code is written by hand. Logs are added as context during debugging cycles.", "Lookup tables store distance, flywheel speed, hood angle, and time of flight"],
    ["Fully state-machine based, no commands. Easier for AI to reason about.", "The solver predicts future launch position during projectile flight"],
    ["Skill files which help agents build autos, parse logs, or optimize loop time.", "Readiness checks prevent firing before turret, hood, flywheel, and dynamic solution are valid"],
    ["Medium-fidelity block CAD", "Need early block CAD screenshots"],
    ["All power transmission and critical geometries modeled as-is, with plate shape left as simple as possible", "Need architecture sketches or packaging studies"],
    ["Robust to large changes and quick to repair", "Need reasons for major design changes"],
    ["Final parts modeled directly on top of block models", "Need final mentor-approved CAD export set"]
  ]);

  const attrMap = new Map([
    ["HighTide — 2026 Binder", "Powerhouse — 2026 Binder"],
    ["Team 4414 logo", "Team 10479 logo"],
    ["Full robot assembly", "NEXUS full robot assembly"],
    ["Drivetrain assembly", "NEXUS drivetrain assembly"],
    ["Bumpers assembly", "NEXUS overall robot assembly"],
    ["Dye Rotor", "NEXUS indexer"],
    ["Intake", "NEXUS intake"],
    ["Shooter", "NEXUS shooter"],
    ["Turret", "NEXUS turrets"]
  ]);

  function replaceTextNode(node) {
    const raw = node.nodeValue;
    const trimmed = raw.trim();
    if (!trimmed) return;
    let next = textMap.get(trimmed);
    if (!next) {
      next = raw
        .replaceAll("Team 4414", "Team 10479")
        .replaceAll("HighTide", "Powerhouse")
        .replaceAll("RIPCURRENT", "NEXUS")
        .replaceAll("Dye Rotor", "Indexer")
        .replaceAll("Bumpers", "Overall")
        .replaceAll("Tide Apps", "Mentor Requests")
        .replaceAll("TideScout", "PowerScout")
        .replaceAll("TideShot", "Shot Data")
        .replaceAll("TideMatch", "Shot Readiness")
        .replaceAll("TidePower", "Electronics Evidence")
        .replaceAll("TideLogs", "Solver Logs")
        .replaceAll("TideSim", "Strategy Evidence")
        .replaceAll("TideParts", "Wiring Layout");
      if (next === raw) return;
      node.nodeValue = next;
      return;
    }
    node.nodeValue = raw.replace(trimmed, next);
  }

  function walkText(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(replaceTextNode);
  }

  function patchAttributes() {
    for (const el of document.querySelectorAll("[aria-label], [alt], [title]")) {
      for (const attr of ["aria-label", "alt", "title"]) {
        const value = el.getAttribute(attr);
        if (!value) continue;
        let next = attrMap.get(value);
        if (!next) {
          next = value
            .replaceAll("Team 4414", "Team 10479")
            .replaceAll("HighTide", "Powerhouse")
            .replaceAll("RIPCURRENT", "NEXUS")
            .replaceAll("Dye Rotor", "Indexer")
            .replaceAll("Bumpers", "Overall")
            .replaceAll("Tide", "Powerhouse");
        }
        if (next !== value) el.setAttribute(attr, next);
      }
    }
  }

  function patchPrototypeLabels() {
    const rotorImages = Array.from(document.querySelectorAll('img[alt^="Rotor V"]'));
    const rotorLabels = ["Robot", "Chassis", "Intake", "Indexer", "Shooter", "Turret", "Sensors", "Paths", "Lookup", "Logs"];
    rotorImages.forEach((img, index) => {
      const label = rotorLabels[index] || `Need ${index + 1}`;
      img.dataset.label = label;
      img.alt = `NEXUS evidence request: ${label}`;
    });
    const shooterImages = Array.from(document.querySelectorAll('img[alt^="Shooter V"]'));
    const shooterLabels = ["Flywheel", "Hood", "Turret", "Limelight", "TOF", "Lookup", "Solver", "Motion", "Ready", "Accuracy", "Logs"];
    shooterImages.forEach((img, index) => {
      const label = shooterLabels[index] || `Need ${index + 1}`;
      img.dataset.label = label;
      img.alt = `NEXUS shooter evidence request: ${label}`;
    });
  }

  function patchLinks() {
    document.title = "10479 — 2026 Technical Binder";
    const brandTags = document.querySelectorAll(".nav-brand-tag, .print-brand-tag");
    brandTags.forEach((tag) => {
      if (tag.textContent.includes("Binder")) return;
      tag.append(" Binder");
    });
  }

  function patch() {
    walkText(document.body);
    patchAttributes();
    patchPrototypeLabels();
    patchLinks();
  }

  let runs = 0;
  function schedulePatch() {
    patch();
    runs += 1;
    if (runs < 10) window.setTimeout(schedulePatch, 120);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedulePatch, { once: true });
  } else {
    schedulePatch();
  }
  window.addEventListener("load", schedulePatch, { once: true });
})();
