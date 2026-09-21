/* ============================================================
   ATBD — PREMIUM AI CHAT APPLICATION
   Frontend Controller
   ============================================================ */

"use strict";


/* ============================================================
   CONFIGURATION
   ============================================================ */

const API_BASE = "";

const CHAT_ENDPOINT = "/api/chat";

const HEALTH_ENDPOINT = "/api/health";


/* ============================================================
   APPLICATION STATE
   ============================================================ */

const state = {

    sessionId: null,

    isLoading: false,

    lastResponse: null,

    messages: [],

    riskHistory: [],

    totalTokens: 0,

    requestCount: 0

};


/* ============================================================
   DOM ELEMENTS
   ============================================================ */

const elements = {

    welcomeSection:
        document.getElementById("welcome-section"),

    conversation:
        document.getElementById("conversation"),

    promptInput:
        document.getElementById("prompt-input"),

    sendButton:
        document.getElementById("send-button"),

    newChatButton:
        document.getElementById("new-chat-btn"),

    characterCount:
        document.getElementById("character-count"),

    sessionValue:
        document.getElementById("session-value"),

    riskValue:
        document.getElementById("risk-value"),

    actionValue:
        document.getElementById("action-value"),

    tokenValue:
        document.getElementById("token-value"),

    securityDetailsButton:
        document.getElementById("security-details-btn"),

    securityPanel:
        document.getElementById("security-panel"),

    panelClose:
        document.getElementById("panel-close"),

    panelRiskNumber:
        document.getElementById("panel-risk-number"),

    panelAction:
        document.getElementById("panel-action"),

    riskFill:
        document.getElementById("risk-fill"),

    telemetryTokenRate:
        document.getElementById("telemetry-token-rate"),

    telemetryRequestFrequency:
        document.getElementById("telemetry-request-frequency"),

    telemetrySimilarity:
        document.getElementById("telemetry-similarity"),

    telemetrySession:
        document.getElementById("telemetry-session"),

    telemetryOutput:
        document.getElementById("telemetry-output"),

    telemetryDelay:
        document.getElementById("telemetry-delay"),

    riskExplanation:
        document.getElementById("risk-explanation"),

    loadingOverlay:
        document.getElementById("loading-overlay"),

    toast:
        document.getElementById("toast"),

    toastMessage:
        document.getElementById("toast-message")

};


/* ============================================================
   INITIALIZATION
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    initialize();

});


async function initialize() {

    setupEventListeners();

    updateCharacterCount();

    updateSessionDisplay();

    resetSecurityTelemetry();

    await checkBackendHealth();

}


/* ============================================================
   EVENT LISTENERS
   ============================================================ */

function setupEventListeners() {


    /* Send button */

    elements.sendButton.addEventListener(
        "click",
        handleSend
    );


    /* Enter key */

    elements.promptInput.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                handleSend();

            }

        }
    );


    /* Character counter */

    elements.promptInput.addEventListener(
        "input",
        () => {

            updateCharacterCount();

            autoResizeTextarea();

        }
    );


    /* New conversation */

    elements.newChatButton.addEventListener(
        "click",
        startNewConversation
    );


    /* Security panel */

    elements.securityDetailsButton.addEventListener(
        "click",
        openSecurityPanel
    );


    elements.panelClose.addEventListener(
        "click",
        closeSecurityPanel
    );


    /* Quick prompt cards */

    document
        .querySelectorAll(".prompt-card")
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    const prompt =
                        button.dataset.prompt;

                    elements.promptInput.value =
                        prompt;

                    updateCharacterCount();

                    autoResizeTextarea();

                    elements.promptInput.focus();

                }
            );

        });


    /* Escape closes security panel */

    document.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Escape") {

                closeSecurityPanel();

            }

        }
    );

}


/* ============================================================
   BACKEND HEALTH
   ============================================================ */

async function checkBackendHealth() {

    try {

        const response = await fetch(
            `${API_BASE}${HEALTH_ENDPOINT}`
        );


        if (!response.ok) {

            throw new Error(
                "Backend health check failed"
            );

        }


        const data =
            await response.json();


        console.log(
            "ATBD backend:",
            data
        );


    } catch (error) {

        console.warn(
            "Backend health check unavailable:",
            error
        );

        showToast(
            "Backend connection could not be verified."
        );

    }

}


/* ============================================================
   SEND MESSAGE
   ============================================================ */

async function handleSend() {

    if (state.isLoading) {
        return;
    }


    const prompt =
        elements.promptInput.value.trim();


    if (!prompt) {

        elements.promptInput.focus();

        return;

    }


    await sendMessage(prompt);

}


async function sendMessage(prompt) {

    state.isLoading = true;


    setLoadingState(true);


    /* Remove welcome screen */

    elements.welcomeSection.style.display =
        "none";


    elements.conversation.classList.add(
        "active"
    );


    /* Add user message */

    addMessage(
        "user",
        prompt
    );


    /* Clear input */

    elements.promptInput.value = "";

    updateCharacterCount();

    resetTextarea();


    try {

        const payload = {

            prompt: prompt,

            max_tokens: 256,

            temperature: 0.7

        };


        /*
         * Reuse the same session.
         *
         * The backend creates a session automatically
         * when session_id is not supplied.
         */

        if (state.sessionId) {

            payload.session_id =
                state.sessionId;

        }


        const startTime =
            performance.now();


        const response =
            await fetch(
                `${API_BASE}${CHAT_ENDPOINT}`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"
                    },

                    body:
                        JSON.stringify(payload)
                }
            );


        const elapsed =
            performance.now() - startTime;


        let data = null;


        try {

            data =
                await response.json();

        } catch {

            throw new Error(
                "Invalid response received from server."
            );

        }


        if (!response.ok) {

            const message =
                data?.detail ||
                "The request could not be completed.";

            throw new Error(message);

        }


        console.log(
            "ATBD response:",
            data
        );


        /* Save session */

        state.sessionId =
            data.session_id;


        state.lastResponse =
            data;


        state.requestCount += 1;


        state.totalTokens +=
            Number(data.total_tokens || 0);


        /* Save risk history */

        state.riskHistory.push({

            risk:
                Number(data.risk_score || 0),

            action:
                data.action || "ALLOW",

            latency:
                Number(
                    data.latency_ms ||
                    elapsed
                ),

            tokens:
                Number(data.total_tokens || 0),

            timestamp:
                Date.now()

        });


        /* Save message */

        state.messages.push({

            role: "user",

            content: prompt

        });


        state.messages.push({

            role: "assistant",

            content:
                data.response || ""

        });


        /* Add assistant message */

        addAssistantMessage(data);


        /* Update security interface */

        updateSecurityTelemetry(data);


        /* Update session */

        updateSessionDisplay();


        /* Show warning if required */

        if (data.warning) {

            showToast(
                data.warning
            );

        }


    } catch (error) {

        console.error(
            "Chat error:",
            error
        );


        addErrorMessage(
            error.message
        );


        showToast(
            "Unable to complete the request."
        );


    } finally {

        state.isLoading = false;

        setLoadingState(false);

    }

}


/* ============================================================
   ADD USER MESSAGE
   ============================================================ */

function addMessage(role, text) {

    const wrapper =
        document.createElement("div");


    wrapper.className =
        `message ${role}`;


    const content =
        document.createElement("div");


    content.className =
        "message-content";


    const roleLabel =
        document.createElement("div");


    roleLabel.className =
        "message-role";


    roleLabel.textContent =
        role === "user"
            ? "YOU"
            : "ATBD";


    const messageText =
        document.createElement("div");


    messageText.className =
        "message-text";


    messageText.textContent =
        text;


    content.appendChild(
        roleLabel
    );


    content.appendChild(
        messageText
    );


    wrapper.appendChild(
        content
    );


    elements.conversation.appendChild(
        wrapper
    );


    scrollConversationToBottom();

}


/* ============================================================
   ADD ASSISTANT MESSAGE
   ============================================================ */

function addAssistantMessage(data) {

    const wrapper =
        document.createElement("div");


    wrapper.className =
        "message assistant";


    const content =
        document.createElement("div");


    content.className =
        "message-content";


    const roleLabel =
        document.createElement("div");


    roleLabel.className =
        "message-role";


    roleLabel.textContent =
        "ATBD · LLAMA 3.2";


    const messageText =
        document.createElement("div");


    messageText.className =
        "message-text";


    /*
     * textContent is intentionally used instead of
     * innerHTML so model output cannot inject HTML.
     */

    messageText.textContent =
        data.response || "";


    const meta =
        document.createElement("div");


    meta.className =
        "message-meta";


    const protection =
        document.createElement("span");


    protection.className =
        "protected";


    protection.textContent =
        "● Protected";


    const separator =
        document.createElement("span");


    separator.textContent =
        "·";


    const tokens =
        document.createElement("span");


    tokens.textContent =
        `${data.total_tokens || 0} tokens`;


    const separator2 =
        document.createElement("span");


    separator2.textContent =
        "·";


    const latency =
        document.createElement("span");


    latency.textContent =
        formatLatency(
            data.latency_ms
        );


    meta.appendChild(
        protection
    );


    meta.appendChild(
        separator
    );


    meta.appendChild(
        tokens
    );


    meta.appendChild(
        separator2
    );


    meta.appendChild(
        latency
    );


    content.appendChild(
        roleLabel
    );


    content.appendChild(
        messageText
    );


    content.appendChild(
        meta
    );


    wrapper.appendChild(
        content
    );


    elements.conversation.appendChild(
        wrapper
    );


    scrollConversationToBottom();

}


/* ============================================================
   ERROR MESSAGE
   ============================================================ */

function addErrorMessage(message) {

    const wrapper =
        document.createElement("div");


    wrapper.className =
        "message assistant";


    const content =
        document.createElement("div");


    content.className =
        "message-content";


    const roleLabel =
        document.createElement("div");


    roleLabel.className =
        "message-role";


    roleLabel.textContent =
        "SYSTEM";


    const messageText =
        document.createElement("div");


    messageText.className =
        "message-text";


    messageText.textContent =
        message ||
        "Something went wrong.";


    content.appendChild(
        roleLabel
    );


    content.appendChild(
        messageText
    );


    wrapper.appendChild(
        content
    );


    elements.conversation.appendChild(
        wrapper
    );


    scrollConversationToBottom();

}


/* ============================================================
   SECURITY TELEMETRY
   ============================================================ */

function updateSecurityTelemetry(data) {

    const risk =
        clamp(
            Number(data.risk_score || 0),
            0,
            100
        );


    const action =
        String(
            data.action || "ALLOW"
        ).toUpperCase();


    const features =
        data.features || {};


    /* Bottom bar */

    elements.riskValue.textContent =
        risk.toFixed(1);


    elements.actionValue.textContent =
        action;


    elements.tokenValue.textContent =
        formatNumber(
            data.total_tokens || 0
        );


    /* Action colour */

    setActionClass(
        elements.actionValue,
        action
    );


    /* Panel */

    elements.panelRiskNumber.textContent =
        risk.toFixed(1);


    elements.panelAction.textContent =
        action;


    setActionClass(
        elements.panelAction,
        action
    );


    /* Risk bar */

    elements.riskFill.style.width =
        `${risk}%`;


    setRiskColor(
        elements.riskFill,
        risk
    );


    /* Telemetry */

    elements.telemetryTokenRate.textContent =
        formatDecimal(
            features.token_rate
        );


    elements.telemetryRequestFrequency.textContent =
        formatDecimal(
            features.request_frequency
        );


    elements.telemetrySimilarity.textContent =
        formatDecimal(
            features.prompt_similarity
        );


    elements.telemetrySession.textContent =
        formatDecimal(
            features.session_duration
        );


    elements.telemetryOutput.textContent =
        formatDecimal(
            features.output_size
        );


    elements.telemetryDelay.textContent =
        formatDecimal(
            data.applied_delay
        );


    /* Explanation */

    elements.riskExplanation.textContent =
        data.explanation ||
        "Behavioral analysis completed.";


    /* Session */

    updateSessionDisplay();


    /* Body state */

    updateRiskTheme(
        risk,
        action
    );

}


/* ============================================================
   RESET TELEMETRY
   ============================================================ */

function resetSecurityTelemetry() {

    elements.riskValue.textContent =
        "0.0";


    elements.actionValue.textContent =
        "ALLOW";


    elements.tokenValue.textContent =
        "0";


    elements.panelRiskNumber.textContent =
        "0.0";


    elements.panelAction.textContent =
        "ALLOW";


    elements.telemetryTokenRate.textContent =
        "0";


    elements.telemetryRequestFrequency.textContent =
        "0";


    elements.telemetrySimilarity.textContent =
        "0";


    elements.telemetrySession.textContent =
        "0";


    elements.telemetryOutput.textContent =
        "0";


    elements.telemetryDelay.textContent =
        "0";


    elements.riskExplanation.textContent =
        "No interaction has been analyzed yet.";


    elements.riskFill.style.width =
        "0%";


    setActionClass(
        elements.actionValue,
        "ALLOW"
    );


    setActionClass(
        elements.panelAction,
        "ALLOW"
    );


    updateRiskTheme(
        0,
        "ALLOW"
    );

}


/* ============================================================
   RISK THEME
   ============================================================ */

function updateRiskTheme(risk, action) {

    document.body.dataset.risk =
        action.toLowerCase();


    const ring =
        document.querySelector(
            ".status-ring"
        );


    if (!ring) {
        return;
    }


    ring.style.borderColor =
        getActionBorderColor(action);


    const inner =
        ring.querySelector("span");


    if (inner) {

        inner.style.background =
            getActionColor(action);

        inner.style.boxShadow =
            `0 0 12px ${getActionColor(action)}`;

    }

}


/* ============================================================
   ACTION HELPERS
   ============================================================ */

function setActionClass(element, action) {

    if (!element) {
        return;
    }


    element.classList.remove(
        "action-allow",
        "action-delay",
        "action-throttle",
        "action-block"
    );


    const className =
        `action-${action.toLowerCase()}`;


    element.classList.add(
        className
    );

}


function setRiskColor(element, risk) {

    if (!element) {
        return;
    }


    let color =
        getActionColor(
            riskToAction(risk)
        );


    element.style.background =
        color;

    element.style.color =
        color;

}


function riskToAction(risk) {

    if (risk < 30) {
        return "ALLOW";
    }


    if (risk < 60) {
        return "DELAY";
    }


    if (risk < 80) {
        return "THROTTLE";
    }


    return "BLOCK";

}


function getActionColor(action) {

    switch (
        String(action).toUpperCase()
    ) {

        case "DELAY":
            return "#f0c96b";

        case "THROTTLE":
            return "#f49b58";

        case "BLOCK":
            return "#ff6b6b";

        default:
            return "#6ee7a0";

    }

}


function getActionBorderColor(action) {

    switch (
        String(action).toUpperCase()
    ) {

        case "DELAY":
            return "rgba(240, 201, 107, 0.35)";

        case "THROTTLE":
            return "rgba(244, 155, 88, 0.35)";

        case "BLOCK":
            return "rgba(255, 107, 107, 0.35)";

        default:
            return "rgba(110, 231, 160, 0.25)";

    }

}


/* ============================================================
   LOADING STATE
   ============================================================ */

function setLoadingState(isLoading) {

    if (isLoading) {

        elements.loadingOverlay.classList.add(
            "active"
        );


        elements.sendButton.disabled =
            true;


        elements.sendButton.querySelector(
            ".send-label"
        ).textContent =
            "ANALYZING";


    } else {

        elements.loadingOverlay.classList.remove(
            "active"
        );


        elements.sendButton.disabled =
            false;


        elements.sendButton.querySelector(
            ".send-label"
        ).textContent =
            "SEND";

    }

}


/* ============================================================
   SECURITY PANEL
   ============================================================ */

function openSecurityPanel() {

    elements.securityPanel.classList.add(
        "open"
    );

}


function closeSecurityPanel() {

    elements.securityPanel.classList.remove(
        "open"
    );

}


/* ============================================================
   NEW CONVERSATION
   ============================================================ */

function startNewConversation() {

    state.sessionId = null;

    state.messages = [];

    state.riskHistory = [];

    state.totalTokens = 0;

    state.requestCount = 0;

    state.lastResponse = null;


    elements.conversation.innerHTML =
        "";


    elements.conversation.classList.remove(
        "active"
    );


    elements.welcomeSection.style.display =
        "";


    elements.promptInput.value =
        "";


    resetTextarea();

    updateCharacterCount();

    updateSessionDisplay();

    resetSecurityTelemetry();

    closeSecurityPanel();


    showToast(
        "New secure session created."
    );


    elements.promptInput.focus();

}


/* ============================================================
   SESSION DISPLAY
   ============================================================ */

function updateSessionDisplay() {

    if (!state.sessionId) {

        elements.sessionValue.textContent =
            "NEW";

        return;

    }


    elements.sessionValue.textContent =
        state.sessionId
            .slice(0, 8)
            .toUpperCase();

}


/* ============================================================
   CHARACTER COUNTER
   ============================================================ */

function updateCharacterCount() {

    const length =
        elements.promptInput.value.length;


    elements.characterCount.textContent =
        `${length} / 8000`;

}


/* ============================================================
   TEXTAREA RESIZE
   ============================================================ */

function autoResizeTextarea() {

    const textarea =
        elements.promptInput;


    textarea.style.height =
        "auto";


    const newHeight =
        Math.min(
            textarea.scrollHeight,
            180
        );


    textarea.style.height =
        `${newHeight}px`;

}


function resetTextarea() {

    elements.promptInput.style.height =
        "auto";

}


/* ============================================================
   SCROLL
   ============================================================ */

function scrollConversationToBottom() {

    requestAnimationFrame(() => {

        elements.conversation.scrollTo({

            top:
                elements.conversation.scrollHeight,

            behavior:
                "smooth"

        });

    });

}


/* ============================================================
   TOAST
   ============================================================ */

let toastTimer = null;


function showToast(message) {

    elements.toastMessage.textContent =
        message;


    elements.toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(() => {

            elements.toast.classList.remove(
                "show"
            );

        }, 3000);

}


/* ============================================================
   FORMATTING
   ============================================================ */

function formatNumber(value) {

    const number =
        Number(value || 0);


    return number.toLocaleString(
        "en-US"
    );

}


function formatDecimal(value) {

    const number =
        Number(value || 0);


    if (!Number.isFinite(number)) {
        return "0";
    }


    return number >= 100
        ? number.toFixed(0)
        : number.toFixed(2);

}


function formatLatency(value) {

    const latency =
        Number(value || 0);


    if (!Number.isFinite(latency)) {
        return "—";
    }


    if (latency < 1000) {

        return `${Math.round(latency)} ms`;

    }


    return `${(latency / 1000).toFixed(1)} s`;

}


/* ============================================================
   CLAMP
   ============================================================ */

function clamp(value, min, max) {

    return Math.min(
        Math.max(
            value,
            min
        ),
        max
    );

}


/* ============================================================
   GLOBAL ERROR HANDLING
   ============================================================ */

window.addEventListener(
    "unhandledrejection",
    (event) => {

        console.error(
            "Unhandled promise rejection:",
            event.reason
        );

    }
);


/* ============================================================
   DEBUG ACCESS
   ============================================================ */

window.ATBD = {

    state,

    sendMessage,

    startNewConversation,

    openSecurityPanel,

    closeSecurityPanel

};


console.log(
    "%c ATBD ",
    "background:#d8c08a;color:#080808;padding:4px 8px;border-radius:4px;font-weight:bold;"
);

console.log(
    "Adaptive Token-Level Behavioral Defense frontend initialized."
);