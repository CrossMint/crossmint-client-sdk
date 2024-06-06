import { urlToOrigin } from "@/utils/urlToOrigin";

import { EventMap } from "../EventEmitter";
import { EventEmitterWithHandshakeOptions } from "../handshake";
import { HandshakeParent } from "../handshake/Parent";

export interface PopupWindowOptions {
    width: number;
    height: number;
}

export class PopupWindow<IncomingEvents extends EventMap, OutgoingEvents extends EventMap> extends HandshakeParent<
    IncomingEvents,
    OutgoingEvents
> {
    window: Window;
    targetOrigin: string;

    private constructor(
        window: Window,
        targetOrigin: string,
        options?: EventEmitterWithHandshakeOptions<IncomingEvents, OutgoingEvents>
    ) {
        super(window, targetOrigin, options);

        this.window = window;
        this.targetOrigin = targetOrigin;
    }

    static async init<IncomingEvents extends EventMap, OutgoingEvents extends EventMap>(
        url: string,
        options: PopupWindowOptions & EventEmitterWithHandshakeOptions<IncomingEvents, OutgoingEvents>
    ) {
        return new PopupWindow<IncomingEvents, OutgoingEvents>(
            await createPopup(url, options),
            urlToOrigin(url),
            options
        );
    }
}

async function createPopup(url: string, options: PopupWindowOptions): Promise<Window> {
    const _window = window.open(url, "popupWindow", createPopupString(options.width, options.height));
    if (!_window) {
        throw new Error("Failed to open popup window");
    }

    return _window;
}

function createPopupString(width: number, height: number): string {
    const fixedLeft = 100; // Replace with your desired value
    const fixedTop = 100; // Replace with your desired value

    function getChromeVersion() {
        const raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
        return raw ? parseInt(raw[2]) : null;
    }
    function isFirefox() {
        return navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
    }

    // In newer versions of chrome (>99) you need to add the `popup=true` for the new window to actually open in a popup
    const chromeVersion = getChromeVersion();
    const chromeVersionGreaterThan99 = chromeVersion != null && chromeVersion > 99;
    const popupStringBase = isFirefox() || chromeVersionGreaterThan99 ? "popup=true," : "";

    return `${popupStringBase}height=${height},width=${width},left=${fixedLeft},top=${fixedTop},resizable=yes,scrollbars=yes,toolbar=yes,menubar=true,location=no,directories=no,status=yes`;
}
