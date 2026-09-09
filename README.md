# NovaXLR

NovaXLR is a modernized, next-generation audio mixer and routing controller suite for TC-Helicon GoXLR and GoXLR Mini devices on Windows.

## Highlights in NovaXLR
* **Modern Obsidian Studio Aesthetic**: Sleek dark UI with refined glassmorphic cards, vibrant cyan/blue indicators, and modern typography replacing the legacy 2018 TC-Helicon design.
* **Proportional Window Scaling**: Dynamically scales uniformly with the application window across 1080p, 1440p, and 4K displays without clipping, cutoffs, or awkward borders.
* **Native Windows Desktop Experience**: Standalone native window with Start Menu integration, system tray, and auto-start support.
* **Full Feature Parity**: Complete control over faders, routing matrix, submixes, microphone processing, voice effects, sampler, lighting, and profile management.

## Framework Attribution & Acknowledgements
NovaXLR is developed by [iammrwrath](https://github.com/iammrwrath) and is built on top of the open-source **GoXLR Utility** framework created and maintained by **Craig McLure ([@FrostyCoolSlug](https://github.com/FrostyCoolSlug))** and the **[GoXLR-on-Linux Community](https://github.com/GoXLR-on-Linux)**.

We express our sincere gratitude to Craig McLure and all open-source contributors for reverse-engineering the GoXLR USB protocol, creating the high-performance Rust daemon, and making open hardware control possible.

* Original upstream project: [https://github.com/GoXLR-on-Linux/goxlr-utility](https://github.com/GoXLR-on-Linux/goxlr-utility)
* License: MIT License (preserved in full in [LICENSE](LICENSE))

## Original Framework Features
* Full control over the GoXLR and GoXLR Mini
* Compatibility with profiles created by the official application
* Remote Access: Control your GoXLR from another computer on your network
* A Sample 'Pre-Buffer': Record audio from before you press the button
* A CLI and API for basic or advanced scripting and automation

## Downloads

Windows installer releases are available on the [NovaXLR Releases Page](https://github.com/iammrwrath/NovaXLR/releases/latest) under the 'Assets' header.

### OS / Distro Specific Notes

* If you are running Ubuntu 24.04 or a derivitive (such as Linux Mint), please review
  [this issue](https://github.com/GoXLR-on-Linux/goxlr-utility/issues/221)
* If you're running the Mix 2 firmware and are seeing UCM errors, please
  review [this issue](https://github.com/GoXLR-on-Linux/goxlr-utility/issues/223)
* Arch users can install the `goxlr-utility` package from [AUR](https://aur.archlinux.org/packages/goxlr-utility)
* Fedora Atomic or Bazzite users please check the instructions
  [here](https://github.com/GoXLR-on-Linux/goxlr-utility/wiki/Fedora-Atomic-&-Bazzite)
* Windows users can also aquire the GoXLR Utility via `winget`

<sup>1</sup> Windows requires the official device drivers provided by TC-Helicon. If you have the official app
installed you don't need to do anything, otherwise download the latest drivers from 
[here](https://utility.frostycoolslug.com/update-site/drivers/TC-Helicon_GoXLR_Driver_5.57.zip).


<sup>2</sup> MacOS support is still somewhat experimental, and the package may conflict with the existing
GoXLR-MacOS project as they attempt to do the same thing in certain situations.

## Integrations

* [twitchat](https://twitchat.fr/) - Activate and change GoXLR settings based on twitch bits / donations (Thanks Durss!)
* [MacroGraph](https://www.macrograph.app/) - A visual programmer for Streamers. (Thanks JDUDE!)
* [OBS Fader Sync](https://github.com/parzival-space/obs-goxlr-fader-sync-plugin) - An OBS plugin to sync pre-mix
  volumes to fader volumes (Thanks parzival!)
* [Home Assistant](https://github.com/timmo001/homeassistant-integration-goxlr-utility) - A plugin that lets you tie the
  GoXLR into your home automation (Thanks timmmo!)

## Getting Started

Once installed, you can launch the Utility using the `GoXLR Utility` item in your Applications Menu, this will launch
the utility and configuration UI. The UI will then be accessible via the system tray icon, or (if you don't have a tray)
by re-running the `GoXLR Utility` menu item.

If you're running on Linux, a first configuration step should be to enable `Autostart on Login` via System -> Settings.
Windows users will get the choice during installation. If you change your mind, you can change the setting.

If you want to import your profiles from the official app, simply click on the folder icon in the top right of the
relevant profiles pane (either Main or Mic) which will open the directory in your file browser. Copy the profile across
from the Official App's directory (normally `Documents/GoXLR`) and they'll appear in the util ready to load, simply
double click them.

If you're setting up from scratch, the best place to start is configuring your microphone. Head over to the `Mic` tab
and hit `Mic Setup` to configure your microphone type and gain. It may be easier to configure if you first set your
Gate Amount to 0, then reconfigure it once your mic is working. Once done, go explore the UI!

## The UI

The Utility's UI is web based and served directly from the utility to your web browser of choice (if configured, it
can also be served to a web browser on another computer). The Utility also provides an 'Application' which wraps the
web UI into a dedicated app. If you're using the Utility on Windows this option is presented to you during install.
The UI design was modelled around the official application in an attempt to provide a familiar interface for those
moving from Windows to other platforms, rather than forcing people to learn a new configuration paradigm.

![image](https://github.com/GoXLR-on-Linux/goxlr-utility/assets/574943/8f14bd2c-e67a-42e5-bd9f-b3cb367e171d)

If you're running on Linux, the 'Application' isn't provided as part of the base utility installation. If you'd
prefer to use it, check out the [GoXLR UI Repository](https://github.com/frostyCoolSlug/goxlr-utility-ui/), which
provides various builds for distributions. Once installed, you should be able to go to System -> Utility Settings
and change the UI Handler there.

## Building

Build instructions and other useful information can be found on the
project's [wiki](https://github.com/GoXLR-on-Linux/goxlr-utility/wiki/Compilation-Guide).
While it's a little sparse at the moment, over time it should grow, and requests / feedback are always welcome!

## Disclaimer

This project is also not supported by, or affiliated in any way with, TC-Helicon. For the official GoXLR software,
please refer to their website.

In addition, this project accepts no responsibility or liability for use of this software, or any problems which may
occur from its use. Please read the [LICENSE](https://github.com/GoXLR-on-Linux/goxlr-utility/blob/main/LICENSE) for
more information.
