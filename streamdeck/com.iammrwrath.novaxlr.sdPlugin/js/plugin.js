// NovaXLR Stream Deck Plugin
// Developed by iammrwrath

let websocket = null;
let pluginUUID = null;
let destinationObject = null;
let actionList = new Map(); // context -> { action, context, settings }

// NovaXLR Daemon Connection
let daemonWs = null;
let daemonConnected = false;
let daemonStatus = null;
let daemonSerial = null;
let reqId = 1;
let pendingRequests = new Map();

function connectDaemon() {
  if (daemonWs && (daemonWs.readyState === WebSocket.OPEN || daemonWs.readyState === WebSocket.CONNECTING)) {
    return;
  }

  try {
    daemonWs = new WebSocket("ws://localhost:14564/api/websocket");
  } catch (e) {
    console.warn("Daemon WS create error:", e);
    setTimeout(connectDaemon, 2000);
    return;
  }

  daemonWs.onopen = () => {
    daemonConnected = true;
    console.log("Connected to NovaXLR Daemon WebSocket");
    sendDaemonRequest("GetStatus");
  };

  daemonWs.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      const id = msg.id;
      const data = msg.data;

      if (id !== undefined && pendingRequests.has(id)) {
        const cb = pendingRequests.get(id);
        pendingRequests.delete(id);
        cb(data);
      }

      if (data && data.Status) {
        daemonStatus = data.Status;
        updateActiveSerial();
        updateAllActions();
      } else if (data && data.Patch) {
        // Fast JSON patch update
        applyDaemonPatch(data.Patch);
        updateAllActions();
      }
    } catch (err) {
      console.warn("Error processing daemon message:", err);
    }
  };

  daemonWs.onclose = () => {
    daemonConnected = false;
    daemonStatus = null;
    daemonSerial = null;
    updateAllActions();
    setTimeout(connectDaemon, 2000);
  };

  daemonWs.onerror = () => {
    if (daemonWs) daemonWs.close();
  };
}

function updateActiveSerial() {
  if (!daemonStatus || !daemonStatus.mixers) return;
  const serials = Object.keys(daemonStatus.mixers);
  if (serials.length > 0) {
    daemonSerial = serials[0];
  }
}

function applyDaemonPatch(patches) {
  if (!daemonStatus) return;
  for (const patch of patches) {
    try {
      const parts = patch.path.split("/").filter(p => p.length > 0);
      let target = daemonStatus;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!target[parts[i]]) target[parts[i]] = {};
        target = target[parts[i]];
      }
      const last = parts[parts.length - 1];
      if (patch.op === "replace" || patch.op === "add") {
        target[last] = patch.value;
      } else if (patch.op === "remove") {
        delete target[last];
      }
    } catch (e) {
      console.warn("Patch error:", e);
    }
  }
}

function sendDaemonRequest(req, callback) {
  if (!daemonWs || daemonWs.readyState !== WebSocket.OPEN) return;
  const id = reqId++;
  if (callback) {
    pendingRequests.set(id, callback);
  }
  daemonWs.send(JSON.stringify({ id: id, data: req }));
}

function sendDaemonCommand(command) {
  if (!daemonSerial) {
    updateActiveSerial();
    if (!daemonSerial) return;
  }
  sendDaemonRequest({ Command: [daemonSerial, command] });
}

// -------------------------------------------------------------
// Stream Deck Handlers
// -------------------------------------------------------------
function connectElgatoStreamDeckSocket(inPort, inPluginUUID, inRegisterEvent, inInfo) {
  pluginUUID = inPluginUUID;
  websocket = new WebSocket("ws://127.0.0.1:" + inPort);

  websocket.onopen = function () {
    const json = {
      event: inRegisterEvent,
      uuid: inPluginUUID
    };
    websocket.send(JSON.stringify(json));
    connectDaemon();
  };

  websocket.onmessage = function (evt) {
    const jsonObj = JSON.parse(evt.data);
    const event = jsonObj.event;
    const action = jsonObj.action;
    const context = jsonObj.context;
    const payload = jsonObj.payload || {};

    if (event === "willAppear") {
      actionList.set(context, {
        action: action,
        context: context,
        settings: payload.settings || {}
      });
      updateActionUI(context);
    } else if (event === "willDisappear") {
      actionList.delete(context);
    } else if (event === "didReceiveSettings") {
      if (actionList.has(context)) {
        actionList.get(context).settings = payload.settings || {};
        updateActionUI(context);
      }
    } else if (event === "keyDown") {
      handleKeyDown(action, context, payload.settings || {});
    } else if (event === "keyUp") {
      handleKeyUp(action, context, payload.settings || {});
    } else if (event === "dialRotate") {
      handleDialRotate(action, context, payload);
    } else if (event === "dialPress") {
      if (payload.pressed) {
        handleKeyDown(action, context, payload.settings || {});
      }
    } else if (event === "sendToPlugin") {
      handleSendToPlugin(action, context, payload);
    }
  };
}

function handleKeyDown(action, context, settings) {
  if (!daemonConnected || !daemonStatus) {
    showAlert(context);
    return;
  }

  const mixer = daemonStatus.mixers[daemonSerial];
  if (!mixer) {
    showAlert(context);
    return;
  }

  switch (action) {
    case "com.iammrwrath.novaxlr.profile":
      if (settings.profileName) {
        sendDaemonCommand({ LoadProfile: [settings.profileName, true] });
        showOk(context);
      }
      break;

    case "com.iammrwrath.novaxlr.micprofile":
      if (settings.micProfileName) {
        sendDaemonCommand({ LoadMicProfile: [settings.micProfileName, true] });
        showOk(context);
      }
      break;

    case "com.iammrwrath.novaxlr.channelmute":
      if (settings.channel) {
        const ch = settings.channel;
        let isMuted = false;
        if (mixer.fader_status) {
          for (const f of Object.values(mixer.fader_status)) {
            if (f.channel === ch && f.mute_state !== "Unmuted") {
              isMuted = true;
              break;
            }
          }
        }
        const nextState = isMuted ? "Unmuted" : (settings.muteFunction || "MutedToAll");
        sendDaemonCommand({ SetChannelMuteState: [ch, nextState] });
      }
      break;

    case "com.iammrwrath.novaxlr.fadermute":
      if (settings.fader) {
        const fader = settings.fader;
        const currentFader = mixer.fader_status && mixer.fader_status[fader];
        const isMuted = currentFader && currentFader.mute_state !== "Unmuted";
        const nextState = isMuted ? "Unmuted" : "MutedToAll";
        sendDaemonCommand({ SetFaderMuteState: [fader, nextState] });
      }
      break;

    case "com.iammrwrath.novaxlr.routing":
      if (settings.input && settings.output) {
        let isEnabled = false;
        if (mixer.router && mixer.router[settings.input]) {
          isEnabled = !!mixer.router[settings.input][settings.output];
        }
        sendDaemonCommand({ SetRouter: [settings.input, settings.output, !isEnabled] });
      }
      break;

    case "com.iammrwrath.novaxlr.cough":
      const coughState = mixer.cough_button ? mixer.cough_button.state : "Unmuted";
      const nextCough = coughState !== "Unmuted" ? "Unmuted" : "MutedToAll";
      sendDaemonCommand({ SetCoughMuteState: nextCough });
      break;

    case "com.iammrwrath.novaxlr.fxpreset":
      if (settings.preset) {
        sendDaemonCommand({ SetActiveEffectPreset: settings.preset });
        showOk(context);
      }
      break;

    case "com.iammrwrath.novaxlr.bleep":
      sendDaemonCommand({ SetSwearButtonState: true });
      break;

    case "com.iammrwrath.novaxlr.volume":
      if (settings.channel) {
        const currentVol = (mixer.levels && mixer.levels.volumes && mixer.levels.volumes[settings.channel]) || 128;
        const delta = settings.step || 10;
        const newVol = Math.max(0, Math.min(255, currentVol + delta));
        sendDaemonCommand({ SetVolume: [settings.channel, newVol] });
      }
      break;
  }
}

function handleKeyUp(action, context, settings) {
  if (!daemonConnected) return;

  if (action === "com.iammrwrath.novaxlr.bleep") {
    sendDaemonCommand({ SetSwearButtonState: false });
  } else if (action === "com.iammrwrath.novaxlr.cough" && settings.isMomentary) {
    sendDaemonCommand({ SetCoughMuteState: "Unmuted" });
  }
}

function handleDialRotate(action, context, payload) {
  if (!daemonConnected || !daemonStatus || !daemonSerial) return;
  const mixer = daemonStatus.mixers[daemonSerial];
  if (!mixer) return;

  const settings = payload.settings || {};
  const channel = settings.channel || "Music";
  const ticks = payload.ticks || 0;
  const step = 5;

  const currentVol = (mixer.levels && mixer.levels.volumes && mixer.levels.volumes[channel]) || 128;
  const newVol = Math.max(0, Math.min(255, currentVol + (ticks * step)));
  sendDaemonCommand({ SetVolume: [channel, newVol] });
}

function handleSendToPlugin(action, context, payload) {
  if (payload.event === "getProfiles") {
    if (daemonStatus && daemonStatus.files) {
      sendToPropertyInspector(context, {
        event: "profileList",
        profiles: daemonStatus.files.profiles || [],
        micProfiles: daemonStatus.files.mic_profiles || []
      });
    }
  }
}

// -------------------------------------------------------------
// UI Updates
// -------------------------------------------------------------
function updateAllActions() {
  for (const [context, data] of actionList.entries()) {
    updateActionUI(context);
  }
}

function updateActionUI(context) {
  if (!actionList.has(context)) return;
  const item = actionList.get(context);
  const action = item.action;
  const settings = item.settings || {};

  if (!daemonConnected || !daemonStatus || !daemonSerial) {
    setTitle(context, "NovaXLR\nOff");
    setState(context, 0);
    return;
  }

  const mixer = daemonStatus.mixers[daemonSerial];
  if (!mixer) return;

  switch (action) {
    case "com.iammrwrath.novaxlr.profile":
      const activeProf = mixer.profile_name || "";
      const targetProf = settings.profileName || "";
      const isProfActive = targetProf && (activeProf.toLowerCase() === targetProf.toLowerCase());
      setState(context, isProfActive ? 1 : 0);
      setTitle(context, targetProf || "Profile");
      break;

    case "com.iammrwrath.novaxlr.micprofile":
      const activeMicProf = mixer.mic_profile_name || "";
      const targetMic = settings.micProfileName || "";
      const isMicActive = targetMic && (activeMicProf.toLowerCase() === targetMic.toLowerCase());
      setState(context, isMicActive ? 1 : 0);
      setTitle(context, targetMic || "Mic Prof");
      break;

    case "com.iammrwrath.novaxlr.channelmute":
      const ch = settings.channel || "Mic";
      let isMuted = false;
      if (mixer.fader_status) {
        for (const f of Object.values(mixer.fader_status)) {
          if (f.channel === ch && f.mute_state !== "Unmuted") {
            isMuted = true;
            break;
          }
        }
      }
      setState(context, isMuted ? 1 : 0);
      setTitle(context, ch + "\n" + (isMuted ? "MUTED" : "ON"));
      break;

    case "com.iammrwrath.novaxlr.fadermute":
      const fader = settings.fader || "A";
      const fData = mixer.fader_status && mixer.fader_status[fader];
      const isFaderMuted = fData && fData.mute_state !== "Unmuted";
      setState(context, isFaderMuted ? 1 : 0);
      setTitle(context, "Fader " + fader + "\n" + (isFaderMuted ? "MUTED" : "ON"));
      break;

    case "com.iammrwrath.novaxlr.routing":
      const inp = settings.input || "Microphone";
      const outp = settings.output || "Broadcast";
      let routed = false;
      if (mixer.router && mixer.router[inp]) {
        routed = !!mixer.router[inp][outp];
      }
      setState(context, routed ? 1 : 0);
      setTitle(context, inp + "\n→ " + outp);
      break;

    case "com.iammrwrath.novaxlr.cough":
      const coughMuted = mixer.cough_button && mixer.cough_button.state !== "Unmuted";
      setState(context, coughMuted ? 1 : 0);
      setTitle(context, coughMuted ? "COUGH\nMUTED" : "COUGH");
      break;

    case "com.iammrwrath.novaxlr.fxpreset":
      const targetPreset = settings.preset || "Preset1";
      const activePreset = (mixer.effects && mixer.effects.active_preset) || "";
      const isPresetActive = activePreset === targetPreset;
      setState(context, isPresetActive ? 1 : 0);
      setTitle(context, targetPreset);
      break;

    case "com.iammrwrath.novaxlr.bleep":
      setTitle(context, "BLEEP");
      break;

    case "com.iammrwrath.novaxlr.volume":
      const volCh = settings.channel || "Music";
      const vol = (mixer.levels && mixer.levels.volumes && mixer.levels.volumes[volCh]) || 128;
      const pct = Math.round((vol / 255) * 100);
      setTitle(context, volCh + "\n" + pct + "%");
      break;
  }
}

// -------------------------------------------------------------
// Stream Deck API Wrappers
// -------------------------------------------------------------
function setTitle(context, title) {
  if (!websocket) return;
  websocket.send(JSON.stringify({
    event: "setTitle",
    context: context,
    payload: {
      title: title,
      target: 0
    }
  }));
}

function setState(context, state) {
  if (!websocket) return;
  websocket.send(JSON.stringify({
    event: "setState",
    context: context,
    payload: {
      state: state
    }
  }));
}

function showAlert(context) {
  if (!websocket) return;
  websocket.send(JSON.stringify({
    event: "showAlert",
    context: context
  }));
}

function showOk(context) {
  if (!websocket) return;
  websocket.send(JSON.stringify({
    event: "showOk",
    context: context
  }));
}

function sendToPropertyInspector(context, payload) {
  if (!websocket) return;
  websocket.send(JSON.stringify({
    event: "sendToPropertyInspector",
    context: context,
    payload: payload
  }));
}
